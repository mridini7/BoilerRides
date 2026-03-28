import { useState } from 'react'

const AIRPORTS = [
  {
    code: 'IND', name: 'Indianapolis Airport (IND)', icon: '✈️',
    address: '7800 Col. H. Weir Cook Memorial Dr, Indianapolis, IN 46241',
    terminals: ['Terminal A', 'Terminal B'],
  },
  {
    code: 'ORD', name: "Chicago O'Hare Airport (ORD)", icon: '🛫',
    address: '10000 W O\'Hare Ave, Chicago, IL 60666',
    terminals: ['Terminal 1', 'Terminal 2', 'Terminal 3', 'Terminal 5'],
  },
]

const TIPS = [
  { title: 'Checked Baggage Limits', body: 'Most airlines allow 50 lbs (23 kg) per checked bag. Overweight fees apply beyond this limit.' },
  { title: 'Carry-On Size Rules', body: 'Standard carry-on: 22" × 14" × 9". Personal item: 18" × 14" × 8". Check your airline for specifics.' },
  { title: 'TSA Arrival Times', body: 'Domestic flights: arrive 2 hours early. International flights: arrive 3 hours early.' },
  { title: 'Prohibited Items', body: 'No liquids over 3.4 oz in carry-on. No sharp objects, firearms, or flammable items. Check TSA.gov for full list.' },
  { title: 'Ride-Share Pickup Zones', body: 'At IND: Level 1, Door 5 (Arrivals). At ORD: Lower level, marked rideshare zones outside baggage claim.' },
]

function AccordionItem({ title, body }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button className="w-full flex items-center justify-between py-4 text-left" onClick={() => setOpen(o => !o)}>
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        <span className="text-gray-400 text-lg transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>⌄</span>
      </button>
      {open && <p className="text-sm text-gray-600 pb-4 leading-relaxed">{body}</p>}
    </div>
  )
}

export default function AirportScreen() {
  return (
    <div className="screen-enter flex flex-col flex-1 pb-24">
      <div className="px-5 pt-10 pb-4">
        <h1 className="font-heading font-black text-2xl text-white">Airport Info</h1>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {AIRPORTS.map(a => (
          <div key={a.code} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{a.icon}</span>
              <div>
                <h2 className="font-heading font-bold text-gray-800">{a.name}</h2>
                <span className="text-xs font-bold text-gold-dark bg-gold/20 px-2 py-0.5 rounded-full">{a.code}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-3">{a.address}</p>
            <div className="flex flex-wrap gap-2">
              {a.terminals.map(t => (
                <span key={t} className="text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
          </div>
        ))}

        <div className="card p-5">
          <h2 className="font-heading font-bold text-gray-800 mb-1">General Transit Tips</h2>
          <p className="text-xs text-gray-400 mb-3">Tap to expand</p>
          {TIPS.map(tip => <AccordionItem key={tip.title} {...tip} />)}
        </div>
      </div>
    </div>
  )
}
