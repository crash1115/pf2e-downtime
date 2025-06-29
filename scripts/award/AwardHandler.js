import { MODULE } from "../pf2e-downtime.js";

export class AwardHandler {
    
    static async awardDowntimeToParty(partyId = undefined){
        if(!game.user.isGM){
            ui.notifications.error("You must be a GM to award downtime.")
            return;
        }

        const UNIT = game.settings.get(MODULE, 'downtimeUnit').toLowerCase();
        const UNIT_CAP = UNIT.charAt(0).toUpperCase() + UNIT.slice(1);

        const {DialogV2} = foundry.applications.api;
        const fields = foundry.data.fields;
        const parties = game.actors.filter(p => p.type === "party");
        const choices = parties.reduce((choices, actor) => Object.assign(choices, {[actor.id]: actor.name}), {});
        const initalSelection = partyId ? partyId : game.actors.party._id;
       
        const partySelect = new fields.StringField({
            blank: false, 
            required: true, 
            choices: choices,
            initial: initalSelection,
            label: "Party"
        });
        
        const daysField = new fields.NumberField({
            required: true, 
            integer: true, 
            nullable: false,
            initial: 0,
            label: `Downtime ${UNIT_CAP}(s)`
        });

        const template = `
            {{formGroup partySelect name="party"}}
            {{formGroup daysField name="days"}}
        `;
        
        const content = `<p>Every Player Character in the selected party will recieve a number of downtime ${UNIT}(s) equal to the value given.</p>`
                         + Handlebars.compile(template)({ partySelect, daysField });
        
        const response = await DialogV2.confirm({
            classes: ["pf2e-downtime-award"],
            window: {
                title: "Award Downtime - Party",
                icon: "fa-solid fa-house",
            },
            position: {
                width: 420
            },
            content,
            no: {
                label: "Cancel",
                icon: "fa-solid fa-times",
            },
            yes: {
                label: "Award Downtime",
                icon: "fa-solid fa-check",
                callback: (_event, button, _dialog) => new FormDataExtended(button.form).object,
            },
            rejectClose: false
        })

        if (!response) return;
        
        const party = game.actors.get(response.party);
        const partyActors = party.members;
        const PCs = partyActors.filter(p => p.type === "character" );

        for(var i=0; i<PCs.length; i++){
            const actor = PCs[i];
            const downtimeDays = actor.getFlag(MODULE,"downtimeDays") || 0;
            const newDays = Math.max(0, downtimeDays + response.days);
            await actor.setFlag(MODULE,"downtimeDays", newDays);

            const msg = `Awarded ${response.days} downtime ${UNIT}(s) to ${actor.name}. They now have ${newDays}.`;
            ui.notifications.notify(msg);
        }

        await this.sendAwardToChat(party, response, UNIT);
    }

    static async awardDowntimeToActor(actor){
        if(!game.user.isGM){
            ui.notifications.error("You must be a GM to award downtime.")
            return;
        }

        const UNIT = game.settings.get(MODULE, 'downtimeUnit').toLowerCase();
        const UNIT_CAP = UNIT.charAt(0).toUpperCase() + UNIT.slice(1);

        const {DialogV2} = foundry.applications.api;
        const fields = foundry.data.fields;
         
        const daysField = new fields.NumberField({
            required: true, 
            integer: true, 
            nullable: false,
            initial: 0,
            label: `Downtime ${UNIT_CAP}(s)`
        });

        const template = `
            {{formGroup daysField name="days"}}
        `;
        
        const content = `<p>${actor.name} will recieve a number of downtime ${UNIT}s equal to the value given.</p>`
                         + Handlebars.compile(template)({ daysField });
        
        const response = await DialogV2.confirm({
            classes: ["pf2e-downtime-award"],
            window: {
                title: `Award Downtime - ${actor.name}`,
                icon: "fa-solid fa-house",
            },
            position: {
                width: 420
            },
            content,
            no: {
                label: "Cancel",
                icon: "fa-solid fa-times",
            },
            yes: {
                label: "Award Downtime",
                icon: "fa-solid fa-check",
                callback: (_event, button, _dialog) => new FormDataExtended(button.form).object,
            },
            rejectClose: false
        })

        if (!response) return;
        
        const downtimeDays = actor.getFlag(MODULE,"downtimeDays") || 0;
        const newDays = Math.max(0, downtimeDays + response.days);
        await actor.setFlag(MODULE,"downtimeDays", newDays);

        const msg = `Awarded ${response.days} downtime ${UNIT}(s) to ${actor.name}. They now have ${newDays}.`;
        ui.notifications.notify(msg);

        await this.sendAwardToChat(actor, response, UNIT);
    
    }

    static async sendAwardToChat(actor, response, unit){
        if(game.settings.get(MODULE, 'sendAwardToChat')){
            let chatHtml = await foundry.applications.handlebars.renderTemplate('modules/pf2e-downtime/templates/downtime-award-card.hbs', {
                actorName: actor.name,
                daysAwarded: response.days,
                downtimeUnit: unit
            });
            let msgData = {
                content: chatHtml
            };
            await ChatMessage.create(msgData);
        }
    }
}