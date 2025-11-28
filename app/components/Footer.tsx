'use client'

import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()
  
  // No mostrar el footer en rutas del dashboard
  if (pathname?.startsWith('/dashboard')) {
    return null
  }
  
  // Mostrar footer en admin (ya está incluido en el layout de admin)
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 mt-12">
      <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <p className="mb-2">
          <strong className="text-gray-800 dark:text-gray-200">Peque Diario</strong> no reemplaza la consulta con pediatras ni otros profesionales de la salud.
        </p>
        <p>© {new Date().getFullYear()} Peque Diario. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

