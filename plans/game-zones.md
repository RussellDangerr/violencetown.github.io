# Feature: Game Zones — Static World Map
**Phase:** Foundational (replaces Phase 1 world generation)
**Priority:** Critical
**Status:** Research / Design
**Date:** 2026-04-01

---

## Design Pivot

This plan supersedes the procedural chunk-based generation system from Phase 1. Violencetown is no longer a roguelike with shifting city chunks. It is now a **hand-crafted 2D pixelated tile map** — static, authored, persistent.

### What's changing:
- **No procedural generation.** The world is designed, not generated.
- **No chunk regeneration.** The map doesn't shift or reset.
- **No roguelike mechanics.** No permadeath loop, no run-based structure.
- **Tile system stays.** The game is still tile-based, 2D, pixelated.
- **Simplex noise biomes are gone.** Zones are hand-placed, not noise-driven.

### What this resolves from the ABC Decision Matrix:
- **Category 5 (World Structure):** Effectively **Option C — Fully Persistent**, but hand-crafted rather than procedurally generated. The world is a fixed map.
- The "shifting city" identity is replaced by a **neighborhood identity** — each zone has a distinct look, feel, and resident creature.

---

## Core Concept: Life = HP

**Life is your HP.** Not "health points" — *Life*. Every element in every zone interacts with Life in a different way:

| Zone | Element | Effect on Life |
|------|---------|----------------|
| **Town** | Boredom | Forces random actions — indirect Life risk through loss of control |
| **Sewer** | Sludge | Slows you down + drains Life over time (DoT) |
| **Circus** | Fun | Vampire clowns entertain you — Fun steals Life directly |
| **Factory** | Goo | Powers you up (faster, stronger) but every action costs Life |
| **Graveyard** | Death | The Deity is killing you. Death itself as a building pressure. |

Every zone's element threatens Life differently. Sludge is slow and corrosive. Goo is tempting and costly. Fun is a trap. Boredom is chaos. Death is inevitable. The player has to manage Life across all five zones, and each zone demands a different survival strategy.

---

## The Five Zones

Violencetown is divided into five distinct zones. Each zone is the home turf of a specific creature type. The zones together form a single contiguous map.

### 1. Town (City Center)
- **Resident creature:** Human
- **Element:** Boredom — if you haven't done anything interesting in a while, or you encounter something boring, your character does something random. Boredom is the mundane hazard of normal life. The city is dull and it gets to you. Stand still too long, walk the same block twice, interact with something tedious — boredom kicks in and you lose control briefly. The antidote is action, variety, violence.
- **Role:** Player starting zone. The "normal" part of Violencetown.
- **Vibe:** Urban streets, buildings, shops, sidewalks. The most city-like area. This is the baseline that makes the other zones feel weird by contrast.
- **Tile palette:** Concrete, asphalt, brick, storefronts, streetlights, dumpsters.
- **Sub-areas:** **Bank Street** — the financial district within Town. Turf of The Financier (boss). Banks, loan offices, suited thugs.
- **Boss:** The Financier (Bank Street). Economic power, not brute force.
- **Notes:** Town is central — the other four zones radiate outward from it. The gas station (existing spawn point) lives here.

### 2. Sewer
- **Resident creature:** Wererat (Rat ↔ Wererat transformation)
- **Element:** Sludge — **purple, glowing, void-like.** The sewers flow purple with sludge. It glows like something from beyond. Not just waste — it feels like the void is leaking through the drains. Sludge slows you down and does damage over time (DoT).
- **Role:** Underground / drainage zone beneath or adjacent to Town.
- **Vibe:** Dark, wet, claustrophobic. Pipes, grates, tunnels. Everything is lit by the purple glow of sludge rivers. The Rat's domain — tight spaces that only small creatures navigate easily.
- **Tile palette:** Sewer grates, water channels, pipes, brick tunnels, muck, drains, glowing purple sludge pools, sludge flows, sludge drips.
- **Boss:** Texas Beholdem — see Boss Profiles below.
- **Notes:** Could connect to other zones via underground passages. Rat form fits through 1-tile gaps. Wererat form is too big — transformation has spatial consequences. Sludge is the zone's environmental hazard — slows movement and deals DoT.

