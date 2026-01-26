import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkle, Copy, Heart, ArrowClockwise, Check, Plus, X, Star, Eye } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
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
  wisdom: string
  isFavorite: boolean
}

const WISDOM_QUOTES = [
  "The path to inclusion begins with a single accessible step.",
  "What is designed for one, often benefits all.",
  "True innovation removes barriers, not people.",
  "The curb cut of today becomes the ramp of tomorrow.",
  "Listen first to those with lived experience.",
  "Accessibility is not a feature—it is a foundation.",
  "The most powerful technology is that which empowers.",
  "Design for the margins, and the center will follow.",
  "Every barrier removed opens a thousand doors.",
  "Nothing about us without us—this is the oracle's first truth.",
  "The keyboard speaks louder than the mouse.",
  "Alt text is poetry for the unseen.",
  "Patience with technology teaches patience with oneself.",
  "The screen reader sees what the eye cannot.",
  "Contrast is not just visual—it is essential.",
  "A focus ring is a beacon of navigation.",
  "Captions carry voices across silent waters.",
  "The best designs anticipate, not accommodate.",
  "Speed is privilege; patience is power.",
  "Disability is not inability—it is diversity.",
  "The semantic web speaks truth to all machines.",
  "What slows one may stop another—design for all.",
  "Empathy without action is merely sympathy.",
  "The strongest bridges are built with ARIA.",
  "Neurodiversity is humanity's creative edge."
]

const getRandomWisdom = (): string => {
  return WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)]
}

const TOPIC_SUGGESTIONS = [
  'Accessible Design',
  'Assistive Technology',
  'Neurodiversity',
  'Screen Readers',
  'Inclusive Hiring',
  'WCAG Standards',
  'Disability Advocacy',
  'Universal Design',
  'Mental Health',
  'Workplace Accommodations'
]

const FOCUS_AREAS = [
  'Engineering & Development',
  'Product Design',
  'Content & UX Writing',
  'Research & Strategy',
  'Leadership & Management',
  'Advocacy & Policy',
  'Education & Training',
  'Consulting'
]

