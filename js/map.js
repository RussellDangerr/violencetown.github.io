// ============================================================
// map.js — Procedural city generation
// ============================================================
//
// The city is infinite, chunk-based, and shifts over time.
//
// Structure:
//   - 4-tile-wide STREETS run in a grid pattern through each chunk
//   - SIDEWALKS line both sides of every street (1 tile wide)
//   - BUILDINGS fill the blocks between streets
//   - Building TYPE is determined by biome + position + tick-era
//   - Each "era" (tick quantized to REGEN_INTERVAL) re-rolls building
//     contents when a chunk is regenerated, so a bodega might become
//     a ruin, a ruin might become a pawn shop, etc.
//
// The gas station at chunk (0,0) is hardcoded and never shifts.

import { mulberry32, chunkSeed, SimplexNoise, weightedPick } from './utils.js';
import { TILE, TILE_BY_ID, BIOME, BIOME_LIST, GROUND_LOOT } from './data.js';

export const CHUNK_SIZE = 32;
const VIEW_RADIUS = 2;        // load chunks within this radius of the player's chunk
const REGEN_INTERVAL = 600;   // ticks between city shifts (~10 real minutes)

// Street grid spacing — produces 4-wide streets with blocks between them
const STREET_SPACING = 12;    // distance between street center-lines
const STREET_WIDTH = 4;       // road tiles wide
const SIDEWALK_WIDTH = 1;

// --- Building classes by biome ---
// Each class has a name, a char to render inside, loot potential, and a weight.
// The generator picks from these per-block based on biome.

const BUILDING_CLASSES = {
    STEALVILLE: [
        { name: 'Pawn Shop',      char: '$', loot: 'high',   weight: 3 },
        { name: 'Alley Bar',      char: '♪', loot: 'medium', weight: 3 },
        { name: 'Flophouse',      char: 'f', loot: 'low',    weight: 2 },
        { name: 'Boarded-Up',     char: 'X', loot: 'medium', weight: 2, ruined: true },
        { name: 'Fence Operation', char: '&', loot: 'high',  weight: 1 },
    ],
    SLUDGEWORKS: [
        { name: 'Chemical Plant', char: '☢', loot: 'medium', weight: 3 },
        { name: 'Scrap Yard',     char: '%', loot: 'high',   weight: 3 },
        { name: 'Pipe Works',     char: '=', loot: 'medium', weight: 2 },
        { name: 'Collapsed Mill', char: 'X', loot: 'low',    weight: 2, ruined: true },
        { name: 'Sludge Tank',    char: 'O', loot: 'low',    weight: 1, hazardous: true },
    ],
    THE_GLOW: [
        { name: 'Lab Ruin',       char: '⚗', loot: 'high',   weight: 3 },
        { name: 'Bunker',         char: 'B', loot: 'high',   weight: 2 },
        { name: 'Crater Shack',   char: '○', loot: 'medium', weight: 2 },
        { name: 'Glowing Ruin',   char: '✦', loot: 'medium', weight: 2, ruined: true },
        { name: 'Research Post',  char: 'R', loot: 'high',   weight: 1 },
    ],
    DOWNTOWN: [
        { name: 'Convenience Store', char: 'C', loot: 'medium', weight: 3 },
        { name: 'Office Building',   char: '■', loot: 'low',    weight: 3 },
        { name: 'Restaurant',        char: '♨', loot: 'medium', weight: 2 },
        { name: 'Clothing Store',    char: '♦', loot: 'medium', weight: 2 },
        { name: 'Parking Garage',    char: 'P', loot: 'low',    weight: 1 },
    ],
    OUTSKIRTS: [
        { name: 'Abandoned House', char: 'h', loot: 'low',    weight: 4 },
        { name: 'Camp',            char: '▲', loot: 'low',    weight: 3 },
        { name: 'Shed',            char: 's', loot: 'medium', weight: 2 },
        { name: 'Burnt Shell',     char: 'X', loot: 'low',    weight: 2, ruined: true },
        { name: 'Old Church',      char: '†', loot: 'medium', weight: 1 },
    ],
};

// ============================================================
// GameMap
// ============================================================

export class GameMap {
    constructor(worldSeed) {
        this.worldSeed = worldSeed;
        this.noise = new SimplexNoise(worldSeed);
        this.chunks = new Map(); // "cx,cy" → chunk object
    }

    // --- Biome assignment (stable — no tick involvement) ---

