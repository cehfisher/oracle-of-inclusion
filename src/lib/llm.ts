type OracleBackendResponse = {
  answer?: string
  error?: string
}

const CACHE_TTL_HOURS = 12
const CACHE_TTL_MILLISECONDS = 1000 * 60 * 60 * CACHE_TTL_HOURS
const CACHE_PREFIX = 'ask-oracle-response:'

const memoryCache = new Map<string, { value: string; expiresAt: number }>()

function cacheKey(question: string): string {
  return CACHE_PREFIX + question
}

function getCached(key: string): string | null {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key)
    return null
  }
  return entry.value
}

function setCached(key: string, value: string): void {
  memoryCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MILLISECONDS })
}

export async function askOracle(question: string): Promise<string> {
  const key = cacheKey(question)
  const cached = getCached(key)
  if (cached !== null) return cached

  const baseUrl = (import.meta.env.VITE_ORACLE_API_URL as string | undefined) ?? ''
  if (!baseUrl) {
    throw new Error('VITE_ORACLE_API_URL is not configured')
  }

  const res = await fetch(baseUrl.replace(/\/$/, ''), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })

  if (!res.ok) {
    let errorMessage = `Oracle API error: ${res.status} ${res.statusText}`
    try {
      const errData: OracleBackendResponse = await res.json()
      if (errData.error) errorMessage = errData.error
    } catch {
      // non-JSON error body; keep the status-based message
    }
    throw new Error(errorMessage)
  }

  const data: OracleBackendResponse = await res.json()

  if (!data.answer) {
    throw new Error('Oracle API returned an empty answer')
  }

  setCached(key, data.answer)
  return data.answer
}
