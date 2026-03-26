import type { Task, DayOfWeek } from '../types'
import { getWeekDates } from './dates'

function formatICSDate(dateStr: string, time: string): string {
  // dateStr: "2026-03-26", time: "07:30"
  const [year, month, day] = dateStr.split('-')
  const [hour, min] = time.split(':')
  return `${year}${month}${day}T${hour}${min}00`
}

function escapeICS(text: string): string {
  return text.replace(/[\\;,]/g, c => '\\' + c).replace(/\n/g, '\\n')
}

export function generateICS(
  tasks: Task[],
  weekKey: string,
  reminderTime: string = '07:30'
): string {
  const weekDates = getWeekDates(weekKey)
  const events: string[] = []

  for (const task of tasks) {
    for (const day of task.days) {
      const dateStr = weekDates[day]
      if (!dateStr) continue

      const dtStart = formatICSDate(dateStr, reminderTime)
      // 1-hour event by default
      const [h, m] = reminderTime.split(':').map(Number)
      const endH = String(h + 1).padStart(2, '0')
      const dtEnd = formatICSDate(dateStr, `${endH}:${String(m).padStart(2, '0')}`)

      const priority = task.priority === 'high' ? 'HIGH' : task.priority === 'medium' ? 'MEDIUM' : 'LOW'
      const categoryLabel = task.category === 'school' ? 'School' : task.category === 'activity' ? 'Activity' : 'Chore'

      events.push(
`BEGIN:VEVENT
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${escapeICS(task.title)}
DESCRIPTION:${escapeICS(`Category: ${categoryLabel} | Priority: ${priority} | Est: ${task.timeEstimate}min`)}
CATEGORIES:${categoryLabel}
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:${escapeICS(task.title)} is coming up!
END:VALARM
BEGIN:VALARM
TRIGGER:PT0M
ACTION:DISPLAY
DESCRIPTION:Time for: ${escapeICS(task.title)}
END:VALARM
END:VEVENT`
      )
    }
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WeeklyWin//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:WeeklyWin Tasks
${events.join('\n')}
END:VCALENDAR`
}

export function downloadICS(tasks: Task[], weekKey: string, reminderTime?: string): void {
  const ics = generateICS(tasks, weekKey, reminderTime)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `weeklywin-${weekKey}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
