import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getTodayDayOfWeek, formatDayFull, getAllDays, formatDayShort, getWeekDates, getWeekKey } from '../utils/dates'
import { getPointsForTask } from '../utils/points'
import { useState } from 'react'
import type { DayOfWeek } from '../types'

const CAT_CLASSES: Record<string, string> = {
  school: 'cat-school',
  activity: 'cat-activity',
  chore: 'cat-chore',
}


export default function Planner() {
  const { state, dispatch, currentWeekKey, currentWeek } = useApp()
  const navigate = useNavigate()
  const today = getTodayDayOfWeek()
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(today)
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
  const weekDates = getWeekDates(currentWeekKey || getWeekKey())

  if (!currentWeek) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-primary-light)]">
          <span className="text-4xl">📋</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">No plan yet!</h2>
        <p className="text-base text-[var(--color-text-secondary)]">Start by planning your week</p>
        <button
          onClick={() => navigate('/plan')}
          className="rounded-2xl bg-[var(--color-primary)] px-8 py-4 text-lg font-semibold text-white"
        >
          Plan My Week
        </button>
      </div>
    )
  }

  const dayTasks = currentWeek.tasks.filter(t => t.days.includes(selectedDay))
  const completedCount = dayTasks.filter(t => t.completed).length
  const allDone = dayTasks.length > 0 && completedCount === dayTasks.length

  return (
    <div>
      {/* View toggle */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--color-text)]">{formatDayFull(selectedDay)}</h2>
        <button
          onClick={() => setViewMode(v => v === 'day' ? 'week' : 'day')}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] shadow-card"
        >
          {viewMode === 'day' ? 'Week View' : 'Day View'}
        </button>
      </div>

      {viewMode === 'week' ? (
        <div className="mb-5 grid grid-cols-7 gap-1.5">
          {getAllDays().map(day => {
            const tasks = currentWeek.tasks.filter(t => t.days.includes(day))
            const done = tasks.filter(t => t.completed).length
            const isToday = day === today
            const isSelected = day === selectedDay
            const dateStr = weekDates[day]
            const dateNum = dateStr ? new Date(dateStr + 'T00:00:00').getDate() : ''
            return (
              <button
                key={day}
                onClick={() => { setSelectedDay(day); setViewMode('day') }}
                className={`rounded-2xl p-2.5 text-center transition-all ${
                  isSelected ? 'bg-[var(--color-primary)] text-white shadow-md' :
                  isToday ? 'bg-white ring-2 ring-[var(--color-primary)] shadow-card' :
                  'bg-white shadow-card'
                }`}
              >
                <div className={`text-xs font-medium ${isSelected ? 'text-white/70' : 'text-[var(--color-text-tertiary)]'}`}>{formatDayShort(day)}</div>
                <div className={`text-base font-bold ${isSelected ? '' : 'text-[var(--color-text)]'}`}>{dateNum}</div>
                {tasks.length > 0 && (
                  <div className={`mt-0.5 text-xs ${
                    isSelected ? 'text-white/80' :
                    done === tasks.length ? 'text-[var(--color-success)]' : 'text-[var(--color-text-tertiary)]'
                  }`}>
                    {done === tasks.length ? '✓' : `${done}/${tasks.length}`}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      ) : (
        /* Day selector with dates */
        <div className="mb-5 flex justify-between gap-1">
          {getAllDays().map(day => {
            const isSelected = day === selectedDay
            const isToday = day === today
            const dateStr = weekDates[day]
            const dateNum = dateStr ? new Date(dateStr + 'T00:00:00').getDate() : ''
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-2 transition-all ${
                  isSelected
                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                    : isToday
                      ? 'bg-white text-[var(--color-primary)] shadow-card'
                      : 'text-[var(--color-text-tertiary)]'
                }`}
              >
                <span className={`text-xs font-medium ${isSelected ? 'text-white/70' : ''}`}>{formatDayShort(day)}</span>
                <span className={`text-base font-bold ${isSelected ? '' : isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>{dateNum}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* All done celebration */}
      {allDone && (
        <div className="mb-5 rounded-2xl bg-[var(--color-primary-light)] p-8 text-center shadow-card">
          <span className="text-6xl">🎉</span>
          <p className="mt-3 text-lg font-bold text-[var(--color-primary)]">All done for {formatDayFull(selectedDay)}!</p>
        </div>
      )}

      {/* Task list */}
      {dayTasks.length === 0 ? (
        <p className="py-12 text-center text-base text-[var(--color-text-tertiary)]">No tasks for {formatDayFull(selectedDay)}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {dayTasks.map(task => {
            const pts = getPointsForTask(task, state.settings.pointValues)
            return (
              <button
                key={task.id}
                onClick={() => {
                  if (task.completed) {
                    dispatch({ type: 'UNCOMPLETE_TASK', weekKey: currentWeekKey, taskId: task.id })
                  } else {
                    dispatch({ type: 'COMPLETE_TASK', weekKey: currentWeekKey, taskId: task.id })
                  }
                }}
                className={`flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-card transition-all ${
                  task.completed ? 'opacity-50' : 'hover:shadow-card-lg'
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm ${
                  task.completed
                    ? 'border-[var(--color-success)] bg-[var(--color-success)] text-white'
                    : 'border-[var(--color-border)]'
                }`}>
                  {task.completed && '✓'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-base font-semibold text-[var(--color-text)] ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${CAT_CLASSES[task.category] || ''}`}>
                      {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                    </span>
                    {task.priority === 'high' && (
                      <span className="rounded-full px-3 py-0.5 text-xs font-semibold pri-high">High</span>
                    )}
                    {task.timeEstimate > 0 && (
                      <span className="text-xs text-[var(--color-text-tertiary)]">{task.timeEstimate}min</span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-[var(--color-primary)]">
                  +{task.completed ? task.pointsEarned : pts}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Progress */}
      {dayTasks.length > 0 && (
        <div className="mt-5 text-center text-sm font-medium text-[var(--color-text-secondary)]">
          {completedCount} of {dayTasks.length} tasks done
        </div>
      )}
    </div>
  )
}
