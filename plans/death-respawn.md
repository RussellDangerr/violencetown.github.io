# Feature: Death & Respawn
**Phase:** Phase 2 — Life in the City
**Priority:** High
**Status:** Research

---

## Gate 1: Research & Discovery

### Genre References

1. **Hades** — Death IS the game loop. You die, you're back at the hub, you had a conversation, you go again. Death never feels like punishment — it feels like progress. The hub (House of Hades) is where story happens. Violencetown's gas station could serve this role.

2. **Spelunky** — Permadeath with persistent knowledge. You lose your items, your level progress, your shortcuts-in-progress. But YOU the player learned something. The next run is better because you're better, not because your character is stronger. Pure roguelike.

3. **Cataclysm: Dark Days Ahead** — True permadeath. Your character dies, the world continues. You can start a new character in the same world. The world has memory even if your character doesn't. Could apply to Violencetown's persistent procedural city.

4. **Enter the Gungeon** — Death sends you to a brief summary screen showing what you accomplished, then back to the hub. The turnaround is fast — you're never more than 15 seconds from playing again. Speed of restart directly correlates with willingness to take risks.

5. **Risk of Rain 2** — Death shows a stats screen (time survived, kills, items collected, distance traveled). This makes death feel like a complete story with a conclusion, not just a failure state.

### Player Experience Goal

"Dying feels like the end of a story, not the loss of progress — you're back at the gas station with a new hand of cards before you can feel frustrated."

### Technical Feasibility

**Affected Modules:**
- `player.js` — Death trigger when HP ≤ 0. Need `isDead()` check, death state flag. On respawn: reset HP to 100, clear action queue, set position to gas station (or origin spawn). Inventory cleared (when inventory exists)
- `main.js` — Tick resolution needs to check for player death after damage. Death triggers a state transition: running → dead → menu/respawn. Game loop pauses during death screen. Save cleared or updated on death (depending on permadeath vs. soft death design)
- `ui.js` — Death screen overlay: "You died." + run stats + respawn prompt. Could reuse the splash screen pattern (full-screen overlay with click-to-continue). Stats: ticks survived, tiles explored, items picked up, NPCs killed
- `map.js` — On respawn: reload chunks around new spawn point. Player's dropped items remain in the world (death loot). Previous chunks continue to exist with their current state
- `data.js` — Death messages array (flavorful: "The sludge got you.", "A rat finished what the city started.")

**Known Constraints:**
- No inventory system yet (Phase 3), so "dropping items on death" is theoretical until then. For Phase 2 MVF, death just resets player state
- Save system is single-slot. Death either clears the save (permadeath) or resets player within the same world. Need to decide which
- The gas station at (0,0) is the natural respawn point — it never regenerates, it's always there
- Current game state machine: splash → start → running. Death adds: running → dead → (menu or running)

**What Already Exists:**
- Player has `hp` and `maxHp` fields
- Splash screen overlay pattern (full-screen div, click to dismiss)
- Gas station at fixed position (chunk 0,0, tile 14,17)
- Save/load with localStorage (can be cleared for permadeath)
- "New Game" button already clears save and reloads
- Text log for death messages
- Tick counter for "ticks survived" stat

### Scope — Minimum Viable Feature

**In scope:**
- Player death when HP reaches 0
- Death screen overlay showing:
  - Flavorful death message (random from pool)
  - Run stats: ticks survived, distance traveled (manhattan from spawn)
  - "Return to Gas Station" button
- On respawn:
  - HP reset to 100
  - Position reset to gas station (14, 17 in chunk 0,0)
  - Action queue cleared
  - Tick counter continues (world time doesn't reset)
  - World state persists (chunks, NPC positions, ground items unchanged)
- Save updated with respawned player state (not deleted — world persists)
- Death logged in text log with flavor message

**Out of scope for this pass:**
- Permadeath (full world reset on death) — may add as a mode later
- Item dropping on death (needs inventory system)
- Death penalties (stat loss, reputation loss, currency loss)
- Corpse/gravestone at death location
- Death replay or kill cam
- Multiple lives or revive mechanics
- Death-triggered world events (The Duke reacting, faction shifts)
- Run history or lifetime stats across deaths
- Respawn point selection (always gas station for now)

### Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Death feels punishing without progression** | High | Phase 2 has no meta-progression yet. Mitigate with: fast respawn (under 5 seconds from death to playing), world persistence (your exploration remains), and entertaining death messages. True meta-progression comes in later phases. For now, the fun is in the stories each run creates. |
| **World state inconsistency on respawn** | Medium | When the player respawns at the gas station, chunks around the death location may still be loaded with stale NPC states. Solution: on respawn, unload all chunks except gas station, let the chunk loader rebuild the 5×5 grid around the new position. NPCs in unloaded chunks freeze as normal. |
| **Death during save corruption** | Low | Death triggers a save (respawned state). If the browser closes mid-death-screen, the old save (with low HP) loads on restart. Player would just die again immediately. Mitigation: save the respawned state BEFORE showing the death screen, so the save is always in a playable state. |

---

## Open Questions (For Gate 2)

- Permadeath mode? Or always soft-death with world persistence?
- Should the death screen show the origin story summary? ("The Stealville Street Kid survived 47 ticks...")
- Should there be a brief "ghost" period where the player can see the world but not act?
- Does the world change while the death screen is showing? (Ticks continue? Or paused?)
- Should death location be marked on the map for the next run?
- How many death messages to write? 10? 20? Biome-specific?
