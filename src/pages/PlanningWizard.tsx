import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getAllDays, formatDayFull, formatDayShort } from '../utils/dates'
import type { Category, DayOfWeek, Priority, Task } from '../types'
import { v4 as uuid } from 'uuid'
import { downloadICS } from '../utils/calendar'

interface WizardTask {
  id: string
  title: string
  category: Category
  days: DayOfWeek[]
  priority: Priority
  timeEstimate: number
}

const CATEGORIES: { value: Category; icon: string; label: string }[] = [
  { value: 'school', icon: '📐', label: 'School' },
  { value: 'activity', icon: '⚽', label: 'Activity' },
  { value: 'chore', icon: '🧹', label: 'Chore' },
]

export default function PlanningWizard() {
  const { state, dispatch, currentWeekKey, currentWeek } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [tasks, setTasks] = useState<WizardTask[]>(() => {
    // Pre-populate if editing existing week
    if (currentWeek) {
      return currentWeek.tasks.map(t => ({
        id: t.id,
        title: t.title,
        category: t.category,
        days: [...t.days],
        priority: t.priority,
        timeEstimate: t.timeEstimate,
      }))
    }
    return []
  })

  // Step 1 state
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<Category>('school')

  // Carry over from last week
  const weekKeys = Object.keys(state.weeks).sort().reverse()
  const lastWeekKey = weekKeys.find(k => k !== currentWeekKey)
  const lastWeek = lastWeekKey ? state.weeks[lastWeekKey] : null
  const incompleteTasks = lastWeek?.tasks.filter(t => !t.completed) || []

  function addTask() {
    if (!newTitle.trim()) return
    setTasks([...tasks, {
      id: uuid(),
      title: newTitle.trim(),
      category: newCategory,
      days: [],
      priority: 'medium',
      timeEstimate: 30,
    }])
    setNewTitle('')
  }

  function removeTask(id: string) {
    setTasks(tasks.filter(t => t.id !== id))
  }

  function updateTask(id: string, updates: Partial<WizardTask>) {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  function toggleDay(taskId: string, day: DayOfWeek) {
    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t
      const days = t.days.includes(day)
        ? t.days.filter(d => d !== day)
        : [...t.days, day]
      return { ...t, days }
    }))
  }

  function finalizePlan() {
    const finalTasks: Task[] = tasks.map(t => ({
      id: t.id,
      title: t.title,
      category: t.category,
      days: t.days.length > 0 ? t.days : ['monday'],
      priority: t.priority,
      timeEstimate: t.timeEstimate,
      completed: false,
      completedAt: null,
      pointsEarned: 0,
    }))
    dispatch({ type: 'CREATE_WEEK', weekKey: currentWeekKey, tasks: finalTasks })
    dispatch({ type: 'LOCK_PLAN', weekKey: currentWeekKey })
    navigate('/')
  }

  const tasksPerDay = getAllDays().map(day => ({
    day,
    count: tasks.filter(t => t.days.includes(day)).length,
  }))

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] px-4 py-4">
      {/* Header */}
      <div className="mx-auto max-w-lg">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-sm text-[var(--color-text-muted)]">
            ← Cancel
          </button>
          <h1 className="text-lg font-bold text-[var(--color-primary-light)]">Plan My Week</h1>
          <div className="w-16" />
        </div>

        {/* Progress bar */}
        <div className="mb-2 flex gap-1">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full ${
              s < step ? 'bg-[var(--color-success)]' :
              s === step ? 'bg-[var(--color-primary)]' :
              'bg-[var(--color-surface-light)]'
            }`} />
          ))}
        </div>
        <div className="mb-6 text-xs text-[var(--color-text-muted)]">
          Step {step} of 4: {
            step === 1 ? 'Add Tasks' :
            step === 2 ? 'Assign Days' :
            step === 3 ? 'Set Priorities' :
            'Review & Confirm'
          }
        </div>

        {/* Step 1: Add Tasks */}
        {step === 1 && (
          <div>
            {/* Quick add */}
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                placeholder="Add a task..."
                className="flex-1 rounded-lg border border-[var(--color-surface-light)] bg-[var(--color-surface)] p-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
              />
              <button
                onClick={addTask}
                className="rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white"
              >
                Add
              </button>
            </div>

            {/* Category selector */}
            <div className="mb-4 flex gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setNewCategory(c.value)}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                    newCategory === c.value
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {/* Carry over */}
            {incompleteTasks.length > 0 && (
              <div className="mb-4 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-surface)] p-3">
                <p className="mb-2 text-xs font-medium text-[var(--color-accent)]">
                  📋 {incompleteTasks.length} incomplete from last week
                </p>
                <button
                  onClick={() => {
                    const carryOver = incompleteTasks.map(t => ({
                      id: uuid(),
                      title: t.title,
                      category: t.category,
                      days: [] as DayOfWeek[],
                      priority: t.priority,
                      timeEstimate: t.timeEstimate,
                    }))
                    setTasks([...tasks, ...carryOver])
                  }}
                  className="text-xs font-medium text-[var(--color-accent)] hover:underline"
                >
                  Carry them over →
                </button>
              </div>
            )}

            {/* Task list */}
            <div className="flex flex-col gap-2">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 rounded-lg bg-[var(--color-surface)] p-2.5">
                  <span className="text-sm">
                    {CATEGORIES.find(c => c.value === task.category)?.icon} {task.title}
                  </span>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="ml-auto text-xs text-[var(--color-danger)]"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {tasks.length === 0 && (
              <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">Add your tasks for the week above</p>
            )}
          </div>
        )}

        {/* Step 2: Assign Days */}
        {step === 2 && (
          <div>
            {/* Balance indicator */}
            <div className="mb-4 flex gap-1">
              {tasksPerDay.map(({ day, count }) => (
                <div key={day} className="flex-1 text-center">
                  <div className="text-[10px] text-[var(--color-text-muted)]">{formatDayShort(day)}</div>
                  <div className={`text-xs font-bold ${
                    count > 5 ? 'text-[var(--color-danger)]' :
                    count > 3 ? 'text-[var(--color-accent)]' :
                    'text-[var(--color-success)]'
                  }`}>
                    {count}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {tasks.map(task => (
                <div key={task.id} className="rounded-lg bg-[var(--color-surface)] p-3">
                  <div className="mb-2 text-sm font-medium">
                    {CATEGORIES.find(c => c.value === task.category)?.icon} {task.title}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getAllDays().map(day => (
                      <button
                        key={day}
                        onClick={() => toggleDay(task.id, day)}
                        className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                          task.days.includes(day)
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--color-surface-light)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        {formatDayShort(day)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Set Priorities */}
        {step === 3 && (
          <div className="flex flex-col gap-3">
            {tasks.map(task => (
              <div key={task.id} className="rounded-lg bg-[var(--color-surface)] p-3">
                <div className="mb-2 text-sm font-medium">
                  {CATEGORIES.find(c => c.value === task.category)?.icon} {task.title}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {(['high', 'medium', 'low'] as Priority[]).map(p => (
                      <button
                        key={p}
                        onClick={() => updateTask(task.id, { priority: p })}
                        className={`rounded-full px-2.5 py-1 text-xs capitalize transition-colors ${
                          task.priority === p
                            ? p === 'high' ? 'bg-[var(--color-danger)] text-white' :
                              p === 'medium' ? 'bg-[var(--color-accent)] text-[var(--color-bg)]' :
                              'bg-[var(--color-success)] text-[var(--color-bg)]'
                            : 'bg-[var(--color-surface-light)] text-[var(--color-text-muted)]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <select
                    value={task.timeEstimate}
                    onChange={e => updateTask(task.id, { timeEstimate: Number(e.target.value) })}
                    className="rounded-lg bg-[var(--color-surface-light)] px-2 py-1 text-xs text-[var(--color-text)]"
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={60}>1 hr</option>
                    <option value={120}>2+ hr</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            {getAllDays().map(day => {
              const dayTasks = tasks.filter(t => t.days.includes(day))
              if (dayTasks.length === 0) return null
              const totalTime = dayTasks.reduce((sum, t) => sum + t.timeEstimate, 0)
              return (
                <div key={day} className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold">{formatDayFull(day)}</h3>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {dayTasks.length} tasks · ~{totalTime >= 60 ? `${Math.floor(totalTime/60)}h${totalTime%60 > 0 ? ` ${totalTime%60}m` : ''}` : `${totalTime}m`}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {dayTasks.map(task => (
                      <div key={task.id} className="flex items-center gap-2 rounded-lg bg-[var(--color-surface)] p-2.5 text-sm">
                        <span>{CATEGORIES.find(c => c.value === task.category)?.icon}</span>
                        <span className="flex-1">{task.title}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                          task.priority === 'high' ? 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]' :
                          task.priority === 'medium' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' :
                          'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {tasks.filter(t => t.days.length === 0).length > 0 && (
              <div className="mb-4 rounded-lg border border-[var(--color-accent)] bg-[var(--color-surface)] p-3">
                <p className="text-xs text-[var(--color-accent)]">
                  ⚠️ {tasks.filter(t => t.days.length === 0).length} tasks have no assigned day. They'll default to Monday.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
            className="rounded-lg bg-[var(--color-surface)] px-5 py-2.5 text-sm text-[var(--color-text-muted)]"
          >
            ← {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && tasks.length === 0}
              className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Next →
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => downloadICS(tasks as unknown as Task[], currentWeekKey, state.settings.reminderTime)}
                className="rounded-lg border border-[var(--color-accent)] px-3 py-2.5 text-xs text-[var(--color-accent)]"
              >
                📅 Export
              </button>
              <button
                onClick={finalizePlan}
                className="rounded-lg bg-[var(--color-success)] px-5 py-2.5 text-sm font-semibold text-[var(--color-bg)]"
              >
                Lock In My Plan ✓
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
