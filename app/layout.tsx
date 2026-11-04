import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const display = localFont({
  src: "../public/fonts/space-grotesk.ttf",
  variable: "--font-space-grotesk",
  display: "swap",
});
export const metadata: Metadata = {
  title: {
    default: "SPHEREx Blink — Watch the universe move",
    template: "%s · SPHEREx Blink",
  },
  description:
    "Explore NASA SPHEREx infrared observations. Blink through time, discover moving stars, and watch the sky change.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} dark scroll-smooth antialiased motion-reduce:scroll-auto`}
    >
      <body className="flex min-h-screen flex-col bg-[#08080e] font-sans text-[#eee7f0] selection:bg-[#aa87c8] selection:text-black">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
