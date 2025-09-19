import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-6">Sistema de Reembolsos</h1>
        <p className="text-gray-600 mb-8">Bienvenido al sistema de gestión de reembolsos personalizados.</p>
                <p className="text-gray-800">Solo Admin</p>

        <div className="space-y-4">
          <Link
            href="/admin/dashboard"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Acceder al Panel de Administrador :)
          </Link>
         
        </div>
      </div>
    </div>
  )
}