### 3. Circus
- **Resident creature:** Clown (Vampire Clown)
- **Role:** Entertainment district as vampire society. Think Vampire: The Masquerade but with a circus theme.
- **Vibe:** A permanent carnival that's actually a vampire court in disguise. The big top is their gathering hall. The funhouse is where they feed. Gaudy colors, greasepaint, and fangs. The "masquerade" is literal — they hide behind clown makeup and circus performance. Political intrigue under the big top. Coteries of clowns with territory and hierarchy. The circus never closes because vampires don't sleep.
- **Element:** Fun — the vampire clowns do something genuinely fun and entertaining for you... and it steals your Life. Fun is the trap. The circus is a blast — games, performances, spectacles — and every moment of enjoyment drains your HP. The clowns are feeding on your joy. You're having the time of your life, literally. The more fun you have, the more Life you lose.
- **Tile palette:** Striped tents, confetti, carnival booths, popcorn carts, funhouse mirrors, balloon piles, blood-red curtains, dim backstage areas, coffin-shaped prop boxes.
- **Boss:** SunMan — see Boss Profiles below.
- **Notes:** The Clowns are vampires. The circus is their cover. The Masquerade-style social dynamics (clans, politics, feeding, maintaining the facade) play out in a circus setting. This gives the Circus zone depth beyond just "creepy carnival" — it's a functioning vampire society with its own rules. The Clown creature could have vampire abilities: blood drain, mesmerize, night vision, weakness to sunlight (and therefore SunMan). Fun is their weapon — they don't attack you, they entertain you to death.

### 4. Graveyard
- **Resident creature:** Skeleton (Skeleton ↔ Zombie transformation)
- **Element:** Death — the Deity is actually killing you. Not DoT, not a debuff — **Death**. The Graveyard's element is the real thing. The Deity wants you dead and the zone itself is trying to finish the job. Being in the Graveyard means Death is actively coming for you. The longer you stay, the closer it gets. The element isn't an environmental hazard you step in — it's an existential pressure that builds.
- **Role:** The dead part of town. The undead are denying death — and something has noticed.
- **Vibe:** Tombstones, crypts, dead trees, fog, iron fences. Quiet and spooky. But underneath the quiet, Death is working.
- **Tile palette:** Gravestones, mausoleums, dirt paths, dead grass, iron gates, candles, fog tiles.
- **Boss:** The Deity — see Boss Profiles below.
- **Notes:** The Skeleton shifts to Zombie form when it takes damage. This zone is home to both forms — bones and rot. The graveyard should feel different depending on which form you're in. The Deity boss gives the Graveyard zone existential stakes — every undead creature here is living on borrowed time. Death as an element means the zone itself is hostile in a way no other zone is.

### 5. Factory
- **Resident creature:** Robot
- **Element:** Goo — **green, radioactive, alien.** Associated with radiation, aliens, and the spaceship. The Goo may have always been in the Factory, or maybe it arrived with the aliens. Either way, it's green, it glows, and it's not from here. **Goo makes you more powerful and faster, but consumes Life on action or contact.** It's a Faustian bargain — touch the Goo, become superhuman, burn through your HP doing it. Every powered-up action costs Life. Speed costs Life. Strength costs Life.
- **Role:** Industrial zone. The Factory produces... something. That something involves Goo.
- **Vibe:** Machines, conveyor belts, smokestacks, metal walls, sparks. The Robot was built here. Mechanical and harsh. Vats of green Goo — the Factory's product, byproduct, or secret. Goo leaks, Goo spills, Goo is everywhere it shouldn't be. Radiation warnings. The spaceship looms.
- **Tile palette:** Metal floors, conveyor belts, gears, pipes, vats, control panels, catwalks, smokestacks, green goo pools, goo vats, goo pipes, radiation symbols, alien tech.
- **Boss:** Alien Invasion — see Boss Profiles below.
- **Notes:** Natural fit for Robot's tech/machine identity. Goo is the zone's environmental hazard/resource — green, radioactive, and connected to the alien presence. The alien invasion is an event/boss encounter — the Factory's normal state is industrial, but the aliens disrupt it.

---

## Zone Layout Concept

```
            [ Graveyard ]
                 |
[ Factory ] — [ Town ] — [ Circus ]
                 |
            [  Sewer  ]
```

Town sits at the center. The four other zones surround it. The exact layout, zone sizes, and connection points are TBD during the map design phase. The Sewer could also function as an underworld layer connecting zones underground.

---

## Creature Roster (Updated)

| Creature | Home Zone | Transformation | Status |
|----------|-----------|----------------|--------|
| Human | Town | None | Existing — player start creature |
| Wererat | Sewer | Rat ↔ Wererat | **CHANGED** — was "Sewer Rat", now transforms |
| Clown | Circus | Vampire Clown | **CHANGED** — clowns are vampires, Masquerade-style circus society |
| Robot | Factory | None (yet) | Existing — from previous plans |
| Skeleton | Graveyard | Skeleton ↔ Zombie | **NEW** — transforms on health loss |

### Creature Transformations

**Wererat (Sewer)**
- Default form: **Rat** — small, fast, fits through tight spaces. The classic sewer rat.
- Transformed form: **Wererat** — larger, stronger, more dangerous. The beast comes out.
- Transformation trigger: TBD (combat? rage? lunar cycle? manual toggle? health threshold?)
- This replaces the old "Sewer Rat" creature entirely. The Rat form preserves the "fits through 1-tile gaps" ability. The Wererat form is the payoff — power at the cost of size/stealth.

