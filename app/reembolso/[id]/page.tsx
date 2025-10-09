'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import { Copy, Check } from 'lucide-react'
import Image from 'next/image'

export default function ReembolsoPage() {
  const params = useParams()
  const [reembolso, setReembolso] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    const cargarReembolso = async () => {
      try {
        const { data, error } = await supabase
          .from('reembolsos')
          .select('*')
          .eq('enlace_publico', params.id)
          .single()

        if (!error && data) {
          setReembolso(data)
        }
      } catch (error) {
        console.error('Error cargando reembolso:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      cargarReembolso()
    }
  }, [params.id])

  const copiarClabe = async () => {
    if (!reembolso?.clabe) return
    
    try {
      await navigator.clipboard.writeText(reembolso.clabe)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      alert('No se pudo copiar la CLABE automáticamente')
    }
  }

  const calcularDiasRestantes = () => {
    if (!reembolso) return 0

    const fechaCreacion = new Date(reembolso.created_at)
    const diasReembolso = reembolso.dias_reembolso || 6
    
    if (reembolso.fecha_reembolso) {
      const fechaLimite = new Date(reembolso.fecha_reembolso)
      const diferencia = fechaLimite.getTime() - Date.now()
      return Math.max(0, Math.ceil(diferencia / (1000 * 60 * 60 * 24)))
    }
    
    const fechaLimite = new Date(fechaCreacion)
    fechaLimite.setDate(fechaLimite.getDate() + diasReembolso)
    
    const diferencia = fechaLimite.getTime() - Date.now()
    return Math.max(0, Math.ceil(diferencia / (1000 * 60 * 60 * 24)))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#7A3EF8] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p>Cargando información...</p>
        </div>
      </div>
    )
  }

  if (!reembolso) {
    return (
      <div className="min-h-screen bg-[#7A3EF8] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">Reembolso no encontrado</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-white text-[#7A3EF8] px-4 py-2 rounded-lg font-semibold"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  const diasRestantes = calcularDiasRestantes()

  return (
    <div className="min-h-screen bg-[#7A3EF8] flex flex-col">
      {/* Header fijo */}
      <div className="sticky top-0 z-10 bg-[#7A3EF8] p-4 border-b border-purple-500">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="text-white text-lg font-medium p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            ←
          </button>
          <h1 className="text-xl font-semibold text-white">Pagar</h1>
          <div className="w-8" /> {/* Espacio para balance */}
        </div>
      </div>

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto p-4 space-y-4">
          {/* Advertencia */}
          <div className="bg-red-100 text-red-700 text-xs p-3 rounded-lg text-center border border-red-200">
            ⚠️ Por favor, confirme que sea el método de pago oficial y no transfiera a una cuenta privada.
          </div>

          {/* Tarjeta de reembolso */}
          <div className="bg-white rounded-2xl shadow-lg p-6 text-gray-800">
            {/* Logo y información de la empresa - CORREGIDO */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 mb-4 flex items-center justify-center bg-white rounded-lg p-2 border border-gray-200">
                <Image
                  src={reembolso.logo_empresa || "/logo.png"}
                  alt={reembolso.empresa}
                  width={64}
                  height={64}
                  className="object-contain w-full h-full"
                  onError={(e) => {
                    e.currentTarget.src = "/logo.png"
                  }}
                />
              </div>
              <h2 className="font-semibold text-lg text-center mb-1">{reembolso.empresa}</h2>
              <p className="text-gray-500 text-sm text-center">Cantidad pendiente de pagar</p>
              <p className="text-4xl font-bold text-purple-700 mt-2">
                ${new Intl.NumberFormat('es-MX').format(reembolso.monto)}
              </p>
            </div>

            {/* Detalles del reembolso */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Periodo</span>
                  <span className="font-medium text-gray-800">
                    {reembolso.periodo_actual}/{reembolso.total_periodos}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Importe normal</span>
                  <span className="font-medium text-gray-800">
                    ${new Intl.NumberFormat('es-MX').format(reembolso.monto)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cantidad reembolsada</span>
                  <span className="font-medium text-gray-800">
                    ${new Intl.NumberFormat('es-MX').format(reembolso.monto_reembolsado || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fecha de creación</span>
                  <span className="font-medium text-gray-800">
                    {new Date(reembolso.created_at).toLocaleDateString('es-MX')}
                  </span>
                </div>
                
                {reembolso.fecha_reembolso && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fecha límite</span>
                    <span className="font-medium text-gray-800">
                      {new Date(reembolso.fecha_reembolso).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Días faltantes</span>
                  <span className={`font-medium ${diasRestantes <= 3 ? 'text-red-600' : 'text-gray-800'}`}>
                    {diasRestantes} días
                  </span>
                </div>
              </div>

              {/* Sección CLABE */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cuenta CLABE</p>
                    <p className="text-sm font-mono font-medium">
                      {reembolso.clabe}
                    </p>
                  </div>
                  <button
                    onClick={copiarClabe}
                    className={`p-2 rounded-lg transition-colors ${
                      copiado 
                        ? "bg-green-500 text-white" 
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                {copiado && (
                  <p className="text-green-600 text-xs mt-2 text-center">
                    ✅ CLABE copiada al portapapeles
                  </p>
                )}
              </div>

              {/* Botón de pago */}
              <button
                onClick={copiarClabe}
                className="w-full bg-[#7A3EF8] hover:bg-[#6a32e6] text-white font-semibold py-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-lg"
              >
                {copiado ? <Check className="h-5 w-5" /> : null}
                {copiado ? "CLABE Copiada" : "Pagar"}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Al hacer clic en "Pagar", la CLABE se copiará automáticamente
              </p>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="text-center text-white/80 text-xs pb-4">
            <p>Si tiene problemas con el pago, contacte a {reembolso.empresa}</p>
            
          </div>
        </div>
      </div>
    </div>
  )
}
