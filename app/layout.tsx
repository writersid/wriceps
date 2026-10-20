import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { themeScript } from "./theme";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Makes the link preview image's address absolute; crawlers need that.
  metadataBase: new URL("https://www.wriceps.com"),
  title: "Wriceps | Short Writing Exercises for Daily Practice",
  description:
    "Free writing exercises in short sets: write under word rules, fill in the blanks, or make a blackout poem. Each set is scored, with tips as you write.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The head script sets data-theme before React loads, so React must not treat it as a mismatch.
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
