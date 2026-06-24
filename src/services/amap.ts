export async function loadAMap(): Promise<any> {
  const win = window as any
  if (win.AMap) return win.AMap

  await win._amapReady

  if (!win.AMap) {
    throw new Error('AMap SDK 加载失败')
  }

  return win.AMap
}
