import { ProjectHandler } from "./ProjectHandler.js";
import { MODULE } from "../pf2e-downtime.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ProjectApp extends HandlebarsApplicationMixin(ApplicationV2) {
    
    constructor(data, options) {
        super(options);
        this.project = data.project;
        this.actor = data.actor;
    }

    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["pf2e-downtime"],
        position: {
            width: 610
        },
        form: {
          handler: ProjectApp.formHandler,
          submitOnChange: true,
          closeOnSubmit: false
        }
    };

    static PARTS = {
        form: {
            template: "modules/pf2e-downtime/scripts/project/project-sheet.hbs"
        }
    }

    get title(){
        return `Edit Project - ${this.project.name}`;
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.actor = this.actor;
        context.project = ProjectHandler.getProjectForActor(this.project.id, this.actor); // refreshes project data
        return context;
    }

    async _onRender(options){
        /* By tying this application the actor, it forces the app to re-render
        when the actor is changed. By anyone. This effectively syncs it up so
        that if you have the app open when you spend downtime, the changes will
        carry over to the app, and vice versa. */
        options.actor.apps[this.id] = this;
    }

    async _onClose(){
        // We tied the app to the actor, so we should to nuke it when we close it
        const actor = game.actors.get(this.actor.id);
        delete actor.apps[this.id];
    }

    /**
   * Process form submission for the sheet
   * @this {ProjectApp}                           The handler is called with the application as its bound scope
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {FormDataExtended} formData           Processed data for the submitted form
   * @returns {Promise<void>}
   */
    static async formHandler(event, form, formData) {
        const newProjectData = formData.object;

        const actorId = newProjectData.owner;
        const actor = game.actors.get(actorId);
        if(!actor){
            ui.notifications.error(`Could not find actor with id ${actorId}.`)
            return;
        }

        const allProjects = ProjectHandler.getAllProjectsForActor(actor);
        if(!allProjects) return;
        
        let projectIndex = allProjects.findIndex(p => p.id == newProjectData.id);

        const updatedProject = {
            id: newProjectData.id,
            name: newProjectData.name,
            img: newProjectData.img,
            note: newProjectData.note,
            progress: {
                current: newProjectData.current,
                max: newProjectData.max,
                label: newProjectData.label
            }
        };
        allProjects[projectIndex] = updatedProject;

        await actor.setFlag(MODULE, "projects", allProjects);
    }
}