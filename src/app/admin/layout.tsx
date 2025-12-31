import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation"; <--- Comentado para probar
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

  // HE COMENTADO ESTO PARA QUE PUEDAS ENTRAR A VER EL DISEÑO
  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-6 bg-muted/20">
        {children}
      </main>
    </div>
  );
}
//comentado///
