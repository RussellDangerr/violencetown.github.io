# Feature: Ground Items & Inventory Foundation
**Phase:** Phase 2 — Life in the City (foundation) / Phase 3 — The Bag (full system)
**Priority:** High
**Status:** Research

---

## Gate 1: Research & Discovery

### Genre References

1. **Cataclysm: Dark Days Ahead** — Ground items are a first-class part of the world. Items pile up on tiles, have weight and volume, and persist. You can see items on the ground, examine them, pick them up selectively. The ground IS an inventory — your first storage solution before you find a bag.

2. **Nethack** — Items on the ground are visible as characters, stackable, and interactive. You can kick them, throw them, step on them. Ground items are not just loot — they're part of the tactical landscape. A potion on the ground can be thrown by a monster.

3. **Brogue** — Items glow on the ground, drawing the player's eye. Minimal UI — you see the item, you step on it, you get a prompt. No dedicated "loot screen." The simplicity keeps the pace fast while still making loot feel rewarding.

4. **Diablo (original)** — Items on the ground have distinct visual identities. Gold vs. weapons vs. potions are all immediately distinguishable. The "click to pick up" loop is satisfying because identification is instant. Violencetown's character-based rendering can achieve this with distinct chars and colors.

5. **Dungeon Crawl Stone Soup** — Autopickup system handles mundane items, manual pickup for decisions. The game respects player time by not making them manually grab every piece of gold. For a tick-based system, this matters — spending a tick to pick up junk feels bad.

### Player Experience Goal

"Items on the ground tell the story of what happened here — and picking up the right thing at the right time turns a bad situation around."

### Technical Feasibility

**Affected Modules:**
- `map.js` — Ground items ALREADY EXIST. `chunk.groundItems` is an array of `{x, y, itemId}`. Items spawn during chunk generation via biome loot tables. `getGroundItems(wx, wy)` returns items at a position. `removeGroundItem(wx, wy, itemId)` removes on pickup. This system works.
- `player.js` — Pickup action already exists in the action queue (`type: 'pickup'`). `resolveActions()` calls `map.removeGroundItem()` and logs a message. BUT: picked up items go nowhere. There is no inventory. The item is removed from the ground and vanishes.
- `data.js` — 10 items defined with full metadata: id, name, char, tags, damage/heal/fuel values. Ground loot tables per biome with weighted distribution. Building classes with loot potential (high/medium/low). This is solid.
- `ui.js` — Ground items rendered on canvas as yellow characters. Items on the player's tile reported in the log ("You see a Rusty Pipe here."). This works.
- `main.js` — No changes needed for ground item improvements. Save/load already serializes chunk.groundItems.

**Known Constraints:**
- No inventory system. This is the big one. Items can be picked up (removed from ground) but have nowhere to go. Phase 3 introduces the 2D bag grid, but Phase 2 needs a bridge solution
- Multiple items can exist on the same tile — rendering shows the last one. Should show all or the most valuable
- Ground items persist in saved chunks (3×3 around player). Items in distant chunks are lost when chunks unload and regenerate. This is by design (shifting city), but means loot is ephemeral
- The E key pickup action grabs the first item at the tile. No selection if multiple items exist

**What Already Exists:**
- Complete ground item spawn system (map.js: `_spawnGroundItems`, loot tables, building loot potential)
- Ground item rendering on canvas (ui.js: yellow item chars)
- Pickup action in player action queue (player.js)
- Item removal from ground (map.js: `removeGroundItem`)
- Item detection messages ("You see a [item] here")
- 10 item definitions with gameplay-relevant metadata
- Save/load includes ground items per chunk

### Scope — Minimum Viable Feature

**In scope (Phase 2 bridge):**
- Simple inventory: player carries a list of items (no grid, no weight, no limit — just a list). This is the bridge until Phase 3's bag system
- `player.inventory = []` — array of item IDs
- Pickup action moves item from ground to player inventory
- Inventory display in status panel or a simple list
- "Drop" action: remove from inventory, place on ground at player position
- Equipped weapon: first weapon-tagged item in inventory is auto-equipped for combat
- Item use: consume bandage (heal), use matches (future), etc.
- Multiple items on one tile: log shows all items, pickup prompt if more than one (or pick up all)
- Inventory persisted in save data (player.toJSON includes inventory)

**Out of scope for this pass:**
- 2D grid inventory (Phase 3: The Bag)
- Bag damage system (Phase 3)
- Item weight or volume limits
- Crafting or combining items
- Item stacking (each item is individual)
- Item quality/condition
- Item comparison UI
- Vendor/trade system
- Item tooltips or detailed inspection
- Autopickup rules

### Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Bridge inventory conflicts with Phase 3 bag system** | Medium | Keep the bridge inventory dead simple: an array of item IDs. When Phase 3 ships the 2D grid, migrate by placing bridge inventory items into bag slots. The simpler the bridge, the easier the migration. No complex features on a throwaway system. |
| **Items vanishing in unloaded chunks** | Low | This is by design — the city shifts. But players may not understand why loot disappears. Mitigation: log message when chunks regenerate ("The city shifts. Distant streets rearrange themselves."). The gas station (0,0) never regenerates — it's the safe stash point. |
| **Save data growth with inventory** | Low | Player inventory is a small array of item IDs. Even 50 items × 4 bytes = 200 bytes. Negligible. Ground items per chunk are already saved. No risk here. |

---

## Open Questions (For Gate 2)

- Bridge inventory capacity limit? Or truly unlimited until Phase 3?
- How does dropping items interact with the shifting city? If you drop items in a chunk that regenerates, they're gone — is that communicated?
- Should the gas station have a "stash" mechanic? (Items placed at gas station persist forever since it never regenerates)
- Multiple items on one tile: pick up all with one action, or one per tick?
- Should items on the ground have a "freshness" — items from the current era vs. regenerated items?
- How does inventory display work in the status panel? Scrollable list? Fixed slots?
