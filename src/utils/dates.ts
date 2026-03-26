import type { DayOfWeek } from '../types'

const DAY_NAMES: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export function getWeekKey(date: Date = new Date()): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  // ISO week: Monday is first day
  const dayNum = d.getDay() || 7 // Convert Sunday=0 to 7
  d.setDate(d.getDate() + 4 - dayNum) // Set to Thursday of the week
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function getTodayDayOfWeek(): DayOfWeek {
  const jsDay = new Date().getDay()
  // JS: 0=Sun, 1=Mon, ..., 6=Sat → our array: 0=Mon, ..., 6=Sun
  return DAY_NAMES[jsDay === 0 ? 6 : jsDay - 1]
}

export function getDayIndex(day: DayOfWeek): number {
  return DAY_NAMES.indexOf(day)
}

export function getAllDays(): DayOfWeek[] {
  return [...DAY_NAMES]
}

export function formatDayShort(day: DayOfWeek): string {
  return day.charAt(0).toUpperCase() + day.slice(1, 3)
}

export function formatDayFull(day: DayOfWeek): string {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export function getWeekDates(weekKey: string): Record<DayOfWeek, string> {
  // Parse week key like "2026-W13"
  const [yearStr, weekStr] = weekKey.split('-W')
  const year = parseInt(yearStr)
  const week = parseInt(weekStr)

  // Find the Monday of the given ISO week
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7)

  const result: Record<string, string> = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    result[DAY_NAMES[i]] = d.toISOString().split('T')[0]
  }
  return result as Record<DayOfWeek, string>
}
