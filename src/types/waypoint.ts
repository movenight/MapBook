export interface Waypoint {
  id: string
  tripId: string
  dayIndex: number
  orderIndex: number
  name: string
  address: string
  lng: number
  lat: number
  poi_id?: string
  type: WaypointType
  notes: string
  created_at?: string
}

export type WaypointType = 'departure' | 'destination' | 'waypoint' | 'lodgment' | 'dining'
