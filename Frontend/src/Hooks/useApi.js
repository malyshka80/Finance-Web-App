// ============================================================
// src/hooks/useApi.js
// Stub API hook — replace with real fetch logic when ready.
// ============================================================

import { useState } from 'react'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const post = async (url, body) => {
    setLoading(true)
    setError(null)
    try {
      // TODO: replace with real API base URL
      const res = await fetch(`/api${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const get = async (url) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api${url}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { post, get, loading, error }
}