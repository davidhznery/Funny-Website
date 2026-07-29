import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const siteUrl = "https://www.nerylab.com";
const title = "NERY | Building with AI";
const description =
  "Building AI automations, agents and useful systems. Sharing what works, documenting the process and making technology more practical.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "NERY",
  keywords: [
    "Artificial Intelligence",
    "AI Automation",
    "AI Agents",
    "AI Workflows",
    "Workflow Automation",
    "Intelligent Systems",
    "Productivity",
    "AI Builder",
    "Process Automation",
  ],
  authors: [{ name: "NERY", url: siteUrl }],
  creator: "NERY",
  publisher: "NERY",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "NERY",
    title,
    description,
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${siteUrl}/#nery`,
  name: "NERY",
  url: siteUrl,
  description,
  knowsAbout: [
    "Artificial Intelligence",
    "AI Automation",
    "AI Agents",
    "AI Workflows",
    "Workflow Automation",
    "Intelligent Systems",
    "Productivity",
    "Process Automation",
  ],
  sameAs: ["https://www.linkedin.com/in/david-hernandez-nery/"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
