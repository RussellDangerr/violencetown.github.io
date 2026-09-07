// tile-coverage.test.js — every placed tile has art, and every defined tile
// is either placed or explicitly allowlisted as unplaced.
//
// Three tile ids accumulated with no map placement and no sprite entry, yet
// were defined in data.js and mapped in sprites.js: GAP (3), BOSS_TRIGGER (7),
// and GRASS (13). This is the same class of gap that let nine NPC types ship
// as red boxes. Two more, PORTCULLIS (22) and BARRICADE (23), appear in no map
// JSON but ARE placed at runtime by sewer-setpiece.js, so they are real and
// reachable. Nothing caught any of it: content-validate.js never looked at
// tiles, and no test imported the tile sprite maps at all.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TILES, TILE_BY_ID } from '../game/data.js';
import { TILE_SPRITE_MAP, TOWN_TILE_SPRITE_MAP, ZONE_TILE_SPRITE_MAP } from '../game/sprites.js';

const GAME_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'game');

// `*-map.json` matches the real maps and excludes the stale
// `*-map-TheDangerrZone.json` snapshots, which end in `-TheDangerrZone.json`.
const mapFiles = readdirSync(GAME_DIR)
    .filter(f => f.endsWith('-map.json'))
    .sort();

function loadMap(file) {
    return JSON.parse(readFileSync(join(GAME_DIR, file), 'utf8'));
}

// Tile ids knowingly left unplaced, with the reason. This list is the escape
// hatch that keeps the suite honest: an unplaced tile is either justified and
// written down here, or a bug that needs fixing. Adding to it should feel
// expensive.
const KNOWN_UNPLACED = {
    3: 'GAP — defined and mapped, placed nowhere',
    7: 'BOSS_TRIGGER — defined and mapped, placed nowhere; the legacy boss-trigger trap it belonged to was removed',
    13: 'GRASS — defined and mapped, placed nowhere, even though Town has room for it',
};

// Tile ids placed at runtime rather than authored in a map JSON. Each entry
// names the source that places it, so a map sweep can still verify reality.
const RUNTIME_PLACED = {
    22: 'PORTCULLIS — placed by sewer-setpiece.js during the escape gauntlet',
    23: 'BARRICADE — placed by sewer-setpiece.js during the escape gauntlet',
};

// Combine all three sprite maps into one lookup (they may overlap by design;
// a tile can appear in multiple zone maps).
const allTileMaps = {
    ...TILE_SPRITE_MAP,
    ...TOWN_TILE_SPRITE_MAP,
    ...ZONE_TILE_SPRITE_MAP,
};

describe('tile coverage', () => {
    test('the map sweep actually found maps', () => {
        assert.ok(mapFiles.length >= 10, `only found ${mapFiles.length} map files`);
    });

    test('every tile id placed in a map JSON has a sprite entry', () => {
        const missing = [];
        for (const file of mapFiles) {
            const map = loadMap(file);
            if (!map.tiles || !Array.isArray(map.tiles)) continue;

            for (let index = 0; index < map.tiles.length; index++) {
                const tileId = map.tiles[index];
                // Tile ids 0 and 10 are intentional null fallbacks (WALL, TOWN_WALL).
                if (tileId === 0 || tileId === 10) continue;

                if (!(tileId in allTileMaps)) {
                    const x = index % map.width;
                    const y = Math.floor(index / map.width);
                    missing.push(`${file} at (${x}, ${y}): id ${tileId}`);
                }
            }
        }
        assert.deepEqual(missing, [], `tiles with no sprite:\n  ${missing.join('\n  ')}`);
    });

    test('every tile id defined in data.js TILES has a sprite entry', () => {
        const missing = [];
        for (const [name, def] of Object.entries(TILES)) {
            const id = def.id;
            // Intentional dark fallbacks (id 0 WALL, id 10 TOWN_WALL).
            if (id === 0 || id === 10) continue;

            if (!(id in allTileMaps)) {
                missing.push(`${name} (id ${id})`);
            }
        }
        assert.deepEqual(missing, [], `defined tiles with no sprite:\n  ${missing.join('\n  ')}`);
    });

    test('every defined tile id is either placed in a map, placed at runtime, or explicitly allowlisted', () => {
        const placed = new Set();
        const unknown = [];

        // Scan all maps for placed tiles.
        for (const file of mapFiles) {
            const map = loadMap(file);
            if (!map.tiles || !Array.isArray(map.tiles)) continue;
            for (const tileId of map.tiles) {
                placed.add(tileId);
            }
        }

        // Check each defined tile.
        for (const [name, def] of Object.entries(TILES)) {
            const id = def.id;
            if (placed.has(id) || RUNTIME_PLACED[id] || KNOWN_UNPLACED[id]) continue;
            unknown.push(`${name} (id ${id})`);
        }

        assert.deepEqual(unknown, [], `tiles placed nowhere, runtime or allowlisted:\n  ${unknown.join('\n  ')}`);
    });

    test('the known-unplaced list has not gone stale', () => {
        const placed = new Set();
        for (const file of mapFiles) {
            const map = loadMap(file);
            if (!map.tiles || !Array.isArray(map.tiles)) continue;
            for (const tileId of map.tiles) {
                placed.add(tileId);
            }
        }

        for (const id of Object.keys(KNOWN_UNPLACED)) {
            const numId = Number(id);
            assert.ok(
                !placed.has(numId),
                `id ${numId} now appears in a map — remove it from KNOWN_UNPLACED`,
            );
        }
    });
});
