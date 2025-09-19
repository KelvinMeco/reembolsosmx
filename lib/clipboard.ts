// utils/clipboard.js
export const copiarSeguro = (texto: string) => {
  // 1. Verificar si es en el navegador
  if (typeof window === 'undefined') return false
  
  // 2. Intentar con método moderno
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(texto)
      .then(() => true)
      .catch(() => false)
  }
  
  // 3. Método antiguo como respaldo
  const area = document.createElement('textarea')
  area.value = texto
  area.style.position = 'fixed'
  document.body.appendChild(area)
  area.select()
  const resultado = document.execCommand('copy')
  document.body.removeChild(area)
  return resultado
}