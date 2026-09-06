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
        // ALL_ITEM_IDS is a Set (game/item-registry.js), not an array — .has(),
        // not .includes().
        const unknown = Object.keys(ITEM_SPRITES).filter(id => !ALL_ITEM_IDS.has(id));
        assert.deepEqual(unknown, [], `art for items that do not exist: ${unknown.join(', ')}`);
    });

    test('no poition falls through to the generic ? glyph', () => {
        // ALL_ITEM_IDS is a Set; spread to an array before filtering.
        const poitions = [...ALL_ITEM_IDS].filter(id => id.endsWith('_poition'));
        assert.ok(poitions.length >= 6, `only found ${poitions.length} poitions`);
        const bare = poitions.filter(id => !ITEM_SPRITES[id]);
        assert.deepEqual(bare, [], `poitions with no icon: ${bare.join(', ')}`);
    });
});
