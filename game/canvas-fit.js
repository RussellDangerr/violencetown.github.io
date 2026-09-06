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
// Pure leaf module — node-testable in isolation the way perception.js /
// pathing.js / rings.js are.

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
