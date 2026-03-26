import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { exportData, importData } from '../utils/storage'
import { downloadICS } from '../utils/calendar'

export default function Settings() {
  const { state, dispatch } = useApp()
  const [pinInput, setPinInput] = useState('')
  const [unlocked, setUnlocked] = useState(!state.settings.parentPin)
  const [showNewReward, setShowNewReward] = useState(false)
  const [newRewardName, setNewRewardName] = useState('')
  const [newRewardEmoji, setNewRewardEmoji] = useState('🎁')
  const [newRewardCost, setNewRewardCost] = useState(100)

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-bg)]">
          <span className="text-4xl">🔒</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Parent Settings</h2>
        <p className="text-base text-[var(--color-text-secondary)]">Enter PIN to access</p>
        <input
          type="password"
          maxLength={4}
          value={pinInput}
          onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
          placeholder="····"
          className="w-40 rounded-2xl border border-[var(--color-border)] bg-white p-4 text-center text-2xl tracking-widest text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
        <button
          onClick={() => { if (pinInput === state.settings.parentPin) setUnlocked(true) }}
          className="rounded-2xl bg-[var(--color-primary)] px-8 py-3 text-base font-semibold text-white"
        >
          Unlock
        </button>
      </div>
    )
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const data = await importData(file)
        dispatch({ type: 'SET_DATA', data })
      } catch (err) {
        alert('Failed to import: invalid file')
      }
    }
    input.click()
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-bold text-[var(--color-text)]">Settings</h2>

      <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]">
        <h3 className="mb-3 text-base font-bold text-[var(--color-text)]">Profile</h3>
        <input
          type="text"
          value={state.profile.name}
          onChange={e => dispatch({ type: 'SET_NAME', name: e.target.value })}
          placeholder="Enter name"
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-base text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]">
        <h3 className="mb-3 text-base font-bold text-[var(--color-text)]">Parent PIN</h3>
        <input
          type="password"
          maxLength={4}
          value={state.settings.parentPin}
          onChange={e => dispatch({ type: 'SET_PIN', pin: e.target.value.replace(/\D/g, '') })}
          placeholder="Set 4-digit PIN"
          className="w-40 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center text-lg tracking-widest text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
        />
        <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">Protects settings from changes</p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--color-text)]">Reward Shop</h3>
          <button onClick={() => setShowNewReward(!showNewReward)} className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white">+ Add</button>
        </div>
        {showNewReward && (
          <div className="mb-4 flex flex-wrap items-end gap-2 rounded-xl bg-[var(--color-bg)] p-4">
            <input type="text" value={newRewardEmoji} onChange={e => setNewRewardEmoji(e.target.value)} className="w-14 rounded-lg border border-[var(--color-border)] bg-white p-2 text-center text-lg" />
            <input type="text" value={newRewardName} onChange={e => setNewRewardName(e.target.value)} placeholder="Name" className="flex-1 rounded-lg border border-[var(--color-border)] bg-white p-2 text-base" />
            <input type="number" value={newRewardCost} onChange={e => setNewRewardCost(Number(e.target.value))} className="w-24 rounded-lg border border-[var(--color-border)] bg-white p-2 text-center text-base" />
            <button onClick={() => {
              if (newRewardName.trim()) {
                dispatch({ type: 'ADD_REWARD', reward: { name: newRewardName, emoji: newRewardEmoji, cost: newRewardCost } })
                setNewRewardName(''); setNewRewardEmoji('🎁'); setNewRewardCost(100); setShowNewReward(false)
              }
            }} className="rounded-lg bg-[var(--color-success)] px-4 py-2 text-sm font-medium text-white">Save</button>
          </div>
        )}
        {state.rewards.available.map(reward => (
          <div key={reward.id} className="flex items-center justify-between border-b border-[var(--color-border)] py-3 last:border-0">
            <span className="text-base text-[var(--color-text)]">{reward.emoji} {reward.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--color-primary)]">{reward.cost} pts</span>
              <button onClick={() => dispatch({ type: 'REMOVE_REWARD', rewardId: reward.id })} className="text-sm text-[var(--color-danger)]">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]">
        <h3 className="mb-3 text-base font-bold text-[var(--color-text)]">Point Values</h3>
        {Object.entries(state.settings.pointValues).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between py-2.5">
            <span className="text-sm capitalize text-[var(--color-text-secondary)]">{key.replace(/([A-Z])/g, ' $1')}</span>
            <input type="number" value={value} onChange={e => dispatch({
              type: 'UPDATE_SETTINGS', settings: { pointValues: { ...state.settings.pointValues, [key]: Number(e.target.value) } }
            })} className="w-20 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-center text-sm text-[var(--color-text)]" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]">
        <h3 className="mb-3 text-base font-bold text-[var(--color-text)]">Calendar Export</h3>
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">Export tasks to Apple Calendar for reminders</p>
        <button
          onClick={() => {
            const weekKey = Object.keys(state.weeks).sort().reverse()[0]
            const week = weekKey ? state.weeks[weekKey] : null
            if (week) downloadICS(week.tasks, weekKey, state.settings.reminderTime)
          }}
          disabled={Object.keys(state.weeks).length === 0}
          className="w-full rounded-xl bg-[var(--color-accent)] py-3 text-base font-semibold text-white disabled:opacity-40"
        >
          Export to Calendar
        </button>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]">
        <h3 className="mb-3 text-base font-bold text-[var(--color-text)]">Data Sync</h3>
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">Sync between devices via iCloud Drive</p>
        <div className="flex gap-3">
          <button onClick={() => exportData(state)} className="flex-1 rounded-xl bg-[var(--color-primary)] py-3 text-base font-semibold text-white">Export</button>
          <button onClick={handleImport} className="flex-1 rounded-xl border-2 border-[var(--color-primary)] py-3 text-base font-semibold text-[var(--color-primary)]">Import</button>
        </div>
      </div>
    </div>
  )
}
