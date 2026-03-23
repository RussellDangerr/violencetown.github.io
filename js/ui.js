// ============================================================
// ui.js — Canvas rendering and DOM panel updates
// ============================================================

import { TILE_BY_ID, ITEMS } from './data.js';
import { escapeHtml } from './utils.js';

const TILE_PX = 24;
const VIEW_TILES = 21; // odd so player is always centered
const CANVAS_PX = TILE_PX * VIEW_TILES;

export class GameUI {
    constructor({ canvas, log, status, queue, tickBar, biomeLabel }) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        canvas.width = CANVAS_PX;
        canvas.height = CANVAS_PX;

        this.logEl = log;
        this.statusEl = status;
        this.queueEl = queue;
        this.tickBarEl = tickBar;
        this.biomeLabelEl = biomeLabel;

        this.logLines = [];
    }

    // --- Map rendering ---

    renderMap(gameMap, playerX, playerY) {
        const ctx = this.ctx;
        const half = (VIEW_TILES - 1) / 2;

        ctx.clearRect(0, 0, CANVAS_PX, CANVAS_PX);

        for (let vy = 0; vy < VIEW_TILES; vy++) {
            for (let vx = 0; vx < VIEW_TILES; vx++) {
                const wx = playerX - half + vx;
                const wy = playerY - half + vy;
                const tileId = gameMap.getTile(wx, wy);
                const tileDef = TILE_BY_ID[tileId];
                const px = vx * TILE_PX;
                const py = vy * TILE_PX;

                if (!tileDef) {
                    ctx.fillStyle = '#000';
                    ctx.fillRect(px, py, TILE_PX, TILE_PX);
                    continue;
                }

                // Tile background — use biome palette tinting
                const biome = gameMap.getBiomeAt(wx, wy);
                ctx.fillStyle = this._tintTile(tileDef, biome);
                ctx.fillRect(px, py, TILE_PX, TILE_PX);

                // Tile character (subtle)
                ctx.fillStyle = 'rgba(255,255,255,0.08)';
                ctx.font = '11px "Fira Code", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(tileDef.char, px + TILE_PX / 2, py + TILE_PX / 2);

                // Ground items on this tile
                const groundItems = gameMap.getGroundItems(wx, wy);
                if (groundItems.length > 0) {
                    const itemDef = ITEMS[groundItems[0].itemId];
                    if (itemDef) {
                        ctx.fillStyle = '#ccaa44';
                        ctx.font = 'bold 12px "Fira Code", monospace';
                        ctx.fillText(itemDef.char, px + TILE_PX / 2, py + TILE_PX / 2);
                    }
                }
            }
        }

        // Player at center
        const cpx = half * TILE_PX + TILE_PX / 2;
        const cpy = half * TILE_PX + TILE_PX / 2;

        // Player glow
        ctx.shadowColor = '#ff3333';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 18px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('@', cpx, cpy);
        ctx.shadowBlur = 0;

        // Grid lines (very subtle)
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= VIEW_TILES; i++) {
            ctx.beginPath();
            ctx.moveTo(i * TILE_PX, 0);
            ctx.lineTo(i * TILE_PX, CANVAS_PX);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * TILE_PX);
            ctx.lineTo(CANVAS_PX, i * TILE_PX);
            ctx.stroke();
        }
    }

    _tintTile(tileDef, biome) {
        // For hazard tiles, use their own color directly
        if (tileDef.hazard) return tileDef.color;

        // Use biome palette for structural tiles
        if (biome && biome.palette) {
            if (tileDef.name === 'ROAD' || tileDef.name === 'SIDEWALK') return biome.palette.road || tileDef.color;
            if (tileDef.name === 'WALL') return biome.palette.wall || tileDef.color;
            if (tileDef.name === 'FLOOR') return biome.palette.floor || tileDef.color;
        }
        return tileDef.color;
    }

    // --- Status panel ---

    updateStatus(player, tick) {
        const minutes = tick % 60;
        const hours = Math.floor(tick / 60) % 24;
        const days = Math.floor(tick / 1440);
        const time = `Day ${days + 1}, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

        this.statusEl.innerHTML = `
            <div class="stat-row"><span class="stat-label">HP</span> <span class="stat-hp">${player.hp}/${player.maxHp}</span></div>
            <div class="stat-row"><span class="stat-label">Pos</span> <span>${player.worldX}, ${player.worldY}</span></div>
            <div class="stat-row"><span class="stat-label">Time</span> <span>${escapeHtml(time)}</span></div>
            <div class="stat-row"><span class="stat-label">Tick</span> <span>#${tick}</span></div>
        `;
    }

    // --- Biome label ---

    updateBiome(biome) {
        if (this.biomeLabelEl && biome) {
            this.biomeLabelEl.textContent = biome.name;
            this.biomeLabelEl.style.color = biome.palette?.accent || '#ccc';
        }
    }

    // --- Action queue display ---

    updateActionQueue(actions) {
        if (actions.length === 0) {
            this.queueEl.innerHTML = '<span class="queue-empty">No action queued — you\'ll stand still</span>';
            return;
        }
        this.queueEl.innerHTML = actions.map(a => {
            let label = a.type;
            if (a.type === 'move') {
                const dirs = {
                    '0,-1': '↑N', '0,1': '↓S', '-1,0': '←W', '1,0': '→E',
                    '-1,-1': '↖NW', '1,-1': '↗NE', '-1,1': '↙SW', '1,1': '↘SE',
                };
                label = dirs[`${a.dx},${a.dy}`] || 'move';
            }
            return `<span class="queue-pill">${escapeHtml(label)}</span>`;
        }).join('');
    }

    // --- Text log ---

    log(msg) {
        this.logLines.push(msg);
        if (this.logLines.length > 200) this.logLines.shift();

        const div = document.createElement('div');
        div.className = 'log-line';
        div.textContent = msg; // textContent = safe, no innerHTML needed
        this.logEl.appendChild(div);

        // Trim DOM if too many
        while (this.logEl.children.length > 200) {
            this.logEl.removeChild(this.logEl.firstChild);
        }

        this.logEl.scrollTop = this.logEl.scrollHeight;
    }

    logSpacer() {
        const hr = document.createElement('div');
        hr.className = 'log-spacer';
        this.logEl.appendChild(hr);
        this.logEl.scrollTop = this.logEl.scrollHeight;
    }

    // --- Tick bar animation ---

    startTickBar(tickMs) {
        // Reset to full
        this.tickBarEl.style.transition = 'none';
        this.tickBarEl.style.width = '100%';
        this.tickBarEl.classList.remove('urgent');

        // Force reflow then animate to 0
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.tickBarEl.style.transition = `width ${tickMs}ms linear`;
                this.tickBarEl.style.width = '0%';
            });
        });

        // Add urgency class for last 2 seconds
        this._urgencyTimeout = setTimeout(() => {
            this.tickBarEl.classList.add('urgent');
        }, tickMs - 2000);
    }

    clearTickBar() {
        clearTimeout(this._urgencyTimeout);
        this.tickBarEl.style.transition = 'none';
        this.tickBarEl.style.width = '100%';
        this.tickBarEl.classList.remove('urgent');
    }

    // --- Screen flash (for damage, events) ---

    flash(color = '#ff0000') {
        this.canvas.style.boxShadow = `inset 0 0 40px ${color}`;
        setTimeout(() => { this.canvas.style.boxShadow = 'none'; }, 200);
    }
}
