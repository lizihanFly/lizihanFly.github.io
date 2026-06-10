# Assignment 4 Report: Developing an AI-Assisted Application

**Student:** Lizihan  
**Project option:** Option A, "Defend Your Thesis"  
**Application:** <https://lizihanfly.github.io/thesis-defense.html>  
**Source repository:** <https://github.com/lizihanFly/lizihanFly.github.io>  
**Date:** June 10, 2026

## 1. Project Summary

Defend Your Thesis is a survival-defense game that runs entirely in a web browser. The player selects a research character and protects a thesis core from three academic threats:

- **Bugs:** balanced enemies with ordinary damage.
- **Deadlines:** fast enemies that are difficult to intercept.
- **Reviewer #2:** slow, high-health enemies with heavy damage.

The application is a stable URL rather than an executable file. It uses only HTML, CSS, the Canvas 2D API, and JavaScript, so GitHub Pages can host it without a build step.

## 2. Requirement Mapping

| Requirement | Implementation |
|---|---|
| Functional application | Playable at `thesis-defense.html` |
| Character selection | Analyst, Hacker, and Writer with different statistics |
| Game over and score | Final score, wave, result message, and persistent best score |
| Keyboard controls | WASD/arrows, mouse aim, click/space fire, P/Escape pause |
| Mouse controls | Pointer aiming and click-to-fire |
| Mobile controls | On-screen directional pad and auto-aim fire button |
| AI-assisted architecture | Documented in Section 5 |
| AI-assisted problem solving | Documented in Section 6 |
| Markdown report | This file |

## 3. Gameplay and Features

### Core loop

1. Select a candidate.
2. Move around the arena.
3. Aim and fire citations at incoming threats.
4. Stop enemies before they reach the thesis.
5. Build a score combo through quick eliminations.
6. Collect coffee or citation power-ups.
7. Survive increasingly difficult waves.

### Character design

| Character | Strength | Trade-off |
|---|---|---|
| Analyst | Balanced speed, fire rate, and damage | No extreme advantage |
| Hacker | Highest movement and fire rate | Low damage per shot |
| Writer | Highest damage per citation | Slow movement and fire rate |

### Progression

Each wave increases enemy count, health, and speed. Deadlines appear from wave two and Reviewer #2 appears from wave three. Clearing a wave gives a score bonus and a power-up.

## 4. Software Architecture

The game uses a state-driven update/render loop:

```text
Input events
    |
    v
Update player -> bullets -> enemies -> collisions -> wave manager
    |
    v
Update score, health, combo, particles, and power-ups
    |
    v
Render background -> thesis -> entities -> effects -> HUD
```

Main data groups:

- `characterStats`: movement, fire delay, damage, and bullet speed.
- `enemyTypes`: health, speed, radius, core damage, and score.
- `game`: current runtime state.
- `ui`: references to HUD and overlay elements.
- `keys` and `pointer`: keyboard, mouse, and touch input state.

The `requestAnimationFrame` loop calculates delta time and caps unusually large frame gaps. Movement therefore remains consistent across display refresh rates.

## 5. AI-Assisted Architecture

An AI coding agent was used inside the development workspace. The initial repository contained a small static homepage, so the architecture needed to remain compatible with GitHub Pages.

The AI agent helped turn the assignment brief into the following modules:

1. A character-selection overlay.
2. A Canvas game engine.
3. A state-based screen system for start, play, pause, and game over.
4. Keyboard, mouse, and touch input.
5. A wave and difficulty manager.
6. Collision detection and entity cleanup.
7. A documentation and testing plan.

The final decision was to avoid a framework because the project has one game scene, no server state, and an existing static deployment. This reduced dependency risk and made the source easy to inspect.

## 6. AI-Assisted Problem Solving

### Collision detection

The AI agent proposed circle-based collision checks for bullets, enemies, the player, power-ups, and the thesis core:

```text
distance(a, b) < radius(a) + radius(b)
```

This is simpler and more reliable for the rounded visual design than rectangular collision boxes.

### Frame-rate independent movement

Early game logic could have tied speed to frame count. The implementation instead multiplies velocity by elapsed time (`dt`). The delta is capped at 0.033 seconds so returning to a background tab does not cause entities to jump across the arena.

### Input unification

Keyboard and on-screen direction buttons write to the same `keys` object. Mouse clicks and the touch fire button write to the same `pointer.down` state. This keeps the game logic independent from the physical input method.

### Browser audio

The Web Audio API cannot start before user interaction. Audio initialization therefore occurs only after the player presses **Begin defense**. Sound effects are generated with short oscillators, so no copyrighted audio assets or external downloads are required.

### Secret and persistence decisions

The game contains no user accounts or private data. Only the best score is stored in `localStorage`. No gameplay information is sent to a server.

## 7. Testing Strategy

### Functional tests

| Test | Expected result |
|---|---|
| Select each character | Selected card and runtime statistics change |
| Hold WASD or arrow key | Player moves and remains inside the arena |
| Aim and click | Bullet travels toward the pointer |
| Press space | Player fires toward the current aim direction |
| Bullet hits enemy | Enemy health decreases; destroyed enemy adds score |
| Enemy reaches thesis | Thesis integrity decreases |
| Integrity reaches zero | Game-over overlay appears |
| Press P or Escape | Game pauses and resumes |
| Clear a wave | Next wave begins after a short break |
| Collect coffee | Thesis integrity increases, capped at 100 |
| Collect citation boost | Fire rate increases temporarily |
| Finish a run | Best score is saved locally |
| Use mobile controls | Direction buttons move; CITE auto-aims at nearest enemy |

### Static checks

- JavaScript syntax is checked with `node --check`.
- Internal HTML links are checked against files in the repository.
- The site is served locally over HTTP to avoid file-origin differences.
- Responsive layouts are reviewed at desktop, tablet, and phone widths.

## 8. Challenges

### Balancing

The three characters needed to feel different without making one obviously superior. Their movement, fire delay, damage, and projectile speed are stored as data so values can be tuned without rewriting logic.

### Responsive game controls

A desktop game normally assumes keyboard and mouse input. The mobile layout includes a directional pad and a fire control that automatically aims at the nearest enemy. The Canvas maintains a fixed logical coordinate system while CSS scales it to the available width.

### Readable feedback

Many simultaneous enemies can make a game difficult to read. Color, shape, labels, health bars, particles, screen shake, and short synthesized tones provide several types of feedback without requiring image or audio files.

## 9. Limitations and Future Work

- Enemy movement uses direct paths rather than pathfinding.
- The game has one arena and no narrative level transitions.
- Difficulty is tuned heuristically and would benefit from user playtest data.
- Browser best scores are local to one device.
- Future versions could add boss behaviors, upgrades, accessibility settings, and an online leaderboard.

## 10. Reflection

The AI agent was most useful for translating requirements into a testable architecture and for checking edge cases across game states. It accelerated implementation, but its suggestions still needed human decisions about scope, visual style, honesty in documentation, and whether a feature improved the assignment.

The project moved beyond "prompting for fun" because the final result has explicit requirements, persistent state, input handling, collision rules, error-resistant timing, responsive controls, documentation, and a repeatable test plan. AI supported the engineering process; it did not remove the need for engineering judgment.
