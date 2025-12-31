import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Creamos el cliente de Supabase (OJO: con await para Next.js 15)
  const supabase = await createClient();

  // 2. Verificamos si hay usuario
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // 3. Si hay error o no hay usuario, fuera de aquí
  if (error || !user) {
    redirect("/"); // O redirige a /login si tienes esa página
  }

  // 4. (Opcional) Aquí podrías verificar si el usuario es admin
  // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  // if (profile?.role !== 'admin') redirect('/');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Aquí podrías poner un Navbar exclusivo del admin si quisieras */}
      <main className="flex-1 p-6 bg-muted/20">
        {children}
      </main>
    </div>
  );
}
