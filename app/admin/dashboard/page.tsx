'use client'
import { useState, useEffect } from "react"
import { Copy, Check, Plus } from "lucide-react"
import { GeistMono } from "geist/font/mono"
import { supabase } from "@/lib/supabase"

type Reembolso = {
  id: string
  monto: number
  clabe: string
  empresa: string
  telefono?: string | null
  estado: 'pendiente' | 'completado' | 'rechazado'
  enlace_publico: string
  convenienceText?: string
  created_at: string
}

export default function PanelAdmin() {
  const [formData, setFormData] = useState({
    clabe: "",
    monto: "",
    telefono: "",
    empresa: "",
    convenienceText:"",
  })

  const [enlaceGenerado, setEnlaceGenerado] = useState("")
  const [reembolsos, setReembolsos] = useState<Reembolso[]>([])
  const [copiado, setCopiado] = useState(false)
  const [filaCopiadaId, setFilaCopiadaId] = useState("")
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const pageSize = 10

  useEffect(() => {
    cargarReembolsos()
  }, [pagina])

  const cargarReembolsos = async () => {
    const { data, count, error } = await supabase
      .from('reembolsos')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((pagina - 1) * pageSize, pagina * pageSize - 1)

    if (!error && data) {
      setReembolsos(data)
      setTotalPaginas(Math.ceil((count || 0) / pageSize))
    }
  }

  const validarFormulario = () => {
    const { clabe, monto, empresa } = formData
    if (!empresa.trim()) {
      alert("El nombre de la empresa es requerido.")
      return false
    }
    if (!/^\d{18}$/.test(clabe)) {
      alert("La CLABE debe tener 18 dígitos numéricos.")
      return false
    }
    if (!/^(\d+)(\.\d{1,2})?$/.test(monto.replace(/,/g,''))) {
      alert("El monto debe ser un número válido (ej. 1234.56).")
      return false
    }
    return true
  }

  const generarEnlace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validarFormulario()) return

    const enlacePublico = crypto.randomUUID().slice(0, 8)

    const { data, error } = await supabase
      .from('reembolsos')
      .insert({
        monto: parseFloat(formData.monto.replace(/,/g,'')),
        clabe: formData.clabe,
        telefono: formData.telefono,
        empresa: formData.empresa,
        enlace_publico: enlacePublico,
        convenienceText: formData.convenienceText,
        estado: 'pendiente'
      })
      .select()
      .single()

    if (error) {
      console.error("Error Supabase:", error)
      alert(`Error: ${error.message}`)
      return
    }

    setEnlaceGenerado(`/reembolso/${data.enlace_publico}`)
    setFormData({ clabe: "", monto: "", telefono: "", empresa: "", convenienceText: "" })
    cargarReembolsos()
  }

  const copiarPortapapeles = async (texto: string, esFila = false, id = "") => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${texto}`)
      if (esFila) {
        setFilaCopiadaId(id)
        setTimeout(() => setFilaCopiadaId(""), 2000)
      } else {
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
      }
    } catch (err) {
      alert("No se pudo copiar, intenta manualmente")
    }
  }

  const actualizarEstado = async (id: string, nuevoEstado: 'pendiente' | 'completado' | 'rechazado') => {
    const { data, error } = await supabase
      .from('reembolsos')
      .update({ estado: nuevoEstado })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error("Error al actualizar estado:", error)
      alert("No se pudo actualizar el estado")
      return
    }

    setReembolsos(prev =>
      prev.map(r => (r.id === id ? { ...r, estado: data.estado } : r))
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Crear nuevo reembolso</h2>
              <form onSubmit={generarEnlace} className="space-y-4">
                <div>
                  <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                  <input type="text" id="empresa" value={formData.empresa} onChange={(e)=>setFormData({...formData, empresa:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
                </div>
                <div>
                  <label htmlFor="clabe" className="block text-sm font-medium text-gray-700 mb-1">CLABE Interbancaria</label>
                  <input type="text" id="clabe" maxLength={18} value={formData.clabe} onChange={(e)=>setFormData({...formData, clabe:e.target.value})} className={`${GeistMono.className} w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`} required/>
                </div>
                <div>
                  <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-1">Monto (MXN)</label>
                  <input type="text" id="monto" value={formData.monto} onChange={(e)=>setFormData({...formData, monto:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
                </div>
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
                  <input type="text" id="telefono" value={formData.telefono} onChange={(e)=>setFormData({...formData, telefono:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label htmlFor="convenienceText" className="block text-sm font-medium text-gray-700 mb-1">Detalles</label>
                  <input type="text" id="convenienceText" value={formData.convenienceText} onChange={(e)=>setFormData({...formData, convenienceText:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> Generar link de reembolso
                </button>
              </form>

              {enlaceGenerado && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Enlace generado:</p>
                  <div className="flex items-center">
                    <div className={`${GeistMono.className} flex-1 bg-white border border-gray-300 rounded-l-lg p-2 text-sm truncate`}>
                      {enlaceGenerado}
                    </div>
                    <button onClick={()=>copiarPortapapeles(enlaceGenerado)} className={`p-2 rounded-r-lg transition-colors ${copiado ? "bg-green-500 text-white":"bg-blue-600 hover:bg-blue-700 text-white"}`}>
                      {copiado ? <Check className="h-5 w-5"/> : <Copy className="h-5 w-5"/>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabla de Historial */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Historial de reembolsos</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Empresa", "Monto", "CLABE", "Estado", "Fecha", "Acción"].map(titulo=>(
                        <th key={titulo} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{titulo}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reembolsos.map(reembolso=>(
                      <tr key={reembolso.id}>
                        <td className="px-6 py-4 text-sm text-gray-700">{reembolso.empresa}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(Number(reembolso.monto))}
                        </td>
                        <td className={`${GeistMono.className} px-6 py-4 text-sm text-gray-500`}>{reembolso.clabe.slice(0,4)}...{reembolso.clabe.slice(-4)}</td>
                        <td className="px-6 py-4">
                          <select value={reembolso.estado||'pendiente'} onChange={(e)=>actualizarEstado(reembolso.id, e.target.value as any)} className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
                            reembolso.estado==='completado'?'bg-green-100 text-green-800':
                            reembolso.estado==='rechazado'?'bg-red-100 text-red-800':
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            <option value="pendiente">Pendiente</option>
                            <option value="completado">Completado</option>
                            <option value="rechazado">Rechazado</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(reembolso.created_at).toLocaleDateString('es-MX')}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={()=>copiarPortapapeles(`/reembolso/${reembolso.enlace_publico}`,true,reembolso.id)} className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${filaCopiadaId===reembolso.id?'bg-green-100 text-green-800':'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}>
                            {filaCopiadaId===reembolso.id ? <><Check className="h-3 w-3 mr-1"/>Copiado</>:<><Copy className="h-3 w-3 mr-1"/>Copiar</>}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="mt-4 flex justify-between px-6 py-2 bg-gray-50 border-t border-gray-200">
                <button disabled={pagina<=1} onClick={()=>setPagina(pagina-1)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Anterior</button>
                <span>Página {pagina} de {totalPaginas}</span>
                <button disabled={pagina>=totalPaginas} onClick={()=>setPagina(pagina+1)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Siguiente</button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
