import type { Metadata, Viewport } from "next";
import { Onest, Unbounded } from "next/font/google";
import "./globals.css";

const display = Unbounded({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const body = Onest({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dossiq",
  description: "Ask questions about your company documents and see where each answer comes from.",
};

export const viewport: Viewport = {
  themeColor: "#0e0b1f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="h-full">
        <div className="aurora" aria-hidden />
        <div className="relative z-10 h-full">{children}</div>
      </body>
    </html>
  );
}
