import type { Metadata } from "next";
import { Outfit, Noto_Serif_SC, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const notoSerif = Noto_Serif_SC({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "lzsobig · AI × 建造 在代码与工程之间",
  description:
    "lzsobig 的个人博客 — 聚焦 AI × 智能建造 × 能源工程的写作空间。计算机视觉、BIM、数字孪生、强化学习、结构健康监测的实践与思考。",
  keywords: [
    "AI",
    "智能建造",
    "能源工程",
    "BIM",
    "数字孪生",
    "计算机视觉",
    "强化学习",
    "工程",
    "lzsobig",
  ],
  authors: [{ name: "lzsobig" }],
  openGraph: {
    title: "lzsobig · AI × 建造",
    description:
      "聚焦 AI × 智能建造 × 能源工程的个人写作空间。",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "lzsobig · AI × 建造",
    description: "聚焦 AI × 智能建造 × 能源工程的个人写作空间。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-theme="dark" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%238b5cf6'/%3E%3Cstop offset='1' stop-color='%23ec4899'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' rx='24' fill='url(%23g)'/%3E%3Ctext x='50' y='72' font-family='Outfit,sans-serif' font-size='52' font-weight='900' fill='white' text-anchor='middle'%3Elz%3C/text%3E%3C/svg%3E"
        />
      </head>
      <body
        className={`${outfit.variable} ${notoSerif.variable} ${jetbrains.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
