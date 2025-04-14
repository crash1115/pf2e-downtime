const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class ProjectApp extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        tag: "form",
        window: {
            title: "Edit Project"
        },
        form: {
          handler: ProjectApp.formHandler,
          submitOnChange: false,
          closeOnSubmit: true
        },
        actions: {
            testAction: ProjectApp.testAction
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

    static testAction(event, target) {
        console.log("test action done")
        console.log(event, target)
        console.log(this)
    }

    /**
   * Process form submission for the sheet
   * @this {ProjectApp}                      The handler is called with the application as its bound scope
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {FormDataExtended} formData           Processed data for the submitted form
   * @returns {Promise<void>}
   */
    static async formHandler(event, form, formData) {
        // Do things with the returned FormData
        console.log("handling form data")
        console.log(event, form, formData)
        console.log(this)
    }
}

// Reference: https://foundryvtt.wiki/en/development/api/applicationv2
// Reference: https://foundryvtt.com/article/module-sub-types/