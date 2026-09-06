# The Visual Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the threat overlay from shading half the town, and make every sprite in the game land on whole device pixels.

**Architecture:** Two new pure leaf modules — `game/threat-phase.js` (which phase the overlay is in) and `game/canvas-fit.js` (what CSS size keeps pixels exact) — each node-testable in isolation the way `perception.js` is. `renderer.js` consumes both; all the untestable canvas work stays behind those pure boundaries. The sprite work is data plus a validator that stops the gap from regrowing.

**Tech Stack:** Vanilla ES modules, `node --test`, HTML5 canvas 2D. No build step, no dependencies.

**Design spec:** `plans/visual-pass.md` (approved 2026-09-06). Read it first — it carries the measurements and the rulings this plan implements.

**Branch:** `feature/visual-pass`, already created off `dev`.

---

## File Structure

**Create:**
- `game/threat-phase.js` — pure. Which phase the overlay is in, and which watchers justify it.
- `game/canvas-fit.js` — pure. The CSS size that keeps art pixels whole.
- `tests/threat-phase.test.js`
- `tests/canvas-fit.test.js`
- `tests/sprite-coverage.test.js`

**Modify:**
- `game/sprites.js` — nine enemy entries, item entries, two dead registrations removed
- `game/settings.js` — `threatStyle` retired
- `game/renderer.js` — `_drawThreatOverlay` rewritten, pattern dither, combat vignette
- `game/main.js` — canvas-fit wiring, Options row removed
- `game/style.css` — canvas sizing handed to JS, 900px cap raised
- `game/content-validate.js` — sprite-coverage rule
- `CLAUDE.md` — the stale `font_8x8.png` line

**Delete:** `game/assets/font_8x8.png`, `game/assets/ui/ctrl_dpad.png`, `game/assets-placeholder/kenney/q_*.png` (4), `game/assets-placeholder/kenney/z_*.png` (4), `game/assets-placeholder/kenney/tiny/dungeon/tinyDungeon.png`, `game/assets-placeholder/kenney/tiny/town/tinyTown.png`

---

## Task 1: Dead weight and one stale doc line

**Model: Haiku.** Deletion plus one doc edit; every claim is grep-verifiable.

**Files:**
- Modify: `game/sprites.js` (remove two registrations)
- Modify: `CLAUDE.md`
- Delete: twelve asset files

- [ ] **Step 1: Prove each file is unreferenced before deleting it**

Run from repo root:

```bash
for f in font_8x8 ctrl_dpad q_botleft q_botright q_topleft q_topright z_trees z_trees2 z_trees3 z_walls; do printf '%-12s %s\n' "$f" "$(git grep -l "$f" -- game tools | tr '\n' ' ')"; done
```

Expected: `font_8x8` matches `tools/gen_font.py` only; `ctrl_dpad` matches `tools/gen_ui_controls.py` only; the eight `q_*`/`z_*` names match nothing. If any name matches a file under `game/` other than the asset itself, STOP and report — do not delete it.

- [ ] **Step 2: Delete the unreferenced assets**

```bash
git rm game/assets/font_8x8.png game/assets/ui/ctrl_dpad.png
git rm game/assets-placeholder/kenney/q_botleft.png game/assets-placeholder/kenney/q_botright.png game/assets-placeholder/kenney/q_topleft.png game/assets-placeholder/kenney/q_topright.png
git rm game/assets-placeholder/kenney/z_trees.png game/assets-placeholder/kenney/z_trees2.png game/assets-placeholder/kenney/z_trees3.png game/assets-placeholder/kenney/z_walls.png
git rm game/assets-placeholder/kenney/tiny/dungeon/tinyDungeon.png game/assets-placeholder/kenney/tiny/town/tinyTown.png
```

Leave `roguelikeDungeon_transparent.png` and `roguelikeSheet_transparent.png` alone — `game/sprite-picker.html` still loads them.

- [ ] **Step 3: Remove the two dead sheet registrations**

In `game/sprites.js`, delete the `roguelikeChar` entry from `SHEETS` (around line 125-131) together with its comment block, which claims it backs the equipment mannequin. That mannequin is hand-drawn vectors at `renderer.js:3586-3609`; the claim is false and the sheet is never read.

Delete the `sewerTiles` entry as well (around line 120-123). Its fallback branch in `_drawTiles` is unreachable because every entry in `TILE_SPRITE_MAP`, `TOWN_TILE_SPRITE_MAP` and `ZONE_TILE_SPRITE_MAP` names its own `sheet`.

- [ ] **Step 4: Verify nothing referenced them**

```bash
git grep -n "roguelikeChar\|sewerTiles" -- game
```

Expected: no output.

- [ ] **Step 5: Fix the stale CLAUDE.md line**

In `CLAUDE.md`, the "Recent infrastructure" section opens with a bullet beginning **"Bitmap pixel font at `game/assets/font_8x8.png`"**. Replace that whole bullet with:

```markdown
- **Text is VT323**, a webfont at `game/assets/fonts/VT323.ttf` (SIL OFL, licence in `assets/fonts/OFL.txt`), loaded in `game/bitmap-font.js` and stashed on `renderer.font`. `BitmapFont.drawText(ctx, text, x, y, opts)` is unchanged. The former 8×8 bitmap atlas was retired — it read as the least-legible thing on screen — and `tools/gen_font.py` is kept only for reference.
```

- [ ] **Step 6: Confirm the game still boots**

```bash
python dev-server.py 3001
```

Load `http://localhost:3001`, click GAME START, confirm the console is clean and the town renders. Two fewer image fetches should occur.

- [ ] **Step 7: Run the suite**

```bash
npm test
```

Expected: 404 tests, 87 suites, 0 failures.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore(assets): delete what nothing loads, and correct the font note

roguelikeChar was fetched on every boot and never drawn - its comment
claimed it backs the equipment mannequin, which is hand-drawn vectors.
sewerTiles was an alias whose fallback branch is unreachable because
every tile map entry names its own sheet. Both cost a fetch for nothing.

CLAUDE.md still called font_8x8.png the live font; it has been VT323
since the legibility swap.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2: `canvas-fit.js` — the size that keeps pixels whole

**Model: Sonnet.** Pure function plus wiring; the wiring touches boot, resize and hit-testing.

**Files:**
- Create: `game/canvas-fit.js`
- Create: `tests/canvas-fit.test.js`
- Modify: `game/main.js`, `game/style.css`

**Background the engineer needs.** The backing store is fixed at `CANVAS_PX * SS` = 608 × 2 = 1216 (`renderer.js:102`). An art pixel is 2 logical px, because 16×16 sprites are drawn at `TILE_PX` = 32. For an art pixel to occupy a whole number of device pixels, `cssPx * dpr` must be an integer multiple of `CANVAS_PX / 2` = 304.

- [ ] **Step 1: Write the failing test**

Create `tests/canvas-fit.test.js`:

