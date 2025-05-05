import { ProjectHandler } from "./project/ProjectHandler.js";

export const pf2eDowntimeHelpers = {

    "pf2e-downtime-progress-percent": (project) => {
        const currentProgress = project.progress.current;
        const maxProgress = project.progress.max;
        const percent = Math.floor(100 * currentProgress / maxProgress);
        return percent;
    },

    "pf2e-downtime-user-can-edit": (project) => {
        return ProjectHandler.userCanEdit(project);
    },

    "pf2e-downtime-user-can-view": (project) => {
        return ProjectHandler.userCanView(project);
    },

}