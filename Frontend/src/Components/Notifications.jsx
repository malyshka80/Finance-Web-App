// ============================================================
// src/components/Notifications.jsx â€” Toasts de notification (fixed)
// ============================================================
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../Context/AppContext'
import AppIcon from './AppIcon'

const TYPE_CONFIG = {
  success: { icon: 'success', color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(52,211,153,0.25)' },
  error:   { icon: 'error', color: '#f87171', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(248,113,113,0.25)' },
  info:    { icon: 'info', color: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(129,140,248,0.25)' },
}

export default function Notifications() {
  const { state, dispatch } = useApp()
  const { notifications } = state

  useEffect(() => {
    if (notifications.length === 0) return
    const timer = setTimeout(() => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: notifications[0].id })
    }, 3500)
    return () => clearTimeout(timer)
  }, [notifications, dispatch])

  return (
    <div style={{
      position: 'fixed', top: 24, right: 24,
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none',
    }}>
      <AnimatePresence>
        {notifications.map(notif => {
          const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 60, filter: 'blur(6px)' }}
              animate={{ opacity: 1, x: 0,  filter: 'blur(0px)' }}
              exit={{   opacity: 0, x: 60,  filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                pointerEvents: 'all',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px',
                borderRadius: 14, minWidth: 260, maxWidth: 340,
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: cfg.color }}>
                <AppIcon name={cfg.icon} size={16} />
              </span>
              <p style={{
                flex: 1,
                fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 13,
                color: 'var(--c-text)', margin: 0,
              }}>{notif.message}</p>
              <button
                onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: notif.id })}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--c-text-3)', fontSize: 12, padding: 0,
                  display: 'flex', alignItems: 'center',
                  transition: 'color 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-3)'}
              >
                <AppIcon name="close" size={13} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}