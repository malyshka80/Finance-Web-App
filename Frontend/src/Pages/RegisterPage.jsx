// ============================================================
// src/pages/RegisterPage.jsx — Restyled: Liquid Glass Dark Theme
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../Context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import AppIcon from '../Components/AppIcon';
import MoneyAtmosphere from '../Components/MoneyAtmosphere';

const STEPS = ['Compte', 'Profil', 'Finances'];

const inputStyle = (hasError = false) => ({
  width: '100%', background: 'var(--c-glass)',
  border: `1px solid ${hasError ? 'rgba(248,113,113,0.5)' : 'var(--c-border)'}`,
  borderRadius: 12, padding: '12px 14px',
  fontFamily: 'var(--font-body)', fontWeight: 300,
  fontSize: 13, color: 'var(--c-text)', outline: 'none',
});

const labelStyle = {
  fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 11,
  letterSpacing: '0.07em', textTransform: 'uppercase',
  color: 'var(--c-text-3)', display: 'block', marginBottom: 6,
};

const errStyle = { fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: '#f87171', marginTop: 4 };

function Field({ name, label, type = 'text', placeholder = '', value, error, onValueChange }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={e => onValueChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle(!!error)}
      />
      {error && <p style={errStyle}>{error}</p>}
    </div>
  );
}

