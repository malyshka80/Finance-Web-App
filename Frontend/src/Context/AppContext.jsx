// ============================================================
// src/Context/AppContext.jsx
// ─ Every mutation now persists to the backend via apiActions.
// ─ loadData also fetches taches + categories on login.
// ─ Wallet loading now includes transactions.
// ============================================================

import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';

// ── Reducer ───────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {

    case 'SET_SECTION':
      return { ...state, activeSection: action.payload };

    case 'SET_WALLET':
      return { ...state, wallet: action.payload };

    case 'ADD_TRANSACTION':
      return {
        ...state,
        wallet: {
          ...state.wallet,
          solde: state.wallet.solde + action.payload.montant,
          transactions: [action.payload, ...(state.wallet.transactions || [])],
        },
      };

    case 'SET_DEPENSES':
      return { ...state, depenses: action.payload };

    case 'ADD_DEPENSE':
      return {
        ...state,
        depenses: [action.payload, ...state.depenses],
        wallet: {
          ...state.wallet,
          solde: Math.max(0, state.wallet.solde - action.payload.montant),
        },
      };

    case 'DELETE_DEPENSE':
      return {
        ...state,
        depenses: state.depenses.filter(d => d.id !== action.payload),
      };

    case 'SET_OBJECTIFS':
      return { ...state, objectifs: action.payload };

    case 'ADD_OBJECTIF':
      return { ...state, objectifs: [action.payload, ...state.objectifs] };

    case 'UPDATE_OBJECTIF':
      return {
        ...state,
        objectifs: state.objectifs.map(o =>
          o.id === action.payload.id ? action.payload : o
        ),
      };

    case 'SET_TACHES':
      return { ...state, taches: action.payload };

    case 'ADD_TACHE':
      return { ...state, taches: [action.payload, ...state.taches] };

    case 'TOGGLE_TACHE':
      return {
        ...state,
        taches: state.taches.map(t =>
          t.id === action.payload ? { ...t, terminee: !t.terminee } : t
        ),
      };

    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };

    case 'SET_STATS':
      return { ...state, stats: action.payload };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, { id: Date.now(), ...action.payload }],
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────
const AppContext = createContext(null);

const FALLBACK_USER = { id: null, nom: 'Invité', revenu_mensuel: 0, situation: '' };

