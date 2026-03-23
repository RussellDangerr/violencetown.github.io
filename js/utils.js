// ============================================================
// utils.js — Seeded RNG, simplex noise, and helpers
// ============================================================

/**
 * Mulberry32 — fast seeded 32-bit PRNG.
 * Returns a function that produces floats in [0, 1).
 */
export function mulberry32(seed) {
    let s = seed | 0;
    return function () {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Hash a chunk coordinate pair into a deterministic 32-bit seed.
 */
export function chunkSeed(cx, cy, worldSeed) {
    return ((cx * 73856093) ^ (cy * 19349663) ^ worldSeed) >>> 0;
}

/**
 * 2D Simplex Noise (self-contained, no dependencies).
 * Based on Stefan Gustavson's implementation — public domain.
 */
export class SimplexNoise {
    constructor(seed = 0) {
        const rng = mulberry32(seed);
        // Build a shuffled permutation table
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) p[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = (rng() * (i + 1)) | 0;
            [p[i], p[j]] = [p[j], p[i]];
        }
        this.perm = new Uint8Array(512);
        this.permMod12 = new Uint8Array(512);
        for (let i = 0; i < 512; i++) {
            this.perm[i] = p[i & 255];
            this.permMod12[i] = this.perm[i] % 12;
        }
    }

    noise2D(x, y) {
        const G2 = (3 - Math.sqrt(3)) / 6;
        const F2 = (Math.sqrt(3) - 1) / 2;
        const grad3 = [
            [1, 1], [-1, 1], [1, -1], [-1, -1],
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [-1, 1], [1, -1], [-1, -1],
        ];

        const s = (x + y) * F2;
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);
        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = x - X0;
        const y0 = y - Y0;

        const i1 = x0 > y0 ? 1 : 0;
        const j1 = x0 > y0 ? 0 : 1;

        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2;
        const y2 = y0 - 1 + 2 * G2;

        const ii = i & 255;
        const jj = j & 255;

        let n0 = 0, n1 = 0, n2 = 0;

        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            const gi = this.permMod12[ii + this.perm[jj]];
            t0 *= t0;
            n0 = t0 * t0 * (grad3[gi][0] * x0 + grad3[gi][1] * y0);
        }

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            const gi = this.permMod12[ii + i1 + this.perm[jj + j1]];
            t1 *= t1;
            n1 = t1 * t1 * (grad3[gi][0] * x1 + grad3[gi][1] * y1);
        }

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            const gi = this.permMod12[ii + 1 + this.perm[jj + 1]];
            t2 *= t2;
            n2 = t2 * t2 * (grad3[gi][0] * x2 + grad3[gi][1] * y2);
        }

        // Returns value in roughly [-1, 1]
        return 70 * (n0 + n1 + n2);
    }
}

// --- Small helpers ---

export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function manhattan(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

/**
 * Pick a random element from an array using a provided rng function.
 */
export function pick(arr, rng) {
    return arr[(rng() * arr.length) | 0];
}

/**
 * Weighted random selection.  `items` is [{..., weight}].
 */
export function weightedPick(items, rng) {
    const total = items.reduce((s, it) => s + (it.weight || 1), 0);
    let r = rng() * total;
    for (const it of items) {
        r -= it.weight || 1;
        if (r <= 0) return it;
    }
    return items[items.length - 1];
}
