"use client";

import { useEffect, useRef } from "react";
import "./lab.css";

// Practical, work-facing skills — never programming jargon.
const CONCEPTS = [
  "Better Prompts",
  "ChatGPT",
  "Claude Code",
  "Cursor",
  "AI Agents",
  "Deep Research",
  "Google Sheets",
  "Excel Automation",
  "Reports",
  "Presentations",
  "Email Replies",
  "Workflow Design",
  "Decision Making",
  "Save Time",
  "Think Better",
  "Problem Solving",
  "Automation",
  "Research Faster",
  "Organize Ideas",
  "Compare Answers",
  "Learn Faster",
  "Work Smarter",
  "Less Busywork",
];

const SIZE = 44; // idea square, px
const SPEED = 140; // constant px/s — calm and hypnotic

export default function IdeaLab() {
  const stageRef = useRef<HTMLDivElement>(null);
  const ideaRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const idea = ideaRef.current;
    const word = wordRef.current;
    const ripple = rippleRef.current;
    if (!stage || !idea || !word || !ripple) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = stage.clientWidth;
    let H = stage.clientHeight;

    // physics state
    let x = (W - SIZE) / 2;
    let y = (H - SIZE) / 2;
    let ang = Math.random() * Math.PI * 2;
    // avoid near-axis directions so it visits every wall
    if (Math.abs(Math.sin(ang)) < 0.4 || Math.abs(Math.cos(ang)) < 0.4) ang += 0.6;
    let vx = Math.cos(ang) * SPEED;
    let vy = Math.sin(ang) * SPEED;
    let sx = 1;
    let sy = 1; // squash
    let rot = 0;

    let lastWord = -1;
    let wordAnim: Animation | null = null;
    let rippleAnim: Animation | null = null;

    const draw = () => {
      idea.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sx}, ${sy})`;
    };

    if (reduce) {
      // static idea, no motion
      draw();
      return;
    }

    const burst = (px: number, py: number) => {
      // ripple at the impact point (reused element)
      rippleAnim?.cancel();
      ripple.style.left = `${px}px`;
      ripple.style.top = `${py}px`;
      rippleAnim = ripple.animate(
        [
          { transform: "translate(-50%, -50%) scale(0.35)", opacity: 0.5 },
          { transform: "translate(-50%, -50%) scale(2.1)", opacity: 0 },
        ],
        { duration: 620, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );

      // one floating keyword near the impact (reused element)
      let i = Math.floor(Math.random() * CONCEPTS.length);
      if (i === lastWord) i = (i + 1) % CONCEPTS.length; // no immediate repeat
      lastWord = i;
      word.textContent = CONCEPTS[i];
      const wx = Math.max(54, Math.min(W - 54, px));
      const wy = Math.max(20, Math.min(H - 20, py));
      const tilt = (Math.random() - 0.5) * 18;
      word.style.left = `${wx}px`;
      word.style.top = `${wy}px`;
      wordAnim?.cancel();
      wordAnim = word.animate(
        [
          { opacity: 0, transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(0.9)` },
          { opacity: 1, transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(1)`, offset: 0.18 },
          { opacity: 1, transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(1)`, offset: 0.72 },
          { opacity: 0, transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(1)` },
        ],
        { duration: 1050, easing: "ease-out" },
      );
    };

    const hit = (axis: "x" | "y", px: number, py: number) => {
      // squash along the impact normal, then spring back
      if (axis === "x") {
        sx = 0.72;
        sy = 1.16;
      } else {
        sx = 1.16;
        sy = 0.72;
      }
      rot += (Math.random() - 0.5) * 12; // tiny tumble
      burst(px, py);
    };

    let raf = 0;
    let last = 0;
    let running = true;

    const tick = (now: number) => {
      if (!last) last = now;
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;

      x += vx * dt;
      y += vy * dt;

      const maxX = W - SIZE;
      const maxY = H - SIZE;
      if (x <= 0) {
        x = 0;
        vx = Math.abs(vx);
        hit("x", 0, y + SIZE / 2);
      } else if (x >= maxX) {
        x = maxX;
        vx = -Math.abs(vx);
        hit("x", W, y + SIZE / 2);
      }
      if (y <= 0) {
        y = 0;
        vy = Math.abs(vy);
        hit("y", x + SIZE / 2, 0);
      } else if (y >= maxY) {
        y = maxY;
        vy = -Math.abs(vy);
        hit("y", x + SIZE / 2, H);
      }

      sx += (1 - sx) * 0.18; // ease squash back to 1
      sy += (1 - sy) * 0.18;
      rot *= 0.94; // settle back to level

      draw();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // keep it inside bounds when the panel resizes
    const ro = new ResizeObserver(() => {
      W = stage.clientWidth;
      H = stage.clientHeight;
      x = Math.max(0, Math.min(W - SIZE, x));
      y = Math.max(0, Math.min(H - SIZE, y));
    });
    ro.observe(stage);

    // pause when the panel is off-screen
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && running) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(stage);

    start();

    return () => {
      running = false;
      stop();
      ro.disconnect();
      io.disconnect();
      wordAnim?.cancel();
      rippleAnim?.cancel();
    };
  }, []);

  return (
    <>
      <div className="toy-top">
        <span>UNNECESSARY LAB™</span>
        <span>● LIVE</span>
      </div>
      <div className="lab-stage" ref={stageRef}>
        <div className="lab-ripple" ref={rippleRef} aria-hidden="true" />
        <span className="lab-word" ref={wordRef} aria-hidden="true" />
        <div className="lab-idea" ref={ideaRef} aria-hidden="true" />
      </div>
      <div className="toy-caption">
        <span>IDEAS → SOLUTIONS</span>
        <span>↻</span>
      </div>
    </>
  );
}
