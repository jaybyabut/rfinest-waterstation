import type { Metadata, Viewport } from "next"; // Make sure imported ang Viewport
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { CacheInitializer } from "@/components/offline/CacheInitializer";
import { ConnectionStatus } from "@/components/ui/connection-status";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NotificationSystem } from "@/components/NotificationSystem";
import { GlobalRestrictions } from "@/components/GlobalRestrictions"; 

const defaultUrl = process.env.NEXT_VERCEL_URL
  ? `https://${process.env.NEXT_VERCEL_URL}`
  : "http://localhost:3000";

// ITO ANG PIPIGIL SA ZOOMING
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
};

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "RFinest Water Refilling Station",
  // ... (keep your existing metadata)
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
      {/* DINAGDAG ANG 'select-none' DITO PARA WALANG MA-HIGHLIGHT NA TEXT */}
      <body className={`${geistSans.className} antialiased select-none`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* DINAGDAG ANG SMART RESTRICTIONS */}
          <GlobalRestrictions /> 
          
          {children}
          <CacheInitializer />
          <ConnectionStatus />
          <NotificationSystem />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