```javascript
// canvas-fit.test.js — the CSS size that keeps art pixels whole.
//
// An art pixel is 2 logical px (16x16 sprites drawn at TILE_PX=32), so the
// invariant is that cssPx * dpr lands on a multiple of CANVAS_PX/2 = 304.
// Without that, `image-rendering: crisp-edges` resamples at a fractional
// ratio and neighbouring art pixels come out 3 and 4 device px wide.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { pickCanvasCss, ART_STEP } from '../game/canvas-fit.js';

describe('pickCanvasCss', () => {
    test('ART_STEP is CANVAS_PX / 2', () => {
        assert.equal(ART_STEP, 304);
    });

    test('every result puts art pixels on whole device pixels', () => {
        for (const dpr of [1, 1.25, 1.5, 2, 3]) {
            for (let avail = 200; avail <= 2000; avail += 7) {
                const css = pickCanvasCss(avail, dpr);
                const devicePx = css * dpr;
                assert.ok(
                    Math.abs(devicePx / ART_STEP - Math.round(devicePx / ART_STEP)) < 1e-9,
                    `dpr=${dpr} avail=${avail} css=${css} -> ${devicePx} device px is not a multiple of ${ART_STEP}`,
                );
            }
        }
    });

    test('never exceeds the available space', () => {
        for (const dpr of [1, 1.5, 2]) {
            for (let avail = 200; avail <= 2000; avail += 13) {
                assert.ok(pickCanvasCss(avail, dpr) <= avail);
            }
        }
    });

    test('the measured case: 704px slot at dpr 1.5 gives 608', () => {
        assert.equal(pickCanvasCss(704, 1.5), 608);
    });

    test('a large slot at dpr 1 reaches the 912 rung', () => {
        assert.equal(pickCanvasCss(1000, 1), 912);
    });

    test('never returns zero or negative, even in a tiny viewport', () => {
        for (const dpr of [1, 1.5, 2, 3]) {
            const css = pickCanvasCss(10, dpr);
            assert.ok(css > 0, `dpr=${dpr} gave ${css}`);
        }
    });

    test('a missing or nonsense dpr falls back to 1', () => {
        assert.equal(pickCanvasCss(1000, undefined), pickCanvasCss(1000, 1));
        assert.equal(pickCanvasCss(1000, 0), pickCanvasCss(1000, 1));
        assert.equal(pickCanvasCss(1000, NaN), pickCanvasCss(1000, 1));
    });
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
node --test tests/canvas-fit.test.js
```

Expected: FAIL — `Cannot find module '../game/canvas-fit.js'`.

- [ ] **Step 3: Write the module**

Create `game/canvas-fit.js`:

```javascript
// canvas-fit.js — the CSS size that keeps art pixels whole.
//
// The backing store is fixed (renderer.js: CANVAS_PX * SS = 1216). The CSS size
// was not: style.css sized the canvas `height: 100%` of a fluid box, so the
// browser resampled 1216 device px down to whatever the layout happened to be.
// At the DPR 1.5 measured on 2026-09-06 that was 1056 — a ratio of 1.1515 — and
// under `image-rendering: crisp-edges` that is nearest-neighbour at a fractional
// scale: art pixels land unevenly, some 3 device px wide, their neighbours 4.
// That softness reads as "bad graphics" across every sprite in the game.
//
// An art pixel is 2 logical px (16x16 art drawn at TILE_PX=32), so the whole
// constraint is: cssPx * dpr must be a multiple of CANVAS_PX / 2.
//
// Pure leaf module — imports nothing, so it is node-testable in isolation the
// way perception.js / pathing.js / rings.js are.

import { CANVAS_PX } from './data.js';

// One art pixel across the whole canvas width. cssPx * dpr must be a multiple.
export const ART_STEP = CANVAS_PX / 2;   // 304

// Largest exact CSS size that fits `availPx`. Never returns 0 — a viewport too
// small for even one step gets the smallest exact size and is allowed to
// overflow, because a canvas scaled to nothing is worse than one that scrolls.
export function pickCanvasCss(availPx, dpr) {
    const d = (Number.isFinite(dpr) && dpr > 0) ? dpr : 1;
    const k = Math.floor((availPx * d) / ART_STEP);
    return ART_STEP * Math.max(1, k) / d;
}
```

`CANVAS_PX` is exported from `game/data.js:65`. Importing it keeps the two in step if the view size ever changes; it is a plain constant, so the module stays node-safe.

- [ ] **Step 4: Run the test again**

```bash
node --test tests/canvas-fit.test.js
```

Expected: PASS, 7 tests.

- [ ] **Step 5: Hand canvas sizing to JS**

In `game/style.css`, in the `#game-canvas` block (around line 218), **remove** `height: 100%;`. Keep `aspect-ratio: 1`, `image-rendering`, `display: block`, `background` and `touch-action` exactly as they are. Add a comment in its place:

```css
    /* Width/height are set from JS (game/canvas-fit.js) so that cssPx * dpr
       lands on a whole number of art pixels. A CSS-driven fluid size resamples
       the fixed 1216px backing store at a fractional ratio, which under
       crisp-edges makes neighbouring art pixels 3 and 4 device px wide. */
```

In the same file, `#game-layout` (around line 210) has `max-height: 900px`. Raise it to `1024px`. Valid sizes form a coarse ladder — 608 / 912 / 1216 at DPR 1 — and 900 sits just under the 912 rung, so the cap alone would cost a whole step on a large DPR-1 monitor.

- [ ] **Step 6: Wire it up in main.js**

Add the import beside the other game-module imports at the top of `game/main.js`:

```javascript
import { pickCanvasCss } from './canvas-fit.js';
```

Add this method to the `Game` class, next to the other setup helpers:

```javascript
// Size the canvas so one art pixel is a whole number of device pixels.
// Called on boot, on resize, and when the window moves between displays of
// different DPR (a browser zoom does the same thing).
_fitCanvas() {
    const canvas = this.renderer?.canvas;
    if (!canvas) return;
    const avail = Math.min(window.innerHeight - 16, window.innerWidth - 16, 1024);
    const css = pickCanvasCss(avail, window.devicePixelRatio);
    canvas.style.width  = `${css}px`;
    canvas.style.height = `${css}px`;
}
```

Call it once during boot, immediately after the renderer is constructed, and bind the listeners:

```javascript
this._fitCanvas();
window.addEventListener('resize', () => this._fitCanvas());
// devicePixelRatio changes (zoom, or dragging to another monitor) do not fire
// `resize` reliably; a one-shot media query that re-arms is the standard trick.
const watchDpr = () => {
    matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
        .addEventListener('change', () => { this._fitCanvas(); watchDpr(); }, { once: true });
};
watchDpr();
```

- [ ] **Step 7: Check the hit-testing still lines up**

The hotbar, radial menu and item overlay are in-canvas tap targets (`style.css:218` says so). Find where pointer events convert client coordinates into canvas coordinates in `main.js`:

```bash
git grep -n "getBoundingClientRect\|offsetX\|clientX" -- game/main.js
```

Any conversion **must** scale by `canvas.width / rect.width`, not by a hardcoded size. If you find a hardcoded `CANVAS_PX` or `608` in that path, fix it to derive from `getBoundingClientRect()` and note it in the commit message.

- [ ] **Step 8: Verify in the browser — this is the real test**

```bash
python dev-server.py 3001
```

Load it and check all four:
1. The canvas is 608 CSS px (or another exact rung) — read `document.getElementById('game-canvas').clientWidth` in the console.
2. Walk around. No tile seams. Commit `6db8569` fixed seam flicker via integer `_scrollX`/`_scrollY`; if seams reappear, that interaction is the cause.
3. Tap a hotbar slot and open the radial menu. Both must respond where you click.
4. Resize the window smaller and larger. The canvas should step between rungs, never land between them.

- [ ] **Step 9: Run the full suite**

```bash
npm test
```

Expected: 0 failures, and the suite total up by 7 from the 404 baseline. Report the actual number in the commit if it differs.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "fix(render): put art pixels back on whole device pixels