**Skeleton ↔ Zombie (Graveyard)**
- Default form: **Skeleton** — bony, rattling, classic undead.
- Damaged form: **Zombie** — when the Skeleton takes enough damage, it shifts into Zombie form. Flesh and rot replace bone. Different stats, different feel.
- This elegantly merges Skeleton (new) and Zombie (previously in roster but unassigned) into a single dual-form creature. The Zombie isn't cut — it's the Skeleton's other half.
- Design questions: Does Zombie form have different abilities? Is the shift reversible (heal back to Skeleton)? Is Zombie stronger or weaker — a desperation mode or a berserker mode?

### Zone Bosses

Every zone has a boss. The bosses aren't just big enemies — they each have a thematic relationship with their zone's creatures, and they're all *characters* with distinct personalities and visual identities.

| Zone | Boss | Relationship to Zone Creature |
|------|------|-------------------------------|
| **Town** | The Financier | Controls the economy humans depend on |
| **Sewer** | Texas Beholdem | The horror even Wererats fear |
| **Circus** | SunMan | Natural predator of vampire clowns — he IS sunlight |
| **Graveyard** | The Deity (Beach Boy Surfer) | Wants the undead to stop denying death and join the ocean |
| **Factory** | Alien Invasion (Little Green Men + enslaved Greys) | Invaders who want the machines and the Goo |

---

### Boss Profiles

**The Financier (Town — Bank Street)**
- Previously "Smooth Talker" — now recast as **The Financier**, a boss NPC on Bank Street in Town.
- Bank Street is a named sub-area within the Town zone. The Financier runs it.
- The Financier's power isn't physical — it's economic. Deals, loans, leverage, hired muscle. The Smooth Talker's dialogue-based identity (persuade, deceive, barter, provoke) now belongs to this boss.
- Encounter: Bank Street is the Financier's turf. He doesn't fight you directly — he sends collectors, raises prices, cuts you off. Confronting him is a different kind of challenge.

**Texas Beholdem (Sewer — Deep Sewer)**
- Lightly inspired by Xanathar from D&D, but **obsessed with the American Southwest**. Cowboy culture, desert vibes, tumbleweeds — in a sewer. He doesn't care that he lives underground in filth. In his mind, he's on the open range.
- **Pet:** A black armadillo. His precious companion. Don't touch the armadillo.
- **Signature weapon:** Holds a **royal flush** of poker cards in his **eyestalks** — one card per stalk. Throws them as projectile attacks. Each card is an eyestalk ability. The cards ARE his eye beams, reskinned as thrown poker cards. Five cards, five stalks, five abilities.
- **Visual:** Massive multi-eyed horror, but wearing a cowboy hat. Maybe a bolo tie. Eyes glow purple from the sludge. Each eyestalk grips a poker card, fanned out like a hand. The armadillo rides on him somewhere.
- Encounter location: Deep Sewer — the farthest, darkest part of the zone. His "saloon."

**SunMan (Circus — Attacks from outside)**
- A **superhero and vampire hunter**. Mimics traditional superhero culture — cape, symbol on chest, dramatic poses, heroic speeches. But also a vampire hunter — stakes, garlic, holy water, the kit.
- **Origin:** Got a horrible sunburn as a boy. Instead of dying, he now **emits sunlight from his skin**. He IS the sun. Walking into a dark room and lighting it up. His mere presence burns vampires.
- **Visual:** Dressed like a **vampire hunter mixed with a superhero**. Long coat meets cape. Utility belt of stakes and garlic next to a glowing sun emblem. Skin visibly radiates — he glows warm yellow/orange. Dark goggles or a hood to contain himself when he's not fighting.
- **Personality:** He's a *hero*. He believes he's saving people from the vampire clown menace. He's right — the clowns ARE vampires. But from the Clown player's perspective, this righteous glowing man is an existential threat. He shows up to purge the circus.
- The tension: SunMan is morally justified. You're the monster. Do you fight the hero?

