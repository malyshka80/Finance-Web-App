// ============================================================
// src/pages/AdminPage.jsx — Administration Panel
// Liquid Glass Dark Theme — matches the rest of the app.
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../Context/AuthContext';
import AppIcon from '../Components/AppIcon';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
  transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Stat card ────────────────────────────────────────────────
function StatCard({ label, value, icon, accent, delay }) {
  return (
    <motion.div {...fadeUp(delay)}
      className="liquid-glass"
      style={{ borderRadius: 20, padding: '22px 24px', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{
        position: 'absolute', top: -24, right: -24,
        width: 90, height: 90, borderRadius: '50%',
        background: accent, filter: 'blur(36px)', opacity: 0.4, zIndex: 0,
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'var(--c-glass-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AppIcon name={icon} size={15} />
          </span>
          <span style={{
            fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 11,
            letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--c-text-3)',
          }}>{label}</span>
        </div>
        <p style={{
          fontFamily: 'var(--font-heading)', fontStyle: 'italic',
          fontSize: 28, fontWeight: 400, color: 'var(--c-heading)',
          letterSpacing: '-1.5px', lineHeight: 1,
        }}>{value}</p>
      </div>
    </motion.div>
  );
}

// ── Role badge ────────────────────────────────────────────────
function RoleBadge({ role }) {
  const isAdmin = role === 'admin';
  return (
    <span style={{
      fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 10,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      padding: '3px 9px', borderRadius: 9999,
      background: isAdmin ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)',
      color: isAdmin ? '#818cf8' : 'var(--c-text-3)',
      border: `1px solid ${isAdmin ? 'rgba(99,102,241,0.3)' : 'var(--c-border)'}`,
      flexShrink: 0,
    }}>
      {isAdmin ? '🛡 Admin' : 'Utilisateur'}
    </span>
  );
}

// ── Confirm dialog ─────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="liquid-glass"
        style={{ borderRadius: 20, padding: 28, maxWidth: 360, width: '90%' }}
      >
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 15,
          color: 'var(--c-text)', marginBottom: 24, lineHeight: 1.6,
        }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost"
            style={{ flex: 1, justifyContent: 'center', padding: '11px' }}
            onClick={onCancel}>Annuler</button>
          <button
            style={{
              flex: 1, padding: '11px', borderRadius: 9999, border: 'none',
              background: 'rgba(239,68,68,0.85)', color: '#fff',
              fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 14,
              cursor: 'pointer', transition: 'opacity 0.2s',
            }}
            onClick={onConfirm}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >Confirmer</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function AdminPage() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();

  const [stats,    setStats]    = useState(null);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [confirm,  setConfirm]  = useState(null); // { type, userId, message }
  const [toast,    setToast]    = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Load data
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        authFetch('/admin/stats').then(r => r.json()),
        authFetch('/admin/users').then(r => r.json()),
      ]);
      if (!statsRes.error) setStats(statsRes);
      if (Array.isArray(usersRes)) setUsers(usersRes);
    } catch (err) {
      showToast('Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleDeleteUser = (userId, nom) => {
    setConfirm({
      message: `Supprimer définitivement le compte de « ${nom} » ? Cette action est irréversible.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          const res = await authFetch(`/admin/users/${userId}`, { method: 'DELETE' });
          const data = await res.json();
          if (!res.ok) return showToast(data.error, 'error');
          setUsers(prev => prev.filter(u => u.id !== userId));
          showToast(`${nom} supprimé avec succès`);
        } catch { showToast('Erreur de suppression', 'error'); }
      },
      onCancel: () => setConfirm(null),
    });
  };

  const handleRoleChange = async (userId, currentRole, nom) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await authFetch(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error, 'error');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showToast(`${nom} est maintenant ${newRole === 'admin' ? 'administrateur' : 'utilisateur'}`);
    } catch { showToast('Erreur de modification', 'error'); }
  };

  const filteredUsers = useMemo(() =>
    users.filter(u =>
      u.nom.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    ), [users, search]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', fontFamily: 'var(--font-body)', color: 'var(--c-text-3)', fontSize: 14,
      }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            style={{
              position: 'fixed', top: 24, right: 24, zIndex: 9998,
              padding: '12px 20px', borderRadius: 14,
              background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
              border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(52,211,153,0.35)'}`,
              backdropFilter: 'blur(20px)',
              fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 13,
              color: toast.type === 'error' ? '#f87171' : '#34d399',
            }}
          >{toast.message}</motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirm dialog ── */}
      <AnimatePresence>
        {confirm && (
          <ConfirmDialog
            message={confirm.message}
            onConfirm={confirm.onConfirm}
            onCancel={confirm.onCancel}
          />
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <motion.div {...fadeUp(0)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontStyle: 'italic',
              fontSize: 'clamp(2rem,4vw,2.6rem)', fontWeight: 400,
              color: 'var(--c-heading)', letterSpacing: '-2px', lineHeight: 1,
            }}>Administration</h2>
            <span style={{
              fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 10,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '5px 12px', borderRadius: 9999,
              background: 'rgba(99,102,241,0.15)', color: '#818cf8',
              border: '1px solid rgba(99,102,241,0.3)', marginTop: 4,
            }}>🛡 Panel admin</span>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--c-text-3)' }}>
            {users.length} utilisateur(s) enregistré(s)
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="btn-ghost" onClick={loadAll} style={{ marginTop: 4, gap: 8 }}>
          <AppIcon name="refresh" size={14} /> Actualiser
        </motion.button>
      </motion.div>

      {/* ── KPI grid ── */}
      {stats && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 14, marginBottom: 28,
        }}>
          <StatCard label="Utilisateurs" value={stats.total_users}
            icon="taches" accent="rgba(99,102,241,0.6)" delay={0.05} />
          <StatCard label="Nouveaux (7j)" value={stats.new_users_week}
            icon="stats" accent="rgba(16,185,129,0.6)" delay={0.12} />
          <StatCard label="Dépenses totales" value={stats.total_expenses}
            icon="depenses" accent="rgba(239,68,68,0.6)" delay={0.19} />
          <StatCard label="Montant global"
            value={`${stats.total_amount.toLocaleString('fr-FR')} DT`}
            icon="wallet" accent="rgba(245,158,11,0.6)" delay={0.26} />
          <StatCard label="Objectifs actifs" value={stats.active_goals}
            icon="objectifs" accent="rgba(139,92,246,0.6)" delay={0.33} />
          <StatCard label="Tâches en attente" value={stats.pending_todos}
            icon="taches" accent="rgba(236,72,153,0.6)" delay={0.40} />
        </div>
      )}

      {/* ── Users section ── */}
      <motion.div {...fadeUp(0.3)}>

        {/* Search bar */}
        <div style={{ marginBottom: 14 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur (nom ou email)..."
            style={{
              width: '100%', background: 'var(--c-glass)',
              border: '1px solid var(--c-border)', borderRadius: 12,
              padding: '11px 16px', fontFamily: 'var(--font-body)', fontWeight: 300,
              fontSize: 13, color: 'var(--c-text)', outline: 'none',
            }}
          />
        </div>

        {/* Users list */}
        <div className="liquid-glass" style={{ borderRadius: 20, overflow: 'hidden' }}>

          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 100px',
            padding: '12px 24px',
            borderBottom: '1px solid var(--c-divider)',
          }}>
            {['Utilisateur', 'Email', 'Rôle', 'Solde', 'Dépenses', 'Actions'].map(h => (
              <span key={h} style={{
                fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 10,
                letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--c-text-4)',
              }}>{h}</span>
            ))}
          </div>

          {filteredUsers.length === 0 ? (
            <p style={{
              fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13,
              color: 'var(--c-text-4)', padding: '40px', textAlign: 'center',
            }}>Aucun utilisateur trouvé</p>
          ) : (
            filteredUsers.map((u, i) => (
              <motion.div key={u.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.04 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 100px',
                  alignItems: 'center',
                  padding: '14px 24px',
                  borderBottom: '1px solid var(--c-divider)',
                  transition: 'background 0.2s',
                  gap: 8,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--c-glass-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Name + avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(236,72,153,0.35))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
                    color: 'var(--c-heading)',
                  }}>
                    {u.nom.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 13,
                      color: 'var(--c-text)', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{u.nom}</p>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11,
                      color: 'var(--c-text-3)', marginTop: 1,
                    }}>
                      {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <p style={{
                  fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12,
                  color: 'var(--c-text-2)', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{u.email}</p>

                {/* Role badge */}
                <div><RoleBadge role={u.role} /></div>

                {/* Wallet */}
                <p style={{
                  fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 13,
                  color: 'var(--c-text)',
                }}>
                  {u.wallet_balance.toLocaleString('fr-FR')} DT
                </p>

                {/* Expense count */}
                <p style={{
                  fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13,
                  color: 'var(--c-text-2)',
                }}>
                  {u.expense_count} dép.
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  {/* Toggle role — hidden for own account */}
                  {u.id !== user?.id && (
                    <button
                      onClick={() => handleRoleChange(u.id, u.role, u.nom)}
                      title={u.role === 'admin' ? 'Rétrograder en utilisateur' : 'Promouvoir admin'}
                      style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: u.role === 'admin'
                          ? 'rgba(99,102,241,0.15)'
                          : 'rgba(255,255,255,0.06)',
                        border: 'none', cursor: 'pointer', fontSize: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s',
                        color: u.role === 'admin' ? '#818cf8' : 'var(--c-text-3)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.25)'}
                      onMouseLeave={e => e.currentTarget.style.background = u.role === 'admin' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)'}
                    >🛡</button>
                  )}

                  {/* Delete — hidden for own account and other admins */}
                  {u.id !== user?.id && u.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(u.id, u.nom)}
                      title="Supprimer l'utilisateur"
                      style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: 'rgba(239,68,68,0.1)', border: 'none',
                        cursor: 'pointer', fontSize: 13, transition: 'background 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    >
                      <AppIcon name="trash" size={13} color="#f87171" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
