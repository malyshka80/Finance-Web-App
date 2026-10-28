import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'

// Pages
import AdminPage from './Pages/AdminPage'
import Dashboard   from './Pages/Dashboard'
import Depenses    from './Pages/Depenses'
import Objectifs   from './Pages/Objectifs'
import Stats       from './Pages/Stats'
import Taches      from './Pages/Taches'
import Wallet      from './Pages/Wallet'
import AIAssistant from './Pages/AIAssistant'
import LoginPage   from './Pages/LoginPage'
import RegisterPage from './Pages/RegisterPage'
import Opening from './Pages/opening'
import ProtectedRoute from './Components/ProtectedRoute';
import Sidebar        from './Components/Sidebar'
import Notifications  from './Components/Notifications'
import MoneyAtmosphere from './Components/MoneyAtmosphere'

export default function App() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const isPublicPage = location.pathname === '/' || isAuthPage

  return (
    <>
      {/* Global grain overlay */}
      <div className="grain-overlay" />

      {/* Global notifications */}
      <Notifications />

      {isPublicPage ? (
        /*  Landing / Auth pages: full-screen, no sidebar  */
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Opening />} />             
              <Route path="/login"    element={<LoginPage />}     />
              <Route path="/register" element={<RegisterPage />}  />
            </Routes>
          </motion.div>
        </AnimatePresence>
      ) : (
        /*  App shell: sidebar + page content  */
        <div className="app-shell">
          <Sidebar />

          <main className="app-main">
            <MoneyAtmosphere variant="app" contained density={0.78} />
            <div className="app-aurora app-aurora--mint" />
            <div className="app-aurora app-aurora--gold" />
            <div className="app-aurora app-aurora--blue" />

            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
                exit={{    opacity: 0, y: -8,  filter: 'blur(4px)' }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="app-page-transition"
              >
                <Routes location={location}>
                  <Route path="/dashboard"  element={<Dashboard />}  />
                  <Route path="/depenses"   element={<Depenses />}   />
                  <Route path="/objectifs"  element={<Objectifs />}  />
                  <Route path="/stats"      element={<Stats />}      />
                  <Route path="/taches"     element={<Taches />}     />
                  <Route path="/wallet"     element={<Wallet />}     />
                  <Route path="/assistant"  element={<AIAssistant />} />
                  <Route path="/admin"      element={<AdminPage/>} />
                  {/* Fallback: redirect unknown routes to dashboard */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      )}
    </>
  )
}


