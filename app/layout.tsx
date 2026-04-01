import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { CacheInitializer } from "@/components/offline/CacheInitializer";
import { ConnectionStatus } from "@/components/ui/connection-status";
import { SpeedInsights } from "@vercel/speed-insights/next";

const defaultUrl = process.env.NEXT_VERCEL_URL
  ? `https://${process.env.NEXT_VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "RFinest Water Refilling Station",
  description: "Water Refilling Station Management System",
  openGraph: {
    title: "RFinest Water Refilling Station",
    description: "Water Refilling Station Management System",
    url: defaultUrl,
    siteName: "RFinest Water Refilling Station",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RFinest Water Refilling Station",
    description: "Water Refilling Station Management System",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <CacheInitializer />
          <ConnectionStatus />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
