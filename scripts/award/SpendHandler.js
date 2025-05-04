import { MODULE } from "../pf2e-downtime.js";
import { ProjectHandler } from "../project/ProjectHandler.js";

export class SpendHandler {
    
    static async spendDowntime(actor){

        const UNIT = game.settings.get(MODULE, 'downtimeUnit').toLowerCase();
        const UNIT_CAP = UNIT.charAt(0).toUpperCase() + UNIT.slice(1);
        
        const {DialogV2} = foundry.applications.api;
        const fields = foundry.data.fields;

        const projects = actor.getFlag(MODULE,"projects") || [];
        const sharedProjects = ProjectHandler.getSharedProjectsForActor(actor) || [];
        const combined = projects.concat(sharedProjects);
        const unfinished = combined.filter(p => p.progress.current < p.progress.max) || [];
        const choices = unfinished.reduce((choices, project) => Object.assign(choices, {[project.id]: `${project.name} (${project.progress.current} / ${project.progress.max})`}), {});
        const maxDays = actor.getFlag(MODULE, "downtimeDays");
               
        const daysField = new fields.NumberField({
            required: true, 
            integer: true, 
            nullable: false,
            initial: 0,
            min: 0,
            max: maxDays,
            label: `${UNIT_CAP}s Spent`
        });

        const projectSelect = new fields.StringField({
            blank: true, 
            required: true, 
            choices,
            label: "Project"
        });

        const progressField = new fields.NumberField({
            required: true, 
            integer: true, 
            nullable: false,
            initial: 0,
            label: "Progress Gained"
        });

        const template = `
            {{formGroup daysField name="days"}}
            {{formGroup projectSelect name="project"}}
            {{formGroup progressField name="progress"}}
        `;
        
        const content = `<p>${UNIT_CAP}s Spent will automatically be subtracted from your current total. If you choose a project, its progress value will automatically increase by Progress Gained.</p>`
                         + Handlebars.compile(template)({ daysField, projectSelect, progressField });
        
        const response = await DialogV2.confirm({
            classes: ["pf2e-downtime"],
            window: {
                title: `Spend Downtime - ${actor.name}`,
                icon: "fa-solid fa-rotate",
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
                label: "Spend Downtime",
                icon: "fa-solid fa-check",
                callback: (_event, button, _dialog) => new FormDataExtended(button.form).object,
            },
            rejectClose: false
        })

        if (!response) return;
        
        const oldDowntimeDaysValue = actor.getFlag(MODULE,"downtimeDays");
        const newDowntimeDaysValue = oldDowntimeDaysValue - response.days;
        await actor.setFlag(MODULE, "downtimeDays", newDowntimeDaysValue);

        if(!response.project){
            if(game.settings.get(MODULE, 'sendUseToChat')){
                let chatHtml = await renderTemplate('modules/pf2e-downtime/templates/downtime-use-card.hbs', {
                    actorName: actor.name,
                    daysSpent: response.days,
                    project: null,
                    downtimeUnit: UNIT,
                    daysRemaining: newDowntimeDaysValue
                });
                let msgData = {
                    speaker: getDocumentClass("ChatMessage").getSpeaker({ actor: actor }),
                    content: chatHtml
                };
                await ChatMessage.create(msgData);
            }
            return;
        }

        const selectedProject = combined.filter(p => p.id === response.project)[0];
        const projectOwner = game.actors.get(selectedProject.projectOwner);

        const userCanUpdate = projectOwner.isOwner;

        let allProjects = ProjectHandler.getAllProjectsForActor(projectOwner);
        let project = ProjectHandler.getProjectForActor(response.project, projectOwner);
        const oldProgressValue = project.progress.current + 0;
        const newProgressValue = Math.min(project.progress.current + response.progress, project.progress.max);
        project.progress.current = newProgressValue;
        
        if(userCanUpdate){
            await projectOwner.setFlag(MODULE, "projects", allProjects);
        } else {
            //TODO: Make the GM handle it with sockets
            ui.notifications.error("You don't have permission to update the actor that owns the selected project. Ask the GM or other owner to update its progress manually.", {permanent: true});
        }
        
        if(game.settings.get(MODULE, 'sendUseToChat')){
            let chatHtml = await renderTemplate('modules/pf2e-downtime/templates/downtime-use-card.hbs', {
                actorName: actor.name,
                daysSpent: response.days,
                downtimeUnit: UNIT,
                project: {
                    name: project.name,
                    oldProgress: oldProgressValue,
                    newProgress: newProgressValue,
                    progressLabel: project.progress.label
                },                
                daysRemaining: newDowntimeDaysValue
            });
            let msgData = {
                speaker: getDocumentClass("ChatMessage").getSpeaker({ actor: actor }),
                content: chatHtml
            };
            await ChatMessage.create(msgData);
        }
    }
}