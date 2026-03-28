import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import confetti from 'canvas-confetti'

const LOCATIONS = [
  { id: 'pui',   label: 'Purdue Indianapolis',            sub: null },
  { id: 'pmu',   label: 'Purdue West Lafayette — PMU',    sub: null },
  { id: 'corec', label: 'Purdue West Lafayette — Co-Rec', sub: null },
  { id: 'ord',   label: "Chicago O'Hare",                 sub: ['Terminal 1', 'Terminal 2', 'Terminal 3', 'Terminal 5'] },
  { id: 'ind',   label: 'Indianapolis IND',               sub: ['Terminal A', 'Terminal B'] },
]

const LOCATION_MAPS = {
  pui:   'https://www.openstreetmap.org/export/embed.html?bbox=-86.1946%2C39.7671%2C-86.1546%2C39.7871&layer=mapnik&marker=39.7771%2C-86.1746',
  pmu:   'https://www.openstreetmap.org/export/embed.html?bbox=-86.9281%2C40.4159%2C-86.8881%2C40.4359&layer=mapnik&marker=40.4259%2C-86.9081',
  corec: 'https://www.openstreetmap.org/export/embed.html?bbox=-86.9367%2C40.4174%2C-86.8967%2C40.4374&layer=mapnik&marker=40.4274%2C-86.9167',
  ord:   'https://www.openstreetmap.org/export/embed.html?bbox=-87.9466%2C41.9666%2C-87.8866%2C42.0066&layer=mapnik&marker=41.9742%2C-87.9073',
  ind:   'https://www.openstreetmap.org/export/embed.html?bbox=-86.3041%2C39.7117%2C-86.2441%2C39.7517&layer=mapnik&marker=39.7173%2C-86.2944',
}

const AIRPORT_IDS = ['ord', 'ind']

function isPaidRoute(pickup, dest) {
  return AIRPORT_IDS.includes(pickup) || AIRPORT_IDS.includes(dest)
}

function seatBadge(available, total) {
  const t = total || 12
  if (available / t > 0.5) return { label: `${available} of ${t} seats open`, cls: 'bg-green-100 text-green-700' }
  if (available >= 2)      return { label: `${available} of ${t} seats open`, cls: 'bg-yellow-100 text-yellow-700' }
  return { label: `${available} seat left!`, cls: 'bg-red-100 text-red-700' }
}

function genConfirmNum() { return Math.random().toString(36).slice(2, 8).toUpperCase() }

