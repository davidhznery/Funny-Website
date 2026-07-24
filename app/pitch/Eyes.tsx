"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { ForkModeId } from "./config";

const VB_W = 480;
const VB_H = 320;
// Two tall ovals, horizontally aligned, with generous space around them.
const EYES = [
  { cx: 150, cy: 156, rx: 66, ry: 92 },
  { cx: 330, cy: 156, rx: 66, ry: 92 },
];
const PUPIL_R = 24;
const PAD = 8;
const RANGE = 0.82; // slightly reduced movement range for polish
const INACTIVE_MS = 2500; // pupils drift back to centre after this idle time

type Props = {
  /** Viewport-space point of the hovered/focused button, or null. */
  focus: { x: number; y: number } | null;
  /** Hovered button id — drives the brief per-button reaction. */
  reaction: ForkModeId | null;
  /** Set to a button id to play the exit; onExited fires when it's done. */
  exitTo: ForkModeId | null;
  onExited: () => void;
  reduced: boolean;
};

export default function Eyes({ focus, reaction, exitTo, onExited, reduced }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const outerRefs = useRef<SVGGElement[]>([]);
  const blinkRefs = useRef<SVGGElement[]>([]);
  const pupilRefs = useRef<SVGCircleElement[]>([]);

  // Live values the rAF loop reads without re-subscribing.
  const pointer = useRef({ x: 0, y: 0, active: false, last: 0 });
  const focusRef = useRef<Props["focus"]>(null);
  const reducedRef = useRef(reduced);
  const busyRef = useRef(false); // pause blinking during reactions/exit
  const offsets = useRef([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);
  const isTouch = useRef(false);

  useEffect(() => {
    focusRef.current = focus;
  }, [focus]);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  // ── cursor tracking + render loop ────────────────────────────────
  useEffect(() => {
    isTouch.current =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;

    const onMove = (e: MouseEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      pointer.current.active = true;
      pointer.current.last = performance.now();
    };
    const onLeave = () => {
      pointer.current.active = false;
    };

    const trackCursor = !reduced && !isTouch.current;
    if (trackCursor) {
      window.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("mouseleave", onLeave);
      window.addEventListener("blur", onLeave);
    }

    let raf = 0;
    const tick = () => {
      const svg = svgRef.current;
      if (svg) {
        const rect = svg.getBoundingClientRect();
        const sx = rect.width / VB_W;
        const sy = rect.height / VB_H;

        const now = performance.now();
        let target = focusRef.current;
        if (!target && trackCursor && pointer.current.active && now - pointer.current.last < INACTIVE_MS) {
          target = { x: pointer.current.x, y: pointer.current.y };
        }

        EYES.forEach((eye, i) => {
          let ox = 0;
          let oy = 0;
          if (target && sx > 0) {
            const eyeScreenX = rect.left + eye.cx * sx;
            const eyeScreenY = rect.top + eye.cy * sy;
            // target relative to eye centre, in viewBox units
            const dxV = (target.x - eyeScreenX) / sx;
            const dyV = (target.y - eyeScreenY) / sy;
            ox = dxV * 0.16;
            oy = dyV * 0.16;
            const maxH = eye.rx - PUPIL_R - PAD;
            const maxV = eye.ry - PUPIL_R - PAD;
            const e = Math.hypot(ox / maxH, oy / maxV);
            if (e > 1) {
              ox /= e;
              oy /= e;
            }
            ox *= RANGE;
            oy *= RANGE;
          }
          const cur = offsets.current[i];
          cur.x += (ox - cur.x) * 0.15; // smooth interpolation, never snaps
          cur.y += (oy - cur.y) * 0.15;
          const pupil = pupilRefs.current[i];
          if (pupil) pupil.setAttribute("transform", `translate(${cur.x.toFixed(2)} ${cur.y.toFixed(2)})`);
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (trackCursor) {
        window.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseleave", onLeave);
        window.removeEventListener("blur", onLeave);
      }
    };
  }, [reduced]);

  // ── blinking at irregular intervals ──────────────────────────────
  useEffect(() => {
    if (reduced) return;
    let timer = 0;
    const blink = () => {
      if (!busyRef.current && blinkRefs.current.length === 2) {
        const tl = gsap.timeline();
        EYES.forEach((eye, i) => {
          tl.to(
            blinkRefs.current[i],
            { scaleY: 0.08, duration: 0.075, ease: "power2.in", svgOrigin: `${eye.cx} ${eye.cy}` },
            0,
          ).to(
            blinkRefs.current[i],
            { scaleY: 1, duration: 0.09, ease: "power2.out", svgOrigin: `${eye.cx} ${eye.cy}` },
            0.075,
          );
        });
      }
      timer = window.setTimeout(blink, 2600 + Math.random() * 3600); // never perfectly regular
    };
    timer = window.setTimeout(blink, 1400 + Math.random() * 2000);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  // ── per-button hover reaction ────────────────────────────────────
  useEffect(() => {
    if (reduced) return;
    busyRef.current = reaction !== null;
    const outer = outerRefs.current;
    if (outer.length !== 2) return;

    const rest = () =>
      gsap.to(outer, { scaleX: 1, scaleY: 1, x: 0, duration: 0.3, ease: "power2.out", overwrite: true });

    if (reaction === null) {
      rest();
      return;
    }
    if (reaction === "stalk") {
      // narrow, as if inspecting the visitor
      gsap.to(outer, { scaleY: 0.6, scaleX: 1.02, x: 0, duration: 0.25, ease: "power2.out", overwrite: true });
    } else if (reaction === "learn") {
      // open a little wider, approving
      gsap.to(outer, { scaleY: 1.16, scaleX: 1.05, x: 0, duration: 0.25, ease: "back.out(2)", overwrite: true });
    } else if (reaction === "steal") {
      // shifty: dart left and right, suspicious
      gsap.killTweensOf(outer);
      gsap.set(outer, { scaleY: 0.82, scaleX: 1 });
      gsap.fromTo(
        outer,
        { x: -12 },
        { x: 12, duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: 3, overwrite: true },
      );
    }
    return () => {
      gsap.killTweensOf(outer);
    };
  }, [reaction, reduced]);

  // ── exit when a button is committed ──────────────────────────────
  useEffect(() => {
    if (exitTo === null) return;
    if (reduced) {
      onExited();
      return;
    }
    busyRef.current = true;
    const tl = gsap.timeline({ onComplete: onExited });
    // a single, deliberate blink…
    EYES.forEach((eye, i) => {
      tl.to(blinkRefs.current[i], { scaleY: 0.08, duration: 0.09, ease: "power2.in", svgOrigin: `${eye.cx} ${eye.cy}` }, 0)
        .to(blinkRefs.current[i], { scaleY: 1, duration: 0.1, ease: "power2.out", svgOrigin: `${eye.cx} ${eye.cy}` }, 0.09);
    });
    // …then shrink and fade the whole pair away
    tl.to(svgRef.current, { scale: 0.55, opacity: 0, duration: 0.32, ease: "power2.in", transformOrigin: "50% 50%" }, 0.2);
    return () => {
      tl.kill();
    };
  }, [exitTo, reduced, onExited]);

  return (
    <svg
      ref={svgRef}
      className="pitch-eyes"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      aria-hidden="true"
      focusable="false"
    >
      {EYES.map((eye, i) => (
        <g
          key={i}
          ref={(el) => {
            if (el) outerRefs.current[i] = el;
          }}
        >
          <g
            ref={(el) => {
              if (el) blinkRefs.current[i] = el;
            }}
          >
            <ellipse
              cx={eye.cx}
              cy={eye.cy}
              rx={eye.rx}
              ry={eye.ry}
              fill="none"
              stroke="var(--ink, #151512)"
              strokeWidth="5"
            />
            <circle
              ref={(el) => {
                if (el) pupilRefs.current[i] = el;
              }}
              cx={eye.cx}
              cy={eye.cy}
              r={PUPIL_R}
              fill="var(--ink, #151512)"
            />
          </g>
        </g>
      ))}
    </svg>
  );
}
