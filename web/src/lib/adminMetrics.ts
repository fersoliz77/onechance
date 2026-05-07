import type { UserRecord, VideoEntry } from '@/types'

type RoleKey = UserRecord['role']

export interface AdminMetricsData {
  months: string[]
  roleSeries: Record<RoleKey, number[]>
  pendingSeries: number[]
  deltas: {
    profiles: string
    player: string
    coach: string
    club: string
    agent: string
    videos: string
    pending: string
  }
}

const MONTH_LABEL = new Intl.DateTimeFormat('es-AR', { month: 'short' })

function toDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (typeof value === 'object') {
    const v = value as { toDate?: () => Date; seconds?: number; _seconds?: number }
    if (typeof v.toDate === 'function') {
      const d = v.toDate()
      return Number.isNaN(d.getTime()) ? null : d
    }
    const secs = typeof v.seconds === 'number' ? v.seconds : v._seconds
    if (typeof secs === 'number') {
      const d = new Date(secs * 1000)
      return Number.isNaN(d.getTime()) ? null : d
    }
  }
  return null
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function getLastMonthKeys(count: number) {
  const now = new Date()
  const keys: string[] = []
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    keys.push(monthKey(d))
  }
  return keys
}

function getMonthLabels(keys: string[]) {
  return keys.map(key => {
    const [y, m] = key.split('-').map(Number)
    return MONTH_LABEL.format(new Date(Date.UTC(y, m - 1, 1)))
  })
}

function formatDelta(now: number, prev: number) {
  if (prev <= 0 && now <= 0) return 'Sin cambios'
  if (prev <= 0 && now > 0) return '+100% vs. mes anterior'
  const pct = Math.round(((now - prev) / prev) * 100)
  if (pct === 0) return 'Sin cambios'
  return `${pct > 0 ? '+' : ''}${pct}% vs. mes anterior`
}

type PendingLike = { createdAt?: unknown }

export function buildAdminMetrics(
  users: UserRecord[],
  videos: (VideoEntry & { playerUid: string })[],
  pending: PendingLike[],
  monthRange: 3 | 6 | 12 = 12,
): AdminMetricsData {
  const monthKeys = getLastMonthKeys(monthRange)
  const monthIndex = new Map(monthKeys.map((k, i) => [k, i]))

  const roleSeries: Record<RoleKey, number[]> = {
    player: new Array(monthRange).fill(0),
    coach: new Array(monthRange).fill(0),
    club: new Array(monthRange).fill(0),
    agent: new Array(monthRange).fill(0),
  }

  const profileSeries = new Array(monthRange).fill(0)
  const videoSeries = new Array(monthRange).fill(0)
  const pendingSeries = new Array(monthRange).fill(0)

  for (const user of users) {
    const d = toDate((user as UserRecord & { createdAt?: unknown }).createdAt)
    if (!d) continue
    const idx = monthIndex.get(monthKey(d))
    if (idx === undefined) continue
    if (user.role in roleSeries) roleSeries[user.role][idx] += 1
    profileSeries[idx] += 1
  }

  for (const video of videos) {
    const d = toDate((video as VideoEntry & { createdAt?: unknown }).createdAt)
    if (!d) continue
    const idx = monthIndex.get(monthKey(d))
    if (idx === undefined) continue
    videoSeries[idx] += 1
  }

  for (const item of pending) {
    const d = toDate(item.createdAt)
    if (!d) continue
    const idx = monthIndex.get(monthKey(d))
    if (idx === undefined) continue
    pendingSeries[idx] += 1
  }

  const thisMonth = monthRange - 1
  const prevMonth = Math.max(monthRange - 2, 0)

  return {
    months: getMonthLabels(monthKeys),
    roleSeries,
    pendingSeries,
    deltas: {
      profiles: formatDelta(profileSeries[thisMonth], profileSeries[prevMonth]),
      player: formatDelta(roleSeries.player[thisMonth], roleSeries.player[prevMonth]),
      coach: formatDelta(roleSeries.coach[thisMonth], roleSeries.coach[prevMonth]),
      club: formatDelta(roleSeries.club[thisMonth], roleSeries.club[prevMonth]),
      agent: formatDelta(roleSeries.agent[thisMonth], roleSeries.agent[prevMonth]),
      videos: formatDelta(videoSeries[thisMonth], videoSeries[prevMonth]),
      pending: formatDelta(pendingSeries[thisMonth], pendingSeries[prevMonth]),
    },
  }
}
