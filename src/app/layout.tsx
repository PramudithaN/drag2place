import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

// Next.js localFont loader for Oregon LDO by Luke Owens
const oregonLDO = localFont({
  src: [
    {
      path: "../../public/fonts/oregon-ldo/OregonLdo-d9q7.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/oregon-ldo/OregonLdoBold-gxe6.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-oregon",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Drag2Place — Aesthetic Spatial Workspace",
  description: "A Milanote-inspired spatial workspace for your tasks, events, ideas, and moodboards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable} ${oregonLDO.variable} h-full antialiased`}
    >
      <body className="h-full w-full overflow-hidden bg-[#FAF8F5] text-stone-800 font-sans">
        {children}
      </body>
    </html>
  );
}