function SelectField({ name, label, options, value, error, onValueChange }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select
        name={name}
        value={value}
        onChange={e => onValueChange(e.target.value)}
        style={inputStyle(!!error)}
      >
        <option value="">— Choisir —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p style={errStyle}>{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate      = useNavigate();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors]   = useState({});
  const [form, setForm] = useState({
    email: '', password: '', first_name: '', last_name: '',
    professional_status: '', family_status: '',
    has_children: false, children_count: 0,
    monthly_income: '', currency: 'TND', language: 'fr',
  });

  const set = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      if (!form.first_name) errs.first_name = 'Prénom requis';
      if (!form.last_name)  errs.last_name  = 'Nom requis';
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email invalide';
      if (!form.password || form.password.length < 6) errs.password = 'Min. 6 caractères';
    }
    if (step === 1) {
      if (!form.professional_status) errs.professional_status = 'Requis';
      if (!form.family_status)       errs.family_status       = 'Requis';
    }
    if (step === 2) {
      if (!form.monthly_income || isNaN(form.monthly_income) || form.monthly_income < 0)
        errs.monthly_income = 'Montant invalide';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      await register({ ...form, monthly_income: parseFloat(form.monthly_income) || 0 });
      toast.success('Compte créé avec succès !');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création du compte');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--background)', position: 'relative', overflow: 'hidden', padding: 24,
    }}>
      <MoneyAtmosphere variant="auth" density={0.72} />
      {/* Orbs */}
      <div style={{ position: 'absolute', top: -80, right: -100, width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.16) 0%,transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,185,129,0.12) 0%,transparent 70%)', filter: 'blur(70px)', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55 }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px',
            background: 'var(--c-glass)',
            border: '1px solid var(--c-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-heading)',
          }}>
            <AppIcon name="wallet" size={21} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: 26, fontWeight: 400, color: 'var(--c-heading)', letterSpacing: '-1.5px',
          }}>Créer un compte</h1>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ display: 'flex', gap: 8, marginBottom: 20 }}
        >
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
              <div style={{
                height: 3, width: '100%', borderRadius: 99,
                background: i <= step ? 'var(--btn-primary-bg)' : 'var(--c-glass-2)',
                transition: 'background 0.4s',
              }} />
              <span style={{
                fontFamily: 'var(--font-body)', fontWeight: i === step ? 500 : 300,
                fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: i <= step ? 'var(--c-text)' : 'var(--c-text-4)',
                transition: 'color 0.3s',
              }}>{s}</span>
            </div>
          ))}
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="liquid-glass"
          style={{ borderRadius: 24, padding: '28px 28px 24px' }}
        >
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{   opacity: 0, x: -20, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              {step === 0 && <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field name="first_name" label="Prénom" placeholder="Jean" value={form.first_name} error={errors.first_name} onValueChange={value => set('first_name', value)} />
                  <Field name="last_name"  label="Nom"    placeholder="Dupont" value={form.last_name} error={errors.last_name} onValueChange={value => set('last_name', value)} />
                </div>
                <Field name="email" label="Email" type="email" placeholder="vous@exemple.com" value={form.email} error={errors.email} onValueChange={value => set('email', value)} />
                <div>
                  <label style={labelStyle}>Mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPwd ? 'text' : 'password'} value={form.password}
                      onChange={e => set('password', e.target.value)} placeholder="Min. 6 caractères"
                      style={{ ...inputStyle(!!errors.password), paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-text-3)', display: 'flex', alignItems: 'center' }}>
                      {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && <p style={errStyle}>{errors.password}</p>}
                </div>
              </>}

              {step === 1 && <>
                <SelectField name="professional_status" label="Situation professionnelle" value={form.professional_status} error={errors.professional_status} onValueChange={value => set('professional_status', value)} options={[
                  { value: 'student', label: 'Étudiant(e)' },
                  { value: 'employed', label: 'Salarié(e)' },
                  { value: 'self_employed', label: 'Indépendant(e)' },
                  { value: 'unemployed', label: 'Sans emploi' },
                  { value: 'retired', label: 'Retraité(e)' },
                ]} />
                <SelectField name="family_status" label="Situation familiale" value={form.family_status} error={errors.family_status} onValueChange={value => set('family_status', value)} options={[
                  { value: 'single', label: 'Célibataire' },
                  { value: 'married', label: 'Marié(e)' },
                  { value: 'divorced', label: 'Divorcé(e)' },
                  { value: 'widowed', label: 'Veuf/Veuve' },
                ]} />
                <div>
                  <label style={labelStyle}>Avez-vous des enfants ?</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[{ v: false, l: 'Non' }, { v: true, l: 'Oui' }].map(({ v, l }) => (
                      <button key={l} type="button" onClick={() => set('has_children', v)}
                        style={{
                          flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                          fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 13,
                          background: form.has_children === v ? 'var(--c-glass-3)' : 'var(--c-glass)',
                          color: form.has_children === v ? 'var(--c-heading)' : 'var(--c-text-3)',
                          transition: 'all 0.2s',
                          outline: form.has_children === v ? '1px solid var(--c-border-2)' : 'none',
                        }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {form.has_children && <Field name="children_count" label="Nombre d'enfants" type="number" placeholder="2" value={form.children_count} error={errors.children_count} onValueChange={value => set('children_count', value)} />}
              </>}

              {step === 2 && <>
                <div>
                  <label style={labelStyle}>Revenu mensuel</label>
                  <input type="number" min="0" value={form.monthly_income}
                    onChange={e => set('monthly_income', e.target.value)} placeholder="3500"
                    style={inputStyle(!!errors.monthly_income)} />
                  {errors.monthly_income && <p style={errStyle}>{errors.monthly_income}</p>}
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'var(--c-text-4)', marginTop: 5 }}>
                    Utilisé comme solde initial de votre portefeuille.
                  </p>
                </div>
                <SelectField name="currency" label="Devise" value={form.currency} error={errors.currency} onValueChange={value => set('currency', value)} options={[
                  { value: 'TND', label: 'Dinar Tunisien (TND)' },
            
                  
                ]} />
                
              </>}
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            {step > 0 && (
              <button type="button" onClick={handleBack} className="btn-ghost"
                style={{ flex: 1, justifyContent: 'center', gap: 6, display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={15} /> Retour
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={handleNext} className="btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}>
                Suivant <ChevronRight size={15} />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} className="btn-primary"
                style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
                {loading ? '...' : 'Créer mon compte'}
              </button>
            )}
          </div>
        </motion.div>

        {/* Login link */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ textAlign: 'center', marginTop: 18, fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--c-text-3)' }}
        >
          Déjà un compte ?{' '}
          <Link to="/login" style={{
            color: 'var(--c-text)', fontWeight: 400,
            textDecoration: 'none', borderBottom: '1px solid var(--c-border-2)', paddingBottom: 1,
          }}>Se connecter</Link>
        </motion.p>
      </div>
    </div>
  );
}
