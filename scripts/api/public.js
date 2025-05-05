import { AwardHandler } from "../award/AwardHandler.js";
import { SpendHandler } from "../award/SpendHandler.js";
import { ProjectHandler } from "../project/ProjectHandler.js";

export class PF2EDowntimeApi {

    /**
   * Give downtime units to the given actor
   * @param {string} actorId                      The id of the actor to award downtime to
   * @returns {Promise<void>}
   */
    static awardDowntimeToActor(actorId){
        const actor = game.actors.get(actorId);
        if(!actor){
            ui.notifications.error(`Could not find actor with id ${actorId}.`)
            return;
        }
        if(actor.type != "character"){
            ui.notifications.error(`Can't award downtime to non-PC actors. ${actor.name} is type ${actor.type}.`)
            return;
        }
        return AwardHandler.awardDowntimeToActor(actor);
    }

    /**
   * Give downtime units to each actor in the given party
   * @param {string} [partyId]                    Optional. The id of the party actor to award downtime to. If not provided, the award dialog will give options in a dropdown.
   * @returns {Promise<void>}
   */
    static awardDowntimeToParty(partyId = undefined){
        return AwardHandler.awardDowntimeToParty(partyId);
    }

    /**
   * Creates a new Project with default values and assigns it to the given actor
   * @param {string} actorId                      The id of the actor to give the project to
   * @returns {Promise<Project>}
   */    
    static async createProjectForActor(actorId){
        const actor = game.actors.get(actorId);
        if(!actor){
            ui.notifications.error(`Could not find actor with id ${actorId}.`)
            return;
        }
        return ProjectHandler.createProjectForActor(actor);
    }

    /**
   * Gets an array containing all projects for a given actor
   * @param {string} actorId                      The id of the actor to get projects from
   * @returns {Project[]}
   */
    static getAllProjectsForActor(actorId){
        const actor = game.actors.get(actorId);
        if(!actor){
            ui.notifications.error(`Could not find actor with id ${actorId}.`)
            return;
        }
        return ProjectHandler.getAllProjectsForActor(actor);
    }

    /**
   * Gets a specific project from a given actor
   * @param {string} projectId                      The id of the project
   * @param {string} actorId                        The id of the actor that owns the project
   * @returns {Project}
   */
    static getProjectForActor(projectId, actorId){
        const actor = game.actors.get(actorId);
        if(!actor){
            ui.notifications.error(`Could not find actor with id ${actorId}.`)
            return;
        }
        return ProjectHandler.getProjectForActor(projectId, actor);
    }

    /**
   * Opens a specific project from a given actor
   * @param {string} projectId                      The id of the project
   * @param {string} actorId                        The id of the actor that owns the project
   * @returns {Project}
   */
    static editProjectForActor(projectId, actorId){
        const actor = game.actors.get(actorId);
        if(!actor){
            ui.notifications.error(`Could not find actor with id ${actorId}.`)
            return;
        }
        const project = this.getProjectForActor(projectId, actorId);
        return ProjectHandler.openProject(project, actor);
    }

    /**
   * Opens the dialog to spend downtime for the given actor
   * @param {string} actorId                        The id of the actor to spend downtime
   * @returns {Promise<void>}
   */
    static spendDowntimeForActor(actorId){
        const actor = game.actors.get(actorId);
        if(!actor){
            ui.notifications.error(`Could not find actor with id ${actorId}.`)
            return;
        }
        if(actor.type != "character"){
            ui.notifications.error(`Can't spend downtime for non-PC actors. ${actor.name} is type ${actor.type}.`)
            return;
        }
        return SpendHandler.spendDowntime(actor);
    }
}