function formatPrice(price) {
  return price > 0 ? `$${price.toFixed(2)}` : 'Free'
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function Calendar({ selected, onSelect }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const year = viewDate.getFullYear(), month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  const isPast = d => { const dt = new Date(year, month, d); dt.setHours(0,0,0,0); const t = new Date(); t.setHours(0,0,0,0); return dt < t }
  const dateStr = d => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}>‹</button>
        <span className="font-heading font-bold text-gray-800">{monthName}</span>
        <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}>›</button>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />
          const ds = dateStr(d), past = isPast(d), sel = selected === ds
          return (
            <button key={ds} disabled={past} onClick={() => onSelect(ds)}
              className={`aspect-square rounded-full flex items-center justify-center text-sm font-semibold transition-all
                ${past ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gold/30'}
                ${sel ? '!bg-gold !text-black' : ''}`}>
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Location Selector ────────────────────────────────────────────────────────

function LocationSelect({ value, subValue, onChange, onSubChange, exclude, label }) {
  const [expanded, setExpanded] = useState(null)
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="flex flex-col gap-2">
        {LOCATIONS.map(l => {
          const disabled = l.id === exclude, sel = value === l.id, showMap = expanded === l.id || sel
          return (
            <div key={l.id}>
              <button disabled={disabled}
                onMouseEnter={() => !disabled && setExpanded(l.id)}
                onMouseLeave={() => setExpanded(null)}
                onClick={() => { onChange(l.id); onSubChange(''); setExpanded(l.id) }}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                  ${disabled ? 'opacity-30 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400' : ''}
                  ${sel ? 'border-gold bg-gold/10 text-gray-800' : !disabled ? 'border-gray-200 bg-white text-gray-700 hover:border-gold/50' : ''}`}>
                {l.label}
              </button>
              {sel && l.sub && (
                <div className="flex flex-wrap gap-2 mt-2 pl-2">
                  {l.sub.map(s => (
                    <button key={s} onClick={() => onSubChange(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all
                        ${subValue === s ? 'border-gold bg-gold text-black' : 'border-gray-200 bg-white text-gray-600 hover:border-gold/50'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {showMap && LOCATION_MAPS[l.id] && (
                <div className="mt-2 rounded-xl overflow-hidden" style={{ height: 100 }}>
                  <iframe src={LOCATION_MAPS[l.id]} width="100%" height="100" style={{ border: 0, borderRadius: 12 }} title={l.label} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewReservationScreen() {
  const { user, findRides, addReservation, setScreen } = useApp()
  const [step, setStep] = useState(1)
  const [date, setDate] = useState('')
  const [pickup, setPickup] = useState('')
  const [pickupSub, setPickupSub] = useState('')
  const [dest, setDest] = useState('')
  const [destSub, setDestSub] = useState('')
  const [rides, setRides] = useState([])
  const [ridesLoading, setRidesLoading] = useState(false)
  const [ridesError, setRidesError] = useState('')
  const [selectedRide, setSelectedRide] = useState(null)
  const [riderName, setRiderName] = useState(user?.name || '')
  const [mobility, setMobility] = useState('None')
  const [payment, setPayment] = useState({ cardNumber: '', expiry: '', cvv: '', name: '' })
  const [confirmed, setConfirmed] = useState(null)
  const [bookingError, setBookingError] = useState('')
  const confettiRef = useRef(false)

  const locLabel = (id, sub) => {
    const l = LOCATIONS.find(x => x.id === id)
    return l ? (sub ? `${l.label} — ${sub}` : l.label) : ''
  }

  const pickupValid = pickup && (!LOCATIONS.find(x => x.id === pickup)?.sub || pickupSub)
  const destValid   = dest   && (!LOCATIONS.find(x => x.id === dest)?.sub   || destSub)
  const paid = isPaidRoute(pickup, dest)
  const price = selectedRide?.price ?? 0

  const paymentValid = !paid || (
    payment.cardNumber.replace(/\s/g, '').length === 16 &&
    payment.expiry.length === 5 &&
    payment.cvv.length >= 3 &&
    payment.name.trim().length > 0
  )

  const handleFindRides = async () => {
    setRidesError('')
    setRidesLoading(true)
    try {
      const data = await findRides(date, pickup, dest)
      setRides(data)
      setStep(4)
    } catch (e) {
      setRidesError(e.message)
    } finally {
      setRidesLoading(false)
    }
  }

  const completeReservation = async () => {
    setBookingError('')
    try {
      const confirmationNumber = genConfirmNum()
      const res = await addReservation({
        rideId: selectedRide._id,
        riderName,
        mobility,
        confirmationNumber,
        pickupLabel: locLabel(pickup, pickupSub),
        destinationLabel: locLabel(dest, destSub),
      })
      setConfirmed({ ...res, confirmationNumber, price })
      setStep(6)
    } catch (e) {
      setBookingError(e.message)
    }
  }

  useEffect(() => {
    if (step === 6 && !confettiRef.current) {
      confettiRef.current = true
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ['#a855f7', '#ec4899', '#d946ef', '#f0abfc'] })
    }
  }, [step])

  const STEPS = ['Date', 'Pickup', 'Destination', 'Rides', 'Info', 'Done']

  // ── Step 6: Confirmation ──────────────────────────────────────────────────
  if (step === 6 && confirmed) {
    return (
      <div className="screen-enter flex flex-col flex-1 items-center justify-center px-5 py-10 text-center gap-6">
        <span className="text-6xl">🎉</span>
        <h1 className="font-heading font-black text-3xl text-white">Reservation Confirmed!</h1>
        <div className="card p-5 w-full text-left flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-heading font-bold text-gray-800">Confirmation</span>
            <span className="font-bold text-gold-dark">#{confirmed.confirmationNumber}</span>
          </div>
          <div className="h-px bg-gray-100" />
          <p className="text-sm text-gray-600">📅 <strong>{confirmed.date}</strong></p>
          <p className="text-sm text-gray-600">🕐 {confirmed.departureTime} → {confirmed.arrivalTime}</p>
          <p className="text-sm text-gray-600">📍 {confirmed.pickup}</p>
          <p className="text-sm text-gray-600">🏁 {confirmed.destination}</p>
          <p className="text-sm text-gray-600">👤 {confirmed.riderName}</p>
          {confirmed.price > 0 && (
            <>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">💳 Ticket Price</p>
                <p className="font-heading font-bold text-gray-800">${confirmed.price.toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center bg-gold/10 rounded-xl px-3 py-2">
                <p className="font-heading font-bold text-gray-800">Total Charged</p>
                <p className="font-heading font-black text-lg text-gray-900">${confirmed.price.toFixed(2)}</p>
              </div>
              <p className="text-xs text-gray-400">Card ending in {payment.cardNumber.slice(-4)}</p>
            </>
          )}
        </div>
        <p className="text-sm text-gray-400">A confirmation email has been sent to <strong className="text-gray-300">{user?.email}</strong>. Show this at your pick-up spot.</p>
        <button className="btn-gold" onClick={() => setScreen('reservations')}>View My Reservations</button>
      </div>
    )
  }

  // ── Steps 1–5 ─────────────────────────────────────────────────────────────
  return (
    <div className="screen-enter flex flex-col flex-1 pb-24">
      <div className="px-5 pt-10 pb-4 flex items-center gap-3">
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} className="w-9 h-9 rounded-full bg-[#222] flex items-center justify-center text-white">‹</button>
        )}
        <div className="flex-1">
          <h1 className="font-heading font-black text-xl text-white">New Reservation</h1>
          <p className="text-xs text-gray-400">Step {step} of 5 — {STEPS[step - 1]}</p>
        </div>
      </div>

      <div className="px-5 mb-5">
        <div className="flex gap-1">
          {[1,2,3,4,5].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-gold' : 'bg-[#333]'}`} />
          ))}
        </div>
      </div>

      <div className="px-5 flex flex-col gap-5">

        {/* Step 1 — Date */}
        {step === 1 && (
          <>
            <p className="text-gray-300 text-sm">Select your travel date</p>
            <Calendar selected={date} onSelect={d => { setDate(d); setStep(2) }} />
          </>
        )}

        {/* Step 2 — Pickup */}
        {step === 2 && (
          <>
            <p className="text-gray-300 text-sm">Where are you departing from?</p>
            <div className="card p-4">
              <LocationSelect value={pickup} subValue={pickupSub} onChange={setPickup} onSubChange={setPickupSub} exclude={null} label="Pickup Location" />
            </div>
            <button className="btn-gold" disabled={!pickupValid} onClick={() => setStep(3)}>Continue →</button>
          </>
        )}

        {/* Step 3 — Destination */}
        {step === 3 && (
          <>
            <p className="text-gray-300 text-sm">Where are you headed?</p>
            <div className="card p-4">
              <LocationSelect value={dest} subValue={destSub} onChange={setDest} onSubChange={setDestSub} exclude={pickup} label="Destination" />
            </div>
            {dest && dest === pickup && <p className="text-red-400 text-sm font-medium">Pickup and destination cannot be the same.</p>}
            {ridesError && <p className="text-red-400 text-sm font-medium">{ridesError}</p>}
            <button className="btn-gold" disabled={!destValid || dest === pickup || ridesLoading} onClick={handleFindRides}>
              {ridesLoading ? 'Searching…' : 'Find Rides →'}
            </button>
          </>
        )}

        {/* Step 4 — Rides */}
        {step === 4 && (
          <>
            <p className="text-gray-300 text-sm">Available rides on <strong className="text-white">{date}</strong></p>
            {paid && (
              <div className="flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-xl px-4 py-3">
                <span className="text-lg">💳</span>
                <p className="text-sm text-yellow-900 font-semibold">This is a paid route. Ticket prices shown per seat.</p>
              </div>
            )}
            {rides.length === 0 ? (
              <div className="card p-6 text-center">
                <p className="text-gray-500">No rides available for this route and date.</p>
                <button className="btn-gold mt-4" onClick={() => setStep(1)}>Change Date</button>
              </div>
            ) : rides.map(r => {
              const available = r.totalSeats - r.seatsBooked
              const badge = seatBadge(available, r.totalSeats)
              return (
                <div key={r._id} className="card p-4 flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-heading font-bold text-gray-800">{r.departureTime}</p>
                    <p className="text-xs text-gray-500">Arrives {r.arrivalTime}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${badge.cls}`}>{badge.label}</span>
                    {r.price > 0 && (
                      <span className="text-sm font-heading font-black text-gray-800">${r.price.toFixed(2)} / seat</span>
                    )}
                    {r.price === 0 && (
                      <span className="text-xs font-bold text-green-600">Free</span>
                    )}
                  </div>
                  <button className="btn-gold" style={{ width: 'auto', padding: '10px 16px', fontSize: 13 }}
                    onClick={() => { setSelectedRide(r); setStep(5) }}>
                    Select →
                  </button>
                </div>
              )
            })}
          </>
        )}

        {/* Step 5 — Rider Info + Payment */}
        {step === 5 && (
          <>
            <p className="text-gray-300 text-sm">Confirm your rider details</p>
            <div className="card p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rider Name</label>
                <input className="input-field" value={riderName} onChange={e => setRiderName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mobility Services</label>
                <select className="input-field" value={mobility} onChange={e => setMobility(e.target.value)}>
                  {['None', 'Service Animal', 'Wheelchair', 'Walker'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 flex flex-col gap-1">
                <p>📅 {date} · {selectedRide?.departureTime}</p>
                <p>📍 {locLabel(pickup, pickupSub)}</p>
                <p>🏁 {locLabel(dest, destSub)}</p>
                {price > 0 && <p className="font-heading font-bold text-gray-800 mt-1">💳 Total: ${price.toFixed(2)}</p>}
              </div>
            </div>

            {/* Payment section — only for paid routes */}
            {paid && price > 0 && (
              <div className="card p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">💳</span>
                  <h3 className="font-heading font-bold text-gray-800">Payment</h3>
                  <span className="ml-auto font-heading font-black text-gray-900">${price.toFixed(2)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name on Card</label>
                  <input className="input-field" placeholder="Marcus Johnson" value={payment.name}
                    onChange={e => setPayment(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Card Number</label>
                  <input className="input-field" placeholder="1234 5678 9012 3456" maxLength={19}
                    value={payment.cardNumber}
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
                      const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw
                      setPayment(p => ({ ...p, cardNumber: formatted }))
                    }} />
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expiry</label>
                    <input className="input-field" placeholder="MM/YY" maxLength={5}
                      value={payment.expiry}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                        if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2)
                        setPayment(p => ({ ...p, expiry: v }))
                      }} />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CVV</label>
                    <input className="input-field" placeholder="123" maxLength={4} type="password"
                      value={payment.cvv}
                      onChange={e => setPayment(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">🔒 Demo only — no real payment is processed</p>
              </div>
            )}

            {bookingError && <p className="text-red-400 text-sm font-medium">{bookingError}</p>}
            <button className="btn-gold" disabled={!riderName || !paymentValid} onClick={completeReservation}>
              {price > 0 ? `Pay $${price.toFixed(2)} & Confirm ✓` : 'Complete Reservation ✓'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
