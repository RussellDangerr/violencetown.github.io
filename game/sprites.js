// sprites.js — Spritesheet loader and tile/region extraction
// Sewer demo prototype

export class SpriteSheet {
    constructor(src, frameW, frameH) {
        this.img     = new Image();
        this.frameW  = frameW;
        this.frameH  = frameH;
        this.loaded  = false;
        this.failed  = false;

        this._promise = new Promise((resolve) => {
            this.img.onload = () => {
                this.loaded = true;
                this.cols = Math.floor(this.img.width / frameW);
                this.rows = Math.floor(this.img.height / frameH);
                resolve(true);
            };
            this.img.onerror = () => {
                this.failed = true;
                resolve(false);
            };
            this.img.src = src;
        });
    }

    get ready() { return this._promise; }

    // Draw by grid (col, row)
    drawFrame(ctx, col, row, x, y, destW, destH) {
        if (!this.loaded) return false;
        ctx.drawImage(
            this.img,
            col * this.frameW, row * this.frameH,
            this.frameW, this.frameH,
            x, y, destW ?? this.frameW, destH ?? this.frameH
        );
        return true;
    }

    // Draw by pixel region (for variable-sized sprites)
    drawRegion(ctx, sx, sy, sw, sh, dx, dy, dw, dh) {
        if (!this.loaded) return false;
        ctx.drawImage(this.img, sx, sy, sw, sh, dx, dy, dw ?? sw, dh ?? sh);
        return true;
    }
}

// ── Asset paths ──────────────────────────────────────────────────────────────

const A = '../assets';

export const SHEETS = {
    // Sewer
    sewerTiles:   { src: `${A}/fungus-cave/Tilesets/Tileset - Sewers 32x32.png`, frameW: 32, frameH: 32 },
    caveTiles:    { src: `${A}/fungus-cave/Tilesets/Tileset - Fungus cave and Refugee outpost 32x32.png`, frameW: 32, frameH: 32 },
    fungusViolet: { src: `${A}/fungus-cave/Characters/Fungus - violet.png`, frameW: 16, frameH: 32 },
    fungusRed:    { src: `${A}/fungus-cave/Characters/Fungus - red.png`, frameW: 16, frameH: 32 },
    fungusKing:   { src: `${A}/fungus-cave/Characters/Fungus - King.png`, frameW: 16, frameH: 32 },
    sewerMonster: { src: `${A}/fungus-cave/Characters/Sewers monster.png`, frameW: 16, frameH: 32 },
    ghostMonster: { src: `${A}/fungus-cave/Characters/Sewers monster - ghost.png`, frameW: 16, frameH: 32 },
    player:       { src: `${A}/fungus-cave/Characters/Cleric.png`, frameW: 16, frameH: 32 },
    boss:         { src: `${A}/fungus-cave/Battlers/BOSS.png`, frameW: 155, frameH: 135 },

    // Town (Modern Exteriors)
    townTerrains: { src: `${A}/modern-exteriors/Modern_Exteriors_32x32/ME_Theme_Sorter_32x32/1_Terrains_and_Fences_32x32.png`, frameW: 32, frameH: 32 },
    cityTerrains: { src: `${A}/modern-exteriors/Modern_Exteriors_32x32/ME_Theme_Sorter_32x32/2_City_Terrains_32x32.png`, frameW: 32, frameH: 32 },
    cityProps:    { src: `${A}/modern-exteriors/Modern_Exteriors_32x32/ME_Theme_Sorter_32x32/3_City_Props_32x32.png`, frameW: 32, frameH: 32 },
    buildings:    { src: `${A}/modern-exteriors/Modern_Exteriors_32x32/ME_Theme_Sorter_32x32/4_Generic_Buildings_32x32.png`, frameW: 32, frameH: 32 },

    // Items (Modern Interiors)
    grocery:      { src: `${A}/modern-interiors/1_Interiors/32x32/Theme_Sorter_32x32/16_Grocery_store_32x32.png`, frameW: 32, frameH: 32 },

    // UI
    uiStyle1:     { src: `${A}/modern-ui/32x32/Modern_UI_Style_1_32x32.png`, frameW: 32, frameH: 32 },
    uiStyle2:     { src: `${A}/modern-ui/32x32/Modern_UI_Style_2_32x32.png`, frameW: 32, frameH: 32 },
};

// ── Sewer tile sprite mappings ───────────────────────────────────────────────
// Sewers tileset (256x352, 8 cols x 11 rows):
// Cols 0-3 rows 0-3: Brick border frame, interior = floor
// Cols 4-7 rows 0-3: Purple sludge pool

