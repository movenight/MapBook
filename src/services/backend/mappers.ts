import type { Trip } from '@/types/trip'
import type { Waypoint } from '@/types/waypoint'

type Row = Record<string, any>

/* ------------------------------------------------------------------ *
 * 应用模型 (camelCase) <-> 云开发文档 (snake_case)
 *
 * 全部字段映射集中在这一个文件里。原 Web 版因为映射分散且只做了单向，
 * 导致「dayCount 读出来是 undefined」和「途经点从未落库」两个 bug。
 * ------------------------------------------------------------------ */

export function rowToTrip(row: Row): Trip {
  return {
    id: row._id ?? '',
    title: row.title ?? '',
    description: row.description ?? '',
    dayCount: typeof row.day_count === 'number' ? row.day_count : 1,
    status: row.status === 'published' ? 'published' : 'draft',
    startDate: row.start_date ?? '',
    endDate: row.end_date ?? '',
    coverLng: row.cover_lng ?? undefined,
    coverLat: row.cover_lat ?? undefined,
    coverZoom: row.cover_zoom ?? undefined,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  }
}

/** 不包含 _id / _openid —— 这两个由云开发自己托管 */
export function tripToRow(trip: Trip): Row {
  return {
    title: trip.title,
    description: trip.description,
    day_count: trip.dayCount,
    status: trip.status,
    start_date: trip.startDate,
    end_date: trip.endDate,
    cover_lng: trip.coverLng ?? null,
    cover_lat: trip.coverLat ?? null,
    cover_zoom: trip.coverZoom ?? 10,
  }
}

export function rowToWaypoint(row: Row): Waypoint {
  return {
    id: row._id ?? '',
    tripId: row.trip_id ?? '',
    dayIndex: typeof row.day_index === 'number' ? row.day_index : 1,
    orderIndex: typeof row.order_index === 'number' ? row.order_index : 0,
    name: row.name ?? '',
    address: row.address ?? '',
    lng: typeof row.lng === 'number' ? row.lng : 0,
    lat: typeof row.lat === 'number' ? row.lat : 0,
    poiId: row.poi_id ?? '',
    type: row.type ?? 'waypoint',
    notes: row.notes ?? '',
    createdAt: row.created_at ?? undefined,
  }
}

export function waypointToRow(waypoint: Waypoint): Row {
  return {
    trip_id: waypoint.tripId,
    day_index: waypoint.dayIndex,
    order_index: waypoint.orderIndex,
    name: waypoint.name,
    address: waypoint.address,
    lng: waypoint.lng,
    lat: waypoint.lat,
    poi_id: waypoint.poiId,
    type: waypoint.type,
    notes: waypoint.notes,
  }
}
