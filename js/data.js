// ============================================================
// data.js — All game content definitions
// ============================================================

// --- Tile Types ---
// Each tile has a numeric id (stored in chunk arrays), a debug char,
// a base color, and flags that govern movement and interaction.

export const TILE = {
    ROAD:       { id: 0,  char: '.', color: '#2a2a2a', walkable: true },
    SIDEWALK:   { id: 1,  char: ':', color: '#3a3a3a', walkable: true },
    WALL:       { id: 2,  char: '#', color: '#151515', walkable: false },
    DOOR:       { id: 3,  char: '+', color: '#6b3a1f', walkable: true,  interactable: true },
    FLOOR:      { id: 4,  char: '.', color: '#1e1e18', walkable: true },
    RUBBLE:     { id: 5,  char: '~', color: '#4a4a3a', walkable: true,  slow: true },
    WATER:      { id: 6,  char: '≈', color: '#0f1f3a', walkable: false },
    GRASS:      { id: 7,  char: '"', color: '#1a2e1a', walkable: true },
    FENCE:      { id: 8,  char: '|', color: '#3d2e1f', walkable: false },
    GAS_PUMP:   { id: 9,  char: 'G', color: '#8a2222', walkable: false, interactable: true },
    DUMPSTER:   { id: 10, char: 'D', color: '#2a4a2a', walkable: false, interactable: true },
    SLUDGE:     { id: 11, char: '~', color: '#5a1a6a', walkable: true,  hazard: 'sludge' },
    GLOW_FLOOR: { id: 12, char: '.', color: '#1a3a1a', walkable: true,  hazard: 'radiation' },
    WINDOW:     { id: 13, char: '=', color: '#2a3a4a', walkable: false },
    COUNTER:    { id: 14, char: '¬', color: '#3a2a1a', walkable: false, interactable: true },
    TAXI:       { id: 15, char: 'T', color: '#ccaa00', walkable: false, interactable: true },
};

// Reverse lookup: id → tile definition
export const TILE_BY_ID = {};
for (const [key, def] of Object.entries(TILE)) {
    def.name = key;
    TILE_BY_ID[def.id] = def;
}

// --- Biome Definitions ---
// Biomes are assigned to chunks via simplex noise.  Each biome shapes
// the procedural generator's behaviour and the zone's gameplay feel.

export const BIOME = {
    STEALVILLE: {
        id: 0,
        name: 'Stealville',
        // Dense urban, narrow alleys, blind corners.  Bandit territory.
        buildingDensity: 0.7,
        roadWidth: 1,
        alleyChance: 0.5,
        palette: {
            road: '#252525', wall: '#1a1a1a', floor: '#1c1c16',
            accent: '#8a6a2a', // amber/bronze — thieves' gold
        },
    },
    SLUDGEWORKS: {
        id: 1,
        name: 'Sludgeworks',
        // Industrial wasteland, sludge pools, pipes.
        buildingDensity: 0.4,
        roadWidth: 2,
        alleyChance: 0.15,
        sludgeChance: 0.12,
        palette: {
            road: '#2a2530', wall: '#1a151f', floor: '#1e1828',
            accent: '#7a2aaa', // toxic purple
        },
    },
    THE_GLOW: {
        id: 2,
        name: 'The Glow',
        // Radiation zone.  Green everything.  Overpower/overcharge.
        buildingDensity: 0.35,
        roadWidth: 2,
        alleyChance: 0.2,
        radiationChance: 0.15,
        palette: {
            road: '#1a2a1a', wall: '#0f1f0f', floor: '#152515',
            accent: '#33ff33', // hot green
        },
    },
    DOWNTOWN: {
        id: 3,
        name: 'Downtown',
        // Contested, dense, tall buildings, all factions present.
        buildingDensity: 0.8,
        roadWidth: 2,
        alleyChance: 0.3,
        palette: {
            road: '#2e2e2e', wall: '#181818', floor: '#1e1e1e',
            accent: '#ff3333', // red — violence central
        },
    },
    OUTSKIRTS: {
        id: 4,
        name: 'The Outskirts',
        // Sparse, decayed.  UnHoused territory.  Safer.
        buildingDensity: 0.15,
        roadWidth: 1,
        alleyChance: 0.05,
        palette: {
            road: '#2a2a2a', wall: '#1c1c1c', floor: '#1a1a14',
            accent: '#6688aa', // muted blue-grey — desolate
        },
    },
};

