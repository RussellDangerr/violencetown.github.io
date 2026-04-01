# Feature: Game Zones — Static World Map
**Phase:** Foundational (replaces Phase 1 world generation)
**Priority:** Critical
**Status:** Research / Design
**Date:** 2026-04-01

---

## Design Pivot

This plan supersedes the procedural chunk-based generation system from Phase 1. Violencetown is no longer a roguelike with shifting city chunks. It is now a **hand-crafted 2D pixelated tile map** — static, authored, persistent.

### What's changing:
- **No procedural generation.** The world is designed, not generated.
- **No chunk regeneration.** The map doesn't shift or reset.
- **No roguelike mechanics.** No permadeath loop, no run-based structure.
- **Tile system stays.** The game is still tile-based, 2D, pixelated.
- **Simplex noise biomes are gone.** Zones are hand-placed, not noise-driven.

### What this resolves from the ABC Decision Matrix:
- **Category 5 (World Structure):** Effectively **Option C — Fully Persistent**, but hand-crafted rather than procedurally generated. The world is a fixed map.
- The "shifting city" identity is replaced by a **neighborhood identity** — each zone has a distinct look, feel, and resident creature.

---

## The Five Zones

Violencetown is divided into five distinct zones. Each zone is the home turf of a specific creature type. The zones together form a single contiguous map.

### 1. Town (City Center)
- **Resident creature:** Human
- **Role:** Player starting zone. The "normal" part of Violencetown.
- **Vibe:** Urban streets, buildings, shops, sidewalks. The most city-like area. This is the baseline that makes the other zones feel weird by contrast.
- **Tile palette:** Concrete, asphalt, brick, storefronts, streetlights, dumpsters.
- **Notes:** Town is central — the other four zones radiate outward from it. The gas station (existing spawn point) lives here.

### 2. Sewer
- **Resident creature:** Sewer Rat
- **Role:** Underground / drainage zone beneath or adjacent to Town.
- **Vibe:** Dark, wet, claustrophobic. Pipes, grates, standing water, tunnels. The Rat's domain — tight spaces that only small creatures navigate easily.
- **Tile palette:** Sewer grates, water channels, pipes, brick tunnels, muck, drains.
- **Notes:** Could connect to other zones via underground passages. Natural fit for the Rat's "fits through 1-tile gaps" ability from the ABC matrix.

### 3. Circus
- **Resident creature:** Clown
- **Role:** Entertainment district gone wrong.
- **Vibe:** Gaudy, colorful, unsettling. Big tops, funhouses, balloon stands, carnival games. Bright colors masking something sinister. Comedy-horror.
- **Tile palette:** Striped tents, confetti, carnival booths, popcorn carts, funhouse mirrors, balloon piles.
- **Notes:** The Clown's honk ability (from ABC matrix) is at home here. The zone should feel like a permanent carnival that nobody asked for.

### 4. Graveyard
- **Resident creature:** Skeleton
- **Role:** The dead part of town.
- **Vibe:** Tombstones, crypts, dead trees, fog, iron fences. Quiet and spooky. The Skeleton is a new creature — it belongs here.
- **Tile palette:** Gravestones, mausoleums, dirt paths, dead grass, iron gates, candles, fog tiles.
- **Notes:** Skeleton is a **new addition** to the creature roster (not in previous plans). Its "One Cool Thing" needs to be defined — could be related to bones, undeath, rattling, reassembly, etc.

### 5. Factory
- **Resident creature:** Robot
- **Role:** Industrial zone.
- **Vibe:** Machines, conveyor belts, smokestacks, metal walls, sparks. The Robot was built here. Mechanical and harsh.
- **Tile palette:** Metal floors, conveyor belts, gears, pipes, vats, control panels, catwalks, smokestacks.
- **Notes:** Natural fit for Robot's tech/machine identity. Could have hazards like machinery, electrical sparks, or crushing presses.

---

## Zone Layout Concept

```
            [ Graveyard ]
                 |
[ Factory ] — [ Town ] — [ Circus ]
                 |
            [  Sewer  ]
```

Town sits at the center. The four other zones surround it. The exact layout, zone sizes, and connection points are TBD during the map design phase. The Sewer could also function as an underworld layer connecting zones underground.

---

## Creature Roster (Updated)

| Creature | Home Zone | Status |
|----------|-----------|--------|
| Human | Town | Existing — player start creature |
| Sewer Rat | Sewer | Existing — from previous plans |
| Clown | Circus | Existing — from previous plans |
| Robot | Factory | Existing — from previous plans |
| Skeleton | Graveyard | **NEW** — not in previous creature roster |

### Creatures removed or on hold:
- **Zombie** — Previously in roster. Not assigned to a zone. Status TBD.
- **Beholdem** — Previously in roster. Not assigned to a zone. Status TBD.
- **Smooth Talker** — Previously in roster. Not assigned to a zone. Status TBD.

---

## Impact on Existing Systems

### What gets removed:
- Simplex noise biome generation (`map.js`)
- Chunk-based procedural generation
- Chunk regeneration timer (600-tick cycle)
- Era/seed-based deterministic generation
- The five noise-driven biomes (Stealville, Sludgeworks, The Glow, Downtown, The Outskirts)

### What stays:
- Tile rendering system (canvas, tile types, colors)
- Player movement on tile grid
- Tick system (pending ABC Category 1 decision)
- Save/load (simplified — no chunk cache, just player position + world state)
- Text log
- Ground items

### What needs to be built:
- Static map data (tile arrays for each zone, or a single large map file)
- Zone boundary definitions
- Zone-specific tile palettes and visual themes
- Map loading from authored data instead of procedural generation
- Potentially a map editor workflow (or just hand-edit tile arrays)

---

## Open Questions

1. **Map size:** How big is each zone? How big is the total map? Needs to feel explorable but not empty.
2. **Zone transitions:** Hard borders (walls/gates) or gradual blending?
3. **Sewer as underworld:** Is the Sewer a separate layer (underground) or a surface zone?
4. **Skeleton's One Cool Thing:** New creature needs a signature ability. Ideas: reassemble after death, throw bones, rattle to scare, immune to certain damage types, see in the dark.
5. **Creature population:** Do zones have NPC creatures of their type wandering around? (e.g., NPC skeletons in the graveyard, NPC clowns at the circus)
6. **Cross-zone creatures:** Can creatures from one zone wander into another, or are they bound to their home?
7. **Old creatures (Zombie, Beholdem, Smooth Talker):** Cut, or assigned to zones later?
