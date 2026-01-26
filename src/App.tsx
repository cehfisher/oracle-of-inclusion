import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Heart, ArrowClockwise, Check, Plus, X, Shuffle, Export } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useKV } from '@github/spark/hooks'
import { toast, Toaster } from 'sonner'

declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: unknown[]) => string
  llm: (prompt: string, model?: string, jsonMode?: boolean) => Promise<string>
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

const VIBE_LABELS = ['😜 Whimsical', '🤗 Warm', '🤔 Thoughtful', '🧘 Deep']

const FOCUS_AREAS = [
  '💻 Engineering & Dev',
  '🎨 Design & UX',
  '🧩 Accessibility',
  '👔 Leadership',
  '📖 Education',
  '📣 Advocacy & Community',
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

export default function App() {
  const [topics, setTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')
  const [focusArea, setFocusArea] = useState('')
  const [experience, setExperience] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loadingPhrase, setLoadingPhrase] = useState('')
  const [quickAnswer, setQuickAnswer] = useState<{text: string, type: string} | null>(null)
  const [isShakingOrb, setIsShakingOrb] = useState(false)
  const [savedQuestions, setSavedQuestions] = useKV<Question[]>('oracle-saved-questions', [])

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

  const getRandomVibe = (): string => {
    return VIBE_LABELS[Math.floor(Math.random() * VIBE_LABELS.length)]
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

  const generateQuestions = async () => {
    setIsGenerating(true)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setLoadingPhrase(getRandomLoadingPhrase())

    const prompt = spark.llmPrompt`Generate 8 simple, clear questions for a casual fireside chat about accessibility, inclusion, disability, and tech.

Context:
- Topics: ${topics.length > 0 ? topics.join(', ') : 'accessibility, inclusion, disability in tech, universal design, assistive technology'}
- Guest's work area: ${focusArea || 'accessibility and inclusion in technology'}
- Experience: ${experience || 'not specified'}
- Extra notes: ${additionalNotes || 'none'}

Rules:
- Write at a 9th grade reading level or lower
- Use short sentences (under 20 words each)
- Use simple, everyday words - no jargon
- Make questions easy to understand on first read
- Ask open questions (not yes/no)
- Mix personal story questions with big picture questions
- Center the disability community voice
- Keep each question to 1-2 sentences max
- IMPORTANT: Generate a MIX of vibes - 2 whimsical/playful, 2 warm/curious, 2 thoughtful, 2 deep/reflective

Return a JSON object with a "questions" array containing exactly 8 objects, each with "text" (the question) and "vibe" (one of: "😜 Whimsical", "🤗 Warm", "🤔 Thoughtful", "🧘 Deep").`

    try {
      const result = await spark.llm(prompt, 'gpt-4o', true)
      const parsed = JSON.parse(result)
      const generatedQuestions: Question[] = parsed.questions.map((q: { text: string; vibe: string }, i: number) => ({
        id: `q-${Date.now()}-${i}`,
        text: q.text,
        isFavorite: false,
        vibe: q.vibe || getRandomVibe()
      }))
      setQuestions(generatedQuestions)
      toast.success('🔮 The oracle has spoken!')
    } catch {
      toast.error('🌙 The oracle needs a moment... Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateCurrentQuestion = async () => {
    if (questions.length === 0) return
    
    setIsGenerating(true)

    const prompt = spark.llmPrompt`Generate 1 new simple question for a fireside chat about accessibility and inclusion.

Context:
- Topics: ${topics.length > 0 ? topics.join(', ') : 'accessibility, inclusion, disability in tech'}
- Guest's work area: ${focusArea || 'accessibility and inclusion'}

Rules:
- Write at a 9th grade reading level
- Under 20 words
- Open-ended question
- Simple everyday words
- Pick a random vibe: whimsical, warm, thoughtful, or deep

Return a JSON object with "question" (string) and "vibe" (one of: "😜 Whimsical", "🤗 Warm", "🤔 Thoughtful", "🧘 Deep").`

    try {
      const result = await spark.llm(prompt, 'gpt-4o', true)
      const parsed = JSON.parse(result)
      const newQuestion: Question = {
        id: `q-${Date.now()}-regen`,
        text: parsed.question,
        isFavorite: false,
        vibe: parsed.vibe || getRandomVibe()
      }
      
      const updatedQuestions = [...questions]
      updatedQuestions[currentQuestionIndex] = newQuestion
      setQuestions(updatedQuestions)
      toast.success('✨ Fresh wisdom revealed!')
    } catch {
      toast.error('🌙 Try again in a moment...')
    } finally {
      setIsGenerating(false)
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]

  const copyQuestion = async (question: Question) => {
    const textToCopy = `${question.text}\n\n${question.vibe}`
    await navigator.clipboard.writeText(textToCopy)
    setCopiedId(question.id)
    toast.success('📋 Copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleFavorite = (question: Question) => {
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
  }

  const removeSavedQuestion = (id: string) => {
    setSavedQuestions(current => (current || []).filter(q => q.id !== id))
    toast.success('🗑️ Removed from favorites')
  }

  const shakeTheOrb = () => {
    setIsShakingOrb(true)
    setQuickAnswer(null)
    setTimeout(() => {
      setQuickAnswer(getRandomResponse())
      setIsShakingOrb(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Toaster position="top-center" theme="dark" />
      
      <div className="max-w-5xl mx-auto">
        <motion.header 
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-block mb-4"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-24 h-24 mx-auto rounded-full crystal-ball mystic-glow flex items-center justify-center">
              <span className="text-5xl">🔮</span>
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-3">
            The Oracle of Inclusion</h1>
          <p className="text-muted-foreground text-xl md:text-2xl">
            "Ask, and the wisdom shall be revealed..."
          </p>
          <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
            <span className="text-lg px-4 py-2 rounded-full bg-primary/20 text-primary font-medium">♿ Disability</span>
            <span className="text-lg px-4 py-2 rounded-full bg-accent/20 text-accent font-medium">💻 Tech</span>
            <span className="text-lg px-4 py-2 rounded-full bg-secondary/30 text-secondary-foreground font-medium">🎨 Design</span>
            <span className="text-lg px-4 py-2 rounded-full bg-primary/20 text-primary font-medium">🌈 Life</span>
          </div>
        </motion.header>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 md:p-8 bg-card border-2 border-border mystic-glow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" />
              
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <span className="text-3xl">🌙</span>
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
                    />
                    <Button 
                      variant="secondary" 
                      size="icon"
                      onClick={() => addTopic(topicInput)}
                      disabled={!topicInput.trim()}
                      aria-label="Add topic"
                      className="h-12 w-12"
                    >
                      <Plus size={24} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {topics.map(topic => (
                      <Badge 
                        key={topic} 
                        variant="secondary"
                        className="pl-4 pr-2 py-2 flex items-center gap-2 bg-primary/20 text-primary border-2 border-primary/30 text-base font-medium"
                      >
                        {topic}
                        <button 
                          onClick={() => removeTopic(topic)}
                          className="ml-1 hover:bg-primary/20 rounded-full p-1"
                          aria-label={`Remove ${topic}`}
                        >
                          <X size={16} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TOPIC_SUGGESTIONS.filter(s => !topics.includes(s)).slice(0, 8).map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => addTopic(suggestion)}
                        className="text-base px-4 py-2.5 rounded-full border-2 border-border text-muted-foreground hover:border-primary hover:text-primary transition-all hover:bg-primary/10 font-medium"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="focus-area" className="text-foreground mb-3 block text-lg font-semibold">
                    👤 Guest's Focus Area
                  </Label>
                  <Select value={focusArea} onValueChange={setFocusArea}>
                    <SelectTrigger id="focus-area" className="bg-input border-2 border-border text-foreground text-lg py-6">
                      <SelectValue placeholder="Select their work area..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-2 border-border max-h-[400px]">
                      {FOCUS_AREAS.map(area => (
                        <SelectItem key={area} value={area} className="text-lg py-3">{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience" className="text-foreground mb-3 block text-lg font-semibold">
                    ⏳ Years of Experience
                  </Label>
                  <Select value={experience} onValueChange={setExperience}>
                    <SelectTrigger id="experience" className="bg-input border-2 border-border text-foreground text-lg py-6">
                      <SelectValue placeholder="Select experience level..." />
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

                <div>
                  <Label htmlFor="notes" className="text-foreground mb-3 block text-lg font-semibold">
                    📝 Extra Notes (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any specific topics to cover or avoid..."
                    className="bg-input border-2 border-border text-foreground placeholder:text-muted-foreground min-h-[100px] text-lg"
                  />
                </div>

                <Button 
                  onClick={generateQuestions}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-bold py-7 text-xl tracking-wide"
                >
                  {isGenerating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    >
                      <ArrowClockwise size={28} />
                    </motion.div>
                  ) : (
                    <>
                      <span className="text-2xl mr-3">✨</span>
                      Reveal My Questions!
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="p-6 md:p-8 bg-card border-2 border-border relative overflow-hidden min-h-[400px]">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent via-primary to-accent" />
              
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <span className="text-3xl">✨</span>
                {questions.length > 0 ? 'Your Question' : 'The Oracle Awaits'}
              </h2>

              {questions.length === 0 && !isGenerating && (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="text-8xl mb-6"
                  >
                    🌌
                  </motion.div>
                  <p className="text-xl text-muted-foreground mb-4">
                    The spirits await your inquiry...
                  </p>
                  <p className="text-xl text-muted-foreground">
                    Fill in your details, then click <span className="text-primary font-bold">"Reveal My Questions!"</span> ✨
                  </p>
                </div>
              )}

              {isGenerating && (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-8xl mb-6"
                  >
                    ✨
                  </motion.div>
                  <motion.p 
                    className="text-xl text-primary font-medium"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {loadingPhrase}
                  </motion.p>
                </div>
              )}

              <AnimatePresence mode="wait">
                {currentQuestion && !isGenerating && (
                  <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
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
                      <p className="text-2xl md:text-3xl text-foreground leading-relaxed font-medium text-center">
                        "{currentQuestion.text}"
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => copyQuestion(currentQuestion)}
                        className="text-lg py-6 px-6 border-2"
                      >
                        {copiedId === currentQuestion.id ? (
                          <Check size={22} className="text-green-500 mr-2" />
                        ) : (
                          <Copy size={22} className="mr-2" />
                        )}
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => toggleFavorite(currentQuestion)}
                        className="text-lg py-6 px-6 border-2"
                      >
                        <Heart 
                          size={22} 
                          weight={currentQuestion.isFavorite ? 'fill' : 'regular'}
                          className={currentQuestion.isFavorite ? 'text-pink-500 mr-2' : 'mr-2'}
                        />
                        {currentQuestion.isFavorite ? 'Saved!' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={regenerateCurrentQuestion}
                        disabled={isGenerating}
                        className="text-lg py-6 px-6 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Shuffle size={22} className="mr-2" />
                        New Question
                      </Button>
                    </div>

                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={generateQuestions}
                        disabled={isGenerating}
                        className="text-lg py-6 px-8 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                      >
                        <ArrowClockwise size={22} className="mr-2" />
                        🎲 Shuffle All Questions
                      </Button>
                    </div>

                    <div className="flex gap-3 justify-center pt-4">
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={prevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="text-lg py-6 px-8"
                      >
                        ← Previous
                      </Button>
                      <Button
                        variant="default"
                        size="lg"
                        onClick={nextQuestion}
                        disabled={currentQuestionIndex === questions.length - 1}
                        className="text-lg py-6 px-8 bg-primary text-primary-foreground"
                      >
                        Next →
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {(savedQuestions ?? []).length > 0 && (
              <Card className="p-6 md:p-8 bg-card border-2 border-border relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-accent to-pink-500" />
                
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                    <span className="text-3xl">💖</span>
                    Saved Questions ({(savedQuestions ?? []).length})
                  </h2>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={exportSavedQuestions}
                    className="text-lg py-5 px-6 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Export size={22} className="mr-2" />
                    Export
                  </Button>
                </div>
                <div className="space-y-3">
                  {(savedQuestions ?? []).map((question) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-4 p-5 rounded-xl bg-muted/40 border-2 border-border group"
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
                        className="text-muted-foreground hover:text-destructive transition-colors p-2"
                        aria-label="Remove from saved"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        </div>

        <motion.div 
          className="mt-12 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 bg-card/50 border-2 border-border max-w-md mx-auto text-center">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
              <span>🎱</span> Quick Oracle <span className="text-sm font-normal text-muted-foreground">(just for fun!)</span>
            </h3>
            <p className="text-muted-foreground mb-4 text-base">Think of a yes/no question, then shake the orb!</p>
            
            <motion.button
              onClick={shakeTheOrb}
              disabled={isShakingOrb}
              className="w-20 h-20 mx-auto rounded-full crystal-ball mystic-glow flex items-center justify-center text-4xl cursor-pointer hover:scale-110 transition-transform disabled:cursor-wait"
              animate={isShakingOrb ? { 
                x: [0, -10, 10, -10, 10, 0],
                rotate: [0, -5, 5, -5, 5, 0]
              } : {}}
              transition={{ duration: 0.5, repeat: isShakingOrb ? Infinity : 0 }}
              aria-label="Shake the oracle orb for a yes/no answer"
            >
              🎱
            </motion.button>
            
            <AnimatePresence>
              {quickAnswer && !isShakingOrb && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`mt-4 p-3 rounded-lg text-lg font-bold ${
                    quickAnswer.type === 'yes' ? 'bg-green-500/20 text-green-400' :
                    quickAnswer.type === 'no' ? 'bg-red-500/20 text-red-400' :
                    'bg-primary/20 text-primary'
                  }`}
                >
                  {quickAnswer.text}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        <motion.footer 
          className="text-center mt-8 text-muted-foreground text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="font-medium">"Nothing about us without us" ✊ — Disability Rights Movement</p>
        </motion.footer>
      </div>
    </div>
  )
}
