// ============================================================
// src/pages/Wallet.jsx — uses apiActions for persistence
// ============================================================

import { useState } from 'react';
import { useApp } from '../Context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
  transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const TYPES_TRANSACTION = [
  { value: 'revenu',  label: '💼 Revenu supplémentaire' },
  { value: 'bonus',   label: '🎁 Bonus' },
  { value: 'cadeau',  label: '🎀 Cadeau' },
  { value: 'autre',   label: '📦 Autre' },
];

const inputStyle = {
  width: '100%', background: 'var(--c-glass)',
  border: '1px solid var(--c-border)', borderRadius: 12,
  padding: '11px 14px', fontFamily: 'var(--font-body)', fontWeight: 300,
  fontSize: 13, color: 'var(--c-text)', outline: 'none',
};

const labelStyle = {
  fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 11,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  color: 'var(--c-text-3)', display: 'block', marginBottom: 6,
};

const getIcon = type => (
  { revenu: '💼', bonus: '🎁', cadeau: '🎀', envoi: '📤', reception: '📥', autre: '📦', depense: '🛒', epargne: '🏦' }[type] || '💰'
);

export default function Wallet() {
  const { state, apiActions } = useApp();
  const { wallet, user }      = state;

  const formReset = { montant: '', type: 'revenu', description: '' };
  const [form,      setForm]      = useState(formReset);
  const [showForm,  setShowForm]  = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAjouter = async e => {
    e.preventDefault();
    const montantNum = parseFloat(form.montant);
    if (isNaN(montantNum) || montantNum <= 0) return;

    setSubmitting(true);
    const success = await apiActions.addWalletTransaction({
      montant:     montantNum,
      type:        form.type,
      description: form.description,
    });
    setSubmitting(false);

    if (success) {
      setForm(formReset);
      setShowForm(false);
    }
  };

  const usagePercent = user.revenu_mensuel > 0
    ? Math.min(100, Math.round((wallet.solde / user.revenu_mensuel) * 100))
    : 0;

  const transactions = wallet.transactions || [];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>

      {/* ── Header ── */}
      <motion.div {...fadeUp(0)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: 'clamp(2rem,4vw,2.6rem)', fontWeight: 400,
            color: 'var(--c-heading)', letterSpacing: '-2px', lineHeight: 1, marginBottom: 6,
          }}>Portefeuille</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--c-text-3)' }}>
            Gérez vos entrées d'argent
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ marginTop: 4 }}>
          + Ajouter
        </motion.button>
      </motion.div>

      {/* ── Balance hero card ── */}
      <motion.div {...fadeUp(0.08)}
        className="liquid-glass-strong"
        style={{ borderRadius: 24, padding: '40px 36px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(99,102,241,0.25)', filter: 'blur(80px)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', filter: 'blur(60px)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 11,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--c-text-3)', marginBottom: 12,
          }}>Solde disponible</p>

          <p style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: 'clamp(2.8rem, 6vw, 4rem)', fontWeight: 400,
            color: 'var(--c-heading)', letterSpacing: '-3px', lineHeight: 1, marginBottom: 6,
          }}>{wallet.solde.toLocaleString('fr-AR')} DT</p>

          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13,
            color: 'var(--c-text-3)', marginBottom: 24,
          }}>
            Revenu mensuel : {user.revenu_mensuel.toLocaleString('fr-AR')} DT
          </p>

          <div style={{ height: 5, borderRadius: 99, background: 'var(--c-glass-2)', overflow: 'hidden', marginBottom: 8 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#818cf8,#6366f1)' }}
            />
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, color: 'var(--c-text-3)' }}>
            {usagePercent}% du revenu disponible
          </p>
        </div>
      </motion.div>

      {/* ── Add form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
            exit={{   opacity: 0, height: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.35 }}
            className="liquid-glass"
            style={{ borderRadius: 20, padding: 28, marginBottom: 20, overflow: 'hidden' }}
          >
            <h3 style={{
              fontFamily: 'var(--font-heading)', fontStyle: 'italic',
              fontSize: 20, fontWeight: 400, color: 'var(--c-heading)', letterSpacing: '-0.5px', marginBottom: 20,
            }}>Ajouter de l'argent</h3>
            <form onSubmit={handleAjouter}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Montant (DT) *</label>
                  <input type="number" name="montant" value={form.montant} onChange={handleChange}
                    style={inputStyle} placeholder="5000" min="1" required />
                </div>
                <div>
                  <label style={labelStyle}>Type *</label>
                  <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
                    {TYPES_TRANSACTION.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Description</label>
                <input type="text" name="description" value={form.description} onChange={handleChange}
                  style={inputStyle} placeholder="Ex: Prime de fin d'année" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '...' : '✅ Ajouter'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Transaction history ── */}
      <motion.div {...fadeUp(0.2)} className="liquid-glass" style={{ borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--c-divider)' }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: 20, fontWeight: 400, color: 'var(--c-heading)', letterSpacing: '-0.5px',
          }}>Historique des transactions</h3>
        </div>

        {transactions.length === 0 ? (
          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13,
            color: 'var(--c-text-4)', padding: '40px', textAlign: 'center',
          }}>Aucune transaction pour le moment</p>
        ) : (
          transactions.map((t, i) => {
            const isPositive = t.montant > 0;
            return (
              <motion.div key={t.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 24px',
                  borderBottom: '1px solid var(--c-divider)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--c-glass-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, flexShrink: 0,
                }}>{getIcon(t.type)}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 13, color: 'var(--c-text)', marginBottom: 2 }}>
                    {t.description || t.type}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--c-text-3)' }}>
                    {new Date(t.date_trans).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <p style={{
                  fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 14,
                  color: isPositive ? '#34d399' : '#f87171',
                  flexShrink: 0,
                }}>
                  {isPositive ? '+' : ''}{t.montant.toLocaleString('fr-AR')} DT
                </p>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}