export const BIOME_LIST = Object.values(BIOME);

// --- Building Templates ---
// Each template defines a footprint range and structural hints.
// The generator picks one that fits the available block space.

export const BUILDING_TEMPLATES = [
    { name: 'shack',       w: [3, 4],  h: [3, 4],  rooms: 1, doorSide: 'random' },
    { name: 'house',       w: [4, 6],  h: [4, 6],  rooms: [1, 2], doorSide: 'random' },
    { name: 'shop',        w: [4, 7],  h: [3, 5],  rooms: 1, doorSide: 'south', hasCounter: true },
    { name: 'warehouse',   w: [6, 10], h: [5, 8],  rooms: 0, doorSide: 'south' },
    { name: 'apartment',   w: [5, 8],  h: [6, 10], rooms: [2, 5], doorSide: 'south' },
    { name: 'gas_station', w: [10, 14], h: [7, 9], rooms: 1, doorSide: 'south', special: 'gas_station' },
    { name: 'funhouse',    w: [6, 9],  h: [6, 9],  rooms: [3, 6], doorSide: 'random' },
    { name: 'ruin',        w: [4, 8],  h: [4, 8],  rooms: 0, doorSide: 'none', ruined: true },
];

// --- Item Definitions (Phase 1 stubs — expanded later) ---
// Included now so ground-item rendering has something to reference.

export const ITEMS = {
    pipe:       { id: 'pipe',       name: 'Lead Pipe',   char: '/', tags: ['weapon', 'long', 'heavy'], damage: 8 },
    knife:      { id: 'knife',      name: 'Knife',       char: '†', tags: ['weapon', 'sharp'], damage: 12 },
    bandage:    { id: 'bandage',    name: 'Bandage',     char: '+', tags: ['consumable', 'medical'], heal: 20 },
    scrap:      { id: 'scrap',      name: 'Scrap Metal', char: '%', tags: ['material', 'heavy'] },
    fuel_can:   { id: 'fuel_can',   name: 'Fuel Can',    char: 'F', tags: ['container', 'flammable'], fuel: 25 },
    matches:    { id: 'matches',    name: 'Matches',     char: '*', tags: ['tool', 'fire_source'] },
    shoes:      { id: 'shoes',      name: 'Old Shoes',   char: 'S', tags: ['wearable', 'throwable', 'noisy'] },
    motor:      { id: 'motor',      name: 'Small Motor', char: 'M', tags: ['mechanical', 'electrical'] },
    bottle:     { id: 'bottle',     name: 'Glass Bottle',char: 'b', tags: ['throwable', 'container', 'sharp_when_broken'] },
    crowbar:    { id: 'crowbar',    name: 'Crowbar',     char: '¶', tags: ['weapon', 'tool', 'long', 'heavy'], damage: 10 },
};

// --- Ground Item Spawn Tables (per biome, weighted) ---

export const GROUND_LOOT = {
    STEALVILLE:  [
        { item: 'knife', weight: 3 }, { item: 'bottle', weight: 4 },
        { item: 'shoes', weight: 2 }, { item: 'crowbar', weight: 1 },
    ],
    SLUDGEWORKS: [
        { item: 'pipe', weight: 4 }, { item: 'scrap', weight: 5 },
        { item: 'fuel_can', weight: 2 }, { item: 'motor', weight: 2 },
    ],
    THE_GLOW: [
        { item: 'scrap', weight: 3 }, { item: 'motor', weight: 3 },
        { item: 'fuel_can', weight: 2 }, { item: 'bandage', weight: 1 },
    ],
    DOWNTOWN: [
        { item: 'knife', weight: 2 }, { item: 'bottle', weight: 3 },
        { item: 'bandage', weight: 2 }, { item: 'matches', weight: 2 },
        { item: 'crowbar', weight: 1 },
    ],
    OUTSKIRTS: [
        { item: 'pipe', weight: 3 }, { item: 'bandage', weight: 3 },
        { item: 'shoes', weight: 3 }, { item: 'scrap', weight: 2 },
    ],
};
