import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { AppData, Task, WeekData, Badge, RewardItem, Mood } from '../types'
import { loadData, saveData } from '../utils/storage'
import { getWeekKey, getTodayKey, getTodayDayOfWeek } from '../utils/dates'
import { getPointsForTask, getLevelForPoints, isDayComplete, isWeekComplete } from '../utils/points'
import { v4 as uuid } from 'uuid'

// Action types
type Action =
  | { type: 'SET_DATA'; data: AppData }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_PIN'; pin: string }
  | { type: 'CREATE_WEEK'; weekKey: string; tasks: Task[] }
  | { type: 'ADD_TASK'; weekKey: string; task: Omit<Task, 'id' | 'completed' | 'completedAt' | 'pointsEarned'> }
  | { type: 'COMPLETE_TASK'; weekKey: string; taskId: string }
  | { type: 'UNCOMPLETE_TASK'; weekKey: string; taskId: string }
  | { type: 'DELETE_TASK'; weekKey: string; taskId: string }
  | { type: 'EDIT_TASK'; weekKey: string; taskId: string; updates: Partial<Task> }
  | { type: 'LOCK_PLAN'; weekKey: string }
  | { type: 'SAVE_JOURNAL'; date: string; mood: Mood | null; text: string; prompt: string }
  | { type: 'REDEEM_REWARD'; rewardId: string }
  | { type: 'ADD_REWARD'; reward: Omit<RewardItem, 'id'> }
  | { type: 'REMOVE_REWARD'; rewardId: string }
  | { type: 'EDIT_REWARD'; rewardId: string; updates: Partial<RewardItem> }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppData['settings']> }
  | { type: 'UNLOCK_BADGE'; badge: Badge }

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'SET_DATA':
      return action.data

    case 'SET_NAME':
      return { ...state, profile: { ...state.profile, name: action.name } }

    case 'SET_PIN':
      return { ...state, settings: { ...state.settings, parentPin: action.pin } }

    case 'CREATE_WEEK': {
      const tasks = action.tasks.map(t => ({
        ...t,
        id: t.id || uuid(),
        completed: false,
        completedAt: null,
        pointsEarned: 0,
      }))
      return {
        ...state,
        weeks: {
          ...state.weeks,
          [action.weekKey]: {
            tasks,
            planLocked: false,
            createdAt: new Date().toISOString(),
          },
        },
      }
    }

    case 'ADD_TASK': {
      const week = state.weeks[action.weekKey] || { tasks: [], planLocked: false, createdAt: new Date().toISOString() }
      const newTask: Task = {
        ...action.task,
        id: uuid(),
        completed: false,
        completedAt: null,
        pointsEarned: 0,
      }
      return {
        ...state,
        weeks: {
          ...state.weeks,
          [action.weekKey]: { ...week, tasks: [...week.tasks, newTask] },
        },
      }
    }

    case 'COMPLETE_TASK': {
      const week = state.weeks[action.weekKey]
      if (!week) return state
      const task = week.tasks.find(t => t.id === action.taskId)
      if (!task || task.completed) return state

      const points = getPointsForTask(task, state.settings.pointValues)
      const updatedTasks = week.tasks.map(t =>
        t.id === action.taskId
          ? { ...t, completed: true, completedAt: new Date().toISOString(), pointsEarned: points }
          : t
      )

      let totalBonus = 0
      const today = getTodayDayOfWeek()
      if (isDayComplete(updatedTasks, today)) {
        totalBonus += state.settings.pointValues.dailyBonus
      }
      if (isWeekComplete(updatedTasks)) {
        totalBonus += state.settings.pointValues.weeklyBonus
      }

      const earnedPoints = points + totalBonus
      const newTotal = state.profile.totalPoints + earnedPoints
      const newCurrent = state.profile.currentPoints + earnedPoints
      const newLevel = getLevelForPoints(newTotal)

      // Update streak
      const todayKey = getTodayKey()
      let streakDays = state.profile.streakDays
      const streakLastDate = state.profile.streakLastDate
      if (isDayComplete(updatedTasks, today) && streakLastDate !== todayKey) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayKey = yesterday.toISOString().split('T')[0]
        if (streakLastDate === yesterdayKey || streakLastDate === '') {
          streakDays += 1
        } else {
          streakDays = 1
        }
      }

      return {
        ...state,
        profile: {
          ...state.profile,
          totalPoints: newTotal,
          currentPoints: newCurrent,
          level: newLevel.level,
          streakDays,
          streakLastDate: isDayComplete(updatedTasks, today) ? todayKey : streakLastDate,
        },
        weeks: {
          ...state.weeks,
          [action.weekKey]: { ...week, tasks: updatedTasks },
        },
      }
    }

    case 'UNCOMPLETE_TASK': {
      const week = state.weeks[action.weekKey]
      if (!week) return state
      const task = week.tasks.find(t => t.id === action.taskId)
      if (!task || !task.completed) return state

      const updatedTasks = week.tasks.map(t =>
        t.id === action.taskId
          ? { ...t, completed: false, completedAt: null, pointsEarned: 0 }
          : t
      )

      return {
        ...state,
        profile: {
          ...state.profile,
          totalPoints: Math.max(0, state.profile.totalPoints - task.pointsEarned),
          currentPoints: Math.max(0, state.profile.currentPoints - task.pointsEarned),
          level: getLevelForPoints(Math.max(0, state.profile.totalPoints - task.pointsEarned)).level,
        },
        weeks: {
          ...state.weeks,
          [action.weekKey]: { ...week, tasks: updatedTasks },
        },
      }
    }

    case 'DELETE_TASK': {
      const week = state.weeks[action.weekKey]
      if (!week) return state
      return {
        ...state,
        weeks: {
          ...state.weeks,
          [action.weekKey]: {
            ...week,
            tasks: week.tasks.filter(t => t.id !== action.taskId),
          },
        },
      }
    }

    case 'EDIT_TASK': {
      const week = state.weeks[action.weekKey]
      if (!week) return state
      return {
        ...state,
        weeks: {
          ...state.weeks,
          [action.weekKey]: {
            ...week,
            tasks: week.tasks.map(t =>
              t.id === action.taskId ? { ...t, ...action.updates } : t
            ),
          },
        },
      }
    }

    case 'LOCK_PLAN': {
      const week = state.weeks[action.weekKey]
      if (!week) return state
      return {
        ...state,
        weeks: {
          ...state.weeks,
          [action.weekKey]: { ...week, planLocked: true },
        },
      }
    }

    case 'SAVE_JOURNAL': {
      const existing = state.journal[action.date]
      const isNew = !existing || (!existing.text && !existing.mood)
      const hasContent = (action.mood !== null || action.text.trim().length > 0)

      let pointsEarned = 0
      if (isNew && hasContent && action.mood !== null && action.text.trim().length > 0) {
        pointsEarned = state.settings.pointValues.journal
      }

      return {
        ...state,
        profile: {
          ...state.profile,
          totalPoints: state.profile.totalPoints + pointsEarned,
          currentPoints: state.profile.currentPoints + pointsEarned,
          level: getLevelForPoints(state.profile.totalPoints + pointsEarned).level,
        },
        journal: {
          ...state.journal,
          [action.date]: {
            mood: action.mood,
            prompt: action.prompt,
            text: action.text,
            timestamp: new Date().toISOString(),
          },
        },
      }
    }

    case 'REDEEM_REWARD': {
      const reward = state.rewards.available.find(r => r.id === action.rewardId)
      if (!reward || state.profile.currentPoints < reward.cost) return state
      return {
        ...state,
        profile: {
          ...state.profile,
          currentPoints: state.profile.currentPoints - reward.cost,
        },
        rewards: {
          ...state.rewards,
          redeemed: [
            ...state.rewards.redeemed,
            { rewardId: reward.id, redeemedAt: new Date().toISOString(), cost: reward.cost },
          ],
        },
      }
    }

    case 'ADD_REWARD':
      return {
        ...state,
        rewards: {
          ...state.rewards,
          available: [...state.rewards.available, { ...action.reward, id: uuid() }],
        },
      }

    case 'REMOVE_REWARD':
      return {
        ...state,
        rewards: {
          ...state.rewards,
          available: state.rewards.available.filter(r => r.id !== action.rewardId),
        },
      }

    case 'EDIT_REWARD':
      return {
        ...state,
        rewards: {
          ...state.rewards,
          available: state.rewards.available.map(r =>
            r.id === action.rewardId ? { ...r, ...action.updates } : r
          ),
        },
      }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      }

    case 'UNLOCK_BADGE':
      if (state.badges.some(b => b.id === action.badge.id)) return state
      return {
        ...state,
        badges: [...state.badges, action.badge],
      }

    default:
      return state
  }
}

interface AppContextValue {
  state: AppData
  dispatch: React.Dispatch<Action>
  currentWeekKey: string
  currentWeek: WeekData | null
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, loadData)
  const currentWeekKey = getWeekKey()
  const currentWeek = state.weeks[currentWeekKey] || null

  // Auto-save on every state change
  useEffect(() => {
    saveData(state)
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch, currentWeekKey, currentWeek }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
