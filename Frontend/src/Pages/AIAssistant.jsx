// ============================================================
// src/pages/AIAssistant.jsx — Ollama Local AI Integration
// Uses Ollama's local REST API (http://localhost:11434)
// Free, runs fully offline. Make sure Ollama is running and
// a model is pulled: e.g.  ollama pull llama3
// ============================================================
import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../Context/AppContext'


const OLLAMA_MODEL   = import.meta.env.VITE_OLLAMA_MODEL   || 'llama3'
const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_ENDPOINT = `${OLLAMA_BASE_URL}/api/chat`

// ── Styles ────────────────────────────────────────────────────
const styles = {
  page: {
    maxWidth: 980,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    minHeight: 'calc(100vh - 72px)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    fontFamily: 'var(--font-heading)',
    fontStyle: 'italic',
    fontWeight: 400,
    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
    color: 'var(--c-heading)',
    letterSpacing: '-1px',
    margin: 0,
  },
  subtitle: {
    marginTop: 6,
    color: 'var(--c-text-3)',
    fontSize: 13,
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
  },
  modelBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  badgeOnline: {
    borderRadius: 999,
    padding: '7px 14px',
    fontSize: 12,
    fontWeight: 500,
    color: '#34d399',
    background: 'rgba(52,211,153,0.12)',
    border: '1px solid rgba(52,211,153,0.35)',
    fontFamily: 'var(--font-body)',
  },
  badgeOffline: {
    borderRadius: 999,
    padding: '7px 14px',
    fontSize: 12,
    fontWeight: 500,
    color: '#fbbf24',
    background: 'rgba(251,191,36,0.12)',
    border: '1px solid rgba(251,191,36,0.35)',
    fontFamily: 'var(--font-body)',
  },
  badgeError: {
    borderRadius: 999,
    padding: '7px 14px',
    fontSize: 12,
    fontWeight: 500,
    color: '#f87171',
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(248,113,113,0.35)',
    fontFamily: 'var(--font-body)',
  },
  modelLabel: {
    fontSize: 11,
    color: 'var(--c-text-4)',
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
    textAlign: 'right',
  },
  chatBox: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 18,
    flex: 1,
    minHeight: '65vh',
    overflow: 'hidden',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  rowAi: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  rowUser: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  aiBubble: {
    maxWidth: '80%',
    borderRadius: 14,
    padding: '12px 16px',
    background: 'var(--c-glass)',
    border: '1px solid var(--c-border)',
  },
  userBubble: {
    maxWidth: '80%',
    borderRadius: 14,
    padding: '12px 16px',
    background: 'rgba(99,102,241,0.22)',
    border: '1px solid rgba(129,140,248,0.45)',
  },
  messageText: {
    margin: 0,
    color: 'var(--c-text)',
    fontSize: 14,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
  },
  time: {
    display: 'block',
    marginTop: 6,
    fontSize: 10,
    color: 'var(--c-text-3)',
    fontFamily: 'var(--font-body)',
  },
  quickRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    padding: '0 18px 14px',
  },
  quickButton: {
    border: '1px solid var(--c-border)',
    background: 'var(--c-glass)',
    color: 'var(--c-text-2)',
    borderRadius: 999,
    padding: '7px 13px',
    fontSize: 12,
    fontFamily: 'var(--font-body)',
    fontWeight: 400,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  inputRow: {
    display: 'flex',
    gap: 10,
    padding: 14,
    borderTop: '1px solid var(--c-border)',
    background: 'var(--c-glass)',
  },
  textarea: {
    flex: 1,
    borderRadius: 12,
    border: '1px solid var(--c-border)',
    background: 'var(--c-glass)',
    color: 'var(--c-text)',
    padding: '10px 14px',
    resize: 'none',
    minHeight: 46,
    fontSize: 14,
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
    outline: 'none',
  },
  sendButton: {
    borderRadius: 12,
    border: 'none',
    padding: '0 20px',
    background: 'var(--btn-primary-bg)',
    color: 'var(--btn-primary-color)',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    minWidth: 96,
    transition: 'opacity 0.2s',
  },
  sendDisabled: {
    borderRadius: 12,
    border: 'none',
    padding: '0 20px',
    background: 'var(--c-glass-3)',
    color: 'var(--c-text-3)',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'not-allowed',
    minWidth: 96,
  },
  typingDots: {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
    padding: '4px 0',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'var(--c-text-3)',
    animation: 'pulse 1.2s infinite',
  },
  infoBox: {
    borderRadius: 14,
    padding: '14px 18px',
    background: 'rgba(251,191,36,0.08)',
    border: '1px solid rgba(251,191,36,0.2)',
    fontSize: 13,
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
    color: 'var(--c-text-2)',
    lineHeight: 1.6,
  },
}

const QUICK_PROMPTS = [
  'Analyse mes dépenses de ce mois',
  'Comment améliorer mon taux d\'épargne ?',
  'Donne-moi 3 conseils financiers',
  'Comment prioriser mes objectifs ?',
]

