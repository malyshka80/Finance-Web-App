// ============================================================
// src/pages/Dashboard.jsx — Restyled: Liquid Glass Dark Theme
// ============================================================

import { useApp } from '../Context/AppContext';
import { motion } from 'framer-motion';
import AppIcon from '../Components/AppIcon';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

// ── KPI Card ────────────────────────────────────────────────
function KPICard({ title, value, icon, accent, subtitle, delay }) {
  return (
    <motion.div {...fadeUp(delay)}
      className="liquid-glass"
      style={{
        borderRadius: 20,
        padding: '24px 24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent glow */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 100, height: 100, borderRadius: '50%',
        background: accent,
        filter: 'blur(40px)',
        opacity: 0.35,
        zIndex: 0,
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--c-glass)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>
          <AppIcon name={icon} size={16} />
        </span>
        <span style={{
          fontFamily: 'var(--font-body)', fontWeight: 400,
          fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--c-text-3)',
        }}>{title}</span>
      </div>

      <p style={{
        fontFamily: 'var(--font-heading)', fontStyle: 'italic',
        fontSize: 28, fontWeight: 400, color: 'var(--c-heading)',
        letterSpacing: '-1px', lineHeight: 1,
        position: 'relative', zIndex: 1,
      }}>{value}</p>

      {subtitle && (
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 300,
          fontSize: 12, color: 'var(--c-text-3)',
          position: 'relative', zIndex: 1,
        }}>{subtitle}</p>
      )}
    </motion.div>
  );
}

// ── Recent Expense Row ───────────────────────────────────────
function DepenseRow({ depense, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + index * 0.06, duration: 0.35 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 0',
        borderBottom: '1px solid var(--c-divider)',
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 12,
        background: (depense.couleur || '#6366F1') + '22',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0,
      }}>
        <AppIcon name={depense.icone} size={16} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 400,
          fontSize: 13, color: 'var(--c-text)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{depense.description || depense.categorie_nom}</p>
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 300,
          fontSize: 11, color: 'var(--c-text-3)',
          marginTop: 2,
        }}>{depense.categorie_nom}</p>
      </div>

      <p style={{
        fontFamily: 'var(--font-body)', fontWeight: 500,
        fontSize: 13, color: '#f87171', flexShrink: 0,
      }}>−{depense.montant.toLocaleString('fr-Ar')} DT</p>
    </motion.div>
  );
}

