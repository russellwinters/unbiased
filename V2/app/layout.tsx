import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Unbiased V2 - Multi-Perspective News",
  description: "A modern news aggregator providing multi-perspective coverage with bias analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
