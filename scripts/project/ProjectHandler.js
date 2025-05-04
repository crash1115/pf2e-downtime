import Project from "../project/Project.js";
import { ProjectApp } from "../project/ProjectApp.js";
import { MODULE } from "../pf2e-downtime.js";

export class ProjectHandler {
    
    static async createProjectForActor(actor){
        if(!actor){
            ui.notifications.error(`Could not create project, invalid actor.`);
            return;
        }
        const project = new Project(actor);
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

    static getSharedProjectsForActor(actor){
        if(!actor){
            ui.notifications.error(`Could not get projects, invalid actor.`);
            return;
        }
        const parties = Array.from(actor.parties);
        let sharedProjects = [];
        for (const party of parties){
            const projects = ProjectHandler.getAllProjectsForActor(party);
            sharedProjects = sharedProjects.concat(projects);
        }
        return sharedProjects;
    }

    static openProject(project, actor){
        const data = {project: project, actor: actor};
        new ProjectApp(data).render({force:true});
    }

    static formatProjectsForSheet(projects){
         
        // Get list of displayable projects
        const visibleProjects = projects.filter(p => !p.gmOnly || (game.user.isGM && p.gmOnly));

        // Get list of categories
        let categoryNames = [];
        for(var i=0; i<visibleProjects.length; i++){
            const project = visibleProjects[i];
            const category = project.category || "Downtime Projects";
            if(!categoryNames.includes(category)) categoryNames.push(category);
        }

        // Build data structure
        let projectData = [];

        for(var j=0; j<categoryNames.length; j++){
            const name = categoryNames[j];
            let entry = {};
            entry.categoryName = name;
            entry.projects = visibleProjects.filter ( p => (p.category === name) || (p.category === "" && name === "Downtime Projects") );
            projectData.push(entry);
        }

        return projectData;
    }
    
}