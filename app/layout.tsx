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
  title: "Wriceps",
  description: "Build your writing muscles with short, scored writing exercises.",
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
