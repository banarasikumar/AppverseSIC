import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl = "https://appverse.si";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "AppverseSI — Apps, Software & Product Engineering", template: "%s — AppverseSI" },
  description: "AppverseSI develops and publishes its own apps and partners with businesses to plan, design, and build digital products. Independent applications today, ambitious connected experiences over time.",
  applicationName: "AppverseSI",
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: siteUrl, siteName: "AppverseSI", title: "AppverseSI — Apps, Software & Product Engineering", description: "Independent applications and thoughtful digital products, built with businesses.", images: [{ url: "/opengraph-image.svg", alt: "AppverseSI — A New Universe of Software" }] },
  twitter: { card: "summary_large_image", title: "AppverseSI — Apps, Software & Product Engineering", description: "AppverseSI builds its own apps and partners with businesses to create digital products.", images: ["/opengraph-image.svg"] },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#080a0b", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
