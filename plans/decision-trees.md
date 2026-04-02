# Violencetown Decision Trees

> **Purpose:** Capture what's locked, what needs a decision, and what the prototype will answer.
> **Date:** 2026-04-01
> **Last updated:** 2026-04-01 (decisions session)

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

### Core Mechanics (decided 2026-04-01)
- **Movement: Phase-Based Turns** — no timer. Each turn, the player queues up multiple actions across phases (like playing cards), then executes them all at once. Inspired by Pixel Dungeon's "no clock pressure" feel but with multi-phase combo depth instead of one-action-per-turn. See "Turn Structure" below for details.
- **Combat death: Arcade Reset** — fast respawn, lose some progress, low friction. Death is a punchline, not a punishment.
- **Rings: Deferred** — build without rings. Revisit when progression needs more depth. Elements/meters may replace them.
- **Height system: Backlogged** — not for prototype or early zones. May add to Factory or Town later.
- **Element system: Status Effects for prototype** — visual buildup on sprite, thresholds trigger effects. No meter UI initially. Upgrade to paired meters if too shallow.
- **Zone creatures: Zone-locked for prototype** — enter zone = become its creature. Defer free choice until 2+ zones exist.
- **Wererat trigger: Manual toggle** — button press + cooldown.
- **Sewer map: Pipe Network** — ~40x40 maze, claustrophobic, rat-size gaps.
- **Sludge mechanic: Direct damage (DoT)** — simple, works. Upgrade to 2x enemy speed later.
- **Skeleton/Zombie form: Deferred** — Graveyard is Stage 5.

### Turn Structure (new — needs design work)

The player builds their turn by queuing actions across phases, then executes everything at once. All options are visible on screen — the player can see what they're building before committing. Feels like assembling a hand of cards.

**Rough phase concept (not final — needs prototyping):**
1. **Combine** — combine/craft items
2. **Use** — throw item, smash item, use ability
3. **Move** — move to a tile
4. **Execute** — commit the turn, everything resolves

**Why this feels good:**
- Player can maximize each turn by chaining actions (combine a thing, then throw it, then move away)
- Combo discovery — "what happens if I combine THEN throw?" becomes a puzzle
- All options visible on screen = informed decisions, not guessing
- No time pressure (no tick timer) but depth per turn (not just "move one tile")
- Resolution phase where everything plays out gives a satisfying payoff moment

**Open design questions:**
- How many phases per turn? Is it always 4, or do you earn more phases as you progress?
- Can you skip phases? (e.g., just Move + Execute with no Combine/Use)
- Do enemies also queue phases, or do they just act after your Execute?
- How does this display on screen? Card-like slots? A queue bar? Phase buttons?
- Does the Wererat's dual form affect available phases? (Rat form = extra Move phase? Wererat = extra Use phase?)
- How does this interact with the element system? (e.g., stepping in sludge during Move phase = DoT applied during Execute?)

**What this replaces:** The original Pixel Dungeon "one tile per input" model. The no-timer philosophy stays, but turns are richer.

**Prototype note:** The sewer prototype should test this early — even a simple 2-phase version (Use + Move → Execute) would validate the feel.

---

## Decisions to Make — ~~NEXT SESSION~~ RESOLVED

~~Pick one per section. Each decision is independent unless noted.~~

**All 6 decisions below have been resolved.** Kept for reference — see "Core Mechanics" in the LOCKED section above for the final answers.

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

- Does the phase-based turn system feel good? (Queue actions → Execute)
- How many phases per turn feels right? (2? 3? 4?)
- Does the tile movement feel good at 16x16? 32x32? (depends on purchased sprites)
- How big should a zone be? (Try 40x40, adjust)
- Status effects vs meter bars — which reads better?
- Does sludge as visual coating on the sprite actually read at small pixel sizes?
- Is the Sewer fun to navigate as a maze?
- Does the Rat's 1-tile squeeze feel good or feel like a gimmick?
- Does the combo system (Combine → Throw) create interesting decisions?

---

## Prototype Scope — The Sewer, Nothing Else

**Build this first:**

1. ☐ Phase-based turn system (queue actions → execute → enemies respond)
2. ☐ Wererat on the tile grid, movement works within the turn system
3. ☐ Sludge tiles — step on them, take damage (simple DoT, applied at Execute)
4. ☐ Wall tiles, floor tiles, 1-tile gaps (rat squeeze)
5. ☐ A few enemies (sewer rats? sludge creatures?) that move after Execute
6. ☐ Basic Use phase (throw/smash an item as part of your turn)
7. ☐ Arcade reset death (respawn at sewer entrance)
8. ☐ Hand-crafted sewer map (~40x40 tiles) — **BLOCKED: waiting for sprite assets.** Build map after reviewing purchased sprites to match tile size and art style.
9. ☐ Texas Beholdem's room at the far end (just a room, no boss fight)
10. ☐ Win condition: reach the boss room
11. ☐ Soap + water station (test the "cure" mechanic)

**NOT in the prototype:**
- No other zones
- No element meters/UI
- No transformation (Rat ↔ Wererat)
- No boss fight mechanics
- No Combine phase (defer until Use + Move feel good)
- No other creatures
- No story/dialogue

**Dependency:** Map building is blocked until sprite assets are reviewed. The tile size, art style, and map design all depend on the purchased sprites. Build the turn system and mechanics first; plug in the map when sprites are ready.
