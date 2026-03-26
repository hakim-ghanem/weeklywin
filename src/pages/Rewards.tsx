import { useApp } from '../context/AppContext'
import { getLevelForPoints, getNextLevel } from '../utils/points'

const BADGE_DEFS = [
  { id: 'bookworm', name: 'Bookworm', emoji: '📚', description: 'Complete 10 school tasks' },
  { id: 'journalist', name: 'Journalist', emoji: '✍️', description: 'Write 7 journal entries' },
  { id: 'iron-streak', name: 'Iron Streak', emoji: '🔥', description: '7-day completion streak' },
  { id: 'weekend-warrior', name: 'Weekend Warrior', emoji: '🗓️', description: 'Complete 3 weekly plans' },
  { id: 'chore-champion', name: 'Chore Champion', emoji: '🧹', description: 'Complete 20 chores' },
  { id: 'secret-1', name: '???', emoji: '🏅', description: 'Hidden badge' },
]

export default function Rewards() {
  const { state, dispatch } = useApp()
  const level = getLevelForPoints(state.profile.totalPoints)
  const next = getNextLevel(level.level)
  const progress = next
    ? ((state.profile.totalPoints - level.threshold) / (next.threshold - level.threshold)) * 100
    : 100

  return (
    <div className="flex flex-col gap-6">
      {/* Level & Points */}
      <div className="rounded-2xl bg-[var(--color-surface)] p-5">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">⭐</span>
          <div className="flex-1">
            <div className="text-lg font-bold text-[var(--color-accent)]">Level {level.level} — {level.name}</div>
            <div className="mt-2 h-4 rounded-full bg-[var(--color-surface-light)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-orange-500 transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="mt-1 text-sm text-[var(--color-text-muted)]">
              {next ? `${state.profile.totalPoints} / ${next.threshold} pts to Level ${next.level}` : 'Max level reached!'}
            </div>
          </div>
        </div>
        <div className="flex justify-around text-center">
          <div>
            <div className="text-2xl font-bold text-[var(--color-accent)]">{state.profile.totalPoints}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Total XP</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--color-success)]">{state.profile.currentPoints}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Spendable</div>
          </div>
        </div>
      </div>

      {/* Streaks */}
      <div className="rounded-2xl bg-[var(--color-surface)] p-5">
        <h3 className="mb-3 text-lg font-bold">Streaks</h3>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl">🔥</span>
          <span className="text-4xl font-bold">{state.profile.streakDays}</span>
          <span className="text-base text-[var(--color-text-muted)]">day streak</span>
        </div>
        <div className="mt-3 flex justify-center gap-5 text-sm text-[var(--color-text-muted)]">
          <span className={state.profile.streakDays >= 3 ? 'text-[var(--color-accent)]' : ''}>3 days</span>
          <span className={state.profile.streakDays >= 7 ? 'text-[var(--color-accent)]' : ''}>7 days</span>
          <span className={state.profile.streakDays >= 14 ? 'text-[var(--color-accent)]' : ''}>14 days</span>
          <span className={state.profile.streakDays >= 30 ? 'text-[var(--color-accent)]' : ''}>30 days</span>
        </div>
      </div>

      {/* Badges */}
      <div className="rounded-2xl bg-[var(--color-surface)] p-5">
        <h3 className="mb-4 text-lg font-bold">Badges</h3>
        <div className="grid grid-cols-3 gap-3">
          {BADGE_DEFS.map(def => {
            const earned = state.badges.find(b => b.id === def.id)
            return (
              <div
                key={def.id}
                className={`flex flex-col items-center gap-1.5 rounded-xl p-4 text-center ${
                  earned ? 'bg-[var(--color-surface-light)]' : 'opacity-30'
                }`}
              >
                <span className="text-3xl">{earned ? def.emoji : '🏅'}</span>
                <span className="text-sm font-medium">{earned ? def.name : '???'}</span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {earned ? 'Earned!' : def.id.startsWith('secret') ? 'Hidden' : def.description}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reward Shop */}
      <div className="rounded-2xl bg-[var(--color-surface)] p-5">
        <h3 className="mb-4 text-lg font-bold">Reward Shop</h3>
        <div className="grid grid-cols-2 gap-3">
          {state.rewards.available.map(reward => {
            const canAfford = state.profile.currentPoints >= reward.cost
            return (
              <button
                key={reward.id}
                onClick={() => {
                  if (canAfford) {
                    dispatch({ type: 'REDEEM_REWARD', rewardId: reward.id })
                  }
                }}
                disabled={!canAfford}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-all ${
                  canAfford
                    ? 'border-[var(--color-primary)] hover:bg-[var(--color-surface-light)]'
                    : 'border-[var(--color-surface-light)] opacity-50'
                }`}
              >
                <span className="text-3xl">{reward.emoji}</span>
                <span className="text-sm font-medium">{reward.name}</span>
                <span className={`text-sm font-bold ${canAfford ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
                  {reward.cost} pts
                </span>
              </button>
            )
          })}
        </div>

        {state.rewards.redeemed.length > 0 && (
          <div className="mt-5 border-t border-[var(--color-surface-light)] pt-4">
            <h4 className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">Recently Redeemed</h4>
            {state.rewards.redeemed.slice(-3).reverse().map((r, i) => {
              const reward = state.rewards.available.find(a => a.id === r.rewardId)
              return (
                <div key={i} className="flex items-center justify-between py-2 text-sm">
                  <span>{reward?.emoji} {reward?.name}</span>
                  <span className="text-[var(--color-text-muted)]">{new Date(r.redeemedAt).toLocaleDateString()}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
