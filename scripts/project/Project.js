export default class Project {
    constructor(actor){
        this.id = foundry.utils.randomID();
        this.owner = actor.id;
        this.sharedWith = []; // Currently unused. Planned feature coming soon.
        this.name = "New Project";
        this.img = "icons/commodities/tech/blueprint.webp";
        this.category = undefined; // Currently unused. Planned feature coming soon.
        this.progress = {
            current: 0,
            max: 1,
            label: ""
        };
        this.note = "";
        this.gmOnly = false; // Currently unused. Planned feature coming soon.
    }
}