    getBiome(cx, cy) {
        // Use low-frequency noise so biomes span several chunks
        const n = this.noise.noise2D(cx * 0.08, cy * 0.08); // [-1, 1]
        // Also sample a second axis for variety
        const n2 = this.noise.noise2D(cx * 0.08 + 500, cy * 0.08 + 500);

        // Partition the 2D noise space into biomes
        if (n > 0.3)                   return BIOME.DOWNTOWN;
        if (n > 0 && n2 > 0)           return BIOME.STEALVILLE;
        if (n > 0 && n2 <= 0)          return BIOME.THE_GLOW;
        if (n > -0.3)                  return BIOME.SLUDGEWORKS;
        return BIOME.OUTSKIRTS;
    }

    // --- Chunk generation ---

    generateChunk(cx, cy, currentTick) {
        // The era incorporates time so buildings change when regenerated
        const era = Math.floor(currentTick / REGEN_INTERVAL);
        const seed = chunkSeed(cx, cy, this.worldSeed) + era;
        const rng = mulberry32(seed);
        const biome = this.getBiome(cx, cy);

        const tiles = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
        const groundItems = []; // {x, y, itemId}
        const buildingMeta = []; // {x, y, w, h, cls} for UI labels

        // --- Step 1: Fill with default ground ---
        const defaultTile = biome === BIOME.OUTSKIRTS ? TILE.GRASS.id : TILE.ROAD.id;
        tiles.fill(defaultTile);

        // --- Step 2: Lay street grid ---
        // Streets run at regular intervals, 4 tiles wide, with sidewalks
        for (let i = 0; i < CHUNK_SIZE; i++) {
            for (let j = 0; j < CHUNK_SIZE; j++) {
                const inHStreet = (j % STREET_SPACING) < STREET_WIDTH;
                const inVStreet = (i % STREET_SPACING) < STREET_WIDTH;

                if (inHStreet || inVStreet) {
                    tiles[j * CHUNK_SIZE + i] = TILE.ROAD.id;
                } else {
                    // Check if adjacent to a street → sidewalk
                    const adjH = ((j % STREET_SPACING) === STREET_WIDTH) ||
                                 (((j - 1 + STREET_SPACING) % STREET_SPACING) === STREET_WIDTH - 1);
                    const adjV = ((i % STREET_SPACING) === STREET_WIDTH) ||
                                 (((i - 1 + STREET_SPACING) % STREET_SPACING) === STREET_WIDTH - 1);
                    if (adjH || adjV) {
                        tiles[j * CHUNK_SIZE + i] = TILE.SIDEWALK.id;
                    }
                }
            }
        }

        // --- Step 3: Fill blocks with buildings ---
        // Identify the rectangular blocks between streets and stamp buildings in them
        const blocks = this._findBlocks();
        const classList = BUILDING_CLASSES[biome.name.replace(' ', '_').toUpperCase()]
                       || BUILDING_CLASSES.DOWNTOWN;

        for (const block of blocks) {
            // Should this block have a building?
            if (rng() > biome.buildingDensity) {
                // Empty lot — scatter some rubble
                this._fillEmpty(tiles, block, rng, biome);
                continue;
            }

            // Pick a building class for this block
            const cls = weightedPick(classList, rng);

            // Stamp the building
            this._stampBuilding(tiles, block, cls, rng, biome);
            buildingMeta.push({ ...block, cls });

            // Scatter ground loot inside
            this._scatterLoot(groundItems, block, biome, rng, cls);
        }

        // --- Step 4: Biome hazards ---
        if (biome.sludgeChance) {
            this._scatterHazard(tiles, TILE.SLUDGE.id, biome.sludgeChance, rng);
        }
        if (biome.radiationChance) {
            this._scatterHazard(tiles, TILE.GLOW_FLOOR.id, biome.radiationChance, rng);
        }

        // --- Step 5: Scatter dumpsters along sidewalks ---
        for (let i = 0; i < 3; i++) {
            const x = (rng() * CHUNK_SIZE) | 0;
            const y = (rng() * CHUNK_SIZE) | 0;
            if (tiles[y * CHUNK_SIZE + x] === TILE.SIDEWALK.id) {
                tiles[y * CHUNK_SIZE + x] = TILE.DUMPSTER.id;
            }
        }

        return {
            tiles,
            biome,
            groundItems,
            buildingMeta,
            generatedAt: currentTick,
            cx, cy,
        };
    }

    // --- Gas station override at (0,0) ---

