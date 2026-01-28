import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Heart, ArrowClockwise, Check, Plus, X, Export, SpeakerHigh, SpeakerSlash, Sparkle, ArrowCounterClockwise, Keyboard } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
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
  
  const playMysticChime = () => {
    const ctx = getContext()
    const now = ctx.currentTime
    
    const frequencies = [523.25, 659.25, 783.99, 1046.5]
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0, now + i * 0.15)
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8)
      osc.start(now + i * 0.15)
      osc.stop(now + i * 0.15 + 0.8)
    })
  }
  
  const playReveal = () => {
    const ctx = getContext()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.2)
    osc.type = 'triangle'
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc.start(now)
    osc.stop(now + 0.3)
  }
  
  const playShake = () => {
    const ctx = getContext()
    const now = ctx.currentTime
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 150 + Math.random() * 100
      osc.type = 'square'
      gain.gain.setValueAtTime(0.05, now + i * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.08)
      osc.start(now + i * 0.1)
      osc.stop(now + i * 0.1 + 0.08)
    }
  }
  
  const playSuccess = () => {
    const ctx = getContext()
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.2, now + i * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3)
      osc.start(now + i * 0.1)
      osc.stop(now + i * 0.1 + 0.3)
    })
  }
  
  return { playMysticChime, playReveal, playShake, playSuccess }
}

interface Question {
  id: string
  text: string
  isFavorite: boolean
  vibe: string
}

const MYSTICAL_LOADING_PHRASES = [
  "Consulting the accessibility spirits... 👻",
  "Reading the WCAG tea leaves... 🍵",
  "Channeling the wisdom of the ancients... 📜",
  "The cosmic energy is warming up... 🔥",
  "Summoning inclusive insights... ✨",
  "Decoding the cosmic keyboard shortcuts... ⌨️",
  "The oracle stirs from its slumber... 🌙",
]

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

const MYSTICAL_RESPONSES = [
  { text: "The spirits say... YES! ✨", type: "yes" },
  { text: "Absolutely, the path is clear! 🌟", type: "yes" },
  { text: "The oracle nods wisely... YES! 💫", type: "yes" },
  { text: "Signs point to YES! 🔮", type: "yes" },
  { text: "The cosmic forces agree! ⭐", type: "yes" },
  { text: "Hmm... the oracle says NO 🌙", type: "no" },
  { text: "The spirits shake their heads... 👻", type: "no" },
  { text: "Not this time, seeker... 🌒", type: "no" },
  { text: "The answer is unclear... ask again! 🎭", type: "maybe" },
  { text: "Perhaps... the future is unwritten 📜", type: "maybe" },
  { text: "The oracle is cryptic on this one... 🤔", type: "maybe" },
]

const getRandomResponse = () => {
  return MYSTICAL_RESPONSES[Math.floor(Math.random() * MYSTICAL_RESPONSES.length)]
}

