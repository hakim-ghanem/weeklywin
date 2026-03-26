import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { getTodayKey, formatDate } from '../utils/dates'
import type { Mood } from '../types'

const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: 'great', emoji: '🤩', label: 'Great' },
  { value: 'good', emoji: '😊', label: 'Good' },
  { value: 'meh', emoji: '😐', label: 'Meh' },
  { value: 'frustrated', emoji: '😤', label: 'Frustrated' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
]

const PROMPTS = [
  'What was the hardest thing today and how did you handle it?',
  'What are you most proud of today?',
  'What do you want to do differently tomorrow?',
  'What made you smile today?',
  'What did you learn today that surprised you?',
  'If you could redo one thing today, what would it be?',
  'Who helped you today, and how?',
  'What are you looking forward to tomorrow?',
  'Describe your day in three words.',
  'What was the best part of your day?',
]

function getDailyPrompt(dateStr: string): string {
  // Deterministic prompt based on date
  const hash = dateStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return PROMPTS[hash % PROMPTS.length]
}

export default function Journal() {
  const { state, dispatch } = useApp()
  const todayKey = getTodayKey()
  const todayEntry = state.journal[todayKey]
  const prompt = todayEntry?.prompt || getDailyPrompt(todayKey)

  const [mood, setMood] = useState<Mood | null>(todayEntry?.mood || null)
  const [text, setText] = useState(todayEntry?.text || '')
  const [saved, setSaved] = useState(false)

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mood !== null || text.trim()) {
        dispatch({ type: 'SAVE_JOURNAL', date: todayKey, mood, text, prompt })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [mood, text])

  // Past entries (last 7 days)
  const pastDates = Object.keys(state.journal)
    .filter(d => d !== todayKey)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 7)

  // Mood trend (last 7 days)
  const last7Days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    last7Days.push(d.toISOString().split('T')[0])
  }

  return (
    <div>
      {/* Mood trend */}
      <div className="mb-4 flex items-center justify-center gap-2">
        {last7Days.map(dateStr => {
          const entry = state.journal[dateStr]
          const moodEmoji = entry?.mood ? MOODS.find(m => m.value === entry.mood)?.emoji : '·'
          const isToday = dateStr === todayKey
          return (
            <div key={dateStr} className={`text-center ${isToday ? 'scale-125' : 'opacity-60'}`}>
              <span className="text-lg">{moodEmoji}</span>
            </div>
          )
        })}
      </div>

      {/* Today's entry */}
      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <h2 className="mb-3 text-sm font-bold">Today's Journal</h2>

        {/* Mood selector */}
        <div className="mb-4">
          <p className="mb-2 text-xs text-[var(--color-primary-light)]">How are you feeling today?</p>
          <div className="flex gap-3">
            {MOODS.map(m => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`flex flex-col items-center gap-0.5 text-2xl transition-all ${
                  mood === m.value ? 'scale-110' : 'opacity-40 hover:opacity-70'
                }`}
              >
                <span>{m.emoji}</span>
                <span className="text-[10px] text-[var(--color-text-muted)]">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <p className="mb-2 text-xs text-[var(--color-primary-light)]">💡 {prompt}</p>

        {/* Text area */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write about your day..."
          className="w-full resize-none rounded-lg border border-[var(--color-surface-light)] bg-[var(--color-bg)] p-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
          rows={5}
        />

        {/* Save status */}
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={`text-[var(--color-text-muted)] transition-opacity ${saved ? 'opacity-100' : 'opacity-0'}`}>
            Saved ✓
          </span>
          {mood !== null && text.trim() && (
            <span className="text-[var(--color-accent)]">+{state.settings.pointValues.journal} pts for journaling ✨</span>
          )}
        </div>
      </div>

      {/* Past entries */}
      {pastDates.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-bold text-[var(--color-text-muted)]">Past Entries</h3>
          <div className="flex flex-col gap-2">
            {pastDates.map(dateStr => {
              const entry = state.journal[dateStr]
              const moodInfo = MOODS.find(m => m.value === entry.mood)
              return (
                <div key={dateStr} className="rounded-xl bg-[var(--color-surface)] p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium">{formatDate(dateStr)}</span>
                    {moodInfo && <span>{moodInfo.emoji}</span>}
                  </div>
                  {entry.text && (
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{entry.text}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
