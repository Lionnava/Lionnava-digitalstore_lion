'use server'

import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  // 1. Conectar a Supabase
  const supabase = await createClient();

  // 2. Obtener datos del formulario
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 3. Intentar iniciar sesión
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Si falla, recargamos la página (podríamos mandar un error, pero por ahora simple)
    return redirect("/login?error=Credenciales_incorrectas");
  }

  // 4. Si todo sale bien, vamos al admin
  return redirect("/admin");
}