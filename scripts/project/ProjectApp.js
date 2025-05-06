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
        classes: ["pf2e-downtime-edit-app"],
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
         context.project = ProjectHandler.getProjectForActor(this.project.id, this.actor); // refreshes project data
         context.user = game.user;
        return context;
    }

    async _onRender(options){
        /* By tying this application the actor, it forces the app to re-render
        when the actor is changed. By anyone. This effectively syncs it up so
        that if you have the app open when you spend downtime, the changes will
        carry over to the app, and vice versa. */
        this.actor.apps[this.id] = this;

        if(!ProjectHandler.userCanView(options.project)){
            ui.notifications.warn("You don't have permission to view this project.");
            this.close();
        }
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
        if(!ProjectHandler.userCanEdit(this.project)){ 
            ui.notifications.warn("You don't have permission to update this project.");
            this.close();
            return;
        }
        const newProjectData = formData.object;
        const actor = this.actor;
        const allProjects = ProjectHandler.getAllProjectsForActor(this.actor);
        if(!allProjects) return;

        let newMax = newProjectData.max;
        if (newMax < 0) newMax = 0;

        let newCurrentProgress = newProjectData.current;
        if (newCurrentProgress < 0) newCurrentProgress = 0;
        if (newCurrentProgress > newMax) newCurrentProgress = newMax;
        
        const updatedProject = {
            id: newProjectData.id,
            owner: newProjectData.owner,
            name: newProjectData.name,
            img: newProjectData.img,
            category: newProjectData.category,
            progress: {
                current: newCurrentProgress,
                max: newMax,
                label: newProjectData.label
            },
            note: newProjectData.note,
            playerCanView: newProjectData.playerCanView,
            playerCanEdit: newProjectData.playerCanEdit,
            disableSpend: newProjectData.disableSpend,
        };
        
        const projectIndex = allProjects.findIndex(p => p.id == newProjectData.id);
        allProjects[projectIndex] = updatedProject;

        await actor.setFlag(MODULE, "projects", allProjects);
        this.project = updatedProject;
    }
}