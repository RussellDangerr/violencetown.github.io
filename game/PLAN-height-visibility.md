# Height Visibility — Research Plan (Gate 1)

**Status:** Research / Discovery
**Feature:** Camera fog-of-war system that highlights usable items based on the player's current height plane

---

## Problem Statement

In a 2D top-down game with verticality (tables, counters, shelves, fridge tops, rafters), the player needs to understand what they can interact with at their current elevation. When you climb on a table, the ceiling fan and the apple basket on the fridge become reachable — but items on the ground become less relevant. The camera and lighting should communicate this naturally, without UI overlays or text prompts.

**Core question:** How do we make height-plane context feel intuitive through visual treatment alone?

---

## Design Intent

- Standing on a table should feel like a new vantage point, not just a position change
- Reachable items at the player's height should glow, brighten, or sharpen into focus
- Items on other planes (above or below) should dim, blur, or fade — not disappear
- The system should feel like fog of war but vertical: "height fog"
- No HUD indicators — the camera does the talking

---

## Research Questions

### 1. Height Plane Model

- How many discrete height levels do we need? (ground / furniture / counter / tall-furniture / ceiling)
- Should height be continuous or bucketed into tiers?
- What defines a height plane — the surface you're standing on, or your reach envelope?
- Can items span multiple height planes? (e.g., a tall shelf is reachable from ground AND table)
- How does this interact with thrown items or ranged attacks?

**What to figure out:** Minimum viable height tier list for the starting zones (gas station, alley, apartment).

### 2. Reachability Rules

- When the player is at height H, which items are "usable"?
  - Same plane: always usable
  - One plane above: usable if close enough horizontally?
  - One plane below: usable (reach down)?
  - Two+ planes away: not usable, faded out
- Does the player's height affect combat? (Attacking from a table = advantage?)
- How do NPCs interact with height? Can the rat climb the table?

**What to figure out:** A simple reachability function: `canReach(playerHeight, itemHeight, horizontalDistance) → bool`

### 3. Camera / Rendering Treatment

- **Brightness shift:** Items on the player's plane render at full brightness; other planes dim proportionally to height distance
- **Fog of war approach:** Darken unreachable planes with a semi-transparent overlay, similar to RTS fog but driven by elevation not exploration
- **Focus/blur:** Apply a subtle blur or desaturation to non-active planes (like depth of field)
- **Glow/pulse:** Usable items at the current height get a subtle highlight or pulse when the player enters range
- **Parallax hint:** When climbing, shift non-active planes slightly to sell the height change

**What to figure out:** Which rendering technique works in a canvas/2D context without a shader pipeline. What's achievable with globalAlpha, compositing, and simple sprite tinting.

### 4. Transition Feel

- What happens visually when the player climbs onto a table?
  - Instant snap? (arcade feel — matches the flat damage system's no-nonsense vibe)
  - Short tween? (quarter-second fade between plane states)
  - Camera nudge? (slight zoom or vertical offset to sell the elevation change)
- Should there be a sound cue when height plane changes?

**What to figure out:** Whether the transition should be purely visual or also affect camera framing.

### 5. Technical Approach — Canvas 2D

Since the game is browser-based with canvas rendering:

- **Layer ordering:** Render items sorted by height plane, active plane on top
- **Alpha dimming:** `globalAlpha = 1.0` for active plane, `0.4–0.6` for adjacent, `0.2` for distant
- **Composite glow:** Use `globalCompositeOperation = 'lighter'` for usable-item highlights
- **No WebGL required:** All effects achievable with 2D canvas context and sprite tinting
- **Performance:** Only recalculate visibility when player height changes (event-driven, not per-frame)

**What to figure out:** Whether the existing particle sim canvas setup can be extended, or if the game renderer needs to be built separately with height-plane awareness from the start.

### 6. Reference Games / Inspiration

Research these for how they handle vertical visibility:

- **Binding of Isaac** — room-based but has elevation (flying vs ground)
- **Enter the Gungeon** — table flipping, height-based dodge mechanics
- **Hades** — depth layering in isometric space, visual hierarchy
- **Hotline Miami** — fog of war through walls, visibility as gameplay
- **Rain World** — vertical traversal with clear visual cues for climbable surfaces
- **Spelunky 2** — vertical level design with clear affordance signaling

**What to figure out:** Which game's approach to "you can reach this / you can't" translates best to our top-down 2D style.

---

## Open Questions (Parking Lot)

- Does height visibility affect enemy AI? (Enemies on the ground lose sight of you on a table?)
- Should the player be able to knock items off high surfaces to the ground?
- How does this interact with the origin story system? (Some origins start at different elevations?)
- Performance budget: how many height planes can we render distinctly before it becomes visual noise?
- Accessibility: dimming/blurring might not work for colorblind or low-vision players — need an alt mode?

---

## Next Steps (Gate 2 — Design)

Once research questions are answered:

1. Define the height tier list (3–5 tiers with names and examples)
2. Write the `canReach()` rule as pseudocode
3. Mockup the visual treatment (before/after screenshots or sketches)
4. Prototype the alpha-dimming approach in a standalone canvas test
5. Decide camera behavior on height transition

---

*This plan stops at Gate 1 — research and question-framing only. No implementation yet.*
