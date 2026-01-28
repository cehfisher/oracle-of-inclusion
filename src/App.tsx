import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, ArrowsClockwise, Check, Plus, X, SpeakerHigh, SpeakerSlash, Sparkle, Keyboard, ArrowCounterClockwise, Moon, Sun } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useKV } from '@github/spark/hooks'
import { toast, Toaster } from 'sonner'

declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: unknown[]) => string
  llm: (prompt: string, model?: string, jsonMode?: boolean) => Promise<string>
}

const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null)
  
  const getContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    return audioContextRef.current
  }
  
  const playTwinkle = () => {
    const ctx = getContext()
    const now = ctx.currentTime
    
    const frequencies = [1200, 1600, 2000, 2400, 1800]
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0, now + i * 0.08)
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4)
      osc.start(now + i * 0.08)
      osc.stop(now + i * 0.08 + 0.4)
    })
  }
  
  const playSparkle = () => {
    const ctx = getContext()
    const now = ctx.currentTime
    
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 1800 + Math.random() * 800
      osc.type = 'sine'
      gain.gain.setValueAtTime(0, now + i * 0.1)
      gain.gain.linearRampToValueAtTime(0.06, now + i * 0.1 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25)
      osc.start(now + i * 0.1)
      osc.stop(now + i * 0.1 + 0.25)
    }
  }
  
  const playShimmer = () => {
    const ctx = getContext()
    const now = ctx.currentTime
    
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.frequency.value = 180
    osc1.type = 'sine'
    gain1.gain.setValueAtTime(0.15, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
    osc1.start(now)
    osc1.stop(now + 0.8)
    
    const frequencies = [400, 500, 600, 700, 800]
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.06, now + i * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3)
      osc.start(now + i * 0.1)
      osc.stop(now + i * 0.1 + 0.3)
    })
  }
  
  const play8BallReveal = () => {
    const ctx = getContext()
    const now = ctx.currentTime
    
    const notes = [220, 330, 440, 550, 660, 880]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'triangle'
      gain.gain.setValueAtTime(0, now + i * 0.08)
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.08 + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5)
      osc.start(now + i * 0.08)
      osc.stop(now + i * 0.08 + 0.5)
    })
  }
  
  const playMagic = () => {
    const ctx = getContext()
    const now = ctx.currentTime
    const notes = [1047, 1319, 1568, 2093]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.1, now + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5)
      osc.start(now + i * 0.12)
      osc.stop(now + i * 0.12 + 0.5)
    })
  }
  
  const playClick = () => {
    const ctx = getContext()
    const now = ctx.currentTime
    
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    osc.start(now)
    osc.stop(now + 0.1)
  }
  
  const playNav = () => {
    const ctx = getContext()
    const now = ctx.currentTime
    
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 600
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.06, now)
    gain.gain.linearRampToValueAtTime(0.08, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
    osc.start(now)
    osc.stop(now + 0.15)
  }
  
  const playReset = () => {
    const ctx = getContext()
    const now = ctx.currentTime
    
    const notes = [500, 400, 300]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0, now + i * 0.08)
      gain.gain.linearRampToValueAtTime(0.07, now + i * 0.08 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2)
      osc.start(now + i * 0.08)
      osc.stop(now + i * 0.08 + 0.2)
    })
  }
  
  return { playTwinkle, playSparkle, playShimmer, playMagic, play8BallReveal, playClick, playNav, playReset }
}

interface Question {
  id: string
  text: string
  vibe: string
}

const MYSTICAL_LOADING_PHRASES = [
  "The spirits are whispering... 👻",
  "Gazing into the cosmic void... 🌌",
  "The mists are parting... 🌫️",
  "Ancient wisdom stirs... 📜",
  "The veil grows thin... ✨",
  "Channeling ethereal knowledge... 🔮",
  "The stars align... ⭐",
  "Seeking hidden truths... 🌙",
  "The crystals resonate... 💎",
  "Divining your path... 🃏",
]

const MYSTICAL_GREETINGS = [
  "The oracle senses your need ✨",
  "Your questions await revelation 🌟",
  "The cosmos whispers your queries 🔮",
  "Destiny stirs within the crystal 🌙",
  "The ancient spirits are listening ⭐",
  "The veil between worlds grows thin 🌌",
  "Wisdom flows through the ether ✨",
  "The stars align in your favor 💫",
  "Ancient knowledge awakens 🔮",
  "The mystic currents guide you 🌊",
  "Celestial forces gather 🌟",
  "The oracle's eye opens wide 👁️",
  "Sacred questions find their voice ✨",
  "The crystal pulses with insight 💎",
  "Ethereal whispers draw near 🌙",
  "The cosmic web vibrates 🕸️",
  "Infinite wisdom awaits discovery ⭐",
  "The spirit realm responds 👻",
  "Arcane energies converge 🔮",
  "The universe bends to listen 🌌",
]

