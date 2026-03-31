# Feature: NPC Spawning & AI
**Phase:** Phase 2 — Life in the City
**Priority:** Critical
**Status:** Research — EXPANDED SCOPE (2026-03-30)

> **Design Evolution Note (2026-03-30):**
> Core NPC spawning and AI plan survives intact. NPCs still spawn per-chunk, use simple behavioral states, and act on the game's turn system.
>
> **What's new:** If Loot Redistribution (ABC Cat. 4B) is chosen, NPCs gain the ability to PICK UP and EQUIP player-dropped gear on death. This adds: equipment state per NPC, visual equipment rendering on NPCs, NPC power scaling based on equipped gear. A bandit who picks up a Legendary Frying Pan and three Fire Rings becomes a visible, terrifying area boss.
>
> **What's also new:** "Creatures" (playable characters) are now a distinct category from enemy NPCs. Parked creatures (ABC Cat. 7) behave as NPCs when the player isn't controlling them. The NPC system may need to handle both hostile enemies AND friendly parked player creatures.
>
> **Depends on:** ABC Decision Matrix Category 4 (Death/Loot), Category 5 (World Persistence), Category 7 (Parking).
> **See:** `plans/abc-decision-matrix.md`

---

## Gate 1: Research & Discovery

### Genre References

1. **Cataclysm: Dark Days Ahead** — NPCs spawn per-chunk during world generation and persist. Each NPC has simple behavioral states (idle, wander, hunt, flee). The world feels alive because NPCs act on the same tick system as the player. Zombies bash doors, animals hunt each other, NPCs loot.

2. **Dwarf Fortress** — Creatures have needs, relationships, and behavioral trees, but at the lowest level it's simple state machines. The emergent complexity comes from many simple actors interacting, not from any single AI being clever. A rat eating cheese IS the simulation.

3. **Brogue** — Monsters have 2-3 behaviors max (approach, attack, flee at low HP). Pack behavior emerges from simple rules. Allies follow, enemies chase, and the dungeon ecology creates drama without complex AI. Proves you don't need much.

4. **Cogmind** — NPCs patrol predefined routes and react to stimulus (noise, sight). The AI is predictable enough that players can plan around it, which makes stealth meaningful. Relevant for Violencetown's Phase 4 noise system.

5. **UnReal World** — NPCs exist in the world simulation 24/7, not just when the player is nearby. Animals migrate, villagers go about routines. The chunk-based approach means NPCs in loaded chunks act; those in unloaded chunks are frozen. Matches Violencetown's chunk architecture perfectly.

### Player Experience Goal

"The city is alive whether you're watching or not — rats eat cheese, thugs patrol alleys, and every chunk you load tells a story that happened without you."

### Technical Feasibility

**Affected Modules:**
- `map.js` — NPCs must be spawned during chunk generation and stored per-chunk (like `groundItems`). Needs `chunk.npcs` array. NPCs have world positions, must be tracked when chunks load/unload. The chunk load/unload system (VIEW_RADIUS=2) determines which NPCs are "active"
- `data.js` — NPC type definitions: name, char, color, hp, armor, damage, speed, behavior type, spawn biome, loot table on death. Similar structure to existing ITEMS but with AI metadata
- `player.js` — Player needs to detect adjacent NPCs for combat targeting. Movement into an NPC-occupied tile should trigger combat (or be blocked)
- `ui.js` — NPCs rendered on canvas at their tile positions. Need distinct characters and colors per type. Must render on top of tiles but below/alongside items. Log messages for NPC actions visible to the player
- `main.js` — Tick resolution must process NPC actions after player actions. Each active NPC gets one action per tick (within loaded chunks only)
- New file: `npc.js` — NPC class with state machine, action resolution, pathfinding (simple: toward/away from player)

**Known Constraints:**
- Chunk-based world: NPCs only act when their chunk is loaded. This is fine — it's how CDDA and similar games work. NPCs in unloaded chunks are frozen
- 10-second tick: NPCs get one action per tick, same as the player. This keeps the simulation manageable
- Performance: With VIEW_RADIUS=2, up to 25 chunks can be loaded (5×5). If each chunk has 3-5 NPCs, that's 75-125 NPCs resolving per tick. At one action each with simple AI, this is trivially fast in JS
- Canvas rendering: 21×21 viewport. Only NPCs within the viewport need to be drawn. NPCs outside the viewport but in loaded chunks still act (off-screen sounds/events could be logged)
- Seeded RNG: NPC spawns during chunk generation must use the world seed for determinism. NPC behavior (which direction to wander) should also use seeded RNG

**What Already Exists:**
- Chunk generation pipeline in map.js (tiles, groundItems, biome assignment)
- Ground item spawn system with biome-weighted loot tables — NPC spawning can follow the same pattern
- Tile walkability checks (used by player movement — NPCs need the same)
- Text log for NPC action messages
- 10 item types that can serve as NPC loot drops

### Scope — Minimum Viable Feature

**In scope:**
- NPC data definitions in data.js: Rat, Stray Dog, Thug, Sludge Crawler, Glow Beast (one per biome)
- NPC spawning during chunk generation (biome-appropriate, density-controlled)
- NPC storage per chunk: `chunk.npcs = [{type, x, y, hp, state}]`
- 3 behavior states: IDLE (stay put), WANDER (move to random adjacent walkable tile), HOSTILE (move toward player if within detection range)
- One action per NPC per tick, processed after player
- NPCs rendered on canvas with type-specific character and color
- NPCs block player movement (can't walk through them)
- NPC persistence in save/load (serialize chunk.npcs alongside chunk.groundItems)
- Rat + cheese interaction: rat deals 1 damage/tick to cheese item on its tile, cheese "HP" depletes, visual feedback in log

**Out of scope for this pass:**
- NPC pathfinding beyond "move toward/away from player" (no A*, no obstacle avoidance)
- NPC-to-NPC interactions (beyond rat+cheese)
- Faction system or NPC allegiances
- NPC dialogue or interaction menu
- NPC respawning after death
- Pack behavior or group AI
- Noise-based detection (Phase 4)
- Named/unique NPCs (The Duke is a separate feature)
- NPC inventory or equipment

### Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| **NPC state bloating save data** | Medium | Keep NPC state minimal: type ID, position, current HP, behavior state. Everything else derived from type definition at load time. Estimate: 5 NPCs × 25 chunks × ~50 bytes = ~6KB. Trivial for localStorage. |
| **NPC movement conflicts** | High | Two NPCs wanting to move to the same tile, or an NPC wanting to move where the player is. Solution: process player first, then NPCs in order. Each NPC checks current tile occupancy before moving. If blocked, skip (IDLE for one tick). Simple and deterministic. |
| **Performance with many active NPCs** | Low | 125 NPCs max in loaded chunks, each doing one simple action per tick (check state, pick direction, validate tile, move). This is microseconds of work. Not a real risk, but worth profiling after implementation to confirm. |

---

## Open Questions (For Gate 2)

- Should NPCs have a "detection range" for hostile behavior? (e.g., thug only chases if player is within 5 tiles)
- Do NPCs wander between chunks, or are they bound to their spawn chunk?
- Should dead NPCs leave corpses (as ground items/tiles) or just disappear + drop loot?
- How does the rat+cheese mechanic work exactly? Is cheese a special ground item with HP? A tile type?
- Should NPC actions be visible in the log even when off-screen? ("You hear something scurrying nearby...")
- Spawn density per biome: how many NPCs per chunk? Should this scale with biome danger level?
