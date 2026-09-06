# Feature: The Visual Pass — attention as a state, and a canvas that lands on whole pixels

**Phase:** Polish — the threat overlay stops being wallpaper, and the whole game stops being
resampled at a fractional ratio.
**Priority:** High (Caelan, 2026-09-06: the overlay *"is pretty jarring, and I don't think the effect
is something we can leave on the live version"*).
**Status:** Design (approved 2026-09-06).
**Companions:** `plans/stealth-perception-and-thieve.md` (the perception layer this re-renders, and
the source of the toggle being retired here) · `plans/demo-readiness.md` (what a recruiter hits).

> **Decisions (Caelan, 2026-09-06):**
> - **The overlay's idea is right; its execution is not.** Keep the mechanic. Rebuild the look.
> - **Gate it on state.** The vignette is for combat; a negative haze is for enemies that are
>   *searching*. A calm town square draws nothing at all.
> - **It inverts when they actually find you.** The flip is the "you've been made" signal.
> - **Far quieter, and far less pixelated.**
> - **Fine dither, not smooth alpha** — chosen over a blurred mask so the anti-mud reasoning in
>   `renderer.js` survives intact.
> - **The canvas scaling fix is in scope this session**, accepting a slightly smaller canvas in
>   exchange for exact pixels.

---

## Why: what the instrumented session actually measured

Run on `main` @ `38a44c2` (v0.21.0), opening town square, DPR 1.5.

**The field covers half the screen.** 267 walkable tiles in view: 132 `DIRECT`, 19 `PERIPHERAL`,
116 safe. So `shadow` stipples 43% of the walkable floor and `danger` tints ~50% of it.

**And it is shading the wrong thing.** The watcher filter at `renderer.js:2624` is
`isAlive && !_ally && sightRange > 0` — "has eyes and isn't on your team." Of the nine watchers it
selects in the opening plaza:

| | count | detail |
|---|---|---|
| `fsmState: IDLE` townsfolk | 8 | five carry dialogue |
| of those, **vendors** | 2 | `townie-macc`, `townie-hooch` — both disposition **+18** |
| actually `HOSTILE` | **1** | `townie-knuckles`, disposition −28, sight 6 |

Half the plaza is shaded because the shopkeeper can see you, and the one person who would actually
jump you is drawn identically to the man selling you hooch.

**The grain is four times too coarse.** The Bayer sub-cell is `TILE_PX/4` = 8 logical px. A sprite
pixel is 2 logical px (16×16 art drawn at 32). So the stipple is built from blocks four art-pixels
wide, at `rgba(2,2,8,0.55)` — roughly a 55% luminance step. It does not read as shading because
structurally it is a foreign-resolution layer sitting on top of the art.

**And the whole canvas is resampled at a fractional ratio.** `renderer.js:102` fixes the backing
store at `CANVAS_PX * SS` = 608 × 2 = 1216. `style.css:218` then sizes it `height: 100%` of a
`min(100vh - 16px, 100vw - 16px)` box capped at 900 — fluid, and never aligned to the canvas. At the
measured DPR 1.5 that is 704 CSS px = 1056 device px, so 1216 → 1056, a ratio of **1.1515**. With
`image-rendering: crisp-edges` that is nearest-neighbour at a fractional scale: art pixels land
**unevenly, some 3 device px wide and their neighbours 4**. This affects every sprite in the game,
not just the overlay, and it is why the dither reads as irregular under magnification.

**The two-style toggle was never a feature.** `plans/stealth-perception-and-thieve.md` ends its
decision block with: *"Both dither treatments get built behind a toggle; the loser is deleted after
Caelan looks at them side by side in the real game."* That comparison happened on 2026-09-06. Both
treatments lose. `threatStyle` is retired rather than extended.

**Retiring it is safe and needs no migration.** `validate()` in `settings.js` drops unknown keys by
design (its own comment at `settings.js:104` warns about exactly this), so removing `threatStyle`
from `DEFAULTS` and `validate()` means an existing player's stored value is silently discarded on
next load. Remove its Options row too.

**No replacement toggle** — the overlay is now absent during calm play, which is what the toggle
would mostly have been used to achieve. `reduceMotion` stays wired and continues to damp the pip
breath and the phase-change ease. If Caelan later wants a hard off switch, it is a one-line
addition to `validate()` and one Options row; it is deliberately not built on spec.

---

## Part 1 — Attention becomes a state, and the overlay expresses it

`shadow` and `danger` stop being player preferences and become two **phases** of one system.

### The gate

Nothing draws unless one of these holds:

- **(a)** at least one watcher is in `suspicious`, `searching`, or `chasing`
- **(b)** the player is aiming a stealth-relevant verb — `wheel.aiming` is true and the selected
  node resolves under the `thieve` verb (`wheel-model.js:70`, whose sub-verbs are `coin` / `kit` /
  `gear`). Use the existing `selectedNode` helper already imported by `main.js:79` rather than
  matching on label strings.
- **(c)** `game._inCombat()` — vignette only, see below

Condition **(b)** is load-bearing and must not be dropped. The original spec's ruling was that *"the
room stays legible so a theft is something you can plan"* — gating the field purely on enemy state
would take away the ability to plan, which is the reason the field exists. Aiming a theft brings it
back.

### The phases

| Phase | Trigger | Treatment |
|---|---|---|
| **Quiet** | none of (a)/(b)/(c) | nothing renders |
| **Haze** | (a) with the worst watcher in `suspicious`/`searching`, or (b) | safe ground darkens — the current `shadow` reading, but only for the watchers who are actually looking |
| **Alarm** | any watcher in `chasing`, or any watcher holding `DIRECT` on the player | **inverts** — the safe-ground darkening drops away and the seen ground goes hot |
| **Vignette** | (c) | radial edge darkening, additive to whichever of the above applies |

**The inversion is the signal.** Haze and Alarm are deliberately opposite polarities so the
transition between them is legible as an event rather than as a colour change. Do not cross-fade
polarity through a muddy midpoint: hold Haze, then swap, then ease the new phase in over ~120ms.

**Scope the field to the watchers who justify it.** In Haze, build the field from watchers in
`suspicious`/`searching`/`chasing` only — not from every entity with eyes. In case (b) with no
alert watcher, fall back to the full watcher set, because planning a theft needs to show the mark's
cone. This is the single change that empties the town square.

### The vignette

`renderer._arenaLevel` already exists as a smoothed 0..1 combat ramp (`main.js:5214-5218` drives it,
target 1 in combat and 0 otherwise). The vignette rides that value — do not add a second timer.
It is a radial darkening from the screen edge, framing rather than information, and it carries no
per-tile data.

---

## Part 2 — Fine dither at art-pixel grain

Keep an ordered dither. `renderer.js:2606` argues that the screen already carries a day/night
multiply, a combat dim and the Wilderness blackout, and that "a fourth smooth alpha layer is how you
get mud." Gating the overlay weakens that objection but does not refute it, so the dither stays and
gets fixed instead.

**Pre-render the pattern once; fill each tile with it.**

- Build the dither into a small offscreen canvas at init and wrap it with
  `ctx.createPattern(patternCanvas, 'repeat')`. Cache per (phase, density) — there are only a few.
- **Cell size = 2 logical px**, exactly one art pixel. This is the whole point: the overlay's grain
  must match the art's grain.
- Pattern tile = 8×8 logical px (4×4 art pixels), carrying the existing 4×4 Bayer arrangement
  re-expressed at art-pixel grain.
- Per tile the draw becomes **one** `fillRect` with a pattern fill instead of sixteen. Fewer draw
  calls, finer result.

**Quieter numbers.** Alpha drops from 0.55 to a **0.20 maximum**; Haze density drops from 10/16 to
roughly **4/16**. Treat both as starting points to be tuned against the real screen, not as
derived constants — the acceptance test is Caelan's eye, not the numbers.

**The pattern must stay locked to world space.** `createPattern` anchors to the canvas origin, so a
naive fill will crawl against the tiles as the camera scrolls. Offset the pattern by
`_scrollX`/`_scrollY` (via `pattern.setTransform` or a `ctx.translate` before filling) so it stays
pinned to the world. The current per-rect implementation gets this for free and its comment claims
the pattern "is stable and never crawls" — that property must survive the rewrite.

**Keep channels 2, 3 and 4.** The facing chevron, the awareness pip, and the `DIRECT` thread are the
colour-blind-safe channels and the reason the field is never the only signal. They are unchanged,
and they now carry more weight because the field is absent more often.

---

## Part 3 — The canvas lands on whole pixels

**Goal:** one art pixel occupies a whole number of device pixels, at every window size and DPR.

An art pixel is 2 logical px, so the constraint is `cssPx * dpr` being an integer multiple of
`CANVAS_PX / 2` = 304.

```
avail = min(innerHeight - 16, innerWidth - 16, 900)
k     = max(1, floor(avail * dpr / 304))
css   = 304 * k / dpr        // set as canvas.style.width/height
```

- Drive this from JS on boot, on `resize`, and on DPR change
  (`matchMedia('(resolution: Xdppx)')`), and drop `height: 100%` from `#game-canvas` so the two
  do not fight. Keep `aspect-ratio: 1` as a fallback.
- **Accepted tradeoff (Caelan, 2026-09-06):** the canvas gets slightly smaller. At the measured DPR
  1.5 in a 704px slot the nearest exact size is 608 CSS px, about 14% smaller, with every pixel
  exact.

**Raise the 900px cap while doing this.** Valid sizes are `304k/dpr`, which is a coarse ladder —
608 / 912 / 1216 at DPR 1, and 405 / 608 / 811 / 1013 at DPR 1.5. The existing
`max-height: 900px` on `#game-layout` (`style.css:215`) sits just under the 912 rung, so at DPR 1
on a large monitor the snap costs a **whole step** (912 → 608, a 33% loss) purely because of an
arbitrary cap. Raise it to at least 1024 so the next rung is reachable where the viewport allows.
Without this change Part 3 makes the game meaningfully smaller on common setups, which is not the
tradeoff that was agreed.

**Two things this must not break, both verified before the change is called done:**

1. **Integer-pixel camera scroll.** Commit `6db8569` ("integer-pixel camera scroll — kill the
   tile-seam flicker") already fought this battle on `_scrollX`/`_scrollY`. Re-check for tile seams
   while walking after the change.
2. **In-canvas tap targets.** `style.css:218` notes the hotbar, radial menu and item overlay are all
   in-canvas tap targets behind `touch-action: none`. Any hit-testing that assumes a canvas size
   must go through `getBoundingClientRect()`. Verify a tap on the hotbar and on the radial menu
   still lands after resizing.

---

## Part 4 — The sprite and asset gaps

Inventory taken 2026-09-06 against `38a44c2`.

### 4a. Nine spawned types render as a flat red box

Every character goes through `ENEMY_SPRITES[e.type]` (`renderer.js:1049`); a miss draws
`fillRect` in `#cc4433` (`renderer.js:1057-1060`). These nine types have no entry, so this fires on
every normal run — it is unauthored data, not a load failure:

`Banker` · `Operator` · `Cook` · `Stranger` · `Vendor` · `Puck` · `Sludge Bloom` · `Bootlegger` · `Lire`

They are almost exactly the counter-NPCs of the single-room interiors (bank, casino, diner,
downtown), plus the sewer puzzle wall and the Hire Lire summon. Two are vendors, and `townie-hooch`
stands in the opening view beside the car.

Pick coordinates with `game/sprite-picker.html`, not by counting pixels. Kenney roguelike sheets
carry a 1px gutter — set `padding: ROGUELIKE_PAD` on any new roguelike SpriteSheet entry.

### 4b. Eleven item ids render as a grey `?`

Neither `ITEM_SPRITES` nor `ITEM_COLORS` covers: `health_poition`, `mana_poition`, `gold_poition`,
`strength_poition`, `defence_poition`, `speed_poition`, `tome_ray_blast`, `fire_bottle`, `chain`,
`burger_fries`, `wererat_fur`. The v0.20.0 headline category is question marks in the bag.

### 4c. The guard rail (the durable fix)

`content-validate.js` checks items, dialogue, quests, maps and examinables for dangling ids but
never checks that a spawned `type` has a sprite, and no test touches `sprites.js`. **Add both**: a
validator rule and a node test that walks every `*-map.json` `enemies[]` entry plus the dynamic
spawns and asserts an `ENEMY_SPRITES` key exists. Without this the list in 4a regrows silently.

The same sweep finds the mirror-image gap: `Sewer Monster` has a sprite and is never spawned.

### 4d. Chests and jammed doors have no sprite lookup at all

`_drawContainers` (`renderer.js:836-871`) and `_drawJammedDoor` (`renderer.js:1232-1259`) are
entirely procedural rectangles. `renderer.js:830` calls this out as a deferred polish-pass concern.

### 4e. Dead weight

- `roguelikeChar` — registered at `sprites.js:131`, fetched (11KB), **never drawn**. Its comment
  claims it backs the equipment mannequin; that mannequin is hand-drawn vectors at
  `renderer.js:3586-3609`.
- `sewerTiles` — an alias whose fallback branch is unreachable, because every entry in all three
  tile maps names its own sheet. Costs an extra fetch.
- `assets/font_8x8.png` — dead since the VT323 swap. **`CLAUDE.md` still documents it as the live
  font; that line is stale and must be corrected in the same change.**
- `assets/ui/ctrl_dpad.png`, the four `q_*.png`, the four `z_*.png`, and the two unpacked
  `tinyDungeon.png` / `tinyTown.png` originals — unreferenced.

Deletions are `git rm`; nothing here is paid art (all Kenney CC0, per the licence files in
`assets-placeholder/kenney/`).

---

## Execution order and agent assignment

Caelan's ruling for this session: plan with Opus, execute with the smallest model that fits the job.

| # | Work | Model | Why |
|---|---|---|---|
| 1 | **4e** dead weight + the CLAUDE.md font line | Haiku | Deletion and one doc edit; verifiable by grep |
| 2 | **Part 3** canvas scaling | Sonnet | Small diff, but touches boot/resize and tap mapping |
| 3 | **4a + 4b** sprite and item coords | Sonnet | Needs the picker and visual judgment |
| 4 | **4c** validator + test | Sonnet | Ordinary test work; do it after 3 so it passes |
| 5 | **Parts 1 + 2** the overlay rewrite | Sonnet | The largest change; spec above is the design |
| 6 | **4d** chest and door sprites | Sonnet | Lowest severity; drop first if the session runs long |

Ordering rationale: **2 before 5**, so the overlay is tuned against a canvas that is already
pixel-exact — tuning the dither on a fractionally-resampled screen would tune it against an
artefact. **3 before 4**, so the new validator passes on landing.

## Verification

Per `CLAUDE.md`, a change is done when the game **runs**, not when the tests pass.

- `npm test` — baseline is 404 tests / 87 suites / 0 failures.
- `python dev-server.py 3001`, load it, check the console, and walk the town.
- **Part 3:** confirm no tile seams while walking; confirm a hotbar tap and a radial-menu tap still
  land; check at two window sizes.
- **Parts 1+2:** the town square draws **nothing** with all watchers idle; aiming a theft brings the
  field back; a searching enemy produces haze; being spotted inverts it; combat vignettes.
- **4a/4b:** no red boxes and no `?` glyphs in town, bank, casino, diner, downtown, or the bag.
- `git grep -iE 'violence[ _-]+town' -- ':!CLAUDE.md' ':!plans/item-hotbar-xmb-implementation.md'`
  must return zero lines.