// ── System prompt with user's financial context ───────────────
function buildSystemPrompt(state) {
  const { user, wallet, depenses, objectifs, taches } = state
  const totalDepenses = depenses.reduce((s, d) => s + d.montant, 0)
  const economies = user.revenu_mensuel - totalDepenses
  const tauxEpargne = user.revenu_mensuel > 0
    ? Math.round((economies / user.revenu_mensuel) * 100)
    : 0

  // Group expenses by category for context
  const parCat = {}
  depenses.forEach(d => {
    parCat[d.categorie_nom] = (parCat[d.categorie_nom] || 0) + d.montant
  })
  const catSummary = Object.entries(parCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat, amt]) => `  - ${cat}: ${amt.toLocaleString('fr-FR')} DT`)
    .join('\n')

  return `Tu es un assistant financier personnel bienveillant et pratique.
Réponds toujours en français, de façon concise et directe (3-4 paragraphes max).
Donne des conseils actionnables et personnalisés basés sur les données réelles de l'utilisateur.

=== DONNÉES FINANCIÈRES DE ${user.nom.toUpperCase()} ===
Revenu mensuel : ${user.revenu_mensuel.toLocaleString('fr-FR')} DT
Solde portefeuille : ${wallet.solde.toLocaleString('fr-FR')} DT
Dépenses totales : ${totalDepenses.toLocaleString('fr-FR')} DT
Économies estimées : ${economies.toLocaleString('fr-FR')} DT
Taux d'épargne : ${tauxEpargne}%

Top catégories de dépenses :
${catSummary || '  (aucune dépense enregistrée)'}

Objectifs financiers : ${objectifs.length} (${objectifs.filter(o => o.statut === 'atteint').length} atteints)
Tâches en cours : ${taches.filter(t => !t.terminee).length} / ${taches.length}
=== FIN DES DONNÉES ===`
}

// ── Fallback reply when Ollama is unavailable ─────────────────
function buildLocalReply(userText, state) {
  const totalDepenses = state.depenses.reduce((s, d) => s + d.montant, 0)
  const reste = state.user.revenu_mensuel - totalDepenses
  const q = userText.toLowerCase()

  if (q.includes('dépense') || q.includes('depense')) {
    return `Ce mois, vous avez dépensé ${totalDepenses.toLocaleString('fr-FR')} DT sur un revenu de ${state.user.revenu_mensuel.toLocaleString('fr-FR')} DT.\n\nConseil : identifiez la catégorie la plus élevée et fixez-lui un plafond hebdomadaire.`
  }
  if (q.includes('objectif')) {
    return `Vous avez ${state.objectifs.length} objectifs financiers. Concentrez-vous sur un objectif principal et alimentez-le chaque semaine avec un montant fixe.`
  }
  if (q.includes('épargne') || q.includes('epargne') || q.includes('améliorer')) {
    const taux = state.user.revenu_mensuel > 0 ? Math.round((reste / state.user.revenu_mensuel) * 100) : 0
    return `Votre taux d'épargne estimé est de ${taux}%.\n\nPour l'améliorer : règle des 50/30/20 (50% besoins, 30% envies, 20% épargne). Réduisez d'abord votre plus grande catégorie de dépenses.`
  }
  if (q.includes('conseil')) {
    return `3 conseils pour votre situation :\n1. Suivez vos dépenses chaque semaine\n2. Automatisez un virement mensuel vers votre objectif principal\n3. Réduisez les petites dépenses récurrentes qui s'accumulent`
  }
  return `Résumé rapide : solde ${state.wallet.solde.toLocaleString('fr-FR')} DT, reste estimé ${reste.toLocaleString('fr-FR')} DT ce mois.\n\n⚠️ Ollama n'est pas disponible. Lancez Ollama et assurez-vous que le modèle "${OLLAMA_MODEL}" est installé avec : ollama pull ${OLLAMA_MODEL}`
}

