# PF2e Downtime Tracker

PF2e Downtime Tracker is a module for FoundryVTT's Pathfinder 2e system. It provides a simple interface that allows players to keep track of longer term downtime projects right from their character sheets.

The goal of this module is to provide a place to keeping track of things that you'd normally have to keep track of in a journal or notes, right on your character sheet. The goal of this module is *not* to automate downtime activities; automation inherently reduces flexibility, and my intention is for this to be as flexible and sub-system agnostic as possible.

![image](https://github.com/user-attachments/assets/8d668372-9560-47f5-ba13-f4ecb175b2b2)

## Features

✨ **Flexibility to Suit Your Game!**
- Customize how you measure downtime - weeks, days, noodles, whatever  - across your campaign.
- Choose how you measure progress for each individual downtime project - gp for crafting, cats for petting, the sky's the limit!

✨ **Cool Progress Bars!**
- Everyone loves cool progress bars. They help you see at a glance how much progress you've made on your various tasks.
- Color customization and theme support coming soon TM.

✨ **Dev Friendly!**
- The module exposes a public API that allows you to do some module related things in macros or your own modules. If you want. I guess.

---

# User Guide

## Changing Downtime Units
The module allows you to specify what units downtime is measured in. These units will be displayed across the module wherever downtime is labeled, such as in the Award Downtime dialog and the Downtime tab of the character sheets. The GM can adjust this setting via `Game Settings > Configure Settings > PF2e Downtime Tracker > Downtime Unit`.

## Awarding Downtime
Awarding downtime is not a mandatory feature for the module to work, but it helps with GM peace of mind, and helps players know how much time they have to work with. GM users can award downtime in two ways:
- To award downtime to the whole party at once, open the party sheet and click the `Award Downtime` button in the sheet header.
- To award downtime to an individual PC, open up their character sheet, go to the Downtime tab, and click the `Award` button.

## Spending Downtime
Players can see the amount of downtime they have available to them at the top of the Downtime tab of their character sheets. To spend that downtime, click the `Spend` button. This will present you with a prompt that asks how many days you'd like to spend, which project you'd like to work on, and how much progress on that project you can make during that time.

## Creating Projects
Players can create new downtime projects from the Downtime tab of their character sheets by pressing the `New Project` button. This will create a new project and open the Edit Project window, where they can configure the project with a name, image, progress information, and notes. There are handy help icons you can hover over to learn more about each field and what it does.

## Managing Projects
Players can manage their projects via the buttons to the right of each one:
- `Restart Project` will reset the project's progress to zero, but leave everything else unchanged. Useful for projects you repeat often.
- `Edit Project` will open up the Edit Project window and allow you to make changes to your project.
- `Delete Project` will delete the project from your sheet.

---

# Public API
Foundry reccomends modules expose their API in a specific way, so I did that. You can access the API like so:
```js
const api = game.modules.get('pf2e-downtime')?.api;
```
Documentation is coming soon TM, but in the meantime you can take a look at the `pf2e-downtime/scripts/api/public` file to see what's available.