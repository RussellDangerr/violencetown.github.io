// sprite-variants.test.js — spriteVariant() picks a deterministic, varied cell
// per entity from a type's `variants` pool, and leaves non-pooled entries alone.
//
// Violencian used to be one hardcoded cell (tinyDungeon 4,7) shared by every
// townsperson, so the whole town read as eight copies of the player (who sits
// at 1,7 in the same sheet). It now carries a five-cell `variants` pool and
// spriteVariant() picks one per entity, keyed on the entity's id so a given
// citizen always looks the same. These tests cover the picker itself;
// sprite-coverage.test.js separately checks that the pool's cells don't
// collide with other types co-located in the same map.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY_SPRITES, spriteVariant } from '../game/sprites.js';

// The eight real Violencian spawns in game/town-map.json (townie-hooch on
// that same map is a Bootlegger, not a Violencian, so it's excluded).
const TOWN_VIOLENCIAN_IDS = [
    'townie-w', 'townie-e', 'townie-s', 'townie-mince', 'townie-glunk',
    'townie-praline', 'townie-knuckles', 'townie-macc',
];

describe('spriteVariant', () => {
    test('is deterministic — same id, same cell, every call', () => {
        const info = ENEMY_SPRITES['Violencian'];
        const first = spriteVariant(info, { id: 'townie-w', x: 8, y: 12 });
        for (let i = 0; i < 10; i++) {
            // Fresh object literal each time, same id — determinism must key
            // off the id's value, not off a cached object reference.
            const again = spriteVariant(info, { id: 'townie-w', x: 8, y: 12 });
            assert.equal(again.col, first.col);
            assert.equal(again.row, first.row);
        }
    });

    test('the 8 real town Violencian ids spread across at least 3 of the 5 variants', () => {
        const info = ENEMY_SPRITES['Violencian'];
        const hit = new Set();
        for (const id of TOWN_VIOLENCIAN_IDS) {
            const v = spriteVariant(info, { id });
            hit.add(`${v.col},${v.row}`);
        }
        // Not an exact distribution assertion (that would bake the hash
        // function's specific output into the test) — just proof the hash
        // actually spreads real ids around the pool instead of collapsing
        // them onto one or two cells.
        assert.ok(
            hit.size >= 3,
            `only ${hit.size} distinct variant(s) hit across ${TOWN_VIOLENCIAN_IDS.length} town ids — hash is collapsing`,
        );
    });

    test('an entry with no variants is returned unchanged, not copied', () => {
        const info = ENEMY_SPRITES['Pike']; // plain {sheet,col,row,static}, no variants
        assert.equal(info.variants, undefined, 'test fixture assumption: Pike has no variants pool');
        const result = spriteVariant(info, { id: 'anything' });
        assert.equal(result, info, 'expected the exact same object back, not a copy');
    });

    test('an entity with no id falls back to position, and different positions can differ', () => {
        const info = ENEMY_SPRITES['Violencian'];

        // Same position, no id: still stable across repeated calls.
        const a1 = spriteVariant(info, { x: 3, y: 5 });
        const a2 = spriteVariant(info, { x: 3, y: 5 });
        assert.equal(a1.col, a2.col);
        assert.equal(a1.row, a2.row);

        // Sweep enough distinct id-less positions that a working fallback
        // must produce more than one cell — guards against a fallback that
        // silently ignores position and always returns the same variant.
        const hit = new Set();
        for (let x = 0; x < 6; x++) {
            for (let y = 0; y < 6; y++) {
                const v = spriteVariant(info, { x, y });
                hit.add(`${v.col},${v.row}`);
            }
        }
        assert.ok(hit.size > 1, 'position fallback never varies — every id-less entity gets the same cell');
    });

    test('every cell in the Violencian pool is distinct', () => {
        const { variants } = ENEMY_SPRITES['Violencian'];
        const seen = new Set();
        for (const { col, row } of variants) seen.add(`${col},${row}`);
        assert.equal(seen.size, variants.length, 'duplicate cell(s) in the Violencian variant pool');
    });

    test('Violencian.col/row mirror variants[0], for flat-shape consumers', () => {
        const info = ENEMY_SPRITES['Violencian'];
        assert.equal(info.col, info.variants[0].col);
        assert.equal(info.row, info.variants[0].row);
    });
});
