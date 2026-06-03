import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../Context/AppContext'
import { useTheme } from '../Context/ThemeContext'
import { useAuth } from '../Context/AuthContext'
import { useState } from 'react'
import { Home, Wallet, Receipt, Target, CheckSquare, BarChart3, Bot, Coins, LogOut, Moon, Sun, Sparkles, Icon, Shield } from 'lucide-react'

const BASE_NAV_ITEMS = [
  { path: '/dashboard', label: 'Tableau de bord', Icon: Home },
  { path: '/wallet', label: 'Portefeuille', Icon: Wallet },
  { path: '/depenses', label: 'Dépenses', Icon: Receipt },
  { path: '/objectifs', label: 'Objectifs', Icon: Target },
  { path: '/taches', label: 'Tâches', Icon: CheckSquare },
  { path: '/stats', label: 'Statistiques', Icon: BarChart3 },
  { path: '/assistant', label: 'Assistant IA', Icon: Bot },
  { path: '/admin', label: 'Administrateur', Icon: Shield},
]

export default function Sidebar() {
  const { state } = useApp()
  const { theme, setTheme } = useTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const {user: authUser} = useAuth()

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      navigate('/', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  const walletPct = state.user.revenu_mensuel > 0
    ? Math.min(100, (state.wallet.solde / state.user.revenu_mensuel) * 100)
    : 0

  return (
    <motion.aside
      className="treasury-sidebar liquid-glass-strong"
      initial={{ opacity: 0, x: -22, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.55, ease: [0.2, 1, 0.22, 1] }}
    >
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <Coins size={20} strokeWidth={2.1} />
        </div>
        <div>
          <h1>FinanceApp</h1>
          <p>Gestion intelligente</p>
        </div>
      </div>

      <div className="sidebar-user-card">
        <div className="sidebar-user-avatar">
          {(state.user.nom || '?').charAt(0).toUpperCase()}
        </div>
        <div className="sidebar-user-copy">
          <p>{state.user.nom}</p>
          <span>{state.user.situation || 'Plan financier'}</span>
        </div>
        <Sparkles size={15} />
      </div>

      <nav className="sidebar-nav" aria-label="Navigation principale">
        {BASE_NAV_ITEMS.map(({ path, label, Icon }, index) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'is-active' : ''}`}
            style={{ '--nav-delay': `${index * 45}ms` }}
          >
            <span className="sidebar-nav-icon">
              <Icon size={16} strokeWidth={1.9} />
            </span>
            <span className="sidebar-nav-label">{label}</span>
            <span className="sidebar-nav-spark" />
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-balance-card">
          <div className="sidebar-balance-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p>Solde actuel</p>
          <strong>{state.wallet.solde.toLocaleString('fr-FR')} DT</strong>
          <div className="sidebar-balance-track">
            <span style={{ width: `${walletPct}%` }} />
          </div>
          <small>{Math.round(walletPct)}% du revenu mensuel</small>
        </div>

        <div className="sidebar-theme-switch" aria-label="Theme">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={theme === 'dark' ? 'is-active' : ''}
          >
            <Moon size={14} />
            Dark
          </button>
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={theme === 'light' ? 'is-active' : ''}
          >
            <Sun size={14} />
            Light
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="sidebar-logout"
        >
          <span>
            <LogOut size={15} strokeWidth={1.9} />
          </span>
          {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
        </button>
      </div>
    </motion.aside>
  )
}
