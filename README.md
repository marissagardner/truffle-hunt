# Truffle Hunt

A browser-based logic game, similar in spirit to Minesweeper, built as a teaching
tool for introducing high school students to rule-based AI. Students (or a
teacher) write simple pattern-matching rules that a virtual "truffle-sniffing
boar" uses to decide its own moves — making the mechanics of rule-based
decision-making visible and interactive rather than abstract.

Originally written by Jeffrey L. Popyack (July 2006), most recently as a
single monolithic `index.html` file with inline CSS and JavaScript. This
version has been refactored into separate `index.html`, `style.css`, and
`script.js` files, with ongoing bug fixes and UX improvements layered on top.

## Files

- `index.html` — page structure and markup
- `style.css` — all styling
- `script.js` — game logic, rule engine, and rendering

## How it works

- A 10x10 grid hides 10 truffles. Clicking a cell probes it: a safe cell
  reveals how many truffles are in its neighboring cells (like Minesweeper);
  an unsafe cell ends the game.
- Right-click (or Ctrl-click) marks a cell as a suspected truffle.
- The **Rule Center** holds a list of pattern/action rules, written as pairs
  of 9-character strings describing a 3x3 neighborhood. Rules are tried
  **top to bottom**, and the first one that matches anywhere on the board
  wins — rule order is a real priority list, not just a visual order.
- Each rule is automatically tested in all 4 rotations (0°, 90°, 180°, 270°)
  against every cell, so one rule can cover a situation regardless of which
  direction it's facing.

## Modes

Reachable from a landing page shown on first load:

- **Manual Play** (`?solo`) — a plain human-only game. No boar, no Rule
  Center.
- **Auto-Boar** (default) — the rule-driven boar reacts to clicks, and can
  chain its own moves automatically via the "Auto Boar" checkbox.

Other modes, reachable by URL parameter (not currently linked from the UI):

- `?rul` — Rule Maker, a sandbox for testing a single pattern/action rule
  against a hand-built sample grid before adding it to the real rule list.
- `?dev` — Developer Mode, exposes internal grid state for debugging.

## Known limitations / in progress

- The Rule Maker (`?rul`) is a standalone sandbox: rules built there don't
  carry over to the main game, and it can only hold one rule at a time.
- Work is underway to make the Auto-Boar page more transparent for students —
  showing the boar's reasoning as it searches through rules, highlighting
  rule priority, and adding a step-through mode so moves can be examined one
  at a time instead of only running continuously.

## Credits

Jeffrey L. Popyack — original design and implementation, 2006–2024.
Marissa Gardner - refactoring and updates to Auto Boar, 2026