// ============================================================
// main.js — Game loop, tick timer, input, save/load
// ============================================================

import { GameMap } from './map.js';
import { Player } from './player.js';
import { GameUI } from './ui.js';

const TICK_MS = 10000;         // 10 seconds max per tick
const RESOLVE_MS = 150;        // brief pause during tick resolution
const SAVE_KEY = 'violencetown_save';

class Game {
    constructor() {
        // Load or create game state
        const save = this._loadSave();

        this.worldSeed = save?.worldSeed ?? (Date.now() ^ 0xCAB);
        this.tick = save?.tick ?? 0;
        this.map = new GameMap(this.worldSeed);
        this.paused = false;
        this.started = false;
        this.resolving = false;   // true during the brief resolve animation
        this.tickTimer = null;

        // Restore saved chunks first so the player's surroundings are stable
        if (save?.chunks) {
            this.map.loadNearby(save.chunks);
        }

        // Player
        if (save?.player) {
            this.player = Player.fromJSON(save.player);
        } else {
            // New game — generate gas station and find spawn point
            const gasStation = this.map.getOrGenerateChunk(0, 0, this.tick);
            this.player = new Player(gasStation.spawnX || 14, gasStation.spawnY || 17);
        }

        // UI
        this.ui = new GameUI({
            canvas:     document.getElementById('game-canvas'),
            log:        document.getElementById('text-log'),
            status:     document.getElementById('status-panel'),
            queue:      document.getElementById('action-queue'),
            tickBar:    document.getElementById('tick-bar'),
            biomeLabel: document.getElementById('biome-label'),
        });

        // DOM refs for splash
        this.splashEl = document.getElementById('splash');
        this.gameWrapperEl = document.getElementById('game-wrapper');
        this.canvasContainer = document.getElementById('canvas-container');

        this._bindInput();

        // Pre-render the map behind the splash so it's ready
        this.map.updateLoadedChunks(this.player.worldX, this.player.worldY, this.tick);
        this._render();
    }

    // --- Splash / Start ---

    _dismissSplash() {
        if (this.started) return;
        this.started = true;
        this.splashEl.classList.add('gone');
        this.gameWrapperEl.classList.remove('hidden');

        this.ui.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        this.ui.log('  V I O L E N C E T O W N');
        this.ui.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        this.ui.log('');
        this.ui.log('[opening flavor text — waking up at gas station]');
        this.ui.log('[setting the scene — the city around you]');
        this.ui.log('');
        this.ui.log('WASD / Arrows — move (hold two for diagonal)');
        this.ui.log('Space — EXECUTE (resolve tick now)');
        this.ui.log('E — pick up items');
        this.ui.log('Esc — clear queued action');
        this.ui.log('P — pause');
        this.ui.log('');
        this.ui.log('Queue actions, then hit Space. Or wait 10s.');
        this.ui.logSpacer();

        this._render();
        this._startTick();
    }

    // --- Input ---

