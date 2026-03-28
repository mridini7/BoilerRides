import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import confetti from 'canvas-confetti'

// ─── Data ────────────────────────────────────────────────────────────────────

const LOCATIONS = [
  { id: 'pui', label: 'Purdue Indianapolis', sub: null },
  { id: 'pmu', label: 'Purdue West Lafayette — PMU', sub: null },
  { id: 'corec', label: 'Purdue West Lafayette — Co-Rec', sub: null },
  { id: 'ord', label: "Chicago O'Hare", sub: ['Terminal 1', 'Terminal 2', 'Terminal 3', 'Terminal 5'] },
  { id: 'ind', label: 'Indianapolis IND', sub: ['Terminal A', 'Terminal B'] },
]

const LOCATION_MAPS = {
  pui: 'https://www.openstreetmap.org/export/embed.html?bbox=-86.1946%2C39.7671%2C-86.1546%2C39.7871&layer=mapnik&marker=39.7771%2C-86.1746',
  pmu: 'https://www.openstreetmap.org/export/embed.html?bbox=-86.9281%2C40.4159%2C-86.8881%2C40.4359&layer=mapnik&marker=40.4259%2C-86.9081',
  corec: 'https://www.openstreetmap.org/export/embed.html?bbox=-86.9367%2C40.4174%2C-86.8967%2C40.4374&layer=mapnik&marker=40.4274%2C-86.9167',
  ord: 'https://www.openstreetmap.org/export/embed.html?bbox=-87.9466%2C41.9666%2C-87.8866%2C42.0066&layer=mapnik&marker=41.9742%2C-87.9073',
  ind: 'https://www.openstreetmap.org/export/embed.html?bbox=-86.3041%2C39.7117%2C-86.2441%2C39.7517&layer=mapnik&marker=39.7173%2C-86.2944',
}

// Drive durations in minutes between location pairs (symmetric)
const DURATIONS = {
  'pmu-corec':  5,
  'pmu-pui':   90,   // W. Lafayette → Indianapolis ~1h 30m
  'pmu-ind':  105,   // W. Lafayette → IND airport ~1h 45m
  'pmu-ord':  135,   // W. Lafayette → O'Hare ~2h 15m
  'corec-pui':  90,
  'corec-ind': 105,
  'corec-ord': 135,
  'pui-ind':    25,  // Purdue Indy → IND airport ~25m
  'pui-ord':   165,  // Purdue Indy → O'Hare ~2h 45m
  'ind-ord':   185,  // IND → O'Hare ~3h 5m
}

function getDuration(a, b) {
  return DURATIONS[`${a}-${b}`] || DURATIONS[`${b}-${a}`] || 60
}

function addMinutes(timeStr, mins) {
  const [time, ampm] = timeStr.split(' ')
  let [h, m] = time.split(':').map(Number)
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  const total = h * 60 + m + mins
  let rh = Math.floor(total / 60) % 24
  const rm = total % 60
  const rap = rh >= 12 ? 'PM' : 'AM'
  if (rh > 12) rh -= 12
  if (rh === 0) rh = 12
  return `${rh}:${String(rm).padStart(2, '0')} ${rap}`
}

const BASE_DEPARTURES = ['6:00 AM', '8:30 AM', '11:00 AM', '1:30 PM', '4:00 PM', '6:30 PM']
const BASE_SEATS      = [10, 8, 12, 11, 9, 10]

function getRideId(date, pickup, dest, dep) {
  return `${date}_${pickup}_${dest}_${dep.replace(/[: ]/g, '')}`
}

function generateRides(date, pickup, dest) {
  const duration = getDuration(pickup, dest)
  const now = new Date()
  const isToday = date === now.toLocaleDateString('en-CA')

  return BASE_DEPARTURES.reduce((acc, dep, i) => {
    const [time, ampm] = dep.split(' ')
    let [h, m] = time.split(':').map(Number)
    if (ampm === 'PM' && h !== 12) h += 12
    if (ampm === 'AM' && h === 12) h = 0
    if (isToday) {
      const rideDate = new Date(); rideDate.setHours(h, m, 0, 0)
      if (rideDate <= now) return acc
    }
    const rideId = getRideId(date, pickup, dest, dep)
    const stored = localStorage.getItem(`br_seats_${rideId}`)
    const seats = stored !== null ? parseInt(stored) : BASE_SEATS[i]
    if (seats <= 0) return acc
    acc.push({ dep, arr: addMinutes(dep, duration), seats, totalSeats: BASE_SEATS[i], rideId })
    return acc
  }, [])
}

function seatBadge(seats, total) {
  const t = total || 12
  if (seats / t > 0.5) return { label: `${seats} of ${t} seats open`, cls: 'bg-green-100 text-green-700' }
  if (seats >= 2)      return { label: `${seats} of ${t} seats open`, cls: 'bg-yellow-100 text-yellow-700' }
  return { label: `${seats} seat left!`, cls: 'bg-red-100 text-red-700' }
}

function genConfirmNum() { return Math.random().toString(36).slice(2, 8).toUpperCase() }

// ─── Calendar ────────────────────────────────────────────────────────────────

