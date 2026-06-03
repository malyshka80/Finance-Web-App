// ============================================================
// src/pages/LoginPage.jsx â€” Restyled: Liquid Glass Dark Theme
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../Context/AuthContext';
import { motion } from 'framer-motion';
import AppIcon from '../Components/AppIcon';
import MoneyAtmosphere from '../Components/MoneyAtmosphere';

const inputStyle = (hasError) => ({
  width: '100%', background: 'var(--c-glass)',
  border: `1px solid ${hasError ? 'rgba(248,113,113,0.5)' : 'var(--c-border)'}`,
  borderRadius: 12, padding: '13px 16px',
  fontFamily: 'var(--font-body)', fontWeight: 300,
  fontSize: 14, color: 'var(--c-text)', outline: 'none',
  transition: 'border-color 0.2s', width: '100%',
});

const labelStyle = {
  fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 11,
  letterSpacing: '0.07em', textTransform: 'uppercase',
  color: 'var(--c-text-3)', display: 'block', marginBottom: 7,
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email invalide';
    if (!form.password) errs.password = 'Mot de passe requis';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Bienvenue !');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Identifiants invalides');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--background)', position: 'relative', overflow: 'hidden', padding: 24,
    }}>
      <MoneyAtmosphere variant="auth" density={0.72} />
      {/* Ambient orbs */}
      <div style={{ position: 'absolute', top: -100, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,0.12) 0%,transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: 18, margin: '0 auto 16px',
            background: 'var(--c-glass)',
            border: '1px solid var(--c-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--c-heading)',
          }}>
            <AppIcon name="wallet" size={23} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: 30, fontWeight: 400, color: 'var(--c-heading)',
            letterSpacing: '-2px', marginBottom: 6,
          }}>FinanceApp</h1>
          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 300,
            fontSize: 13, color: 'var(--c-text-3)',
          }}>Gérez votre argent intelligemment</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="liquid-glass"
          style={{ borderRadius: 24, padding: '32px 32px 28px' }}
        >
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: 22, fontWeight: 400, color: 'var(--c-heading)',
            letterSpacing: '-1px', marginBottom: 24,
          }}>Connexion</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="vous@exemple.com"
                style={inputStyle(!!errors.email)}
                onFocus={e => e.target.style.borderColor = 'var(--c-border-2)'}
                onBlur={e => e.target.style.borderColor = errors.email ? 'rgba(248,113,113,0.5)' : 'var(--c-border)'}
              />
              {errors.email && (
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: '#f87171', marginTop: 5 }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} placeholder="Min. 6 caractères"
                  style={{ ...inputStyle(!!errors.password), paddingRight: 46 }}
                  onFocus={e => e.target.style.borderColor = 'var(--c-border-2)'}
                  onBlur={e => e.target.style.borderColor = errors.password ? 'rgba(248,113,113,0.5)' : 'var(--c-border)'}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'black', transition: 'color 0.2s',
                    display: 'flex', alignItems: 'center', padding: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--c-border-2)'}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: '#f87171', marginTop: 5 }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit" className="btn-primary"
              disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '14px', fontSize: 14 }}
            >
              {loading ? (
                <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              ) : 'Se connecter'}
            </motion.button>
          </form>

          {/* Register link */}
          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13,
            color: 'var(--c-text-3)', textAlign: 'center', marginTop: 22,
          }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{
              color: 'var(--c-text)', fontWeight: 400,
              textDecoration: 'none', borderBottom: '1px solid var(--c-border-2)',
              paddingBottom: 1, transition: 'color 0.2s, border-color 0.2s',
            }}>
              S'inscrire
            </Link>
          </p>
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
