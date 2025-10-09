'use client'
import { useState, useEffect } from "react"
import { Copy, Check, Plus, Upload, X } from "lucide-react"
import { GeistMono } from "geist/font/mono"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

type Reembolso = {
  id: string
  monto: number
  clabe: string
  empresa: string
  telefono?: string
  estado: 'pendiente' | 'completado' | 'rechazado'
  enlace_publico: string
  convenience_text?: string
  created_at: string
  periodo_actual: number
  total_periodos: number
  monto_reembolsado: number
  referencia?: string
  dias_reembolso: number
  fecha_reembolso?: string
  logo_empresa?: string
}

export default function PanelAdmin() {
  const [formData, setFormData] = useState({
    empresa: "Mi Empresa",
    periodo_actual: "1",
    total_periodos: "1", 
    clabe: "",
    monto: "",
    monto_reembolsado: "0",
    dias_reembolso: "6",
    fecha_reembolso: "",
    referencia: "",
    telefono: "",
    convenience_text: ""
  })

  const [logoSeleccionado, setLogoSeleccionado] = useState<string>("/logo.png")
  const [enlaceGenerado, setEnlaceGenerado] = useState("")
  const [reembolsos, setReembolsos] = useState<Reembolso[]>([])
  const [copiado, setCopiado] = useState(false)
  const [filaCopiadaId, setFilaCopiadaId] = useState("")
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [cargando, setCargando] = useState(true)

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
    setCargando(false)
  }

  const manejarSeleccionLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return

    if (!archivo.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen')
      return
    }

    if (archivo.size > 2 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoSeleccionado(e.target?.result as string)
    }
    reader.readAsDataURL(archivo)
  }

  const eliminarLogo = () => {
    setLogoSeleccionado("/logo.png")
  }

  const validarFormulario = () => {
    const { clabe, monto, empresa, periodo_actual, total_periodos, dias_reembolso } = formData
    
    if (!empresa.trim()) {
      alert("El nombre de la empresa es requerido.")
      return false
    }
    if (!/^\d{18}$/.test(clabe)) {
      alert("La CLABE debe tener 18 dígitos numéricos.")
      return false
    }
    if (!/^(\d+)(\.\d{1,2})?$/.test(monto.replace(/,/g,''))) {
      alert("El monto debe ser un número válido.")
      return false
    }
    if (parseInt(periodo_actual) < 1 || parseInt(total_periodos) < 1) {
      alert("Los periodos deben ser al menos 1.")
      return false
    }
    if (parseInt(dias_reembolso) < 1) {
      alert("Los días para reembolso deben ser al menos 1.")
      return false
    }
    return true
  }

  const generarEnlace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validarFormulario()) return

    try {
      const enlacePublico = crypto.randomUUID().slice(0, 8)

      const { data, error } = await supabase
        .from('reembolsos')
        .insert({
          monto: parseFloat(formData.monto.replace(/,/g,'')),
          clabe: formData.clabe,
          telefono: formData.telefono,
          empresa: formData.empresa,
          enlace_publico: enlacePublico,
          convenience_text: formData.convenience_text,
          estado: 'pendiente',
          periodo_actual: parseInt(formData.periodo_actual),
          total_periodos: parseInt(formData.total_periodos),
          monto_reembolsado: parseFloat(formData.monto_reembolsado.replace(/,/g,'')) || 0,
          referencia: formData.referencia,
          dias_reembolso: parseInt(formData.dias_reembolso),
          fecha_reembolso: formData.fecha_reembolso || null,
          logo_empresa: logoSeleccionado
        })
        .select()
        .single()

      if (error) throw error

      setEnlaceGenerado(`/reembolso/${data.enlace_publico}`)
      
      // Resetear solo algunos campos
      setFormData(prev => ({
        ...prev,
        clabe: "",
        monto: "",
        monto_reembolsado: "0",
        referencia: "",
        telefono: "",
        convenience_text: ""
      }))
      
      cargarReembolsos()
      
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const copiarPortapapeles = async (texto: string, id = "") => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${texto}`)
      if (id) {
        setFilaCopiadaId(id)
        setTimeout(() => setFilaCopiadaId(""), 2000)
      } else {
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
      }
    } catch (err) {
      alert("No se pudo copiar")
    }
  }

  const actualizarEstado = async (id: string, nuevoEstado: 'pendiente' | 'completado' | 'rechazado') => {
    const { error } = await supabase
      .from('reembolsos')
      .update({ estado: nuevoEstado })
      .eq('id', id)

    if (error) {
      alert("No se pudo actualizar el estado")
      return
    }

    setReembolsos(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r))
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Panel de Reembolsos</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Crear nuevo reembolso</h2>
              
              {/* Logo en el formulario */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Logo de la Empresa</label>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-24 h-24 relative bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    <Image
                      src={logoSeleccionado}
                      alt="Logo empresa"
                      width={80}
                      height={80}
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/logo.png"
                      }}
                    />
                    {logoSeleccionado !== "/logo.png" && (
                      <button
                        onClick={eliminarLogo}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={manejarSeleccionLogo}
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Seleccionar Logo</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG hasta 2MB</p>
                  </div>
                </div>
              </div>

              <form onSubmit={generarEnlace} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                  <input 
                    type="text" 
                    value={formData.empresa} 
                    onChange={(e)=>setFormData({...formData, empresa:e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Periodo Actual</label>
                    <input type="number" value={formData.periodo_actual} onChange={(e)=>setFormData({...formData, periodo_actual:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" min="1" required/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Periodos</label>
                    <input type="number" value={formData.total_periodos} onChange={(e)=>setFormData({...formData, total_periodos:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" min="1" required/>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CLABE Interbancaria</label>
                  <input type="text" maxLength={18} value={formData.clabe} onChange={(e)=>setFormData({...formData, clabe:e.target.value})} className={`${GeistMono.className} w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`} required/>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Total</label>
                    <input type="text" value={formData.monto} onChange={(e)=>setFormData({...formData, monto:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Reembolsado</label>
                    <input type="text" value={formData.monto_reembolsado} onChange={(e)=>setFormData({...formData, monto_reembolsado:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Días para reembolso</label>
                    <input type="number" value={formData.dias_reembolso} onChange={(e)=>setFormData({...formData, dias_reembolso:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" min="1" required/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite (opcional)</label>
                    <input type="date" value={formData.fecha_reembolso} onChange={(e)=>setFormData({...formData, fecha_reembolso:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referencia (opcional)</label>
                  <input type="text" value={formData.referencia} onChange={(e)=>setFormData({...formData, referencia:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Periodo 2/1"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
                  <input type="text" value={formData.telefono} onChange={(e)=>setFormData({...formData, telefono:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                  <input type="text" value={formData.convenience_text} onChange={(e)=>setFormData({...formData, convenience_text:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2">
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
                      {["Empresa", "Periodo", "Monto", "Estado", "Fecha", "Acción"].map(titulo=>(
                        <th key={titulo} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{titulo}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reembolsos.map(reembolso=>(
                      <tr key={reembolso.id}>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="font-medium">{reembolso.empresa}</div>
                          {reembolso.referencia && (
                            <div className="text-xs text-gray-500">{reembolso.referencia}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {reembolso.periodo_actual}/{reembolso.total_periodos}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(reembolso.monto)}
                        </td>
                        <td className="px-6 py-4">
                          <select value={reembolso.estado} onChange={(e)=>actualizarEstado(reembolso.id, e.target.value as any)} className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
                            reembolso.estado==='completado'?'bg-green-100 text-green-800':
                            reembolso.estado==='rechazado'?'bg-red-100 text-red-800':
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            <option value="pendiente">Pendiente</option>
                            <option value="completado">Completado</option>
                            <option value="rechazado">Rechazado</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(reembolso.created_at).toLocaleDateString('es-MX')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={()=>copiarPortapapeles(`/reembolso/${reembolso.enlace_publico}`, reembolso.id)} className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${filaCopiadaId===reembolso.id?'bg-green-100 text-green-800':'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}>
                            {filaCopiadaId===reembolso.id ? <><Check className="h-3 w-3 mr-1"/>Copiado</>:<><Copy className="h-3 w-3 mr-1"/>Copiar</>}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
