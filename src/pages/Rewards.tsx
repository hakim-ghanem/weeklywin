import { useApp } from '../context/AppContext'
import { getLevelForPoints, getNextLevel, LEVELS } from '../utils/points'

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
      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">⭐</span>
          <div className="flex-1">
            <div className="font-bold text-[var(--color-accent)]">Level {level.level} — {level.name}</div>
            <div className="mt-1 h-3 rounded-full bg-[var(--color-surface-light)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-orange-500 transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-[var(--color-text-muted)]">
              {next ? `${state.profile.totalPoints} / ${next.threshold} pts to Level ${next.level}` : 'Max level reached!'}
            </div>
          </div>
        </div>
        <div className="flex justify-around text-center text-sm">
          <div>
            <div className="font-bold text-[var(--color-accent)]">{state.profile.totalPoints}</div>
            <div className="text-xs text-[var(--color-text-muted)]">Total XP</div>
          </div>
          <div>
            <div className="font-bold text-[var(--color-success)]">{state.profile.currentPoints}</div>
            <div className="text-xs text-[var(--color-text-muted)]">Spendable</div>
          </div>
        </div>
      </div>

      {/* Streaks */}
      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <h3 className="mb-2 text-sm font-bold">Streaks</h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">🔥</span>
          <span className="text-2xl font-bold">{state.profile.streakDays}</span>
          <span className="text-sm text-[var(--color-text-muted)]">day streak</span>
        </div>
        <div className="mt-2 flex justify-center gap-4 text-xs text-[var(--color-text-muted)]">
          <span className={state.profile.streakDays >= 3 ? 'text-[var(--color-accent)]' : ''}>3 days</span>
          <span className={state.profile.streakDays >= 7 ? 'text-[var(--color-accent)]' : ''}>7 days</span>
          <span className={state.profile.streakDays >= 14 ? 'text-[var(--color-accent)]' : ''}>14 days</span>
          <span className={state.profile.streakDays >= 30 ? 'text-[var(--color-accent)]' : ''}>30 days</span>
        </div>
      </div>

      {/* Badges */}
      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <h3 className="mb-3 text-sm font-bold">Badges</h3>
        <div className="grid grid-cols-3 gap-3">
          {BADGE_DEFS.map(def => {
            const earned = state.badges.find(b => b.id === def.id)
            return (
              <div
                key={def.id}
                className={`flex flex-col items-center gap-1 rounded-lg p-3 text-center ${
                  earned ? 'bg-[var(--color-surface-light)]' : 'opacity-30'
                }`}
              >
                <span className="text-2xl">{earned ? def.emoji : '🏅'}</span>
                <span className="text-xs font-medium">{earned ? def.name : '???'}</span>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {earned ? 'Earned!' : def.id.startsWith('secret') ? 'Hidden' : def.description}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reward Shop */}
      <div className="rounded-xl bg-[var(--color-surface)] p-4">
        <h3 className="mb-3 text-sm font-bold">Reward Shop</h3>
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
                className={`flex flex-col items-center gap-1 rounded-xl border p-4 text-center transition-all ${
                  canAfford
                    ? 'border-[var(--color-primary)] hover:bg-[var(--color-surface-light)]'
                    : 'border-[var(--color-surface-light)] opacity-50'
                }`}
              >
                <span className="text-2xl">{reward.emoji}</span>
                <span className="text-xs font-medium">{reward.name}</span>
                <span className={`text-xs font-bold ${canAfford ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
                  {reward.cost} pts
                </span>
              </button>
            )
          })}
        </div>

        {/* Redeemed history */}
        {state.rewards.redeemed.length > 0 && (
          <div className="mt-4 border-t border-[var(--color-surface-light)] pt-3">
            <h4 className="mb-2 text-xs font-medium text-[var(--color-text-muted)]">Recently Redeemed</h4>
            {state.rewards.redeemed.slice(-3).reverse().map((r, i) => {
              const reward = state.rewards.available.find(a => a.id === r.rewardId)
              return (
                <div key={i} className="flex items-center justify-between py-1 text-xs">
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
