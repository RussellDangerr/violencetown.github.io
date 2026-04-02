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
- **Movement:** Phase-based turns — no timer, player queues actions across phases (Combine → Use → Move → Execute), then resolves. Card-game feel, combo depth.
- **Creatures:** Zone-locked. Wererat (Sewer), Robot (Factory), Human (Town), Clown (Circus), Skeleton (Graveyard).
- **Death:** Arcade reset — fast respawn, low friction.
- **Elements:** Sludge, Goo, Bored, Fun, Death, Life. Status effects for prototype (visual buildup, no meter UI).
- **Rings/inventory:** Deferred. Not in prototype.
- **Height system:** Backlogged.

## Game Code

All game code lives in `game/`. The existing codebase has a working tick-based skeleton that needs to be rewritten for Pixel Dungeon hybrid movement and static map loading.

## Version Control

Track version numbers for all sub-apps and major systems. Use `<meta name="version">` in HTML, comments in CSS/JS, and git tags as `{app}-v{X.Y.Z}`. Bump versions on meaningful milestones.

## Artist Credits

All purchased assets must be credited in the game. Maintain a running list here as assets are added:

- **LimeZu** (limezu.itch.io) — Modern Interiors, Modern Exteriors, Modern UI, Fungus Cave. License: edit/use freely, no redistribution, credit required.

When adding new asset packs, update this list immediately. Credits must appear in the final game (credits screen, about page, or similar).

## Asset Safety

Purchased assets live in `assets/` which is gitignored. NEVER commit, push, or redistribute raw asset files. The repo is public — raw assets in Git = piracy.

## Creative Boundaries

No AI-generated creative copy, art, dialogue, or character voice. Use [bracketed placeholders] for all player-facing text and descriptions. Claude helps with mechanics, systems, and architecture only.
