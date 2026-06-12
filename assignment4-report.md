# Assignment 4 Report: Developing an AI-Assisted Application

**Student:** Lizihan

**Project option:** Option A, "Defend Your Thesis"

**Application:** <https://lizihanfly.github.io/thesis-defense.html>

**Source repository:** <https://github.com/lizihanFly/lizihanFly.github.io>

**Date:** June 12, 2026

## 1. Project Summary

Defend Your Thesis is an original room-based, top-down roguelite shooter that runs entirely in a web browser. The player chooses a researcher, clears academic combat rooms, opens evidence chests, collects weapons of different qualities, and defeats a boss committee at the end of each floor.

The new gameplay structure is inspired by the broad conventions of room-based action roguelites, including games such as *Soul Knight*. All code, interface text, Canvas graphics, enemies, weapon names, balance values, and academic theming were created specifically for this assignment. No external game assets were copied.

The application uses HTML, CSS, JavaScript, and the Canvas 2D API. It is hosted at a stable GitHub Pages URL and requires no build step or server.

## 2. Requirement Mapping

| Requirement | Implementation |
|---|---|
| Functional application | Playable at `thesis-defense.html` |
| Character selection | Analyst, Hacker, and Writer have different statistics and active abilities |
| Stable web deployment | Static files hosted through GitHub Pages |
| Game over and score | Final score, rooms cleared, result message, restart, and persistent best score |
| Keyboard controls | WASD/arrows, mouse aim, click/space fire, `F` interact, `Q` swap, `R` reload |
| Mouse controls | Pointer aiming, click-to-fire, and clickable weapon slots |
| Mobile controls | Direction pad, auto-aim fire, pickup, swap, reload, dash, and skill buttons |
| Fullscreen presentation | Fullscreen API button and `G` shortcut with aspect-ratio preservation |
| Character movement and collision | Arena boundaries and solid room obstacles |
| AI-assisted development | Architecture and problem solving documented below |
| Markdown report | This file |

## 3. Gameplay and Features

### Core loop

1. Select a researcher.
2. Enter a research room and defeat all threats.
3. Open the evidence chest.
4. Inspect and pick up the generated weapon.
5. Use Funding in the pet shop to buy or upgrade companions.
6. Enter the next room.
7. Defeat the Final Committee in room five.
8. Choose one permanent research talent.
9. Reach floor 100 and watch the final thesis explode.

### Room and floor progression

The game contains exactly 100 floors and five rooms per floor, for a total of 500 rooms. The first four rooms use different obstacle layouts and increasingly large enemy groups. Room five contains a boss with projectile volleys and summoned enemies. Enemy health, speed, and damage increase gradually without creating an unbounded endless mode.

After the floor-100 boss, the exit triggers a scripted ending. The thesis document explodes immediately, secondary explosions cross the arena, and the paper breaks into animated fragments before the final result appears.

Solid bookcases and lab equipment change movement and firing lines. Bullets collide with these obstacles, so the player must reposition rather than standing in one location.

The expanded version uses ten standard layouts, three boss layouts, and four visual themes. Obstacles are modeled as bookshelves, desks, server racks, laboratory vats, and structural pillars rather than identical blocks.

### Weapon quality and inventory

Weapons use five visible quality levels:

| Quality | Color | General effect |
|---|---|---|
| Common | Gray | Base statistics |
| Uncommon | Green | Improved damage and magazine |
| Rare | Blue | Stronger damage and magazine |
| Epic | Purple | Large statistic increase |
| Legendary | Orange | Highest statistics and an additional weapon trait |

The player can carry two weapons. `F` picks up or replaces a weapon, `Q` switches slots, and `R` reloads. Every weapon has a separate magazine, reserve ammunition, firing delay, reload time, projectile speed, spread, and special behavior. Right click or `X` performs a melee strike. Firing an empty weapon also uses the melee strike while reloading, so the player is never completely unable to attack.

Current weapon families:

- **Research Pistol:** reliable general-purpose sidearm.
- **Citation SMG:** fast automatic fire with moderate spread.
- **Scatter Thesis:** multi-projectile close-range weapon.
- **Peer Review Railgun:** slow, powerful projectiles that pierce enemies.
- **Laser Pointer:** accurate sustained fire with piercing.
- **Grant Launcher:** explosive area damage.
- **Footnote Repeater:** balanced rapid-fire weapon.
- **Tenure Revolver:** high-damage precision sidearm.
- **Method Crossbow:** slow projectile with heavy piercing.
- **Data Needler:** extremely fast low-damage fire.
- **Prism Abstract:** three-way projectile spread.
- **Citation Tesla:** chains damage between nearby enemies.
- **Hypothesis Orb:** slow homing projectile.
- **Burnout Projector:** short-range expanding flame spread.
- **Recursive Proof:** projectiles ricochet from obstacles.

### Weapon visual language

