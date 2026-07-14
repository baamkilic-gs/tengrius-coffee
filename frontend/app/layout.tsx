import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/Nav";
import RateTicker from "./components/RateTicker";

export const metadata: Metadata = {
  title: "Tengrius | Çiğ Kahve Borsası",
  description: "Çiğ kahve alım-satım borsası",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="antialiased">
      <body className="min-h-dvh flex flex-col">
        <Nav />
        <RateTicker />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
