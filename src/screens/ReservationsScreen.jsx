import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

function displayDate(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${m}-${day}-${y}`
}

export default function ReservationsScreen() {
  const { getReservations, cancelReservation, setScreen } = useApp()
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmingId, setConfirmingId] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

  useEffect(() => {
    getReservations().then(all => {
      const today = new Date().setHours(0, 0, 0, 0)
      setUpcoming(all.filter(r => new Date(r.date).getTime() >= today))
    }).finally(() => setLoading(false))
  }, [])

  const handleCancel = async (r) => {
    setCancelling(true)
    setCancelError('')
    try {
      await cancelReservation(r._id)
      setUpcoming(prev => prev.filter(x => x._id !== r._id))
      setConfirmingId(null)
    } catch (e) {
      setCancelError(e.message || 'Could not cancel. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="screen-enter flex flex-col flex-1 pb-24">
      <div className="px-5 pt-10 pb-4">
        <h1 className="font-heading font-black text-2xl text-white">My Rides</h1>
        <p className="text-sm text-gray-400 mt-1">Your upcoming trips</p>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {loading ? (
          <p className="text-gray-400 text-center py-16">Loading…</p>
        ) : upcoming.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <span className="text-5xl">🗓️</span>
            <p className="text-gray-400 text-center">No upcoming rides yet.</p>
            <button className="btn-gold" style={{ width: 'auto', padding: '12px 28px' }} onClick={() => setScreen('new-reservation')}>
              Book a Ride →
            </button>
          </div>
        ) : upcoming.map(r => (
          <div key={r._id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-heading font-bold text-gray-800">{displayDate(r.date)}</p>
                <p className="text-sm text-gray-500">{r.departureTime} → {r.arrivalTime}</p>
              </div>
              <span className="text-xs font-bold bg-gold/20 text-yellow-800 px-2 py-1 rounded-full">#{r.confirmationNumber}</span>
            </div>
            <div className="flex flex-col gap-1 text-sm text-gray-600 mb-4">
              <p>📍 <span className="font-medium">From:</span> {r.pickup}</p>
              <p>🏁 <span className="font-medium">To:</span> {r.destination}</p>
              <p>👤 <span className="font-medium">Rider:</span> {r.riderName}</p>
              {r.price > 0 ? (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span className="font-medium text-gray-600">💳 Amount Paid</span>
                  <span className="font-heading font-black text-gray-900">${r.price.toFixed(2)}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span className="font-medium text-gray-600">🎟️ Ticket</span>
                  <span className="font-bold text-green-600">Free</span>
                </div>
              )}
            </div>
            {confirmingId === r._id ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 font-semibold text-sm mb-1">Cancel this reservation?</p>
                {r.price > 0 && (
                  <p className="text-red-500 text-xs mb-3">Your ${r.price.toFixed(2)} payment will be refunded.</p>
                )}
                {cancelError && <p className="text-red-600 text-xs mb-3">{cancelError}</p>}
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold text-sm"
                    onClick={() => { setConfirmingId(null); setCancelError('') }}>Keep It</button>
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
                onClick={() => { setConfirmingId(r._id); setCancelError('') }}>
                Cancel Ride
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
