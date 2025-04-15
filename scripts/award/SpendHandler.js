import { MODULE } from "../pf2e-downtime.js";
import { ProjectHandler } from "../project/ProjectHandler.js";

export class SpendHandler {
    
    static async spendDowntime(actor){

        const UNIT = game.settings.get(MODULE, 'downtimeUnit').toLowerCase();
        const UNIT_CAP = UNIT.charAt(0).toUpperCase() + UNIT.slice(1);
        
        const {DialogV2} = foundry.applications.api;
        const fields = foundry.data.fields;
        const projects = actor.getFlag(MODULE,"projects") || [];
        const unfinished = projects.filter(p => p.progress.current < p.progress.max) || [];
        const choices = unfinished.reduce((choices, project) => Object.assign(choices, {[project.id]: project.name}), {});
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
            const msg = `${actor.name} spent ${response.days} ${UNIT}(s).`
            ui.notifications.notify(msg);
            return;
        }
        
        let allProjects = ProjectHandler.getAllProjectsForActor(actor);
        let project = ProjectHandler.getProjectForActor(response.project, actor);
        const newProgressValue = Math.min(project.progress.current + response.progress, project.progress.max);
        project.progress.current = newProgressValue;
        await actor.setFlag(MODULE, "projects", allProjects);
        
        const msg = `${actor.name} spent ${response.days} ${UNIT}(s) on ${project.name}. Progress increased by ${response.progress} to ${project.progress.current} / ${project.progress.max}.`
        ui.notifications.notify(msg);
    }
}