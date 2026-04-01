# Zone Room Sketches — Tile Layouts

Example room/area layouts at specific tile dimensions. Each character represents one tile. These are starting points for hand-crafting the map.

**Legend (shared):**
```
.  = floor/walkable
#  = wall
D  = door
```

---

## Town Rooms

### Town — Bank Street Office (20x15)

A boring corporate office. Fax machines, cubicles, beige everything. Boredom central.

```
Legend: F = fax machine, $ = coin pile, d = desk/cubicle, C = chair, A = ATM

####################
#....F..#..d.C.d.C.#
#....F..D..d.C.d.C.#
#.......#..........#
#.$$....#..d.C.d.C.#
#.$$..A.D..d.C.d.C.#
#.......#..........#
####D####..........#
#..............F...#
#..d.C.d.C.........#
#..d.C.d.C...$$....#
#..............F...#
#..d.C.d.C.........#
#..d.C.d.C.....D####
####################
```

### Town — City Block (30x30)

A block of Town with roads, sidewalks, a shop, and a park bench.

```
Legend: R = road, S = sidewalk, B = bench, T = tree, $ = coins, 
        P = store (spend money here), A = ATM

RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
SS....SS..SSSSSSSS..SS......SS
S#####.S..S......S..S.######.S
S#..P.#S..S......S..S.#....#.S
S#....#S..S.T..T.S..S.#..A.#.S
S#....DS..S..BB..S..S.D....#.S
S#..$.#S..S.T..T.S..S.#.$$.#.S
S######S..S......S..S.######.S
SS....SS..SSSSSSSS..SS......SS
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
SS......SS....SSSS........SSSS
S########S....S..S..########.S
S#......#S....S..S..#......#.S
S#......#S....S..S..#......#.S
S#......DS....D..D..D......#.S
S#......#S....S..S..#......#.S
S########S....S..S..########.S
SS......SS....SSSS........SSSS
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
SS..SSSSSSSSSSSSSSSSSSSS....SS
S.T....B..............B..T...S
S.T.......$..T..T..$........S
S........B..............B..T.S
S.T...........T..T...........S
S.....B..............B....T..S
SS..SSSSSSSSSSSSSSSSSSSSSS..SS
RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
```

---

## Sewer Rooms

### Sewer — Pipe Junction (25x20)

A junction where multiple tunnels meet. Central sludge pool. Tight passages only Rat form can squeeze through.

```
Legend: ~ = sludge pool, = = sludge flow, | = pipe wall, 
        W = clean water pipe (breakable), H = shower basin, 
        r = rat-only gap (1 tile wide)

#########################
####.....####~~~~####...#
###..........~~~~.......#
##...........~~~~.......#
#............~~~~....r###
#....####==========###..#
#....#~~===========#....#
#....#~~==~~~~~~~~=#....#
#....#~~==~~~~~~~~=#....#
#....#~~===========#....#
#....####==========###r.#
#...........~~~~........#
#.....W.....~~~~........#
##..........~~~~........#
###.....H...~~~~....r####
####.....####~~~~####...#
####.........~~~~.......#
####.........~~~~.......#
####.....#########......#
#########################
```

### Sewer — Deep Sewer Corridor (40x12)

Long tunnel leading toward Texas Beholdem. Sludge intensity increases left to right. Drips and geysers.

```
Legend: ~ = sludge, ^ = sludge geyser (erupts periodically), 
        v = sludge drip (from ceiling), ! = burst pipe (sprays line),
        W = clean water pipe, H = shower basin

########################################
#......v.....v........v..~~v..~~~v..~~~~#
#.............W..........~~...~~~...~~~~#
#...~.....~......~~..!..~~~..~~~~.~~~~~#
#...~.....~......~~.....~~~..~~~~.~~~~~#
#.............H..........~~...~~~...~~~~#
#......v.....v........v..~~v..~~~v..~~~~#
##r####..######..#r####..####..####..r##
#......v.....v...^....v..~~v..~~~v..^^^^#
#.............W..........~~...~~~..~~~~~#
#...~.....~......~~..!..~~~..~~~~.~~~~~#
########################################
```

---

## Circus Rooms

### Circus — Big Top Interior (30x30)

The main tent. Circular performance area in the center. Seating around it. Backstage access.

```
Legend: * = confetti tile, B = balloon pile, G = carnival game booth,
        ~ = cotton candy (sticky), M = funhouse mirror, K = backstage (safe),
        O = performance ring, C = clown NPC position, S = seating

##############################
#KKKK#..S.S.S.S.S.S.S..#KKKK#
#KKKK#..S.S.S.S.S.S.S..#KKKK#
#KKKKD..S.S.S.S.S.S.S..DKKKK#
######....................#####
#..*..B.................B..*..#
#..*.....OOOOOOOOOOOO.....*.B.#
#........O..........O........#
#..B.....O..........O.....B..#
#........O....CC....O........#
#.G......O..........O......G.#
#........O....CC....O........#
#........O..........O........#
#..B.....O..........O.....B..#
#........O..........O........#
#........OOOOOOOOOOOO........#
#..*..B.................B..*..#
#.B...........................#
#.............................#
#.G...B.......B.......B...G..#
#.............................#
#..*.....~.........~.....*.B.#
#........~.........~.........#
#.....B..~.........~..B......#
######....................#####
#KKKK#..M...M...M...M..#KKKK#
#KKKKD..................DKKKK#
#KKKK#..................#KKKK#
#KKKK#..................#KKKK#
##############################
```

### Circus — Carnival Midway (50x15)

The main strip. Booths on both sides, clowns performing, Fun hazards everywhere.