The backing store is fixed at 1216 but style.css sized the canvas
height:100% of a fluid box, so the browser resampled it to whatever the
layout gave. At DPR 1.5 that was 1056 device px - a ratio of 1.1515 -
and under crisp-edges that is nearest-neighbour at a fractional scale,
so neighbouring art pixels come out 3 and 4 device px wide. It softened
every sprite in the game, not just the threat overlay.

canvas-fit.js picks the largest CSS size where cssPx * dpr lands on a
multiple of 304 (one art pixel across the canvas). The 900px cap moved
to 1024 because 900 sits just under the 912 rung and would have cost a
whole step on a DPR-1 monitor.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3: The nine missing NPC sprites and the missing item icons

**Model: Sonnet.** Needs eyes on the contact sheets; the co-occurrence rule needs care.

**Files:**
- Modify: `game/sprites.js`

**How to pick coordinates.** Open `tools/contact_tinyDungeon.png` and `tools/contact_tinyTown.png` — labelled `col,row` contact sheets generated by `tools/gen_contact_sheet.py`. These, not `sprite-picker.html`, are what the existing coordinates were picked against. Both Tiny packs are *packed* (gutter-free) atlases, so `padding` is 0 — the `ROGUELIKE_PAD` note in `CLAUDE.md` applies only to the legacy roguelike sheets, which nothing references any more.

**The co-occurrence rule** (already in force at `sprites.js:198-207`): two types may share a cell only if they can never appear on the same screen. Task 4 adds a test that enforces this, so a lazy reuse will fail CI.

- [ ] **Step 1: Add the nine missing enemy entries**

In `game/sprites.js`, append to `ENEMY_SPRITES`:

```javascript
    // ── Interior counter-NPCs and one-offs (visual-pass, 2026-09-06) ─────────
    // These nine spawned types had NO entry, so every one of them rendered as
    // the flat #cc4433 fallback box in _drawEnemySprite on every normal run.
    // Five take the last unused Tiny Dungeon humanoid cells; the rest reuse a
    // cell from a zone they can never share (tests/sprite-coverage.test.js
    // enforces that).
    'Banker':   { sheet: 'tinyDungeon', col: 4, row: 8, static: true }, // white-haired elder in a cloak — old money
    'Operator': { sheet: 'tinyDungeon', col: 1, row: 8, static: true }, // visored full plate — casino pit boss as bouncer
    'Cook':     { sheet: 'tinyDungeon', col: 2, row: 8, static: true }, // young figure in an apron-ish smock
    'Stranger': { sheet: 'tinyDungeon', col: 4, row: 7, static: true }, // plain, featureless — literally a stranger
    'Vendor':   { sheet: 'tinyDungeon', col: 3, row: 8, static: true }, // long hair, purple dress — distinct from Stranger, same zone

    // Reuses, each from a zone the holder cannot co-occur with:
    'Bootlegger': { sheet: 'tinyDungeon', col: 3, row: 7, static: true }, // Wererat's horned brute; Wererat is sewer-only, this is town
    'Puck':       { sheet: 'tinyDungeon', col: 0, row: 8, static: true }, // Boss's knight helm; Boss is Borgir, this is the factory
    'Stranger':   { sheet: 'tinyDungeon', col: 2, row: 7, static: true }, // Pike's gaunt skull-faced figure; Pike is canyon, this is downtown

    // Not a person: a puzzleWall growth blocking a sewer pipe.
    'Sludge Bloom': { sheet: 'tinyDungeon', col: 8, row: 2, static: true }, // stone hatch leaking green ooze
```

**`Lire` is deliberately NOT in this list.** Tiny Dungeon ships no lion, and every near-miss is worse than the red box it replaces: `(3,10)`/`(4,10)` are rats, `(1,9)` is a bare humanoid, `(0,10)`/`(2,10)` are spiders. Leave the fallback in place, add `Lire` to a `KNOWN_UNSPRITED` allowlist in Task 4's test with this reason, and **ask Caelan** whether he would rather it reuse the horned brute at `(3,7)` or wait for a pack that has a big cat.

**`Sludge Bloom` was corrected after review.** It was drafted as tinyTown `(5,2)`, which is already `tunnel_mushroom` — a pickup item **in the same zone**. An obstacle that looks like a collectible is a trap. `(8,2)` is the sludge-leaking hatch, which is also the `sludge` tile at id 2; a tile and an entity reading as the same material is correct here.

- [ ] **Step 1b: Fix the assignments that are simply wrong**

These are pre-existing and are the reason Caelan opened the session — they are not new gaps. Change them **in place** in `ENEMY_SPRITES`:

```javascript
    // Rat: (3,9) is a HOODED FIGURE, not a rat — the old comment called the
    // robe front a "bib". The pack's actual rats are the bottom row, beside
    // the vials. Canyon rats have been rendering as robed people all along.
    'Rat': { sheet: 'tinyDungeon', col: 3, row: 10, static: true }, // brown rat, curved body and tail

    // Violencian: was (0,7), the purple wizard — so every citizen in town was
    // a wizard, which is the single most visible art bug in the game. (4,7) is
    // a plain, unremarkable townsperson, which is what a Violencian is.
    'Violencian': { sheet: 'tinyDungeon', col: 4, row: 7, static: true }, // plain brown-haired civilian

    // Carrion: was (2,7), shared with Pike. (3,9) is freed by the Rat move and
    // is a far better read for a carrion-merchant anyway — gaunt and hooded.
    // Pike keeps (2,7) to itself.
    'Carrion': { sheet: 'tinyDungeon', col: 3, row: 9, static: true }, // hooded, gaunt — the freed cell
```

`Carnival Clown` keeps `(0,7)`. It is no longer a duplicate once `Violencian` moves, and the purple wizard is genuinely the most circus-coloured cell in the pack.

That resolves both duplicate pairs — `Violencian`/`Carnival Clown` and `Carrion`/`Pike` — which Task 4's collision test would otherwise fail on.

- [ ] **Step 2: Give the poitions real glassware**

**`ITEM_SPRITES` does NOT use the `{sheet, col, row, static}` shape.** It uses pixel regions consumed by `drawRegion()`: `{ sheet, x: col*16, y: row*16, w: 16, h: 16 }`. Match the surrounding entries exactly — an entry in the enemy shape will silently draw nothing.

Tiny Dungeon ships **eight** vessels, not four: fat bottles at `(5..8, 9)` and skinny vials at `(5..8, 10)`. `soap` and `bandage` already hold two of the fat bottles as admitted proxies; the vials are all free, so the poitions can be served without displacing anything.

Append to `ITEM_SPRITES`:

```javascript
    // ── Poitions (visual-pass, 2026-09-06) ──────────────────────────────────
    // All six rendered as the generic grey '?' glyph — the v0.20.0 headline
    // category, unreadable in the bag. The four skinny vials on row 10 carry
    // the four most-used; the two remaining fat bottles on row 9 take the rest.
    // (soap and bandage hold the other two fat bottles as pre-existing proxies.)
    health_poition:   { sheet: 'tinyDungeon', x: 7 * 16, y: 10 * 16, w: 16, h: 16 },  // red vial
    mana_poition:     { sheet: 'tinyDungeon', x: 8 * 16, y: 10 * 16, w: 16, h: 16 },  // blue vial
    strength_poition: { sheet: 'tinyDungeon', x: 6 * 16, y: 10 * 16, w: 16, h: 16 },  // green vial
    speed_poition:    { sheet: 'tinyDungeon', x: 5 * 16, y: 10 * 16, w: 16, h: 16 },  // plain vial
    gold_poition:     { sheet: 'tinyDungeon', x: 6 * 16, y: 9  * 16, w: 16, h: 16 },  // green bottle — money green
    defence_poition:  { sheet: 'tinyDungeon', x: 8 * 16, y: 9  * 16, w: 16, h: 16 },  // blue bottle
```

