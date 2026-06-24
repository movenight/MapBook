export interface MapPosition {
  lng: number
  lat: number
  zoom?: number
}

export interface MapMarker {
  id: string
  lng: number
  lat: number
  label: string
  type: string
  dayIndex: number
}

export interface MapContextMenuItem {
  label: string
  value: string
  icon?: string
}