const getRandomGreeting = (): string => {
  return MYSTICAL_GREETINGS[Math.floor(Math.random() * MYSTICAL_GREETINGS.length)]
}

const getRandomLoadingPhrase = (): string => {
  return MYSTICAL_LOADING_PHRASES[Math.floor(Math.random() * MYSTICAL_LOADING_PHRASES.length)]
}

const TOPIC_SUGGESTIONS = [
  '♿ Accessible Design',
  '🦾 Assistive Technology',
  '🧠 Neurodiversity',
  '🔊 Screen Readers',
  '💼 Inclusive Hiring',
  '📋 WCAG Standards',
  '📣 Disability Advocacy',
  '🌍 Universal Design',
  '💚 Mental Health',
  '🏢 Workplace Accommodations',
  '🩺 Chronic Illness',
  '🤟 Deaf Culture',
  '👁️ Blind & Low Vision',
  '🦽 Mobility & Physical',
  '📚 Learning Differences',
  '🎯 Autism & ADHD',
  '🙈 Invisible Disabilities',
  '🎮 Accessible Gaming',
  '🖼️ Alt Text & Captions',
  '⌨️ Keyboard Navigation',
  '🎨 Color Blindness',
  '🧩 Cognitive Load',
  '✍️ Plain Language',
  '🎤 Voice Control',
  '🤖 AI & Disability',
  '🏠 Remote Work Access',
  '🎪 Accessible Events',
  '💪 Self-Advocacy',
  '🏳️‍🌈 Disability Pride',
  '🚌 Accessible Transit'
]

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const VIBE_TYPES = ['😜 Whimsical', '🤗 Warm', '🤔 Thoughtful', '🧘 Deep']

const FOCUS_AREAS = [
  { id: 'frontend', label: '🖥️ Front-End Dev' },
  { id: 'backend', label: '⚙️ Back-End Dev' },
  { id: 'design', label: '🎨 Design & UX' },
  { id: 'accessibility', label: '🧩 Accessibility' },
  { id: 'leadership', label: '👔 Leadership' },
  { id: 'education', label: '📖 Education' },
  { id: 'advocacy', label: '📣 Advocacy & Community' },
  { id: 'other', label: '✏️ Other' },
]

const MYSTICAL_8BALL_RESPONSES = [
  { text: "✨ Oh absolutely, bestie! ✨", type: "yes" },
  { text: "🌟 That's a hard yes from the cosmos! 🌟", type: "yes" },
  { text: "💫 The universe just gave you a standing ovation! 💫", type: "yes" },
  { text: "⭐ Yes! Now go touch grass to celebrate! ⭐", type: "yes" },
  { text: "🔮 Big yes energy detected! 🔮", type: "yes" },
  { text: "✨ The vibes are immaculate - YES! ✨", type: "yes" },
  { text: "🌈 Green light! Full send! 🌈", type: "yes" },
  { text: "💖 The spirits are literally cheering! 💖", type: "yes" },
  { text: "🎯 100% certified yes! 🎯", type: "yes" },
  { text: "🌟 Even my skeptical ghost agrees - YES! 🌟", type: "yes" },
  { text: "🌙 That's gonna be a no from the moon... 🌙", type: "no" },
  { text: "🌒 The spirits just laughed nervously 🌒", type: "no" },
  { text: "👻 My ghost consultant said 'lol no' 👻", type: "no" },
  { text: "🌑 Yikes... that's a cosmic nope 🌑", type: "no" },
  { text: "😬 The universe left you on read... 😬", type: "no" },
  { text: "❌ Hard pass from the ethereal realm ❌", type: "no" },
  { text: "🙅 The ancestors are shaking their heads 🙅", type: "no" },
  { text: "🎭 Plot twist: Maybe! Try again! 🎭", type: "maybe" },
  { text: "🤔 The spirits are having a meeting about this... 🤔", type: "maybe" },
  { text: "🙊 *mysterious silence* ...ask later! 🙊", type: "maybe" },
  { text: "🌀 Error 404: Destiny not found 🌀", type: "maybe" },
  { text: "🧘 The oracle is buffering... 🧘", type: "maybe" },
  { text: "🎲 Flip a coin? Just kidding, ask again! 🎲", type: "maybe" },
  { text: "🌫️ The WiFi to the spirit realm is spotty 🌫️", type: "maybe" },
  { text: "🤷 Even the all-knowing oracle needs a moment 🤷", type: "maybe" },
]

const getRandomResponse = () => {
  return MYSTICAL_8BALL_RESPONSES[Math.floor(Math.random() * MYSTICAL_8BALL_RESPONSES.length)]
}

