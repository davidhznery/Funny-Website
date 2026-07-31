import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy & Cookies | NERY",
  description: "How NERY handles newsletter information, analytics and cookies.",
  robots: {
    index: false,
    follow: false,
  },
};

const updatedAt = "31 July 2026";

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <header className="privacy-topbar">
        <Link href="/" className="privacy-logo" aria-label="Back to Nery home">
          Nery<span>●</span>
        </Link>
        <Link href="/" className="privacy-back">
          ← Back to the site
        </Link>
      </header>

      <article className="privacy-content">
        <p className="privacy-kicker">The boring-but-important bit / {updatedAt}</p>
        <h1>Privacy &amp;<br /><em>cookies.</em></h1>
        <p className="privacy-intro">
          This page explains what information NERY collects, why it is used and
          how you stay in control.
        </p>

        <section>
          <h2>What I collect</h2>
          <p>
            If you join the newsletter, I collect the email address you submit.
            I also use optional Google Analytics to understand page visits and
            interactions—but only after you choose to accept analytics cookies.
          </p>
        </section>

        <section>
          <h2>Why I use it</h2>
          <p>
            Newsletter details are used to send the emails you signed up for.
            Analytics helps me understand which parts of the site are useful so
            I can improve them. Analytics is not used for advertising or
            personalised ads.
          </p>
        </section>

        <section>
          <h2>Cookies and your choice</h2>
          <p>
            Essential settings remember your cookie preference. Optional
            analytics cookies are set only after you choose “Accept analytics”.
            You can refuse them without losing access to the site, and you can
            change or withdraw your choice at any time using the Cookies button
            in the bottom-right corner.
          </p>
        </section>

        <section>
          <h2>Services involved</h2>
          <p>
            Newsletter subscriptions are processed through Sender.net. Analytics
            is provided by Google Analytics 4 (Measurement ID G-018PKKRW0C).
            Their privacy information is available at{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
              Google Privacy Policy
            </a>.
          </p>
        </section>

        <section>
          <h2>How long it stays</h2>
          <p>
            Newsletter information is kept while you remain subscribed or until
            you ask for it to be removed. Your cookie choice remains on your
            device until you change it or clear your browser storage. Analytics
            retention is managed within the Google Analytics property.
          </p>
        </section>

        <section>
          <h2>Your control</h2>
          <p>
            You can unsubscribe from newsletter emails at any time. To ask about
            your personal information, request access or deletion, contact{" "}
            <a href="mailto:david@nerylab.com">david@nerylab.com</a>.
          </p>
        </section>
      </article>
    </main>
  );
}