    generateGasStation(currentTick) {
        const tiles = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
        const groundItems = [];
        const biome = BIOME.DOWNTOWN;

        // Fill with road
        tiles.fill(TILE.ROAD.id);

        // Streets on edges
        for (let i = 0; i < CHUNK_SIZE; i++) {
            for (let j = 0; j < STREET_WIDTH; j++) {
                tiles[j * CHUNK_SIZE + i] = TILE.ROAD.id;           // top street
                tiles[(CHUNK_SIZE - 1 - j) * CHUNK_SIZE + i] = TILE.ROAD.id; // bottom
                tiles[i * CHUNK_SIZE + j] = TILE.ROAD.id;           // left
                tiles[i * CHUNK_SIZE + (CHUNK_SIZE - 1 - j)] = TILE.ROAD.id; // right
            }
        }

        // Sidewalks around the lot
        for (let i = STREET_WIDTH; i < CHUNK_SIZE - STREET_WIDTH; i++) {
            tiles[STREET_WIDTH * CHUNK_SIZE + i] = TILE.SIDEWALK.id;
            tiles[(CHUNK_SIZE - 1 - STREET_WIDTH) * CHUNK_SIZE + i] = TILE.SIDEWALK.id;
            tiles[i * CHUNK_SIZE + STREET_WIDTH] = TILE.SIDEWALK.id;
            tiles[i * CHUNK_SIZE + (CHUNK_SIZE - 1 - STREET_WIDTH)] = TILE.SIDEWALK.id;
        }

        // Gas station building (center-ish)
        const bx = 8, by = 8, bw = 12, bh = 8;
        for (let y = by; y < by + bh; y++) {
            for (let x = bx; x < bx + bw; x++) {
                const onEdge = x === bx || x === bx + bw - 1 || y === by || y === by + bh - 1;
                tiles[y * CHUNK_SIZE + x] = onEdge ? TILE.WALL.id : TILE.FLOOR.id;
            }
        }
        // Door on south side
        tiles[(by + bh - 1) * CHUNK_SIZE + bx + Math.floor(bw / 2)] = TILE.DOOR.id;
        // Windows
        tiles[by * CHUNK_SIZE + bx + 2] = TILE.WINDOW.id;
        tiles[by * CHUNK_SIZE + bx + bw - 3] = TILE.WINDOW.id;
        // Counter inside
        tiles[(by + 2) * CHUNK_SIZE + bx + 2] = TILE.COUNTER.id;

        // Gas pumps in the forecourt
        for (let i = 0; i < 3; i++) {
            tiles[(by + bh + 2) * CHUNK_SIZE + bx + 2 + i * 4] = TILE.GAS_PUMP.id;
        }

        // Taxi in the garage area (east side of building)
        tiles[(by + 3) * CHUNK_SIZE + bx + bw + 2] = TILE.TAXI.id;

        // Player spawn: just south of the building, under the canopy
        const spawnX = bx + Math.floor(bw / 2);
        const spawnY = by + bh + 1;

        // Some starter loot
        groundItems.push({ x: bx + 4, y: by + 3, itemId: 'bandage' });
        groundItems.push({ x: bx + 6, y: by + 4, itemId: 'pipe' });

        return {
            tiles,
            biome,
            groundItems,
            buildingMeta: [{ x: bx, y: by, w: bw, h: bh, cls: { name: 'Gas Station' } }],
            generatedAt: currentTick,
            cx: 0, cy: 0,
            spawnX, spawnY,
            isGasStation: true,
        };
    }

    // --- Chunk management ---

    getOrGenerateChunk(cx, cy, currentTick) {
        const key = `${cx},${cy}`;
        if (this.chunks.has(key)) return this.chunks.get(key);

        const chunk = (cx === 0 && cy === 0)
            ? this.generateGasStation(currentTick)
            : this.generateChunk(cx, cy, currentTick);

        this.chunks.set(key, chunk);
        return chunk;
    }

    updateLoadedChunks(worldX, worldY, currentTick) {
        const pcx = Math.floor(worldX / CHUNK_SIZE);
        const pcy = Math.floor(worldY / CHUNK_SIZE);

        // Load nearby chunks
        for (let dx = -VIEW_RADIUS; dx <= VIEW_RADIUS; dx++) {
            for (let dy = -VIEW_RADIUS; dy <= VIEW_RADIUS; dy++) {
                this.getOrGenerateChunk(pcx + dx, pcy + dy, currentTick);
            }
        }

        // Unload distant chunks (they'll regenerate fresh next time — the shifting city)
        for (const [key, chunk] of this.chunks) {
            const dist = Math.abs(chunk.cx - pcx) + Math.abs(chunk.cy - pcy);
            if (dist > VIEW_RADIUS + 2) {
                // Gas station never unloads
                if (chunk.isGasStation) continue;
                this.chunks.delete(key);
            }
        }
    }

