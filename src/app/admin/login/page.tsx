import { login } from "./actions";
import { Shield } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        
        {/* Encabezado */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Acceso exclusivo para administradores
          </p>
        </div>

        {/* Formulario */}
        <form action={login} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                placeholder="admin@tienda.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Entrar al Sistema
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}