import { PF2EDowntimeApi } from "./api/public.js";
import { ProjectHandler } from "./project/ProjectHandler.js";
import { AwardHandler } from "./award/AwardHandler.js";
import { SpendHandler } from "./award/SpendHandler.js";
import { pf2eDowntimeHelpers } from "./handlebars-helpers.js";
import { registerSettings } from "./settings.js"

export const MODULE = "pf2e-downtime";

Hooks.on(`init`, () => {
    // Register Settings
    registerSettings();

    // Register Helpers
    Handlebars.registerHelper(pf2eDowntimeHelpers);

    // Provide the public api
    game.modules.get(MODULE).api = PF2EDowntimeApi;
});

// Add Tab to Actor Sheets
Hooks.on(`renderCharacterSheetPF2e`, (app, html, data) => {    
   addTabToPcSheet(app, html, data).then(function(){
        if (app.activateDowntimeTab) {
            app._tabs[0].activate("pf2e-downtime");
            const panelTitleSpan = html.find('.panel-title');
            panelTitleSpan.text("Downtime");
        }
    });
});

// Add Tab to Party Sheets
Hooks.on(`renderPartySheetPF2e`, (app, html, data) => {    
    addTabToPartySheet(app, html, data).then(function(){
        if (app.activateDowntimeTab) {
            app._tabs[0].activate("pf2e-downtime");
        }
    });
});

async function addTabToPcSheet(app, html, data) {
    if(data.actor.type==="character"){
        // Add the tab
        let nav = html.find('.sheet-navigation[data-group="primary"]');
        let manageTabsBtn = nav.find('.manage-tabs');
        let downtimeTabBtn = $(`<a class="item" data-tab="pf2e-downtime" data-tooltip="Downtime" role="tab" aria-label="Downtime"><i class='fas fa-house'></i></a>`);
        manageTabsBtn.before(downtimeTabBtn);

        // Make sure we have the data we need to populate the tab
        const unit = game.settings.get(MODULE, 'downtimeUnit').toLowerCase().charAt(0).toUpperCase() 
                   + game.settings.get(MODULE, 'downtimeUnit').toLowerCase().slice(1);

        const actor = game.actors.get(data.actor._id);
        let downtimeDaysOnActor = actor.getFlag(MODULE, 'downtimeDays');
        if(!downtimeDaysOnActor){
            downtimeDaysOnActor = 0;
            if(actor.testUserPermission(game.user, "OWNER")){
                await actor.setFlag(MODULE, 'downtimeDays', 0);
            } 
        }
        
        let projectsOnActor = actor.getFlag(MODULE, 'projects');
        if(!projectsOnActor){
            projectsOnActor = [];
            if(actor.testUserPermission(game.user, "OWNER")){
                await actor.setFlag(MODULE, 'projects', []);
            }
        }

        // Format the project data so it's in the structure we want
        const projectData = ProjectHandler.formatProjectsForSheet(projectsOnActor);

        // Add content to tab
        let tabData = {
            actor: actor,
            unit: unit,
            user: data.user,
            projectData: projectData,
            daysAvailable: downtimeDaysOnActor,
            showDefaultHeader: projectsOnActor.length <= 0
        };
        let newSheetTab = html.find('.sheet-content');
        let downtimeTabHtml = $(await renderTemplate('modules/pf2e-downtime/templates/downtime-tab-pc.hbs', tabData));
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

async function addTabToPartySheet(app, html, data) {
    if(data.actor.type==="party"){
        // Add the tab
        let nav = html.find('nav.sub-nav');
        let downtimeTabBtn = $(`<a data-tab="pf2e-downtime" aria-label="Downtime">Downtime</a>`);
        nav.append(downtimeTabBtn);

        // Make sure we have the data we need to populate the tab
        const unit = game.settings.get(MODULE, 'downtimeUnit').toLowerCase().charAt(0).toUpperCase() 
                   + game.settings.get(MODULE, 'downtimeUnit').toLowerCase().slice(1);

        const actor = game.actors.get(data.actor._id);
        
        let projectsOnActor = actor.getFlag(MODULE, 'projects');
        if(!projectsOnActor){
            projectsOnActor = [];
            if(actor.testUserPermission(game.user, "OWNER")){
                await actor.setFlag(MODULE, 'projects', []);
            }
        }

        // Format the project data so it's in the structure we want
        const projectData = ProjectHandler.formatProjectsForSheet(projectsOnActor);

        // Add content to tab
        let tabData = {
            actor: actor,
            unit: unit,
            user: data.user,
            projectData: projectData,
            showDefaultHeader: projectsOnActor.length <= 0
        };
        let newSheetTab = html.find('section.container');
        let downtimeTabHtml = $(await renderTemplate('modules/pf2e-downtime/templates/downtime-tab-party.hbs', tabData));
        newSheetTab.append(downtimeTabHtml);

        // Make the buttons all do things
        activateDowntimeTabListeners(data.actor,html);

        // Set Downtime Tab as Active
        html.find('nav.sub-nav a[data-tab="pf2e-downtime"]').click(ev => {
            app.activateDowntimeTab = true;
        });

        // Unset Training Tab as Active
        html.find('nav.sub-nav a:not(nav.sub-nav a[data-tab="pf2e-downtime"])').click(ev => {
            app.activateDowntimeTab = false;
        }); 
    }
}

function activateDowntimeTabListeners(actorData, html){
    html.find('.pf2e-downtime-award-downtime').click(async (ev) => {
        const actor = game.actors.get(actorData._id);
        if(actor.type === "character") AwardHandler.awardDowntimeToActor(actor);
        if(actor.type === "party") AwardHandler.awardDowntimeToParty(actor.id);
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
            classes: ["pf2e-downtime-delete"],
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
            classes: ["pf2e-downtime-restart"],
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