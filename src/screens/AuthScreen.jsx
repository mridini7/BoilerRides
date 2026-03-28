import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function AuthScreen() {
  const { login } = useApp()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError('')
    if (!form.email || !form.password) return setError('All fields required.')
    if (tab === 'signup' && (!form.name || !form.phone)) return setError('All fields required.')
    if (tab === 'signup' && !form.email.endsWith('.edu')) return setError('Must use a .edu email address.')
    setLoading(true)
    try {
      const endpoint = tab === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const body = tab === 'signup'
        ? { name: form.name, email: form.email, password: form.password, phone: form.phone }
        : { email: form.email, password: form.password }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Something went wrong.')
      setForm({ name: '', email: '', password: '', phone: '' })
      login(data.user, data.token)
    } catch {
      setError('Could not connect to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen-enter flex flex-col min-h-dvh bg-charcoal px-6 py-10">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center mb-3">
          <span className="text-3xl font-heading font-black text-black">B</span>
        </div>
        <h1 className="font-heading font-black text-2xl text-white tracking-tight">Boiler Rides</h1>
        <p className="text-sm text-gray-400 mt-1">Purdue Campus Transit</p>
      </div>

      <div className="flex bg-[#111] rounded-xl p-1 mb-6">
        {['login', 'signup'].map(t => (
          <button key={t} onClick={() => { setTab(t); setError(''); setForm({ name: '', email: '', password: '', phone: '' }) }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === t ? 'bg-gold text-black' : 'text-gray-400'}`}>
            {t === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        ))}
      </div>

      <div className="card p-6 flex flex-col gap-4">
        {tab === 'signup' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</label>
            <input className="input-field" autoComplete="off" placeholder="Marcus Johnson" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Purdue Email</label>
          <input className="input-field" type="email" autoComplete="off" placeholder="you@purdue.edu" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
          <input className="input-field" type="password" autoComplete="new-password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
        </div>
        {tab === 'signup' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</label>
            <input className="input-field" type="tel" autoComplete="off" placeholder="(765) 555-0100" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
        )}
        {tab === 'login' && (
          <button className="text-xs text-gold text-right -mt-2" onClick={() => alert('Password reset email sent.')}>
            Forgot Password?
          </button>
        )}
        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        <button className="btn-gold mt-1" disabled={loading} onClick={handleSubmit}>
          {loading ? 'Please wait…' : tab === 'login' ? 'Log In' : 'Create Account'}
        </button>
      </div>
    </div>
  )
}
