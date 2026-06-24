declare namespace AMap {
  class Map {
    constructor(container: string | HTMLElement, opts?: MapOptions)
    setCenter(center: [number, number]): void
    setZoom(zoom: number): void
    setFitView(overlays?: unknown[]): void
    add(overlay: Overlay | Overlay[]): void
    remove(overlay: Overlay | Overlay[]): void
    clearMap(): void
    destroy(): void
    on(event: string, handler: (e: unknown) => void): void
    off(event: string, handler: (e: unknown) => void): void
  }

  interface MapOptions {
    zoom?: number
    center?: [number, number]
    viewMode?: '2D' | '3D'
    layers?: unknown[]
  }

  class LngLat {
    constructor(lng: number, lat: number)
    lng: number
    lat: number
    getLng(): number
    getLat(): number
  }

  class Pixel {
    constructor(x: number, y: number)
    x: number
    y: number
  }

  interface MapsEvent<N extends string, T = unknown> {
    lnglat: LngLat
    pixel: Pixel
    target: T
    type: N
  }

  class Overlay {}

  class Polyline {
    constructor(opts: PolylineOptions)
    setPath(path: LngLat[]): void
    getPath(): LngLat[]
  }

  interface PolylineOptions {
    path: LngLat[]
    strokeColor?: string
    strokeWeight?: number
    strokeOpacity?: number
    lineJoin?: string
  }

  class Marker {
    constructor(opts: MarkerOptions)
    setPosition(position: [number, number]): void
    getPosition(): LngLat
    setLabel(label: { content: string; offset?: Pixel }): void
    on(event: string, handler: (e: unknown) => void): void
  }

  interface MarkerOptions {
    position: [number, number]
    icon?: string
    label?: { content: string; offset?: Pixel }
    draggable?: boolean
  }

  class InfoWindow {
    constructor(opts: InfoWindowOptions)
    open(map: Map, pos: [number, number]): void
    close(): void
    setContent(content: string | HTMLElement): void
  }

  interface InfoWindowOptions {
    content?: string | HTMLElement
    offset?: Pixel
    isCustom?: boolean
  }

  class Geocoder {
    constructor(opts?: { city?: string; radius?: number })
    getLocation(
      address: string,
      callback: (status: string, result: { geocodes: Array<{ location: LngLat }> }) => void
    ): void
  }

  class AutoComplete {
    constructor(opts?: { city?: string; citylimit?: boolean })
    search(
      keyword: string,
      callback: (status: string, result: { tips: AutoComplete.Tip[] }) => void
    ): void
  }

  namespace AutoComplete {
    interface Tip {
      id: string
      name: string
      district: string
      address: string
      location?: LngLat
    }
  }

  class PlaceSearch {
    constructor(opts?: { city?: string; pageSize?: number })
    search(
      keyword: string,
      callback: (status: string, result: { poiList: { pois: PlaceSearch.Poi[] } }) => void
    ): void
  }

  namespace PlaceSearch {
    interface Poi {
      id: string
      name: string
      address: string
      location: LngLat
      pname: string
      cityname: string
    }
  }

  class Driving {
    constructor(opts?: { policy?: number; extensions?: string })
    search(
      origin: LngLat,
      destination: LngLat,
      opts: { waypoints?: LngLat[] },
      callback: (status: string, result: {
        routes: Array<{
          distance: number
          time: number
          steps: Array<{
            path: LngLat[]
          }>
        }>
      }) => void
    ): void
  }

  class Walking {
    constructor(opts?: { map?: Map })
    search(
      origin: LngLat,
      destination: LngLat,
      callback: (status: string, result: {
        routes: Array<{
          distance: number
          time: number
          steps: Array<{
            path: LngLat[]
          }>
        }>
      }) => void
    ): void
  }

  class Riding {
    constructor(opts?: { map?: Map; policy?: number })
    search(
      origin: LngLat,
      destination: LngLat,
      callback: (status: string, result: {
        routes: Array<{
          distance: number
          time: number
          steps: Array<{
            path: LngLat[]
          }>
        }>
      }) => void
    ): void
  }
}
