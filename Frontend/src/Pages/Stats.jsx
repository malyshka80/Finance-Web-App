// ============================================================
// src/pages/Stats.jsx — Restyled: Liquid Glass Dark Theme
// ============================================================

import { useMemo } from 'react';
import { useApp } from '../Context/AppContext';
import { motion } from 'framer-motion';
import AppIcon from '../Components/AppIcon';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
  transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

function StatBox({ label, value, color, delay }) {
  return (
    <motion.div {...fadeUp(delay)}
      className="liquid-glass"
      style={{ borderRadius: 18, padding: '22px 24px', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{
        position: 'absolute', bottom: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: color, filter: 'blur(30px)', opacity: 0.4, zIndex: 0,
      }} />
      <p style={{
        fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 11,
        letterSpacing: '0.07em', textTransform: 'uppercase',
        color: 'var(--c-text-3)', marginBottom: 10,
        position: 'relative', zIndex: 1,
      }}>{label}</p>
      <p style={{
        fontFamily: 'var(--font-heading)', fontStyle: 'italic',
        fontSize: 26, fontWeight: 400, color: 'var(--c-heading)',
        letterSpacing: '-1px', lineHeight: 1,
        position: 'relative', zIndex: 1,
      }}>{value}</p>
    </motion.div>
  );
}

export default function Stats() {
  const { state } = useApp();
  const { depenses, wallet, objectifs, user } = state;

  const stats = useMemo(() => {
    const totalDepenses = depenses.reduce((s, d) => s + d.montant, 0);
    const economises    = user.revenu_mensuel - totalDepenses;

    const parCategorie = {};
    depenses.forEach(d => {
      if (!parCategorie[d.categorie_nom])
        parCategorie[d.categorie_nom] = { total: 0, icone: d.icone, couleur: d.couleur };
      parCategorie[d.categorie_nom].total += d.montant;
    });

    const catEntries = Object.entries(parCategorie).sort((a, b) => b[1].total - a[1].total);
    const maxCat = catEntries.length > 0 ? catEntries[0][1].total : 1;

    const avgObjectif = objectifs.length > 0
      ? objectifs.reduce((s, o) => s + (o.montant_actuel / o.montant_cible), 0) / objectifs.length * 100
      : 0;

    return { totalDepenses, economises, parCategorie: catEntries, maxCat, avgObjectif };
  }, [depenses, wallet, objectifs, user]);

  const tauxEpargne = user.revenu_mensuel > 0
    ? Math.max(0, Math.round((stats.economises / user.revenu_mensuel) * 100))
    : 0;

  const savingsColor = tauxEpargne >= 20 ? '#34d399' : tauxEpargne >= 10 ? '#fbbf24' : '#f87171';
  const savingsGrad  = tauxEpargne >= 20
    ? 'linear-gradient(90deg,#34d399,#10b981)'
    : tauxEpargne >= 10
    ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
    : 'linear-gradient(90deg,#f87171,#ef4444)';

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>

      {/* ── Header ── */}
      <motion.div {...fadeUp(0)} style={{ marginBottom: 32 }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)', fontStyle: 'italic',
          fontSize: 'clamp(2rem,4vw,2.6rem)', fontWeight: 400,
          color: 'var(--c-heading)', letterSpacing: '-2px', lineHeight: 1, marginBottom: 6,
        }}>Statistiques</h2>
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--c-text-3)' }}>
          Vue d'ensemble de votre situation financière
        </p>
      </motion.div>

      {/* ── Summary boxes ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatBox label="Revenu mensuel" value={`${user.revenu_mensuel.toLocaleString('fr-Ar')} DT`}
          color="rgba(99,102,241,0.6)" delay={0.05} />
        <StatBox label="Total dépenses" value={`${stats.totalDepenses.toLocaleString('fr-Ar')} DT`}
          color="rgba(239,68,68,0.6)" delay={0.12} />
        <StatBox label="Économies" value={`${stats.economises.toLocaleString('fr-Ar')} DT`}
          color={stats.economises >= 0 ? 'rgba(16,185,129,0.6)' : 'rgba(239,68,68,0.6)'} delay={0.19} />
        <StatBox label="Taux d'épargne" value={`${tauxEpargne}%`}
          color="rgba(139,92,246,0.6)" delay={0.26} />
      </div>

      {/* ── Dépenses par catégorie ── */}
      <motion.div {...fadeUp(0.25)} className="liquid-glass"
        style={{ borderRadius: 20, padding: 28, marginBottom: 20 }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)', fontStyle: 'italic',
          fontSize: 20, fontWeight: 400, color: 'var(--c-heading)', letterSpacing: '-0.5px', marginBottom: 22,
        }}>Dépenses par catégorie</h3>

        {stats.parCategorie.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--c-text-4)', textAlign: 'center', padding: '20px 0' }}>
            Aucune dépense enregistrée
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {stats.parCategorie.map(([nom, data], i) => {
              const pct = Math.round((data.total / stats.maxCat) * 100);
              const pctRevenu = Math.round((data.total / user.revenu_mensuel) * 100);
              return (
                <motion.div key={nom}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.07 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', color: data.couleur }}>
                        <AppIcon name={data.icone} size={14} />
                      </span>
                      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 13, color: 'var(--c-text)' }}>
                        {nom}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--c-text-3)' }}>
                        {pctRevenu}% du revenu
                      </span>
                      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 13, color: 'var(--c-heading)', minWidth: 90, textAlign: 'right' }}>
                        {data.total.toLocaleString('fr-Ar')} DT
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: 'var(--c-glass)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + i * 0.08, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 99, background: data.couleur }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Savings gauge ── */}
      <motion.div {...fadeUp(0.35)} className="liquid-glass"
        style={{ borderRadius: 20, padding: 28, marginBottom: 20 }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)', fontStyle: 'italic',
          fontSize: 20, fontWeight: 400, color: 'var(--c-heading)', letterSpacing: '-0.5px', marginBottom: 6,
        }}>Taux d'épargne mensuel</h3>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
          <span style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: 44, fontWeight: 400, color: savingsColor, letterSpacing: '-2px', lineHeight: 1,
          }}>{tauxEpargne}%</span>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, color: 'var(--c-text-3)' }}>
            de votre revenu
          </span>
        </div>

        <div style={{ height: 8, borderRadius: 99, background: 'var(--c-glass)', overflow: 'hidden', marginBottom: 14 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${tauxEpargne}%` }}
            transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 99, background: savingsGrad }}
          />
        </div>

        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--c-text-3)' }}>
          {tauxEpargne >= 20
            ? 'Excellent ! Vous épargnez bien.'
            : tauxEpargne >= 10
            ? 'Correct. Essayez de réduire quelques dépenses.'
            : 'Faible. Consultez l\'IA pour des conseils.'}
        </p>
      </motion.div>

      {/* ── Objectifs progress ── */}
      <motion.div {...fadeUp(0.4)} className="liquid-glass" style={{ borderRadius: 20, padding: 28 }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)', fontStyle: 'italic',
          fontSize: 20, fontWeight: 400, color: 'var(--c-heading)', letterSpacing: '-0.5px', marginBottom: 20,
        }}>Avancement des objectifs</h3>

        {objectifs.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--c-text-4)', textAlign: 'center', padding: '20px 0' }}>
            Aucun objectif défini
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {objectifs.map((o, i) => {
              const pct = Math.min(100, Math.round((o.montant_actuel / o.montant_cible) * 100));
              const atteint = o.statut === 'atteint';
              return (
                <motion.div key={o.id}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', color: atteint ? '#34d399' : '#818cf8' }}>
                        <AppIcon name={atteint ? 'success' : 'objectifs'} size={13} />
                      </span>
                      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 13, color: 'var(--c-text)' }}>
                        {o.titre}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12,
                      color: atteint ? '#34d399' : '#818cf8',
                    }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: 'var(--c-glass)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, delay: 0.55 + i * 0.08, ease: 'easeOut' }}
                      style={{
                        height: '100%', borderRadius: 99,
                        background: atteint ? 'linear-gradient(90deg,#34d399,#10b981)' : 'linear-gradient(90deg,#818cf8,#6366f1)',
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}