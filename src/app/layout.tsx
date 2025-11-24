import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MERRILY - Cafe Management System",
  description: "学生が運営するカフェ管理システム",
  icons: {
    icon: [
      { url: "/MERRILY_Simbol.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  ); 
}
