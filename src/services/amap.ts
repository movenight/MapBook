import AMapLoader from '@amap/amap-jsapi-loader'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let AMapInstance: any = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadAMap(): Promise<any> {
  if (AMapInstance) return AMapInstance

  const key = import.meta.env.VITE_AMAP_KEY
  if (!key) {
    throw new Error('请在 .env 文件中设置 VITE_AMAP_KEY')
  }

  AMapInstance = await AMapLoader.load({
    key,
    version: '2.0',
    plugins: [
      'AMap.Geocoder',
      'AMap.AutoComplete',
      'AMap.PlaceSearch',
      'AMap.Driving',
      'AMap.Walking',
      'AMap.Riding',
    ],
  })

  return AMapInstance
}
