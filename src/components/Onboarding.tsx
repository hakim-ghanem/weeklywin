import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Onboarding() {
  const { dispatch } = useApp()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')

  if (step === 1) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <span className="text-6xl">🏆</span>
        <h1 className="text-2xl font-bold text-[var(--color-primary-light)]">Welcome to WeeklyWin!</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Plan your week, crush your tasks, and earn awesome rewards.
        </p>
        <div className="w-full max-w-xs">
          <label className="mb-1 block text-left text-xs text-[var(--color-text-muted)]">What's your name?</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            autoFocus
            className="w-full rounded-lg border border-[var(--color-surface-light)] bg-[var(--color-surface)] p-3 text-center text-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>
        <button
          onClick={() => {
            if (name.trim()) {
              dispatch({ type: 'SET_NAME', name: name.trim() })
              setStep(2)
            }
          }}
          disabled={!name.trim()}
          className="rounded-lg bg-[var(--color-primary)] px-8 py-3 font-semibold text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-6xl">🔒</span>
      <h1 className="text-2xl font-bold text-[var(--color-primary-light)]">Parent PIN Setup</h1>
      <p className="text-sm text-[var(--color-text-muted)]">
        Set a 4-digit PIN to protect settings and rewards configuration.
      </p>
      <div className="w-full max-w-xs">
        <input
          type="password"
          maxLength={4}
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
          placeholder="4-digit PIN"
          autoFocus
          className="w-full rounded-lg border border-[var(--color-surface-light)] bg-[var(--color-surface)] p-3 text-center text-2xl tracking-[0.5em] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] placeholder:tracking-normal placeholder:text-base focus:border-[var(--color-primary)] focus:outline-none"
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => {
            dispatch({ type: 'SET_PIN', pin: '' })
          }}
          className="rounded-lg border border-[var(--color-surface-light)] px-6 py-3 text-sm text-[var(--color-text-muted)]"
        >
          Skip
        </button>
        <button
          onClick={() => {
            if (pin.length === 4) {
              dispatch({ type: 'SET_PIN', pin })
            }
          }}
          disabled={pin.length !== 4}
          className="rounded-lg bg-[var(--color-primary)] px-8 py-3 font-semibold text-white disabled:opacity-50"
        >
          Set PIN
        </button>
      </div>
    </div>
  )
}
