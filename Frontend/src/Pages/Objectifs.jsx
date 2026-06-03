// ============================================================
// src/pages/Objectifs.jsx — FIXED: uses apiActions for DB persistence
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
  transition: 'border-color 0.2s', colorScheme: 'dark',
};

const labelStyle = {
  fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 11,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  color: 'var(--c-text-3)', display: 'block', marginBottom: 6,
};

export default function Objectifs() {
  // ✅ FIX: get apiActions from context (was missing before)
  const { state, apiActions } = useApp();
  const { objectifs } = state;

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titre: '', description: '', montant_cible: '', date_limite: '' });
  const [showVirement, setShowVirement] = useState(null);
  const [montantVirement, setMontantVirement] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // ✅ FIX: call apiActions.addObjectif which persists to DB
  const handleCreer = async e => {
    e.preventDefault();
    setSubmitting(true);
    const success = await apiActions.addObjectif({
      titre:         form.titre,
      description:   form.description,
      montant_cible: parseFloat(form.montant_cible),
      date_limite:   form.date_limite || null,
    });
    setSubmitting(false);

    if (success) {
      setForm({ titre: '', description: '', montant_cible: '', date_limite: '' });
      setShowForm(false);
    }
  };

  // ✅ FIX: call apiActions.virementObjectif which persists to DB
  const handleVirement = async objectifId => {
    const montant = parseFloat(montantVirement);
    if (isNaN(montant) || montant <= 0) return;

    const obj = objectifs.find(o => o.id === objectifId);
    if (!obj) return;

    setSubmitting(true);
    const success = await apiActions.virementObjectif(obj, montant);
    setSubmitting(false);

    if (success) {
      setShowVirement(null);
      setMontantVirement('');
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>

      {/* ── Header ── */}
      <motion.div {...fadeUp(0)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: 'clamp(2rem,4vw,2.6rem)', fontWeight: 400,
            color: 'var(--c-heading)', letterSpacing: '-2px', lineHeight: 1, marginBottom: 6,
          }}>Objectifs financiers</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--c-text-3)' }}>
            {objectifs.filter(o => o.statut === 'en_cours').length} en cours
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ marginTop: 4 }}>
          + Nouvel objectif
        </motion.button>
      </motion.div>

      {/* ── Create form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
            exit={{   opacity: 0, height: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.35 }}
            className="liquid-glass"
            style={{ borderRadius: 20, padding: 28, marginBottom: 24, overflow: 'hidden' }}
          >
            <h3 style={{
              fontFamily: 'var(--font-heading)', fontStyle: 'italic',
              fontSize: 20, fontWeight: 400, color: 'var(--c-heading)', letterSpacing: '-0.5px', marginBottom: 20,
            }}>Créer un objectif</h3>
            <form onSubmit={handleCreer}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Titre *</label>
                <input type="text" name="titre" value={form.titre} onChange={handleChange}
                  style={inputStyle} placeholder="Ex: Voyage en Turquie" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Montant cible (DT) *</label>
                  <input type="number" name="montant_cible" value={form.montant_cible} onChange={handleChange}
                    style={inputStyle} placeholder="100000" required />
                </div>
                <div>
                  <label style={labelStyle}>Date limite</label>
                  <input type="date" name="date_limite" value={form.date_limite} onChange={handleChange}
                    style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }} rows="2"
                  placeholder="Détails de l'objectif..." />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '...' : '✅ Créer'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Objectifs grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {objectifs.map((obj, i) => {
          const pct = Math.min(100, Math.round((obj.montant_actuel / obj.montant_cible) * 100));
          const restant = obj.montant_cible - obj.montant_actuel;
          const isAtteint = obj.statut === 'atteint';

          return (
            <motion.div key={obj.id} {...fadeUp(0.1 + i * 0.07)}
              className="liquid-glass"
              style={{ borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden' }}
            >
              {/* Background glow for completed */}
              {isAtteint && (
                <div style={{
                  position: 'absolute', top: -40, right: -40,
                  width: 140, height: 140, borderRadius: '50%',
                  background: 'rgba(16,185,129,0.2)', filter: 'blur(50px)', zIndex: 0,
                }} />
              )}

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-heading)', fontStyle: 'italic',
                    fontSize: 18, fontWeight: 400, color: 'var(--c-heading)', letterSpacing: '-0.5px',
                    lineHeight: 1.2, flex: 1,
                  }}>{obj.titre}</h3>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 10,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    padding: '4px 10px', borderRadius: 9999,
                    background: isAtteint ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
                    color: isAtteint ? '#34d399' : '#818cf8',
                    flexShrink: 0, marginLeft: 10,
                  }}>
                    {isAtteint ? '🏆 Atteint' : 'En cours'}
                  </span>
                </div>

                {obj.description && (
                  <p style={{
                    fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12,
                    color: 'var(--c-text-3)', marginBottom: 16, lineHeight: 1.6,
                  }}>{obj.description}</p>
                )}

                {/* Progress bar */}
                <div style={{ height: 5, borderRadius: 99, background: 'var(--c-glass)', overflow: 'hidden', marginBottom: 8 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                    style={{
                      height: '100%', borderRadius: 99,
                      background: isAtteint
                        ? 'linear-gradient(90deg,#34d399,#10b981)'
                        : 'linear-gradient(90deg,#818cf8,#6366f1)',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, color: 'var(--c-text-3)' }}>
                    {obj.montant_actuel.toLocaleString('fr-Ar')} DT
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
                    color: isAtteint ? '#34d399' : '#818cf8',
                  }}>{pct}%</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, color: 'var(--c-text-3)' }}>
                    {obj.montant_cible.toLocaleString('fr-Ar')} DT
                  </span>
                </div>

                {!isAtteint && (
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, color: 'var(--c-text-3)', marginBottom: 8 }}>
                    Il reste {restant.toLocaleString('fr-Ar')} DT à économiser
                  </p>
                )}
                {obj.date_limite && (
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, color: 'var(--c-text-3)', marginBottom: 14 }}>
                    📅 Avant le {new Date(obj.date_limite).toLocaleDateString('fr-FR')}
                  </p>
                )}

                {/* Virement */}
                {!isAtteint && (
                  <AnimatePresence mode="wait">
                    {showVirement === obj.id ? (
                      <motion.div key="form"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                        style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                      >
                        <input type="number" value={montantVirement}
                          onChange={e => setMontantVirement(e.target.value)}
                          style={{ ...inputStyle, flex: 1, padding: '8px 12px', fontSize: 12 }}
                          placeholder="Montant (DT)" />
                        <button className="btn-primary"
                          style={{ padding: '8px 14px', fontSize: 12 }}
                          disabled={submitting}
                          onClick={() => handleVirement(obj.id)}>
                          {submitting ? '...' : 'Virer'}
                        </button>
                        <button className="btn-ghost"
                          style={{ padding: '8px 10px', fontSize: 12 }}
                          onClick={() => { setShowVirement(null); setMontantVirement(''); }}>✕</button>
                      </motion.div>
                    ) : (
                      <motion.button key="trigger"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="liquid-glass"
                        onClick={() => setShowVirement(obj.id)}
                        style={{
                          width: '100%', borderRadius: 10, padding: '10px',
                          fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 12,
                          color: 'var(--c-text-2)', border: 'none', cursor: 'pointer',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-2)'}
                      >
                        💰 Virer de l'argent
                      </motion.button>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}