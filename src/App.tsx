import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fire, Sparkle, Copy, Heart, ArrowClockwise, Check, Plus, X } from '@phosphor-icons/react'
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
  isFavorite: boolean
}

const TOPIC_SUGGESTIONS = [
  'Career Journey',
  'Leadership',
  'Work-Life Balance',
  'Failures & Lessons',
  'Industry Trends',
  'Personal Growth',
  'Team Building',
  'Innovation',
  'Mentorship',
  'Future Vision'
]

export default function App() {
  const [topics, setTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')
  const [jobFocus, setJobFocus] = useState('')
  const [experience, setExperience] = useState('')
  const [tone, setTone] = useState([50])
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [savedQuestions, setSavedQuestions] = useKV<Question[]>('fireside-saved-questions', [])

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
    if (value < 25) return 'Very Playful'
    if (value < 45) return 'Light & Fun'
    if (value < 55) return 'Balanced'
    if (value < 75) return 'Professional'
    return 'Very Serious'
  }

  const generateQuestions = async () => {
    setIsGenerating(true)
    setQuestions([])

    const toneDescription = tone[0] < 30 ? 'humorous and playful' : 
                           tone[0] < 50 ? 'light-hearted but insightful' :
                           tone[0] < 70 ? 'balanced between casual and professional' :
                           'thoughtful and serious'

    const prompt = spark.llmPrompt`Generate 8 engaging questions for an informal fireside chat interview.

Context:
- Topics to cover: ${topics.length > 0 ? topics.join(', ') : 'general career and life experiences'}
- Guest's job focus/role: ${jobFocus || 'not specified'}
- Years of experience: ${experience || 'not specified'}
- Tone should be: ${toneDescription}
- Additional context: ${additionalNotes || 'none'}

Requirements:
- Questions should feel conversational, not like a formal interview
- Mix of reflective, forward-looking, and personal questions
- Avoid yes/no questions - aim for open-ended discussion starters
- Include at least one unexpected or creative question
- Keep questions concise but thought-provoking

Return a JSON object with a "questions" array containing exactly 8 question strings.`

    try {
      const result = await spark.llm(prompt, 'gpt-4o', true)
      const parsed = JSON.parse(result)
      const generatedQuestions: Question[] = parsed.questions.map((q: string, i: number) => ({
        id: `q-${Date.now()}-${i}`,
        text: q,
        isFavorite: false
      }))
      setQuestions(generatedQuestions)
    } catch {
      toast.error('Failed to generate questions. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyQuestion = async (question: Question) => {
    await navigator.clipboard.writeText(question.text)
    setCopiedId(question.id)
    toast.success('Question copied!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleFavorite = (question: Question) => {
    const updated = questions.map(q => 
      q.id === question.id ? { ...q, isFavorite: !q.isFavorite } : q
    )
    setQuestions(updated)
    
    if (!question.isFavorite) {
      setSavedQuestions(current => [...(current || []), { ...question, isFavorite: true }])
      toast.success('Saved to favorites!')
    } else {
      setSavedQuestions(current => (current || []).filter(q => q.id !== question.id))
    }
  }

  const removeSavedQuestion = (id: string) => {
    setSavedQuestions(current => (current || []).filter(q => q.id !== id))
    toast.success('Removed from favorites')
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Toaster position="top-center" theme="dark" />
      
      <div className="max-w-5xl mx-auto">
        <motion.header 
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Fire size={40} weight="fill" className="text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Fireside Chat Questions
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Generate thoughtful questions for your next informal interview
          </p>
        </motion.header>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 bg-card border-border noise-overlay fire-glow">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Sparkle size={24} weight="fill" className="text-accent" />
                Guest Details
              </h2>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="topics" className="text-foreground mb-2 block">
                    Topics to Explore
                  </Label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      id="topics"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Add a topic..."
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                    <Button 
                      variant="secondary" 
                      size="icon"
                      onClick={() => addTopic(topicInput)}
                      disabled={!topicInput.trim()}
                    >
                      <Plus size={18} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {topics.map(topic => (
                      <Badge 
                        key={topic} 
                        variant="secondary"
                        className="pl-3 pr-1 py-1 flex items-center gap-1 bg-secondary text-secondary-foreground"
                      >
                        {topic}
                        <button 
                          onClick={() => removeTopic(topic)}
                          className="ml-1 hover:bg-muted rounded-full p-0.5"
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
                        className="text-xs px-2 py-1 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="job-focus" className="text-foreground mb-2 block">
                    Job Focus / Role
                  </Label>
                  <Input
                    id="job-focus"
                    value={jobFocus}
                    onChange={(e) => setJobFocus(e.target.value)}
                    placeholder="e.g., Engineering Manager, Startup Founder..."
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="experience" className="text-foreground mb-2 block">
                    Years of Experience
                  </Label>
                  <Select value={experience} onValueChange={setExperience}>
                    <SelectTrigger id="experience" className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="0-2">Early Career (0-2 years)</SelectItem>
                      <SelectItem value="3-5">Rising (3-5 years)</SelectItem>
                      <SelectItem value="6-10">Experienced (6-10 years)</SelectItem>
                      <SelectItem value="11-15">Senior (11-15 years)</SelectItem>
                      <SelectItem value="15+">Veteran (15+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-foreground mb-3 block">
                    Tone: <span className="text-primary font-medium">{getToneLabel(tone[0])}</span>
                  </Label>
                  <div className="px-1">
                    <Slider
                      value={tone}
                      onValueChange={setTone}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>😄 Playful</span>
                      <span>🎯 Serious</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-foreground mb-2 block">
                    Additional Context (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any specific angles, recent achievements, or topics to avoid..."
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
                  />
                </div>

                <Button 
                  onClick={generateQuestions}
                  disabled={isGenerating}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 text-lg"
                >
                  {isGenerating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <ArrowClockwise size={22} />
                    </motion.div>
                  ) : (
                    <>
                      <Sparkle size={22} weight="fill" className="mr-2" />
                      Generate Questions
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
            <Card className="p-6 bg-card border-border noise-overlay">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Fire size={24} weight="fill" className="text-primary" />
                Generated Questions
              </h2>

              {questions.length === 0 && !isGenerating && (
                <div className="text-center py-12 text-muted-foreground">
                  <Fire size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Fill in the details and generate questions</p>
                  <p className="text-sm mt-1">Your questions will appear here</p>
                </div>
              )}

              {isGenerating && (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Fire size={48} weight="fill" className="mx-auto text-primary" />
                  </motion.div>
                  <p className="text-muted-foreground mt-4">Crafting thoughtful questions...</p>
                </div>
              )}

              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-colors"
                    >
                      <p className="text-foreground pr-16 leading-relaxed">{question.text}</p>
                      <div className="flex gap-1 mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyQuestion(question)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {copiedId === question.id ? (
                            <Check size={16} className="text-green-500" />
                          ) : (
                            <Copy size={16} />
                          )}
                          <span className="ml-1.5 text-xs">Copy</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(question)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Heart 
                            size={16} 
                            weight={question.isFavorite ? 'fill' : 'regular'}
                            className={question.isFavorite ? 'text-red-400' : ''}
                          />
                          <span className="ml-1.5 text-xs">Save</span>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </Card>

            {(savedQuestions ?? []).length > 0 && (
              <Card className="p-6 bg-card border-border noise-overlay">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Heart size={24} weight="fill" className="text-red-400" />
                  Saved Questions ({(savedQuestions ?? []).length})
                </h2>
                <div className="space-y-2">
                  {(savedQuestions ?? []).map((question) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                    >
                      <p className="text-foreground text-sm flex-1">{question.text}</p>
                      <button
                        onClick={() => removeSavedQuestion(question.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
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
      </div>
    </div>
  )
}