    _bindInput() {
        // Track which direction keys are currently held for diagonal support
        this._heldDirs = { x: 0, y: 0 };

        const dirKeys = {
            ArrowUp: 'y-', w: 'y-', W: 'y-',
            ArrowDown: 'y+', s: 'y+', S: 'y+',
            ArrowLeft: 'x-', a: 'x-', A: 'x-',
            ArrowRight: 'x+', d: 'x+', D: 'x+',
        };

        // Splash screen listeners
        const goBtn = document.getElementById('splash-go');
        if (goBtn) goBtn.addEventListener('click', () => this._dismissSplash());

        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Space on splash = start
            if (!this.started && e.key === ' ') {
                e.preventDefault();
                this._dismissSplash();
                return;
            }

            if (!this.started || this.resolving) return;

            // Direction keys — track held state and queue combined direction
            if (dirKeys[e.key]) {
                e.preventDefault();
                if (this.paused) return;

                const dir = dirKeys[e.key];
                if (dir === 'x-') this._heldDirs.x = -1;
                if (dir === 'x+') this._heldDirs.x = 1;
                if (dir === 'y-') this._heldDirs.y = -1;
                if (dir === 'y+') this._heldDirs.y = 1;

                this._queueFromHeld();
                return;
            }

            switch (e.key) {
                case ' ':
                    // SPACE = resolve tick immediately
                    e.preventDefault();
                    if (!this.paused) this._resolveTickNow();
                    break;

                case 'e':
                case 'E':
                    e.preventDefault();
                    if (!this.paused) {
                        this.player.queueAction({ type: 'pickup' });
                        this.ui.updateActionQueue(this.player.actionQueue);
                    }
                    break;

                case 'Escape':
                    e.preventDefault();
                    this.player.clearQueue();
                    this.ui.updateActionQueue(this.player.actionQueue);
                    break;

                case 'p':
                case 'P':
                    e.preventDefault();
                    this._togglePause();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (dirKeys[e.key]) {
                const dir = dirKeys[e.key];
                if (dir === 'x-' && this._heldDirs.x === -1) this._heldDirs.x = 0;
                if (dir === 'x+' && this._heldDirs.x === 1)  this._heldDirs.x = 0;
                if (dir === 'y-' && this._heldDirs.y === -1) this._heldDirs.y = 0;
                if (dir === 'y+' && this._heldDirs.y === 1)  this._heldDirs.y = 0;

                // Update queued action if still holding a direction
                if (this._heldDirs.x !== 0 || this._heldDirs.y !== 0) {
                    this._queueFromHeld();
                }
            }
        });
    }

    _queueFromHeld() {
        const { x, y } = this._heldDirs;
        if (x === 0 && y === 0) return;
        this.player.queueAction({ type: 'move', dx: x, dy: y });
        this.ui.updateActionQueue(this.player.actionQueue);
        this._render();
    }

    // --- Game loop ---

    _startTick() {
        if (this.paused) return;
        this.ui.startTickBar(TICK_MS);
        this.tickTimer = setTimeout(() => this._resolveTickNow(), TICK_MS);
    }

    /**
     * Resolve the current tick — called by Space (immediate) or by timer (deadline).
     * Adds a brief resolve flash so the player sees the moment of execution.
     */
    _resolveTickNow() {
        if (this.resolving) return;
        this.resolving = true;

        // Cancel the deadline timer (if Space was pressed early)
        clearTimeout(this.tickTimer);
        this.ui.clearTickBar();

        // Flash the canvas border
        this.canvasContainer.classList.add('resolving');

        // Brief resolve pause — lets the player see the "execution moment"
        setTimeout(() => {
            this._executeTick();
            this.canvasContainer.classList.remove('resolving');
            this.resolving = false;
            this._startTick();
        }, RESOLVE_MS);
    }

    _executeTick() {
        this.ui.logSpacer();

        // Resolve player actions
        const messages = this.player.resolveActions(this.map);
        messages.forEach(m => this.ui.log(m));

        // Update chunks around new player position
        this.map.updateLoadedChunks(this.player.worldX, this.player.worldY, this.tick);

        this.tick++;
        this._render();
        this._save();
    }

    _togglePause() {
        this.paused = !this.paused;
        if (this.paused) {
            clearTimeout(this.tickTimer);
            this.ui.clearTickBar();
            this.ui.log('PAUSED — press P to resume');
        } else {
            this.ui.log('Resumed');
            this._startTick();
        }
    }

    // --- Rendering ---

    _render() {
        this.ui.renderMap(this.map, this.player.worldX, this.player.worldY);
        this.ui.updateStatus(this.player, this.tick);
        this.ui.updateBiome(this.map.getBiomeAt(this.player.worldX, this.player.worldY));
        this.ui.updateActionQueue(this.player.actionQueue);
    }

    // --- Save / Load ---

    _save() {
        const data = {
            worldSeed: this.worldSeed,
            tick: this.tick,
            player: this.player.toJSON(),
            chunks: this.map.saveNearby(this.player.worldX, this.player.worldY),
        };
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        } catch (e) {
            // localStorage full or unavailable — not fatal
        }
    }

    _loadSave() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }
}

// --- Boot ---
document.addEventListener('DOMContentLoaded', () => {
    // "New Game" button clears save
    const newGameBtn = document.getElementById('new-game');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            if (confirm('Start a new game? Current save will be erased.')) {
                localStorage.removeItem(SAVE_KEY);
                location.reload();
            }
        });
    }

    window.__game = new Game();
});
