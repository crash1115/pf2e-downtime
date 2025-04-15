export const pf2eDowntimeHelpers = {

    "pf2e-downtime-progress-percent": (project) => {
        const currentProgress = project.progress.current;
        const maxProgress = project.progress.max;
        const percent = Math.floor(100 * currentProgress / maxProgress);
        return percent;
    },

}