import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rocky Rehab - C4/C5 Nerve Injury Rehabilitation Assistant",
  description: "A personalized rehabilitation tracking app for C4/C5 nerve injuries, helping patients monitor progress, follow exercise plans, and access recovery resources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-muted/40`}
      >
        <div className="mx-auto max-w-7xl h-full flex flex-col">
          <main className="p-4 lg:p-6 flex-1 w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
