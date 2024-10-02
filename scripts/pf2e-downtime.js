Hooks.on(`renderActorSheet`, (app, html, data) => {    
    addDowntimeTab(app, html, data).then(function(){
        if (app.activateDowntimeTab) {
            app._tabs[0].activate("pf2e-downtime");
        }
    });
});

async function addDowntimeTab(app, html, data) {
    if(data.actor.type==="character"){
        // Add the tab
        let nav = html.find('.sheet-navigation[data-group="primary"]');
        let manageTabsBtn = nav.find('.manage-tabs');
        let downtimeTabBtn = $(`<a class="item" data-tab="pf2e-downtime" data-tooltip="Downtime" role="tab" aria-label="Downtime"><i class='fas fa-house'></i></a>`);
        manageTabsBtn.before(downtimeTabBtn);


        // Add content to tab
        let newSheetTab = html.find('.sheet-content');
        let downtimeTabHtml = $(await renderTemplate('modules/pf2e-downtime/templates/downtime-tab.hbs', data));
        newSheetTab.append(downtimeTabHtml);

        // Make the buttons all do things
        // activateTabListeners(actor, html);

        // Set Downtime Tab as Active
        html.find('.sheet-navigation .item[data-tab="pf2e-downtime"]').click(ev => {
            app.activateDowntimeTab = true;
        });

        // Unset Training Tab as Active
        html.find('.sheet-navigation .item:not(.sheet-navigation .item[data-tab="pf2e-downtime"])').click(ev => {
            app.activateDowntimeTab = false;
        });  
    }
}

function activateTabListeners(actor, html){
    // do stuff
}