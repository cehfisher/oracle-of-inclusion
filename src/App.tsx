import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, ArrowsClockwise, Check, Plus, X, SpeakerHigh, SpeakerSlash, Sparkle, ArrowCounterClockwise, Moon, Sun } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { toast, Toaster } from 'sonner'

import { askOracle, MAX_QUESTION_COUNT, MIN_QUESTION_COUNT, normalizeQuestionCount, VIBE_TYPE_OPTIONS, VIBE_TYPES } from '@/lib/llm'

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
    
    const frequencies = [1200, 1600, 2000]
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0, now + i * 0.04)
      gain.gain.linearRampToValueAtTime(0.06, now + i * 0.04 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.15)
      osc.start(now + i * 0.04)
      osc.stop(now + i * 0.04 + 0.15)
    })
  }
  
  const playMagic = () => {
    const ctx = getContext()
    const now = ctx.currentTime
    const notes = [1047, 1568, 2093]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.08, now + i * 0.06)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2)
      osc.start(now + i * 0.06)
      osc.stop(now + i * 0.06 + 0.2)
    })
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
    gain.gain.setValueAtTime(0.05, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
    osc.start(now)
    osc.stop(now + 0.08)
  }
  
  const playReset = () => {
    const ctx = getContext()
    const now = ctx.currentTime
    
    const notes = [500, 350]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0, now + i * 0.05)
      gain.gain.linearRampToValueAtTime(0.06, now + i * 0.05 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.12)
      osc.start(now + i * 0.05)
      osc.stop(now + i * 0.05 + 0.12)
    })
  }
  
  return { playTwinkle, playMagic, playNav, playReset }
}

const useLocalStorageState = <T,>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key)
      return storedValue === null ? defaultValue : JSON.parse(storedValue)
    } catch {
      return defaultValue
    }
  })

  const setStoredValue = useCallback((nextValue: T | ((previousValue: T) => T)) => {
    setValue((previousValue) => {
      const resolvedValue = typeof nextValue === 'function'
        ? (nextValue as (previousValue: T) => T)(previousValue)
        : nextValue

      try {
        window.localStorage.setItem(key, JSON.stringify(resolvedValue))
      } catch {
        return resolvedValue
      }

      return resolvedValue
    })
  }, [key])

  return [value, setStoredValue] as const
}

interface Question {
  id: string
  text: string
  vibe: string
}

const MYSTICAL_LOADING_PHRASES = [
  "Consulting the ancient stars... ✨",
  "The cosmos whispers secrets... 🌙",
  "Channeling celestial wisdom... 💫",
  "The spirits gather their thoughts... 👻",
  "Starlight reveals the path... ⭐",
  "The mystic veil parts slowly... 🔮",
  "Ancient runes glow with meaning... ✨",
  "The oracle peers beyond... 🌌",
  "Cosmic energies align... 💎",
  "Ethereal whispers grow near... ✨",
]

const MYSTIC_THINKING_QUESTIONS = [
  "What stories deserve to be heard?",
  "Which barriers shall we dissolve today?",
  "What wisdom lies in lived experience?",
  "How might we design for everyone?",
  "What does true belonging look like?",
  "Where does accessibility meet joy?",
  "What assumptions need questioning?",
  "How do we center those most affected?",
  "What futures are we building together?",
  "How can technology serve humanity?",
  "What does inclusive innovation mean?",
  "Where is the magic in accessibility?",
]

const MYSTICAL_GREETINGS = [
  "The oracle senses your need ✨",
  "Your questions await revelation ✨",
  "The cosmos whispers your queries 🌙",
  "Destiny stirs within the crystal 💎",
  "The ancient spirits are listening ⭐",
  "The veil between worlds grows thin ✨",
  "Wisdom flows through the ether ✨",
  "The stars align in your favor 💫",
  "Ancient knowledge awakens ✨",
  "The mystic currents guide you ✨",
  "Celestial forces gather ✨",
  "Sacred questions find their voice ✨",
  "The crystal shimmers with insight 💎",
  "Ethereal whispers draw near 🌙",
  "Infinite wisdom awaits discovery ⭐",
  "Arcane energies converge ✨",
  "The universe bends to listen ✨",
  "Stardust settles upon your path 💫",
  "The cosmic library opens for you ✨",
  "Mystery unfolds before you ✨",
  "The astral winds carry your intent ✨",
  "Moonlight illuminates hidden truths 🌙",
  "The sacred scrolls unfurl ✨",
  "Enchanted wisdom stirs 🪄",
  "The constellation of answers forms ✨",
  "Timeless secrets await sharing ✨",
  "The aurora of insight appears ✨",
  "Mystic fog parts to reveal clarity ✨",
  "The enchanted realm welcomes you ✨",
  "Cosmic tides flow in your direction ✨",
  "The starlit path reveals itself ⭐",
  "Ancient runes glow with meaning ✨",
  "The celestial choir hums softly ✨",
  "Twilight magic awakens ✨",
  "The universe prepares its gifts ✨",
]

