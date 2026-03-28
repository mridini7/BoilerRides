import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function ReservationsScreen() {
  const { getReservations, cancelReservation, setScreen } = useApp()
  const [tab, setTab] = useState('upcoming')
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmingId, setConfirmingId] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    getReservations().then(setAll).finally(() => setLoading(false))
  }, [])

  const today = new Date().setHours(0, 0, 0, 0)
  const upcoming = all.filter(r => new Date(r.date).getTime() >= today)
  const past     = all.filter(r => new Date(r.date).getTime() <  today)
  const list = tab === 'upcoming' ? upcoming : past

  const handleCancel = async (r) => {
    setCancelling(true)
    try {
      await cancelReservation(r._id)
      setAll(prev => prev.filter(x => x._id !== r._id))
      setConfirmingId(null)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="screen-enter flex flex-col flex-1 pb-24">
      <div className="px-5 pt-10 pb-4">
        <h1 className="font-heading font-black text-2xl text-white">My Reservations</h1>
      </div>

      <div className="flex mx-5 bg-[#111] rounded-xl p-1 mb-5">
        {['upcoming', 'past'].map(t => (
          <button key={t} onClick={() => { setTab(t); setConfirmingId(null) }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${tab === t ? 'bg-gold text-black' : 'text-gray-400'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="px-5 flex flex-col gap-4">
        {loading ? (
          <p className="text-gray-400 text-center py-16">Loading…</p>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <span className="text-5xl">🗓️</span>
            <p className="text-gray-400 text-center">No {tab} reservations yet.</p>
            {tab === 'upcoming' && (
              <button className="btn-gold" style={{ width: 'auto', padding: '12px 28px' }} onClick={() => setScreen('new-reservation')}>
                Book a Ride →
              </button>
            )}
          </div>
        ) : list.map(r => (
          <div key={r._id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-heading font-bold text-gray-800">{r.date}</p>
                <p className="text-sm text-gray-500">{r.departureTime} → {r.arrivalTime}</p>
              </div>
              <span className="text-xs font-bold bg-gold/20 text-yellow-800 px-2 py-1 rounded-full">#{r.confirmationNumber}</span>
            </div>
            <div className="flex flex-col gap-1 text-sm text-gray-600 mb-4">
              <p>📍 <span className="font-medium">From:</span> {r.pickup}</p>
              <p>🏁 <span className="font-medium">To:</span> {r.destination}</p>
              <p>👤 <span className="font-medium">Rider:</span> {r.riderName}</p>
            </div>
            {tab === 'upcoming' && (
              confirmingId === r._id ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 font-semibold text-sm mb-3">Cancel this reservation?</p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold text-sm"
                      onClick={() => setConfirmingId(null)}>Keep It</button>
                    <button className="flex-1 py-2 rounded-lg font-bold text-white text-sm"
                      style={{ background: '#DC2626' }}
                      disabled={cancelling}
                      onClick={() => handleCancel(r)}>
                      {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors"
                  onClick={() => setConfirmingId(r._id)}>
                  Cancel Ride
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
