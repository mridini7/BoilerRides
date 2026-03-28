import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('br_user')) } catch { return null }
  })
  const [screen, setScreen] = useState('home')
  const [reservationDraft, setReservationDraft] = useState({})

  const login = (userData) => {
    localStorage.setItem('br_user', JSON.stringify(userData))
    localStorage.setItem('br_session', '1')
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('br_session')
    localStorage.removeItem('br_user')
    setUser(null)
    setScreen('home')
  }

  const deleteAccount = () => {
    const email = user?.email
    if (email) {
      const users = JSON.parse(localStorage.getItem('br_users') || '{}')
      delete users[email]
      localStorage.setItem('br_users', JSON.stringify(users))
      localStorage.removeItem(`br_reservations_${email}`)
    }
    logout()
  }

  const getReservations = () => {
    if (!user) return []
    try { return JSON.parse(localStorage.getItem(`br_reservations_${user.email}`)) || [] }
    catch { return [] }
  }

  const addReservation = (res) => {
    const existing = getReservations()
    const updated = [res, ...existing]
    localStorage.setItem(`br_reservations_${user.email}`, JSON.stringify(updated))
    const seatKey = `br_seats_${res.rideId}`
    // res.currentSeats is the value shown to the user when they selected the ride
    const current = localStorage.getItem(seatKey) !== null
      ? parseInt(localStorage.getItem(seatKey))
      : res.currentSeats
    localStorage.setItem(seatKey, Math.max(0, current - 1))
  }

  const isLoggedIn = !!user && !!localStorage.getItem('br_session')

  return (
    <AppContext.Provider value={{
      user, login, logout, deleteAccount,
      screen, setScreen,
      reservationDraft, setReservationDraft,
      getReservations, addReservation,
      isLoggedIn
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
