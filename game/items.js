// items.js — Item definitions and use-phase resolution
// Sewer demo prototype
//
// All items are equippable. Each has an equipSlot and an optional duration.
// When equipped with a duration, the item occupies the slot for N turns,
// then the previously equipped item in that slot is restored.

export const ITEMS = {
    rock: {
        id: 'rock',
        name: '[Rock]',
        useType: 'throw',
        equipSlot: 'sides',
        range: 4,
        damage: 15,
        consumable: true,
        fallbackColor: '#888888',
    },
    soap: {
        id: 'soap',
        name: '[Soap]',
        equipSlot: 'back',
        equipDuration: 3,       // occupies back slot for 3 turns
        useType: 'self',
        effect: 'cure_sludge',
        consumable: true,       // consumed on use, but still occupies slot for duration
        fallbackColor: '#aaaaff',
    },
    pipe: {
        id: 'pipe',
        name: '[Pipe]',
        equipSlot: 'weapon',
        useType: 'melee',
        range: 1,
        damage: 12,
        consumable: false,
        fallbackColor: '#666666',
    },
    bandage: {
        id: 'bandage',
        name: '[Bandage]',
        equipSlot: 'front',
        equipDuration: 2,       // occupies front slot for 2 turns
        useType: 'self',
        effect: 'heal',
        healAmount: 25,
        consumable: true,
        fallbackColor: '#ffaaaa',
    },
};

// Equip an item into its slot. Returns a log message.
// If the slot is occupied, the old item is stored as a pending restore.
export function equipItem(game, itemDef) {
    const slot = itemDef.equipSlot;
    if (!slot) return null;

    const old = game.equipment[slot];

    // If this item has a duration, set up the temporary equip
    if (itemDef.equipDuration) {
        game.tempEquips.push({
            slot,
            itemDef,
            turnsLeft: itemDef.equipDuration,
            previousItem: old,
        });
        game.equipment[slot] = itemDef;
        return old
            ? `[${itemDef.name} equipped to ${slot} for ${itemDef.equipDuration} turns — ${old.name} removed]`
            : `[${itemDef.name} equipped to ${slot} for ${itemDef.equipDuration} turns]`;
    }

    // Permanent equip (like pipe → weapon slot)
    game.equipment[slot] = itemDef;
    return old
        ? `[${itemDef.name} equipped to ${slot} — replaced ${old.name}]`
        : `[${itemDef.name} equipped to ${slot}]`;
}

// Called each turn during enemy resolution to tick down temp equips
export function tickTempEquips(game) {
    const messages = [];
    const still = [];

    for (const te of game.tempEquips) {
        te.turnsLeft--;
        if (te.turnsLeft <= 0) {
            // Restore previous item
            game.equipment[te.slot] = te.previousItem;
            messages.push(te.previousItem
                ? `[${te.itemDef.name} expired — ${te.previousItem.name} re-equipped to ${te.slot}]`
                : `[${te.itemDef.name} expired — ${te.slot} slot empty]`
            );
        } else {
            still.push(te);
        }
    }

    game.tempEquips = still;
    return messages;
}

// Resolve a Use action. Returns a log message string.
// stackCount: how many items are in the stack (for throw damage calc)
export function resolveUse(game, itemDef, direction, stackCount = 1) {
    if (!itemDef) return null;

    switch (itemDef.useType) {
        case 'self':
            return resolveSelfUse(game, itemDef);
        case 'throw':
            return resolveThrow(game, itemDef, direction, stackCount);
        case 'melee':
            return resolveMelee(game, itemDef, direction);
        default:
            return `[Used ${itemDef.name}]`;
    }
}

function resolveSelfUse(game, itemDef) {
    // Equip into slot (with duration if applicable)
    const equipMsg = equipItem(game, itemDef);

    if (itemDef.effect === 'cure_sludge') {
        // Soap is tracked via _soapUsedThisTurn in main.js
        // It cancels sludge at end of resolution without harm
        if (game.hasBuff && game.hasBuff('sludge')) {
            return equipMsg
                ? `${equipMsg} [Soap applied — sludge will be neutralized]`
                : `[Used ${itemDef.name} — sludge will be neutralized]`;
        }
        return equipMsg
            ? `${equipMsg} [Already clean]`
            : `[Used ${itemDef.name} — already clean]`;
    }

    if (itemDef.effect === 'heal') {
        const before = game.playerHp;
        game.playerHp = Math.min(game.playerMaxHp, game.playerHp + itemDef.healAmount);
        const healed = game.playerHp - before;
        return equipMsg
            ? `${equipMsg} [Healed ${healed} HP]`
            : `[Used ${itemDef.name} — healed ${healed} HP]`;
    }

    return equipMsg || `[Used ${itemDef.name}]`;
}

// stackCount is passed from main.js — damage = 10 per item in stack
function resolveThrow(game, itemDef, direction, stackCount = 1) {
    if (!direction) return `[Throw ${itemDef.name} — no direction]`;

    const DAMAGE_PER_ITEM = 10;
    const totalDamage = DAMAGE_PER_ITEM * stackCount;

    const { dx, dy } = direction;
    let tx = game.playerX;
    let ty = game.playerY;

    for (let i = 0; i < itemDef.range; i++) {
        tx += dx;
        ty += dy;

        if (!game.map.isWalkable(tx, ty)) {
            return `[Threw ${itemDef.name} x${stackCount} — hit a wall]`;
        }

        const hit = game.enemies.find(e => e.entity.isAlive() && e.x === tx && e.y === ty);
        if (hit) {
            const result = game.combatAttack(hit, totalDamage);
            return `[Threw ${itemDef.name} x${stackCount} (${totalDamage} dmg) at ${hit.entity.name} — ${result}]`;
        }
    }

    return `[Threw ${itemDef.name} x${stackCount} — missed]`;
}

function resolveMelee(game, itemDef, direction) {
    if (!direction) return `[Swing ${itemDef.name} — no direction]`;

    const { dx, dy } = direction;
    const tx = game.playerX + dx;
    const ty = game.playerY + dy;

    const hit = game.enemies.find(e => e.entity.isAlive() && e.x === tx && e.y === ty);
    if (hit) {
        const result = game.combatAttack(hit, itemDef.damage);
        return `[Hit ${hit.entity.name} with ${itemDef.name} — ${result}]`;
    }

    return `[Swung ${itemDef.name} — nothing there]`;
}
