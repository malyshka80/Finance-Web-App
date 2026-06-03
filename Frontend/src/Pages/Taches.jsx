// ============================================================
// src/pages/Taches.jsx — FIXED: uses apiActions for DB persistence
// ============================================================

import { useState } from 'react';
import { useApp } from '../Context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
  transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const inputStyle = {
  width: '100%', background: 'var(--c-glass)',
  border: '1px solid var(--c-border)', borderRadius: 12,
  padding: '11px 14px', fontFamily: 'var(--font-body)', fontWeight: 300,
  fontSize: 13, color: 'var(--c-text)', outline: 'none',
  colorScheme: 'dark',
};

const labelStyle = {
  fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 11,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  color: 'var(--c-text-3)', display: 'block', marginBottom: 6,
};

export default function Taches() {
  // ✅ FIX: get apiActions from context (was missing before)
  const { state, apiActions } = useApp();
  const { taches, objectifs } = state;

  const [showForm, setShowForm] = useState(false);
  const [filtre, setFiltre] = useState('toutes');
  const [form, setForm] = useState({ titre: '', date_echeance: '', objectif_id: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // ✅ FIX: call apiActions.addTache which persists to DB
  const handleAjouter = async e => {
    e.preventDefault();
    setSubmitting(true);
    const success = await apiActions.addTache({
      titre:         form.titre,
      date_echeance: form.date_echeance || null,
      objectif_id:   form.objectif_id   || null,
    });
    setSubmitting(false);

    if (success) {
      setForm({ titre: '', date_echeance: '', objectif_id: '' });
      setShowForm(false);
    }
  };

  // ✅ FIX: call apiActions.toggleTache which persists to DB
  const handleToggle = async id => {
    await apiActions.toggleTache(id);
  };

  const tachesFiltrees = taches.filter(t => {
    if (filtre === 'en_cours')  return !t.terminee;
    if (filtre === 'terminees') return t.terminee;
    return true;
  });

  const tachesSorted = [...tachesFiltrees].sort((a, b) => {
    if (a.terminee !== b.terminee) return a.terminee ? 1 : -1;
    if (!a.date_echeance) return 1;
    if (!b.date_echeance) return -1;
    return new Date(a.date_echeance) - new Date(b.date_echeance);
  });

  const isEnRetard = t => t.terminee || !t.date_echeance ? false : new Date(t.date_echeance) < new Date();
  const nbTerminees = taches.filter(t => t.terminee).length;
  const progression = taches.length > 0 ? Math.round((nbTerminees / taches.length) * 100) : 0;

  const tabs = [['toutes', 'Toutes'], ['en_cours', 'En cours'], ['terminees', 'Terminées']];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>

      {/* ── Header ── */}
      <motion.div {...fadeUp(0)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: 'clamp(2rem,4vw,2.6rem)', fontWeight: 400,
            color: 'var(--c-heading)', letterSpacing: '-2px', lineHeight: 1, marginBottom: 6,
          }}>Tâches & Rappels</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--c-text-3)' }}>
            {nbTerminees}/{taches.length} terminées
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ marginTop: 4 }}>
          + Nouvelle tâche
        </motion.button>
      </motion.div>

      {/* ── Global progress ── */}
      <motion.div {...fadeUp(0.08)} className="liquid-glass"
        style={{ borderRadius: 18, padding: '18px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 12, color: 'var(--c-text-3)', letterSpacing: '0.05em' }}>
            PROGRESSION GLOBALE
          </span>
          <span style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: 22, fontWeight: 400, color: '#34d399', letterSpacing: '-1px',
          }}>{progression}%</span>
        </div>
        <div style={{ height: 5, borderRadius: 99, background: 'var(--c-glass)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${progression}%` }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#34d399,#10b981)' }}
          />
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
            }}>Nouvelle tâche</h3>
            <form onSubmit={handleAjouter}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Titre de la tâche *</label>
                <input type="text" name="titre" value={form.titre} onChange={handleChange}
                  style={inputStyle} placeholder="Ex: Payer la facture d'eau" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={labelStyle}>Date d'échéance</label>
                  <input type="date" name="date_echeance" value={form.date_echeance}
                    onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Lié à un objectif</label>
                  <select name="objectif_id" value={form.objectif_id} onChange={handleChange} style={inputStyle}>
                    <option value="">Aucun</option>
                    {objectifs.map(o => <option key={o.id} value={o.id}>{o.titre}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter tabs ── */}
      <motion.div {...fadeUp(0.15)}
        className="liquid-glass"
        style={{ borderRadius: 12, padding: 4, marginBottom: 20, display: 'inline-flex', gap: 2 }}
      >
        {tabs.map(([v, l]) => (
          <button key={v} onClick={() => setFiltre(v)}
            style={{
              fontFamily: 'var(--font-body)', fontWeight: filtre === v ? 500 : 300,
              fontSize: 13, border: 'none', cursor: 'pointer',
              padding: '8px 18px', borderRadius: 9,
              background: filtre === v ? 'var(--c-glass-2)' : 'transparent',
              color: filtre === v ? 'var(--c-heading)' : 'var(--c-text-3)',
              transition: 'all 0.2s',
            }}>
            {l}
          </button>
        ))}
      </motion.div>

      {/* ── Tasks list ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tachesSorted.length === 0 ? (
          <motion.div {...fadeUp(0.2)} className="liquid-glass"
            style={{ borderRadius: 16, padding: '32px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--c-text-4)' }}>
              Aucune tâche trouvée
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {tachesSorted.map((t, i) => {
              const retard = isEnRetard(t);
              return (
                <motion.div key={t.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="liquid-glass"
                  style={{
                    borderRadius: 16, padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    opacity: t.terminee ? 0.5 : 1,
                    outline: retard ? '1px solid rgba(239,68,68,0.3)' : 'none',
                  }}
                >
                  {/* Checkbox */}
                  <button onClick={() => handleToggle(t.id)}
                    style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      border: t.terminee ? 'none' : '1.5px solid var(--c-border-2)',
                      background: t.terminee ? 'linear-gradient(135deg,#34d399,#10b981)' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: 'var(--c-heading)', transition: 'all 0.2s',
                    }}>
                    {t.terminee ? '✓' : ''}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 14,
                      color: t.terminee ? 'var(--c-text-3)' : 'var(--c-text)',
                      textDecoration: t.terminee ? 'line-through' : 'none',
                      marginBottom: 3,
                    }}>{t.titre}</p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      {t.date_echeance && (
                        <span style={{
                          fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11,
                          color: retard ? '#f87171' : 'var(--c-text-3)',
                        }}>
                          📅 {new Date(t.date_echeance).toLocaleDateString('fr-FR')}
                          {retard && ' · En retard ⚠️'}
                        </span>
                      )}
                      {t.objectif_id && (
                        <span style={{
                          fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11,
                          color: 'rgba(99,102,241,0.7)',
                          background: 'rgba(99,102,241,0.1)',
                          padding: '2px 8px', borderRadius: 9999,
                        }}>
                          🎯 {objectifs.find(o => o.id === t.objectif_id)?.titre || 'Objectif'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}