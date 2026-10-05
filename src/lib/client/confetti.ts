'use client';

import confetti from 'canvas-confetti';

/** BRANIE-kleuren: rood, wit, mosterd, lichtblauw. */
const COLORS = ['#e30613', '#ffffff', '#e3a700', '#a6dde9'];

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Confetti met Andreaskruisjes (X) en gewone snippers. */
function shapes() {
  try {
    return [confetti.shapeFromText({ text: '✕', scalar: 2, color: '#e30613' }), 'square' as const];
  } catch {
    return ['square' as const];
  }
}

/** Korte knal vanuit het midden (goed geraden, iemand erin laten trappen). */
export function burst() {
  if (reducedMotion()) return;
  void confetti({ particleCount: 90, spread: 80, startVelocity: 45, origin: { y: 0.6 }, colors: COLORS, scalar: 1.1 });
  void confetti({ particleCount: 25, spread: 100, origin: { y: 0.6 }, shapes: shapes(), scalar: 2, colors: COLORS });
}

/** Feest voor de winnaar: een paar seconden confetti van links en rechts. */
export function celebrate(durationMs = 3500) {
  if (reducedMotion()) return;
  const end = Date.now() + durationMs;
  const s = shapes();
  (function frame() {
    void confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLORS, shapes: s, scalar: 1.4 });
    void confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLORS, shapes: s, scalar: 1.4 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
