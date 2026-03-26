import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Onboarding() {
  const { dispatch } = useApp()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')

  if (step === 1) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-[var(--color-bg)] px-8 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[var(--color-primary)]">
          <span className="text-5xl">🏆</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Welcome to WeeklyWin!</h1>
          <p className="mt-2 text-base text-[var(--color-text-secondary)]">
            Plan your week, crush your tasks, earn rewards.
          </p>
        </div>
        <div className="w-full max-w-xs">
          <label className="mb-2 block text-left text-sm font-medium text-[var(--color-text-secondary)]">What's your name?</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            autoFocus
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white p-4 text-center text-lg text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
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
          className="w-full max-w-xs rounded-2xl bg-[var(--color-primary)] px-8 py-4 text-lg font-semibold text-white disabled:opacity-40"
        >
          Get Started
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-[var(--color-bg)] px-8 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[var(--color-border)]">
        <span className="text-5xl">🔒</span>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Parent PIN</h1>
        <p className="mt-2 text-base text-[var(--color-text-secondary)]">
          Set a 4-digit PIN to protect settings and rewards.
        </p>
      </div>
      <input
        type="password"
        maxLength={4}
        value={pin}
        onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
        placeholder="····"
        autoFocus
        className="w-48 rounded-2xl border border-[var(--color-border)] bg-white p-4 text-center text-3xl tracking-[0.5em] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] placeholder:tracking-[0.5em] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
      />
      <div className="flex w-full max-w-xs gap-3">
        <button
          onClick={() => dispatch({ type: 'SET_PIN', pin: '' })}
          className="flex-1 rounded-2xl border border-[var(--color-border)] py-4 text-base font-medium text-[var(--color-text-secondary)]"
        >
          Skip
        </button>
        <button
          onClick={() => {
            if (pin.length === 4) dispatch({ type: 'SET_PIN', pin })
          }}
          disabled={pin.length !== 4}
          className="flex-1 rounded-2xl bg-[var(--color-primary)] py-4 text-base font-semibold text-white disabled:opacity-40"
        >
          Set PIN
        </button>
      </div>
    </div>
  )
}
