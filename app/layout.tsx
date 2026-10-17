import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl = "https://appverse.si";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "AppverseSI — Apps, Software & Product Engineering", template: "%s — AppverseSI" },
  description: "AppverseSI creates independent apps and digital products, with selected business projects for websites, apps, and custom software."
  applicationName: "AppverseSI",
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: siteUrl, siteName: "AppverseSI", title: "AppverseSI — Apps, Software & Product Engineering", description: "Apps for today. A bigger vision for tomorrow. Discover AppverseSI and request a website, app, or custom software project.", images: [{ url: "/opengraph-image.svg", alt: "AppverseSI — Tomorrow, made real." }] },
  twitter: { card: "summary_large_image", title: "AppverseSI — Apps, Software & Product Engineering", description: "AppverseSI creates independent apps and accepts selected website, app, and custom software projects.", images: ["/opengraph-image.svg"] },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#080a0b", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
