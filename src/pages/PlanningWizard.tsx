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

const CATEGORIES: { value: Category; icon: string; label: string; cls: string }[] = [
  { value: 'school', icon: '📐', label: 'School', cls: 'cat-school' },
  { value: 'activity', icon: '⚽', label: 'Activity', cls: 'cat-activity' },
  { value: 'chore', icon: '🧹', label: 'Chore', cls: 'cat-chore' },
]

const PRI_CLASSES: Record<string, string> = { high: 'pri-high', medium: 'pri-medium', low: 'pri-low' }

export default function PlanningWizard() {
  const { state, dispatch, currentWeekKey, currentWeek } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [tasks, setTasks] = useState<WizardTask[]>(() => {
    if (currentWeek) return currentWeek.tasks.map(t => ({ id: t.id, title: t.title, category: t.category, days: [...t.days], priority: t.priority, timeEstimate: t.timeEstimate }))
    return []
  })
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<Category>('school')

  const weekKeys = Object.keys(state.weeks).sort().reverse()
  const lastWeekKey = weekKeys.find(k => k !== currentWeekKey)
  const lastWeek = lastWeekKey ? state.weeks[lastWeekKey] : null
  const incompleteTasks = lastWeek?.tasks.filter(t => !t.completed) || []

  function addTask() {
    if (!newTitle.trim()) return
    setTasks([...tasks, { id: uuid(), title: newTitle.trim(), category: newCategory, days: [], priority: 'medium', timeEstimate: 30 }])
    setNewTitle('')
  }
  function removeTask(id: string) { setTasks(tasks.filter(t => t.id !== id)) }
  function updateTask(id: string, updates: Partial<WizardTask>) { setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t)) }
  function toggleDay(taskId: string, day: DayOfWeek) {
    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t
      const days = t.days.includes(day) ? t.days.filter(d => d !== day) : [...t.days, day]
      return { ...t, days }
    }))
  }
  function finalizePlan() {
    const finalTasks: Task[] = tasks.map(t => ({ ...t, days: t.days.length > 0 ? t.days : ['monday'], completed: false, completedAt: null, pointsEarned: 0 }))
    dispatch({ type: 'CREATE_WEEK', weekKey: currentWeekKey, tasks: finalTasks })
    dispatch({ type: 'LOCK_PLAN', weekKey: currentWeekKey })
    navigate('/')
  }

  const tasksPerDay = getAllDays().map(day => ({ day, count: tasks.filter(t => t.days.includes(day)).length }))

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] px-5 py-5">
      <div className="mx-auto max-w-lg">
        <div className="mb-5 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-base font-medium text-[var(--color-text-secondary)]">← Cancel</button>
          <h1 className="text-xl font-bold text-[var(--color-text)]">Plan My Week</h1>
          <div className="w-16" />
        </div>

        <div className="mb-2 flex gap-1.5">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-2 flex-1 rounded-full ${s < step ? 'bg-[var(--color-success)]' : s === step ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
          ))}
        </div>
        <div className="mb-6 text-sm text-[var(--color-text-secondary)]">
          Step {step}/4: {step === 1 ? 'Add Tasks' : step === 2 ? 'Assign Days' : step === 3 ? 'Set Priorities' : 'Review & Confirm'}
        </div>

        {step === 1 && (
          <div>
            <div className="mb-5 flex gap-2">
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="Add a task..."
                className="flex-1 rounded-2xl border border-[var(--color-border)] bg-white p-3.5 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" />
              <button onClick={addTask} className="rounded-2xl bg-[var(--color-primary)] px-5 text-base font-semibold text-white">Add</button>
            </div>
            <div className="mb-5 flex gap-2">
              {CATEGORIES.map(c => (
                <button key={c.value} onClick={() => setNewCategory(c.value)}
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${newCategory === c.value ? 'bg-[var(--color-primary)] text-white shadow-md' : 'bg-white text-[var(--color-text-secondary)] shadow-[var(--shadow-card)]'}`}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
            {incompleteTasks.length > 0 && (
              <div className="mb-5 rounded-2xl border border-[var(--color-accent)]/30 bg-amber-50 p-4">
                <p className="mb-2 text-sm font-medium text-[var(--color-accent)]">📋 {incompleteTasks.length} incomplete from last week</p>
                <button onClick={() => {
                  const co = incompleteTasks.map(t => ({ id: uuid(), title: t.title, category: t.category, days: [] as DayOfWeek[], priority: t.priority, timeEstimate: t.timeEstimate }))
                  setTasks([...tasks, ...co])
                }} className="text-sm font-semibold text-[var(--color-accent)]">Carry them over →</button>
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-card)]">
                  <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${CATEGORIES.find(c => c.value === task.category)?.cls}`}>
                    {CATEGORIES.find(c => c.value === task.category)?.icon}
                  </span>
                  <span className="flex-1 text-base font-medium text-[var(--color-text)]">{task.title}</span>
                  <button onClick={() => removeTask(task.id)} className="text-lg text-[var(--color-danger)]">✕</button>
                </div>
              ))}
            </div>
            {tasks.length === 0 && <p className="py-12 text-center text-base text-[var(--color-text-tertiary)]">Add your tasks above</p>}
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-5 flex gap-1">
              {tasksPerDay.map(({ day, count }) => (
                <div key={day} className="flex-1 text-center">
                  <div className="text-xs text-[var(--color-text-tertiary)]">{formatDayShort(day)}</div>
                  <div className={`text-sm font-bold ${count > 5 ? 'text-[var(--color-danger)]' : count > 3 ? 'text-[var(--color-accent)]' : 'text-[var(--color-success)]'}`}>{count}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {tasks.map(task => (
                <div key={task.id} className="rounded-2xl bg-white p-4 shadow-[var(--shadow-card)]">
                  <div className="mb-3 text-base font-semibold text-[var(--color-text)]">{task.title}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {getAllDays().map(day => (
                      <button key={day} onClick={() => toggleDay(task.id, day)}
                        className={`min-h-[40px] rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${task.days.includes(day) ? 'bg-[var(--color-primary)] text-white shadow-md' : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)]'}`}>
                        {formatDayShort(day)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-3">
            {tasks.map(task => (
              <div key={task.id} className="rounded-2xl bg-white p-4 shadow-[var(--shadow-card)]">
                <div className="mb-3 text-base font-semibold text-[var(--color-text)]">{task.title}</div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {(['high', 'medium', 'low'] as Priority[]).map(p => (
                      <button key={p} onClick={() => updateTask(task.id, { priority: p })}
                        className={`rounded-xl px-3.5 py-2 text-sm font-semibold capitalize transition-all ${task.priority === p ? PRI_CLASSES[p] + ' shadow-md' : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)]'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                  <select value={task.timeEstimate} onChange={e => updateTask(task.id, { timeEstimate: Number(e.target.value) })}
                    className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)]">
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

        {step === 4 && (
          <div>
            {getAllDays().map(day => {
              const dayTasks = tasks.filter(t => t.days.includes(day))
              if (dayTasks.length === 0) return null
              const totalTime = dayTasks.reduce((s, t) => s + t.timeEstimate, 0)
              return (
                <div key={day} className="mb-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-base font-bold text-[var(--color-text)]">{formatDayFull(day)}</h3>
                    <span className="text-sm text-[var(--color-text-secondary)]">{dayTasks.length} tasks · ~{totalTime >= 60 ? `${Math.floor(totalTime/60)}h${totalTime%60 > 0 ? ` ${totalTime%60}m` : ''}` : `${totalTime}m`}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {dayTasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 text-base shadow-[var(--shadow-card)]">
                        <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${CATEGORIES.find(c => c.value === task.category)?.cls}`}>{CATEGORIES.find(c => c.value === task.category)?.icon}</span>
                        <span className="flex-1 font-medium">{task.title}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRI_CLASSES[task.priority]}`}>{task.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {tasks.filter(t => t.days.length === 0).length > 0 && (
              <div className="mb-5 rounded-2xl border border-[var(--color-accent)] bg-amber-50 p-4">
                <p className="text-sm text-[var(--color-accent)]">⚠️ {tasks.filter(t => t.days.length === 0).length} tasks have no day assigned — they'll default to Monday.</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} className="rounded-2xl bg-white px-6 py-3 text-base font-medium text-[var(--color-text-secondary)] shadow-[var(--shadow-card)]">
            ← {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} disabled={step === 1 && tasks.length === 0}
              className="rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-base font-semibold text-white disabled:opacity-40">Next →</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => downloadICS(tasks as unknown as Task[], currentWeekKey, state.settings.reminderTime)}
                className="rounded-2xl border-2 border-[var(--color-accent)] px-4 py-3 text-sm font-medium text-[var(--color-accent)]">📅</button>
              <button onClick={finalizePlan} className="rounded-2xl bg-[var(--color-success)] px-6 py-3 text-base font-semibold text-white">Lock In ✓</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
