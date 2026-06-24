let AMapInstance: any = null

export async function loadAMap(): Promise<any> {
  if (AMapInstance) return AMapInstance

  return new Promise((resolve, reject) => {
    const win = window as any

    if (win.AMap) {
      AMapInstance = win.AMap
      resolve(AMapInstance)
      return
    }

    let attempts = 0
    const maxAttempts = 150
    const interval = setInterval(() => {
      attempts++
      if (win.AMap) {
        clearInterval(interval)
        AMapInstance = win.AMap
        resolve(AMapInstance)
      } else if (attempts >= maxAttempts) {
        clearInterval(interval)
        reject(new Error('AMap SDK 加载超时'))
      }
    }, 100)
  })
}
