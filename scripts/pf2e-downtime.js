import { PF2EDowntimeApi } from "./api/public.js";
import { ProjectHandler } from "./project/ProjectHandler.js";
import { AwardHandler } from "./award/AwardHandler.js";
import { SpendHandler } from "./award/SpendHandler.js";
import { pf2eDowntimeHelpers } from "./handlebars-helpers.js";

export const MODULE = "pf2e-downtime";

Hooks.on(`init`, () => {
    // Register Settings
    game.settings.register(MODULE, "downtimeUnit", {
        name: "Downtime Unit",
        hint: "Define a unit for measure for downtime spent and given. Should be the singular form of the word, ex: hour, day, week, month, etc.",
        scope: "world",
        config: true,
        default: "day",
        type: String,
    });

    // Register Helpers
    Handlebars.registerHelper(pf2eDowntimeHelpers);

    // Provide the public api
    game.modules.get(MODULE).api = PF2EDowntimeApi
});

// Add Tab to Actor Sheets
Hooks.on(`renderActorSheet`, (app, html, data) => {    
   addTabToActorSheet(app, html, data).then(function(){
        if (app.activateDowntimeTab) {
            app._tabs[0].activate("pf2e-downtime");
        }
    });
});

// Add Button to Party Sheets
Hooks.on(`getPartySheetPF2eHeaderButtons`, (app, data) => {    
    addButtonToPartySheetHeader(app, data);
});

async function addTabToActorSheet(app, html, data) {
    if(data.actor.type==="character"){
        // Add the tab
        let nav = html.find('.sheet-navigation[data-group="primary"]');
        let manageTabsBtn = nav.find('.manage-tabs');
        let downtimeTabBtn = $(`<a class="item" data-tab="pf2e-downtime" data-tooltip="Downtime" role="tab" aria-label="Downtime"><i class='fas fa-house'></i></a>`);
        manageTabsBtn.before(downtimeTabBtn);

        const unit = game.settings.get(MODULE, 'downtimeUnit').toLowerCase().charAt(0).toUpperCase() 
                   + game.settings.get(MODULE, 'downtimeUnit').toLowerCase().slice(1);

        // Add content to tab
        let tabData = {
            actor: data.actor,
            unit: unit,
            user: data.user
        };
        let newSheetTab = html.find('.sheet-content');
        let downtimeTabHtml = $(await renderTemplate('modules/pf2e-downtime/templates/downtime-tab.hbs', tabData));
        newSheetTab.append(downtimeTabHtml);

        // Make the buttons all do things
       activateDowntimeTabListeners(data.actor, html);

        // Set Downtime Tab as Active
        html.find('.sheet-navigation .item[data-tab="pf2e-downtime"]').click(ev => {
            app.activateDowntimeTab = true;
        });

        // Unset Training Tab as Active
        html.find('.sheet-navigation .item:not(.sheet-navigation .item[data-tab="pf2e-downtime"])').click(ev => {
            app.activateDowntimeTab = false;
        }); 
    }
}

function activateDowntimeTabListeners(actorData, html){
    html.find('.pf2e-downtime-award-downtime').click(async (ev) => {
        const actor = game.actors.get(actorData._id);
        AwardHandler.awardDowntimeToActor(actor);
    });

    html.find('.pf2e-downtime-spend-downtime').click(async (ev) => {
        const actor = game.actors.get(actorData._id);
        SpendHandler.spendDowntime(actor);
    });

    html.find('.pf2e-downtime-add-project').click(async (ev) => {
        const actor = game.actors.get(actorData._id);
        const project = await ProjectHandler.createProjectForActor(actor);
        ProjectHandler.openProject(project, actor);
    });

    html.find('.pf2e-downtime-edit-project').click(ev => {
        const actor = game.actors.get(actorData._id);
        const projectId = ev.currentTarget.getAttribute('data-pf2e-downtime-project-id');
        const project = ProjectHandler.getProjectForActor(projectId, actor);
        ProjectHandler.openProject(project, actor);
    });

    html.find('.pf2e-downtime-delete-project').click(async (ev) => {
        const actor = game.actors.get(actorData._id);
        const projectId = ev.currentTarget.getAttribute('data-pf2e-downtime-project-id');
        const project = ProjectHandler.getProjectForActor(projectId, actor);
        const confirmed = await foundry.applications.api.DialogV2.confirm({ 
            classes: ["pf2e-downtime"],
            window: {
                title: "Confirm Project Deletion"
            },
            position: {
                width: 420
            }, 
            content:`Are you sure you want to delete ${project.name}? This action cannot be undone.` 
        });
        if(confirmed){
            ProjectHandler.deleteProjectForActor(projectId, actor);
        } else {
            ui.notifications.warn(`Project deletion aborted.`);
        }
    });

    html.find('.pf2e-downtime-restart-project').click(async (ev) => {
        const actor = game.actors.get(actorData._id);
        const projectId = ev.currentTarget.getAttribute('data-pf2e-downtime-project-id');
        const project = ProjectHandler.getProjectForActor(projectId, actor);
        const confirmed = await foundry.applications.api.DialogV2.confirm({ 
            classes: ["pf2e-downtime"],
            window: {
                title: "Confirm Project Restart"
            },
            position: {
                width: 420
            },
            content:`Restarting a project will reset its progress to zero, but leave all other data intact. Are you sure you want to restart ${project.name}? This action cannot be undone.` 
        });
        if(confirmed){
            ProjectHandler.restartProjectForActor(projectId, actor);
        } else {
            ui.notifications.warn("Project reset cancelled.");
        }
    });
}

async function addButtonToPartySheetHeader(app, data) {
    if(!game.user.isGM) return;
    const button = {
        label: 'Award Downtime',
        class: 'pf2e-downtime',
        icon: 'fas fa-house',
        onclick: callback
    }
    data.unshift(button);

    function callback(){
        AwardHandler.awardDowntimeToParty(app.actor._id);
    }
}