Known limitation, accepted rather than hidden: `strength` (green vial) and `gold` (green bottle) share a hue, as do `mana` (blue vial) and `defence` (blue bottle). The silhouettes differ — vial versus bottle — and both beat a `?`. Flag it to Caelan if it reads badly at hotbar size.

- [ ] **Step 3: Pick the last five against the real sheets**

Five ids still have no icon: `tome_ray_blast`, `fire_bottle`, `chain`, `burger_fries`, `wererat_fur`.

**Cells that are already taken — do not reuse them.** `(0,1)` rock · `(10,8)` pipe · `(5,9)` soap · `(7,9)` bandage · `(10,6)` boardwalk_burger · tinyTown `(9,7)` hot_dog · tinyTown `(10,7)` mystery_meat · tinyTown `(5,2)` tunnel_mushroom · tinyTown `(9,4)` catalytic_converter. Rows 9 and 10 of tinyDungeon are now fully spoken for by the poitions and the rats.

Shortlist, all verified free — take a better one if you find it:

- `tome_ray_blast` — tinyDungeon `(6,5)` brown book
- `fire_bottle` — tinyDungeon `(5,2)` red flame banner, or tinyTown `(11,7)` red-and-white canister
- `chain` — tinyDungeon `(0,3)` horizontal iron bars, which read as links at icon size
- `burger_fries` — tinyDungeon `(5,8)` small orange-centred box, a passable fries carton. It **must not** reuse `(10,6)`, the boardwalk burger, since both can sit in the bag together
- `wererat_fur` — tinyTown `(10,8)` brown satchel

Use the `{ sheet, x, y, w, h }` region shape, with a trailing comment naming what the cell actually depicts — not what you wish it depicted. **Verify every pick in the browser at hotbar size before moving on:** `sprites.js:302-309` warns that item icons must read at `TILE_PX-8`, and a cell that looks fine on a contact sheet turns to mush at 24px.

**Regenerating the contact sheets.** `tools/contact_*.png` is gitignored (`.gitignore:70`), so a fresh clone will not have them:

```bash
python tools/gen_contact_sheet.py
```

To inspect a specific band of cells at magnification rather than squinting at the full sheet — which is how the `Rat` error below went unnoticed for months:

```bash
python -c "from PIL import Image; s=Image.open('game/assets-placeholder/kenney/tiny/dungeon/tinyDungeon_packed.png'); c=s.crop((0,112,s.width,176)); c.resize((c.width*7,c.height*7), Image.NEAREST).save('tools/_rows7to10.png')"
```

`tools/_*.png` is gitignored too, so scratch crops are safe to leave behind.

- [ ] **Step 4: Correct the wrong comment while you are in the file**

`sprites.js:223-225` says the Violencian pick should be revisited because "Tiny Town has townsfolk art." Tiny Town has **no character art at all** — it is terrain, buildings, props and tools. Replace that clause with:

```javascript
    // Town — ambient Violencians. Reuses a Tiny Dungeon humanoid cell. (An
    // earlier note here said to revisit this with Tiny Town's townsfolk art;
    // Tiny Town ships no character cells at all, so any better read has to come
    // from a new pack, not from the sheets already bundled.)
```

- [ ] **Step 5: Verify in the browser**

```bash
python dev-server.py 3001
```

Visit each interior and confirm no red box remains: **bank** (Banker), **casino** (Operator), **diner** (Cook), **downtown** (Stranger + two Vendors, which must look different from each other), **town** (Bootlegger, by the car in the opening view), **factory** (Puck), **sewer** (Sludge Bloom). Then open the bag and confirm no `?` glyphs.

- [ ] **Step 6: Commit**

```bash
git add game/sprites.js
git commit -m "feat(sprites): art for the nine types that rendered as red boxes

Every character goes through ENEMY_SPRITES[e.type]; a miss draws a flat
#cc4433 rect. Nine spawned types had no entry, so this fired on every
normal run - Banker, Operator, Cook, Stranger, Vendor, Puck, Sludge
Bloom, Bootlegger and Lire. They are almost exactly the counter-NPCs of
the single-room interiors, and two of them are vendors.

Also gives the poitions real bottles instead of the grey '?' glyph.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3c: The city pass — stop proxying props the pack already has

**Model: Sonnet.** Independent of Tasks 4 and 5; can run in parallel with neither, since it edits `sprites.js` alongside Task 3.

**Files:**
- Modify: `game/sprites.js`

**The finding.** `sprites.js:161-163` says Tiny Town "ships no urban props (cars, streetlights, manholes, trashcans)" and that those ids "fall back to the closest substitute." That is true of Tiny Town — and irrelevant, because **`roguelikeCity_packed.png` is already registered, already fetched, and already CC0**, and it contains all of them. It is currently used for exactly one tile (`TOWN_TILE_SPRITE_MAP[14]`, the building wall) and the `car` sprite was cropped out of it by hand into `assets/car.png`.

The sheet is **592×448 = 37 columns × 28 rows at a 16px stride, padding 0** (the packed variant — the 1px-gutter `ROGUELIKE_PAD` rule does **not** apply to it).

Confirmed present by inspection: lamp posts and traffic lights · wheeled bins and dumpsters · a fire hydrant · wooden benches · a dozen cars in several colours and angles · road markings (crosswalks, lane lines, turn arrows, a parking glyph) · striped awnings in green/white and orange/white · street trees · market umbrellas · doors, windows and shop signage.

**These comments in `sprites.js` are wrong and must be corrected, not merely worked around:**

| Line | Claim | Reality |
|---|---|---|
| `:180` | `streetlight` — "no lamp in pack" | roguelikeCity has lamp posts and traffic lights |
| `:183` | `trash can` — "pot/cauldron (cylinder proxy)" | roguelikeCity has wheeled bins and dumpsters |
| `:178` | `sewer entry` — "stone well (manhole proxy)" | check the road-marking block for a manhole cover |
| `:282` | "No striped tent/awning art exists" | two full awning sets exist |
| `:296-299` | "no iron railing in pack" | verify against the fence/railing block before trusting it |

- [ ] **Step 1: Generate a labelled contact sheet for the city pack**

`tools/gen_contact_sheet.py` currently covers the two Tiny packs. Extend it to take the city sheet (37×28, stride 16, padding 0) and emit `tools/contact_roguelikeCity.png` with `col,row` labels, the same way it does for the others. `tools/contact_*.png` is gitignored, so the output stays local — commit the **script** change, not the PNG.

- [ ] **Step 2: Re-point the four proxied town tiles**

In `TOWN_TILE_SPRITE_MAP`, replace the proxy picks for ids **18** (streetlight), **21** (trash can), **20** (bench) and **16** (sewer entry) with real `roguelikeCity` cells. Keep the entry shape identical — `{ sheet: 'roguelikeCity', col, row }` — and rewrite each trailing comment to describe the new cell honestly. Delete the stale "Tiny Town ships no urban props" preamble at `:161-163`; it is no longer the operative constraint.

**Do not** touch id 19 (`car`). It draws through a dedicated 2×2 block path at `renderer.js:702-714` against the separate `assets/car.png`, and re-pointing it at the atlas would break that.

- [ ] **Step 3: Stop there**

This is a **small** general pass, per Caelan's framing. Re-point the four proxied props, fix the five wrong comments, and stop. Do **not** re-theme the zone tile maps, do not touch the Circus / Factory / Graveyard first-pass picks, and do not start swapping building facades — those are a separate pass with its own before-and-after review. If you find something egregious outside this scope, write it down at the bottom of `plans/visual-pass.md` rather than fixing it.

- [ ] **Step 4: Verify in the browser**

Walk the town. The streetlights, bins and benches should read as street furniture rather than as pottery and planks. Confirm nothing regressed at the tile seams, and that the car is untouched.

- [ ] **Step 5: Commit**

```bash
git add game/sprites.js tools/gen_contact_sheet.py
git commit -m "feat(sprites): use the city pack we were already loading

