import { llm, llmPrompt } from '@github/spark/llm'

export interface GeneratedQuestion {
  text: string
  vibe?: string
}

interface GenerateOracleQuestionsInput {
  topics: string[]
  focusAreaLabels: string[]
  experience: string
  audience: string
  questionCount: number
  questionTone: number
  vibeTypes: string[]
}

interface LlmQuestionResponse {
  questions?: Array<{
    text?: unknown
    vibe?: unknown
  }>
}

const MAX_QUESTION_COUNT = 8
const MAX_QUESTION_WORDS = 24
const LLM_JSON_MODE = true

const getToneDescription = (questionTone: number): string => {
  if (questionTone <= 25) return 'serious, reflective, and grounded'
  if (questionTone <= 50) return 'balanced, warm, and thoughtful'
  if (questionTone <= 75) return 'light, curious, and conversational'
  return 'whimsical, playful, and mystical without becoming silly'
}

const parseJsonResponse = (response: string): LlmQuestionResponse => {
  const trimmed = response.trim()
  const fencedJson = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1]
  const firstBraceIndex = trimmed.indexOf('{')
  const lastBraceIndex = trimmed.lastIndexOf('}')
  const jsonText = fencedJson ?? (
    firstBraceIndex >= 0 && lastBraceIndex > firstBraceIndex
      ? trimmed.slice(firstBraceIndex, lastBraceIndex + 1)
      : ''
  )

  if (!jsonText) {
    throw new Error('LLM response did not include a JSON object.')
  }

  return JSON.parse(jsonText) as LlmQuestionResponse
}

const normalizeQuestion = (
  question: { text?: unknown; vibe?: unknown },
  vibeTypes: string[],
): GeneratedQuestion | null => {
  if (typeof question.text !== 'string') return null

  const text = question.text.trim()
  if (!text.endsWith('?')) return null

  const vibe = typeof question.vibe === 'string' && vibeTypes.includes(question.vibe)
    ? question.vibe
    : undefined

  return { text, vibe }
}

export const generateOracleQuestions = async ({
  topics,
  focusAreaLabels,
  experience,
  audience,
  questionCount,
  questionTone,
  vibeTypes,
}: GenerateOracleQuestionsInput): Promise<GeneratedQuestion[]> => {
  const requestedCount = Math.max(1, Math.min(questionCount, MAX_QUESTION_COUNT))
  const prompt = llmPrompt`
Generate ${requestedCount} original fireside-chat questions as JSON for "Oracle of Inclusion", a mystical Magic 8-Ball style accessibility and inclusion conversation starter.

Return only a JSON object in this exact shape:
{
  "questions": [
    { "text": "A single open-ended question?", "vibe": "one of: ${vibeTypes.join(', ')}" }
  ]
}

Requirements:
- Every question must focus on accessibility, disability inclusion, inclusive technology, or belonging.
- Match this tone: ${getToneDescription(questionTone)}.
- Make the questions open-ended, human, specific, and useful for a live discussion.
- Avoid yes/no questions, duplicate ideas, jargon, and generic team-building prompts.
- Keep each question under ${MAX_QUESTION_WORDS} words.
- Use only the provided vibe values.

Audience: ${audience.trim() || 'technology and inclusion practitioners'}
Experience or context: ${experience.trim() || 'not specified'}
Topics: ${topics.length > 0 ? topics.join(', ') : 'accessibility, disability inclusion, and inclusive technology'}
Focus areas: ${focusAreaLabels.length > 0 ? focusAreaLabels.join(', ') : 'accessibility and inclusion in technology'}
`

  const response = await llm(prompt, 'openai/gpt-4o-mini', LLM_JSON_MODE)
  const parsed = parseJsonResponse(response)
  const questions = (parsed.questions ?? [])
    .map(question => normalizeQuestion(question, vibeTypes))
    .filter((question): question is GeneratedQuestion => question !== null)

  const generatedCount = parsed.questions?.length ?? 0
  if (questions.length !== requestedCount) {
    throw new Error(`LLM generated ${generatedCount} questions, but only ${questions.length} passed validation; expected ${requestedCount}.`)
  }

  return questions
}
