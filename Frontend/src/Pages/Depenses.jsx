import { useState, useMemo } from 'react';
import { useApp } from '../Context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import AppIcon from '../Components/AppIcon';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
  transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const inputStyle = {
  width: '100%', background: 'var(--c-glass)', border: '1px solid var(--c-border)',
  borderRadius: 12, padding: '11px 14px', fontFamily: 'var(--font-body)',
  fontWeight: 300, fontSize: 13, color: 'var(--c-text)', outline: 'none', transition: 'border-color 0.2s',
};
const labelStyle = {
  fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 11,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  color: 'var(--c-text-3)', display: 'block', marginBottom: 6,
};

export default function Depenses() {
  // ✅ FIX 1: use apiActions (not dispatch) + pull real DB categories
  const { state, apiActions } = useApp();
  const { depenses, categories } = state;

  const [showForm, setShowForm] = useState(false);
  const [filtrecat, setFiltrecat] = useState('');
  const [filtremois, setFiltremois] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    montant: '', categorieId: '', description: '',
    date_depense: new Date().toISOString().split('T')[0],
  });

  // ✅ FIX 2: default to first real UUID when nothing is selected yet
  const effectiveCatId = form.categorieId || (categories[0]?.id ?? '');

  const depensesFiltrees = useMemo(() => depenses.filter(d => {
    const matchCat  = !filtrecat  || d.categorie_nom === filtrecat;
    const matchMois = !filtremois || d.date_depense?.startsWith(filtremois);
    return matchCat && matchMois;
  }), [depenses, filtrecat, filtremois]);

  const totalFiltré = depensesFiltrees.reduce((s, d) => s + d.montant, 0);

  const parCategorie = useMemo(() => {
    const map = {};
    depenses.forEach(d => {
      if (!map[d.categorie_nom]) map[d.categorie_nom] = { total: 0, icone: d.icone, couleur: d.couleur };
      map[d.categorie_nom].total += d.montant;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total).slice(0, 5);
  }, [depenses]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // ✅ FIX 3: apiActions.addDepense() → POST /api/depenses → writes to DB
  const handleAjouter = async e => {
    e.preventDefault();
    const montantNum = parseFloat(form.montant);
    if (!effectiveCatId || isNaN(montantNum) || montantNum <= 0) return;
    setSubmitting(true);
    const success = await apiActions.addDepense({
      categorieId: effectiveCatId,
      montant: montantNum,
      description: form.description,
      date_depense: form.date_depense,
    });
    setSubmitting(false);
    if (success) {
      setForm({ montant: '', categorieId: '', description: '', date_depense: new Date().toISOString().split('T')[0] });
      setShowForm(false);
    }
  };

  // ✅ FIX 4: apiActions.deleteDepense() → DELETE /api/depenses/:id
  const handleSupprimer = async id => {
    if (window.confirm('Supprimer cette dépense ?')) {
      await apiActions.deleteDepense(id);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <motion.div {...fadeUp(0)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: 'clamp(2rem,4vw,2.6rem)', fontWeight: 400, color: 'var(--c-heading)', letterSpacing: '-2px', lineHeight: 1, marginBottom: 6 }}>Dépenses</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--c-text-3)' }}>{depenses.length} dépense(s) enregistrée(s)</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ marginTop: 4 }}>+ Ajouter</motion.button>
      </motion.div>

      {parCategorie.length > 0 && (
        <motion.div {...fadeUp(0.1)} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          {parCategorie.map(([nom, data]) => (
            <button key={nom} onClick={() => setFiltrecat(filtrecat === nom ? '' : nom)} className="liquid-glass"
              style={{ borderRadius: 9999, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', border: 'none', outline: filtrecat === nom ? `1.5px solid ${data.couleur}` : 'none', transition: 'all 0.2s', background: filtrecat === nom ? `${data.couleur}18` : undefined }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', color: data.couleur }}><AppIcon name={data.icone} size={14} /></span>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 12, color: filtrecat === nom ? 'var(--c-heading)' : 'var(--c-text-2)' }}>{nom}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 11, color: data.couleur }}>{data.total.toLocaleString('fr-Ar')} DT</span>
            </button>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0, filter: 'blur(8px)' }} animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }} exit={{ opacity: 0, height: 0, filter: 'blur(4px)' }} transition={{ duration: 0.35 }} className="liquid-glass" style={{ borderRadius: 20, padding: 28, marginBottom: 20, overflow: 'hidden' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: 20, fontWeight: 400, color: 'var(--c-heading)', letterSpacing: '-0.5px', marginBottom: 20 }}>Nouvelle dépense</h3>
            <form onSubmit={handleAjouter}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Montant (DT) *</label>
                  <input type="number" name="montant" value={form.montant} onChange={handleChange} style={inputStyle} placeholder="1500" required min="1" />
                </div>
                <div>
                  <label style={labelStyle}>Catégorie *</label>
                  {/* ✅ FIX: real UUIDs from state.categories */}
                  <select name="categorieId" value={effectiveCatId} onChange={handleChange} style={inputStyle}>
                    {categories.length === 0
                      ? <option value="">Chargement…</option>
                      : categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)
                    }
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={labelStyle}>Description</label>
                  <input type="text" name="description" value={form.description} onChange={handleChange} style={inputStyle} placeholder="Ex: Facture Sonelgaz" />
                </div>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input type="date" name="date_depense" value={form.date_depense} onChange={handleChange} style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? '…' : '✅ Enregistrer'}</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div {...fadeUp(0.15)} className="liquid-glass" style={{ borderRadius: 14, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Mois</label>
          <input type="month" value={filtremois} onChange={e => setFiltremois(e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '7px 12px', colorScheme: 'dark' }} />
        </div>
        {(filtrecat || filtremois) && (
          <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }} onClick={() => { setFiltrecat(''); setFiltremois(''); }}>✕ Réinitialiser</button>
        )}
        <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--c-text-3)' }}>
          Total : <span style={{ fontWeight: 500, color: 'var(--c-heading)' }}>{totalFiltré.toLocaleString('fr-Ar')} DT</span>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.2)} className="liquid-glass" style={{ borderRadius: 20, overflow: 'hidden' }}>
        {depensesFiltrees.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--c-text-4)', padding: '40px', textAlign: 'center' }}>Aucune dépense trouvée</p>
        ) : (
          depensesFiltrees.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.04 }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', borderBottom: '1px solid var(--c-divider)', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--c-glass-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: (d.couleur || '#6366f1') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
                <AppIcon name={d.icone} size={17} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 13, color: 'var(--c-text)', marginBottom: 2 }}>{d.description || d.categorie_nom}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--c-text-3)' }}>{d.categorie_nom} · {new Date(d.date_depense).toLocaleDateString('fr-FR')}</p>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 14, color: '#f87171', flexShrink: 0 }}>−{d.montant.toLocaleString('fr-Ar')} DT</p>
              <button onClick={() => handleSupprimer(d.id)}
                style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', fontSize: 13, transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                title="Supprimer">🗑️</button>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}