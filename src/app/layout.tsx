import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tienda Manager - Gestión de Tiendas de Barrio",
  description: "Sistema de gestión de inventario, ventas y compras para tiendas de barrio, abarrotes y minimercados",
  keywords: ["Tienda", "Inventario", "Ventas", "Compras", "Abarrotes", "Minimercado"],
  authors: [{ name: "Tienda Manager" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Tienda Manager",
    description: "Sistema de gestión para tiendas de barrio",
    url: "https://chat.z.ai",
    siteName: "Tienda Manager",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tienda Manager",
    description: "Sistema de gestión para tiendas de barrio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
