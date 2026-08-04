import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SubscribeModal } from "@/components/SubscribeModal";
import { siteConfig } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://michaelmay.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} · ${siteConfig.role}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.bio,
  alternates: {
    types: { "application/rss+xml": `${siteUrl}/rss.xml` },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: siteConfig.name,
    title: `${siteConfig.name} · ${siteConfig.role}`,
    description: siteConfig.bio,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} · ${siteConfig.role}`,
    description: siteConfig.bio,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <SubscribeModal />
      </body>
    </html>
  );
}
