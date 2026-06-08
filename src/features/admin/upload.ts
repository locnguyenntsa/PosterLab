/*
  Front-end-only image upload seam. Reads a File and returns a downscaled data
  URL, so previews survive a page refresh in localStorage (object URLs would
  not). The backend swap point: replace the body with a real upload (S3 / CDN)
  that returns a hosted URL — callers only depend on the returned string.
*/
export async function uploadImage(file: File, maxEdge = 900): Promise<string> {
  const dataUrl = await readAsDataURL(file)
  try {
    return await downscale(dataUrl, maxEdge)
  } catch {
    return dataUrl
  }
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function downscale(src: string, maxEdge: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas unavailable'))
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => reject(new Error('Image failed to load'))
    img.src = src
  })
}
