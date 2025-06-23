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
        const combined = projects.concat(sharedProjects);   // All projects available to the actor
        const visible = combined.filter (p => ProjectHandler.userCanView(p)) || [];   // Projects that are visible to the user
        const editable = visible.filter (p => ProjectHandler.userCanEdit(p)) || []; // Projects the user can edit
        const unfinished = editable.filter(p => p.progress.current < p.progress.max) || []; // Projects tht aren't finished
        const canSpend = unfinished.filter(p => !p.disableSpend) || []; // Projects that can have downtime spent on them
        const choices = canSpend.reduce((choices, project) => Object.assign(choices, {[project.id]: `${project.name} (${project.progress.current} / ${project.progress.max} ${project.progress.label})`}), {});
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
            classes: ["pf2e-downtime-spend"],
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
            rejectClose: false,
            render: (event) => {

                const projectField = event.target.element.querySelector('select[name="project"]');
                projectField.addEventListener("change", () => {
                    const projectId = event.target.element.querySelector('select[name="project"]').value || null;
                    if(projectId){
                        const project = combined.filter(p => p.id === projectId)[0];
                        if(!!project.progress.perDay){
                            const days = event.target.element.querySelector('range-picker[name="days"] input[type="range"]').value;
                            const newProgress = days * project.progress.perDay;
                            event.target.element.querySelector('input[name="progress"]').value = newProgress;       
                        }
                    }                    
                });

                const daysFieldRange = event.target.element.querySelector('range-picker[name="days"] input[type="range"]');
                daysFieldRange.addEventListener("change", () => {
                    const projectId = event.target.element.querySelector('select[name="project"]').value || null;
                    if(projectId){
                        const project = combined.filter(p => p.id === projectId)[0];
                        if(!!project.progress.perDay){
                            const days = event.target.element.querySelector('range-picker[name="days"] input[type="range"]').value;
                            const newProgress = days * project.progress.perDay;
                            event.target.element.querySelector('input[name="progress"]').value = newProgress;       
                        }
                    }                    
                });
            }
        });

        if (!response) return;
        
        const oldDowntimeDaysValue = actor.getFlag(MODULE,"downtimeDays");
        const newDowntimeDaysValue = oldDowntimeDaysValue - response.days;
        await actor.setFlag(MODULE, "downtimeDays", newDowntimeDaysValue);

        if(!response.project){
            if(game.settings.get(MODULE, 'sendUseToChat')){
                let chatHtml = await foundry.applications.handlebars.renderTemplate('modules/pf2e-downtime/templates/downtime-use-card.hbs', {
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
        const projectOwner = game.actors.get(selectedProject.owner);
        const userCanUpdate = projectOwner.isOwner && !selectedProject.disableSpend && ProjectHandler.userCanEdit(selectedProject);
        
        let allProjects = ProjectHandler.getAllProjectsForActor(projectOwner);
        let project = ProjectHandler.getProjectForActor(response.project, projectOwner);
        const oldProgressValue = project.progress.current + 0;
        const newProgressValue = Math.min(project.progress.current + response.progress, project.progress.max);
        project.progress.current = newProgressValue;
        
        if(userCanUpdate){
            await projectOwner.setFlag(MODULE, "projects", allProjects);
        } else {
            ui.notifications.warn("You don't have permission to update the selected project. Ask the GM or other owner to update its progress manually.", {permanent: true});
        }
        
        if(game.settings.get(MODULE, 'sendUseToChat')){
            let chatHtml = await foundry.applications.handlebars.renderTemplate('modules/pf2e-downtime/templates/downtime-use-card.hbs', {
                actorName: actor.name,
                daysSpent: response.days,
                downtimeUnit: UNIT,
                project: {
                    name: project.name,
                    oldProgress: oldProgressValue,
                    newProgress: newProgressValue,
                    progressLabel: project.progress.label,
                    toGo: project.progress.max - newProgressValue
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