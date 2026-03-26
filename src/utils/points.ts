import type { AppData, Task, Category, DayOfWeek } from '../types'

export interface LevelInfo {
  level: number
  name: string
  threshold: number
}

export const LEVELS: LevelInfo[] = [
  { level: 1, name: 'Rookie Planner', threshold: 0 },
  { level: 2, name: 'Getting Organized', threshold: 100 },
  { level: 3, name: 'Rising Star', threshold: 250 },
  { level: 4, name: 'Task Master', threshold: 500 },
  { level: 5, name: 'Weekly Champion', threshold: 1000 },
  { level: 6, name: 'Legend', threshold: 2000 },
]

export function getLevelForPoints(totalPoints: number): LevelInfo {
  let current = LEVELS[0]
  for (const level of LEVELS) {
    if (totalPoints >= level.threshold) {
      current = level
    } else {
      break
    }
  }
  return current
}

export function getNextLevel(currentLevel: number): LevelInfo | null {
  const idx = LEVELS.findIndex(l => l.level === currentLevel)
  if (idx < LEVELS.length - 1) {
    return LEVELS[idx + 1]
  }
  return null
}

export function getPointsForTask(task: Task, pointValues: AppData['settings']['pointValues']): number {
  const base = pointValues[task.category as Category] || 5
  const bonus = task.priority === 'high' ? pointValues.priorityBonus : 0
  return base + bonus
}

export function isDayComplete(tasks: Task[], day: DayOfWeek): boolean {
  const dayTasks = tasks.filter(t => t.days.includes(day))
  return dayTasks.length > 0 && dayTasks.every(t => t.completed)
}

export function isWeekComplete(tasks: Task[]): boolean {
  return tasks.length > 0 && tasks.every(t => t.completed)
}