export const TILE_SPRITE_MAP = {
    0: null,                  // wall — fallback color
    1: { col: 1, row: 1 },   // floor — dark stone interior
    2: { col: 7, row: 9 },   // sludge — bright purple from bottom-right of sheet
    3: { col: 2, row: 2 },   // gap — floor variant
    4: null,                  // grate — fallback
    5: { col: 2, row: 1 },   // drain — floor variant
    6: { col: 1, row: 2 },   // boss floor
    7: { col: 6, row: 1 },   // boss trigger
};

// ── Town tile sprite mappings ────────────────────────────────────────────────
// Terrains sheet (1024x2368, 32 cols x 74 rows):
// The green grass 9-slice set starts around row 1. Interior fill = (2, 2)
// The grey stone 9-slice set is around col 8+, row 3+. Interior fill = (10, 4)
// Brown brick path: around col 0, row 4+. Interior fill = (2, 5)
//
// These are approximations — may need visual tweaking.

// Town tiles use pixel-region references from the large exterior sheets.
// Format: { sheet, x, y, w, h } for drawRegion (not grid-based).
// 'region' flag tells the renderer to use drawRegion instead of drawFrame.
export const TOWN_TILE_SPRITE_MAP = {
    10: null,  // town wall edge — keep dark fallback
    11: { region: true, sheet: 'cityTerrains', x: 0,   y: 128, w: 32, h: 32 },  // sidewalk — concrete edge from city block
    12: { region: true, sheet: 'cityTerrains', x: 384, y: 128, w: 32, h: 32 },  // road — grey asphalt from city block interior
    13: { region: true, sheet: 'townTerrains', x: 32,  y: 64,  w: 32, h: 32 },  // grass — green interior from terrains
    14: { region: true, sheet: 'buildings',     x: 0,   y: 64,  w: 32, h: 32 },  // building wall — brick facade
    15: { region: true, sheet: 'buildings',     x: 128, y: 160, w: 32, h: 32 },  // door — from building doorways
    16: null,  // sewer entry — dark fallback (manhole)
    17: null,  // fence — fallback
    18: null,  // streetlight — fallback (multi-tile, hard to do in 1x1)
    19: { region: true, sheet: 'cityProps',     x: 0,   y: 6848, w: 32, h: 32 }, // car — red vehicle from bottom of props
    20: null,  // bench — fallback
    21: null,  // trash can — fallback
};

// ── Item sprites ─────────────────────────────────────────────────────────────
// Map item IDs to sprite regions (sheet + pixel coords)
// These use drawRegion() for pixel-precise extraction from large sheets

// Item sprites from Fungus Cave + Refugee Outpost tileset (256x1120, 8 cols x 35 rows)
// Row 8 (y=256): wooden crates/boxes
// Row 9 (y=288): barrels with colored liquids at cols 6-7
// Row 13 (y=416): mushrooms and small plants
// Row 14 (y=448): bags, sacks
export const ITEM_SPRITES = {
    rock:    { sheet: 'caveTiles', x: 0,   y: 256, w: 32, h: 32 },  // wooden crate (row 8, col 0)
    pipe:    { sheet: 'caveTiles', x: 192, y: 256, w: 32, h: 32 },  // tool/axe (row 8, col 6)
    soap:    { sheet: 'caveTiles', x: 192, y: 288, w: 32, h: 32 },  // barrel with blue liquid (row 9, col 6)
    bandage: { sheet: 'caveTiles', x: 0,   y: 416, w: 32, h: 32 },  // red mushroom (row 13, col 0)
};

// ── Enemy sprites ────────────────────────────────────────────────────────────

export const ENEMY_SPRITES = {
    'Violet Fungus': { sheet: 'fungusViolet', col: 1, row: 0 },
    'Red Fungus':    { sheet: 'fungusRed',    col: 1, row: 0 },
    'Fungus King':   { sheet: 'fungusKing',   col: 1, row: 0 },
    'Ghost Fungus':  { sheet: 'ghostMonster', col: 1, row: 0 },
    'Sewer Monster': { sheet: 'sewerMonster', col: 1, row: 0 },
};

// ── Loader ───────────────────────────────────────────────────────────────────

export async function loadAllSprites() {
    const loaded = {};
    const promises = [];

    for (const [key, def] of Object.entries(SHEETS)) {
        const sheet = new SpriteSheet(def.src, def.frameW, def.frameH);
        loaded[key] = sheet;
        promises.push(sheet.ready);
    }

    await Promise.all(promises);

    let ok = 0, fail = 0;
    for (const [, sheet] of Object.entries(loaded)) {
        if (sheet.loaded) ok++; else fail++;
    }

    return { sheets: loaded, ok, fail };
}
