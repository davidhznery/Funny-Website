"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { FORK_ORDER, forkConfig, type ForkModeId } from "./config";
import { launchConfetti } from "./confetti";
import Eyes from "./Eyes";
import "./pitch.css";

const REVEAL_TO_REDIRECT = 2200; // ms the joke lingers before navigating

export default function ForkPitchSection() {
  const [active, setActive] = useState<ForkModeId | null>(null);
  const [pendingId, setPendingId] = useState<ForkModeId | null>(null);
  const [message, setMessage] = useState<string>("");
  const [reduced, setReduced] = useState(false);
  const [hovered, setHovered] = useState<ForkModeId | null>(null);
  const [focus, setFocus] = useState<{ x: number; y: number } | null>(null);
  const [exitTo, setExitTo] = useState<ForkModeId | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const memeRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<HTMLSpanElement>(null);
  const timers = useRef<number[]>([]);
  const idleTween = useRef<gsap.core.Tween | null>(null);
  const exitIdRef = useRef<ForkModeId | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const after = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(
    () => () => {
      clearTimers();
      idleTween.current?.kill();
    },
    [],
  );

  // Per-mode idle "personality" motion once a meme has entered.
  const startIdle = (id: ForkModeId) => {
    idleTween.current?.kill();
    if (reduced || !memeRef.current) return;
    if (id === "stalk") {
      // suspicious scanning: slow sway + slight tilt, like casing the page
      idleTween.current = gsap.fromTo(
        memeRef.current,
        { rotation: -2.5, x: -8 },
        {
          rotation: 2.5,
          x: 8,
          duration: 1.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          transformOrigin: "50% 100%",
        },
      );
    } else if (id === "steal") {
      // grabby tugging toward the headline
      idleTween.current = gsap.fromTo(
        memeRef.current,
        { x: 0, rotation: 0 },
        {
          x: -14,
          rotation: -3,
          duration: 0.9,
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1,
        },
      );
    } else {
      // gentle celebratory bob
      idleTween.current = gsap.to(memeRef.current, {
        y: -10,
        duration: 1.1,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }
  };

  const enterMeme = (id: ForkModeId) => {
    const el = memeRef.current;
    if (!el) return;
    if (reduced) {
      gsap.set(el, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0 });
      return;
    }
    idleTween.current?.kill();
    if (id === "stalk") {
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.86, x: 46, rotation: 6 },
        { opacity: 1, scale: 1, x: 0, rotation: 0, duration: 0.5, ease: "power3.out", onComplete: () => startIdle(id) },
      );
    } else if (id === "steal") {
      // slides / rises in, peeking from the lower edge
      gsap.fromTo(
        el,
        { opacity: 0, y: 120, x: 30, rotation: 8 },
        { opacity: 1, y: 0, x: 0, rotation: 0, duration: 0.6, ease: "back.out(1.5)", onComplete: () => startIdle(id) },
      );
      // a fragment of the page gets yanked toward the thief
      if (dragRef.current) {
        gsap.fromTo(
          dragRef.current,
          { opacity: 0, x: -160, y: 20, rotation: -8 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.7,
            ease: "power2.in",
            onComplete: () => {
              gsap.to(dragRef.current, { opacity: 0, scale: 0.6, duration: 0.3, delay: 0.15 });
            },
          },
        );
      }
    } else {
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.4, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(2)", onComplete: () => startIdle(id) },
      );
    }
  };

  const exitMeme = (onDone: () => void) => {
    const el = memeRef.current;
    idleTween.current?.kill();
    if (!el || reduced) {
      onDone();
      return;
    }
    gsap.to(el, {
      opacity: 0,
      scale: 0.9,
      y: 24,
      duration: 0.28,
      ease: "power2.in",
      onComplete: onDone,
    });
  };

  const runMode = (id: ForkModeId) => {
    const mode = forkConfig[id];
    setActive(id);
    setPendingId(id);
    setMessage("");

    // reveal on the next frame so the <img> for this mode is mounted
    requestAnimationFrame(() => enterMeme(id));

    after(360, () => setMessage(mode.message));

    if (id === "learn") {
      const rect = stageRef.current?.getBoundingClientRect();
      const ox = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const oy = rect ? rect.top + rect.height * 0.4 : window.innerHeight / 3;
      after(300, () => launchConfetti({ x: ox, y: oy, count: 110, power: 1.15, durationMs: 2200 }));
    }

    // settle the button label back, then a small farewell burst + redirect
    after(REVEAL_TO_REDIRECT - 500, () => setPendingId(null));
    after(REVEAL_TO_REDIRECT, () => {
      if (id === "learn") launchConfetti({ count: 45, power: 0.9, durationMs: 1400 });
      window.location.href = mode.url;
    });
  };

  const handleClick = (id: ForkModeId) => {
    clearTimers();
    setPendingId(id);
    if (active) {
      // a meme is already up — smoothly swap it (eyes are already gone)
      if (active !== id) exitMeme(() => runMode(id));
      else runMode(id);
      return;
    }
    if (reduced) {
      runMode(id);
      return;
    }
    // idle eyes are showing: let them react + exit, then reveal the meme
    exitIdRef.current = id;
    setExitTo(id);
  };

  const handleEyesExited = () => {
    const id = exitIdRef.current;
    setExitTo(null);
    if (id) runMode(id);
  };

  const focusButton = (id: ForkModeId, el: HTMLButtonElement) => {
    const r = el.getBoundingClientRect();
    setHovered(id);
    setFocus({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };
  const blurButton = () => {
    setHovered(null);
    setFocus(null);
  };

  const activeMode = active ? forkConfig[active] : null;

  return (
    <section className="pitch section-pad" id="pitch">
      <div className="section-label">01 / THE PITCH</div>
      <div className="pitch-grid">
        <div className="pitch-main">
          <h2 className="pitch-headline">
            I automate boring things.
            <span className="pitch-sometimes">(Sometimes.)</span>
          </h2>

          <div
            className="pitch-buttons"
            role="group"
            aria-label="Three ways to get to know me"
          >
            {FORK_ORDER.map((id) => {
              const mode = forkConfig[id];
              const isPending = pendingId === id;
              return (
                <button
                  key={id}
                  type="button"
                  className={`pitch-btn${active === id ? " is-active" : ""}`}
                  aria-pressed={active === id}
                  onClick={() => handleClick(id)}
                  onMouseEnter={(e) => focusButton(id, e.currentTarget)}
                  onMouseLeave={blurButton}
                  onFocus={(e) => focusButton(id, e.currentTarget)}
                  onBlur={blurButton}
                >
                  <span className="pitch-btn-label">
                    {isPending ? mode.pending : mode.label}
                  </span>
                  <span className="pitch-btn-arrow" aria-hidden="true">
                    ↗
                  </span>
                </button>
              );
            })}
          </div>

          <p className="pitch-message" aria-live="polite">
            {message}
          </p>
        </div>

        <div className="pitch-stage" ref={stageRef} aria-hidden={active === null}>
          {active === null && (
            <Eyes
              focus={focus}
              reaction={hovered}
              exitTo={exitTo}
              onExited={handleEyesExited}
              reduced={reduced}
            />
          )}
          <span className="pitch-drag" ref={dragRef}>
            your idea
          </span>
          {activeMode && (
            <img
              key={active}
              ref={memeRef}
              className={`pitch-meme pitch-meme--${active}`}
              src={activeMode.image}
              alt={activeMode.alt}
              draggable={false}
            />
          )}
        </div>
      </div>
    </section>
  );
}
