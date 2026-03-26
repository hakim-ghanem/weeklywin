import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { path: '/', label: 'Planner', icon: '📋' },
  { path: '/tasks', label: 'Tasks', icon: '✅' },
  { path: '/journal', label: 'Journal', icon: '📓' },
  { path: '/rewards', label: 'Rewards', icon: '🏆' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  // Hide tab bar on planning wizard
  if (location.pathname.startsWith('/plan')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-surface-light)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-lg justify-around">
        {tabs.map(tab => {
          const isActive = tab.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                isActive
                  ? 'text-[var(--color-primary-light)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
