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
- **Resident creature:** Wererat (Rat ↔ Wererat transformation)
- **Role:** Underground / drainage zone beneath or adjacent to Town.
- **Vibe:** Dark, wet, claustrophobic. Pipes, grates, standing water, tunnels. The Rat's domain — tight spaces that only small creatures navigate easily.
- **Tile palette:** Sewer grates, water channels, pipes, brick tunnels, muck, drains.
- **Notes:** Could connect to other zones via underground passages. Rat form fits through 1-tile gaps. Wererat form is too big — transformation has spatial consequences.

### 3. Circus
- **Resident creature:** Clown (Vampire Clown)
- **Role:** Entertainment district as vampire society. Think Vampire: The Masquerade but with a circus theme.
- **Vibe:** A permanent carnival that's actually a vampire court in disguise. The big top is their gathering hall. The funhouse is where they feed. Gaudy colors, greasepaint, and fangs. The "masquerade" is literal — they hide behind clown makeup and circus performance. Political intrigue under the big top. Coteries of clowns with territory and hierarchy. The circus never closes because vampires don't sleep.
- **Tile palette:** Striped tents, confetti, carnival booths, popcorn carts, funhouse mirrors, balloon piles, blood-red curtains, dim backstage areas, coffin-shaped prop boxes.
- **Notes:** The Clowns are vampires. The circus is their cover. The Masquerade-style social dynamics (clans, politics, feeding, maintaining the facade) play out in a circus setting. This gives the Circus zone depth beyond just "creepy carnival" — it's a functioning vampire society with its own rules. The Clown creature could have vampire abilities: blood drain, mesmerize, night vision, weakness to certain elements.

### 4. Graveyard
- **Resident creature:** Skeleton (Skeleton ↔ Zombie transformation)
- **Role:** The dead part of town.
- **Vibe:** Tombstones, crypts, dead trees, fog, iron fences. Quiet and spooky.
- **Tile palette:** Gravestones, mausoleums, dirt paths, dead grass, iron gates, candles, fog tiles.
- **Notes:** The Skeleton shifts to Zombie form when it takes damage. This zone is home to both forms — bones and rot. The graveyard should feel different depending on which form you're in.

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

| Creature | Home Zone | Transformation | Status |
|----------|-----------|----------------|--------|
| Human | Town | None | Existing — player start creature |
| Wererat | Sewer | Rat ↔ Wererat | **CHANGED** — was "Sewer Rat", now transforms |
| Clown | Circus | Vampire Clown | **CHANGED** — clowns are vampires, Masquerade-style circus society |
| Robot | Factory | None (yet) | Existing — from previous plans |
| Skeleton | Graveyard | Skeleton ↔ Zombie | **NEW** — transforms on health loss |

### Creature Transformations

**Wererat (Sewer)**
- Default form: **Rat** — small, fast, fits through tight spaces. The classic sewer rat.
- Transformed form: **Wererat** — larger, stronger, more dangerous. The beast comes out.
- Transformation trigger: TBD (combat? rage? lunar cycle? manual toggle? health threshold?)
- This replaces the old "Sewer Rat" creature entirely. The Rat form preserves the "fits through 1-tile gaps" ability. The Wererat form is the payoff — power at the cost of size/stealth.

**Skeleton ↔ Zombie (Graveyard)**
- Default form: **Skeleton** — bony, rattling, classic undead.
- Damaged form: **Zombie** — when the Skeleton takes enough damage, it shifts into Zombie form. Flesh and rot replace bone. Different stats, different feel.
- This elegantly merges Skeleton (new) and Zombie (previously in roster but unassigned) into a single dual-form creature. The Zombie isn't cut — it's the Skeleton's other half.
- Design questions: Does Zombie form have different abilities? Is the shift reversible (heal back to Skeleton)? Is Zombie stronger or weaker — a desperation mode or a berserker mode?

### Creatures on hold:
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
4. **Wererat transformation trigger:** What causes the Rat → Wererat shift? Combat? A cooldown ability? Health threshold? Moon phase?
5. **Creature population:** Do zones have NPC creatures of their type wandering around? (e.g., NPC skeletons in the graveyard, NPC clowns at the circus)
6. **Cross-zone creatures:** Can creatures from one zone wander into another, or are they bound to their home?
7. **Skeleton ↔ Zombie balance:** Is Zombie form stronger (berserker) or weaker (degraded)? Is the shift reversible by healing?
8. **Old creatures (Beholdem, Smooth Talker):** Cut, or assigned to zones later? Zombie is now merged into Skeleton's transformation.