export default function App() {
  const [topics, setTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')
  const [focusArea, setFocusArea] = useState('')
  const [experience, setExperience] = useState('')
  const [tone, setTone] = useState([50])
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
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

  const getToneLabel = (value: number) => {
    if (value < 25) return 'Whimsical & Light'
    if (value < 45) return 'Warm & Curious'
    if (value < 55) return 'Balanced'
    if (value < 75) return 'Thoughtful'
    return 'Deep & Profound'
  }

  const generateQuestions = async () => {
    setIsGenerating(true)
    setQuestions([])

    const toneDescription = tone[0] < 30 ? 'whimsical, playful, and lighthearted while still meaningful' : 
                           tone[0] < 50 ? 'warm, curious, and approachable with gentle humor' :
                           tone[0] < 70 ? 'balanced between casual conversation and thoughtful exploration' :
                           'deep, reflective, and philosophically engaging'

    const prompt = spark.llmPrompt`Generate 8 engaging questions for an informal fireside chat focused on accessibility, inclusion, disability, and technology.

Context:
- Topics to explore: ${topics.length > 0 ? topics.join(', ') : 'accessibility, inclusion, disability in tech, universal design, assistive technology'}
- Guest's focus area: ${focusArea || 'accessibility and inclusion in technology'}
- Experience level: ${experience || 'not specified'}
- Tone should be: ${toneDescription}
- Additional context: ${additionalNotes || 'none'}

Requirements:
- Questions should feel like a mystical oracle revealing wisdom - conversational but profound
- Focus on accessibility, inclusion, disability rights, universal design, assistive technology, neurodiversity, or related themes
- Mix personal journey questions with broader impact questions
- Include questions about challenges, victories, and future visions
- Avoid yes/no questions - aim for open-ended discussion starters
- Include at least one unexpected or creative question that reveals deeper truths
- Questions should empower and center the disability community perspective
- Keep questions concise but thought-provoking

Return a JSON object with a "questions" array containing exactly 8 question strings.`

    try {
      const result = await spark.llm(prompt, 'gpt-4o', true)
      const parsed = JSON.parse(result)
      const generatedQuestions: Question[] = parsed.questions.map((q: string, i: number) => ({
        id: `q-${Date.now()}-${i}`,
        text: q,
        wisdom: getRandomWisdom(),
        isFavorite: false
      }))
      setQuestions(generatedQuestions)
    } catch {
      toast.error('The oracle needs a moment... Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyQuestion = async (question: Question) => {
    const textToCopy = `${question.text}\n\n✨ "${question.wisdom}"`
    await navigator.clipboard.writeText(textToCopy)
    setCopiedId(question.id)
    toast.success('Wisdom copied to your scroll!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleFavorite = (question: Question) => {
    const updated = questions.map(q => 
      q.id === question.id ? { ...q, isFavorite: !q.isFavorite } : q
    )
    setQuestions(updated)
    
    if (!question.isFavorite) {
      setSavedQuestions(current => [...(current || []), { ...question, isFavorite: true }])
      toast.success('Treasured in your collection!')
    } else {
      setSavedQuestions(current => (current || []).filter(q => q.id !== question.id))
    }
  }

  const removeSavedQuestion = (id: string) => {
    setSavedQuestions(current => (current || []).filter(q => q.id !== id))
    toast.success('Released from your collection')
  }

  return (
    <div className="min-h-screen bg-background stars-pattern p-4 md:p-8">
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
            <div className="w-20 h-20 mx-auto rounded-full crystal-ball mystic-glow flex items-center justify-center">
              <Eye size={40} weight="duotone" className="text-primary" />
            </div>
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-2">
            The Oracle of Inclusion
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl italic">
            "Ask, and the wisdom of accessibility shall be revealed..."
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Star size={16} weight="fill" className="text-primary shimmer-animation" />
            <span className="text-sm text-muted-foreground tracking-widest uppercase">
              Disability • Tech • Design • Life
            </span>
            <Star size={16} weight="fill" className="text-accent shimmer-animation" />
          </div>
        </motion.header>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 bg-card border-2 border-border mystic-glow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Sparkle size={24} weight="fill" className="text-primary" />
                Consult the Oracle
              </h2>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="topics" className="text-foreground mb-2 block text-base">
                    Realms to Explore
                  </Label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      id="topics"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter a topic of inquiry..."
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                    <Button 
                      variant="secondary" 
                      size="icon"
                      onClick={() => addTopic(topicInput)}
                      disabled={!topicInput.trim()}
                      aria-label="Add topic"
                    >
                      <Plus size={18} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {topics.map(topic => (
                      <Badge 
                        key={topic} 
                        variant="secondary"
                        className="pl-3 pr-1 py-1.5 flex items-center gap-1 bg-secondary/80 text-secondary-foreground border border-accent/30"
                      >
                        {topic}
                        <button 
                          onClick={() => removeTopic(topic)}
                          className="ml-1 hover:bg-muted rounded-full p-0.5"
                          aria-label={`Remove ${topic}`}
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TOPIC_SUGGESTIONS.filter(s => !topics.includes(s)).slice(0, 5).map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => addTopic(suggestion)}
                        className="text-xs px-2.5 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all hover:bg-primary/5"
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="focus-area" className="text-foreground mb-2 block text-base">
                    Seeker's Domain
                  </Label>
                  <Select value={focusArea} onValueChange={setFocusArea}>
                    <SelectTrigger id="focus-area" className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select their area of focus..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {FOCUS_AREAS.map(area => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience" className="text-foreground mb-2 block text-base">
                    Years of Journey
                  </Label>
                  <Select value={experience} onValueChange={setExperience}>
                    <SelectTrigger id="experience" className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select experience level..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="0-2">Apprentice (0-2 years)</SelectItem>
                      <SelectItem value="3-5">Practitioner (3-5 years)</SelectItem>
                      <SelectItem value="6-10">Adept (6-10 years)</SelectItem>
                      <SelectItem value="11-15">Master (11-15 years)</SelectItem>
                      <SelectItem value="15+">Sage (15+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-foreground mb-3 block text-base">
                    Oracle's Voice: <span className="text-primary font-medium">{getToneLabel(tone[0])}</span>
                  </Label>
                  <div className="px-1">
                    <Slider
                      value={tone}
                      onValueChange={setTone}
                      max={100}
                      step={1}
                      className="w-full"
                      aria-label="Question tone"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>✨ Whimsical</span>
                      <span>🔮 Profound</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-foreground mb-2 block text-base">
                    Additional Whispers (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any specific mysteries to uncover, achievements to celebrate, or paths to avoid..."
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
                  />
                </div>

                <Button 
                  onClick={generateQuestions}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-semibold py-6 text-lg tracking-wide"
                >
                  {isGenerating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    >
                      <ArrowClockwise size={22} />
                    </motion.div>
                  ) : (
                    <>
                      <Eye size={22} weight="duotone" className="mr-2" />
                      Reveal the Questions
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
            <Card className="p-6 bg-card border-2 border-border relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-accent" />
              
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Star size={24} weight="fill" className="text-accent" />
                Revealed Wisdom
              </h2>

              {questions.length === 0 && !isGenerating && (
                <div className="text-center py-12 text-muted-foreground">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Eye size={56} weight="duotone" className="mx-auto mb-4 text-muted-foreground/40" />
                  </motion.div>
                  <p className="italic text-lg">The crystal awaits your inquiry...</p>
                  <p className="text-sm mt-2">Share the seeker's details to receive wisdom</p>
                </div>
              )}

              {isGenerating && (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        '0 0 20px oklch(0.75 0.18 55 / 0.3)',
                        '0 0 40px oklch(0.65 0.20 320 / 0.5)',
                        '0 0 20px oklch(0.75 0.18 55 / 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 mx-auto rounded-full crystal-ball flex items-center justify-center"
                  >
                    <Eye size={48} weight="duotone" className="text-primary" />
                  </motion.div>
                  <p className="text-muted-foreground mt-6 italic text-lg">The oracle peers into the mists...</p>
                </div>
              )}

              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className="group p-4 rounded-lg bg-muted/40 border border-border hover:border-primary/50 transition-all hover:bg-muted/60"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-primary font-semibold text-sm mt-0.5">{index + 1}.</span>
                        <div className="flex-1">
                          <p className="text-foreground leading-relaxed text-[17px]">{question.text}</p>
                          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 border border-primary/20">
                            <Sparkle size={14} weight="fill" className="text-primary shrink-0" />
                            <p className="text-sm italic text-primary/90 leading-snug">"{question.wisdom}"</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-3 ml-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyQuestion(question)}
                          className="text-muted-foreground hover:text-foreground hover:bg-primary/10"
                        >
                          {copiedId === question.id ? (
                            <Check size={16} className="text-green-400" />
                          ) : (
                            <Copy size={16} />
                          )}
                          <span className="ml-1.5 text-xs">Copy</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(question)}
                          className="text-muted-foreground hover:text-foreground hover:bg-accent/10"
                        >
                          <Heart 
                            size={16} 
                            weight={question.isFavorite ? 'fill' : 'regular'}
                            className={question.isFavorite ? 'text-accent' : ''}
                          />
                          <span className="ml-1.5 text-xs">Treasure</span>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </Card>

            {(savedQuestions ?? []).length > 0 && (
              <Card className="p-6 bg-card border-2 border-border relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
                
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Heart size={24} weight="fill" className="text-accent" />
                  Treasured Wisdom ({(savedQuestions ?? []).length})
                </h2>
                <div className="space-y-2">
                  {(savedQuestions ?? []).map((question) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border group"
                    >
                      <div className="flex-1">
                        <p className="text-foreground text-sm leading-relaxed">{question.text}</p>
                        {question.wisdom && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <Sparkle size={12} weight="fill" className="text-primary/70 shrink-0" />
                            <p className="text-xs italic text-primary/70">"{question.wisdom}"</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeSavedQuestion(question.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Remove from treasured"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        </div>

        <motion.footer 
          className="text-center mt-12 text-muted-foreground text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="italic">"Nothing about us without us" — Disability Rights Movement</p>
        </motion.footer>
      </div>
    </div>
  )
}
