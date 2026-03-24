# Feature: Origin Stories & Menu Screen
**Phase:** Phase 2 — Life in the City
**Priority:** High
**Status:** Research

---

## Gate 1: Research & Discovery

### Genre References

1. **Caves of Qud** — Character creation IS worldbuilding. Your origin (True Kin vs. Mutant, village selection) determines starting location, gear, and abilities. Each origin feels like a different game for the first 30 minutes. The randomness within each archetype keeps replayability high.

2. **Hades** — No menu friction. You die, you're back in the hub, you pick your weapon, you go. The "menu" is a place in the game world. Conversations happen while you prep for the next run. Zero loading screens between decision and action.

3. **Spelunky 2** — Shortcut system lets experienced players skip to later areas, but starting from the beginning is the default. The game opens fast — press start, you're playing. Character selection is cosmetic but instant.

4. **Nethack** — Role/race/alignment selection creates hundreds of starting combinations from a simple menu. Each combination changes starting inventory and early strategy dramatically. Proves that origin diversity doesn't require complex UI.

5. **Risk of Rain 2** — Character select screen shows the world behind it. You're already looking at the environment while choosing. The menu IS the game — you just haven't started yet.

### Player Experience Goal

"Open the game, make two choices, and you're playing in under 10 seconds — but those two choices make every run feel different."

### Technical Feasibility

**Affected Modules:**
- `main.js` — Game state flow needs a new state between splash and play: origin selection. Currently goes splash → start → running. Needs splash → menu → running. Save detection logic for continue vs. new game
- `player.js` — Starting position must be set by origin (currently hardcoded to gas station 14,17). Starting inventory (currently empty — pickup exists but no inventory storage yet)
- `map.js` — Gas station at chunk (0,0) is the anchor point. Origins could start player at different world coordinates, but the gas station remains the narrative hub. Biome at starting position must match the origin
- `data.js` — Needs origin definitions: name, description, starting worldX/worldY, starting item table with weights. Biome loot tables already exist and can be leveraged for origin-specific starting gear
- `ui.js` — Menu screen rendering. Could reuse the canvas for a gas station scene, or use DOM overlay. Text log not needed during menu. Status panel hidden until game starts
- `style.css` — Menu screen styling, origin selection UI

**Known Constraints:**
- The gas station at (0,0) never regenerates — it's the fixed anchor. Menu screen can render it as the backdrop
- LocalStorage save system is simple (one slot). Continue/New Game detection is just checking if `violencetown_save` key exists
- No inventory system yet — starting items would go to ground at spawn point until Phase 3 inventory grid exists
- Canvas is 504x504px (21×21 tiles at 24px). Menu scene must work within this or use a separate rendering approach

**What Already Exists:**
- Splash screen with flavor text and "click to start" (index.html + style.css)
- Gas station defined at chunk (0,0) with special tiles (gas_pump, counter)
- 5 biomes defined with distinct palettes and loot tables
- 10 items with metadata (damage, heal, fuel, tags)
- Save/load system with localStorage
- "New Game" button that clears save and reloads

### Scope — Minimum Viable Feature

**In scope:**
- 5 origins, one per biome:
  - **Stealville Street Kid** — starts in Stealville, knife + bandage
  - **Sludgeworks Scavenger** — starts in Sludgeworks, crowbar + scrap
  - **Glow Mutant** — starts in The Glow, pipe + matches
  - **Downtown Hustler** — starts in Downtown, bottle + shoes
  - **Outskirts Drifter** — starts in Outskirts, fuel_can + bandage
- Gas station menu screen replacing current splash:
  - "Where do you want to go?" → origin/biome selection (5 choices)
  - "Who are you?" → text input for player name (or skip for random)
  - "Continue" button if save exists
  - Rat eating cheese idle animation (simple canvas loop or CSS animation)
- Instant session flow: detect save → show continue option or origin select → play
- Starting items placed on ground at spawn tile (until inventory exists)
- Origin stored in save data for display in status panel

**Out of scope for this pass:**
- Origin-specific faction reputation bonuses
- Backstory/lore text beyond a one-line description
- Multiple save slots
- Character customization (appearance, stats)
- Animated gas station scene with multiple elements
- Origin-specific tutorial sequences
- Unlockable origins

### Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Menu screen delays getting to gameplay** | High | Hard cap: two choices maximum. No scrolling, no pagination, no sub-menus. Five biome buttons + name input + Go. That's it. If it takes more than 10 seconds, it's too slow. |
| **Starting items without inventory** | Medium | Until Phase 3 inventory grid ships, starting items spawn on the ground at the player's feet. Player can pick them up with E (pickup action exists). Items go... nowhere useful yet, but the system is ready for when inventory arrives. This is acceptable for Phase 2. |
| **Save compatibility** | Medium | Origin data is new state. Old saves won't have it. Default to "Unknown Drifter" origin with gas station spawn for saves that predate origins. Version the save schema: add a `saveVersion` field, apply defaults for missing fields on load. |

---

## Open Questions (For Gate 2)

- Should origin selection be randomized? ("Here's your hand — play it" vs. player choice)
- Does the player name appear anywhere in gameplay? (Log messages, NPC dialogue?)
- Should the rat+cheese idle animation be canvas-rendered or a simpler CSS/DOM animation?
- How does origin interact with The Duke NPC when he's implemented?
- Should there be a "random origin" button for players who want maximum variety?
- Can the menu screen double as a death screen? ("You died. The gas station awaits. Where next?")
