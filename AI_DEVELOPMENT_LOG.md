# AI Development Log

This log documents how an AI coding agent supported Assignments 3 and 4.

## Session 1: Repository inspection

**Goal:** Understand the existing GitHub Pages project.  
**AI contribution:** Inspected the file tree, Git history, homepage, stylesheet, and earlier reports.  
**Human decision:** Preserve the static deployment model and existing assignment archive.

## Session 2: Requirement decomposition

**Goal:** Turn the assignment screenshots into implementable features.  
**AI contribution:** Mapped Assignment 3 to online, local, IDE, and documentation deliverables. Mapped Assignment 4 Option A to character selection, controls, score, collision, and game-over systems.  
**Human decision:** Choose the "Defend Your Thesis" option and keep all demos accessible from one portfolio.

## Session 3: Agent architecture

**Goal:** Demonstrate multiple model deployments without committing secrets.  
**AI contribution:** Proposed a provider-adapter design and a deterministic browser baseline.  
**Human decision:** Keep API keys in memory only and clearly label the browser mode as non-LLM.

## Session 4: Game architecture

**Goal:** Build a stable, playable browser game.  
**AI contribution:** Implemented the state loop, entity collections, delta-time movement, collision detection, wave progression, particles, power-ups, and touch input.  
**Human decision:** Use simple geometric art and synthesized audio to avoid external asset and copyright dependencies.

## Session 5: Review and verification

**Goal:** Reduce regressions before deployment.  
**AI contribution:** Checked JavaScript syntax, internal links, responsive structure, and failure states.  
**Human decision:** Document unverified external requirements honestly. Ollama and online credentials are not represented as tested when they are unavailable.

## Important Prompting Pattern

The most useful prompts had four parts:

1. The concrete user outcome.
2. Current repository constraints.
3. Required behavior and edge cases.
4. A request to implement and verify, not merely suggest.

This produced more useful results than broad prompts such as "make a game" or "add AI."
