// ============================================================
// player.js — Player state, movement, actions
// ============================================================

const DIR_NAMES = {
    '0,-1':  'north',     '0,1':  'south',
    '-1,0':  'west',      '1,0':  'east',
    '-1,-1': 'northwest', '1,-1': 'northeast',
    '-1,1':  'southwest', '1,1':  'southeast',
};

export class Player {
    constructor(x = 0, y = 0) {
        this.worldX = x;
        this.worldY = y;
        this.hp = 100;
        this.maxHp = 100;
        this.ticksAlive = 0;
        this.actionQueue = []; // actions queued this tick
    }

    queueAction(action) {
        // One action per tick (move or wait or pickup)
        this.actionQueue = [action];
    }

    clearQueue() {
        this.actionQueue = [];
    }

    resolveActions(gameMap) {
        const messages = [];

        if (this.actionQueue.length === 0) {
            this.actionQueue = [{ type: 'wait' }];
        }

        for (const action of this.actionQueue) {
            switch (action.type) {
                case 'move': {
                    const { dx, dy } = action;
                    const isDiagonal = dx !== 0 && dy !== 0;
                    const tx = this.worldX + dx;
                    const ty = this.worldY + dy;
                    const targetDef = gameMap.getTileDef(tx, ty);
                    const dir = DIR_NAMES[`${dx},${dy}`] || '???';

                    if (isDiagonal) {
                        // Diagonal: must be able to pass through both cardinal neighbors
                        const cardinalA = gameMap.getTileDef(this.worldX + dx, this.worldY); // horizontal
                        const cardinalB = gameMap.getTileDef(this.worldX, this.worldY + dy); // vertical

                        if (!targetDef.walkable) {
                            messages.push(`[blocked ${dir} — target impassable]`);
                        } else if (!cardinalA.walkable && !cardinalB.walkable) {
                            messages.push(`[blocked ${dir} — can't squeeze through]`);
                        } else if (!cardinalA.walkable || !cardinalB.walkable) {
                            // One side blocked — can squeeze through with penalty
                            // TODO: Phase 2+ — if enemy/hazard in the open path, take glancing damage
                            this.worldX = tx;
                            this.worldY = ty;
                            messages.push(`[move ${dir} — squeezed past an obstacle]`);
                            this._reportTile(gameMap, messages);
                        } else {
                            // Both clear — clean diagonal
                            this.worldX = tx;
                            this.worldY = ty;
                            messages.push(`[move ${dir}]`);
                            this._reportTile(gameMap, messages);
                        }
                    } else {
                        // Cardinal movement
                        if (targetDef.walkable) {
                            this.worldX = tx;
                            this.worldY = ty;
                            messages.push(`[move ${dir}]`);
                            this._reportTile(gameMap, messages);
                        } else {
                            if (targetDef.interactable) {
                                messages.push(`[blocked ${dir} — interactable object]`);
                            } else {
                                messages.push(`[blocked ${dir}]`);
                            }
                        }
                    }
                    break;
                }

                case 'wait':
                    messages.push('[wait]');
                    break;

                case 'pickup': {
                    const items = gameMap.getGroundItems(this.worldX, this.worldY);
                    if (items.length > 0) {
                        const item = items[0];
                        gameMap.removeGroundItem(this.worldX, this.worldY, item.itemId);
                        messages.push(`[picked up: ${item.itemId}]`);
                        // TODO: Phase 3 — add to inventory grid
                    } else {
                        messages.push('[nothing to pick up]');
                    }
                    break;
                }
            }
        }

        this.actionQueue = [];
        this.ticksAlive++;
        return messages;
    }

    /**
     * Report what's at the player's current tile after moving.
     */
    _reportTile(gameMap, messages) {
        const tileDef = gameMap.getTileDef(this.worldX, this.worldY);

        if (tileDef.hazard === 'sludge') {
            messages.push('[stepped in sludge — hazard]');
        } else if (tileDef.hazard === 'radiation') {
            messages.push('[radiation exposure]');
        }

        const items = gameMap.getGroundItems(this.worldX, this.worldY);
        if (items.length > 0) {
            const names = items.map(it => it.itemId).join(', ');
            messages.push(`[on ground: ${names}]`);
        }
    }

    // --- Serialization ---

    toJSON() {
        return {
            worldX: this.worldX,
            worldY: this.worldY,
            hp: this.hp,
            maxHp: this.maxHp,
            ticksAlive: this.ticksAlive,
        };
    }

    static fromJSON(data) {
        const p = new Player(data.worldX, data.worldY);
        p.hp = data.hp;
        p.maxHp = data.maxHp;
        p.ticksAlive = data.ticksAlive;
        return p;
    }
}
