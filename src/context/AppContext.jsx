import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

const getToken = () => localStorage.getItem('br_token')
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
})

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('br_user')) } catch { return null }
  })
  const [screen, setScreen] = useState('home')
  const [reservationDraft, setReservationDraft] = useState({})

  const login = (userData, token) => {
    localStorage.setItem('br_token', token)
    localStorage.setItem('br_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('br_token')
    localStorage.removeItem('br_user')
    setUser(null)
    setScreen('home')
  }

  const deleteAccount = async () => {
    if (!user) return
    await fetch(`/api/users/${user._id}`, { method: 'DELETE', headers: authHeaders() })
    logout()
  }

  const updateUser = async (field, value) => {
    const res = await fetch(`/api/users/${user._id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ [field]: value }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    const merged = { ...user, ...data }
    localStorage.setItem('br_user', JSON.stringify(merged))
    setUser(merged)
  }

  const getReservations = async () => {
    if (!user) return []
    const res = await fetch(`/api/reservations/${user._id}`, { headers: authHeaders() })
    if (!res.ok) return []
    return res.json()
  }

  const addReservation = async (payload) => {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data
  }

  const cancelReservation = async (reservationId) => {
    const res = await fetch(`/api/reservations/${reservationId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
  }

  const findRides = async (date, pickup, destination) => {
    const params = new URLSearchParams({ date, pickup, destination })
    const res = await fetch(`/api/rides?${params}`, { headers: authHeaders() })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data
  }

  const isLoggedIn = !!user && !!getToken()

  return (
    <AppContext.Provider value={{
      user, login, logout, deleteAccount, updateUser,
      screen, setScreen,
      reservationDraft, setReservationDraft,
      getReservations, addReservation, cancelReservation, findRides,
      isLoggedIn,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
