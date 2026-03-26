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

  if (location.pathname.startsWith('/plan')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg justify-around">
        {tabs.map(tab => {
          const isActive = tab.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-text-tertiary)]'
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
