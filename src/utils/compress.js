/**
 * Compresse une image via canvas.
 * @param {File|string} source  Fichier File ou data URL base64 existante
 * @param {number} maxPx        Dimension max (largeur ou hauteur) en pixels
 * @param {number} quality      Qualité JPEG 0–1
 * @returns {Promise<string>}   data URL base64 JPEG compressée
 */
export function compressImage(source, maxPx = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    let objectUrl = null

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)

      const ratio  = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('Compression échouée'))
        const reader = new FileReader()
        reader.onload  = e => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      }, 'image/jpeg', quality)
    }

    img.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      reject(new Error('Image invalide'))
    }

    if (typeof source === 'string') {
      img.src = source
    } else {
      objectUrl = URL.createObjectURL(source)
      img.src   = objectUrl
    }
  })
}
