import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function RideHistoryScreen() {
  const { getReservations } = useApp()
  const [past, setPast] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReservations().then(all => {
      const today = new Date().setHours(0, 0, 0, 0)
      setPast(all.filter(r => new Date(r.date).getTime() < today))
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="screen-enter flex flex-col flex-1 pb-24">
      <div className="px-5 pt-10 pb-4">
        <h1 className="font-heading font-black text-2xl text-white">Ride History</h1>
        <p className="text-sm text-gray-400 mt-1">Your completed trips</p>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {loading ? (
          <p className="text-gray-400 text-center py-16">Loading…</p>
        ) : past.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <span className="text-5xl">🕐</span>
            <p className="text-gray-400 text-center">No past rides yet.</p>
          </div>
        ) : past.map(r => (
          <div key={r._id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-heading font-bold text-gray-800">{r.date}</p>
                <p className="text-sm text-gray-500">{r.departureTime} → {r.arrivalTime}</p>
              </div>
              <span className="text-xs font-bold bg-gold/20 text-yellow-800 px-2 py-1 rounded-full">#{r.confirmationNumber}</span>
            </div>
            <div className="flex flex-col gap-1 text-sm text-gray-600">
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
          </div>
        ))}
      </div>
    </div>
  )
}