sprites.js said Tiny Town ships no urban props and that streetlights,
bins and benches had to be proxied by signs, cauldrons and planks. True
of Tiny Town - but roguelikeCity_packed.png was already registered and
already fetched, used for exactly one tile, and it has lamp posts, bins,
hydrants, benches, awnings and road markings.

Four proxied props now point at real art. Five comments claiming the
art does not exist were wrong and have been corrected.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4: The guard rail

**Model: Sonnet.** Ordinary test work. Run it after Task 3 so it passes on landing.

**Files:**
- Create: `tests/sprite-coverage.test.js`
- Modify: `game/content-validate.js`

**Why this task exists.** `content-validate.js` walks the content graph for dangling ids but never checks that a spawned `type` has a sprite, and nothing under `tests/` touches `sprites.js`. That is why nine types accumulated silently. Without this the list regrows.

- [ ] **Step 1: Write the failing test**

Create `tests/sprite-coverage.test.js`:

```javascript
// sprite-coverage.test.js — every spawned type has art, and co-located types
// do not share a cell.
//
// Nine types accumulated with no ENEMY_SPRITES entry and rendered as the flat
// #cc4433 fallback box on every run (see plans/visual-pass.md). Nothing caught
// it: content-validate.js never looked at sprites, and no test imported
// sprites.js at all. This is that missing check.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ENEMY_SPRITES, ITEM_SPRITES } from '../game/sprites.js';
import { ALL_ITEM_IDS } from '../game/item-registry.js';

const GAME_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'game');

// `*-map.json` matches the real maps and excludes the stale
// `*-map-TheDangerrZone.json` snapshots, which end in `-TheDangerrZone.json`.
const mapFiles = readdirSync(GAME_DIR)
    .filter(f => f.endsWith('-map.json'))
    .sort();

function loadMap(file) {
    return JSON.parse(readFileSync(join(GAME_DIR, file), 'utf8'));
}

// Types spawned at runtime rather than authored in a map JSON. Keep this list
// short and justified — each entry is a spawn site that a map sweep cannot see.
const DYNAMIC_SPAWNS = [
    { type: 'Lire', why: 'tricks.js "Hire Lire" summon, via main.js _spawnSummon' },
];

// Types knowingly left on the fallback box, with the reason. This list is the
// escape hatch that keeps the suite honest: a gap is either fixed or written
// down here, never merely unnoticed. Adding to it should feel expensive.
const KNOWN_UNSPRITED = {
    'Lire': 'no lion in Tiny Dungeon; every near-miss (rats, spiders, bare humanoid) reads worse than the fallback. Awaiting Caelan.',
};

describe('sprite coverage', () => {
    test('the map sweep actually found maps', () => {
        assert.ok(mapFiles.length >= 10, `only found ${mapFiles.length} map files`);
    });

    test('every type spawned in a map JSON has an ENEMY_SPRITES entry', () => {
        const missing = [];
        for (const file of mapFiles) {
            for (const e of loadMap(file).enemies || []) {
                if (e.type && !ENEMY_SPRITES[e.type] && !KNOWN_UNSPRITED[e.type]) {
                    missing.push(`${file}: ${e.type} (id ${e.id ?? '?'})`);
                }
            }
        }
        assert.deepEqual(missing, [], `types with no sprite:\n  ${missing.join('\n  ')}`);
    });

    test('every dynamically spawned type has an ENEMY_SPRITES entry', () => {
        for (const { type, why } of DYNAMIC_SPAWNS) {
            if (KNOWN_UNSPRITED[type]) continue;
            assert.ok(ENEMY_SPRITES[type], `${type} has no sprite (${why})`);
        }
    });

    test('the known-unsprited list has not gone stale', () => {
        for (const type of Object.keys(KNOWN_UNSPRITED)) {
            assert.ok(
                !ENEMY_SPRITES[type],
                `${type} now HAS a sprite — remove it from KNOWN_UNSPRITED`,
            );
        }
    });

    test('types that share a map do not share a cell', () => {
        const collisions = [];
        for (const file of mapFiles) {
            const seen = new Map();   // "sheet:col,row" -> first type using it
            for (const e of loadMap(file).enemies || []) {
                const s = ENEMY_SPRITES[e.type];
                if (!s) continue;     // covered by the test above
                const key = `${s.sheet}:${s.col},${s.row}`;
                const prior = seen.get(key);
                if (prior && prior !== e.type) {
                    collisions.push(`${file}: ${prior} and ${e.type} both use ${key}`);
                } else {
                    seen.set(key, e.type);
                }
            }
        }
        assert.deepEqual(collisions, [], `co-located types sharing a cell:\n  ${collisions.join('\n  ')}`);
    });

    test('no ENEMY_SPRITES entry is orphaned', () => {
        const spawned = new Set(DYNAMIC_SPAWNS.map(d => d.type));
        for (const file of mapFiles) {
            for (const e of loadMap(file).enemies || []) if (e.type) spawned.add(e.type);
        }
        const orphans = Object.keys(ENEMY_SPRITES).filter(t => !spawned.has(t));
        assert.deepEqual(orphans, [], `sprites for types nothing spawns: ${orphans.join(', ')}`);
    });

    test('every sprite entry is well-formed', () => {
        for (const [type, s] of Object.entries(ENEMY_SPRITES)) {
            assert.ok(typeof s.sheet === 'string' && s.sheet, `${type}: no sheet`);
            assert.ok(Number.isInteger(s.col) && s.col >= 0, `${type}: bad col ${s.col}`);
            assert.ok(Number.isInteger(s.row) && s.row >= 0, `${type}: bad row ${s.row}`);
        }
    });
});

// ── Items ───────────────────────────────────────────────────────────────────
//
// ITEM_SPRITES uses PIXEL REGIONS ({sheet, x, y, w, h} via drawRegion), not the
// {sheet, col, row} shape ENEMY_SPRITES uses. Planning this pass, six item
// picks were drafted in the wrong shape and against cells that were already
// taken — by soap, bandage, hot_dog, mystery_meat and tunnel_mushroom. Nothing
// would have caught it. These tests are that check.

describe('item sprite coverage', () => {
    test('every ITEM_SPRITES entry uses the region shape, not the cell shape', () => {
        for (const [id, s] of Object.entries(ITEM_SPRITES)) {
            assert.ok(typeof s.sheet === 'string' && s.sheet, `${id}: no sheet`);
            assert.equal(s.col, undefined, `${id}: has col — that is the ENEMY_SPRITES shape, it will draw nothing`);
            assert.equal(s.row, undefined, `${id}: has row — that is the ENEMY_SPRITES shape, it will draw nothing`);
            for (const k of ['x', 'y', 'w', 'h']) {
                assert.ok(Number.isInteger(s[k]) && s[k] >= 0, `${id}: bad ${k} (${s[k]})`);
            }
        }
    });

    test('no two items share a cell', () => {
        const seen = new Map();
        const clashes = [];
        for (const [id, s] of Object.entries(ITEM_SPRITES)) {
            const key = `${s.sheet}:${s.x},${s.y}`;
            if (seen.has(key)) clashes.push(`${seen.get(key)} and ${id} both use ${key}`);
            else seen.set(key, id);
        }
        assert.deepEqual(clashes, [], `items sharing a cell:\n  ${clashes.join('\n  ')}`);
    });

    test('every ITEM_SPRITES id is a real item', () => {
        const unknown = Object.keys(ITEM_SPRITES).filter(id => !ALL_ITEM_IDS.includes(id));
        assert.deepEqual(unknown, [], `art for items that do not exist: ${unknown.join(', ')}`);
    });

    test('no poition falls through to the generic ? glyph', () => {
        const poitions = ALL_ITEM_IDS.filter(id => id.endsWith('_poition'));
        assert.ok(poitions.length >= 6, `only found ${poitions.length} poitions`);
        const bare = poitions.filter(id => !ITEM_SPRITES[id]);
        assert.deepEqual(bare, [], `poitions with no icon: ${bare.join(', ')}`);
    });
});
```

