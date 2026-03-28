import { useApp } from '../context/AppContext'

const TABS = [
  { id: 'new-reservation', label: 'Book Ride', icon: '➕' },
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'reservations', label: 'My Rides', icon: '📅' },
]

export default function TabBar() {
  const { screen, setScreen } = useApp()

  return (
    <nav className="tab-bar flex">
      {TABS.map(t => (
        <button key={t.id} onClick={() => setScreen(t.id)}
          className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors duration-150
            ${screen === t.id ? 'text-gold' : 'text-gray-500'}`}>
          <span className="text-xl">{t.icon}</span>
          <span className="text-[10px] font-semibold">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
