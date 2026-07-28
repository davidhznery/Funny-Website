"use client";

import { useState } from "react";

import ForkPitchSection from "./pitch/ForkPitchSection";
import EvasiveExit from "./end/EvasiveExit";
import EmailCapture from "./end/EmailCapture";
import IdeaLab from "./lab/IdeaLab";

const jokes = [
  "That was unnecessary.",
  "You have excellent instincts.",
  "For real?",
  "Adding this to the case study.",
];

export default function Home() {
  const [clicks, setClicks] = useState(0);
  const [joke, setJoke] = useState("Ask me about the button.");
  const [toast, setToast] = useState(false);
  const [ctaOffset, setCtaOffset] = useState({ x: 0, y: 0 });

  const moveCta = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCtaOffset({ x: (event.clientX - (rect.left + rect.width / 2)) * 0.24, y: (event.clientY - (rect.top + rect.height / 2)) * 0.24 });
  };

  const triggerConfetti = () => {
    setClicks((value) => value + 1);
    setJoke(jokes[clicks % jokes.length]);
    setToast(true);
    window.setTimeout(() => setToast(false), 1700);
  };

  return (
    <main className="site-shell">
      <div className="grain" aria-hidden="true" />
      <nav className="topbar">
        <a className="logo" href="#top" aria-label="Nery home">Nery<span>●</span></a>
        <div className="nav-right"><span className="status-dot" /> Currently avoiding a meeting</div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-kicker"><span>Independent human</span><span>•</span><span>Malta / everywhere</span></div>
        <h1>Hi.<br /><em>I&apos;m</em> Nery<span className="period">.</span></h1>
        <div className="hero-bottom">
          <p className="hero-note">I build useful things<br />with suspicious confidence.</p>
          <a
            className="hero-cta"
            href="https://wa.me/35679510315"
            target="_blank"
            rel="noreferrer"
            style={{ transform: `translate(${ctaOffset.x}px, ${ctaOffset.y}px)` }}
            onMouseMove={moveCta}
            onMouseLeave={() => setCtaOffset({ x: 0, y: 0 })}
          >
            <span>Hire me</span><span className="arrow">↗</span>
          </a>
        </div>
        <div className="scroll-cue"><span>Scroll for evidence</span><span className="line" /></div>
      </section>

      <ForkPitchSection />

      <section className="playground section-pad" id="play">
        <div className="section-label">02 / A COMPLETELY NECESSARY DEMO</div>
        <div className="playground-grid">
          <div className="playground-intro">
            <h2>Things I made<br /><span>move.</span></h2>
            <p><em>(for no reason.)</em></p>
          </div>
          <div className="toy-card">
            <IdeaLab />
          </div>
          <div className="click-card">
            <div><span className="tiny-label">A BUTTON</span><span className="tiny-label">DO NOT</span></div>
            <button className="dont-button" onClick={triggerConfetti} aria-label="Do not click this button">Don&apos;t click <b>↗</b></button>
            <p>{joke}</p>
            {toast && <div className="confetti" aria-hidden="true">✦　·　✳　⋆　✦</div>}
          </div>
        </div>
      </section>

      <section className="hire section-pad" id="hire">
        <div className="hire-eyebrow">04 / THE END, PROBABLY</div>
        <h2>Let&apos;s make<br /><em>something</em> weird<span>.</span></h2>
        <p className="hire-sub">Or normal. I&apos;m flexible like that.</p>
        <div className="contact-row">
          <a className="contact-link" href="tel:+35679510315">+356 7951 0315 <span>↗</span></a>
          <a className="contact-link" href="https://www.linkedin.com/in/david-hernandez-nery/" target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a>
          <a className="contact-link" href="mailto:david@nerylab.com">david@nerylab.com <span>↗</span></a>
        </div>
        <EmailCapture />
        <div className="footer-row"><span>Nery● 2025 — made with unreasonable attention to detail</span></div>
        <EvasiveExit exitUrl="https://www.google.com" />
      </section>
    </main>
  );
}