const KEYBOARD_SHORTCUTS = [
  { key: '←', action: 'Previous question' },
  { key: '→', action: 'Next question' },
  { key: 'C', action: 'Copy current question' },
  { key: 'R', action: 'Shuffle all questions' },
  { key: 'Escape', action: 'Start over / Reset' },
  { key: '?', action: 'Show keyboard shortcuts' },
]

export default function App() {
  const [topics, setTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [otherFocusArea, setOtherFocusArea] = useState('')
  const [experience, setExperience] = useState('')
  const [audience, setAudience] = useState('')

  const [questionCount, setQuestionCount] = useState(3)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loadingPhrase, setLoadingPhrase] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [quickAnswer, setQuickAnswer] = useState<{text: string, type: string} | null>(null)
  const [isShakingOrb, setIsShakingOrb] = useState(false)
  const [showQuickOracle, setShowQuickOracle] = useState(false)
  const [soundEnabled, setSoundEnabled] = useKV<boolean>('oracle-sound-enabled-v2', true)
  const [animationsEnabled, setAnimationsEnabled] = useKV<boolean>('oracle-animations-enabled-v2', true)
  const [darkMode, setDarkMode] = useKV<boolean>('oracle-dark-mode-v2', true)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [previousQuestions, setPreviousQuestions] = useKV<string[]>('oracle-previous-questions', [])
  
  const [shuffledTopicSuggestions, setShuffledTopicSuggestions] = useState(() => shuffleArray(TOPIC_SUGGESTIONS))
  const [mysticalGreeting, setMysticalGreeting] = useState(() => getRandomGreeting())
  const [greetingKey, setGreetingKey] = useState(0)
  
  const reshuffleTopics = useCallback(() => {
    setShuffledTopicSuggestions(shuffleArray(TOPIC_SUGGESTIONS))
    setMysticalGreeting(getRandomGreeting())
    setGreetingKey(prev => prev + 1)
  }, [])
  
  useEffect(() => {
    if (darkMode === undefined || darkMode === true) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])
  
  const sounds = useSound()
  
  const playSound = (soundFn: () => void) => {
    if (soundEnabled) {
      soundFn()
    }
  }
  
  useEffect(() => {
    if (isGenerating) {
      setLoadingProgress(0)
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 300)
      return () => clearInterval(interval)
    } else {
      setLoadingProgress(100)
    }
  }, [isGenerating])

  const addTopic = (topic: string) => {
    const trimmed = topic.trim()
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed])
      setTopicInput('')
    }
  }

  const removeTopic = (topic: string) => {
    setTopics(topics.filter(t => t !== topic))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTopic(topicInput)
    }
  }

  const toggleFocusArea = (areaId: string) => {
    setFocusAreas(current => 
      current.includes(areaId) 
        ? current.filter(id => id !== areaId)
        : [...current, areaId]
    )
  }

  const resetForm = useCallback(() => {
    setTopics([])
    setTopicInput('')
    setFocusAreas([])
    setOtherFocusArea('')
    setExperience('')
    setAudience('')

    setQuestionCount(3)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setQuickAnswer(null)
    playSound(sounds.playReset)
    toast.success('Form reset!')
  }, [soundEnabled, sounds])

  const getRandomVibe = (): string => {
    return VIBE_TYPES[Math.floor(Math.random() * VIBE_TYPES.length)]
  }

  const generateQuestions = useCallback(async () => {
    setIsGenerating(true)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setLoadingPhrase(getRandomLoadingPhrase())
    playSound(sounds.playTwinkle)
    reshuffleTopics()

    const focusAreasLabels = FOCUS_AREAS.filter(a => focusAreas.includes(a.id) && a.id !== 'other').map(a => a.label)
    if (focusAreas.includes('other') && otherFocusArea.trim()) {
      focusAreasLabels.push(otherFocusArea.trim())
    }
    const focusAreasText = focusAreasLabels.length > 0 
      ? focusAreasLabels.join(', ')
      : 'accessibility and inclusion in technology'

    const hasCustomTopics = topics.length > 0
    const hasCustomFocusAreas = focusAreas.length > 0

    const vibeDistribution = questionCount === 1 
      ? 'any vibe of your choice'
      : VIBE_TYPES.map((vibe, idx) => {
          const count = Math.floor(questionCount / 4) + (idx < questionCount % 4 ? 1 : 0)
          return `${count} ${vibe.split(' ')[1]}`
        }).join(', ')

    const recentQuestions = previousQuestions ?? []
    const avoidList = recentQuestions.slice(-50).join('\n- ')

    const topicEmphasis = hasCustomTopics 
      ? `CRITICAL PRIORITY - The user specifically selected these topics: ${topics.join(', ')}. At least ${Math.ceil(questionCount * 0.7)} of the ${questionCount} questions (70%+) MUST directly relate to one or more of these specific topics. These are the primary focus areas the user cares about most.`
      : `Topics: accessibility, inclusion, disability in tech, universal design, assistive technology`

    const focusAreaEmphasis = hasCustomFocusAreas
      ? `CRITICAL PRIORITY - The guest works in: ${focusAreasText}. Tailor questions to their specific expertise. At least ${Math.ceil(questionCount * 0.6)} of the ${questionCount} questions (60%+) should connect to their professional focus areas.`
      : `Guest's work area: accessibility and inclusion in technology (general)`

    const prompt = spark.llmPrompt`Generate ${questionCount} simple, clear questions for a casual fireside chat about accessibility, inclusion, disability, and tech.

Context:
${topicEmphasis}
${focusAreaEmphasis}
- Years in accessibility/inclusion work: ${experience || 'not specified'}
- Audience type: ${audience || 'general / mixed'}

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
- Keep each question to 1-2 sentences max
- CRITICAL: Generate an even mix of vibes: ${vibeDistribution}. Each vibe type MUST be represented.
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

    try {
      const result = await spark.llm(prompt, 'gpt-4o', true)
      const parsed = JSON.parse(result)
      const generatedQuestions: Question[] = shuffleArray(parsed.questions.map((q: { text: string; vibe: string }, i: number) => ({
        id: `q-${Date.now()}-${i}`,
        text: q.text,
        vibe: q.vibe || getRandomVibe()
      })))
      setQuestions(generatedQuestions)
      
      const newQuestionTexts = generatedQuestions.map(q => q.text)
      setPreviousQuestions((prev) => [...(prev ?? []).slice(-100), ...newQuestionTexts])
      
      playSound(sounds.playMagic)
      toast.success('🔮 The oracle has spoken!')
    } catch {
      toast.error('🌙 The oracle needs a moment... Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [focusAreas, otherFocusArea, questionCount, topics, experience, audience, soundEnabled, sounds, reshuffleTopics, previousQuestions, setPreviousQuestions])

  const handleGenerateClick = () => {
    generateQuestions()
  }

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      playSound(sounds.playNav)
    }
  }, [currentQuestionIndex, questions.length, soundEnabled, sounds])

  const prevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      playSound(sounds.playNav)
    }
  }, [currentQuestionIndex, soundEnabled, sounds])

  const currentQuestion = questions[currentQuestionIndex]

  const copyQuestion = useCallback(async (question: Question) => {
    const textToCopy = `${question.text}\n\n${question.vibe}`
    await navigator.clipboard.writeText(textToCopy)
    setCopiedId(question.id)
    toast.success('📋 Copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const shakeTheOrb = () => {
    setIsShakingOrb(true)
    setQuickAnswer(null)
    playSound(sounds.playShimmer)
    setTimeout(() => {
      setQuickAnswer(getRandomResponse())
      setIsShakingOrb(false)
      playSound(sounds.play8BallReveal)
    }, 1500)
  }

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setShowShortcuts(true)
        return
      }

      if (questions.length === 0) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          prevQuestion()
          break
        case 'ArrowRight':
          e.preventDefault()
          nextQuestion()
          break
        case 'c':
        case 'C':
          e.preventDefault()
          if (currentQuestion) {
            copyQuestion(currentQuestion)
          }
          break
        case 'r':
        case 'R':
          e.preventDefault()
          if (!isGenerating) {
            generateQuestions()
          }
          break
        case 'Escape':
          e.preventDefault()
          resetForm()
          break
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [questions, currentQuestion, prevQuestion, nextQuestion, copyQuestion, generateQuestions, resetForm, isGenerating])

  const animationProps = animationsEnabled 
    ? { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } }
    : { initial: {}, animate: {}, transition: { duration: 0 } }

  const floatAnimation = animationsEnabled
    ? { y: [0, -8, 0] }
    : {}

  const sparklePositions = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 4,
      size: Math.random() * 0.6 + 0.4,
    })), []
  )

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden mystical-bg">
      {animationsEnabled && (
        <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
          {sparklePositions.map((sparkle) => (
            <motion.span
              key={sparkle.id}
              className="sparkle-particle text-primary/40"
              style={{ 
                left: sparkle.left, 
                top: sparkle.top,
                fontSize: `${sparkle.size * 24}px`,
              }}
              animate={{ 
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 3,
                delay: sparkle.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ✦
            </motion.span>
          ))}
        </div>
      )}
      <Toaster position="top-center" theme="dark" />
      
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-bold">
        Skip to main content
      </a>
      
      <div className="max-w-3xl mx-auto">
        <motion.header 
          className="text-center mb-10"
          {...animationProps}
          role="banner"
        >
          <motion.div 
            className="inline-block mb-4"
            animate={animationsEnabled ? floatAnimation : {}}
            transition={animationsEnabled ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : {}}
            aria-hidden="true"
          >
            <span className="text-7xl md:text-8xl">🔮</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-3">
            Oracle of Inclusion
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl mb-2">
            "Ask and the wisdom shall be revealed..."
          </p>
          <motion.p 
            key={greetingKey}
            className="text-primary text-lg font-medium mb-6"
            initial={animationsEnabled ? { opacity: 0, scale: 0.9 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            {mysticalGreeting}
          </motion.p>

          <div className="flex justify-center items-center gap-3 flex-wrap mb-6">
            <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
              <DialogTrigger asChild>
                <button
                  className="flex items-center gap-2 bg-card/80 px-4 py-2 rounded-full border border-border hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                  aria-label="View keyboard shortcuts"
                >
                  <Keyboard size={18} className="text-primary" aria-hidden="true" />
                  <span className="text-sm font-medium">Keys</span>
                </button>
              </DialogTrigger>
              <DialogContent className="bg-card border-2 border-border">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <Keyboard size={28} className="text-primary" aria-hidden="true" />
                    Keyboard Shortcuts
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-3" role="list" aria-label="Available keyboard shortcuts">
                  {KEYBOARD_SHORTCUTS.map(shortcut => (
                    <div 
                      key={shortcut.key} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/40"
                      role="listitem"
                    >
                      <span className="text-lg font-medium text-foreground">{shortcut.action}</span>
                      <kbd className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg font-mono text-lg font-bold border border-primary/30">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            
            <button
              onClick={() => setDarkMode(prev => !prev)}
              className="flex items-center gap-2 bg-card/80 px-4 py-2 rounded-full border border-border hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={18} className="text-primary" aria-hidden="true" /> : <Moon size={18} className="text-primary" aria-hidden="true" />}
              <span className="text-sm font-medium">{darkMode ? 'Light' : 'Dark'}</span>
            </button>
            
            <div className="flex items-center gap-2 bg-card/80 px-4 py-2 rounded-full border border-border text-foreground">
              <Sparkle size={18} className="text-primary" aria-hidden="true" />
              <Label htmlFor="animations-toggle" className="text-sm font-medium cursor-pointer">Animations</Label>
              <Switch 
                id="animations-toggle"
                checked={animationsEnabled ?? true}
                onCheckedChange={setAnimationsEnabled}
                aria-describedby="animations-desc"
              />
              <span id="animations-desc" className="sr-only">Toggle animations on or off</span>
            </div>
            <div className="flex items-center gap-2 bg-card/80 px-4 py-2 rounded-full border border-border text-foreground">
              {soundEnabled ? <SpeakerHigh size={18} className="text-primary" aria-hidden="true" /> : <SpeakerSlash size={18} className="text-muted-foreground" aria-hidden="true" />}
              <Label htmlFor="sound-toggle" className="text-sm font-medium cursor-pointer">Sound</Label>
              <Switch 
                id="sound-toggle"
                checked={soundEnabled ?? true}
                onCheckedChange={setSoundEnabled}
                aria-describedby="sound-desc"
              />
              <span id="sound-desc" className="sr-only">Toggle sound effects on or off</span>
            </div>
          </div>
        </motion.header>

        <main id="main-content" role="main">
          {questions.length === 0 ? (
            <motion.div
              initial={animationsEnabled ? { opacity: 0, y: 20 } : {}}
              animate={{ opacity: 1, y: 0 }}
              transition={animationsEnabled ? { duration: 0.5, delay: 0.1 } : { duration: 0 }}
            >
              <Card className="p-6 md:p-8 bg-card border-2 border-border mystic-glow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" aria-hidden="true" />

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="topics" className="text-foreground mb-3 block text-lg font-semibold">
                      🎯 Topics to Explore
                    </Label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        id="topics"
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a topic..."
                        className="bg-input border-2 border-border text-foreground placeholder:text-muted-foreground text-lg py-6"
                        aria-describedby="topics-hint"
                      />
                      <Button 
                        variant="secondary" 
                        size="icon"
                        onClick={() => addTopic(topicInput)}
                        disabled={!topicInput.trim()}
                        aria-label="Add topic"
                        className="h-12 w-12"
                      >
                        <Plus size={24} aria-hidden="true" />
                      </Button>
                    </div>
                    <p id="topics-hint" className="sr-only">Press Enter to add a topic, or click the add button</p>
                    <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Selected topics">
                      {topics.map(topic => (
                        <Badge 
                          key={topic} 
                          variant="secondary"
                          className="pl-4 pr-2 py-2 flex items-center gap-2 bg-primary/20 text-primary border-2 border-primary/30 text-base font-medium"
                          role="listitem"
                        >
                          {topic}
                          <button 
                            onClick={() => removeTopic(topic)}
                            className="ml-1 hover:bg-primary/20 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-ring"
                            aria-label={`Remove ${topic}`}
                          >
                            <X size={16} aria-hidden="true" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Topic suggestions">
                      {shuffledTopicSuggestions.filter(s => !topics.includes(s)).slice(0, 8).map(suggestion => (
                        <button
                          key={suggestion}
                          onClick={() => addTopic(suggestion)}
                          className="text-base px-4 py-2.5 rounded-full border-2 border-border text-muted-foreground hover:border-primary hover:text-primary transition-all hover:bg-primary/10 font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  <fieldset>
                    <legend className="text-foreground mb-3 block text-lg font-semibold">
                      👤 Guest's Focus Areas (select all that apply)
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {FOCUS_AREAS.map(area => (
                        <button 
                          key={area.id}
                          type="button"
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all text-left ${
                            focusAreas.includes(area.id) 
                              ? 'border-primary bg-primary/15' 
                              : 'border-border hover:border-primary/50'
                          } focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background`}
                          onClick={() => toggleFocusArea(area.id)}
                          aria-pressed={focusAreas.includes(area.id)}
                          aria-describedby={area.id === 'other' ? 'other-focus-hint' : undefined}
                        >
                          <span className="text-lg font-medium">{area.label}</span>
                          {focusAreas.includes(area.id) && (
                            <span className="text-primary text-xl" aria-hidden="true">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {focusAreas.includes('other') && (
                      <div className="mt-3">
                        <Label htmlFor="other-focus-area" className="sr-only">Describe your other focus area</Label>
                        <Input
                          id="other-focus-area"
                          value={otherFocusArea}
                          onChange={(e) => setOtherFocusArea(e.target.value)}
                          placeholder="Describe your focus area..."
                          className="bg-input border-2 border-border text-foreground placeholder:text-muted-foreground text-lg py-6"
                        />
                        <p id="other-focus-hint" className="sr-only">When selected, you can describe your custom focus area</p>
                      </div>
                    )}
                  </fieldset>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="experience" className="text-foreground mb-3 block text-lg font-semibold">
                        ⏳ Digital Accessibility Experience
                      </Label>
                      <Select value={experience} onValueChange={setExperience}>
                        <SelectTrigger id="experience" className="bg-input border-2 border-border text-foreground text-lg py-6 w-full">
                          <SelectValue placeholder="Select level..." />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-2 border-border min-w-[280px]">
                          <SelectItem value="0-2" className="text-lg py-3">🌱 New to it (0-2 years)</SelectItem>
                          <SelectItem value="3-5" className="text-lg py-3">🌿 Growing (3-5 years)</SelectItem>
                          <SelectItem value="6-10" className="text-lg py-3">🌳 Seasoned (6-10 years)</SelectItem>
                          <SelectItem value="11-15" className="text-lg py-3">🏆 Expert (11-15 years)</SelectItem>
                          <SelectItem value="15+" className="text-lg py-3">⭐ Veteran (15+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="audience" className="text-foreground mb-3 block text-lg font-semibold">
                        🎯 Who's the Audience?
                      </Label>
                      <Select value={audience} onValueChange={setAudience}>
                        <SelectTrigger id="audience" className="bg-input border-2 border-border text-foreground text-lg py-6 w-full">
                          <SelectValue placeholder="Select audience..." />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-2 border-border min-w-[280px]">
                          <SelectItem value="general" className="text-lg py-3">🌍 General / Mixed</SelectItem>
                          <SelectItem value="developers" className="text-lg py-3">💻 Developers & Engineers</SelectItem>
                          <SelectItem value="designers" className="text-lg py-3">🎨 Designers & UX</SelectItem>
                          <SelectItem value="leaders" className="text-lg py-3">👔 Leaders & Managers</SelectItem>
                          <SelectItem value="advocates" className="text-lg py-3">📣 Advocates & Allies</SelectItem>
                          <SelectItem value="students" className="text-lg py-3">📚 Students & Newcomers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="question-count-slider" className="text-foreground mb-3 block text-lg font-semibold">
                      🔢 Number of Questions <span className="text-accent font-bold text-xl">{questionCount}</span>
                    </Label>
                    <div className="px-2 py-4">
                      <Slider
                        id="question-count-slider"
                        value={[questionCount]}
                        onValueChange={(value) => setQuestionCount(value[0])}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full [&_[data-radix-slider-track]]:bg-muted [&_[data-radix-slider-range]]:bg-accent [&_[data-radix-slider-thumb]]:bg-accent [&_[data-radix-slider-thumb]]:border-2 [&_[data-radix-slider-thumb]]:border-foreground"
                        aria-valuemin={1}
                        aria-valuemax={10}
                        aria-valuenow={questionCount}
                        aria-valuetext={`${questionCount} question${questionCount === 1 ? '' : 's'}`}
                      />
                      <div className="flex justify-between mt-2 text-base text-foreground font-bold" aria-hidden="true">
                        <span>1</span>
                        <span>10</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <Button 
                      onClick={handleGenerateClick}
                      disabled={isGenerating}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-7 text-xl tracking-wide focus:ring-4 focus:ring-ring focus:ring-offset-2"
                    >
                      {isGenerating ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          aria-hidden="true"
                        >
                          <ArrowsClockwise size={28} />
                        </motion.div>
                      ) : (
                        <>
                          <span className="text-2xl mr-3" aria-hidden="true">🔮</span>
                          Reveal My Questions!
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={resetForm}
                      variant="outline"
                      className="py-7 px-6 border-2 border-border text-muted-foreground hover:bg-muted hover:text-foreground focus:ring-4 focus:ring-ring focus:ring-offset-2"
                      aria-label="Reset form"
                    >
                      <ArrowCounterClockwise size={24} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={animationsEnabled ? { opacity: 0, y: 20 } : {}}
              animate={{ opacity: 1, y: 0 }}
              transition={animationsEnabled ? { duration: 0.5 } : { duration: 0 }}
              className="space-y-6"
            >
              <Card className="p-6 md:p-8 bg-card border-2 border-border relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent via-primary to-accent" aria-hidden="true" />

                {isGenerating && (
                  <div className="text-center py-12" role="status" aria-live="polite">
                    <motion.div
                      animate={animationsEnabled ? { 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-8xl mb-6"
                      aria-hidden="true"
                    >
                      ✨
                    </motion.div>
                    <motion.p 
                      className="text-xl text-primary font-medium mb-4"
                      animate={animationsEnabled ? { opacity: [0.7, 1, 0.7] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {loadingPhrase}
                    </motion.p>
                    <div className="w-full max-w-xs mx-auto h-3 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(loadingProgress)} aria-valuemin={0} aria-valuemax={100}>
                      <motion.div 
                        className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${loadingProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Summoning wisdom...</p>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {currentQuestion && !isGenerating && (
                    <motion.div
                      key={currentQuestion.id}
                      initial={animationsEnabled ? { opacity: 0, y: 20, scale: 0.95 } : {}}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={animationsEnabled ? { opacity: 0, y: -20, scale: 0.95 } : {}}
                      transition={animationsEnabled ? { duration: 0.4 } : { duration: 0 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-4 flex items-center justify-center gap-3 flex-wrap">
                        <span className="text-lg font-bold text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                          Question {currentQuestionIndex + 1} of {questions.length} 🎯
                        </span>
                        <span className="text-lg font-bold text-primary bg-primary/20 px-4 py-2 rounded-full">
                          {currentQuestion.vibe}
                        </span>
                      </div>
                      
                      <div className="p-6 rounded-xl bg-gradient-to-br from-primary/15 via-accent/10 to-secondary/15 border-2 border-primary/30">
                        <p className="text-2xl md:text-3xl text-foreground leading-relaxed font-medium text-center" role="status" aria-live="polite">
                          "{currentQuestion.text}"
                        </p>
                      </div>

                      <div className="flex gap-3 justify-center" role="navigation" aria-label="Question navigation">
                        <Button
                          variant="secondary"
                          size="lg"
                          onClick={prevQuestion}
                          disabled={currentQuestionIndex === 0}
                          className="text-lg py-6 px-8 focus:ring-4 focus:ring-ring focus:ring-offset-2"
                          aria-label={`Previous question${currentQuestionIndex === 0 ? ' (disabled, this is the first question)' : ''}`}
                        >
                          <span aria-hidden="true">←</span> Previous
                        </Button>
                        <Button
                          variant="default"
                          size="lg"
                          onClick={nextQuestion}
                          disabled={currentQuestionIndex === questions.length - 1}
                          className="text-lg py-6 px-8 bg-primary text-primary-foreground focus:ring-4 focus:ring-ring focus:ring-offset-2"
                          aria-label={`Next question${currentQuestionIndex === questions.length - 1 ? ' (disabled, this is the last question)' : ''}`}
                        >
                          Next <span aria-hidden="true">→</span>
                        </Button>
                      </div>


                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              <Card className="p-6 bg-card border-2 border-border">
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => currentQuestion && copyQuestion(currentQuestion)}
                    disabled={!currentQuestion}
                    className="text-lg py-6 px-6 border-2 border-border text-foreground bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary focus:ring-4 focus:ring-ring focus:ring-offset-2"
                    aria-label={copiedId === currentQuestion?.id ? 'Copied to clipboard' : 'Copy question to clipboard'}
                  >
                    {copiedId === currentQuestion?.id ? (
                      <Check size={22} className="text-green-500 mr-2" aria-hidden="true" />
                    ) : (
                      <Copy size={22} className="mr-2" aria-hidden="true" />
                    )}
                    {copiedId === currentQuestion?.id ? 'Copied!' : 'Copy'}
                    <kbd className="ml-2 px-1.5 py-0.5 bg-muted rounded text-sm font-mono hidden sm:inline" aria-hidden="true">C</kbd>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={generateQuestions}
                    disabled={isGenerating}
                    className="text-lg py-6 px-8 border-2 border-border text-foreground bg-card hover:bg-accent hover:text-accent-foreground hover:border-accent focus:ring-4 focus:ring-ring focus:ring-offset-2"
                    aria-label="Shuffle all questions and generate new ones"
                  >
                    <ArrowsClockwise size={22} className="mr-2" aria-hidden="true" />
                    Shuffle
                    <kbd className="ml-2 px-1.5 py-0.5 bg-muted rounded text-sm font-mono hidden sm:inline" aria-hidden="true">R</kbd>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={resetForm}
                    className="text-lg py-6 px-8 border-2 border-border text-foreground bg-card hover:bg-muted-foreground hover:text-background hover:border-muted-foreground focus:ring-4 focus:ring-ring focus:ring-offset-2"
                    aria-label="Restart and reset the form"
                  >
                    <ArrowCounterClockwise size={22} className="mr-2" aria-hidden="true" />
                    Restart
                    <kbd className="ml-2 px-1.5 py-0.5 bg-muted rounded text-sm font-mono hidden sm:inline" aria-hidden="true">Esc</kbd>
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </main>

        <motion.footer 
          className="text-center mt-8 text-muted-foreground text-lg"
          initial={animationsEnabled ? { opacity: 0 } : {}}
          animate={{ opacity: 1 }}
          transition={animationsEnabled ? { delay: 0.8 } : { duration: 0 }}
          role="contentinfo"
        >
          <p className="text-sm text-muted-foreground/70 border-t border-border/50 pt-4">
            This is an experiment. Questions are AI-generated. This app may not be fully accessible.{' '}
            <a
              href="https://www.linkedin.com/in/cariefisher/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded"
              aria-label="Reach out with feedback (opens LinkedIn in new tab)"
            >
              Reach out with feedback
            </a>
          </p>
          
          <div className="mt-4 pt-4 border-t border-border/30">
                            <button
                              onClick={() => setShowQuickOracle(!showQuickOracle)}
                              className="text-base opacity-40 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-lg p-1"
                              aria-label="Open Magic 8-Ball fortune teller"
                              aria-expanded={showQuickOracle}
                            >
                              🎱
                            </button>
                          </div>
          
          <AnimatePresence>
            {showQuickOracle && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <Card className="p-6 bg-card border-2 border-border relative overflow-hidden max-w-md mx-auto">
                  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    {[...Array(8)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-primary/30"
                        style={{ 
                          left: `${10 + i * 12}%`, 
                          top: `${20 + (i % 3) * 25}%`,
                          fontSize: '12px'
                        }}
                        animate={animationsEnabled ? { 
                          opacity: [0.2, 0.6, 0.2],
                          scale: [0.8, 1.2, 0.8],
                        } : {}}
                        transition={{
                          duration: 2,
                          delay: i * 0.3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        ✦
                      </motion.span>
                    ))}
                  </div>
                  <div className="flex flex-col items-center gap-4 relative z-10">
                    <p className="text-muted-foreground text-lg">Think of a yes/no question, then shake!</p>
                    <motion.button
                      onClick={shakeTheOrb}
                      disabled={isShakingOrb}
                      className="text-7xl cursor-pointer hover:scale-110 transition-transform disabled:cursor-wait focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg p-2"
                      animate={isShakingOrb && animationsEnabled ? { 
                        x: [0, -15, 15, -15, 15, -10, 10, 0],
                        rotate: [0, -8, 8, -8, 8, -5, 5, 0],
                        scale: [1, 1.05, 1, 1.05, 1, 1.02, 1, 1]
                      } : {}}
                      transition={{ duration: 0.8, repeat: isShakingOrb ? Infinity : 0 }}
                      aria-label="Shake the Magic 8-Ball for a yes/no answer"
                      aria-live="polite"
                    >
                      <span aria-hidden="true">🎱</span>
                    </motion.button>
                    
                    <AnimatePresence>
                      {isShakingOrb && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-primary text-lg font-medium italic"
                        >
                          ✨ The spirits are stirring... ✨
                        </motion.p>
                      )}
                      {quickAnswer && !isShakingOrb && (
                        <motion.div
                          initial={animationsEnabled ? { opacity: 0, scale: 0.5, rotate: -10 } : {}}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={animationsEnabled ? { opacity: 0, scale: 0.8 } : {}}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className={`px-8 py-4 rounded-2xl text-xl font-bold ${
                            quickAnswer.type === 'yes' ? 'bg-green-500/20 text-green-300 border-2 border-green-500/40' :
                            quickAnswer.type === 'no' ? 'bg-red-500/20 text-red-300 border-2 border-red-500/40' :
                            'bg-primary/20 text-primary border-2 border-primary/40'
                          }`}
                          role="status"
                          aria-live="polite"
                        >
                          {quickAnswer.text}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.footer>
      </div>
    </div>
  )
}