export function AppProvider({ children }) {
  const { user, authFetch, isAuthenticated } = useAuth();

  const initialState = {
    user:           user || FALLBACK_USER,
    wallet:         { solde: 0, transactions: [] },
    depenses:       [],
    objectifs:      [],
    taches:         [],
    categories:     [],    // ← real DB categories (UUIDs)
    stats:          null,
    loading:        false,
    activeSection:  'dashboard',
    notifications:  [],
  };

  const [state, dispatch] = useReducer(appReducer, initialState);

  // ── Load all data when authenticated ──
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    loadData(dispatch, user.id, authFetch);
  }, [isAuthenticated, user?.id]);

  // ── API Actions ───────────────────────────────────────────
  // Each action: 1) calls backend  2) updates local state on success
  // ─────────────────────────────────────────────────────────
  const apiActions = useMemo(() => {
    if (!user?.id || !authFetch) return {};

    // ── Dépenses ──────────────────────────────────────────
    const addDepense = async ({ categorieId, montant, description, date_depense }) => {
      try {
        const res = await authFetch('/depenses', {
          method: 'POST',
          body: JSON.stringify({
            userId: user.id,
            categorieId,
            montant,
            description: description || '',
            date_depense,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur ajout dépense');

        const dep = data.depense;
        dispatch({
          type: 'ADD_DEPENSE',
          payload: {
            id:            dep.id,
            montant:       parseFloat(dep.montant),
            description:   dep.description,
            date_depense:  dep.date_depense,
            categorie_nom: dep.categorie_nom,
            icone:         dep.icone,
            couleur:       dep.couleur,
          },
        });
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: { message: `Dépense de ${montant.toLocaleString('fr-AR')} DT enregistrée`, type: 'info' },
        });
        return true;
      } catch (err) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message: err.message, type: 'error' } });
        return false;
      }
    };

    const deleteDepense = async (id) => {
      try {
        const res = await authFetch(`/depenses/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Erreur suppression');
        }
        dispatch({ type: 'DELETE_DEPENSE', payload: id });
        return true;
      } catch (err) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message: err.message, type: 'error' } });
        return false;
      }
    };

    // ── Objectifs ──────────────────────────────────────────
    const addObjectif = async ({ titre, description, montant_cible, date_limite }) => {
      try {
        const res = await authFetch('/objectifs', {
          method: 'POST',
          body: JSON.stringify({ userId: user.id, titre, description, montant_cible, date_limite }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur création objectif');

        dispatch({
          type: 'ADD_OBJECTIF',
          payload: {
            ...data,
            montant_cible:  parseFloat(data.montant_cible),
            montant_actuel: parseFloat(data.montant_actuel || 0),
          },
        });
        return true;
      } catch (err) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message: err.message, type: 'error' } });
        return false;
      }
    };

    const virementObjectif = async (objectif, montant) => {
      try {
        const nouveauMontant = Math.min(
          objectif.montant_cible,
          objectif.montant_actuel + montant
        );
        const res = await authFetch(`/objectifs/${objectif.id}/progression`, {
          method: 'PATCH',
          body: JSON.stringify({ userId: user.id, montant_actuel: nouveauMontant }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur virement');

        dispatch({ type: 'UPDATE_OBJECTIF', payload: data });
        // Deduct from local wallet (backend already deducted in DB)
        dispatch({
          type: 'ADD_TRANSACTION',
          payload: {
            id:          Date.now(),
            montant:     -montant,
            type:        'epargne',
            description: `Épargne: ${objectif.titre}`,
            date_trans:  new Date().toISOString(),
          },
        });
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: { message: `${montant.toLocaleString('fr-AR')} DT ajoutés à "${objectif.titre}"`, type: 'success' },
        });
        return true;
      } catch (err) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message: err.message, type: 'error' } });
        return false;
      }
    };

    // ── Tâches ──────────────────────────────────────────────
    const addTache = async ({ titre, date_echeance, objectif_id }) => {
      try {
        const res = await authFetch('/taches', {
          method: 'POST',
          body: JSON.stringify({
            userId:       user.id,
            titre,
            date_echeance: date_echeance || null,
            objectif_id:   objectif_id   || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur ajout tâche');

        dispatch({ type: 'ADD_TACHE', payload: data });
        return true;
      } catch (err) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message: err.message, type: 'error' } });
        return false;
      }
    };

    const toggleTache = async (id) => {
      try {
        const res = await authFetch(`/taches/${id}/toggle`, { method: 'PATCH' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur mise à jour');

        // Toggle in local state using the id
        dispatch({ type: 'TOGGLE_TACHE', payload: id });
        return true;
      } catch (err) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message: err.message, type: 'error' } });
        return false;
      }
    };

    // ── Wallet ──────────────────────────────────────────────
    const addWalletTransaction = async ({ montant, type, description }) => {
      try {
        const res = await authFetch('/wallet/ajouter', {
          method: 'POST',
          body: JSON.stringify({ userId: user.id, montant, type, description }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur ajout transaction');

        dispatch({
          type: 'ADD_TRANSACTION',
          payload: {
            id:          Date.now(),
            montant,
            type,
            description: description || type,
            date_trans:  new Date().toISOString(),
          },
        });
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: { message: `+${montant.toLocaleString('fr-AR')} DT ajouté !`, type: 'success' },
        });
        return true;
      } catch (err) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message: err.message, type: 'error' } });
        return false;
      }
    };

    return {
      addDepense,
      deleteDepense,
      addObjectif,
      virementObjectif,
      addTache,
      toggleTache,
      addWalletTransaction,
    };
  }, [user?.id, authFetch]);

  return (
    <AppContext.Provider value={{ state: { ...state, user: user || state.user || FALLBACK_USER }, dispatch, apiActions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// ── Data fetching ─────────────────────────────────────────────
async function loadData(dispatch, userId, authFetch) {
  dispatch({ type: 'SET_LOADING', payload: true });

  try {
    const [
      walletRes,
      depensesRes,
      objectifsRes,
      statsRes,
      tachesRes,
      categoriesRes,
    ] = await Promise.allSettled([
      authFetch(`/wallet/${userId}`).then(r => r.json()),
      authFetch(`/depenses/${userId}`).then(r => r.json()),
      authFetch(`/objectifs/${userId}`).then(r => r.json()),
      authFetch(`/stats/${userId}`).then(r => r.json()),
      authFetch(`/taches/${userId}`).then(r => r.json()),
      authFetch('/depenses/categories/all').then(r => r.json()),
    ]);

    // ── Wallet + transactions ──
    if (walletRes.status === 'fulfilled' && !walletRes.value.error) {
      dispatch({
        type: 'SET_WALLET',
        payload: {
          ...walletRes.value.wallet,
          transactions: walletRes.value.transactions || [],   // ← was missing before
        },
      });
    }

    // ── Dépenses ──
    if (depensesRes.status === 'fulfilled' && Array.isArray(depensesRes.value)) {
      dispatch({ type: 'SET_DEPENSES', payload: depensesRes.value });
    }

    // ── Objectifs ──
    if (objectifsRes.status === 'fulfilled' && Array.isArray(objectifsRes.value)) {
      dispatch({ type: 'SET_OBJECTIFS', payload: objectifsRes.value });
    }

    // ── Stats ──
    if (statsRes.status === 'fulfilled' && !statsRes.value.error) {
      dispatch({ type: 'SET_STATS', payload: statsRes.value });
    }

    // ── Tâches ──
    if (tachesRes.status === 'fulfilled' && Array.isArray(tachesRes.value)) {
      dispatch({ type: 'SET_TACHES', payload: tachesRes.value });
    }

    // ── Categories (real DB UUIDs) ──
    if (categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value)) {
      dispatch({ type: 'SET_CATEGORIES', payload: categoriesRes.value });
    }
  } catch (err) {
    console.error('Erreur chargement données:', err);
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
}
