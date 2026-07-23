"use client";

import { useEffect, useState } from "react";

const jokes = [
  "That was unnecessary.",
  "You have excellent instincts.",
  "The button feels seen.",
  "Adding this to the case study.",
];

export default function Home() {
  const [clicks, setClicks] = useState(0);
  const [joke, setJoke] = useState("Ask me about the button.");
  const [loading, setLoading] = useState(87);
  const [toast, setToast] = useState(false);
  const [ctaOffset, setCtaOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLoading((value) => (value >= 99 ? 87 : value + 1));
    }, 1300);
    return () => window.clearInterval(timer);
  }, []);

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
        <a className="logo" href="#top" aria-label="Nery home">NERY<span>®</span></a>
        <div className="nav-right"><span className="status-dot" /> Currently avoiding a meeting</div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-kicker"><span>Independent human</span><span>•</span><span>Malta / everywhere</span></div>
        <h1>Hi.<br /><em>I&apos;m</em> NERY<span className="period">.</span></h1>
        <div className="hero-bottom">
          <p className="hero-note">I build useful things<br />with suspicious confidence.</p>
          <a
            className="hero-cta"
            href="#hire"
            style={{ transform: `translate(${ctaOffset.x}px, ${ctaOffset.y}px)` }}
            onMouseMove={moveCta}
            onMouseLeave={() => setCtaOffset({ x: 0, y: 0 })}
          >
            <span>Hire me</span><span className="arrow">↗</span>
          </a>
        </div>
        <div className="scroll-cue"><span>Scroll for evidence</span><span className="line" /></div>
      </section>

      <section className="manifesto section-pad">
        <div className="section-label">01 / THE PITCH</div>
        <div className="manifesto-copy">
          <p className="big-copy">I automate boring things<span>.</span><br />I occasionally touch grass<span>.</span></p>
          <div className="manifesto-aside"><span className="scribble">✳</span><p>Professional button clicker.<br />AI whisperer.<br />Engineering survivor.</p></div>
        </div>
      </section>

      <section className="playground section-pad" id="play">
        <div className="section-label">02 / A COMPLETELY NECESSARY DEMO</div>
        <div className="playground-grid">
          <div className="playground-intro">
            <h2>Things I made<br /><span>move.</span></h2>
            <p>Because a static object is just an object that hasn&apos;t met me yet.</p>
          </div>
          <div className="toy-card">
            <div className="toy-top"><span>UNNECESSARY LAB™</span><span>● LIVE</span></div>
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="duck" draggable="true">
              <span>◡</span><i>◆</i>
            </div>
            <div className="toy-caption"><span>DRAG THE DUCK</span><span>↘</span></div>
          </div>
          <div className="click-card">
            <div><span className="tiny-label">A BUTTON</span><span className="tiny-label">DO NOT</span></div>
            <button className="dont-button" onClick={triggerConfetti} aria-label="Do not click this button">Don&apos;t click <b>↗</b></button>
            <p>{joke}</p>
            {toast && <div className="confetti" aria-hidden="true">✦　·　✳　⋆　✦</div>}
          </div>
        </div>
      </section>

      <section className="proof section-pad">
        <div className="section-label">03 / PEER REVIEW</div>
        <div className="proof-grid">
          <blockquote>“Annoyingly good at making the complicated feel obvious.”<cite>— someone with a calendar</cite></blockquote>
          <div className="metrics">
            <div className="metric"><strong>{(1428 + clicks * 3).toLocaleString()}</strong><span>meetings avoided<br />thanks to AI</span></div>
            <div className="metric"><strong>{loading}%</strong><span>loading confidence<br /><small>{loading === 99 ? "Good enough." : "Almost a thought."}</small></span></div>
          </div>
        </div>
      </section>

      <section className="hire section-pad" id="hire">
        <div className="hire-eyebrow">04 / THE END, PROBABLY</div>
        <h2>Let&apos;s make<br /><em>something</em> weird<span>.</span></h2>
        <p className="hire-sub">Or normal. I&apos;m flexible like that.</p>
        <div className="contact-row">
          <a className="contact-link" href="tel:+35679510315">+356 7951 0315 <span>↗</span></a>
          <a className="contact-link" href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a>
        </div>
        <div className="footer-row"><span>NERY® 2025 — made with unreasonable attention to detail</span><span>↖ back to top</span></div>
      </section>
    </main>
  );
}
