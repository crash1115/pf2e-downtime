export default class Project {
    constructor(actor){
        this.id = foundry.utils.randomID();
        this.owner = actor.id;
        this.name = "New Project";
        this.img = "icons/commodities/tech/blueprint.webp";
        this.category = "Downtime Projects";
        this.progress = {
            current: 0,
            max: 1,
            label: "",
            perDay: undefined
        };
        this.note = "";
        this.playerCanEdit = true;
        this.playerCanView = true;
        this.disableSpend = false;
    }
}