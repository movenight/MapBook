const AMAP_KEY = import.meta.env.VITE_AMAP_KEY

export async function reverseGeocode(
  lng: number,
  lat: number
): Promise<{ name: string; address: string }> {
  const url = `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_KEY}&location=${lng},${lat}&radius=1000&extensions=all`
  const res = await fetch(url)
  const data = await res.json()

  if (data.status === '1' && data.regeocode) {
    const addr = data.regeocode.formatted_address || ''
    const pois = data.regeocode.pois || []
    const poiName = pois.length > 0 ? pois[0].name : ''
    return { name: poiName || addr, address: addr }
  }

  throw new Error('Reverse geocode failed')
}

export async function drivingRoute(
  origin: { lng: number; lat: number },
  destination: { lng: number; lat: number },
  waypoints: { lng: number; lat: number }[]
): Promise<{ polyline: [number, number][]; distance: number; duration: number }> {
  let url = `https://restapi.amap.com/v3/direction/driving?key=${AMAP_KEY}&origin=${origin.lng},${origin.lat}&destination=${destination.lng},${destination.lat}&strategy=0&extensions=all`

  if (waypoints.length > 0) {
    const wpStr = waypoints.map((w) => `${w.lng},${w.lat}`).join(';')
    url += `&waypoints=${wpStr}`
  }

  const res = await fetch(url)
  const data = await res.json()

  if (data.status === '1' && data.route?.paths?.length > 0) {
    const path = data.route.paths[0]
    const steps = path.steps || []
    const polyline: [number, number][] = []

    for (const step of steps) {
      const encoded = step.polyline
      if (typeof encoded === 'string' && encoded) {
        const pairs = encoded.split(';')
        for (const pair of pairs) {
          const [lng, lat] = pair.split(',').map(Number)
          if (!isNaN(lng) && !isNaN(lat)) {
            polyline.push([lng, lat])
          }
        }
      }
    }

    return {
      polyline,
      distance: parseInt(path.distance) || 0,
      duration: parseInt(path.duration) || 0,
    }
  }

  throw new Error('Driving route failed')
}
