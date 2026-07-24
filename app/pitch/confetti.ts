import { CONFETTI_COLORS } from "./config";

type Burst = {
  /** Origin in viewport pixels. Defaults to the horizontal centre, upper third. */
  x?: number;
  y?: number;
  count?: number;
  power?: number;
  durationMs?: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  w: number;
  h: number;
  color: string;
  life: number;
  ttl: number;
};

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let raf = 0;
let dpr = 1;

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const s = canvas.style;
  s.position = "fixed";
  s.inset = "0";
  s.width = "100%";
  s.height = "100%";
  s.pointerEvents = "none"; // never blocks buttons or navigation
  s.zIndex = "9999";
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx = canvas.getContext("2d");
  if (ctx) ctx.scale(dpr, dpr);
  document.body.appendChild(canvas);
}

function teardown() {
  cancelAnimationFrame(raf);
  raf = 0;
  particles = [];
  if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
  canvas = null;
  ctx = null;
}

function tick() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let alive = 0;
  for (const p of particles) {
    p.life += 1;
    if (p.life > p.ttl) continue;
    alive++;
    p.vy += 0.16; // gravity
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vrot;
    const fade = Math.max(0, 1 - p.life / p.ttl);
    ctx.save();
    ctx.globalAlpha = Math.min(1, fade * 1.6);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }
  if (alive > 0) {
    raf = requestAnimationFrame(tick);
  } else {
    teardown();
  }
}

function spawn({ x, y, count = 90, power = 1, durationMs = 2000 }: Burst) {
  const ox = x ?? window.innerWidth / 2;
  const oy = y ?? window.innerHeight / 3;
  const ttl = Math.round((durationMs / 1000) * 60);
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95;
    const speed = (5 + Math.random() * 9) * power;
    particles.push({
      x: ox + (Math.random() - 0.5) * 40,
      y: oy + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 3,
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.4,
      w: 6 + Math.random() * 8,
      h: 3 + Math.random() * 5,
      color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
      life: 0,
      ttl: ttl * (0.7 + Math.random() * 0.5),
    });
  }
}

/**
 * Fire a confetti burst from `origin` (viewport pixels). Returns immediately;
 * particles clean themselves out of the DOM when the animation settles.
 * No-op when the user prefers reduced motion.
 */
export function launchConfetti(burst: Burst = {}) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  ensureCanvas();
  spawn(burst);
  if (!raf) raf = requestAnimationFrame(tick);
}
