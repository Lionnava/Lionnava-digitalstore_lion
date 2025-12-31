import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Tienda Manager - Gestión de Tiendas de Barrio",
  description: "Sistema de gestión de inventario, ventas y compras para tiendas de barrio, abarrotes y minimercados",
  keywords: ["Tienda", "Inventario", "Ventas", "Compras", "Abarrotes", "Minimercado"],
  authors: [{ name: "Tienda Manager" }],
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
    description: “Sistema de gestión para tiendas de barrio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
