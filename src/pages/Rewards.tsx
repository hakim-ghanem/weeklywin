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
    <div className="flex flex-col gap-5">
      {/* Level & Points */}
      <div className="rounded-2xl bg-white p-5 shadow-card">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-light)]">
            <span className="text-3xl">⭐</span>
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-[var(--color-text)]">Level {level.level}</div>
            <div className="text-sm text-[var(--color-primary)]">{level.name}</div>
          </div>
        </div>
        <div className="h-3 rounded-full bg-[var(--color-border)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">
          {next ? `${state.profile.totalPoints} / ${next.threshold} pts to Level ${next.level}` : 'Max level reached!'}
        </div>
        <div className="mt-4 flex gap-3">
          <div className="flex-1 rounded-xl bg-[var(--color-primary-light)] p-3 text-center">
            <div className="text-2xl font-bold text-[var(--color-primary)]">{state.profile.totalPoints}</div>
            <div className="text-xs font-medium text-[var(--color-primary)]">Total XP</div>
          </div>
          <div className="flex-1 rounded-xl bg-amber-50 p-3 text-center">
            <div className="text-2xl font-bold text-[var(--color-accent)]">{state.profile.currentPoints}</div>
            <div className="text-xs font-medium text-[var(--color-accent)]">Spendable</div>
          </div>
        </div>
      </div>

      {/* Streaks */}
      <div className="rounded-2xl bg-white p-5 shadow-card">
        <h3 className="mb-3 text-lg font-bold text-[var(--color-text)]">Streaks</h3>
        <div className="flex items-center justify-center gap-3 py-2">
          <span className="text-4xl">🔥</span>
          <span className="text-4xl font-bold text-[var(--color-text)]">{state.profile.streakDays}</span>
          <span className="text-base text-[var(--color-text-secondary)]">day streak</span>
        </div>
        <div className="mt-3 flex justify-center gap-4">
          {[3, 7, 14, 30].map(n => (
            <div key={n} className={`rounded-full px-3 py-1 text-sm font-medium ${
              state.profile.streakDays >= n
                ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                : 'bg-[var(--color-bg)] text-[var(--color-text-tertiary)]'
            }`}>
              {n}d
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="rounded-2xl bg-white p-5 shadow-card">
        <h3 className="mb-4 text-lg font-bold text-[var(--color-text)]">Badges</h3>
        <div className="grid grid-cols-3 gap-3">
          {BADGE_DEFS.map(def => {
            const earned = state.badges.find(b => b.id === def.id)
            return (
              <div
                key={def.id}
                className={`flex flex-col items-center gap-1.5 rounded-2xl p-4 text-center ${
                  earned ? 'bg-[var(--color-primary-light)]' : 'bg-[var(--color-bg)] opacity-40'
                }`}
              >
                <span className="text-3xl">{earned ? def.emoji : '🏅'}</span>
                <span className="text-xs font-semibold text-[var(--color-text)]">{earned ? def.name : '???'}</span>
                <span className="text-[10px] text-[var(--color-text-secondary)]">
                  {earned ? 'Earned!' : def.id.startsWith('secret') ? 'Hidden' : def.description}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reward Shop */}
      <div className="rounded-2xl bg-white p-5 shadow-card">
        <h3 className="mb-4 text-lg font-bold text-[var(--color-text)]">Reward Shop</h3>
        <div className="grid grid-cols-2 gap-3">
          {state.rewards.available.map(reward => {
            const canAfford = state.profile.currentPoints >= reward.cost
            return (
              <button
                key={reward.id}
                onClick={() => canAfford && dispatch({ type: 'REDEEM_REWARD', rewardId: reward.id })}
                disabled={!canAfford}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-5 text-center transition-all ${
                  canAfford
                    ? 'border-[var(--color-primary)] bg-white hover:bg-[var(--color-primary-light)]'
                    : 'border-[var(--color-border)] bg-[var(--color-bg)] opacity-50'
                }`}
              >
                <span className="text-3xl">{reward.emoji}</span>
                <span className="text-sm font-semibold text-[var(--color-text)]">{reward.name}</span>
                <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${
                  canAfford ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'text-[var(--color-text-tertiary)]'
                }`}>
                  {reward.cost} pts
                </span>
              </button>
            )
          })}
        </div>

        {state.rewards.redeemed.length > 0 && (
          <div className="mt-5 border-t border-[var(--color-border)] pt-4">
            <h4 className="mb-2 text-sm font-semibold text-[var(--color-text-secondary)]">Recently Redeemed</h4>
            {state.rewards.redeemed.slice(-3).reverse().map((r, i) => {
              const reward = state.rewards.available.find(a => a.id === r.rewardId)
              return (
                <div key={i} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[var(--color-text)]">{reward?.emoji} {reward?.name}</span>
                  <span className="text-[var(--color-text-tertiary)]">{new Date(r.redeemedAt).toLocaleDateString()}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
