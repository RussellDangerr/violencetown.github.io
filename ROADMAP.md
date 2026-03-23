# Violencetown Roadmap

## Phase 1 — The Bones ✅
- Tick timer (10s, Space to execute), infinite procedural city
- Chunk-based generation (32x32), simplex noise biomes
- Diagonal movement with squeeze-through
- Canvas tile map, biome color palettes, text log
- **Done when:** Walk infinitely through different neighborhoods on a tick timer.

## Phase 2 — Life in the City
- NPCs from all 4 factions populate the map, move, patrol, react
- On-map combat: queue attack toward adjacent NPC
- Death = displacement (random respawn, lose some items)
- The Duke at the gas station with dialogue
- Items on ground, basic fog of war (line of sight)
- **Done when:** Encounter clowns, get mugged by bandits, fight thugs, meet The Duke, die a few times. City feels populated.

## Phase 3 — The Bag and Improvisation
- 2D inventory grid (6x4), bag damage (holes, fire, sludge corrosion)
- Tag-based combination system with UI hints (not hidden crafting)
- Environmental interaction: shove furniture, throw objects, barricade doors
- Shoestraction (shoes + motor = decoy)
- **Done when:** Grab shoes, combine with motor, throw shoestraction to distract guards, barricade a door, watch your bag catch fire from a molotov.

## Phase 4 — Noise, Light, and Stealth
- Noise propagation system (actions have noise values, NPCs investigate)
- Light levels, fog of war tied to light, dark tiles = hiding
- Sound weapons: air horns, firecrackers, speakers
- Deafness/blindness as status effects
- Full hit-and-run loop supported
- **Done when:** Sneak through dark alley, hear footsteps around a corner, throw firecracker to distract, sprint in, grab loot, escape unseen.

## Phase 5 — The Taxi and Factions
- Taxi parts (engine, wheels, armor, battery, radio, mounted weapon)
- Garage UI, driving = multi-tile movement per tick, run over NPCs
- Duke's missions via radio, Duke rides along (powerful but attracts heat)
- Faction reputation system
- Zone-specific mechanics active (Stealville theft, Sludgeworks corrosion, Glow radiation overcharge)
- Cryptids in UnHoused territory, circus bears on bouncing balls in Clown territory
- **Done when:** Drive armored taxi through Clown territory, pick up The Duke, complete a mission, see faction rep shift.

## Phase 6 — Entropy and Polish
- Entropy events every ~60 ticks (sludge floods, faction raids, building collapses, blackouts, fires)
- Day/night cycle
- Procedural audio (Web Audio API)
- Content expansion (more items, NPCs, combinations, building templates)
- **Done when:** 20 minutes of play feels like a story happened to you that you didn't plan.

## Future — Godot Migration
- Rebuild in Godot for built-in physics, tilemaps, lighting, pathfinding, shaders
- Export to HTML5 (WebAssembly) — same browser-based "click and play" distribution
- Visual map editor replaces pure code generation
- GPU-accelerated lighting for noise/light systems

## Future — Mobile Controls
- Swipe to input movement direction
- Tap to resolve tick (replaces spacebar)
- Virtual d-pad fallback option

## Verification
Each phase: open via `python -m http.server`, play for 5+ minutes, verify the "done when" condition. The game should be playable and interesting after every phase, not just the last one.
