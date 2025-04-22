import Project from "../project/Project.js";
import { ProjectApp } from "../project/ProjectApp.js";
import { MODULE } from "../pf2e-downtime.js";

export class ProjectHandler {

    static createProject(){
        const project = new Project;
        return project;
    }
    
    static async createProjectForActor(actor){
        if(!actor){
            ui.notifications.error(`Could not create project, invalid actor.`);
            return;
        }
        const project = ProjectHandler.createProject();
        const allProjects = ProjectHandler.getAllProjectsForActor(actor);
        allProjects.push(project);
        await actor.setFlag(MODULE, "projects", allProjects);
        return project;
    }

    static async deleteProjectForActor(projectId, actor){
        if(!actor){
            ui.notifications.error(`Could not delete project, invalid actor.`);
            return;
        }
        const allProjects = ProjectHandler.getAllProjectsForActor(actor);
        const newProjects = allProjects.filter (p => p.id != projectId);
        await actor.setFlag(MODULE, "projects", newProjects);
    }

    static async restartProjectForActor(projectId, actor){
        if(!actor){
            ui.notifications.error(`Could not restart project, invalid actor.`);
            return;
        }
        const allProjects = actor.getFlag(MODULE, "projects") || [];
        const project = this.getProjectForActor(projectId, actor);
        project.progress.current = 0;
        await actor.setFlag(MODULE, "projects", allProjects);
    }


    static getAllProjectsForActor(actor){
        if(!actor){
            ui.notifications.error(`Could not get projects, invalid actor.`);
            return;
        }
        const allProjects = actor.getFlag(MODULE, "projects") || [];
        return allProjects;
    }

    static getProjectForActor(projectId, actor){
        const allProjects = ProjectHandler.getAllProjectsForActor(actor);
        if(!allProjects){
            ui.notifications.error(`Could not find any projects on actor ${actor.name}.`);
            return;
        }
        const project = allProjects.filter(p => p.id === projectId)[0];
        if(!project){
            ui.notifications.error(`Could not find project id ${projectId} on actor ${actor.name}.`);
        } 
        return project || null;
    }

    static openProject(project, actor){
        const data = {project: project, actor: actor};
        new ProjectApp().render({force:true, context: data});
    }
    
}