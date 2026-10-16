import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl = "https://appverse.si";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "AppverseSI — A New Universe of Software", template: "%s — AppverseSI" },
  description: "Appverse Superintelligence is building a new universe of intelligent software and digital experiences. Understand the universe. Build toward superintelligence.",
  applicationName: "AppverseSI",
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: siteUrl, siteName: "AppverseSI", title: "AppverseSI — A New Universe of Software", description: "Understand the universe. Build toward superintelligence. The next generation of software is taking shape.", images: [{ url: "/opengraph-image.svg", alt: "AppverseSI — A New Universe of Software" }] },
  twitter: { card: "summary_large_image", title: "AppverseSI — A New Universe of Software", description: "Understand the universe. Build toward superintelligence.", images: ["/opengraph-image.svg"] },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#080a0b", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
