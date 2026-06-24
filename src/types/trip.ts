import type { Waypoint } from './waypoint'

export interface Trip {
  id: string
  user_id?: string
  title: string
  description: string
  cover_lng?: number
  cover_lat?: number
  cover_zoom?: number
  start_date?: string
  end_date?: string
  dayCount: number
  waypoints: Waypoint[]
  waypointRoutes: Map<number, RouteData>
  status: TripStatus
  created_at?: string
  updated_at?: string
}

export interface RouteData {
  polyline: [number, number][]
  distance: number
  duration: number
}

export type TripStatus = 'draft' | 'published'
