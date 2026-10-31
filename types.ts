export type User = { id: number; email: string; full_name: string; role: string }
export type Summary = { total_events: number; active_sources: number; total_value: number; anomaly_count: number; events_delta: number }
export type Point = { date: string; events: number; value: number }
export type Source = { source: string; count: number }
export type EventRow = { id: number; source: string; event_type: string; value: number; created_at: string; metadata: Record<string, unknown> }