const KEYBOARD_SHORTCUTS = [
  { key: '←', action: 'Previous question' },
  { key: '→', action: 'Next question' },
  { key: 'C', action: 'Copy current question' },
  { key: 'S', action: 'Save/unsave question' },
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
  const [questionCount, setQuestionCount] = useState(5)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loadingPhrase, setLoadingPhrase] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [quickAnswer, setQuickAnswer] = useState<{text: string, type: string} | null>(null)
  const [isShakingOrb, setIsShakingOrb] = useState(false)
  const [showQuickOracle, setShowQuickOracle] = useState(false)
  const [savedQuestions, setSavedQuestions] = useKV<Question[]>('oracle-saved-questions', [])
  const [soundEnabled, setSoundEnabled] = useKV<boolean>('oracle-sound-enabled', true)
  const [animationsEnabled, setAnimationsEnabled] = useKV<boolean>('oracle-animations-enabled', true)
  const [showShortcuts, setShowShortcuts] = useState(false)
  
  const shuffledTopicSuggestions = useMemo(() => shuffleArray(TOPIC_SUGGESTIONS), [])
  
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
    setQuestionCount(5)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setQuickAnswer(null)
    toast.success('🔄 Form reset!')
  }, [])

  const getRandomVibe = (): string => {
    return VIBE_TYPES[Math.floor(Math.random() * VIBE_TYPES.length)]
  }

  const exportSavedQuestions = () => {
    const saved = savedQuestions ?? []
    if (saved.length === 0) {
      toast.error('No saved questions to export!')
      return
    }
    
    const content = saved.map((q, i) => 
      `${i + 1}. ${q.text}\n   ${q.vibe}`
    ).join('\n\n')
    
    const header = `🔮 Oracle of Inclusion - Saved Questions\n${'='.repeat(45)}\n\n`
    const fullContent = header + content + `\n\n---\n"Nothing about us without us" ✊`
    
    const blob = new Blob([fullContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'oracle-questions.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('📥 Questions exported!')
  }

  const generateQuestions = useCallback(async () => {
    setIsGenerating(true)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setLoadingPhrase(getRandomLoadingPhrase())
    playSound(sounds.playMysticChime)

    const focusAreasLabels = FOCUS_AREAS.filter(a => focusAreas.includes(a.id) && a.id !== 'other').map(a => a.label)
    if (focusAreas.includes('other') && otherFocusArea.trim()) {
      focusAreasLabels.push(otherFocusArea.trim())
    }
    const focusAreasText = focusAreasLabels.length > 0 
      ? focusAreasLabels.join(', ')
      : 'accessibility and inclusion in technology'

    const vibeDistribution = questionCount === 1 
      ? 'any vibe of your choice'
      : VIBE_TYPES.map((vibe, idx) => {
          const count = Math.floor(questionCount / 4) + (idx < questionCount % 4 ? 1 : 0)
          return `${count} ${vibe.split(' ')[1]}`
        }).join(', ')

    const prompt = spark.llmPrompt`Generate ${questionCount} simple, clear questions for a casual fireside chat about accessibility, inclusion, disability, and tech.

Context:
- Topics: ${topics.length > 0 ? topics.join(', ') : 'accessibility, inclusion, disability in tech, universal design, assistive technology'}
- Guest's work area: ${focusAreasText}
- Experience: ${experience || 'not specified'}

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

Return a JSON object with a "questions" array containing exactly ${questionCount} objects, each with "text" (the question) and "vibe" (one of: "😜 Whimsical", "🤗 Warm", "🤔 Thoughtful", "🧘 Deep").`

    try {
      const result = await spark.llm(prompt, 'gpt-4o', true)
      const parsed = JSON.parse(result)
      const generatedQuestions: Question[] = shuffleArray(parsed.questions.map((q: { text: string; vibe: string }, i: number) => ({
        id: `q-${Date.now()}-${i}`,
        text: q.text,
        isFavorite: false,
        vibe: q.vibe || getRandomVibe()
      })))
      setQuestions(generatedQuestions)
      playSound(sounds.playSuccess)
      toast.success('🔮 The oracle has spoken!')
    } catch {
      toast.error('🌙 The oracle needs a moment... Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [focusAreas, otherFocusArea, questionCount, topics, experience, soundEnabled, sounds])

  const handleGenerateClick = () => {
    generateQuestions()
  }

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }, [currentQuestionIndex, questions.length])

  const prevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }, [currentQuestionIndex])

  const currentQuestion = questions[currentQuestionIndex]

  const copyQuestion = useCallback(async (question: Question) => {
    const textToCopy = `${question.text}\n\n${question.vibe}`
    await navigator.clipboard.writeText(textToCopy)
    setCopiedId(question.id)
    toast.success('📋 Copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const toggleFavorite = useCallback((question: Question) => {
    const updated = questions.map(q => 
      q.id === question.id ? { ...q, isFavorite: !q.isFavorite } : q
    )
    setQuestions(updated)
    
    if (!question.isFavorite) {
      setSavedQuestions(current => [...(current || []), { ...question, isFavorite: true }])
      toast.success('💖 Saved to favorites!')
    } else {
      setSavedQuestions(current => (current || []).filter(q => q.id !== question.id))
    }
  }, [questions, setSavedQuestions])

  const removeSavedQuestion = (id: string) => {
    setSavedQuestions(current => (current || []).filter(q => q.id !== id))
    toast.success('🗑️ Removed from favorites')
  }

  const shakeTheOrb = () => {
    setIsShakingOrb(true)
    setQuickAnswer(null)
    playSound(sounds.playShake)
    setTimeout(() => {
      setQuickAnswer(getRandomResponse())
      setIsShakingOrb(false)
      playSound(sounds.playReveal)
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
        case 's':
        case 'S':
          e.preventDefault()
          if (currentQuestion) {
            toggleFavorite(currentQuestion)
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
  }, [questions, currentQuestion, prevQuestion, nextQuestion, copyQuestion, toggleFavorite, generateQuestions, resetForm, isGenerating])

  const animationProps = animationsEnabled 
    ? { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } }
    : { initial: {}, animate: {}, transition: { duration: 0 } }

  const floatAnimation = animationsEnabled
    ? { y: [0, -8, 0] }
    : {}

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
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
          <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
            <button
              onClick={() => setShowQuickOracle(!showQuickOracle)}
              className="flex items-center gap-2 bg-card/80 px-4 py-2 rounded-full border border-border hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Toggle Quick Answer Oracle"
              aria-expanded={showQuickOracle}
            >
              <span className="text-2xl" aria-hidden="true">🎱</span>
              <span className="text-sm font-medium">Quick Oracle</span>
            </button>
            
            <div className="flex gap-4 flex-wrap">
              <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
                <DialogTrigger asChild>
                  <button
                    className="flex items-center gap-2 bg-card/80 px-4 py-2 rounded-full border border-border hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                    aria-label="View keyboard shortcuts"
                  >
                    <Keyboard size={20} className="text-primary" aria-hidden="true" />
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
              
              <div className="flex items-center gap-2 bg-card/80 px-4 py-2 rounded-full border border-border">
                <Sparkle size={20} className="text-primary" aria-hidden="true" />
                <Label htmlFor="animations-toggle" className="text-sm font-medium cursor-pointer">Animations</Label>
                <Switch 
                  id="animations-toggle"
                  checked={animationsEnabled ?? true}
                  onCheckedChange={setAnimationsEnabled}
                  aria-describedby="animations-desc"
                />
                <span id="animations-desc" className="sr-only">Toggle animations on or off</span>
              </div>
              <div className="flex items-center gap-2 bg-card/80 px-4 py-2 rounded-full border border-border">
                {soundEnabled ? <SpeakerHigh size={20} className="text-primary" aria-hidden="true" /> : <SpeakerSlash size={20} className="text-muted-foreground" aria-hidden="true" />}
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
          </div>

          <AnimatePresence>
            {showQuickOracle && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <Card className="p-6 bg-card border-2 border-border">
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-muted-foreground text-lg">Need a quick yes/no/maybe? Shake the 8-ball!</p>
                    <motion.button
                      onClick={shakeTheOrb}
                      disabled={isShakingOrb}
                      className="w-20 h-20 rounded-full crystal-ball mystic-glow flex items-center justify-center text-4xl cursor-pointer hover:scale-110 transition-transform disabled:cursor-wait focus:outline-none focus:ring-4 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                      animate={isShakingOrb && animationsEnabled ? { 
                        x: [0, -10, 10, -10, 10, 0],
                        rotate: [0, -5, 5, -5, 5, 0]
                      } : {}}
                      transition={{ duration: 0.5, repeat: isShakingOrb ? Infinity : 0 }}
                      aria-label="Shake the oracle orb for a yes/no answer"
                      aria-live="polite"
                    >
                      <span aria-hidden="true">🎱</span>
                    </motion.button>
                    
                    <AnimatePresence>
                      {quickAnswer && !isShakingOrb && (
                        <motion.div
                          initial={animationsEnabled ? { opacity: 0, scale: 0.8 } : {}}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={animationsEnabled ? { opacity: 0, scale: 0.8 } : {}}
                          className={`px-6 py-3 rounded-xl text-lg font-bold ${
                            quickAnswer.type === 'yes' ? 'bg-green-500/20 text-green-400 border-2 border-green-500/30' :
                            quickAnswer.type === 'no' ? 'bg-red-500/20 text-red-400 border-2 border-red-500/30' :
                            'bg-primary/20 text-primary border-2 border-primary/30'
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
          
          <motion.div 
            className="inline-block mb-4"
            animate={animationsEnabled ? floatAnimation : {}}
            transition={animationsEnabled ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : {}}
            aria-hidden="true"
          >
            <div className="w-24 h-24 rounded-full crystal-ball mystic-glow flex items-center justify-center">
              <span className="text-5xl">🔮</span>
            </div>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-3">
            The Oracle of Inclusion
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl">
            "Ask, and the wisdom shall be revealed..."
          </p>
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
                
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                  Consult the Oracle
                </h2>

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
                        <div 
                          key={area.id}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            focusAreas.includes(area.id) 
                              ? 'border-primary bg-primary/15' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => toggleFocusArea(area.id)}
                        >
                          <Checkbox 
                            id={`focus-${area.id}`}
                            checked={focusAreas.includes(area.id)}
                            onCheckedChange={() => toggleFocusArea(area.id)}
                            className="border-2"
                            aria-describedby={area.id === 'other' ? 'other-focus-hint' : undefined}
                          />
                          <Label 
                            htmlFor={`focus-${area.id}`} 
                            className="text-lg font-medium cursor-pointer flex-1"
                          >
                            {area.label}
                          </Label>
                        </div>
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
                      <Label htmlFor="question-count-slider" className="text-foreground mb-3 block text-lg font-semibold">
                        🔢 How Many Questions? <span className="text-accent font-bold text-xl">{questionCount}</span>
                      </Label>
                      <div className="px-2 py-4">
                        <Slider
                          id="question-count-slider"
                          value={[questionCount]}
                          onValueChange={(value) => setQuestionCount(value[0])}
                          min={3}
                          max={10}
                          step={1}
                          className="w-full [&_[data-radix-slider-track]]:bg-muted [&_[data-radix-slider-range]]:bg-accent [&_[data-radix-slider-thumb]]:bg-accent [&_[data-radix-slider-thumb]]:border-2 [&_[data-radix-slider-thumb]]:border-foreground"
                          aria-valuemin={3}
                          aria-valuemax={10}
                          aria-valuenow={questionCount}
                          aria-valuetext={`${questionCount} questions`}
                        />
                        <div className="flex justify-between mt-2 text-base text-foreground font-bold" aria-hidden="true">
                          <span>3</span>
                          <span>10</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="experience" className="text-foreground mb-3 block text-lg font-semibold">
                        ⏳ Years of Experience
                      </Label>
                      <Select value={experience} onValueChange={setExperience}>
                        <SelectTrigger id="experience" className="bg-input border-2 border-border text-foreground text-lg py-6">
                          <SelectValue placeholder="Select level..." />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-2 border-border">
                          <SelectItem value="0-2" className="text-lg py-3">🌱 Beginner (0-2 years)</SelectItem>
                          <SelectItem value="3-5" className="text-lg py-3">🌿 Growing (3-5 years)</SelectItem>
                          <SelectItem value="6-10" className="text-lg py-3">🌳 Experienced (6-10 years)</SelectItem>
                          <SelectItem value="11-15" className="text-lg py-3">🏆 Expert (11-15 years)</SelectItem>
                          <SelectItem value="15+" className="text-lg py-3">⭐ Veteran (15+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3">
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
                          <ArrowClockwise size={28} />
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
                
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                  Your Question
                </h2>

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

                      <div className="flex flex-wrap gap-3 justify-center pt-2" role="group" aria-label="Question actions">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => copyQuestion(currentQuestion)}
                          className="text-lg py-6 px-6 border-2 focus:ring-4 focus:ring-ring focus:ring-offset-2"
                          aria-label={copiedId === currentQuestion.id ? 'Copied to clipboard' : 'Copy question to clipboard'}
                        >
                          {copiedId === currentQuestion.id ? (
                            <Check size={22} className="text-green-500 mr-2" aria-hidden="true" />
                          ) : (
                            <Copy size={22} className="mr-2" aria-hidden="true" />
                          )}
                          {copiedId === currentQuestion.id ? 'Copied!' : 'Copy'}
                          <kbd className="ml-2 px-1.5 py-0.5 bg-muted rounded text-sm font-mono hidden sm:inline" aria-hidden="true">C</kbd>
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => toggleFavorite(currentQuestion)}
                          className="text-lg py-6 px-6 border-2 focus:ring-4 focus:ring-ring focus:ring-offset-2"
                          aria-label={currentQuestion.isFavorite ? 'Remove from saved questions' : 'Save question to favorites'}
                          aria-pressed={currentQuestion.isFavorite}
                        >
                          <Heart 
                            size={22} 
                            weight={currentQuestion.isFavorite ? 'fill' : 'regular'}
                            className={currentQuestion.isFavorite ? 'text-pink-500 mr-2' : 'mr-2'}
                            aria-hidden="true"
                          />
                          {currentQuestion.isFavorite ? 'Saved!' : 'Save'}
                          <kbd className="ml-2 px-1.5 py-0.5 bg-muted rounded text-sm font-mono hidden sm:inline" aria-hidden="true">S</kbd>
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {(savedQuestions ?? []).length > 0 && (
                <Card className="p-6 md:p-8 bg-card border-2 border-border relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-accent to-pink-500" aria-hidden="true" />
                  
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                      <span className="text-3xl" aria-hidden="true">💖</span>
                      Saved Questions ({(savedQuestions ?? []).length})
                    </h2>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={exportSavedQuestions}
                      className="text-lg py-5 px-6 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-4 focus:ring-ring focus:ring-offset-2"
                    >
                      <Export size={22} className="mr-2" aria-hidden="true" />
                      Export
                    </Button>
                  </div>
                  <div className="space-y-3" role="list" aria-label="Saved questions">
                    {(savedQuestions ?? []).map((question) => (
                      <div
                        key={question.id}
                        className="flex items-start gap-4 p-5 rounded-xl bg-muted/40 border-2 border-border group"
                        role="listitem"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-sm font-bold text-primary bg-primary/20 px-3 py-1 rounded-full">
                              {question.vibe || '🎯 Mixed'}
                            </span>
                          </div>
                          <p className="text-foreground text-lg leading-relaxed font-medium">{question.text}</p>
                        </div>
                        <button
                          onClick={() => removeSavedQuestion(question.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-ring rounded-lg"
                          aria-label={`Remove saved question: ${question.text.substring(0, 30)}...`}
                        >
                          <X size={24} aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card className="p-6 bg-card border-2 border-border">
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={generateQuestions}
                    disabled={isGenerating}
                    className="text-lg py-6 px-8 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground focus:ring-4 focus:ring-ring focus:ring-offset-2"
                    aria-label="Shuffle all questions and generate new ones"
                  >
                    <ArrowClockwise size={22} className="mr-2" aria-hidden="true" />
                    🎲 Shuffle All
                    <kbd className="ml-2 px-1.5 py-0.5 bg-muted rounded text-sm font-mono hidden sm:inline" aria-hidden="true">R</kbd>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={resetForm}
                    className="text-lg py-6 px-8 border-2 border-muted-foreground text-muted-foreground hover:bg-muted hover:text-foreground focus:ring-4 focus:ring-ring focus:ring-offset-2"
                    aria-label="Start over and reset the form"
                  >
                    <ArrowCounterClockwise size={22} className="mr-2" aria-hidden="true" />
                    Start Over
                    <kbd className="ml-2 px-1.5 py-0.5 bg-muted rounded text-sm font-mono hidden sm:inline" aria-hidden="true">Esc</kbd>
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </main>

        <motion.footer 
          className="text-center mt-8 text-muted-foreground text-lg space-y-3"
          initial={animationsEnabled ? { opacity: 0 } : {}}
          animate={{ opacity: 1 }}
          transition={animationsEnabled ? { delay: 0.8 } : { duration: 0 }}
          role="contentinfo"
        >
          <p className="font-medium">"Nothing about us without us" — Disability Rights Movement</p>
          <p className="text-sm text-muted-foreground/70 border-t border-border/50 pt-3 mt-3">
            ⚗️ This is an experiment. Questions are AI-generated and may not be perfect.
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
