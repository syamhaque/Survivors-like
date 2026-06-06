# Survivors-like

A browser-based survivors-like game built with [Phaser 3](https://phaser.io/) and Vite. Survive waves of enemies for 30 minutes, collect XP, level up, build a weapon loadout, and unlock achievements.

## Getting Started

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Then open the local URL printed in the terminal (usually `http://localhost:5173`).

## How to Play

- **Move** — WASD or arrow keys
- **Attack** — automatic; weapons fire on their own
- **Pause** — Escape

Your goal is to survive as long as possible. Enemies spawn in increasingly difficult waves. Killing enemies drops XP orbs — walk near them to collect.

## Other Screens

- **Achievements** — tracks in-game milestones across all runs (progress is saved in the browser)
- **Codex** — reference for all weapons, equipment, and evolutions
- **Auto Level-Up** — toggle on the main menu to skip level-up screens and pick a random upgrade automatically

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build locally
```