The visual redesign studies general principles found in mainstream loot shooters and action games: strong silhouette families, repeated manufacturer-style motifs, moving energy components, rarity-driven presentation, recoil, muzzle flash, projectile identity, and impact feedback. It does not copy a specific commercial weapon or asset.

The original weapon houses are:

- **Axiom:** practical angular receivers and clear mechanical parts.
- **Vector:** compact high-rate weapons with fins and sharp forward lines.
- **Forge:** heavy industrial bodies, large barrels, and warm metal accents.
- **Helix:** advanced energy rails, coils, and bright internal cores.
- **Relic:** floating or geometric technology with orbiting components.

Every shot can now produce recoil, barrel heat, muzzle flash, expanding shock rings, ejected casings, sparks, and model-specific projectiles. Higher qualities add brighter cores, energy rails, pulsing auras, and orbiting particles. Weapon drops appear inside animated holographic rings and quality-colored light columns.

Weapon quality chances improve on later floors, after boss fights, and through the Better Evidence talent.

### Character design

| Character | Passive strength | Active ability |
|---|---|---|
| Analyst | +18% weapon damage | Freezes nearby threats |
| Hacker | +14% movement speed | Damages nearby enemies and removes projectiles |
| Writer | +25% maximum integrity | Fires a radial Citation Storm |

All characters can dash with `Shift`. Dashing moves quickly through danger and briefly prevents damage.

### Enemies and rewards

- **Bug:** standard close-range threat.
- **Deadline:** fast, low-health enemy.
- **Reviewer:** stays at range and fires projectiles.
- **Replication Error:** splits into smaller enemies.
- **Major Revision:** slow armored enemy.
- **Copy Editor:** aggressive, fast melee enemy.
- **Citation Sniper:** long-range projectile enemy.
- **Final Committee:** floor boss with volleys and reinforcements.

Defeated enemies can drop integrity repair, ammunition, or research funding. Cleared rooms contain an evidence chest and exit portal.

### Permanent talents

After every boss, the player chooses one of three random talents. Talents can improve damage, integrity, movement, reload speed, skill cooldown, armor, ammunition, or future loot quality.

### Funding and pet shop

Funding is earned from enemies, collectible drops, bosses, and room-clear rewards. After every cleared room, the portal opens the Research Companion Lab. Funding can purchase a new pet or upgrade an owned pet to a maximum of level 5.

The ten pets are:

- **Citation Drone:** shoots the nearest enemy.
- **Coffee Bot:** periodically restores integrity.
- **Shield Node:** reduces incoming damage.
- **Ammo Carrier:** restores reserve ammunition.
- **Tesla Orb:** chains lightning between enemies.
- **Frost Wisp:** freezes enemies in an area.
- **Bomb Buddy:** launches explosive projectiles.
- **Magnet Cube:** attracts health, ammo, and Funding.
- **Laser Eye:** fires a piercing beam.
- **Thesis Guardian:** circles the player and performs close-range attacks.

## 4. Software Architecture

The application uses a state-driven update and render loop:

```text
Keyboard / mouse / touch input
             |
             v
Player movement -> dash -> weapon fire -> reload -> active skill
             |
             v
Enemy movement -> ranged attacks -> boss summons
             |
             v
Projectile and obstacle collisions -> damage -> drops -> score
             |
             v
Room clear -> chest -> weapon pickup -> portal -> boss talent
             |
             v
Canvas rendering -> particles -> HUD -> overlays
```

Main data groups:

- `qualities`: color and statistic multipliers for the five loot qualities.
- `weaponBases`: base statistics and behavior for every weapon family.
- `characters`: movement, health, damage, and active skill data.
- `enemyTypes`: health, movement, damage, armor, and behavior flags.
- `talents`: permanent run upgrades and their state changes.
- `state`: the complete current run, room, inventory, entities, and timers.
- `ui`: references to HUD and overlay elements.

`requestAnimationFrame` drives the loop. Delta time is capped to prevent large movement jumps after the browser tab returns from the background.

## 5. AI-Assisted Architecture

An AI coding agent was used inside the development workspace. It first inspected the existing static GitHub Pages repository and the assignment requirements. The application was kept framework-free because one Canvas scene and static deployment did not justify a package or build system.

The AI agent helped:

1. Convert the assignment brief into a playable feature list.
2. Design a data-driven weapon and quality system.
3. Separate room state, combat entities, inventory, and UI state.
4. Implement keyboard, mouse, and touch input through shared actions.
5. Add obstacle, projectile, enemy, and pickup collision logic.
6. Build boss progression and permanent talent selection.
7. Check JavaScript syntax and run automated browser interaction tests.
8. Update the report and deployment files.

## 6. AI-Assisted Problem Solving

### Data-driven weapon generation

Creating a separate hard-coded version of every weapon at every quality would create many duplicated values. The implementation instead combines one weapon base with one quality multiplier:

```text
generated damage = base damage * quality multiplier
generated magazine = base magazine * quality magazine multiplier
```

This makes future weapon balancing and additions much easier.

