import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

const SPOTS = [
  { id: 1, name: 'Purdue Memorial Union (PMU)', lat: 40.4259, lng: -86.9081, desc: 'West Lafayette — Main campus hub' },
  { id: 2, name: 'Co-Rec / WALC Area', lat: 40.4274, lng: -86.9167, desc: 'West Lafayette — Recreation & learning center' },
  { id: 3, name: 'Purdue Indianapolis Campus', lat: 39.7771, lng: -86.1746, desc: 'Indianapolis — IUPUI area' },
  { id: 4, name: 'Indianapolis Airport (IND)', lat: 39.7173, lng: -86.2944, desc: 'Indianapolis International — Terminals A & B' },
  { id: 5, name: "Chicago O'Hare (ORD)", lat: 41.9742, lng: -87.9073, desc: 'O\'Hare International — Terminals 1, 2, 3, 5' },
]

function deg2rad(d) { return d * Math.PI / 180 }
function distance(lat1, lon1, lat2, lon2) {
  const R = 3958.8
  const dLat = deg2rad(lat2 - lat1), dLon = deg2rad(lon2 - lon1)
  const a = Math.sin(dLat/2)**2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2)**2
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1)
}

const goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
})

function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 13, { duration: 1 })
  }, [target])
  return null
}

export default function PickupScreen() {
  const [userPos, setUserPos] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setUserPos({ lat: 40.4259, lng: -86.9081 })
    )
  }, [])

  const center = userPos || { lat: 40.4259, lng: -86.9081 }

  return (
    <div className="screen-enter flex flex-col flex-1 pb-24">
      <div className="px-5 pt-10 pb-4">
        <h1 className="font-heading font-black text-2xl text-white">Pick Up Spots</h1>
      </div>

      <div className="px-5 mb-5">
        <MapContainer center={[center.lat, center.lng]} zoom={11} style={{ height: 240, width: '100%' }} scrollWheelZoom={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
          <FlyTo target={selected} />
          {SPOTS.map(s => (
            <Marker key={s.id} position={[s.lat, s.lng]} icon={goldIcon}>
              <Popup><strong>{s.name}</strong><br />{s.desc}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="px-5 flex flex-col gap-3">
        {SPOTS.map(s => (
          <button key={s.id}
            onClick={() => setSelected(s)}
            className={`card p-4 flex items-start gap-3 text-left w-full transition-all active:scale-95 ${
              selected?.id === s.id ? 'ring-2 ring-gold' : ''
            }`}>
            <span className="text-2xl mt-0.5">📍</span>
            <div className="flex-1">
              <p className="font-heading font-bold text-gray-800 text-sm">{s.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
            </div>
            {userPos && (
              <span className="text-xs font-bold text-gold-dark bg-gold/20 px-2 py-1 rounded-full whitespace-nowrap">
                {distance(userPos.lat, userPos.lng, s.lat, s.lng)} mi
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
