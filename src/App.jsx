import { useApp } from './context/AppContext'
import AuthScreen from './screens/AuthScreen'
import HomeScreen from './screens/HomeScreen'
import ReservationsScreen from './screens/ReservationsScreen'
import AirportScreen from './screens/AirportScreen'
import PickupScreen from './screens/PickupScreen'
import ReportScreen from './screens/ReportScreen'
import NewReservationScreen from './screens/NewReservationScreen'
import TabBar from './components/TabBar'

const SCREEN_MAP = {
  home: HomeScreen,
  reservations: ReservationsScreen,
  airport: AirportScreen,
  pickup: PickupScreen,
  report: ReportScreen,
  'new-reservation': NewReservationScreen,
}

export default function App() {
  const { isLoggedIn, screen } = useApp()

  if (!isLoggedIn) return <AuthScreen />

  const Screen = SCREEN_MAP[screen] || HomeScreen
  const hideTabBar = screen === 'new-reservation' // hide during confirmation step handled inside
  const isConfirmation = false // handled inside NewReservationScreen

  return (
    <div id="main-scroll" className="flex flex-col flex-1 overflow-y-auto" style={{ paddingBottom: 0 }}>
      <Screen />
      <TabBar />
    </div>
  )
}
