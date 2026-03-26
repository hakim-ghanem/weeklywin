import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getTodayDayOfWeek, formatDayFull, getAllDays, formatDayShort } from '../utils/dates'
import { getPointsForTask } from '../utils/points'
import { useState } from 'react'
import type { DayOfWeek } from '../types'

const CATEGORY_ICONS: Record<string, string> = {
  school: '📐',
  activity: '⚽',
  chore: '🧹',
}

export default function Planner() {
  const { state, dispatch, currentWeekKey, currentWeek } = useApp()
  const navigate = useNavigate()
  const today = getTodayDayOfWeek()
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(today)
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')

  if (!currentWeek) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <span className="text-5xl">📋</span>
        <h2 className="text-xl font-bold">No plan for this week yet!</h2>
        <p className="text-sm text-[var(--color-text-muted)]">Start by planning your week</p>
        <button
          onClick={() => navigate('/plan')}
          className="rounded-lg bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition-colors hover:bg-[var(--color-primary-light)]"
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
        <h2 className="text-lg font-bold">{formatDayFull(selectedDay)}</h2>
        <button
          onClick={() => setViewMode(v => v === 'day' ? 'week' : 'day')}
          className="rounded-lg bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          {viewMode === 'day' ? 'Week View' : 'Day View'}
        </button>
      </div>

      {viewMode === 'week' ? (
        /* Week grid */
        <div className="mb-4 grid grid-cols-7 gap-1">
          {getAllDays().map(day => {
            const tasks = currentWeek.tasks.filter(t => t.days.includes(day))
            const done = tasks.filter(t => t.completed).length
            const isToday = day === today
            const isSelected = day === selectedDay
            return (
              <button
                key={day}
                onClick={() => { setSelectedDay(day); setViewMode('day') }}
                className={`rounded-lg p-2 text-center text-xs transition-colors ${
                  isSelected ? 'bg-[var(--color-primary)] text-white' :
                  isToday ? 'bg-[var(--color-surface-light)] ring-1 ring-[var(--color-primary)]' :
                  'bg-[var(--color-surface)] hover:bg-[var(--color-surface-light)]'
                }`}
              >
                <div className="font-bold">{formatDayShort(day)}</div>
                {tasks.length > 0 ? (
                  <div className={done === tasks.length ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'}>
                    {done === tasks.length ? '✓' : `${done}/${tasks.length}`}
                  </div>
                ) : (
                  <div className="text-[var(--color-text-muted)]">-</div>
                )}
              </button>
            )
          })}
        </div>
      ) : null}

      {/* Day navigation */}
      {viewMode === 'day' && (
        <div className="mb-4 flex justify-center gap-1">
          {getAllDays().map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                day === selectedDay
                  ? 'bg-[var(--color-primary)] text-white'
                  : day === today
                    ? 'bg-[var(--color-surface-light)] text-[var(--color-primary-light)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {formatDayShort(day)}
            </button>
          ))}
        </div>
      )}

      {/* All done celebration */}
      {allDone && (
        <div className="mb-4 rounded-xl bg-[var(--color-surface)] p-6 text-center">
          <span className="text-4xl">🎉</span>
          <p className="mt-2 font-bold text-[var(--color-success)]">All done for {formatDayFull(selectedDay)}!</p>
        </div>
      )}

      {/* Task list */}
      {dayTasks.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">No tasks for {formatDayFull(selectedDay)}</p>
      ) : (
        <div className="flex flex-col gap-2">
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
                className={`flex items-center gap-3 rounded-xl p-3 text-left transition-all ${
                  task.completed
                    ? 'bg-[var(--color-surface)] opacity-60'
                    : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-light)]'
                }`}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs ${
                  task.completed
                    ? 'border-[var(--color-success)] bg-[var(--color-success)] text-[var(--color-bg)]'
                    : 'border-[var(--color-text-muted)]'
                }`}>
                  {task.completed && '✓'}
                </span>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${task.completed ? 'line-through' : ''}`}>
                    {CATEGORY_ICONS[task.category] || '📌'} {task.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <span className="capitalize">{task.category}</span>
                    {task.priority === 'high' && <span className="text-[var(--color-danger)]">High</span>}
                    {task.timeEstimate > 0 && <span>{task.timeEstimate}min</span>}
                  </div>
                </div>
                <span className="text-xs font-medium text-[var(--color-accent)]">
                  {task.completed ? `+${task.pointsEarned}` : `+${pts}`}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Progress */}
      {dayTasks.length > 0 && (
        <div className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
          {completedCount} of {dayTasks.length} tasks done
        </div>
      )}
    </div>
  )
}