const getRandomGreeting = (): string => {
  return MYSTICAL_GREETINGS[Math.floor(Math.random() * MYSTICAL_GREETINGS.length)]
}

const getRandomLoadingPhrase = (): string => {
  return MYSTICAL_LOADING_PHRASES[Math.floor(Math.random() * MYSTICAL_LOADING_PHRASES.length)]
}

const TOPIC_SUGGESTIONS = [
  '♿ Accessible design',
  '🦾 Assistive technology',
  '🧠 Neurodiversity',
  '🔊 Screen readers',
  '💼 Inclusive hiring',
  '📋 WCAG standards',
  '📣 Disability advocacy',
  '🌍 Universal design',
  '💚 Mental health',
  '🏢 Workplace accommodations',
  '🩺 Chronic illness',
  '🤟 Deaf culture',
  '👁️ Blind & low vision',
  '🦽 Mobility & physical',
  '📚 Learning differences',
  '🎯 Autism & ADHD',
  '🙈 Invisible disabilities',
  '🎮 Accessible gaming',
  '🖼️ Alt text & captions',
  '⌨️ Keyboard navigation',
  '🎨 Color blindness',
  '🧩 Cognitive load',
  '✍️ Plain language',
  '🎤 Voice control',
  '🤖 AI & disability',
  '🏠 Remote work access',
  '🎪 Accessible events',
  '💪 Self-advocacy',
  '🏳️‍🌈 Disability pride',
  '🚌 Accessible transit'
]

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const FALLBACK_QUESTIONS: Pick<Question, 'text' | 'vibe'>[] = [
  { text: 'What does inclusion mean in your everyday work?', vibe: '🤗 Warm' },
  { text: 'Where can accessibility make technology better for everyone?', vibe: '🤔 Thoughtful' },
  { text: 'What small design choice has made a big difference for people?', vibe: '🧘 Deep' },
  { text: 'What is one accessibility win that made you smile?', vibe: '😜 Whimsical' },
  { text: 'How can teams listen better to disabled people?', vibe: '🤗 Warm' },
  { text: 'What barrier should tech teams stop accepting as normal?', vibe: '🤔 Thoughtful' },
  { text: 'What does respectful innovation look like to you?', vibe: '🧘 Deep' },
  { text: 'If accessibility had a superpower, what would it be?', vibe: '😜 Whimsical' },
  { text: 'What helps people feel like they truly belong?', vibe: '🤗 Warm' },
  { text: 'How can leaders make inclusion part of everyday decisions?', vibe: '🤔 Thoughtful' },
]

const getRandomVibe = (): string => {
  return VIBE_TYPES[Math.floor(Math.random() * VIBE_TYPES.length)]
}

const QUESTION_COUNT_STEP = 0.1
const QUESTION_TYPE_MAX = 100
const QUESTION_TYPE_STEP = 1

const QUESTION_TYPE_SCALE = VIBE_TYPE_OPTIONS

const getQuestionTypePosition = (value: number): number => (
  (Math.max(0, Math.min(QUESTION_TYPE_MAX, value)) / QUESTION_TYPE_MAX) * (QUESTION_TYPE_SCALE.length - 1)
)

const getQuestionTypeBlend = (value: number) => {
  const position = getQuestionTypePosition(value)
  const lowerIndex = Math.floor(position)
  const upperIndex = Math.ceil(position)
  return {
    lower: QUESTION_TYPE_SCALE[lowerIndex],
    upper: QUESTION_TYPE_SCALE[upperIndex],
    upperWeight: position - lowerIndex,
  }
}

const getQuestionTypeDescription = (value: number): string => {
  const { lower, upper, upperWeight } = getQuestionTypeBlend(value)

  if (lower === upper) {
    return `${lower.label} - ${lower.description}`
  }

  const lowerWeight = 1 - upperWeight

  return `blend of ${lower.label} (${Math.round(lowerWeight * 100)}%) and ${upper.label} (${Math.round(upperWeight * 100)}%) questions`
}

const getQuestionTypeAriaText = (value: number): string => {
  const { lower, upper, upperWeight } = getQuestionTypeBlend(value)

  if (lower === upper) {
    return lower.label
  }

  if (Math.abs(upperWeight - 0.5) < 0.01) {
    return `Equally between ${lower.label} and ${upper.label}`
  }

  return `Between ${lower.label} and ${upper.label}, leaning ${upperWeight > 0.5 ? upper.label : lower.label}`
}

