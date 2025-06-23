# PF2e Downtime Tracker

PF2e Downtime Tracker is a module for FoundryVTT's Pathfinder 2e system. It provides a simple interface that allows players to keep track of longer term downtime projects right from their character sheets.

The goal of this module is to provide a place to keeping track of things that you'd normally have to keep track of in a journal or notes, right on your character sheet. The goal of this module is *not* to automate downtime activities; automation inherently reduces flexibility, and my intention is for this to be as flexible and sub-system agnostic as possible.

![image](https://github.com/user-attachments/assets/66027237-76ab-4ad4-9a4f-9f8d897ec96e)


## Features

✨ **Flexibility to Suit Your Game**
- Customize how you measure downtime - weeks, days, noodles, whatever  - across your campaign.
- Choose how you measure progress for each individual downtime project - gp for crafting, cats for petting, the sky's the limit!
- Control how much access the players have over each activity with view and edit permissions - hide your evil plans, show them their reputation but don't let them mess with it, or let them go nuts - up to you!

✨ **Cool Progress Bars**
- Everyone loves cool progress bars. They help you see at a glance how much progress you've made on your various tasks.
- Color customization and theme support coming soon TM.

✨ **Individual and Shared/Party Project Tracking**
- Create and track projects for your character individually, or set up shared projects with your party for everyone to work on and contribute to.

## Compatibility

⚠️ **PF2e Dorako UI**
- This module has partial support for PF2e Dorako UI
- V12: It's usable in light and dark mode across all sheet themes, but the colors of elements in the Downtime tab don't always match up with Dorako's theme colors
- V13: Usable with a selection of application themes (BG3, 5e, Github) on both light and dark modes
- I have no plans to maintain support for this module

❌ **PF2e Pathfinder Ui v3**
- This module has no support with PF2e Pathfhinder Ui v3
- It's technically functional, but it looks like garbage almost universally
- I have no plans to support this module further

## Installation

Not currently available in the module browser, so you'll have to use the manifest URL instead:
- `https://github.com/crash1115/pf2e-downtime/releases/latest/download/module.json`

---

# User Guide

## Changing Downtime Units
The module allows you to specify what units downtime is measured in. These units will be displayed across the module wherever downtime is labeled, such as in the Award Downtime dialog and the Downtime tab of the character sheets. The GM can adjust this setting via `Game Settings > Configure Settings > PF2e Downtime Tracker > Downtime Unit`.

## Awarding Downtime
Awarding downtime is not a mandatory feature for the module to work, but it helps with GM peace of mind, and helps players know how much time they have to work with. GM users can award downtime in two ways:
- To award downtime to the whole party at once, open the party sheet, go to the Downtime tab, and click the `Award Downtime to Party` button.
- To award downtime to an individual PC, open up their character sheet, go to the Downtime tab, and click the `Award` button.

When you award downtime, it will be displayed on the Downtime tab of the character sheet for each PC.

## Spending Downtime
Players can see the amount of downtime they have available to them at the top of the Downtime tab of their character sheets. To spend that downtime, click the `Spend` button. This will present you with a prompt that asks how many days you'd like to spend, which project you'd like to work on, and how much progress on that project you can make during that time. In order for a project to appear in the list of options to spend time on, it must meet the following criteria:
- It must be on either your character sheet, or the party sheet for the party your character belongs to
- It must be incomplete
- It must have the `Disable Downtime` Spend option unchecked
- You must be able to view _and_ edit the project (see Permissions below)

If you work on a project that belongs to an actor you don't have ownership of (generally the party actor), its progress will not automatically update; it'll instead prompt you to have the GM or owner update it manually.

## Creating Projects
Players can create new downtime projects from the Downtime tab of their character sheets by pressing the `New Project` button. This will create a new project and open the Edit Project window, where they can configure the project with a name, image, progress information, notes, and other options. There are handy help icons you can hover over to learn more about each field and what it does.

## Creating Shared Projects
You can create Shared Projects from the Downtime tab of the party sheet by pressing the `New Shared Project` button. This creates a project that will appear on the party sheet's Downtime tab. These projects can be selected by any member of the party when they Spend downtime (as long as the project meets the requirements listed in the Spend Downtime section above).

## Managing Projects
If you have ownership of an actor, you can manage its projects via the buttons to the right of each one:
- `Restart Project` will reset the project's progress to zero, but leave everything else unchanged. Useful for projects you repeat often.
- `Edit Project` will open up the Edit Project window and allow you to make changes to your project.
- `Delete Project` will delete the project from your sheet.
These buttons may be disabled or behave differently if you don't have Edit permissions (see below) for the project.

## Project Edit/View Permissions
When creating or editing a project, the GM will be able to set two additional permissions:
- `Players Can View` controls whether or not a player can see the project. If this is checked, the project will appear on their character sheet (or the party sheet). They'll be able to click the Edit Project button to view its details in read-only mode.
- `Players Can Edit` controls whether or not players can update the projects. If this checked, they'll be able to Restart, Edit, and Delete the project. They'll also be able to select the project as an option when they spend downtime.

GM users are not limited by either of these options. They can always view, edit, and spend downtime on any project.

_It's recommended that you test out the behavior of any project permissions you set up to verify they work the way you intend (especially in conjunction with Foundry's actor permissions) before entering any sensitive info in a project._

## Example Project Permissions Setups
Here's a handful of ways you can set up projects for various use cases:

**Clock or Counter**

Check `Players Can View` and `Disable Downtime Spending`, uncheck `Players Can Edit`. This puts it in "read only" mode for them, you can't spend downtime on it, but you can still edit it from the sheet.

**Faction Rep**

Check `Players Can View`, uncheck `Players Can Edit` and `Disable Downtime Spending`. They can see it, but they can't mess with it. If you go to their sheet, you can spend downtime on it for them to increase it, but they can't do it themselves.

**Super Secret GM Things**

Uncheck everything. They can't see it or edit it, and it won't show up in the Spend Downtime dialog if you ever click on it.

---

# Public API
Foundry recommends modules expose their API in a specific way, so I did that. You can access the API like so:
```js
const api = game.modules.get('pf2e-downtime')?.api;
```
Documentation is coming soon TM, but in the meantime you can take a look at the `pf2e-downtime/scripts/api/public` file to see what's available.
