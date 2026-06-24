let AMapInstance: any = null
let loadPromise: Promise<any> | null = null

export function loadAMap(): Promise<any> {
  if (AMapInstance) return Promise.resolve(AMapInstance)
  if (loadPromise) return loadPromise

  const key = import.meta.env.VITE_AMAP_KEY
  const secret = import.meta.env.VITE_AMAP_SECRET

  if (!key) {
    return Promise.reject(new Error('VITE_AMAP_KEY 未配置'))
  }

  const win = window as any

  if (win.AMap) {
    AMapInstance = win.AMap
    return Promise.resolve(AMapInstance)
  }

  loadPromise = new Promise<any>((resolve, reject) => {
    const script = document.createElement('script')
    let url = `https://webapi.amap.com/v2/maps?key=${key}&plugin=AMap.Geocoder,AMap.AutoComplete,AMap.PlaceSearch,AMap.Driving,AMap.Walking,AMap.Riding`

    if (secret) {
      url += `&jscode=${encodeURIComponent(secret)}`
    }

    script.src = url
    script.async = true
    script.onerror = () => {
      reject(new Error('AMap SDK 加载失败'))
    }
    script.onload = () => {
      AMapInstance = win.AMap
      resolve(AMapInstance)
    }

    document.head.appendChild(script)
  })

  return loadPromise
}
