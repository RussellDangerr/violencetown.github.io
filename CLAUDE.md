Always develop on the dev branch. Always plan on the plan branch.

## Design Documents (in plans/)

- `plans/game-zones.md` — Master design doc: zones, creatures, bosses, elements, hazards, lore
- `plans/game-plan.md` — Unified dev plan with phase checklists
- `plans/game-roadmap.md` — Feature priority list
- `plans/decision-trees.md` — All design decisions (locked + deferred). Read this first.
- `plans/zone-room-sketches.md` — Tile layout concepts per zone
- `plans/height-visibility.md` — Height system research (backlogged)

## Locked Design Decisions

- **World:** 5 hand-crafted zones (Town, Sewer, Circus, Graveyard, Factory). No procedural generation. Fully persistent.
- **Movement:** Pixel Dungeon Hybrid — no timer, one tile per input, turn-based under the hood.
- **Creatures:** Zone-locked. Wererat (Sewer), Robot (Factory), Human (Town), Clown (Circus), Skeleton (Graveyard).
- **Death:** Arcade reset — fast respawn, low friction.
- **Elements:** Sludge, Goo, Bored, Fun, Death, Life. Status effects for prototype (visual buildup, no meter UI).
- **Rings/inventory:** Deferred. Not in prototype.
- **Height system:** Backlogged.

## Game Code

All game code lives in `game/`. The existing codebase has a working tick-based skeleton that needs to be rewritten for Pixel Dungeon hybrid movement and static map loading.

## Creative Boundaries

No AI-generated creative copy, art, dialogue, or character voice. Use [bracketed placeholders] for all player-facing text and descriptions. Claude helps with mechanics, systems, and architecture only.