function nowLabel(ts) {
  return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// ── Component ─────────────────────────────────────────────────
export default function AIAssistant() {
  const { state } = useApp()
  const [ollamaStatus, setOllamaStatus] = useState('checking') // 'checking' | 'online' | 'offline'
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const bottomRef = useRef(null)

  // ── Check if Ollama is running on mount ──
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
          signal: AbortSignal.timeout(3000),
        })
        setOllamaStatus(res.ok ? 'online' : 'offline')
      } catch {
        setOllamaStatus('offline')
      }
    }
    checkOllama()
  }, [])

  // ── Initial greeting ──
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `Bonjour ${state.user.nom} ! Je suis votre assistant financier propulsé par ${OLLAMA_MODEL} (Ollama). Je connais vos données financières et peux vous aider à analyser vos dépenses, gérer vos objectifs et améliorer votre épargne. Que voulez-vous savoir ?`,
      timestamp: Date.now(),
    }])
  }, [state.user.nom])

  // ── Auto-scroll ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, streamingText, loading])

  const pushAssistant = (content) => {
    setMessages(prev => [...prev, { role: 'assistant', content, timestamp: Date.now() }])
  }

  // ── Send with streaming ──
  const sendMessage = async (rawText) => {
    const userText = (rawText ?? input).trim()
    if (!userText || loading) return

    setInput('')
    setLoading(true)
    setStreamingText('')

    const nextMessages = [
      ...messages,
      { role: 'user', content: userText, timestamp: Date.now() },
    ]
    setMessages(nextMessages)

    if (ollamaStatus === 'offline') {
      await new Promise(r => setTimeout(r, 300))
      pushAssistant(buildLocalReply(userText, state))
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    try {
      const apiMessages = [
        { role: 'system', content: buildSystemPrompt(state) },
        ...nextMessages.map(m => ({ role: m.role, content: m.content })),
      ]

      const response = await fetch(OLLAMA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: apiMessages,
          stream: true,
          options: {
            temperature: 0.7,
            num_predict: 600,
          },
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Ollama HTTP ${response.status}`)
      }

      // ── Handle streaming response ──
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(Boolean)

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line)
            if (parsed.message?.content) {
              fullText += parsed.message.content
              setStreamingText(fullText)
            }
            if (parsed.done) break
          } catch {
            // skip malformed lines
          }
        }
      }

      setStreamingText('')
      pushAssistant(fullText || 'Je n\'ai pas pu générer une réponse. Réessayez.')
      setOllamaStatus('online')

    } catch (err) {
      setStreamingText('')
      if (err?.name === 'AbortError') {
        pushAssistant('⏱️ Délai dépassé. Ollama met trop de temps à répondre. Essayez un modèle plus léger comme `phi3`.')
      } else {
        setOllamaStatus('offline')
        pushAssistant(buildLocalReply(userText, state))
      }
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  const statusBadge = () => {
    if (ollamaStatus === 'checking') return <div style={styles.badgeOffline}>Vérification…</div>
    if (ollamaStatus === 'online')   return <div style={styles.badgeOnline}>🟢 Ollama en ligne</div>
    return <div style={styles.badgeError}>🔴 Ollama hors ligne</div>
  }

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Assistant IA</h2>
          <p style={styles.subtitle}>Conseils financiers personnalisés · Modèle local</p>
        </div>
        <div style={styles.modelBadge}>
          {statusBadge()}
          <span style={styles.modelLabel}>{OLLAMA_MODEL} · ollama</span>
        </div>
      </div>

      {/* ── Offline warning ── */}
      {ollamaStatus === 'offline' && (
        <div style={styles.infoBox}>
          ⚠️ <strong>Ollama n'est pas détecté.</strong> Pour activer l'IA locale :<br />
          1. Téléchargez Ollama sur <strong>ollama.com</strong><br />
          2. Dans un terminal : <code style={{ background: 'var(--c-glass-2)', padding: '1px 6px', borderRadius: 5, fontSize: 12 }}>ollama pull {OLLAMA_MODEL}</code><br />
          3. Relancez l'application. En attendant, des réponses basiques sont disponibles.
        </div>
      )}

      {/* ── Chat box ── */}
      <div style={styles.chatBox} className="liquid-glass">
        <div style={styles.messages}>
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user'
            return (
              <div key={`${msg.timestamp}-${idx}`} style={isUser ? styles.rowUser : styles.rowAi}>
                <div style={isUser ? styles.userBubble : styles.aiBubble}>
                  <p style={styles.messageText}>{msg.content}</p>
                  <span style={styles.time}>{nowLabel(msg.timestamp)}</span>
                </div>
              </div>
            )
          })}

          {/* ── Streaming preview ── */}
          {streamingText && (
            <div style={styles.rowAi}>
              <div style={styles.aiBubble}>
                <p style={styles.messageText}>{streamingText}<span style={{ opacity: 0.5 }}>▌</span></p>
              </div>
            </div>
          )}

          {/* ── Typing indicator ── */}
          {loading && !streamingText && (
            <div style={styles.rowAi}>
              <div style={styles.aiBubble}>
                <div style={styles.typingDots}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ ...styles.dot, animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Quick prompts (shown only at start) ── */}
        {messages.length <= 1 && !loading && (
          <div style={styles.quickRow}>
            {QUICK_PROMPTS.map(q => (
              <button key={q} type="button"
                onClick={() => sendMessage(q)}
                style={styles.quickButton}
                disabled={loading}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* ── Input ── */}
        <div style={styles.inputRow}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder={loading ? 'Génération en cours…' : 'Posez votre question financière… (Entrée pour envoyer)'}
            rows={2}
            style={styles.textarea}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={loading || !input.trim() ? styles.sendDisabled : styles.sendButton}
          >
            {loading ? '...' : 'Envoyer'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}