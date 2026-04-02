// map.js — Static map loader for hand-crafted levels
// Sewer demo prototype

import { TILE_BY_ID } from './data.js';

export class GameMap {
    constructor(mapData, mapUrl) {
        this.url     = mapUrl;
        this.width   = mapData.width;
        this.height  = mapData.height;
        this.spawn   = mapData.spawn;
        this.bossRoom = mapData.bossRoom || null;
        this.zoneName = mapData.zoneName || 'UNKNOWN';
        this.tiles   = new Uint8Array(mapData.tiles);

        this.enemySpawns = mapData.enemies || [];
        this.itemSpawns  = mapData.items || [];

        // Transitions: [{ x, y, toMap, toX, toY, label }]
        this.transitions = mapData.transitions || [];
    }

    getTile(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return 0;
        return this.tiles[y * this.width + x];
    }

    getTileDef(x, y) {
        const id = this.getTile(x, y);
        return TILE_BY_ID[id] || TILE_BY_ID[0];
    }

    isWalkable(x, y) {
        return this.getTileDef(x, y).walkable;
    }

    isInBounds(x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }

    // Check if a position has a map transition
    getTransition(x, y) {
        return this.transitions.find(t => t.x === x && t.y === y) || null;
    }
}

// ── Loader ───────────────────────────────────────────────────────────────────

export async function loadMap(url) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to load map: ${resp.status}`);
    const data = await resp.json();
    return new GameMap(data, url);
}
