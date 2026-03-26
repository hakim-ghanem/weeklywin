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
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <span className="text-4xl">🔒</span>
        <h2 className="text-lg font-bold">Parent Settings</h2>
        <p className="text-sm text-[var(--color-text-muted)]">Enter PIN to access settings</p>
        <input
          type="password"
          maxLength={4}
          value={pinInput}
          onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
          placeholder="4-digit PIN"
          className="w-32 rounded-lg border border-[var(--color-surface-light)] bg-[var(--color-surface)] p-3 text-center text-lg tracking-widest text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
        />
        <button
          onClick={() => {
            if (pinInput === state.settings.parentPin) {
              setUnlocked(true)
            }
          }}
          className="rounded-lg bg-[var(--color-primary)] px-6 py-2 text-sm font-semibold text-white"
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
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Settings</h2>

      {/* Profile */}
      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <h3 className="mb-2 text-sm font-bold">Profile</h3>
        <input
          type="text"
          value={state.profile.name}
          onChange={e => dispatch({ type: 'SET_NAME', name: e.target.value })}
          placeholder="Enter name"
          className="w-full rounded-lg border border-[var(--color-surface-light)] bg-[var(--color-bg)] p-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
        />
      </div>

      {/* Parent PIN */}
      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <h3 className="mb-2 text-sm font-bold">Parent PIN</h3>
        <input
          type="password"
          maxLength={4}
          value={state.settings.parentPin}
          onChange={e => dispatch({ type: 'SET_PIN', pin: e.target.value.replace(/\D/g, '') })}
          placeholder="Set 4-digit PIN"
          className="w-32 rounded-lg border border-[var(--color-surface-light)] bg-[var(--color-bg)] p-2 text-center text-sm tracking-widest text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
        />
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">Protects settings from being changed</p>
      </div>

      {/* Reward Shop Config */}
      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold">Reward Shop</h3>
          <button
            onClick={() => setShowNewReward(!showNewReward)}
            className="rounded-lg bg-[var(--color-primary)] px-3 py-1 text-xs text-white"
          >
            + Add
          </button>
        </div>

        {showNewReward && (
          <div className="mb-3 flex flex-wrap items-end gap-2 rounded-lg bg-[var(--color-bg)] p-3">
            <input
              type="text"
              value={newRewardEmoji}
              onChange={e => setNewRewardEmoji(e.target.value)}
              className="w-12 rounded border border-[var(--color-surface-light)] bg-[var(--color-surface)] p-1 text-center text-[var(--color-text)]"
            />
            <input
              type="text"
              value={newRewardName}
              onChange={e => setNewRewardName(e.target.value)}
              placeholder="Reward name"
              className="flex-1 rounded border border-[var(--color-surface-light)] bg-[var(--color-surface)] p-1 text-sm text-[var(--color-text)]"
            />
            <input
              type="number"
              value={newRewardCost}
              onChange={e => setNewRewardCost(Number(e.target.value))}
              className="w-20 rounded border border-[var(--color-surface-light)] bg-[var(--color-surface)] p-1 text-center text-sm text-[var(--color-text)]"
            />
            <button
              onClick={() => {
                if (newRewardName.trim()) {
                  dispatch({ type: 'ADD_REWARD', reward: { name: newRewardName, emoji: newRewardEmoji, cost: newRewardCost } })
                  setNewRewardName('')
                  setNewRewardEmoji('🎁')
                  setNewRewardCost(100)
                  setShowNewReward(false)
                }
              }}
              className="rounded bg-[var(--color-success)] px-3 py-1 text-xs font-medium text-[var(--color-bg)]"
            >
              Save
            </button>
          </div>
        )}

        {state.rewards.available.map(reward => (
          <div key={reward.id} className="flex items-center justify-between border-b border-[var(--color-surface-light)] py-2 last:border-0">
            <span className="text-sm">{reward.emoji} {reward.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-accent)]">{reward.cost} pts</span>
              <button
                onClick={() => dispatch({ type: 'REMOVE_REWARD', rewardId: reward.id })}
                className="text-xs text-[var(--color-danger)] hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Point Values */}
      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <h3 className="mb-2 text-sm font-bold">Point Values</h3>
        {Object.entries(state.settings.pointValues).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between py-1.5">
            <span className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            <input
              type="number"
              value={value}
              onChange={e => dispatch({
                type: 'UPDATE_SETTINGS',
                settings: { pointValues: { ...state.settings.pointValues, [key]: Number(e.target.value) } }
              })}
              className="w-16 rounded border border-[var(--color-surface-light)] bg-[var(--color-bg)] p-1 text-center text-xs text-[var(--color-text)]"
            />
          </div>
        ))}
      </div>

      {/* Calendar Export */}
      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <h3 className="mb-2 text-sm font-bold">Calendar Export</h3>
        <p className="mb-3 text-xs text-[var(--color-text-muted)]">
          Export this week's tasks to Apple Calendar for native reminders
        </p>
        <button
          onClick={() => {
            const weekKey = Object.keys(state.weeks).sort().reverse()[0]
            const week = weekKey ? state.weeks[weekKey] : null
            if (week) {
              downloadICS(week.tasks, weekKey, state.settings.reminderTime)
            }
          }}
          disabled={Object.keys(state.weeks).length === 0}
          className="w-full rounded-lg bg-[var(--color-accent)] py-2 text-sm font-semibold text-[var(--color-bg)] disabled:opacity-50"
        >
          Export to Calendar (.ics)
        </button>
      </div>

      {/* Data Export/Import */}
      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <h3 className="mb-2 text-sm font-bold">Data Sync</h3>
        <p className="mb-3 text-xs text-[var(--color-text-muted)]">
          Export your data to sync with another device via iCloud Drive
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => exportData(state)}
            className="flex-1 rounded-lg bg-[var(--color-primary)] py-2 text-sm font-semibold text-white"
          >
            Export Data
          </button>
          <button
            onClick={handleImport}
            className="flex-1 rounded-lg border border-[var(--color-primary)] py-2 text-sm font-semibold text-[var(--color-primary-light)]"
          >
            Import Data
          </button>
        </div>
      </div>
    </div>
  )
}
