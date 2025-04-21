import { MODULE } from "./pf2e-downtime.js";

export function registerSettings(){
    game.settings.register(MODULE, "downtimeUnit", {
        name: "Downtime Unit",
        hint: "Define a unit for measure for downtime spent and given. Should be the singular form of the word, ex: hour, day, week, month, etc.",
        scope: "world",
        config: true,
        default: "day",
        type: String,
    });

    game.settings.register(MODULE, "sendUseToChat", {
        name: "Create Chat Messages",
        hint: "When enabled, sends messages to chat when players Spend downtime.",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
    });
}