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
                // Below one art-pixel step (avail * dpr < ART_STEP) there is no
                // positive multiple of ART_STEP that fits at all — that's the
                // documented dead zone where pickCanvasCss is allowed to overflow
                // rather than return 0 (see the "never returns zero" test below,
                // which exercises exactly this case at avail=10).
                if (avail * dpr < ART_STEP) continue;
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
