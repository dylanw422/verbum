import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define your base URL once (replace with your actual production domain)
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  ? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl), // Critical for images to work!
  title: {
    default: "VERBUM",
    template: "%s | VERBUM",
  },
  description: "Scripture Engine // Rapid Serial Visual Presentation Protocol",

  // Facebook / Discord / LinkedIn
  openGraph: {
    title: "VERBUM",
    description: "Scripture Engine // System Ready",
    url: baseUrl,
    siteName: "VERBUM",
    locale: "en_US",
    type: "website",
  },

  // Twitter (X)
  twitter: {
    card: "summary_large_image", // This makes the image big
    title: "VERBUM",
    description: "Scripture Engine",
    creator: "@dylanw422", // Optional: your handle
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950`}>
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-svh">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
