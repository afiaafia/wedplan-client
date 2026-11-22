import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MotionProvider from "@/components/motion-provider";
import ToastProvider from "@/components/layout/toast-provider";
import GoogleOAuthLockCleanup from "@/components/auth/google-oauth-lock-cleanup";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WedPlan | Your Wedding, Thoughtfully Planned",
    template: "%s | WedPlan",
  },
  description:
    "Discover trusted wedding professionals and plan every detail of your perfect celebration with WedPlan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen antialiased">
        <ToastProvider>
          <MotionProvider>
            <GoogleOAuthLockCleanup />
            <Navbar />
            {children}
            <Footer />
          </MotionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
