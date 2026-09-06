// threat-phase.js — which phase the threat overlay is in, and whose sight
// justifies it.
//
// The overlay used to be always-on, with a watcher filter of "alive, not an
// ally, has eyes". In a stealth corridor that means threat. In the town square
// it meant everyone: measured on 2026-09-06, the opening plaza selected nine
// watchers, of which eight were idle townsfolk and two of those were vendors at
// +18 disposition. One was actually hostile. Half the floor was shaded because
// the shopkeeper could see you.
//
// So attention is a state now, and the overlay expresses it:
//
//   QUIET  nobody is looking, no combat, no theft being aimed  -> draw nothing
//   HAZE   someone is suspicious or searching, or you are      -> safe ground darkens
//          lining up a theft
//   ALARM  someone is chasing, or holds you in a DIRECT cone   -> it inverts;
//          the seen ground goes hot instead
//
// The inversion between HAZE and ALARM is deliberate: opposite polarities make
// the transition read as an event rather than as a colour change.
//
// Pure leaf module — imports nothing, so it is node-testable in isolation the
// way perception.js / pathing.js / rings.js are.

export const PHASE = { QUIET: 'QUIET', HAZE: 'HAZE', ALARM: 'ALARM' };

const HAZE_STATES  = new Set(['suspicious', 'searching']);
const ALARM_STATES = new Set(['chasing']);

// Alive, not on your side, and can actually see. The floor for every phase.
function canSee(w) {
    return !!w && w.entity?.isAlive?.() && !w._ally && (w.sightRange || 0) > 0;
}

// `opts.spotted` is the caller's perceives() === DIRECT result against the
// player, passed in rather than computed here so this module stays free of map
// and geometry dependencies.
export function threatPhase(watchers, opts = {}) {
    const live = (watchers || []).filter(canSee);

    if (opts.spotted || live.some(w => ALARM_STATES.has(w.state))) return PHASE.ALARM;
    if (live.some(w => HAZE_STATES.has(w.state)))                  return PHASE.HAZE;

    // Aiming a theft brings the field back even in a calm room. This is
    // load-bearing: plans/stealth-perception-and-thieve.md rules that "the room
    // stays legible so a theft is something you can plan", and gating purely on
    // enemy state would take that away.
    if (opts.aimingTheft && live.length) return PHASE.HAZE;

    return PHASE.QUIET;
}

// Whose sight the field is built from. Scoping this to the watchers who justify
// the phase is the single change that empties the town square.
export function alertWatchers(watchers, phase, opts = {}) {
    const live = (watchers || []).filter(canSee);
    if (phase === PHASE.QUIET) return [];

    const alert = live.filter(w => HAZE_STATES.has(w.state) || ALARM_STATES.has(w.state));
    // Planning a theft needs the mark's cone even though nobody is alert yet.
    if (!alert.length && opts.aimingTheft) return live;
    return alert;
}
