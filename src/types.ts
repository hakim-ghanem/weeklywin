export type Category = 'school' | 'activity' | 'chore'
export type Priority = 'high' | 'medium' | 'low'
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type Mood = 'great' | 'good' | 'meh' | 'frustrated' | 'sad'

export interface Task {
  id: string
  title: string
  category: Category
  days: DayOfWeek[]
  priority: Priority
  timeEstimate: number // minutes
  completed: boolean
  completedAt: string | null
  pointsEarned: number
}

export interface WeekData {
  tasks: Task[]
  planLocked: boolean
  createdAt: string
}

export interface JournalEntry {
  mood: Mood | null
  prompt: string
  text: string
  timestamp: string
}

export interface Badge {
  id: string
  name: string
  emoji: string
  unlockedAt: string
}

export interface RewardItem {
  id: string
  name: string
  emoji: string
  cost: number
}

export interface RedeemedReward {
  rewardId: string
  redeemedAt: string
  cost: number
}

export interface PointValues {
  school: number
  chore: number
  activity: number
  journal: number
  dailyBonus: number
  weeklyBonus: number
  priorityBonus: number
}

export interface Settings {
  parentPin: string
  reminderTime: string
  categories: Category[]
  pointValues: PointValues
}

export interface Profile {
  name: string
  level: number
  totalPoints: number
  currentPoints: number
  streakDays: number
  streakLastDate: string
}

export interface AppData {
  lastModified: string
  profile: Profile
  weeks: Record<string, WeekData>
  journal: Record<string, JournalEntry>
  badges: Badge[]
  rewards: {
    available: RewardItem[]
    redeemed: RedeemedReward[]
  }
  settings: Settings
}
