"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const measurementId =
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "G-018PKKRW0C";
const consentKey = "nerylab_analytics_consent";
const consentEvent = "nerylab-consent-change";

type ConsentChoice = "accepted" | "rejected" | null;

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

function readConsent(): ConsentChoice {
  const storedChoice = window.localStorage.getItem(consentKey);
  return storedChoice === "accepted" || storedChoice === "rejected"
    ? storedChoice
    : null;
}

function subscribeToConsent(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(consentEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(consentEvent, callback);
  };
}

function getGoogleTag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  return window.gtag;
}

function enableAnalytics() {
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;

  (window as unknown as Record<string, boolean>)[
    `ga-disable-${measurementId}`
  ] = false;

  const gtag = getGoogleTag();
  gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  gtag("config", measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
}

function removeAnalyticsCookies() {
  const hostname = window.location.hostname;
  for (const rawCookie of document.cookie.split(";")) {
    const name = rawCookie.split("=")[0]?.trim();
    if (name !== "_ga" && !name?.startsWith("_ga_")) continue;
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=${hostname}; SameSite=Lax`;
    if (hostname.split(".").length > 2) {
      const rootDomain = hostname.split(".").slice(-2).join(".");
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${rootDomain}; SameSite=Lax`;
    }
  }
}

function disableAnalytics() {
  window.gtag?.("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  (window as unknown as Record<string, boolean>)[
    `ga-disable-${measurementId}`
  ] = true;
  removeAnalyticsCookies();
}

export default function CookieConsent() {
  const storedChoice = useSyncExternalStore(
    subscribeToConsent,
    readConsent,
    () => null,
  );
  const [editing, setEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (storedChoice === "accepted") enableAnalytics();
    else if (storedChoice === "rejected") disableAnalytics();
  }, [storedChoice]);

  const saveChoice = (nextChoice: Exclude<ConsentChoice, null>) => {
    window.localStorage.setItem(consentKey, nextChoice);
    window.dispatchEvent(new Event(consentEvent));
    setEditing(false);
    setShowDetails(false);
  };

  if (storedChoice && !editing) {
    return (
      <button
        className="cookie-settings"
        type="button"
        onClick={() => setEditing(true)}
        aria-label="Change cookie preferences"
      >
        Cookies
      </button>
    );
  }

  return (
    <section
      className="cookie-consent"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-description"
    >
      <div className="cookie-copy">
        <div className="cookie-label">
          <span className="cookie-dot" aria-hidden="true" />
          Analytics / optional
        </div>
        <h2 id="cookie-title">A tiny privacy decision.</h2>
        <p id="cookie-description">
          I&apos;d like to use Google Analytics to learn what people actually
          find useful here. No analytics data is collected unless you say yes.
        </p>
        <button
          className="cookie-details-toggle"
          type="button"
          aria-expanded={showDetails}
          onClick={() => setShowDetails((visible) => !visible)}
        >
          {showDetails ? "Hide the less exciting details" : "What does this mean?"}
        </button>
        {showDetails && (
          <div className="cookie-details">
            <p>
              If accepted, Google Analytics stores analytics cookies and
              receives information about page visits and interactions. Ads,
              advertising data and ad personalization stay disabled. You can
              change or withdraw your choice at any time using the Cookies
              button.
            </p>
            <a href="/privacy">
              Privacy &amp; cookie policy <span aria-hidden="true">↗</span>
            </a>
          </div>
        )}
      </div>
      <div className="cookie-actions">
        <button className="cookie-reject" type="button" onClick={() => saveChoice("rejected")}>
          Reject
        </button>
        <button className="cookie-accept" type="button" onClick={() => saveChoice("accepted")}>
          Accept analytics <span aria-hidden="true">↗</span>
        </button>
      </div>
    </section>
  );
}
