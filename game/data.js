// data.js — tile types, constants, sprite mappings
// Sewer demo prototype

// ── Tile Types ───────────────────────────────────────────────────────────────

export const TILES = {
    // Sewer tiles (0-7)
    WALL:         { id: 0, walkable: false, hazard: null, fallbackColor: '#1c1510' },
    FLOOR:        { id: 1, walkable: true,  hazard: null, fallbackColor: '#2a2a3a' },
    SLUDGE:       { id: 2, walkable: true,  hazard: 'sludge', fallbackColor: '#3c145a' },
    GAP:          { id: 3, walkable: true,  hazard: null, fallbackColor: '#1e1e30' },
    GRATE:        { id: 4, walkable: false, hazard: null, fallbackColor: '#333340' },
    DRAIN:        { id: 5, walkable: true,  hazard: null, fallbackColor: '#252535' },
    BOSS_FLOOR:   { id: 6, walkable: true,  hazard: null, fallbackColor: '#2e1a3e' },
    BOSS_TRIGGER: { id: 7, walkable: true,  hazard: null, fallbackColor: '#5a1a6a' },

    // Town tiles (10-19)
    TOWN_WALL:    { id: 10, walkable: false, hazard: null, fallbackColor: '#4a3a2a' },
    SIDEWALK:     { id: 11, walkable: true,  hazard: null, fallbackColor: '#8a8a7a' },
    ROAD:         { id: 12, walkable: true,  hazard: null, fallbackColor: '#555555' },
    GRASS:        { id: 13, walkable: true,  hazard: null, fallbackColor: '#2a5a2a' },
    BUILDING:     { id: 14, walkable: false, hazard: null, fallbackColor: '#6a5a4a' },
    DOOR:         { id: 15, walkable: true,  hazard: null, fallbackColor: '#8b6914' },
    SEWER_ENTRY:  { id: 16, walkable: true,  hazard: null, fallbackColor: '#2a1a0a' },
    FENCE:        { id: 17, walkable: false, hazard: null, fallbackColor: '#5a4a3a' },
    STREETLIGHT:  { id: 18, walkable: false, hazard: null, fallbackColor: '#4a4a4a' },
    CAR:          { id: 19, walkable: false, hazard: null, fallbackColor: '#884444' },
    BENCH:        { id: 20, walkable: false, hazard: null, fallbackColor: '#6a5a3a' },
    TRASHCAN:     { id: 21, walkable: false, hazard: null, fallbackColor: '#4a5a4a' },
};

// Reverse lookup: id → tile def
export const TILE_BY_ID = {};
for (const [key, def] of Object.entries(TILES)) {
    def.name = key;
    TILE_BY_ID[def.id] = def;
}

// ── Constants ────────────────────────────────────────────────────────────────

export const TILE_PX = 32;
export const VIEW_TILES = 19;       // odd number, player at center
export const CANVAS_PX = TILE_PX * VIEW_TILES; // 608

export const PLAYER_MAX_HP = 100;
export const SLUDGE_DOT = 5;
export const INVENTORY_SIZE = 10;
export const MAX_STACK = 99;

// ── Direction helpers ────────────────────────────────────────────────────────

export const DIR_NAMES = {
    '0,-1':  'North',
    '0,1':   'South',
    '-1,0':  'West',
    '1,0':   'East',
    '-1,-1': 'NW',
    '1,-1':  'NE',
    '-1,1':  'SW',
    '1,1':   'SE',
};