**The Deity (Graveyard — Manifests within)**
- Not a grim reaper. Not a skeleton god. **A beach boy surfer dude.** Laid back, chill, sun-bleached hair, board shorts, flip flops, maybe a shell necklace. He talks like a California surfer.
- **Philosophy:** Life is "the beach." Death is "the salty ocean." He wants everyone to have a chill time on the beach of life, and when it's your time, you paddle out into the ocean and become sea life again — fish, octopus, coral, whatever. It's beautiful. It's natural. It's the cycle.
- **Why he's angry:** The Skeletons and Zombies are **refusing to leave the beach**. They died. Their wave came. They were supposed to paddle out and become a nice little sea creature. Instead they're still standing on the sand, rotting, rattling, being undead. It's not chill. It's actually really uncool, bro.
- **Visual:** Surfer aesthetic in a graveyard. Board shorts and flip flops among tombstones. Carries a surfboard. Skin has that golden beach glow. But when he's angry — and he IS angry — the ocean comes with him. Waves, salt, seaweed, the crushing depth of the deep sea. The chill facade cracks and you see the cosmic force of the actual ocean of death behind the beach bro persona.
- **Tone:** Speaks casually, uses surfer slang, but what he's saying is terrifying. "Dude, you gotta let go. The ocean is so sick out there. You're gonna love being a fish. Come on, bro. Stop being dead wrong about being dead."

**Alien Invasion (Factory — Spaceship landing)**
- A **flying saucer** lands at or near the Factory. Classic UFO design.
- **Little Green Men** are the commanders. Small, big-headed, smart, cruel. They give orders and fire weapons.
- **Alien blaster guns:** Comical design — a **red button on top** of the gun with **yellow and black hazard stripes** around it. The little green men press the button with their tiny finger to fire. It's absurd. The most dangerous weapon in the zone is operated by a little guy pressing a big cartoon button.
- **Grey Aliens** are large, powerful, and **enslaved** by the greens. They do the heavy lifting, the fighting, the labor. They're physically superior but mentally subjugated.
- **The dynamic:** The greens are the brains, the greys are the brawn. Fight the greens and the greys might stop fighting. Free the greys and they might turn on their masters. Or fight everyone. The power structure is the puzzle.
- **What they want:** The Factory — its machines, its Goo, or both. The Goo may be connected to them (is it alien in origin? Were they here before?).

---

## Impact on Existing Systems

### What gets removed:
- Simplex noise biome generation (`map.js`)
- Chunk-based procedural generation
- Chunk regeneration timer (600-tick cycle)
- Era/seed-based deterministic generation
- The five noise-driven biomes (Stealville, Sludgeworks, The Glow, Downtown, The Outskirts)

### What stays:
- Tile rendering system (canvas, tile types, colors)
- Player movement on tile grid
- Tick system (pending ABC Category 1 decision)
- Save/load (simplified — no chunk cache, just player position + world state)
- Text log
- Ground items

### What needs to be built:
- Static map data (tile arrays for each zone, or a single large map file)
- Zone boundary definitions
- Zone-specific tile palettes and visual themes
- Map loading from authored data instead of procedural generation
- Potentially a map editor workflow (or just hand-edit tile arrays)

---

## Open Questions

1. **Map size:** How big is each zone? How big is the total map? Needs to feel explorable but not empty.
2. **Zone transitions:** Hard borders (walls/gates) or gradual blending?
3. **Sewer as underworld:** Is the Sewer a separate layer (underground) or a surface zone?
4. **Wererat transformation trigger:** What causes the Rat → Wererat shift? Combat? A cooldown ability? Health threshold? Moon phase?
5. **Creature population:** Do zones have NPC creatures of their type wandering around? (e.g., NPC skeletons in the graveyard, NPC clowns at the circus)
6. **Cross-zone creatures:** Can creatures from one zone wander into another, or are they bound to their home?
7. **Skeleton ↔ Zombie balance:** Is Zombie form stronger (berserker) or weaker (degraded)? Is the shift reversible by healing?
8. ~~Old creatures (Texas Beholdem, Smooth Talker)~~ — **RESOLVED.** Texas Beholdem → Sewer Boss. Smooth Talker → The Financier (Town Boss, Bank Street). Zombie → Skeleton's damaged form.
9. ~~Other zone bosses?~~ — **RESOLVED.** All five zones have bosses with full character profiles.
10. ~~Zone elements for remaining zones~~ — **RESOLVED.** All five zones have elements: Boredom (Town), Sludge (Sewer), Fun (Circus), Death (Graveyard), Goo (Factory). All interact with Life (HP) differently.
11. **Alien invasion timing:** Is the invasion always present, or is it an event that triggers? Does the Factory have a "normal" state before the aliens arrive?
12. ~~Sludge vs Goo gameplay~~ — **RESOLVED.** Sludge = slow + DoT. Goo = power up + speed up but costs Life per action. Completely different risk profiles.
13. **The Deity's ocean:** Does the Deity's presence bring actual water/ocean tiles into the Graveyard? Salt water flooding crypts, seaweed on tombstones? Could be a visual tell that the Deity is near or active.
14. **Boredom mechanics:** What counts as "boring"? Standing still? Repeating actions? Walking the same path? What random actions can boredom force? How long is the idle timer?
15. **Fun mechanics:** How does Fun steal Life? Is it proximity to clown entertainment? Watching a performance? Playing a carnival game? Is it avoidable or ambient in the zone?
