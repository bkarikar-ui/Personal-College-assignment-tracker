# Sprint 1 Report — Personal College Assignment Tracker

## Project Recap

The Personal College Assignment Tracker is a single-user frontend prototype for a college student who wants to organize assignments by course, due date, priority, and completion status. The main workflow is to add and manage assignments, review upcoming work, and generate a simple prioritized study plan.

## Workflow Demo Guide

1. Open `index.html` in a modern browser. If your instructor recommends using a local server, use the Live Server extension in VS Code and select **Open with Live Server**.
2. Review the dashboard cards to see the total, pending, completed, and overall progress values.
3. Select **Add assignment**, fill in the title, course, due date, and priority, then save. Try leaving a required field blank to see validation.
4. Use **All**, **Pending**, and **Completed** to filter the assignment list. Use the sort menu to change the order.
5. Select the checkmark control to mark an assignment complete or pending. Notice the card, counters, and progress bar update.
6. Use **Edit** to change an assignment or **Delete** to remove one.
7. Select **Generate study plan** to create a local suggested order for pending assignments. This is simulated frontend logic, not a live AI API call.
8. Resize the browser window to check the responsive layout.

## AI Usage Log & Reflection

 I used AI assistance to help draft the HTML structure, CSS layout, and JavaScript event handling for a local assignment-tracking prototype. I reviewed the code and tested the main workflow, including adding assignments, required-field validation, filtering, sorting, completing tasks, deleting tasks, and generating the study plan. The study-plan generator uses local sorting logic as a placeholder; it does not call an external AI service. During development I reviewed each section, tested the DOM interactions, and modified the logic to ensure assignment counts updated correctly and buttons behaved as expected. AI accelerated development, but manual debugging and testing were necessary to guarantee that the interface met the project requirements. I will update this reflection to match the exact changes and tests I personally completed.

## Scope Notes

- This is a client-side Sprint 1 prototype. It has no database, authentication, external AI endpoint, or LMS integration.
- Assignment data is stored in JavaScript memory and resets when the page is refreshed.
- The study plan is a deterministic local suggestion based on due date and priority.
