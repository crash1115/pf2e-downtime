export default class Project {
    constructor(){
        this.id = foundry.utils.randomID();
        this.owners = [];
        this.name = "New Project";
        this.img = "icons/commodities/tech/blueprint.webp";
        this.note = "";
        this.progress = {
            current: 0,
            max: 1,
            label: ""
        }
    }
}