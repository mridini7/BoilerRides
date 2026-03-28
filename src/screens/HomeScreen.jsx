import { useState } from 'react'
import { useApp } from '../context/AppContext'

function EditField({ label, value, onSave, validate, type = 'text' }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  const [err, setErr] = useState('')

  const save = () => {
    const error = validate?.(val)
    if (error) return setErr(error)
    onSave(val)
    setEditing(false)
    setErr('')
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{label}</p>
        <button className="text-xs font-bold text-gold-dark" onClick={() => { setEditing(e => !e); setErr(''); setVal(value) }}>
          {editing ? 'Cancel' : 'Change'}
        </button>
      </div>
      {editing ? (
        <div className="flex flex-col gap-2 mt-2">
          <input className="input-field text-sm" type={type} value={val} onChange={e => setVal(e.target.value)} />
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <button className="btn-gold" style={{ padding: '8px', fontSize: 13 }} onClick={save}>Save</button>
        </div>
      ) : (
        <p className="font-medium text-gray-800">{type === 'password' ? '••••••••' : value}</p>
      )}
    </div>
  )
}

function SettingsModal({ onClose }) {
  const { user, login, logout, deleteAccount } = useApp()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const updateUser = (field, value) => {
    const users = JSON.parse(localStorage.getItem('br_users') || '{}')
    const updated = { ...user, [field]: value }
    // if email changed, migrate the key
    if (field === 'email') {
      delete users[user.email]
      users[value] = updated
      localStorage.removeItem(`br_reservations_${user.email}`)
    } else {
      users[updated.email] = updated
    }
    localStorage.setItem('br_users', JSON.stringify(users))
    login(updated)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        className="card w-full max-w-[430px] rounded-t-3xl rounded-b-none screen-enter flex flex-col"
        style={{ maxHeight: '85dvh' }}
        onClick={e => e.stopPropagation()}>
        {/* Fixed handle + title */}
        <div className="px-6 pt-4 pb-3 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          <h2 className="font-heading font-bold text-xl">Settings</h2>
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 pb-10 flex flex-col gap-3">
          <EditField
            label="Purdue Email"
            value={user?.email}
            type="email"
            validate={v => !v.endsWith('.edu') ? 'Must be a .edu email' : ''}
            onSave={v => updateUser('email', v)}
          />
          <EditField
            label="Password"
            value={user?.password}
            type="password"
            validate={v => v.length < 6 ? 'Min 6 characters' : ''}
            onSave={v => updateUser('password', v)}
          />
          <EditField
            label="Phone Number"
            value={user?.phone}
            type="tel"
            validate={v => !v ? 'Required' : ''}
            onSave={v => updateUser('phone', v)}
          />
          <button className="btn-gold mt-1" onClick={logout}>Log Out</button>
          {!confirmDelete ? (
            <button className="w-full py-3 rounded-xl font-bold text-white text-sm" style={{ background: '#DC2626' }} onClick={() => setConfirmDelete(true)}>
              Delete Account
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 font-semibold text-sm mb-3">Are you sure? This cannot be undone.</p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold text-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
                <button className="flex-1 py-2 rounded-lg font-bold text-white text-sm" style={{ background: '#DC2626' }} onClick={deleteAccount}>Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const CARDS = [
  { id: 'reservations', label: 'My Reservations', icon: '📅', screen: 'reservations' },
  { id: 'airport', label: 'Airport Info', icon: '✈️', screen: 'airport' },
  { id: 'pickup', label: 'Campus Pick Up Spots', icon: '📍', screen: 'pickup' },
  { id: 'report', label: 'Report an Issue', icon: '🚩', screen: 'report' },
]

export default function HomeScreen() {
  const { user, setScreen } = useApp()
  const [showSettings, setShowSettings] = useState(false)
  const firstName = user?.name?.split(' ')[0] || 'Rider'
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div className="screen-enter flex flex-col flex-1 pb-20">
      {/* Header */}
      <div className="px-5 pt-10 pb-6 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">Welcome back</p>
          <h1 className="font-heading font-black text-2xl text-white">Hey, {firstName} 👋</h1>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="w-12 h-12 rounded-full bg-gold flex items-center justify-center active:scale-95 transition-transform">
          <span className="font-heading font-black text-black text-sm">{initials}</span>
        </button>
      </div>

      {/* 2x2 Grid */}
      <div className="px-5 grid grid-cols-2 gap-4">
        {CARDS.map(card => (
          <button key={card.id} onClick={() => setScreen(card.screen)}
            className="card p-6 flex flex-col items-start gap-4 text-left active:scale-95 transition-transform duration-100" style={{ minHeight: 140 }}>
            <span className="text-4xl">{card.icon}</span>
            <span className="font-heading font-bold text-base text-gray-800 leading-tight">{card.label}</span>
          </button>
        ))}
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}
