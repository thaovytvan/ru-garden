import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"]
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Rú Garden | Không gian xanh cho ngôi nhà của bạn",
  description:
    "Cửa hàng cây cảnh cao cấp, mang đến không gian tươi mát và sinh khí cho văn phòng và ngôi nhà của bạn. Rú Garden - Nơi cảm xúc ươm mầm."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <Theme appearance="light" accentColor="grass" radius="medium">
          <AuthProvider>
            <CartProvider>
              <Toaster position="bottom-right" />
              <Suspense fallback={null}>
                <Navbar />
              </Suspense>
              <main className="min-h-screen">{children}</main>
              <Footer />
              <ChatWidget />
            </CartProvider>
          </AuthProvider>
        </Theme>
      </body>
    </html>
  );
}
