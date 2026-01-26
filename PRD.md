# The Oracle of Inclusion

A mystical Zoltar/Magic 8-Ball themed question generator for fireside chats focused on accessibility, inclusion, disability, and technology.

**Experience Qualities**:
1. **Mystical** - Evokes the wonder of a carnival fortune teller with retro charm and magical atmosphere
2. **Empowering** - Centers disability community perspectives and celebrates accessibility champions
3. **Thoughtful** - Generates meaningful questions that spark deep, authentic conversations

**Complexity Level**: Light Application (multiple features with basic state)
- Form inputs for customization, LLM-powered question generation, save/favorite functionality with persistence

## Essential Features

### Question Generation
- **Functionality**: Generates 8 thoughtful fireside chat questions using AI based on user inputs
- **Purpose**: Creates meaningful conversation starters focused on accessibility and inclusion
- **Trigger**: User clicks "Reveal the Questions" button
- **Progression**: Fill form → Click generate → Loading animation → Questions appear with staggered animation
- **Success criteria**: Questions are relevant to topics selected and appropriately toned

### Topic Selection
- **Functionality**: Add/remove topics via input or quick-add suggestions
- **Purpose**: Customize question themes around accessibility, disability, and tech
- **Trigger**: Type + Enter or click suggestion chips
- **Progression**: Type topic → Add → Badge appears → Can remove with X
- **Success criteria**: Topics appear as removable badges, suggestions update dynamically

### Copy & Save Questions
- **Functionality**: Copy individual questions to clipboard or save to persistent favorites
- **Purpose**: Allow users to collect and reuse the best questions
- **Trigger**: Click Copy or Treasure buttons on each question
- **Progression**: Click → Toast confirmation → Visual feedback (checkmark or filled heart)
- **Success criteria**: Clipboard contains question text, saved questions persist across sessions

## Edge Case Handling
- **Empty state**: Crystal ball animation with mystical prompt to consult the oracle
- **Generation failure**: Toast error with themed message ("The oracle needs a moment...")
- **No saved questions**: Treasured Wisdom section hidden until first save

## Design Direction
Retro carnival fortune teller aesthetic meets accessibility advocacy. Deep purple cosmic background with golden amber and magenta accents. Mystical but not intimidating - welcoming and whimsical.

## Color Selection
- **Primary Color**: `oklch(0.75 0.18 55)` - Warm amber gold representing wisdom and enlightenment
- **Secondary Color**: `oklch(0.45 0.12 320)` - Deep magenta purple for mystical depth
- **Accent Color**: `oklch(0.65 0.20 320)` - Vibrant magenta for highlights and interactive elements
- **Background**: `oklch(0.12 0.02 280)` - Deep cosmic purple/black
- **Foreground/Background Pairings**:
  - Background (Deep Purple): Cream text `oklch(0.95 0.02 60)` - Ratio 8.5:1 ✓
  - Card (Purple): Cream text `oklch(0.95 0.02 60)` - Ratio 7.2:1 ✓
  - Primary (Amber): Dark text `oklch(0.12 0.02 280)` - Ratio 6.8:1 ✓

## Font Selection
Elegant serif for body text with geometric sans for headings - balancing mystical gravitas with modern accessibility.

- **Typographic Hierarchy**:
  - H1 (App Title): Space Grotesk Bold/40px-48px/tight tracking
  - H2 (Section Titles): Space Grotesk SemiBold/20px
  - Body: Crimson Pro Regular/17px/relaxed line-height
  - Labels: Crimson Pro Medium/16px
  - Small: Crimson Pro Regular/12-14px

## Animations
Purposeful animations that enhance the mystical theme without overwhelming. Floating crystal ball suggests magical properties, shimmer on stars adds ambient life, staggered question reveals create anticipation.

## Component Selection
- **Components**: Card (main containers with gradient top borders), Button (primary with gradient), Input, Textarea, Select, Badge (for topics), Slider (tone control), Toast (sonner)
- **Customizations**: Crystal ball effect (radial gradient), stars pattern background, mystic-glow box-shadow, gradient borders
- **States**: Buttons have hover opacity transitions, questions have hover border/background changes, copy shows checkmark briefly
- **Icon Selection**: Eye (oracle symbol), Star (mystical accents), Sparkle (magic), Heart (favorites), Copy, Plus, X
- **Spacing**: Cards with p-6, form elements with space-y-6, question items with space-y-3
- **Mobile**: Single column layout, full-width buttons, responsive text sizes (text-3xl → text-5xl)