- [ ] **Step 2: Run it**

```bash
node --test tests/sprite-coverage.test.js
```

Expected after Task 3: everything PASSes except **`no ENEMY_SPRITES entry is orphaned`, which FAILS** naming `Sewer Monster` — it has art at `sprites.js:215` and nothing spawns it. That failure is correct and is the next step.

- [ ] **Step 3: Resolve the orphan**

`Sewer Monster` is the mirror of the nine missing types: art with no spawn. Two honest options, and this is **Caelan's call — ask him, do not pick silently**:

- **(a)** Delete the `ENEMY_SPRITES['Sewer Monster']` entry. The sewer already fields six distinct creatures without it.
- **(b)** Spawn it. `sewer-map.json` gains a `Sewer Monster` entry, which makes the sewer set seven.

If he is unavailable, take **(a)** — deleting unused data is reversible from git, whereas adding an enemy changes the balance of a shipped zone. Record which was chosen in the commit message.

- [ ] **Step 4: Re-run until green**

```bash
node --test tests/sprite-coverage.test.js
```

Expected: PASS, 10 tests.

- [ ] **Step 5: Add the same check to the browser-side validator**

`game/content-validate.js` runs in both node (`tests/content-integrity.test.js`) and the browser (`game/_design-content-check.html`), so the check should live there too for the node-less path. Inside `validateContent(maps)`, add a sprite pass alongside the existing dangling-id passes:

```javascript
    // Sprite coverage — a type with no ENEMY_SPRITES entry renders as a flat
    // red box, silently, on every run. Nine of them accumulated before anyone
    // noticed (plans/visual-pass.md).
    for (const [mapName, map] of Object.entries(maps)) {
        for (const e of map.enemies || []) {
            if (e.type && !ENEMY_SPRITES[e.type]) {
                errors.push({
                    kind: 'missing-sprite',
                    where: `${mapName}.enemies[${e.id ?? '?'}]`,
                    detail: `type "${e.type}" has no ENEMY_SPRITES entry — renders as a fallback box`,
                });
            }
        }
    }
```

Import `ENEMY_SPRITES` at the top of `content-validate.js`:

```javascript
import { ENEMY_SPRITES } from './sprites.js';
```

Match `errors.push({...})` to the shape the surrounding code already uses — read the existing pushes in `validateContent` first and copy their field names exactly rather than the ones above if they differ.

- [ ] **Step 6: Run the whole suite**

```bash
npm test
```

Expected: 0 failures, and the total up by 10 (six enemy tests, four item tests). `tests/content-integrity.test.js` must still pass — if the new import breaks it, `sprites.js` is pulling in something browser-only and the validator should take `ENEMY_SPRITES` as an argument instead.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test(sprites): stop the sprite gap from regrowing

Nine types reached production with no ENEMY_SPRITES entry because
nothing checked: content-validate.js never looked at sprites and no test
imported sprites.js at all. This walks every map JSON plus the known
dynamic spawns and asserts art exists, that co-located types do not
share a cell, and that no sprite is orphaned.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 5: `threat-phase.js` — the overlay becomes state-driven

**Model: Sonnet.** The largest change. The design is settled in `plans/visual-pass.md` §Part 1 — implement it, do not redesign it.

**Files:**
- Create: `game/threat-phase.js`, `tests/threat-phase.test.js`
- Modify: `game/renderer.js`, `game/settings.js`, `game/main.js`

- [ ] **Step 1: Write the failing test**

Create `tests/threat-phase.test.js`:

```javascript
// threat-phase.test.js — which phase the threat overlay is in.
//
// The bug this replaces: the overlay's watcher filter was "has eyes and is not
// your ally", which in the opening town square selected eight idle townsfolk —
// two of them vendors at +18 disposition — against one actually hostile NPC,
// and stippled 43% of the walkable floor as a result.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PHASE, threatPhase, alertWatchers } from '../game/threat-phase.js';

const watcher = (state, over = {}) => ({
    state, sightRange: 4, _ally: false,
    entity: { isAlive: () => true },
    ...over,
});
const idle = () => watcher('idle');

describe('threatPhase', () => {
    test('a calm town square draws nothing', () => {
        const ws = [idle(), idle(), idle(), idle(), idle(), idle(), idle(), idle()];
        assert.equal(threatPhase(ws, { inCombat: false, aimingTheft: false }), PHASE.QUIET);
    });

    test('a searching watcher raises the haze', () => {
        assert.equal(
            threatPhase([idle(), watcher('searching')], { inCombat: false, aimingTheft: false }),
            PHASE.HAZE,
        );
    });

    test('a suspicious watcher raises the haze', () => {
        assert.equal(
            threatPhase([watcher('suspicious')], { inCombat: false, aimingTheft: false }),
            PHASE.HAZE,
        );
    });

    test('a chasing watcher inverts to alarm', () => {
        assert.equal(
            threatPhase([idle(), watcher('chasing')], { inCombat: false, aimingTheft: false }),
            PHASE.ALARM,
        );
    });

    test('alarm outranks haze when both are present', () => {
        assert.equal(
            threatPhase([watcher('searching'), watcher('chasing')], { inCombat: false, aimingTheft: false }),
            PHASE.ALARM,
        );
    });

    test('spotted outranks state — a DIRECT hold is alarm even from an idle watcher', () => {
        assert.equal(
            threatPhase([idle()], { inCombat: false, aimingTheft: false, spotted: true }),
            PHASE.ALARM,
        );
    });

    test('aiming a theft brings the field back in a calm room', () => {
        assert.equal(
            threatPhase([idle(), idle()], { inCombat: false, aimingTheft: true }),
            PHASE.HAZE,
        );
    });

    test('dead and allied watchers never raise a phase', () => {
        const dead  = watcher('chasing', { entity: { isAlive: () => false } });
        const ally  = watcher('chasing', { _ally: true });
        const blind = watcher('chasing', { sightRange: 0 });
        assert.equal(threatPhase([dead, ally, blind], { inCombat: false, aimingTheft: false }), PHASE.QUIET);
    });

    test('an empty watcher list is quiet, and undefined does not throw', () => {
        assert.equal(threatPhase([], { inCombat: false, aimingTheft: false }), PHASE.QUIET);
        assert.equal(threatPhase(undefined, { inCombat: false, aimingTheft: false }), PHASE.QUIET);
    });
});

describe('alertWatchers', () => {
    test('haze builds its field from the alert watchers only', () => {
        const ws = [idle(), idle(), watcher('searching')];
        const picked = alertWatchers(ws, PHASE.HAZE, { aimingTheft: false });
        assert.equal(picked.length, 1);
        assert.equal(picked[0].state, 'searching');
    });

    test('aiming a theft with nobody alert shows every live watcher, so a theft can be planned', () => {
        const ws = [idle(), idle(), idle()];
        assert.equal(alertWatchers(ws, PHASE.HAZE, { aimingTheft: true }).length, 3);
    });

    test('quiet picks nobody', () => {
        assert.equal(alertWatchers([watcher('searching')], PHASE.QUIET, {}).length, 0);
    });

    test('dead, allied and blind watchers are filtered out of every phase', () => {
        const ws = [
            watcher('searching'),
            watcher('searching', { entity: { isAlive: () => false } }),
            watcher('searching', { _ally: true }),
            watcher('searching', { sightRange: 0 }),
        ];
        assert.equal(alertWatchers(ws, PHASE.HAZE, { aimingTheft: false }).length, 1);
    });
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
node --test tests/threat-phase.test.js
```

