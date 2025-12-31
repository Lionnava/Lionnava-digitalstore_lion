import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation"; // <--- Asegúrate de importar esto
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // SI NO HAY USUARIO, REDIRIGIMOS AL LOGIN
  if (!user) {
    redirect("/login"); // <--- Ahora redirigimos a /login en vez de a /
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-6 bg-muted/20">
        {children}
      </main>
    </div>
  );
}