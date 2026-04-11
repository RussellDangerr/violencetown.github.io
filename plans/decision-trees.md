# Violencetown Decision Trees

> **Purpose:** Capture what's locked, what needs a decision, and what the prototype will answer.
> **Date:** 2026-04-01
> **Use this document to make choices in your next session.**

---

## What's LOCKED (don't revisit — these are done)

### Structure
- 5 zones: Sewer, Factory, Town, Circus, Graveyard
- 2D tile-based, hand-crafted static map (no procedural generation)
- Town at center, four zones radiate outward
- Sequential unlock: Sewer → Factory → Town → Circus → Graveyard → Endgame

### Creatures
- Wererat (Sewer) — Rat ↔ Wererat dual form
- Robot (Factory)
- Human (Town)
- Clown (Circus) — cryptid-tied, non-human, Americana
- Skeleton (Graveyard) — Skeleton ↔ Zombie dual form on damage

### Bosses
- Texas Beholdem (Sewer) — cowboy beholder, poker card eyestalk attacks, pet black armadillo
- Alien Invasion (Factory) — little green men + enslaved grey aliens, red button blaster guns
- The Financier (Town) — vampire banker, sunblock/moonblock scheme
- Bigfoot (Circus) — alpha cryptid, tiny fez, deep carnival
- The Deity (Graveyard) — surfer bro, wants undead to "paddle out" into death's ocean

### NPCs
- SunMan — tutorial NPC in Town, emits sunlight, origin tied to moonblock scheme

### Elements
- Sludge — purple, glowing, void-like. Contact-based.
- Goo — green, radioactive, alien. Contact-based.
- Bored — builds indoors/with wealth.
- Fun — builds from clown/cryptid entertainment.
- Death — drains Life in Graveyard.
- Life — your HP. Always better than Death.