function Calendar({ selected, onSelect }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isPast = (d) => {
    const dt = new Date(year, month, d)
    dt.setHours(0,0,0,0)
    const t = new Date(); t.setHours(0,0,0,0)
    return dt < t
  }

  const dateStr = (d) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

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
          const ds = dateStr(d)
          const past = isPast(d)
          const sel = selected === ds
          return (
            <button key={ds} disabled={past}
              onClick={() => onSelect(ds)}
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

// ─── Location Selector ───────────────────────────────────────────────────────

function LocationSelect({ value, subValue, onChange, onSubChange, exclude, label }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="flex flex-col gap-2">
        {LOCATIONS.map(l => {
          const disabled = l.id === exclude
          const sel = value === l.id
          const showMap = expanded === l.id || sel
          return (
            <div key={l.id}>
              <button
                disabled={disabled}
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

// ─── Main Component ──────────────────────────────────────────────────────────

export default function NewReservationScreen() {
  const { user, addReservation, setScreen } = useApp()
  const [step, setStep] = useState(1)
  const [date, setDate] = useState('')
  const [pickup, setPickup] = useState('')
  const [pickupSub, setPickupSub] = useState('')
  const [dest, setDest] = useState('')
  const [destSub, setDestSub] = useState('')
  const [rides, setRides] = useState([])
  const [selectedRide, setSelectedRide] = useState(null)
  const [riderName, setRiderName] = useState(user?.name || '')
  const [mobility, setMobility] = useState('None')
  const [confirmed, setConfirmed] = useState(null)
  const confettiRef = useRef(false)

  const pickupLabel = () => {
    const l = LOCATIONS.find(x => x.id === pickup)
    return l ? (pickupSub ? `${l.label} — ${pickupSub}` : l.label) : ''
  }
  const destLabel = () => {
    const l = LOCATIONS.find(x => x.id === dest)
    return l ? (destSub ? `${l.label} — ${destSub}` : l.label) : ''
  }

  const pickupValid = pickup && (!LOCATIONS.find(x=>x.id===pickup)?.sub || pickupSub)
  const destValid = dest && (!LOCATIONS.find(x=>x.id===dest)?.sub || destSub)

  const findRides = () => {
    setStep(4)
  }

  // re-read localStorage every time step 4 is active so seat counts are always fresh
  useEffect(() => {
    if (step === 4) setRides(generateRides(date, pickup, dest))
  }, [step])

  const completeReservation = () => {
    const res = {
      id: Date.now().toString(),
      confirmationNumber: genConfirmNum(),
      date,
      pickup: pickupLabel(),
      destination: destLabel(),
      departureTime: selectedRide.dep,
      arrivalTime: selectedRide.arr,
      riderName,
      mobility,
      rideId: selectedRide.rideId,
      totalSeats: selectedRide.totalSeats,
      currentSeats: selectedRide.seats,  // actual available count at time of booking
    }
    addReservation(res)
    setConfirmed(res)
    setStep(6)
  }

  useEffect(() => {
    if (step === 6 && !confettiRef.current) {
      confettiRef.current = true
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ['#a855f7', '#ec4899', '#d946ef', '#f0abfc'] })
    }
  }, [step])

  const STEPS = ['Date', 'Pickup', 'Destination', 'Rides', 'Info', 'Done']

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
        </div>
        <p className="text-sm text-gray-400">A confirmation email has been sent to <strong className="text-gray-300">{user?.email}</strong>. Show this at your pick-up spot.</p>
        <button className="btn-gold" onClick={() => setScreen('reservations')}>View My Reservations</button>
      </div>
    )
  }

  return (
    <div className="screen-enter flex flex-col flex-1 pb-24">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-center gap-3">
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} className="w-9 h-9 rounded-full bg-[#222] flex items-center justify-center text-white">‹</button>
        )}
        <div className="flex-1">
          <h1 className="font-heading font-black text-xl text-white">New Reservation</h1>
          <p className="text-xs text-gray-400">Step {step} of 5 — {STEPS[step-1]}</p>
        </div>
      </div>

      {/* Progress */}
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
            <button className="btn-gold" disabled={!destValid || dest === pickup} onClick={findRides}>Find Rides →</button>
          </>
        )}

        {/* Step 4 — Rides */}
        {step === 4 && (
          <>
            <p className="text-gray-300 text-sm">Available rides on <strong className="text-white">{date}</strong></p>
            {rides.length === 0 ? (
              <div className="card p-6 text-center">
                <p className="text-gray-500">No rides available for this route and date.</p>
                <button className="btn-gold mt-4" onClick={() => setStep(1)}>Change Date</button>
              </div>
            ) : rides.map((r, i) => {
              const badge = seatBadge(r.seats, r.totalSeats)
              return (
                <div key={i} className="card p-4 flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-heading font-bold text-gray-800">{r.dep}</p>
                    <p className="text-xs text-gray-500">Arrives {r.arr}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${badge.cls}`}>{badge.label}</span>
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

        {/* Step 5 — Rider Info */}
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
                <p>📅 {date} · {selectedRide?.dep}</p>
                <p>📍 {pickupLabel()}</p>
                <p>🏁 {destLabel()}</p>
              </div>
            </div>
            <button className="btn-gold" disabled={!riderName} onClick={completeReservation}>Complete Reservation ✓</button>
          </>
        )}
      </div>
    </div>
  )
}