const getQuestionHistory = (value: unknown): string[] => {
  return Array.isArray(value) ? value.filter((question): question is string => typeof question === 'string') : []
}

const getToastMotionProps = (animationsEnabled: boolean) => (
  animationsEnabled
    ? {
        initial: { opacity: 0, scale: 0.8, y: -20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: -10 },
        transition: { duration: 0.4, ease: "easeOut" },
      }
    : {
        initial: false as const,
        animate: {},
        exit: {},
        transition: { duration: 0 },
      }
)

const FOCUS_AREAS = [
  { id: 'frontend', label: '🖥️ Front-end dev' },
  { id: 'backend', label: '⚙️ Back-end dev' },
  { id: 'design', label: '🎨 Design & UX' },
  { id: 'accessibility', label: '🧩 Accessibility' },
  { id: 'leadership', label: '👔 Leadership' },
  { id: 'education', label: '📖 Education' },
  { id: 'advocacy', label: '📣 Advocacy & community' },
  { id: 'other', label: '✏️ Other' },
]



export default function App() {
  const [topics, setTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [otherFocusArea, setOtherFocusArea] = useState('')
  const [experience, setExperience] = useState('')
  const [audience, setAudience] = useState('')

  const [questionCount, setQuestionCount] = useState(3)
  const [questionTone, setQuestionTone] = useState(50)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loadingPhrase, setLoadingPhrase] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [thinkingQuestions, setThinkingQuestions] = useState<string[]>([])
  const [isShuffling, setIsShuffling] = useState(false)
  const [soundEnabled, setSoundEnabled] = useLocalStorageState<boolean>('oracle-sound-enabled-v2', true)
  const [animationsEnabled, setAnimationsEnabled] = useLocalStorageState<boolean>('oracle-animations-enabled-v2', true)
  const [darkMode, setDarkMode] = useLocalStorageState<boolean>('oracle-dark-mode-v2', false)

  const [previousQuestions, setPreviousQuestions] = useLocalStorageState<string[]>('oracle-previous-questions', [])
  const effectiveQuestionCount = normalizeQuestionCount(questionCount)
  const toastMotionProps = useMemo(() => getToastMotionProps(animationsEnabled), [animationsEnabled])
  
  const [shuffledTopicSuggestions, setShuffledTopicSuggestions] = useState(() => shuffleArray(TOPIC_SUGGESTIONS))
  const [mysticalGreeting, setMysticalGreeting] = useState(() => getRandomGreeting())
  const [greetingKey, setGreetingKey] = useState(0)
  const [explosionParticles, setExplosionParticles] = useState<Array<{ id: number; x: number; y: number; angle: number; distance: number; symbol: string; color: string }>>([])
  const [isExploding, setIsExploding] = useState(false)
  
  const reshuffleTopics = useCallback(() => {
    setShuffledTopicSuggestions(shuffleArray(TOPIC_SUGGESTIONS))
    setMysticalGreeting(getRandomGreeting())
    setGreetingKey(prev => prev + 1)
  }, [])
  
  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])
  
  useEffect(() => {
    if (darkMode === true) {
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
    if (!animationsEnabled && isExploding) {
      setIsExploding(false)
      setExplosionParticles([])
    }
  }, [animationsEnabled, isExploding])
  
  useEffect(() => {
    if (isGenerating) {
      setLoadingProgress(0)
      setThinkingQuestions([])
      
      const shuffled = shuffleArray([...MYSTIC_THINKING_QUESTIONS])
      let questionIndex = 0
      
      const questionInterval = setInterval(() => {
        if (questionIndex < 4) {
          setThinkingQuestions(prev => [...prev, shuffled[questionIndex]])
          questionIndex++
        }
      }, 800)
      
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 300)
      
      return () => {
        clearInterval(questionInterval)
        clearInterval(progressInterval)
      }
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
    setQuestionTone(50)
    setQuestions([])
    setCurrentQuestionIndex(0)
    playSound(sounds.playReset)
    window.scrollTo({ top: 0, behavior: animationsEnabled ? 'smooth' : 'auto' })
    toast.custom(
      (t) => (
        <motion.div
          {...toastMotionProps}
          className="relative px-8 py-5 rounded-2xl border-2 border-border overflow-hidden mystic-glow cursor-pointer toast-popup"
          onClick={() => toast.dismiss(t)}
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" aria-hidden="true" />
          
          <div className="relative flex items-center gap-4 pt-2">
            <span className="text-4xl shrink-0">🌿</span>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">The Oracle Resets</span>
              <span className="text-xl font-bold text-foreground" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                A fresh start awaits&nbsp;✨
              </span>
            </div>
          </div>
          
          <div 
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"
            aria-hidden="true"
          />
        </motion.div>
      ),
      { duration: 3000 }
    )
  }, [animationsEnabled, soundEnabled, sounds, toastMotionProps])

  const triggerExplosion = useCallback(() => {
    if (isExploding) return

    if (!animationsEnabled) {
      resetForm()
      return
    }
    
    const symbols = ['✨', '💫', '⭐', '🌟', '💎', '🔮', '✦', '★', '🌙']
    const colors = ['text-primary', 'text-accent', 'text-secondary', 'text-yellow-400', 'text-purple-400', 'text-pink-400']
    
    const particles = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      angle: (i / 24) * 360 + Math.random() * 15,
      distance: 80 + Math.random() * 120,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      color: colors[Math.floor(Math.random() * colors.length)]
    }))
    
    setExplosionParticles(particles)
    setIsExploding(true)
    playSound(sounds.playMagic)
    
    setTimeout(() => {
      setIsExploding(false)
      setExplosionParticles([])
      resetForm()
    }, 800)
  }, [animationsEnabled, isExploding, resetForm, sounds, playSound])

  const buildFallbackQuestions = useCallback((): Question[] => {
    return shuffleArray([...FALLBACK_QUESTIONS]).slice(0, effectiveQuestionCount).map((question, i) => ({
      id: `fallback-${Date.now()}-${i}`,
      text: question.text,
      vibe: question.vibe && VIBE_TYPES.includes(question.vibe) ? question.vibe : getRandomVibe()
    }))
  }, [effectiveQuestionCount])

  const generateQuestions = useCallback(async (isShuffle = false) => {
    if (isShuffle) {
      setIsShuffling(true)
      toast.custom(
        (t) => (
          <motion.div
            {...toastMotionProps}
            className="relative px-8 py-5 rounded-2xl border-2 border-border overflow-hidden mystic-glow cursor-pointer toast-popup"
            onClick={() => toast.dismiss(t)}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" aria-hidden="true" />
            
            <div className="relative flex items-center gap-4 pt-2">
              <span className="text-4xl shrink-0">🔄</span>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">The Oracle Shuffles</span>
                <span className="text-xl font-bold text-foreground" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                  New wisdom emerges...&nbsp;✨
                </span>
              </div>
            </div>
            
            <div 
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"
              aria-hidden="true"
            />
          </motion.div>
        ),
        { duration: 3000 }
      )
    } else {
      setIsGenerating(true)
      setQuestions([])
    }
    setCurrentQuestionIndex(0)
    setLoadingPhrase(getRandomLoadingPhrase())
    playSound(sounds.playTwinkle)
    reshuffleTopics()

    const focusAreasLabels = FOCUS_AREAS.filter(a => focusAreas.includes(a.id) && a.id !== 'other').map(a => a.label)
    if (focusAreas.includes('other') && otherFocusArea.trim()) {
      focusAreasLabels.push(otherFocusArea.trim())
    }
    const recentQuestions = getQuestionHistory(previousQuestions)

    const toneDescription = getQuestionTypeDescription(questionTone)

    try {
      const result = await askOracle({
        topic: topics.join(', '),
        focusAreas: focusAreasLabels,
        audience,
        numQuestions: effectiveQuestionCount,
        questionType: toneDescription,
        accessibilityExpertise: experience,
        recentQuestions,
      })
      const parsed = JSON.parse(result)
      const generatedItems = Array.isArray(parsed?.questions)
        ? parsed.questions.filter((q: unknown): q is { text: string; vibe?: string } => (
            typeof q === 'object' &&
            q !== null &&
            typeof (q as { text?: unknown }).text === 'string'
          ))
        : []

      if (generatedItems.length < effectiveQuestionCount) {
        throw new Error('Oracle API returned too few questions')
      }

      const generatedQuestions: Question[] = shuffleArray(generatedItems.slice(0, effectiveQuestionCount).map((q, i) => ({
        id: `q-${Date.now()}-${i}`,
        text: q.text,
        vibe: q.vibe && VIBE_TYPES.includes(q.vibe) ? q.vibe : getRandomVibe()
      })))
      setQuestions(generatedQuestions)
      
      const newQuestionTexts = generatedQuestions.map(q => q.text)
      setPreviousQuestions((prev) => [...getQuestionHistory(prev).slice(-100), ...newQuestionTexts])
      
      playSound(sounds.playMagic)
    } catch (error) {
      console.error('Question generation failed:', error)
      const fallbackQuestions = buildFallbackQuestions()
      setQuestions(fallbackQuestions)
      const fallbackTexts = fallbackQuestions.map(q => q.text)
      setPreviousQuestions((prev) => [...getQuestionHistory(prev).slice(-100), ...fallbackTexts])
      toast.info('Generation failed, showing backup questions. Try Shuffle for fresh magic.')
      playSound(sounds.playMagic)
    } finally {
      if (!isShuffle) {
        setIsGenerating(false)
      }
      setIsShuffling(false)
    }
  }, [focusAreas, otherFocusArea, effectiveQuestionCount, questionTone, topics, experience, audience, soundEnabled, sounds, reshuffleTopics, previousQuestions, setPreviousQuestions, buildFallbackQuestions, toastMotionProps])

  const handleGenerateClick = () => {
    window.scrollTo({ top: 0, behavior: animationsEnabled ? 'smooth' : 'auto' })
    toast.custom(
      (t) => (
        <motion.div
          {...toastMotionProps}
          className="relative px-8 py-5 rounded-2xl border-2 border-border overflow-hidden mystic-glow cursor-pointer toast-popup"
          onClick={() => toast.dismiss(t)}
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" aria-hidden="true" />
          
          <div className="relative flex items-center gap-4 pt-2">
            <span className="text-4xl shrink-0">✨</span>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">The Oracle Speaks</span>
              <span className="text-xl font-bold text-foreground" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                {mysticalGreeting.replace(/\s*(✨|🌙|💎|⭐|💫|🪄)$/, '')}&nbsp;{mysticalGreeting.match(/(✨|🌙|💎|⭐|💫|🪄)$/)?.[0] || '✨'}
              </span>
            </div>
          </div>
          
          <div 
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"
            aria-hidden="true"
          />
        </motion.div>
      ),
      { duration: 3000 }
    )
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

  const COPY_PHRASES = [
    { text: "Wisdom captured", emoji: "📜" },
    { text: "Knowledge secured", emoji: "🗝️" },
    { text: "Magic bottled", emoji: "🧪" },
    { text: "Insight preserved", emoji: "💎" },
    { text: "Words enchanted", emoji: "✨" },
    { text: "Scroll inscribed", emoji: "📿" },
  ]

  const copyQuestion = useCallback(async (question: Question) => {
    await navigator.clipboard.writeText(question.text)
    setCopiedId(question.id)
    const phrase = COPY_PHRASES[Math.floor(Math.random() * COPY_PHRASES.length)]
    toast.custom(
      (t) => (
        <motion.div
          {...toastMotionProps}
          className="relative px-8 py-5 rounded-2xl border-2 border-border overflow-hidden mystic-glow cursor-pointer toast-popup"
          onClick={() => toast.dismiss(t)}
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" aria-hidden="true" />
          
          <div className="relative flex items-center gap-4 pt-2">
            <span className="text-4xl shrink-0">{phrase.emoji}</span>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">The Oracle Inscribes</span>
              <span className="text-xl font-bold text-foreground" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                {phrase.text}&nbsp;✨
              </span>
            </div>
          </div>
          
          <div 
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"
            aria-hidden="true"
          />
        </motion.div>
      ),
      { duration: 2000 }
    )
    setTimeout(() => setCopiedId(null), 2000)
  }, [toastMotionProps])

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
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
            generateQuestions(true)
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
      duration: 12 + Math.random() * 20,
      delay: Math.random() * 25,
      size: 0.12 + Math.random() * 0.9,
      symbol: Math.random() > 0.65 ? '★' : '✦',
      hasGlow: Math.random() > 0.5,
    })), []
  )



  return (
    <div className={`min-h-screen bg-background p-4 md:p-8 relative overflow-hidden mystical-bg ${animationsEnabled ? '' : 'animations-disabled'}`}>
      {animationsEnabled && (
        <div className="fixed inset-0 pointer-events-none z-[1]" aria-hidden="true">
          {sparklePositions.map((sparkle) => (
            <motion.span
              key={sparkle.id}
              className={`${sparkle.hasGlow ? 'sparkle-particle-glow' : 'sparkle-particle'} text-primary/30 dark:text-primary/70`}
              style={{ 
                left: sparkle.left, 
                top: sparkle.top,
                fontSize: `${sparkle.size * 18}px`,
                animationDuration: `${sparkle.duration}s`,
                animationDelay: `${sparkle.delay}s`,
              }}
            >
              {sparkle.symbol}
            </motion.span>
          ))}
        </div>
      )}
      <Toaster position="top-center" theme={darkMode ? "dark" : "light"} />
      
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-bold">
        Skip to main content
      </a>
      
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.header 
          className="text-center mb-10 pt-6 relative z-20"
          {...animationProps}
          role="banner"
        >
          <motion.button 
            className="inline-block mb-6 cursor-pointer hover:scale-110 transition-transform focus:outline-none select-none active:scale-100 relative"
            animate={animationsEnabled && !isExploding ? floatAnimation : {}}
            transition={animationsEnabled ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : {}}
            onClick={triggerExplosion}
            aria-label="Reset form and start over"
          >
            <motion.span 
              className="text-7xl md:text-8xl inline-block"
              animate={animationsEnabled && isExploding ? { scale: [1, 1.3, 0], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }}
              transition={animationsEnabled && isExploding ? { duration: 0.4, ease: "easeOut" } : { duration: 0 }}
            >
              🔮
            </motion.span>
            <AnimatePresence>
              {animationsEnabled && isExploding && explosionParticles.map((particle) => (
                <motion.span
                  key={particle.id}
                  className={`absolute left-1/2 top-1/2 ${particle.color} pointer-events-none`}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{ 
                    x: Math.cos(particle.angle * Math.PI / 180) * particle.distance,
                    y: Math.sin(particle.angle * Math.PI / 180) * particle.distance,
                    scale: 0,
                    opacity: 0
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  style={{ fontSize: '1.5rem' }}
                >
                  {particle.symbol}
                </motion.span>
              ))}
            </AnimatePresence>
          </motion.button>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-3" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Oracle of Inclusion
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-8">
            The path to understanding begins with the right question...
          </p>
          <div className="flex justify-center items-center gap-3 flex-wrap mb-10">
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

        <main id="main-content" className="relative z-10">
          {questions.length === 0 && !isShuffling ? (
            <motion.div
              initial={animationsEnabled ? { opacity: 0, y: 20 } : {}}
              animate={{ opacity: 1, y: 0 }}
              transition={animationsEnabled ? { duration: 0.5, delay: 0.1 } : { duration: 0 }}
            >
              <Card className="p-6 md:p-8 bg-card border-2 border-border mystic-glow card-subtle-glow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" aria-hidden="true" />

                <div className="space-y-8">
                  <div className="pt-4">
                    <Label htmlFor="topics" className="text-foreground mb-3 block text-xl font-bold form-heading">
                      🌟 Topics to explore
                    </Label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        id="topics"
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a topic..."
                        className="bg-input border-2 border-border text-foreground placeholder:text-foreground/50 text-base py-6 form-field"
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
                          className="pl-4 pr-2 py-2 flex items-center gap-2 bg-primary/20 text-primary border-2 border-primary/30 text-base form-field"
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
                          className="text-base px-4 py-2.5 rounded-full border-2 border-border text-foreground hover:border-primary hover:text-primary transition-all hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background form-field"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-center" aria-hidden="true">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                    <span className="mx-3 text-muted-foreground/30">✦</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
                  </div>

                  <fieldset>
                    <legend className="text-foreground mb-3 block text-xl font-bold form-heading">
                      👤 Guest's focus areas (select all that apply)
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {FOCUS_AREAS.map(area => (
                        <button 
                          key={area.id}
                          type="button"
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all text-left form-field ${
                            focusAreas.includes(area.id) 
                              ? 'border-primary bg-primary/15' 
                              : 'border-border hover:border-primary/50'
                          } focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background`}
                          onClick={() => toggleFocusArea(area.id)}
                          aria-pressed={focusAreas.includes(area.id)}
                          aria-describedby={area.id === 'other' ? 'other-focus-hint' : undefined}
                        >
                          <span className="text-base">{area.label}</span>
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
                          className="bg-input border-2 border-border text-foreground placeholder:text-foreground/50 text-base py-6 form-field"
                        />
                        <p id="other-focus-hint" className="sr-only">When selected, you can describe your custom focus area</p>
                      </div>
                    )}
                  </fieldset>

                  <div className="flex items-center justify-center" aria-hidden="true">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                    <span className="mx-3 text-muted-foreground/30">✦</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="experience" className="text-foreground mb-3 block text-xl font-bold form-heading">
                        ⏳ Digital accessibility experience
                      </Label>
                      <Select value={experience} onValueChange={setExperience}>
                        <SelectTrigger id="experience" className="bg-input border-2 border-border text-foreground text-base py-6 w-full [&_[data-placeholder]]:text-foreground/50 [&_svg]:size-5 [&_svg]:text-foreground form-field">
                          <SelectValue placeholder="Select level..." />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-2 border-border min-w-[280px]">
                          <SelectItem value="0-2" className="text-base py-3 form-field">🌱 New to it (0-2 years)</SelectItem>
                          <SelectItem value="3-5" className="text-base py-3 form-field">🌿 Growing (3-5 years)</SelectItem>
                          <SelectItem value="6-10" className="text-base py-3 form-field">🌳 Seasoned (6-10 years)</SelectItem>
                          <SelectItem value="11-15" className="text-base py-3 form-field">🏆 Expert (11-15 years)</SelectItem>
                          <SelectItem value="15+" className="text-base py-3 form-field">⭐ Veteran (15+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="audience" className="text-foreground mb-3 block text-xl font-bold form-heading">
                        👥 Who's the audience?
                      </Label>
                      <Select value={audience} onValueChange={setAudience}>
                        <SelectTrigger id="audience" className="bg-input border-2 border-border text-foreground text-base py-6 w-full [&_[data-placeholder]]:text-foreground/50 [&_svg]:size-5 [&_svg]:text-foreground form-field">
                          <SelectValue placeholder="Select audience..." />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-2 border-border min-w-[280px]">
                          <SelectItem value="general" className="text-base py-3 form-field">🌍 General / mixed</SelectItem>
                          <SelectItem value="developers" className="text-base py-3 form-field">💻 Developers & engineers</SelectItem>
                          <SelectItem value="designers" className="text-base py-3 form-field">🎨 Designers & UX</SelectItem>
                          <SelectItem value="leaders" className="text-base py-3 form-field">👔 Leaders & managers</SelectItem>
                          <SelectItem value="advocates" className="text-base py-3 form-field">📣 Advocates & allies</SelectItem>
                          <SelectItem value="students" className="text-base py-3 form-field">📚 Students & newcomers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-center" aria-hidden="true">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                    <span className="mx-3 text-muted-foreground/30">✦</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
                  </div>

                  <div>
                    <label id="question-count-label" className="text-foreground mb-3 block text-xl font-bold form-heading">
                      🔢 Number of questions
                    </label>
                    <div className="px-2 py-4">
                      <Slider
                        id="question-count-slider"
                        value={[questionCount]}
                        onValueChange={(value) => setQuestionCount(value[0])}
                        min={MIN_QUESTION_COUNT}
                        max={MAX_QUESTION_COUNT}
                        step={QUESTION_COUNT_STEP}
                        className="accessible-slider w-full"
                        getThumbProps={() => ({
                          'aria-labelledby': 'question-count-label',
                          'aria-valuetext': `${effectiveQuestionCount} question${effectiveQuestionCount === 1 ? '' : 's'}`
                        })}
                      />
                      <div className="relative h-7 mt-2 text-base text-foreground font-medium form-field" aria-hidden="true">
                        {Array.from({ length: MAX_QUESTION_COUNT }, (_, index) => (
                          <span
                            key={index + 1}
                            className="absolute top-0 -translate-x-1/2"
                            style={{ left: `${(index / (MAX_QUESTION_COUNT - 1)) * 100}%` }}
                          >
                            {index + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label id="question-tone-label" className="text-foreground mb-3 block text-xl font-bold form-heading">
                      🎭 Question type
                    </label>
                    <div className="px-2 py-4">
                      <Slider
                        id="question-tone-slider"
                        value={[questionTone]}
                        onValueChange={(value) => setQuestionTone(value[0])}
                        min={0}
                        max={QUESTION_TYPE_MAX}
                        step={QUESTION_TYPE_STEP}
                        className="accessible-slider w-full"
                        getThumbProps={() => ({
                          'aria-labelledby': 'question-tone-label',
                          'aria-valuetext': getQuestionTypeAriaText(questionTone)
                        })}
                      />
                      <div className="relative min-h-12 mt-2 text-base text-foreground font-medium form-field" aria-hidden="true">
                        {QUESTION_TYPE_SCALE.map((questionType, index) => (
                          <span
                            key={questionType.label}
                            className={`absolute top-0 max-w-[35%] whitespace-normal ${
                              index === 0
                                ? 'left-0 text-left'
                                : index === QUESTION_TYPE_SCALE.length - 1
                                  ? 'right-0 text-right'
                                  : '-translate-x-1/2 text-center'
                            }`}
                            style={
                              index === 0 || index === QUESTION_TYPE_SCALE.length - 1
                                ? undefined
                                : { left: `${(index / (QUESTION_TYPE_SCALE.length - 1)) * 100}%` }
                            }
                          >
                            {questionType.label}
                          </span>
                        ))}
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
                          animate={animationsEnabled ? { rotate: 360 } : {}}
                          transition={animationsEnabled ? { duration: 1.5, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
                          aria-hidden="true"
                        >
                          <ArrowsClockwise size={28} />
                        </motion.div>
                      ) : (
                        'Reveal questions'
                      )}
                    </Button>
                    <Button 
                      onClick={resetForm}
                      variant="outline"
                      className="py-7 px-6 border-2 border-primary/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-primary focus:ring-4 focus:ring-ring focus:ring-offset-2"
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
              <Card className="p-6 md:p-8 bg-card border-2 border-border card-subtle-glow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent via-primary to-accent" aria-hidden="true" />

                {isGenerating && (
                  <div className="text-center py-12" role="status" aria-live="polite">
                    <motion.div
                      animate={animationsEnabled ? { 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      } : {}}
                      transition={animationsEnabled ? { duration: 2, repeat: Infinity } : { duration: 0 }}
                      className="text-8xl mb-6"
                      aria-hidden="true"
                    >
                      ✨
                    </motion.div>
                    <motion.p 
                      className="text-xl text-primary font-medium mb-6"
                      animate={animationsEnabled ? { opacity: [0.7, 1, 0.7] } : {}}
                      transition={animationsEnabled ? { duration: 1.5, repeat: Infinity } : { duration: 0 }}
                    >
                      {loadingPhrase}
                    </motion.p>
                    
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 border border-primary/20 max-w-md mx-auto">
                      <p className="text-sm text-muted-foreground mb-3 italic">The oracle ponders...</p>
                      <div className="space-y-2 min-h-[120px]">
                        <AnimatePresence>
                          {thinkingQuestions.map((question, index) => (
                            <motion.p
                              key={question}
                              initial={animationsEnabled ? { opacity: 0, x: -10 } : {}}
                              animate={{ opacity: 1, x: 0 }}
                              transition={animationsEnabled ? { duration: 0.4, delay: index * 0.1 } : { duration: 0 }}
                              className="text-base text-foreground/80 font-medium"
                            >
                              "{question}"
                            </motion.p>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                    
                    <div className="w-full max-w-xs mx-auto h-3 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(loadingProgress)} aria-valuemin={0} aria-valuemax={100}>
                      <motion.div 
                        className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${loadingProgress}%` }}
                        transition={animationsEnabled ? { duration: 0.3 } : { duration: 0 }}
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
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </span>
                        <span className="text-lg font-bold text-primary bg-primary/20 px-4 py-2 rounded-full">
                          {currentQuestion.vibe}
                        </span>
                      </div>
                      
                      <div className="p-6 rounded-xl bg-gradient-to-br from-primary/15 via-accent/10 to-secondary/15 border-2 border-primary/30 max-h-[50vh] overflow-y-auto">
                        <p className="text-xl md:text-2xl text-foreground leading-relaxed font-medium text-center break-words" role="status" aria-live="polite">
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

              <div className="flex flex-wrap gap-3 justify-center mt-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => currentQuestion && copyQuestion(currentQuestion)}
                  disabled={!currentQuestion}
                  className="text-lg py-6 px-6 border-2 border-border text-foreground hover:bg-primary/15 hover:text-primary hover:border-primary focus:ring-4 focus:ring-ring focus:ring-offset-2"
                  aria-label={copiedId === currentQuestion?.id ? 'Copied to clipboard' : 'Copy question to clipboard'}
                >
                  {copiedId === currentQuestion?.id ? (
                    <Check size={22} className="text-green-500 mr-2" aria-hidden="true" />
                  ) : (
                    <Copy size={22} className="mr-2" aria-hidden="true" />
                  )}
                  {copiedId === currentQuestion?.id ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => generateQuestions(true)}
                  disabled={isGenerating}
                  className="text-lg py-6 px-8 border-2 border-border text-foreground hover:bg-accent/15 hover:text-accent hover:border-accent focus:ring-4 focus:ring-ring focus:ring-offset-2"
                  aria-label="Shuffle all questions and generate new ones"
                >
                  <ArrowsClockwise size={22} className="mr-2" aria-hidden="true" />
                  Shuffle
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={resetForm}
                  className="text-lg py-6 px-8 border-2 border-border text-foreground hover:bg-muted/50 hover:text-muted-foreground hover:border-muted-foreground focus:ring-4 focus:ring-ring focus:ring-offset-2"
                  aria-label="Restart and reset the form"
                >
                  <ArrowCounterClockwise size={22} className="mr-2" aria-hidden="true" />
                  Restart
                </Button>
              </div>
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
            Questions are AI-generated. This app may not be fully accessible.
            <br />
            <a
              href="https://github.com/cehfisher"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-primary hover:text-primary/80 underline underline-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded"
              aria-label="Created by cehfisher (opens GitHub in new tab)"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 16 16"
                className="size-4 fill-current"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 3.86c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              Created by cehfisher
            </a>
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
