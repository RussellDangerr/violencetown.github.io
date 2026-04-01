# Violencetown

A browser-based roguelite set in a procedurally generated city that shifts over time. You are a taxi driver. Things have gone wrong.

## Play

Open `game/index.html` in a browser. No build tools, no dependencies — just load and go.

### Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move (hold two for diagonal) |
| Space | Execute tick now |
| E | Pick up items |
| Esc | Cancel queued action |
| P | Pause |

## How It Works

- **Tick-based:** You have 10 seconds to queue an action, then the world resolves. Or hit Space to resolve immediately.
- **Procedural city:** Infinite chunk-based map with 5 biomes — Stealville, Sludgeworks, The Glow, Downtown, Outskirts.
- **City shifting:** Buildings regenerate every 600 ticks. Nothing is permanent.
- **Flat combat:** 100 HP, flat damage, flat armor reduction. No dice rolls, no misses. You always hit.
- **localStorage saves:** No accounts, no login. Just play.

## Project Structure

```
game/               # The game
  index.html          # Game page (splash + UI)
  main.js             # Game loop, tick timer, input, save/load
  map.js              # Procedural chunk-based city generation
  player.js           # Player state, movement, actions
  ui.js               # Canvas rendering, DOM panels
  data.js             # Tiles, biomes, items, building types
  utils.js            # Seeded RNG, simplex noise
  combat.js           # Flat HP/damage/armor system
  style.css           # Game styles
  particles.html      # Standalone particle sim demo
  PLAN.md             # Unified development plan
  ROADMAP.md          # Feature roadmap and priorities

plans/              # Feature briefs and research
index.html          # Portfolio site
crawler/            # Fast food deals crawler
deals/              # Deals frontend
```

## Development

See `game/PLAN.md` for the phased development plan and `GAME_STUDIO_PLAN.md` for the 4-gate pipeline.

All feature work follows the gate pipeline defined in `GAME_STUDIO_PLAN.md`.