```
Legend: G = game booth, * = confetti, B = balloon, C = clown performer,
        ~ = cotton candy, P = prize booth, M = mirror, ! = pie trap

##################################################
#G.G.#B.*.#P..P.#..M..#G..G.#!...#B.B.#G.*.#..P.#
#G.G.D..*.D....PDM...MDG..G.D!...D..B.DG.*.D..P.#
#G.G.#..*.#P..P.#..M..#G..G.#!...#B.B.#G.*.#..P.#
######.####.####.######.#####.####.####.####.#####
#..*......*....B......*......B....*.....B........*#
#...C........C....~.......C....~.....C.......C...#
#...........B.......*.......B......*...B.........#
#..*......*....B......*......B....*.....B........*#
######.####.####.######.#####.####.####.####.#####
#!..!.#B.*.#G..G.#P..P.#M.M.#G..G.#*.*.#P..P.#..#
#!..!.D..*.DG..G.DP..P.DM..MDG..G.D*.*.DP..P.D..#
#!..!.#B.*.#G..G.#P..P.#M.M.#G..G.#*.*.#P..P.#..#
##################################################
#KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK#
##################################################
```

---

## Graveyard Rooms

### Graveyard — Cemetery Surface (30x25)

Classic cemetery. Tombstone rows, a path, fog patches, bone piles.

```
Legend: t = tombstone, b = bone pile, f = fog (Death ticks faster), 
        + = candle (when it goes out, Death spikes), x = open grave,
        T = dead tree, g = iron gate, L = sacred ground (safe),
        h = skeletal hand tile

###########gg####gg############
#.t..t..t......t..t..t..t..t.#
#.........................b...#
#.t..t..t......t..t..t..t....#
#..b......f.f.f.f.f......b...#
#.t..t..f.f.f.f.f.f.f.t..t..#
#.........f.f.f.f.f..........#
#.t..t..t..f.f.f..t..t..t.h.#
#.............................#
#.t..t..t......t..t..t..t..t.#
#..........x.......x.........#
#.t..t..t......t..t..t..t..t.#
#.....h.......................#
####D##########D##########D###
#..+...+..#LLLLLLLL#..+...+..#
#.........#LLLLLLLL#..........#
#..T...T..DLLLLLLLL#..T...T..#
#.........#LLLLLLLL#..........#
#..+...+..#LLLLLLLL#..+...+..#
####D######LLLLLLLL######D####
#..b..b..b.#......#.b..b..b..#
#..b..b..b.#......#.b..b..b..#
#..b..b..b.D......D.b..b..b..#
#..b..b..b.#......#.b..b..b..#
##############################
```

### Graveyard — Catacombs (25x15)

Underground bone corridors. Walls of bones. The Deity's voice echoes here.

```
Legend: b = bone pile, B = bone wall (proximity = Death tick), 
        + = candle, x = coffin, W = death whisper tile,
        h = skeletal hand, L = sacred ground

#########################
#BBB#.....+.....+.#BBB.#
#BBB#..............#BBB.#
#BBBD.....b........DBBB.#
#BBB#..............#BBB.#
#BBB#.....+.....+.#BBB.#
#####D####..####D########
#.h......W....W.........#
#......b....b....b...h..#
#..+.....W....W.....+...#
#...LLLLLLLLLLLLLLLL.....#
#...LLLLLLLLLLLLLLLL.....#
#..+.x..x..x..x..x..+..#
#........................#
#########################
```

---

## Factory Rooms

### Factory — Production Floor (35x20)

Assembly line with conveyor belts, Goo vats, and working machines.

```
Legend: g = goo pool, G = goo vat (radiates 2-3 tiles), 
        > = conveyor belt (pushes right), < = conveyor (pushes left),
        ^ v = conveyor up/down, X = crusher (timed), 
        E = electric gate (toggles), Z = steam vent,
        C = control room (safe), A = grey alien (chained), 
        m = maintenance tunnel (safe)

###################################
#C.C.C#..>>>>>>>>X>>>>>>>>..#m.m.m#
#C.C.CD..>>>>>>>>X>>>>>>>>..Dm.m.m#
#C.C.C#.........................A.#
#######.........GGGG..........####
#.g....g........GGGG........g....#
#.g....g........GGGG........g....#
#.......E........................#
#.......E.....g.....g............#
#..A..........g.....g.......A...#
#.......E........................#
#.......E........................#
#.g....g........GGGG........g....#
#.g....g........GGGG........g....#
#######.........GGGG..........####
#Z..Z.#.........................A.#
#.....D..<<<<<<<<X<<<<<<<<..Dm.m.m#
#Z..Z.#..<<<<<<<<X<<<<<<<<..#m.m.m#
#.....#..<<<<<<<<X<<<<<<<<..#m.m.m#
###################################
```

### Factory — Alien Executive Level (30x20)

Top floor. Where the little green men run things. Feeding troughs, propaganda, the spaceship docking port.

```
Legend: g = goo pool, F = feeding trough (high Goo radiation), 
        * = alien tech, = = spaceship hull, P = propaganda poster,
        L = little green man position, A = grey alien (chained),
        C = control room (safe), m = maintenance (safe)

######========================
#P...#=..*..*..*..*..*..==..=#
#....D=..................==..=#
#..F.#=...L....F....L...==..=#
#..F.#=..................==..=#
#....D=...g..g..g..g.g..==..=#
#P...#=..................==..=#
######=..*..*..*..*..*..======
#m.m.m#..........A...........#
#m.m.mD.............g........#
#m.m.m#...A..........g.......#
#######..........A...........#
#....P#..........................#
#.....D.......F.....F........#
#..A..#.....L....L....L......#
#.....#..g..g..g..g..g..g...#
#....P#......................#
#.....D..........A...........#
#.....#......................#
##############################
```