// ── Objectif Progress ───────────────────────────────────────
function ObjectifProgress({ objectif, index }) {
  const pct = Math.min(100, Math.round((objectif.montant_actuel / objectif.montant_cible) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + index * 0.07, duration: 0.35 }}
      style={{ padding: '12px 0', borderBottom: '1px solid var(--c-divider)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{
          fontFamily: 'var(--font-body)', fontWeight: 400,
          fontSize: 13, color: 'var(--c-text)',
        }}>{objectif.titre}</span>
        <span style={{
          fontFamily: 'var(--font-body)', fontWeight: 500,
          fontSize: 12, color: pct >= 100 ? '#34d399' : 'var(--c-text-2)',
        }}>{pct}%</span>
      </div>

      <div style={{
        height: 4, borderRadius: 99,
        background: 'var(--c-glass)',
        overflow: 'hidden',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
          style={{
            height: '100%', borderRadius: 99,
            background: pct >= 100
              ? 'linear-gradient(90deg,#34d399,#10b981)'
              : 'linear-gradient(90deg,#818cf8,#6366f1)',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--c-text-3)' }}>
          {objectif.montant_actuel.toLocaleString('fr-Ar')} DT
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--c-text-3)' }}>
          {objectif.montant_cible.toLocaleString('fr-Ar')} DT
        </span>
      </div>
    </motion.div>
  );
}

// ── Glass Card wrapper ───────────────────────────────────────
function GlassCard({ children, delay = 0, style = {} }) {
  return (
    <motion.div {...fadeUp(delay)}
      className="liquid-glass"
      style={{ borderRadius: 20, padding: 24, ...style }}
    >
      {children}
    </motion.div>
  );
}

// ── Section header ───────────────────────────────────────────
function SectionHeader({ title, onSeeAll }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
      <h3 style={{
        fontFamily: 'var(--font-heading)', fontStyle: 'italic',
        fontSize: 18, color: 'var(--c-heading)', fontWeight: 400, letterSpacing: '-0.5px',
      }}>{title}</h3>
      <button onClick={onSeeAll} style={{
        fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 12,
        color: 'var(--c-text-3)', background: 'none', border: 'none',
        cursor: 'pointer', transition: 'color 0.2s',
      }}
        onMouseEnter={e => e.target.style.color = '#fff'}
        onMouseLeave={e => e.target.style.color = 'var(--c-text-3)'}
      >Voir tout →</button>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────
export default function Dashboard() {
  const { state, dispatch } = useApp();
  const { wallet, depenses, objectifs, taches, user } = state;

  const totalDepensesMois = depenses
    .filter(d => {
      const date = new Date(d.date_depense), now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, d) => sum + d.montant, 0);

  const economiesMois = user.revenu_mensuel - totalDepensesMois;
  const tachesEnCours = taches.filter(t => !t.terminee).length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Page header ── */}
      <motion.div {...fadeUp(0)} style={{ marginBottom: 36 }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)', fontStyle: 'italic',
          fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 400,
          color: 'var(--c-heading)', letterSpacing: '-2px', lineHeight: 1,
          marginBottom: 8,
        }}>
          Bonjour, {user.nom}
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 300,
          fontSize: 14, color: 'var(--c-text-3)',
        }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* ── KPI Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, marginBottom: 24,
      }}>
        <KPICard title="Solde actuel" value={`${wallet.solde.toLocaleString('fr-Ar')} DT`}
          icon="wallet" accent="rgba(99,102,241,0.6)" subtitle="Portefeuille disponible" delay={0.1} />
        <KPICard title="Dépenses du mois" value={`${totalDepensesMois.toLocaleString('fr-Ar')} DT`}
          icon="depenses" accent="rgba(239,68,68,0.6)" subtitle={`Sur ${user.revenu_mensuel.toLocaleString('fr-Ar')} DT`} delay={0.18} />
        <KPICard title="Économies" value={`${economiesMois.toLocaleString('fr-Ar')} DT`}
          icon="epargne" accent="rgba(16,185,129,0.6)" subtitle={economiesMois > 0 ? 'Bonne gestion !' : 'Budget dépassé'} delay={0.26} />
        <KPICard title="Tâches en attente" value={tachesEnCours}
          icon="taches" accent="rgba(245,158,11,0.6)" subtitle={`${taches.length} tâches au total`} delay={0.34} />
      </div>

      {/* ── Main grid: Dépenses + Objectifs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        <GlassCard delay={0.3}>
          <SectionHeader title="Dépenses récentes" onSeeAll={() => dispatch({ type: 'SET_SECTION', payload: 'depenses' })} />
          <div>
            {depenses.slice(0, 5).map((d, i) => <DepenseRow key={d.id} depense={d} index={i} />)}
            {depenses.length === 0 && (
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--c-text-4)', padding: '20px 0', textAlign: 'center' }}>
                Aucune dépense enregistrée
              </p>
            )}
          </div>
        </GlassCard>

        <GlassCard delay={0.36}>
          <SectionHeader title="Objectifs" onSeeAll={() => dispatch({ type: 'SET_SECTION', payload: 'objectifs' })} />
          <div>
            {objectifs.slice(0, 3).map((o, i) => <ObjectifProgress key={o.id} objectif={o} index={i} />)}
          </div>
        </GlassCard>
      </div>

      {/* ── Tâches urgentes ── */}
      <GlassCard delay={0.42}>
        <SectionHeader title="Tâches à faire" onSeeAll={() => dispatch({ type: 'SET_SECTION', payload: 'taches' })} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {taches.filter(t => !t.terminee).slice(0, 3).map((t, i) => (
            <motion.div key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.07 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 12,
                background: 'var(--c-glass)',
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'rgba(99,102,241,0.8)', flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'var(--font-body)', fontWeight: 400,
                fontSize: 13, color: 'var(--c-text)', flex: 1,
              }}>{t.titre}</span>
              {t.date_echeance && (
                <span style={{
                  fontFamily: 'var(--font-body)', fontWeight: 300,
                  fontSize: 11, color: 'var(--c-text-3)',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}>
                  <AppIcon name="calendar" size={12} />
                  {new Date(t.date_echeance).toLocaleDateString('fr-FR')}
                </span>
              )}
            </motion.div>
          ))}
          {tachesEnCours === 0 && (
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--c-text-3)', textAlign: 'center', padding: '16px 0' }}>
              Toutes les tâches sont terminées !
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}