    // --- Tile access ---

    getTile(wx, wy) {
        const cx = Math.floor(wx / CHUNK_SIZE);
        const cy = Math.floor(wy / CHUNK_SIZE);
        const chunk = this.chunks.get(`${cx},${cy}`);
        if (!chunk) return TILE.WALL.id; // unloaded = impassable
        const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const ly = ((wy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        return chunk.tiles[ly * CHUNK_SIZE + lx];
    }

    getTileDef(wx, wy) {
        return TILE_BY_ID[this.getTile(wx, wy)] || TILE_BY_ID[TILE.WALL.id];
    }

    getBiomeAt(wx, wy) {
        const cx = Math.floor(wx / CHUNK_SIZE);
        const cy = Math.floor(wy / CHUNK_SIZE);
        return this.getBiome(cx, cy);
    }

    // --- Ground items ---

    getGroundItems(wx, wy) {
        const cx = Math.floor(wx / CHUNK_SIZE);
        const cy = Math.floor(wy / CHUNK_SIZE);
        const chunk = this.chunks.get(`${cx},${cy}`);
        if (!chunk) return [];
        const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const ly = ((wy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        return chunk.groundItems.filter(it => it.x === lx && it.y === ly);
    }

    removeGroundItem(wx, wy, itemId) {
        const cx = Math.floor(wx / CHUNK_SIZE);
        const cy = Math.floor(wy / CHUNK_SIZE);
        const chunk = this.chunks.get(`${cx},${cy}`);
        if (!chunk) return;
        const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const ly = ((wy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const idx = chunk.groundItems.findIndex(it => it.x === lx && it.y === ly && it.itemId === itemId);
        if (idx !== -1) chunk.groundItems.splice(idx, 1);
    }

    // --- Internal helpers ---

    /**
     * Find rectangular blocks between the street grid.
     * Returns [{x, y, w, h}] in local chunk coordinates.
     */
    _findBlocks() {
        const blocks = [];
        // Blocks sit between streets.  Street occupies columns/rows 0..SW-1
        // of each STREET_SPACING period, then sidewalk on each side.
        const innerOffset = STREET_WIDTH + SIDEWALK_WIDTH; // first usable tile after street+sidewalk
        const blockSize = STREET_SPACING - STREET_WIDTH - SIDEWALK_WIDTH * 2; // usable width

        if (blockSize < 3) return blocks; // too small to build

        for (let by = innerOffset; by + blockSize <= CHUNK_SIZE; by += STREET_SPACING) {
            for (let bx = innerOffset; bx + blockSize <= CHUNK_SIZE; bx += STREET_SPACING) {
                blocks.push({ x: bx, y: by, w: blockSize, h: blockSize });
            }
        }
        return blocks;
    }

    /**
     * Stamp a building into a block.
     */
    _stampBuilding(tiles, block, cls, rng, biome) {
        const { x, y, w, h } = block;
        const bw = Math.min(w, 3 + (rng() * (w - 2)) | 0);
        const bh = Math.min(h, 3 + (rng() * (h - 2)) | 0);
        const ox = x + ((w - bw) >> 1); // center in block
        const oy = y + ((h - bh) >> 1);

        for (let by = oy; by < oy + bh; by++) {
            for (let bx = ox; bx < ox + bw; bx++) {
                const onEdge = bx === ox || bx === ox + bw - 1 || by === oy || by === oy + bh - 1;
                if (onEdge) {
                    tiles[by * CHUNK_SIZE + bx] = cls.ruined && rng() > 0.6
                        ? TILE.RUBBLE.id
                        : TILE.WALL.id;
                } else {
                    tiles[by * CHUNK_SIZE + bx] = TILE.FLOOR.id;
                }
            }
        }

        // Door — on the south edge, roughly centered
        const doorX = ox + 1 + ((rng() * (bw - 2)) | 0);
        const doorY = oy + bh - 1;
        tiles[doorY * CHUNK_SIZE + doorX] = TILE.DOOR.id;

        // Maybe a second door on the east side for bigger buildings
        if (bw > 5 && rng() > 0.5) {
            const doorY2 = oy + 1 + ((rng() * (bh - 2)) | 0);
            tiles[doorY2 * CHUNK_SIZE + ox + bw - 1] = TILE.DOOR.id;
        }

        // Shops get a counter
        if (cls.name && (cls.name.includes('Shop') || cls.name.includes('Store') || cls.name.includes('Convenience'))) {
            if (bw > 4 && bh > 4) {
                const cy = oy + 2;
                for (let cx = ox + 2; cx < ox + bw - 2; cx++) {
                    tiles[cy * CHUNK_SIZE + cx] = TILE.COUNTER.id;
                }
            }
        }

        // Windows on north wall
        if (bw > 4) {
            tiles[oy * CHUNK_SIZE + ox + 2] = TILE.WINDOW.id;
            if (bw > 6) tiles[oy * CHUNK_SIZE + ox + bw - 3] = TILE.WINDOW.id;
        }
    }

    /**
     * Fill an empty block with sparse rubble/grass.
     */
    _fillEmpty(tiles, block, rng, biome) {
        const { x, y, w, h } = block;
        for (let by = y; by < y + h; by++) {
            for (let bx = x; bx < x + w; bx++) {
                if (rng() < 0.15) {
                    tiles[by * CHUNK_SIZE + bx] = TILE.RUBBLE.id;
                } else if (biome === BIOME.OUTSKIRTS && rng() < 0.4) {
                    tiles[by * CHUNK_SIZE + bx] = TILE.GRASS.id;
                }
            }
        }
    }

    /**
     * Scatter ground loot inside a building footprint.
     */
    _scatterLoot(groundItems, block, biome, rng, cls) {
        const lootCount = cls.loot === 'high' ? 2 + ((rng() * 2) | 0)
                        : cls.loot === 'medium' ? 1 + ((rng() * 2) | 0)
                        : rng() < 0.5 ? 1 : 0;

        const biomeName = biome.name.replace(' ', '_').toUpperCase();
        const lootTable = GROUND_LOOT[biomeName] || GROUND_LOOT.DOWNTOWN;

        for (let i = 0; i < lootCount; i++) {
            const item = weightedPick(lootTable, rng);
            const lx = block.x + 1 + ((rng() * (block.w - 2)) | 0);
            const ly = block.y + 1 + ((rng() * (block.h - 2)) | 0);
            groundItems.push({ x: lx, y: ly, itemId: item.item });
        }
    }

    /**
     * Scatter hazard tiles (sludge / radiation) on walkable non-building tiles.
     */
    _scatterHazard(tiles, hazardTileId, chance, rng) {
        for (let i = 0; i < tiles.length; i++) {
            if (tiles[i] === TILE.ROAD.id || tiles[i] === TILE.SIDEWALK.id) {
                if (rng() < chance) {
                    tiles[i] = hazardTileId;
                }
            }
        }
    }

    // --- Serialization (save nearby chunks for reload stability) ---

    saveNearby(playerX, playerY) {
        const pcx = Math.floor(playerX / CHUNK_SIZE);
        const pcy = Math.floor(playerY / CHUNK_SIZE);
        const saved = {};
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = `${pcx + dx},${pcy + dy}`;
                const chunk = this.chunks.get(key);
                if (chunk) {
                    saved[key] = {
                        tiles: Array.from(chunk.tiles),
                        groundItems: chunk.groundItems,
                        biome: chunk.biome.name,
                        cx: chunk.cx,
                        cy: chunk.cy,
                        generatedAt: chunk.generatedAt,
                        isGasStation: chunk.isGasStation || false,
                        spawnX: chunk.spawnX,
                        spawnY: chunk.spawnY,
                    };
                }
            }
        }
        return saved;
    }

    loadNearby(savedChunks) {
        for (const [key, data] of Object.entries(savedChunks)) {
            const biome = BIOME_LIST.find(b => b.name === data.biome) || BIOME.DOWNTOWN;
            this.chunks.set(key, {
                tiles: new Uint8Array(data.tiles),
                groundItems: data.groundItems || [],
                buildingMeta: [],
                biome,
                generatedAt: data.generatedAt,
                cx: data.cx,
                cy: data.cy,
                isGasStation: data.isGasStation,
                spawnX: data.spawnX,
                spawnY: data.spawnY,
            });
        }
    }
}
