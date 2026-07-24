"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./end.css";

const TAUNTS = ["NOPE.", "TOO SLOW.", "NICE TRY."];
const EDGE = 32; // keep this far from the section edges
const AVOID_PAD = 14; // breathing room around protected text

type Props = {
  /** Where to send the visitor if the tab can't be closed. */
  exitUrl?: string;
};

type Pos = { x: number; y: number };
type Box = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  bw: number;
  bh: number;
  left: number;
  top: number;
};

export default function EvasiveExit({ exitUrl = "https://www.google.com" }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const [evasive, setEvasive] = useState(false);
  const [measured, setMeasured] = useState(false);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [tilt, setTilt] = useState(0);
  const [scale, setScale] = useState(1);
  const [label, setLabel] = useState("EXIT THIS SITE ↗");
  const [caught, setCaught] = useState(false);

  const attempts = useRef(0);
  const focused = useRef(false);
  const frozen = useRef(false);
  const cooldownUntil = useRef(0);
  const cursor = useRef<Pos>({ x: -9999, y: -9999 });
  const cursorInside = useRef(false);
  const posRef = useRef<Pos>({ x: 0, y: 0 });
  const tauntTimer = useRef<number | null>(null);
  const levelTimer = useRef<number | null>(null);
  const avoidRects = useRef<{ x: number; y: number; w: number; h: number }[]>([]);

  posRef.current = pos;

  // Full-section placement box (button always lives somewhere in the section).
  const sectionBox = useCallback((): Box | null => {
    const section = sectionRef.current;
    const btn = btnRef.current;
    if (!section || !btn) return null;
    const s = section.getBoundingClientRect();
    const bw = btn.offsetWidth;
    const bh = btn.offsetHeight;
    return {
      minX: EDGE,
      maxX: s.width - EDGE - bw,
      minY: EDGE,
      maxY: s.height - EDGE - bh,
      bw,
      bh,
      left: s.left,
      top: s.top,
    };
  }, []);

  // The same box narrowed to the part of the section on screen, so an escape
  // never flings the button out of the viewport. (Only meaningful while the
  // user can actually see — and therefore hover — the button.)
  const visibleBox = useCallback((): Box | null => {
    const base = sectionBox();
    const section = sectionRef.current;
    if (!base || !section) return null;
    const s = section.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const viewTop = Math.max(0, -s.top);
    const viewBottom = Math.min(s.height, vh - s.top);
    const viewLeft = Math.max(0, -s.left);
    const viewRight = Math.min(s.width, vw - s.left);
    return {
      ...base,
      minX: Math.max(base.minX, viewLeft + EDGE),
      maxX: Math.min(base.maxX, viewRight - EDGE - base.bw),
      minY: Math.max(base.minY, viewTop + EDGE),
      maxY: Math.min(base.maxY, viewBottom - EDGE - base.bh),
    };
  }, [sectionBox]);

  const collectAvoid = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const base = section.getBoundingClientRect();
    const sel = ".hire-eyebrow, h2, .hire-sub, .contact-row, .footer-row";
    avoidRects.current = [...section.querySelectorAll(sel)].map((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left - base.left - AVOID_PAD,
        y: r.top - base.top - AVOID_PAD,
        w: r.width + AVOID_PAD * 2,
        h: r.height + AVOID_PAD * 2,
      };
    });
  }, []);

  const collides = (x: number, y: number, bw: number, bh: number) =>
    avoidRects.current.some(
      (r) => x < r.x + r.w && x + bw > r.x && y < r.y + r.h && y + bh > r.y,
    );

  const pickSpot = useCallback(
    (a: number): Pos | null => {
      const vb = visibleBox();
      const b = vb && vb.maxX > vb.minX && vb.maxY > vb.minY ? vb : sectionBox();
      if (!b || b.maxX <= b.minX || b.maxY <= b.minY) return null;
      const { minX, maxX, minY, maxY } = b;

      const cur = posRef.current;
      const curCx = cur.x + b.bw / 2;
      const curCy = cur.y + b.bh / 2;
      const cxL = cursor.current.x - b.left;
      const cyL = cursor.current.y - b.top;
      const away = Math.atan2(curCy - cyL, curCx - cxL); // away from the cursor

      const span = Math.max(maxX - minX, maxY - minY);
      const reach = a <= 2 ? 190 : a <= 4 ? 320 : a <= 6 ? 460 : span;

      for (let i = 0; i < 40; i++) {
        const ang = away + (Math.random() - 0.5) * Math.PI * (a >= 7 ? 1.6 : 0.9);
        const r = reach * (0.45 + Math.random() * 0.55);
        let x = curCx + Math.cos(ang) * r - b.bw / 2;
        let y = curCy + Math.sin(ang) * r - b.bh / 2;
        x = Math.max(minX, Math.min(maxX, x));
        y = Math.max(minY, Math.min(maxY, y));
        if (collides(x, y, b.bw, b.bh)) continue;
        if (Math.hypot(x - cur.x, y - cur.y) < 80) continue; // avoid returning next door
        return { x, y };
      }
      for (let i = 0; i < 80; i++) {
        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);
        if (!collides(x, y, b.bw, b.bh)) return { x, y };
      }
      return null;
    },
    [visibleBox, sectionBox],
  );

  const escape = useCallback(() => {
    if (frozen.current || focused.current) return;
    const now = performance.now();
    if (now < cooldownUntil.current) return;

    attempts.current += 1;
    const a = attempts.current;
    const spot = pickSpot(a);
    if (!spot) return;

    const duration = a <= 2 ? 260 : a <= 4 ? 220 : 190;
    cooldownUntil.current = now + duration + 40;

    setPos(spot);
    setTilt((Math.random() - 0.5) * (a >= 3 ? 18 : 10));
    if (a >= 7) {
      setScale(0.6);
      window.setTimeout(() => setScale(1), duration * 0.6);
    }
    if (levelTimer.current) window.clearTimeout(levelTimer.current);
    levelTimer.current = window.setTimeout(() => setTilt(0), duration);

    if (a >= 5 && !tauntTimer.current) {
      setLabel(TAUNTS[Math.floor(Math.random() * TAUNTS.length)]);
      tauntTimer.current = window.setTimeout(() => {
        setLabel("EXIT THIS SITE ↗");
        tauntTimer.current = null;
      }, 900);
    }
  }, [pickSpot]);

  // Desktop-evasive vs. static, decided once on mount.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    sectionRef.current = btnRef.current?.closest("section") ?? null;
    setEvasive(!reduce && !touch);
  }, []);

  // Place at the section's bottom-right once the button is truly absolute
  // (so it isn't measured at the stretched flex-item width). Keep it in the
  // section on resize.
  useEffect(() => {
    if (!evasive) return;
    const raf = requestAnimationFrame(() => {
      collectAvoid();
      const b = sectionBox();
      if (!b) return;
      setPos({ x: b.maxX, y: b.maxY });
      setMeasured(true);
    });
    const onResize = () => {
      collectAvoid();
      const b = sectionBox();
      if (!b) return;
      setPos((p) => ({
        x: Math.max(b.minX, Math.min(b.maxX, p.x)),
        y: Math.max(b.minY, Math.min(b.maxY, p.y)),
      }));
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [evasive, sectionBox, collectAvoid]);

  // Proximity watcher — one rAF loop; mousemove only records coordinates.
  useEffect(() => {
    if (!evasive) return;
    const onMove = (e: MouseEvent) => {
      cursor.current = { x: e.clientX, y: e.clientY };
      cursorInside.current = true;
    };
    const onOut = () => {
      cursorInside.current = false;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onOut);

    let raf = 0;
    const tick = () => {
      const btn = btnRef.current;
      if (btn && cursorInside.current && !frozen.current && !focused.current) {
        const r = btn.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.hypot(cursor.current.x - cx, cursor.current.y - cy);
        const radius = Math.min(160, 110 + attempts.current * 6);
        if (dist < radius) escape();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onOut);
    };
  }, [evasive, escape]);

  useEffect(
    () => () => {
      if (tauntTimer.current) window.clearTimeout(tauntTimer.current);
      if (levelTimer.current) window.clearTimeout(levelTimer.current);
    },
    [],
  );

  const activate = () => {
    if (caught) return;
    frozen.current = true;
    setCaught(true);
    setTilt(0);
    setScale(1);
    setLabel("WAIT—YOU ACTUALLY GOT IT?");
    window.setTimeout(() => {
      // Attempt to close exactly once; browsers block this for tabs they
      // didn't open via script, so fall back to the configured exit URL.
      window.close();
      window.setTimeout(() => {
        if (!window.closed) window.location.href = exitUrl;
      }, 350);
    }, 1000);
  };

  let style: React.CSSProperties = {};
  if (evasive && measured) {
    style = {
      position: "absolute",
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      transform: `rotate(${tilt}deg) scale(${scale})`,
    };
  } else if (evasive) {
    style = { position: "absolute", right: `${EDGE}px`, bottom: `${EDGE}px` };
  }

  return (
    <button
      ref={btnRef}
      type="button"
      className={`exit-btn${evasive ? " exit-btn--evasive" : ""}${caught ? " is-caught" : ""}`}
      style={style}
      onClick={activate}
      onFocus={() => {
        focused.current = true; // stop escaping while keyboard-focused
      }}
      onBlur={() => {
        focused.current = false;
      }}
      aria-label="Exit this site"
    >
      {label}
    </button>
  );
}