### Inventory replacement

The player has two weapon slots. Picking up a weapon fills an empty slot first. If both slots are occupied, the new weapon replaces the active one and the old weapon remains on the floor. This allows comparison without permanently losing the previous choice.

### Collision and navigation

Players and enemies use circle collision against rectangular obstacles. Movement is resolved one axis at a time, which allows sliding along a bookcase edge. Enemy navigation combines direct movement when line of sight is clear, A* grid pathfinding when an obstacle blocks the target, local steering around corners, separation from nearby enemies, and a stuck detector that recalculates the route. This prevents enemies from continuously walking into a wall.

### Safe entity lifecycle

Bullets and pickups are processed in reverse order so removal does not skip later elements. Enemy arrays are copied when explosive damage or active skills may destroy several enemies during one update.

### Unified input

Keyboard shortcuts and mobile buttons call the same interaction, weapon switching, reloading, dash, and skill functions. Touch firing uses nearest-enemy aiming because a phone has no separate mouse pointer.

### Originality and scope

The requested direction was interpreted as a genre and control reference, not a request to duplicate another game's copyrighted assets or exact presentation. The implementation uses original geometric Canvas art and an academic research theme while adding the requested room, loot, weapon-quality, and combat systems.

## 7. Testing Strategy

### Functional tests

| Test | Expected result |
|---|---|
| Select each researcher | Selected card and runtime statistics change |
| Move against arena or obstacle | Player remains in valid walkable space |
| Aim and fire | Projectiles travel toward the pointer |
| Empty a magazine | Automatic reload begins when reserve ammunition exists |
| Fire with an empty magazine | Emergency melee strike activates before or during reload |
| Press `X` or right click | Melee arc damages close enemies and removes nearby enemy projectiles |
| Press `R` | Current weapon reloads without exceeding magazine capacity |
| Clear a room | Evidence chest and exit portal appear |
| Open chest | A weapon with a visible random quality appears |
| Pick up first weapon | Empty second slot receives it and becomes active |
| Pick up with full inventory | Active weapon is exchanged with the floor weapon |
| Press `Q`, `1`, or `2` | Valid weapon slot becomes active |
| Collect drops | Health, ammunition, or funding changes correctly |
| Press `E` | Selected character's ability activates and enters cooldown |
| Press `Shift` | Player dashes and briefly avoids damage |
| Reach room five | Final Committee and boss health bar appear |
| Defeat boss and use portal | Three permanent talent choices appear |
| Choose a talent | Effect applies and the next floor starts |
| Clear any room and use portal | Ten-pet shop opens with the current Funding total |
| Buy a pet | Funding decreases and the pet joins the HUD and arena |
| Upgrade a pet | Its level increases up to level 5 and its ability improves |
| Reach floor 100, room 5 | Final boss can be defeated normally |
| Use the final portal | Thesis explosion, paper fragments, and completion result appear |
| Integrity reaches zero | Game-over result appears |
| Finish a run | Best score is stored in `localStorage` |
| Use mobile controls | All essential actions remain available |
| Place obstacles between enemy and player | Enemy computes a route around the obstacle instead of remaining against the wall |

### Automated and static checks

- `node --check thesis-defense.js` verifies JavaScript syntax.
- A headless Chrome load checks browser execution and DOM initialization.
- Automated Chrome input starts the game, moves, fires, changes ammunition, damages enemies, updates score and health, and records runtime console errors.
- `git diff --check` checks whitespace and patch consistency.
- Desktop and narrow responsive layouts are reviewed through browser screenshots.

## 8. Challenges

### Combat readability

Weapon quality, enemy type, bullets, pickups, and room props can compete visually. The game uses consistent quality colors, separate enemy silhouettes, glows, health bars, a boss bar, particles, and restrained screen shake.

### Balance

Fast weapons need lower projectile damage, while slow weapons need stronger impact and special behavior. Balance values are stored in `weaponBases`, `qualities`, and `enemyTypes` so playtesting changes do not require structural rewrites.

### Responsive controls

Desktop players can aim independently with a mouse. Touch players receive auto-aim and dedicated pickup, swap, reload, dash, skill, and fire buttons. The Canvas keeps a fixed logical resolution while CSS scales the display.

## 9. Limitations and Future Work

- Balance is currently based on developer playtesting rather than a large player sample.
- Best scores remain local to one browser.
- Future versions could add weapon comparison panels, more boss designs, sound settings, controller support, and accessibility options.

## 10. Reflection

The AI agent was most useful for translating a broad gameplay request into data structures, state transitions, and testable interactions. Human judgment remained necessary for scope, originality, visual style, balance, and deciding which mechanics supported the assignment rather than merely adding complexity.

The final project goes beyond a small classroom prototype. It contains a complete room loop, loot progression, two-slot inventory, weapon quality generation, reloading, collision-aware level layouts, bosses, permanent upgrades, responsive controls, persistent scoring, documentation, and a repeatable testing process.
