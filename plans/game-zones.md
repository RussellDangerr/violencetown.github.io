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

## Core Concepts

### Life = HP

**Life is your HP.** Not "health points" — *Life*.

### Zone Bars — One Zone, One Bar, One Element

**Each zone has its own status bar that fills up while you're in that zone.** The bar represents the zone's element building up on you. When you leave the zone, that bar is only active in that zone — it doesn't follow you. Each zone is its own self-contained system with its own creature, element, and bar.

**You only play as a zone's creature while in that zone.** The character and element are bound to the zone. Enter the Sewer, you're the Wererat dealing with Sludge. Enter the Circus, you're the Clown dealing with Fun. This simplifies everything — no carrying status effects across zones, no juggling five creatures in your roster. One zone, one creature, one bar.

| Zone | Creature | Element | Full Bar Consequence | How to Lower the Bar |
|------|----------|---------|---------------------|----------------------|
| **Town** | Human | Boredom | Time skips forward? *(needs work)* | Spend money, throw money, break your stuff on people |
| **Sewer** | Wererat | Sludge | Enemies become 2x fast (world speeds up, you don't) | Soap + water (scarce in the sewer) |
| **Circus** | Clown (Vampire) | Fun | Fun Berserk — character goes wild, does random stuff really fast, total loss of control | TBD |
| **Factory** | Robot | Goo | Burns up your items — inventory destruction | TBD |
| **Graveyard** | Skeleton | Death | You die. | TBD |

---

### Element Details by Zone

### Boredom (Town)

Boredom **increases with money.** The more money you have, the more bored you get — you've seen it all, bought it all, nothing excites you. Rich and bored is the Town's curse.

**Full bar:** Time skips forward? *(This mechanic needs more design work. Ideas: time jumps ahead and the world has changed around you — NPCs moved, events happened without you, opportunities passed. Or: your character falls asleep/zones out and wakes up somewhere else. The feeling of "I blinked and missed something" as a consequence of wealth-induced apathy.)*

**How to lower Boredom:**
- **Spend money** — buy things, pay for services, tip people
- **Throw money at/on people** — literally hurl cash as an action
- **Break your own stuff on people** — smash your items against enemies. Destruction as entertainment. You're so bored that breaking your own possessions on someone's head is the only thrill left.

Boredom is the rich person's problem. Poor and active = no boredom. Wealthy and idle = chaos.

### Sludge (Sewer)

Sludge coats you as you move through the Sewer. Purple, glowing, void-like. It builds up.

**Full bar — enemies become twice as fast.** NOT "you slow down" — slowness mechanics suck and everyone hates them. Instead, the *world* speeds up around you. Enemies move twice, attack twice, react twice. You're at normal speed but everything else is in fast-forward. Same tactical pressure as being slowed, but it feels like the world is dangerous rather than your character being broken. You're not nerfed — you're outnumbered by speed.

**How to lower Sludge:** Wash it off with **soap and water**. Clean water is scarce in the sewer — that's the whole point. Finding a working shower basin, a water pipe you can break, or a soap item is a resource hunt. The sewer is filthy and the one thing you need to survive it is the one thing it doesn't have.

- **Soap** — an item. Find it, carry it, use it at a water source.
- **Shower basin** — a tile/station in the Sewer. Rare. Maybe only a few per zone. The safe havens.
- **Clean water** — pipes, drains that still flow clean. Break them open? Temporary wash stations.

### Fun (Circus)

The vampire clowns entertain you. Fun builds as they perform, play games, and put on spectacles. It feels great. It's killing you.

**Full bar — Fun Berserk.** Your character completely loses control and goes wild. They start doing random things *really fast* — running in random directions, interacting with everything, attacking, laughing, spinning. Total chaos. You're having TOO MUCH FUN and your body can't handle it. You're a puppet on Fun strings. The clowns watch and feed.

The inversion is perfect: most berserk modes make you powerful. Fun Berserk makes you *uncontrollable*. You're not raging — you're partying yourself to death.

### Goo (Factory)

Goo coats you, powers you up, makes you faster and stronger. The bar fills on contact and proximity to Goo sources.

**Full bar — burns up your items.** Your inventory catches fire (radioactive fire? Goo corrosion?). Items start destroying themselves. The Goo that made you powerful is now eating your gear. The power fantasy has a bill and it's due.

The tension: Goo makes you strong enough to fight the aliens, but if you lean into it too hard, you lose everything you're carrying. Risk/reward on every Goo puddle.

### Death (Graveyard)

Death builds while you exist in the Graveyard. The Deity is working. The bar is a countdown.

**Full bar — you die.** No debuff. No warning phase. No second chance. The bar fills, you're dead. The Deity finishes the job.

This is the simplest and most brutal element. Every other zone's full bar has a consequence you can survive. Death's consequence is Death. The Graveyard is the zone where the stakes are absolute.

---

## The Five Zones

Violencetown is divided into five distinct zones. Each zone is the home turf of a specific creature type. The zones together form a single contiguous map.

### 1. Town (City Center)
- **Resident creature:** Human
- **Element:** Boredom — increases with money. The richer you are, the more bored you get. Bar fills up and forces random actions. Fight it by spending money, throwing money at people, or breaking your own stuff on people. The rich person's curse.
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
- **Element:** Fun — bar fills as the vampire clowns entertain you. They do something genuinely good and fun... and it steals your Life. The more the bar fills, the more Life they drain. The circus is a blast and it's killing you.
- **Tile palette:** Striped tents, confetti, carnival booths, popcorn carts, funhouse mirrors, balloon piles, blood-red curtains, dim backstage areas, coffin-shaped prop boxes.
- **Boss:** SunMan — see Boss Profiles below.
- **Notes:** The Clowns are vampires. The circus is their cover. The Masquerade-style social dynamics (clans, politics, feeding, maintaining the facade) play out in a circus setting. This gives the Circus zone depth beyond just "creepy carnival" — it's a functioning vampire society with its own rules. The Clown creature could have vampire abilities: blood drain, mesmerize, night vision, weakness to sunlight (and therefore SunMan). Fun is their weapon — they don't attack you, they entertain you to death.

### 4. Graveyard
- **Resident creature:** Skeleton (Skeleton ↔ Zombie transformation)
- **Element:** Death — bar fills while you're in the Graveyard. The Deity is actually killing you. Not DoT, not a debuff — **Death**. The bar IS how close the Deity is to finishing the job. Full bar = dead. The Graveyard's element is the real thing.
- **Role:** The dead part of town. The undead are denying death — and something has noticed.
- **Vibe:** Tombstones, crypts, dead trees, fog, iron fences. Quiet and spooky. But underneath the quiet, Death is working.
- **Tile palette:** Gravestones, mausoleums, dirt paths, dead grass, iron gates, candles, fog tiles.
- **Boss:** The Deity — see Boss Profiles below.
- **Notes:** The Skeleton shifts to Zombie form when it takes damage. This zone is home to both forms — bones and rot. The graveyard should feel different depending on which form you're in. The Deity boss gives the Graveyard zone existential stakes — every undead creature here is living on borrowed time. Death as an element means the zone itself is hostile in a way no other zone is.

### 5. Factory
- **Resident creature:** Robot
- **Element:** Goo — **green, radioactive, alien.** The Factory's toxic machines produce Goo as a byproduct. Bar fills on contact or proximity. Goo makes you more powerful and faster, but the higher the bar, the more Life each action costs. It's a Faustian bargain — the Goo powers you up and burns you alive.
- **Role:** Industrial zone. The Factory's toxic machines produce Goo. The aliens arrived specifically to steal it — they eat it.
- **Vibe:** Machines, conveyor belts, smokestacks, metal walls, sparks. The Robot was built here. Mechanical and harsh. Goo pipelines run through everything — it's the Factory's main output. The aliens have set up feeding stations. Grey aliens in chains hauling Goo barrels while little green men eat from Goo troughs. **Abe's Oddysee energy** — the Factory should feel like Rupture Farms. A living industrial machine with distinct sub-areas: production floors, Goo vats, maintenance tunnels, loading docks, the alien-occupied executive level. Machines operate on predictable loops — conveyor tiles that push, crushers on timers, electric gates that toggle. Environmental storytelling through propaganda posters, Goo processing pipelines visible everywhere, and the alien spaceship looming over or docked into the Factory.
- **Tile palette:** Metal floors, conveyor belts, gears, pipes, vats, control panels, catwalks, smokestacks, green goo pools, goo vats, goo pipes, radiation symbols, alien tech, feeding troughs, chain/shackle tiles, alien propaganda.
- **Boss:** Alien Invasion — see Boss Profiles below.
- **Grey Alien rescue mechanic:** Inspired by Mudokon rescue from Abe's Oddysee. Grey aliens are chained up throughout the Factory, forced to haul Goo. Free them and they become your friends — they follow you, fight for you, help you. Simple command system: follow/wait. Lead them to extraction points to fully liberate them. Some are hidden in secret areas, rewarding exploration. The more you free, the stronger your position against the green commanders. They're grey. They're also *grey* — as in sad, depressed, downtrodden. Living a grey existence. You're literally adding color to their lives by freeing them. Everything about them is grey — their skin, their mood, their outlook, their living conditions. "Why so grey?" isn't just a skin color question.
- **Notes:** Natural fit for Robot's tech/machine identity. The Factory is the most Oddworld-inspired zone — enslaved workers, industrial horror played for dark comedy, comically evil corporate invaders (the greens), and a rescue loop that rewards thoroughness.

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
- A **flying saucer** docked into the Factory. Classic UFO design fused with industrial architecture.
- **What they want:** The Goo. The Factory's toxic machines produce it. The little green men **eat it**. They came here specifically to steal it and set up a permanent feeding operation. The Factory is their buffet.
- **Little Green Men** are the commanders. Small, big-headed, smart, cruel. Comically greedy — think Glukkons from Oddworld but alien. They gorge on Goo, bully their slaves, and act like they own the place. They're the corporate villains of the Factory — boardroom tyrants who happen to be three feet tall and green.
- **Alien blaster guns:** Comical design — a **red button on top** of the gun with **yellow and black hazard stripes** around it. The little green men press the button with their tiny little finger to fire. It's absurd. The most dangerous weapon in the zone is operated by a little guy pressing a big cartoon button.
- **Grey Aliens** are large, powerful, and **enslaved** by the greens. They haul Goo barrels, operate dangerous machinery, and take the beatings. They're grey in every sense — grey skin, grey mood, grey lives. Living a completely grey existence. Everything about them is sad and colorless. "Why the long grey face?" Free them and they become your friends. They follow you, fight alongside you, and finally have something to not be grey about.
- **The rescue loop (Abe's Oddysee inspired):** Grey aliens are chained throughout the Factory. Free them with a simple follow/wait command system. Lead them to extraction points. Some are hidden in secret areas. The more you free, the weaker the green commanders become — their labor force dries up, their Goo supply chain breaks. Rescuing greys IS the path to beating the boss. You don't just fight the greens — you dismantle their operation by liberating their workforce.
- **Tone:** Dark comedy. The greens are pathetic bullies who think they're geniuses. The greys are sympathetic giants. The Factory is horrifying but also absurd — like Rupture Farms. Propaganda posters on the walls. Goo advertisements. "Employee of the Month" boards with grey alien mugshots (all looking miserable).

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
14. **Boredom full bar:** Time skip is the current idea but needs design work. What does "time skips" actually mean mechanically? World changes around you? You teleport? NPCs act without you?
15. **Fun bar triggers:** What fills the Fun bar? Proximity to clown performances? Interacting with carnival games? Ambient in the zone? Can you avoid it or is it unavoidable?
16. **Fun Berserk specifics:** What random actions does your character do? How long does it last? Can the clowns trigger it intentionally as an attack?
17. **How to lower Fun, Goo, Death bars:** Sludge has soap+water, Boredom has spending money. What lowers Fun? Goo? Death? Each needs a scarce resource or action.
18. **Zone transitions and creature swaps:** When you cross from Town to Sewer, do you instantly become the Wererat? Transition animation? Do you keep items across zones? (Goo burns items — does that mean Factory items only?)
19. **Bar persistence:** When you leave a zone and come back, is the bar where you left it, or does it reset/decay?
20. **Soap as loot:** Is soap a common or rare item? Can you buy it in Town? Carry it into the Sewer? Or is it sewer-only loot?
