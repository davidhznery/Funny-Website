"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "joined" | "error";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "submitting") return;

    setStatus("submitting");
    setError("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      setStatus("joined");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <form className="signup" onSubmit={submit}>
      <label className="signup-label" htmlFor="signup-email">
        Occasionally useful emails.
      </label>
      {status === "joined" ? (
        <p className="signup-done">On the list. No spam, occasional chaos.</p>
      ) : (
        <>
          <div className="signup-row">
            <input
              id="signup-email"
              type="email"
              className="signup-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "submitting"}
              required
            />
            <button
              type="submit"
              className="signup-btn"
              aria-label="Join"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "…" : "→"}
            </button>
          </div>
          {status === "error" && <p className="signup-error">{error}</p>}
        </>
      )}
    </form>
  );
}
