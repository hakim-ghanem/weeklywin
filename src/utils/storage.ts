import type { AppData } from '../types'

const STORAGE_KEY = 'weeklywin-data'

export function getDefaultData(): AppData {
  return {
    lastModified: new Date().toISOString(),
    profile: {
      name: '',
      level: 1,
      totalPoints: 0,
      currentPoints: 0,
      streakDays: 0,
      streakLastDate: '',
    },
    weeks: {},
    journal: {},
    badges: [],
    rewards: {
      available: [
        { id: '1', name: '30 min extra gaming', emoji: '🎮', cost: 100 },
        { id: '2', name: 'Pick dinner', emoji: '🍕', cost: 200 },
        { id: '3', name: 'Movie night pick', emoji: '🎬', cost: 300 },
        { id: '4', name: '$10 fun money', emoji: '🛍️', cost: 500 },
      ],
      redeemed: [],
    },
    settings: {
      parentPin: '',
      reminderTime: '07:30',
      categories: ['school', 'activity', 'chore'],
      pointValues: {
        school: 15,
        chore: 10,
        activity: 5,
        journal: 10,
        dailyBonus: 25,
        weeklyBonus: 100,
        priorityBonus: 5,
      },
    },
  }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as AppData
    }
  } catch (e) {
    console.error('Failed to load data:', e)
  }
  return getDefaultData()
}

export function saveData(data: AppData): void {
  try {
    const updated = { ...data, lastModified: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('Failed to save data:', e)
  }
}

export function exportData(data: AppData): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'weeklywin-data.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function importData(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as AppData
        resolve(data)
      } catch {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
