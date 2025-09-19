// utils/patch-clipboard.js
export const safeCopyToClipboard = async (text: string) => {
  if (typeof window === 'undefined') return false
  
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    
    // Fallback para HTTP y navegadores antiguos
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    document.body.appendChild(textarea)
    textarea.select()
    
    const result = document.execCommand('copy')
    document.body.removeChild(textarea)
    
    return result
  } catch (err) {
    console.error('Copy failed:', err)
    return false
  }
}