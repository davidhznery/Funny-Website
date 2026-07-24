"use client";

import { useState } from "react";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setJoined(true); // placeholder only — no backend yet
  };

  return (
    <form className="signup" onSubmit={submit}>
      <label className="signup-label" htmlFor="signup-email">
        Occasionally useful emails.
      </label>
      {joined ? (
        <p className="signup-done">On the list. (Imaginary list — no backend yet.)</p>
      ) : (
        <div className="signup-row">
          <input
            id="signup-email"
            type="email"
            className="signup-input"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="signup-btn" aria-label="Join">
            →
          </button>
        </div>
      )}
    </form>
  );
}
