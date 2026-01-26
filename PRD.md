# Planning Guide

A question generator tool for informal fireside chats that creates engaging, personalized questions based on guest parameters like topics, job focus, experience level, and tone preferences.

**Experience Qualities**:
1. **Warm & Inviting** - The interface should feel like sitting by a cozy fire, encouraging relaxed conversation preparation
2. **Playful Yet Professional** - Balance between fun customization and producing quality interview questions
3. **Effortless** - Quick parameter selection with instant, thoughtful question generation

**Complexity Level**: Light Application (multiple features with basic state) - The app has multiple input fields for customization and generates dynamic content via LLM, but maintains a single-view focused interface.

## Essential Features

### 1. Guest Parameter Form
- **Functionality**: Input fields for topics, job focus, years of experience, tone (funny/serious), and additional custom parameters
- **Purpose**: Capture context about the guest to generate relevant, personalized questions
- **Trigger**: User fills out form fields
- **Progression**: Select topics → Enter job focus → Set experience level → Choose tone → Add optional notes → Submit
- **Success criteria**: All core parameters captured with clear, intuitive controls

### 2. Question Generation
- **Functionality**: Uses LLM to generate contextual fireside chat questions based on input parameters
- **Purpose**: Provide hosts with engaging, relevant questions for their informal interview
- **Trigger**: User clicks "Generate Questions" button
- **Progression**: Submit parameters → Show loading state → Display generated questions → Allow regeneration
- **Success criteria**: Questions are relevant, varied, and match the requested tone

### 3. Question Management
- **Functionality**: View, copy, and save favorite questions
- **Purpose**: Let users curate their question list for the actual fireside chat
- **Trigger**: User interacts with generated questions
- **Progression**: View questions → Copy individual questions → Save favorites for later
- **Success criteria**: Easy to copy and manage generated questions

## Edge Case Handling
- **Empty fields**: Provide sensible defaults and indicate required vs optional fields
- **No questions generated**: Show friendly error with retry option
- **Very short inputs**: Accept minimal input and still generate quality questions
- **Loading states**: Show engaging loading animation during LLM generation

## Design Direction
The design should evoke the warmth of a fireside gathering - intimate, relaxed, and conversational. Think amber glows, soft shadows, and organic shapes that suggest the flicker of flames without being literal.

## Color Selection
- **Primary Color**: `oklch(0.65 0.18 45)` - Warm amber/orange representing firelight and warmth
- **Secondary Colors**: `oklch(0.35 0.05 30)` - Deep charcoal brown for grounding and sophistication
- **Accent Color**: `oklch(0.75 0.15 60)` - Soft golden yellow for highlights and interactive elements
- **Background**: `oklch(0.18 0.03 50)` - Rich dark brown, like evening shadows
- **Foreground/Background Pairings**:
  - Background (Dark Brown oklch(0.18 0.03 50)): Cream text (oklch(0.92 0.02 80)) - Ratio 7.2:1 ✓
  - Primary (Amber oklch(0.65 0.18 45)): Dark text (oklch(0.15 0.02 40)) - Ratio 5.8:1 ✓
  - Card (oklch(0.22 0.04 45)): Cream text (oklch(0.92 0.02 80)) - Ratio 6.1:1 ✓

## Font Selection
Typography should feel editorial yet approachable - suggesting thoughtful conversation without being stuffy.

- **Primary Font**: Bricolage Grotesque - A distinctive grotesque with personality for headings
- **Body Font**: Source Sans 3 - Clean and readable for form labels and generated content

- **Typographic Hierarchy**:
  - H1 (App Title): Bricolage Grotesque Bold/32px/tight letter spacing
  - H2 (Section Headers): Bricolage Grotesque SemiBold/24px/normal
  - Body (Questions/Labels): Source Sans 3 Regular/16px/1.5 line height
  - Small (Hints): Source Sans 3 Regular/14px/muted color

## Animations
Animations should be subtle and warm - gentle fades and slides that feel organic like flickering firelight. Use framer-motion for smooth question card appearances and button state transitions.

## Component Selection
- **Components**: 
  - Card for the main generator form and question display
  - Input for text fields (topics, job focus)
  - Select for dropdown choices (experience level)
  - Slider for tone spectrum (funny ↔ serious)
  - Button for actions with warm hover states
  - Badge for topic tags
  - Textarea for additional notes
- **Customizations**: Custom gradient backgrounds with subtle noise texture for depth
- **States**: Buttons glow warmer on hover; inputs have amber focus rings
- **Icon Selection**: Fire, Sparkle, Copy, Heart, Refresh icons from Phosphor
- **Spacing**: Generous padding (p-6, p-8) for breathing room; gap-4 between form elements
- **Mobile**: Stack form fields vertically; full-width buttons; scrollable question list
