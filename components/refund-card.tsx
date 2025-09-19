"use client"

import { useState } from "react"
import { Copy, Check, Phone } from "lucide-react"
import { GeistMono } from "geist/font/mono"

interface RefundCardProps {
  id: string
  importe: string | number
  clabe: string
  empresa: string
  telefono?: string
  estado?: string
  convenienceText?: string
}

export function RefundCard({
  id,
  importe,
  clabe,
  empresa,
  telefono,
  estado,
  convenienceText,
}: RefundCardProps) {
  const [copied, setCopied] = useState(false)

  const formatImporte = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('es-MX', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(isNaN(numValue) ? 0 : numValue)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-lg shadow-md max-w-md w-full overflow-hidden border border-gray-200">
      {/* Encabezado */}
      <div className="bg-gray-50 p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-center text-gray-800 uppercase tracking-wide">Comprobante de reembolso</h1>
        <p className="text-center text-gray-600 text-sm mt-1">{empresa}</p>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Sección de Reembolso en línea */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">Reembolso en línea</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Importe (MXN)</p>
              <p className="text-xl font-bold text-gray-800">
                {formatImporte(importe)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cuenta CLABE</p>
            <div className="flex items-center">
              <div className={`${GeistMono.className} flex-1 bg-gray-50 border border-gray-200 rounded-l-md p-2 text-sm`}>
                {clabe || ""}
              </div>
              <button
                onClick={() => copyToClipboard(clabe)}
                className={`p-2 rounded-r-md transition-colors ${
                  copied ? "bg-green-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                aria-label="Copiar CLABE"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {!clabe && <p className="text-red-500 text-xs mt-1">Por favor, copie la cuenta CLABE a utilizar</p>}
          </div>
        </div>

        {/* Sección de Reembolso en tienda */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">Reembolso en tienda</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Importe (MXN)</p>
              <p className="text-xl font-bold text-gray-800">
                {formatImporte(importe)}
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="space-y-4">
          {convenienceText && (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{convenienceText}</p>
            </div>
          )}

          {telefono && (
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className={GeistMono.className}>{telefono}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}