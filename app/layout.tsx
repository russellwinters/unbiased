import type { Metadata } from "next";
import "./globals.scss";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Unbiased | News",
  description: "A modern news aggregator providing multi-perspective coverage with bias analysis",
  keywords: ["news", "politics", "bias analysis", "news aggregator"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
