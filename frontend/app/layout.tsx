import type { Metadata } from "next";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";
import Nav from "./components/Nav";
import RateTicker from "./components/RateTicker";
import ActionBar from "./components/ActionBar";
import SideRail from "./components/SideRail";
import { ToastProvider } from "./components/Toast";

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
        <ToastProvider>
          <Nav />
          <RateTicker />
          <ActionBar />
          <div className="flex flex-1 min-h-0">
            <SideRail />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
