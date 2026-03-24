# Feature: Combat & Health System
**Phase:** Phase 2 — Life in the City
**Priority:** Critical
**Status:** Design (core rules decided)

---

## Core Combat Rules — DECIDED

These are locked in. No further design debate needed on the fundamentals.

### Health
- **Everything has 100 HP.** Players, NPCs, rats, cheese, The Duke — 100 HP across the board.
- Simple, universal, easy to reason about. No stat bloat.

### Damage
- Damage is dealt as **single numbers.** You hit for 3, for 7, for 12. Clean, readable.
- **There is no missing.** Every attack connects. Every swing lands.
- The variance is in **how hard you hit**, not whether you hit.
- This keeps combat feeling responsive and removes the frustration of whiffed attacks in a tick-based system where every action is precious.

### Armor
- Armor is a **flat damage reduction.** If you have 3 armor and take 7 damage, you take 4.
- No percentages, no diminishing returns, no armor penetration (yet).
- Armor can reduce damage to a **minimum of 1** — you always take at least 1 damage per hit. Nothing is invincible.
- This makes armor feel tangible: "I have 5 armor" means every hit hurts 5 less. Players can do that math instantly.

### Why This Works
- **Transparency:** The player always knows exactly what happened and why. No hidden rolls, no RNG frustration.
- **Tick economy:** In a 10-second tick system, every queued action matters. Missing would feel awful. Hitting for less still feels like progress.
- **Damage numbers as teaching tool:** The rat eating cheese shows damage numbers in the world before the player ever fights. With this system, those numbers are immediately understandable.
- **Armor as meaningful loot:** Finding armor is exciting because the math is obvious. "I went from taking 7 to taking 2 per hit" is a clear power spike.

### Combat Formula
```
actual_damage = max(1, raw_damage - target_armor)
```

That's it. One line. The entire combat damage model.

---

## Open Design Questions (For Later)
- What determines raw_damage? Weapon base damage? Weapon + player stat?
- Do different weapons have different damage ranges or fixed values?
- Can armor degrade (fits with Phase 3 bag damage / item durability)?
- Do environmental hazards (sludge, radiation) use this same system?
- Critical hits? Or does "no missing, variable damage" already cover that design space?
- How does this scale into Phase 5 taxi-mounted weapons?

## Integration Notes
- player.js: Add HP (100), armor stat, takeDamage() method
- NPCs: Same HP/armor model — defined per NPC type in data.js
- ui.js: Damage numbers displayed in log and potentially as floating canvas text
- Rat + cheese demo: Cheese has 100 HP, rat deals small damage per tick, player watches HP tick down