Expected: FAIL — `Cannot find module '../game/threat-phase.js'`.

- [ ] **Step 3: Write the module**

Create `game/threat-phase.js`:

```javascript
// threat-phase.js — which phase the threat overlay is in, and whose sight
// justifies it.
//
// The overlay used to be always-on, with a watcher filter of "alive, not an
// ally, has eyes". In a stealth corridor that means threat. In the town square
// it meant everyone: measured on 2026-09-06, the opening plaza selected nine
// watchers, of which eight were idle townsfolk and two of those were vendors at
// +18 disposition. One was actually hostile. Half the floor was shaded because
// the shopkeeper could see you.
//
// So attention is a state now, and the overlay expresses it:
//
//   QUIET  nobody is looking, no combat, no theft being aimed  -> draw nothing
//   HAZE   someone is suspicious or searching, or you are      -> safe ground darkens
//          lining up a theft
//   ALARM  someone is chasing, or holds you in a DIRECT cone   -> it inverts;
//          the seen ground goes hot instead
//
// The inversion between HAZE and ALARM is deliberate: opposite polarities make
// the transition read as an event rather than as a colour change.
//
// Pure leaf module — imports nothing, so it is node-testable in isolation the
// way perception.js / pathing.js / rings.js are.

export const PHASE = { QUIET: 'QUIET', HAZE: 'HAZE', ALARM: 'ALARM' };

// States that mean someone is actively looking for you.
const HAZE_STATES  = new Set(['suspicious', 'searching']);
const ALARM_STATES = new Set(['chasing']);

// Alive, not on your side, and can actually see. The floor for every phase.
function canSee(w) {
    return !!w && w.entity?.isAlive?.() && !w._ally && (w.sightRange || 0) > 0;
}

// `opts.spotted` is the caller's perceives() === DIRECT result against the
// player, passed in rather than computed here so this module stays free of
// map and geometry dependencies.
export function threatPhase(watchers, opts = {}) {
    const live = (watchers || []).filter(canSee);

    if (opts.spotted || live.some(w => ALARM_STATES.has(w.state))) return PHASE.ALARM;
    if (live.some(w => HAZE_STATES.has(w.state)))                  return PHASE.HAZE;

    // Aiming a theft brings the field back even in a calm room. This is
    // load-bearing: plans/stealth-perception-and-thieve.md rules that "the room
    // stays legible so a theft is something you can plan", and gating purely on
    // enemy state would take that away.
    if (opts.aimingTheft && live.length) return PHASE.HAZE;

    return PHASE.QUIET;
}

// Whose sight the field is built from. Scoping this to the watchers who
// justify the phase is the single change that empties the town square.
export function alertWatchers(watchers, phase, opts = {}) {
    const live = (watchers || []).filter(canSee);
    if (phase === PHASE.QUIET) return [];

    const alert = live.filter(w => HAZE_STATES.has(w.state) || ALARM_STATES.has(w.state));
    // Planning a theft needs the mark's cone even though nobody is alert yet.
    if (!alert.length && opts.aimingTheft) return live;
    return alert;
}
```

- [ ] **Step 4: Run the test again**

```bash
node --test tests/threat-phase.test.js
```

Expected: PASS, 13 tests.

- [ ] **Step 5: Retire `threatStyle`**

In `game/settings.js`: delete the `threatStyle: 'shadow'` line from `DEFAULTS` (around line 52) together with its three-line comment, and delete the `threatStyle:` line from `validate()` (around line 105). No migration is needed — `validate()` drops unknown keys by design, so a stored value falls away on next load.

Find and remove its Options row:

```bash
git grep -n "threatStyle" -- game
```

Every remaining hit must be removed. Expected afterwards: no output.

- [ ] **Step 6: Build the dither pattern**

In `game/renderer.js`, add a helper that builds the stipple **once** as a `CanvasPattern` instead of sixteen `fillRect`s per tile per frame:

```javascript
// The stipple, pre-rendered once per (colour, density) and cached.
//
// It used to be sixteen fillRects per tile per frame at TILE_PX/4 = 8 logical
// px a cell. An art pixel is 2 logical px, so that grain was four times coarser
// than the art it sat on — which is why it read as a broken tile rather than as
// shading. The cell is one art pixel now, and the tile is one fill.
_ditherPattern(color, density) {
    const key = `${color}@${density}`;
    this._ditherCache ??= new Map();
    if (this._ditherCache.has(key)) return this._ditherCache.get(key);

    const CELL = 2;             // logical px — exactly one art pixel
    const N    = 4;             // 4x4 Bayer
    const SIZE = CELL * N;      // 8 logical px per pattern tile
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

    const c = document.createElement('canvas');
    c.width = c.height = SIZE * SS;         // match the backing-store scale
    const cx = c.getContext('2d');
    cx.scale(SS, SS);
    cx.fillStyle = color;
    for (let i = 0; i < 16; i++) {
        if (BAYER[i] >= density) continue;
        cx.fillRect((i % N) * CELL, Math.floor(i / N) * CELL, CELL, CELL);
    }
    const pat = this.ctx.createPattern(c, 'repeat');
    this._ditherCache.set(key, pat);
    return pat;
}
```

`SS` is the supersample constant already imported by `renderer.js` and used at line 102.

- [ ] **Step 7: Rewrite `_drawThreatOverlay`**

Replace the body of `_drawThreatOverlay` (`renderer.js:2613` onwards). Keep the long comment block above it but update it to describe the phases — the old text describes behaviour that no longer exists.

The new shape:

