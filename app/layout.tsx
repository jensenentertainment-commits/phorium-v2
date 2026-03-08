import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Navbar } from "./components/NavBar";
import { Footer } from "./components/Footer";

export const metadata: Metadata = {
  title: "Phorium",
  description: "Kontrollsystem for tekst før publisering.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body className={`${GeistSans.className} min-h-screen antialiased`}>
        <div className="min-h-screen bg-[var(--phorium-bg)] text-[var(--phorium-text)] flex flex-col">
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
