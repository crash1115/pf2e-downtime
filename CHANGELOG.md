# Version 0.1.0
- Feature: Added a setting to log downtime use to chat. Enabled by default.
- Feature: Added a Downtime tab to party sheets
 - GMs can award the whole party downtime at once
 - Any user with ownership permissions for the party actor can add and manage shared party downtime projects
 - The Spend Downtime dialog now lists projects from the character and all shared projects from any parties they're part of
- Feature: Added the following options to projects: Players Can View, Players Can Edit, Disable Downtime Spending
 - Players Can View controls whether or not players can see the project
 - Players Can Edit controls whether or not players can edit the project and contribute downtime to it
 - Disable Downtime Spending overrides whether or not the project shows up in the Spend Downtime Dialog when players have edit acces
- Feature: Added categories to Projects. Setting one will display the project under a subheading with a matching name

- Enhancement: The Spend Downtime dialog project dropdown now shows the current progress of each available project

- Fix: Clicking Award Downtime from a party sheet will now correctly select the party whose sheet you clicked from by default
- Fix: Edit Project windows now correctly update when the associated project is updated while they're open
- Fix: Project controls now properly display tooltips
- Fix: You can no longer set the current progress of a project to higher than max or lower than 0 in the Edit Project window

- API: awardDowntimeToActor no longer lets you award downtime to non-PC actors
- API: spendDowntimeForActor no longer lets you attempt to spend downtime from non-PC actors

# Version 0.0.2
- Fix: Buttons on the downtime tab are now hidden from players who don't own the actor
- Fix: Fixed issue with completed projects not getting the strikethrough styling
- Fix: Fixed issue where downtime would not display as zero on actors without module flags
- Fix: Tweaked some styles for better display in dark mode

# Version 0.0.1
- Initial release
- GM can define downtime units though module setting
- GM can award downtime to individual PCs from their sheets
- GM can award downtime to all PCs in a party from the party sheet
- PCs can create, edit, delete, and restart downtime projects from their sheets
- PCs can spend downtime from their sheets