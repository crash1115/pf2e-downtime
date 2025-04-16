import { ProjectHandler } from "./ProjectHandler.js";
import { MODULE } from "../pf2e-downtime.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class ProjectApp extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        tag: "form",
        window: {
            title: "Edit Project",
        },
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

    async _prepareContext(options) {
        const context = {
            counting: 1234,
            actor: options.appData.actor,
            project: options.appData.project
        }
        return context;
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

        // Re-render the sheet with the new project data context
        // This is specifically done so Notes displays properly after update;
        // Without this re-render, outside of edit mode, it always displays the original
        // notes passed into the context. As of writing there are a few bugs with
        // the prose-mirror input. Unsure if it's that, or me just missing something.
        const newData = {project: updatedProject, actor:actor};
        this.render({force:true, appData: newData});
    }
}