// utils.js — small helpers (clean slate, no noise/RNG)

export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
}

export function manhattan(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
