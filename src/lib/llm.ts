type OracleBackendResponse = {
  answer?: string
  error?: string
}

export type OracleMode = 'generate' | 'chat'

export type AskOracleParams = {
  topic?: string
  focusAreas?: string[]
  audience?: string
  numQuestions?: number
  questionType?: string
  accessibilityExpertise?: string
  recentQuestions?: string[]
}

const CACHE_TTL_HOURS = 12
const CACHE_TTL_MILLISECONDS = 1000 * 60 * 60 * CACHE_TTL_HOURS
const CACHE_PREFIX = 'ask-oracle-response:'
const VIBE_TYPES = ['😜 Whimsical', '🤗 Warm', '🤔 Thoughtful', '🧘 Deep']

const memoryCache = new Map<string, { value: string; expiresAt: number }>()

function cacheKey(question: string, mode: OracleMode): string {
  return `${CACHE_PREFIX}${mode}:${question}`
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

function buildQuestionPrompt(params: AskOracleParams): string {
  const questionCount = Math.max(1, Math.min(10, Math.round(params.numQuestions ?? 3)))
  const topic = params.topic?.trim()
  const focusAreas = params.focusAreas?.map(area => area.trim()).filter(Boolean) ?? []
  const focusAreasText = focusAreas.length > 0
    ? focusAreas.join(', ')
    : 'accessibility and inclusion in technology'
  const audience = params.audience?.trim() || 'general / mixed'
  const questionType = params.questionType?.trim() || 'balanced mix - combine thoughtful professional questions with some lighter, more personal ones'
  const accessibilityExpertise = params.accessibilityExpertise?.trim() || 'not specified'
  const recentQuestions = params.recentQuestions?.map(question => question.trim()).filter(Boolean) ?? []
  const avoidList = recentQuestions.slice(-50).join('\n- ')

  const topicEmphasis = topic
    ? `CRITICAL PRIORITY - The user specifically selected these topics: ${topic}. At least ${Math.ceil(questionCount * 0.7)} of the ${questionCount} questions (70%+) MUST directly relate to one or more of these specific topics. These are the primary focus areas the user cares about most.`
    : `Topics: accessibility, inclusion, disability in tech, universal design, assistive technology`

  const focusAreaEmphasis = focusAreas.length > 0
    ? `CRITICAL PRIORITY - The guest works in: ${focusAreasText}. Tailor questions to their specific expertise. At least ${Math.ceil(questionCount * 0.6)} of the ${questionCount} questions (60%+) should connect to their professional focus areas.`
    : `Guest's work area: accessibility and inclusion in technology (general)`

  const vibeDistribution = questionCount < VIBE_TYPES.length
    ? `Use ${questionCount} distinct vibe type${questionCount === 1 ? '' : 's'} selected from: ${VIBE_TYPES.join(', ')}.`
    : VIBE_TYPES.map((vibe, idx) => {
        const count = Math.floor(questionCount / VIBE_TYPES.length) + (idx < questionCount % VIBE_TYPES.length ? 1 : 0)
        return `${count} ${vibe.split(' ')[1]}`
      }).join(', ')

  return `Generate ${questionCount} simple, clear questions for a casual fireside chat about accessibility, inclusion, disability, and tech.

Context:
${topicEmphasis}
${focusAreaEmphasis}
- Question tone/style: ${questionType}
- Years in accessibility/inclusion work: ${accessibilityExpertise}
- Audience type: ${audience}

${avoidList ? `IMPORTANT - Do NOT generate questions similar to these recently asked questions:
- ${avoidList}

Generate COMPLETELY DIFFERENT questions on new angles and perspectives.` : ''}

Rules:
- Write at a 9th grade reading level or lower
- Use short sentences (under 20 words each)
- Use simple, everyday words - no jargon
- Make questions easy to understand on first read
- Ask open questions (not yes/no)
- Mix personal story questions with big picture questions
- Center the disability community voice
- CRITICAL: Keep each question to 1-2 SHORT sentences max (under 25 words total)
- CRITICAL: Generate the requested vibe mix: ${vibeDistribution}
- Randomize the order of vibes - do NOT group same vibes together
- If guest has lived experience, include questions that honor their perspective as an expert
- If audience is technical (developers/designers), include questions about practical implementation
- If audience is leaders, include questions about culture and organizational change
- If guest is new to the field, ask about their journey and what drew them to this work
- CRITICAL: Each question must be UNIQUE and different from all others - no repetition of themes or angles

IMPORTANT - Be respectful and inclusive:
- NEVER use offensive, patronizing, or insensitive language about disability
- NEVER ask questions that treat disability as a tragedy or something to overcome
- NEVER use inspiration porn framing (e.g., "despite your disability")
- NEVER assume negative experiences or limitations
- DO use identity-first or person-first language appropriately (follow the guest's lead)
- DO frame questions around expertise, experiences, and perspectives - not limitations
- DO treat guests as experts in their field, not just their disability experience
- Questions should empower, not objectify or pity

Return a JSON object with a "questions" array containing exactly ${questionCount} objects, each with "text" (the question) and "vibe" (one of: "😜 Whimsical", "🤗 Warm", "🤔 Thoughtful", "🧘 Deep").`
}

export async function askOracle(params: AskOracleParams): Promise<string>
export async function askOracle(question: string, mode?: OracleMode): Promise<string>
export async function askOracle(input: AskOracleParams | string, mode: OracleMode = 'chat'): Promise<string> {
  const question = typeof input === 'string' ? input : buildQuestionPrompt(input)
  const requestMode: OracleMode = typeof input === 'string' ? mode : 'generate'
  const key = cacheKey(question, requestMode)
  const cached = getCached(key)
  if (cached !== null) return cached

  const baseUrl = (import.meta.env.VITE_ORACLE_API_URL as string | undefined) ?? ''
  if (!baseUrl) {
    throw new Error('VITE_ORACLE_API_URL is not configured')
  }

  const res = await fetch(baseUrl.replace(/\/$/, ''), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, mode: requestMode }),
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
