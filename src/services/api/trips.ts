import { supabase } from '../supabase'
import type { Trip } from '@/types/trip'

export const db = {
  async upsertTrip(trip: Trip) {
    const payload = {
      title: trip.title,
      description: trip.description,
      day_count: trip.dayCount,
      status: trip.status,
      start_date: trip.start_date,
      end_date: trip.end_date,
    }

    if (trip.id) {
      return supabase.from('trips').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', trip.id).select().single()
    }

    return supabase.from('trips').insert(payload).select().single()
  },

  async getAllTrips() {
    return supabase
      .from('trips')
      .select('*')
      .order('updated_at', { ascending: false })
  },

  async getTrip(id: string) {
    return supabase
      .from('trips')
      .select('*, waypoints(*)')
      .eq('id', id)
      .single()
  },

  async deleteTrip(id: string) {
    return supabase.from('trips').delete().eq('id', id)
  },

  async upsertWaypoints(waypoints: Trip['waypoints']) {
    if (waypoints.length === 0) return null
    return supabase.from('waypoints').upsert(
      waypoints.map((wp) => ({
        id: wp.id,
        trip_id: wp.tripId,
        day_index: wp.dayIndex,
        order_index: wp.orderIndex,
        name: wp.name,
        address: wp.address,
        lng: wp.lng,
        lat: wp.lat,
        type: wp.type,
        notes: wp.notes,
      }))
    )
  },

  async deleteWaypoints(ids: string[]) {
    if (ids.length === 0) return null
    return supabase.from('waypoints').delete().in('id', ids)
  },
}