1. Gather `watchers` exactly as before.
2. `const spotted = watchers.some(w => perceives(game.map, w, game.playerX, game.playerY) === VERDICT.DIRECT);`
3. `const aimingTheft = !!(game.wheel?.aiming && selectedNode(game.wheel)?.rootKey === 'thieve');` — read how `selectedNode` is actually used at `main.js:79` and match it; if it does not expose the root verb, walk the wheel cursor rather than matching on label strings.
4. `const phase = threatPhase(watchers, { inCombat: game._inCombat(), aimingTheft, spotted });`
5. `if (phase === PHASE.QUIET && !game._inCombat()) { return; }` — but always fall through to the vignette in step 9.
6. `const field = alertWatchers(watchers, phase, { aimingTheft });` and build `_threatField` from **`field`, not `watchers`**. Keep the existing per-beat cache, but add `phase` and `field.length` to the cache key so it invalidates when the phase flips.
7. Paint. Polarity depends on phase:
   - `HAZE` — paint tiles whose verdict is `NONE` (safe ground darkens), colour `'2,2,8'`, density `4`.
   - `ALARM` — paint tiles whose verdict is **not** `NONE` (seen ground goes hot), colour `'204,68,34'`, density `4`.
   Set `ctx.globalAlpha` to **0.20 maximum**, down from the old 0.55, then one `fillRect` per tile using `_ditherPattern`.
8. **Pin the pattern to world space.** `createPattern` anchors to the canvas origin, so a naive fill crawls against the tiles as the camera scrolls. Before filling, `ctx.translate(-this._scrollX % 8, -this._scrollY % 8)` inside a `save`/`restore` and offset the rects to match, or use `pattern.setTransform(new DOMMatrix().translate(...))`. The old implementation got this for free and its comment claims the pattern "is stable and never crawls" — **walk the map and confirm that still holds** before calling this done.
9. Keep channels 2, 3 and 4 exactly as they are — the facing chevron, the awareness pip, and the `DIRECT` thread. They are the colour-blind-safe channels and they now carry more weight because the field is absent more often.

Ease the phase change over ~120ms. Do **not** cross-fade polarity through a muddy midpoint: hold, swap, then ease the new phase in. `Settings.get('reduceMotion')` should skip the ease entirely.

- [ ] **Step 8: Add the combat vignette**

`renderer._arenaLevel` already exists as a smoothed 0..1 combat ramp, driven at `main.js:5214-5218` toward 1 in combat and 0 otherwise. **Ride that value — do not add a second timer.** After the field, draw a radial gradient from transparent at the centre to `rgba(0,0,0,0.35 * this._arenaLevel)` at the corners, covering the canvas. It is framing, not information, and carries no per-tile data.

- [ ] **Step 9: Verify in the browser — this is the acceptance test**

```bash
python dev-server.py 3001
```

Walk this list:
1. **Town square, on entry: nothing renders.** Eight idle townsfolk must produce a completely clean floor. This is the headline fix.
2. Open the wheel and line up a Thieve on a townsperson — the field comes back so you can find the blind spot.
3. Get someone suspicious. Haze appears, and only around the watcher who is actually looking.
4. Let them spot you. The polarity inverts, and the flip is legible as an event.
5. Enter combat. The vignette ramps in and out with `_arenaLevel`.
6. Walk while the field is up. **No crawl** — the stipple stays pinned to the world.
7. Compare against the screenshots in `plans/visual-pass.md`. It must be visibly quieter than both retired styles.

The alpha and density numbers in step 7 are starting points, not derived constants. Tune them against the real screen; the acceptance test is Caelan's eye.

- [ ] **Step 10: Run the full suite**

```bash
npm test
```

Expected: 0 failures, and the total up by 13.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat(threat): attention is a state, and the overlay expresses it

The overlay was always on, with a watcher filter of alive + not-ally +
has-eyes. In a stealth corridor that means threat; in the town square it
meant everyone. Measured in the opening plaza: nine watchers, eight of
them idle townsfolk, two of those vendors at +18 disposition, against
one actually hostile NPC - and 43% of the walkable floor shaded because
the shopkeeper could see you.

Three phases now. QUIET draws nothing. HAZE darkens safe ground when
someone is suspicious or searching, or when you are lining up a theft -
that last condition is load-bearing, because the stealth spec rules that
a theft has to be something you can plan. ALARM inverts when they find
you, and the flip is the signal.

The stipple is a cached CanvasPattern at one art pixel a cell, down from
four, at 0.20 alpha down from 0.55 - one fill per tile instead of
sixteen rects.

threatStyle is retired. The stealth spec built both treatments behind a
toggle and said the loser would be deleted after a side-by-side; that
comparison finally ran and both lost.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 6: Chest and door sprites

**Model: Sonnet.** Lowest severity — **drop this task first if the session runs long.**

**Files:**
- Modify: `game/sprites.js`, `game/renderer.js`

- [ ] **Step 1: Add the sprite entries**

Tiny Dungeon has a chest set at row 7: `(5,7)` closed, `(6,7)` open, `(7,7)` open-with-contents. Add to `game/sprites.js`:

```javascript
// Containers — replaces the procedural brown box in _drawContainers, which
// renderer.js:830 flagged as a polish-pass placeholder.
export const CONTAINER_SPRITES = {
    closed: { sheet: 'tinyDungeon', col: 5, row: 7, static: true },
    open:   { sheet: 'tinyDungeon', col: 6, row: 7, static: true },
    full:   { sheet: 'tinyDungeon', col: 7, row: 7, static: true },
};
```

- [ ] **Step 2: Draw them**

In `renderer.js`, rewrite `_drawContainers` (lines 836-871) to draw the sprite for the container's state, falling back to the existing procedural box only if the sheet has not loaded. **Delete the placeholder comment at lines 830-834** — it is no longer true.

Leave `_drawJammedDoor` (lines 1232-1259) alone. The pipe-brace X and the integrity bar carry state that no static cell communicates, and there is no barricade art in either pack. Add a one-line comment saying so, so the next reader does not re-open the question.

- [ ] **Step 3: Verify in the browser**

Find a chest in the sewer. Confirm closed, opened and emptied all read correctly, and that the contents pips still make sense (or are removed if the sprite carries the same information).

- [ ] **Step 4: Run tests and commit**

```bash
npm test
```

```bash
git add -A
git commit -m "feat(sprites): real chests

_drawContainers was a hand-drawn brown box with a gold lid stripe, which
renderer.js flagged as a step-7 polish concern. Tiny Dungeon has a
three-state chest set, so it uses that now.

Jammed doors stay procedural on purpose: the pipe-brace and integrity
bar carry state no static cell communicates, and neither pack ships
barricade art.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Closing the session

Follow the ritual in `plans/` and `CLAUDE.md` — do **not** improvise it:

1. Merge `feature/visual-pass` → `dev`.
2. **Verify the game RUNS between merges**, not just that tests pass. Restart the dev server, load it, check the console. CLAUDE.md notes this has caught real breakage twice.
3. Release notes go in an **annotated git tag**, not a CHANGELOG — this repo has none. Match the prose style of `git tag -n30 v0.21.0`.
4. Version bump lives in three files: `package.json`, `game/index.html` (`<meta name="version">`), `game/style.css` (header comment). **Leave `game/sw.js`'s `CACHE` alone.**
5. Merge `dev` → `main`, push both plus the tag.
6. Run the naming guard, which must return zero lines:

```bash
git grep -iE 'violence[ _-]+town' -- ':!CLAUDE.md' ':!plans/item-hotbar-xmb-implementation.md'
```

**Open question for Caelan, carried from Task 4 Step 3:** delete the orphaned `Sewer Monster` sprite, or spawn the creature?