### Lore
- Vampires run Bank Street, lobbied FDA to replace sunblock with moonblock
- Humans trapped indoors (sun damage outside, boredom inside)
- Vampires hoard real sunblock so they can walk in daylight
- SunMan was collateral damage from the moonblock scheme
- Grey aliens are enslaved, can be freed (Abe's Oddysee inspired)
- Cryptid menagerie in the Circus (18 researched, 8 recommended for launch)
- Factory machines produce Goo, aliens came to eat it

---

## Decisions to Make — NEXT SESSION

Pick one per section. Each decision is independent unless noted.

---

### DECISION 1: Element System — How do they work mechanically?

You've explored three models. Pick one (or a hybrid):

```
                    How do elements work?
                           |
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
      A: STATUS        B: PAIRED       C: SIMPLE
       EFFECTS          METERS          BARS
            |              |              |
    Visual buildup    Three meter     One bar per
    on character,     types:          element,
    thresholds        - Limit gauge   fills up,
    trigger effects.  - Seesaw        bad thing
    No UI bars.       - HP            happens.
            |              |              |
    Most flexible.    Most complex.   Most readable.
    Prototype-        Needs UI work   Easy to build.
    friendly.         upfront.        Less depth.
```

**Recommendation:** Start with **A (Status Effects)** for the prototype. Visual buildup on the character sprite (sludge coats you purple, goo glows green). Simple thresholds (a little sludge = minor effect, a lot = major effect). No meter UI needed. If it feels too shallow, upgrade to B later. You can always ADD a meter bar — you can't easily REMOVE one that players expect.

---

### DECISION 2: Zone-locked creatures or free choice?

```
                  When you enter a zone, who are you?
                           |
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        A: ZONE-       B: UNLOCK &   C: FREE
        LOCKED          CHOOSE        CHOICE
              |            |            |
        Enter Sewer =   Beat zone =   Any creature
        become Wererat. unlock its    anywhere,
        Automatic.      creature.     anytime after
        One zone, one   Choose who    unlock.
        creature.       to bring.
              |            |            |
        Simplest.       Good middle   Most replay
        Each zone has   ground.       value.
        one clear       Progression   Balance
        identity.       + freedom.    nightmare.
```

**Recommendation:** **A (Zone-locked)** for the prototype. You're building one zone (Sewer) with one creature (Wererat). This decision literally doesn't matter until you have two zones. Defer it.

---

### DECISION 3: Wererat transformation trigger

```
                   What triggers Rat → Wererat?
                           |
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     A: MANUAL        B: HEALTH        C: COMBAT
      TOGGLE          THRESHOLD          TIMER
           |               |               |
     Button press.    Low HP =          In combat
     Player chooses   Wererat.          for X ticks =
     when to shift.   Desperation       transform.
     Full control.    mode.             Earned power.
           |               |               |
     Simplest to      Mirrors           Rewards
     implement.       Skeleton↔Zombie.  aggression.
     Risk: no         Consistent.       Complex to
     reason NOT to    Risk: always      tune.
     be Wererat.      low HP = always
                      Wererat.
```

**Recommendation:** **A (Manual toggle)** for the prototype. Easiest to implement. Give it a cooldown so there's a cost. If it feels too free, add restrictions later.

---

### DECISION 4: Skeleton ↔ Zombie — what does Zombie form do?

```
                    What is Zombie form?
                           |
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     A: BERSERKER     B: TANK          C: DEGRADED
           |               |               |
     More damage,     More defense,    Weaker but
     less defense.    less speed.      different
     Desperation      Survival mode.   abilities.
     power spike.     Endure.          Trade-off.
           |               |               |
     High risk,       Low risk,        Most
     high reward.     low reward.      interesting
     Exciting.        Safe.            but hardest
                                       to design.
```

**Not needed for prototype.** Graveyard is Stage 5. Defer entirely.

---

### DECISION 5: Map style per zone (start with Sewer only)

```
                    Sewer map layout?
                           |
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     A: PIPE           B: UNDERGROUND   C: LAYERED
      NETWORK            RIVER            DEPTHS
           |               |               |
     Maze of tight    Central sludge   Multiple levels
     tunnels.         river with       connected by
     Claustrophobic.  walkways and     ladders/drains.
     Rat-size gaps.   bridges. Open.   Depth = danger.
           |               |               |
     Best for Rat     Most visually    Most ambitious.
     form's 1-tile    interesting.     Vertical adds
     squeeze. Pure    Good flow.       complexity.
     sewer feel.      Easy to read.    Save for later?
```

**Recommendation:** **A (Pipe Network)** for the prototype. It's the most sewer-like and the Rat's 1-tile squeeze ability shines here. A 40x40 hand-crafted pipe maze with sludge pools, a few enemies, and Texas Beholdem's room at the end.

---

### DECISION 6: What does "too much Sludge" do? (prototype scope)

```
                    Sludge at high levels?
                           |
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     A: ENEMIES       B: DIRECT        C: VISUAL
      2X FAST          DAMAGE           ONLY
           |               |               |
     World speeds     Sludge just      Sludge coats
     up around you.   hurts you.       your sprite.
     Unique feel.     Simple DoT.      No gameplay
     Hard to build.   Easy to build.   effect yet.
           |               |               |
     The best idea    Boring but       Fastest to
     but needs AI     works. Every     prototype.
     speed system.    game has DoT.    Defer the
                                       mechanic.
```

**Recommendation:** **B (Direct damage)** for the prototype. DoT is boring but it works and takes 5 minutes to implement. You can upgrade to the 2x speed mechanic later when you have enemy AI. Don't let a cool idea block your first build.

---

## What the Prototype Will Answer (don't decide on paper)

These questions can ONLY be answered by playing:

- Does the tile movement feel good at 16x16? 32x32? 
- How big should a zone be? (Try 40x40, adjust)
- Status effects vs meter bars — which reads better?
- Does sludge as visual coating on the sprite actually read at small pixel sizes?
- How fast should the game tick? (Real-time? Turn-based? Hybrid?)
- Is the Sewer fun to navigate as a maze?
- Does the Rat's 1-tile squeeze feel good or feel like a gimmick?

---

## Prototype Scope — The Sewer, Nothing Else

**Build this first:**

1. ☐ Hand-crafted sewer map (~40x40 tiles)
2. ☐ Wererat sprite on the tile grid, movement works
3. ☐ Sludge tiles — step on them, take damage (simple DoT)
4. ☐ Wall tiles, floor tiles, 1-tile gaps (rat squeeze)
5. ☐ A few enemies (sewer rats? sludge creatures?) that move
6. ☐ Texas Beholdem's room at the far end (just a room, no boss fight)
7. ☐ Win condition: reach the boss room
8. ☐ Soap + water station (test the "cure" mechanic)

**NOT in the prototype:**
- No other zones
- No element meters/UI
- No transformation (Rat ↔ Wererat)
- No boss fight mechanics
- No items or inventory
- No other creatures
- No story/dialogue

**Time to build:** This is achievable. You have sprites. You have a tile renderer. Build the sewer.
