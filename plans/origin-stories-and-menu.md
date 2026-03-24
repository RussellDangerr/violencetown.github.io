# Feature: Origin Stories & Menu Screen
**Phase:** Phase 2 — Life in the City
**Priority:** High
**Status:** Research

---

## Overview

The game needs to feel like the old days — you open it, you're playing. No friction. The menu screen, origin selection, and session management all work together to get the player into the world fast while giving each run a unique identity.

---

## Feature 1: Origin Stories

**Player Experience Goal:** "Every run starts with a different hand of cards — where you are and what you're holding shapes how you play."

### Design Notes
- On new game, the player selects (or is assigned) an origin
- The origin determines:
  - **Starting location** — drops you in a specific biome/neighborhood on the map
  - **Starting items** — a random assortment of randomly generated items, including some valuable crafting supplies
- Item generation should pull from biome-appropriate loot tables but with origin-specific weighting
- Some origins might start you with a strong weapon but no consumables, others with great crafting materials but nothing to defend yourself
- The randomness within each origin keeps replayability high — same origin, different hand every time

### Questions to Resolve in Design Phase
- How many origins? (Suggestion: one per biome — Stealville street kid, Sludgeworks scavenger, Glow mutant, Downtown hustler, Outskirts drifter)
- Are origins purely mechanical or do they come with flavor text / backstory?
- Do origins affect faction reputation starting values?
- How does origin interact with The Duke and the gas station anchor?

---

## Feature 2: Instant Session Management

**Player Experience Goal:** "Open the game, you're playing in 2 seconds. Your old run is right where you left it, or a new one is one click away."

### Design Notes
- LocalStorage already handles save/load — this is about the UX flow
- On launch, detect if a saved session exists:
  - **Session found:** Show option to continue OR start new (no mandatory menu crawl)
  - **No session:** Drop straight into origin selection → play
- "Continue" should feel instant — load state, render map, go
- "New Game" should feel almost as fast — pick origin, generate, go
- No unskippable intros, no mandatory tutorials, no loading screens that aren't actually loading
- The splash screen flavor text can stay but should be skippable with any key

### Technical Notes
- Current save system: LocalStorage with world seed, player state, nearby chunks
- Need to version saves so old sessions can be detected as incompatible gracefully
- Multiple save slots are NOT needed — one active run at a time fits the roguelike model

---

## Feature 3: Starting Zone NPCs — Rats & Cheese

**Player Experience Goal:** "Before you fight anything dangerous, you see how the world works by watching a rat eat cheese."

### Design Notes
- Several NPCs populate the area around every starting zone
- **Rats nibbling on cheese** serve as the player's first encounter with the damage system:
  - The rat is actively eating (taking bite damage from... itself? the cheese? environmental tick?)
  - Player can see **damage numbers** floating or logged as the rat eats
  - Player can see **structural change** — the cheese visually depletes, the rat's state changes
  - This teaches the combat system passively — the player sees numbers and cause/effect before they're involved
- Rats are low-threat NPCs the player can engage to test combat themselves
- Other starting zone NPCs could include stray dogs, pigeons, or wandering civilians depending on biome

### Why Rats + Cheese
- Universal game language — players understand rats as tutorial enemies
- Shows the damage system is always running, not just player-triggered
- Demonstrates that the world has its own life happening around you
- Gives the player agency: watch, or intervene

---

## Feature 4: Menu Screen — Gas Station & Identity

**Player Experience Goal:** "The menu screen IS the game world. You're already there."

### Design Notes
- The menu screen renders the **gas station** (already exists at 0,0) as a stylized scene
- The gas station asks two questions:
  1. **"Where do you want to go?"** — This selects the origin/starting biome
  2. **"Who are you?"** — This gives the player a name/identity for the run (could be a selection from generated options or freeform)
- These two answers define the run: place + identity
- The combination should feel quick — two choices, then you're in

### Idle Animation: Rat Eating Cheese
- On the menu screen, a rat is visibly nibbling on a piece of cheese near the gas station
- This is the idle animation — it loops, it's charming, it sets the tone
- It also foreshadows the in-game rat mechanic (starting zone NPCs)
- Could be rendered on the existing canvas or as a simpler animated element on the splash screen

### UI Flow
```
[Game Opens]
    |
    v
[Gas Station Menu Screen]
  - Rat eating cheese (idle animation)
  - "Continue Run" button (if save exists)
  - "Where do you want to go?" (origin/biome select)
  - "Who are you?" (identity input)
  - [Go] → drops into game
```

---

## Integration Considerations
- Origin stories feed into: player.js (starting state), map.js (starting position), data.js (origin definitions, loot tables)
- Session management: main.js (save detection, flow routing)
- Rats/NPCs: Requires Phase 2 NPC system — this feature DEPENDS on NPCs existing first
- Menu screen: ui.js or a new menu.js module, canvas rendering of gas station scene
- The rat idle animation could be a lightweight canvas animation separate from the full game renderer

## Out of Scope (For Now)
- Multiple save slots
- Character customization beyond origin + name
- Rat breeding or pet systems
- Gas station as a shop (that's Phase 5 Duke territory)
