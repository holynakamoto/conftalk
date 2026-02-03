# TalkPrep AI

A Claude Skill for comprehensive conference talk preparation, guiding users from initial ideation through to rehearsal.

## Overview

TalkPrep AI is an AI-powered assistant that helps professionals prepare outstanding conference talks, presentations, and keynotes. It provides end-to-end support for the entire preparation workflow:

- **Topic Ideation & Research** - Refine topics and gather relevant research
- **Outline Generation** - Create structured outlines with timing allocations
- **Content Creation** - Generate scripts, speaker notes, and engaging content
- **Slide Generation** - Produce slide decks with export to multiple formats
- **Rehearsal Simulation** - Practice with Q&A preparation and timing feedback

## Installation

```bash
npm install
npm run build
```

## Quick Start

```typescript
import { createTalkPrepSkill } from 'talkprep-ai';

// Create a new skill instance
const skill = createTalkPrepSkill();

// Initialize with talk configuration
const result = skill.initialize({
  topic: 'Building Scalable APIs with GraphQL',
  audience: 'technical',
  duration: 30,
  talkType: 'technical_deep_dive',
  tone: 'conversational',
  speakerName: 'Jane Developer',
});

// Get discovery questions to understand needs better
const questions = skill.getDiscoveryQuestions();

// Generate an outline
const outline = skill.generateOutline(['GraphQL basics', 'Schema design', 'Performance']);

// Export as markdown
const markdown = skill.getOutlineMarkdown();
```

## Features

### 1. Topic Ideation & Research

Help users refine their topic and identify key concepts:

```typescript
// Get topic refinement suggestions
const suggestions = skill.getTopicSuggestions();

// Get research guidance
const guidance = skill.getResearchGuidance(['concept1', 'concept2']);

// Generate ideation prompt for Claude
const prompt = skill.generateIdeationPrompt();
```

### 2. Outline Generation

Create structured outlines with proper timing:

```typescript
// Get outline generation prompt
const prompt = skill.getOutlinePrompt(['key concept 1', 'key concept 2']);

// Generate outline from template
const outline = skill.generateOutline(['concepts']);

// Validate and set custom outline
const validation = skill.setOutline(customOutline);
console.log(validation.warnings); // Any timing or structure issues

// Export as markdown
const markdown = skill.getOutlineMarkdown();
```

### 3. Content Creation

Generate scripts and speaker notes:

```typescript
// Generate script template
const script = skill.generateScript();

// Get hook suggestions for your opening
const hooks = skill.getHookSuggestions();

// Get script generation prompt for Claude
const prompt = skill.getScriptPrompt();

// Export as markdown
const markdown = skill.getScriptMarkdown();
```

### 4. Slide Generation & Export

Create and export slide decks:

```typescript
// Generate slides from outline
const slides = skill.generateSlides();

// Export to different formats
const markdownExport = skill.exportSlides({
  format: 'markdown',
  includeNotes: true,
  includeTimings: true,
});

const htmlExport = skill.exportSlides({
  format: 'html',
  includeNotes: true,
  includeTimings: false,
});

const jsonExport = skill.exportSlides({
  format: 'json',
  includeNotes: true,
  includeTimings: true,
});
```

### 5. Rehearsal & Q&A Preparation

Prepare for your presentation:

```typescript
// Generate Q&A preparation materials
const qaPrep = skill.generateQAPrep();

// Get Q&A as markdown
const qaMarkdown = skill.getQAMarkdown();

// Start a rehearsal session
const sessionId = skill.startRehearsal();

// Get timing cues
const timingCues = skill.getTimingCues();

// Get practice suggestions
const suggestions = skill.getPracticeSuggestions();
```

## Talk Types

TalkPrep AI supports different presentation formats:

| Type | Description | Default Duration |
|------|-------------|------------------|
| `keynote` | Inspirational, visionary talks | 45 min |
| `technical_deep_dive` | Detailed technical exploration | 45 min |
| `workshop` | Hands-on, interactive sessions | 90 min |
| `lightning_talk` | Short, focused presentations | 5 min |
| `panel_discussion` | Moderated multi-speaker discussion | 45 min |

## Audience Types

Tailor content for different audiences:

- `technical` - Engineers and developers
- `academic` - Researchers and academics
- `business` - Executives and business leaders
- `general` - Mixed or non-specialist audiences

## Configuration Options

```typescript
interface TalkConfig {
  topic: string;           // Main topic (required)
  audience: AudienceType;  // Target audience (default: 'general')
  duration: number;        // Duration in minutes (default: 30)
  expertiseLevel: 'beginner' | 'intermediate' | 'expert';
  talkType: TalkType;      // Type of presentation
  tone: 'formal' | 'conversational' | 'inspirational' | 'educational';
  speakerName?: string;    // Your name
  conferenceContext?: string;  // Event context
  additionalNotes?: string;    // Any extra notes
}
```

## Export Formats

### Markdown
Human-readable format with full content, speaker notes, and timing information.

### JSON
Machine-readable format compatible with presentation tools like reveal.js.

### HTML
Standalone HTML presentation with basic styling and print support.

## Project Structure

```
src/
├── index.ts              # Main entry point and TalkPrepSkill class
├── types/
│   └── index.ts          # TypeScript type definitions
├── schemas/
│   └── validation.ts     # Zod validation schemas
├── prompts/
│   └── system-prompt.ts  # Claude system prompts
├── modules/
│   ├── ideation.ts       # Topic ideation and research
│   ├── outline.ts        # Outline generation
│   ├── content.ts        # Content/script creation
│   ├── slides.ts         # Slide generation and export
│   └── rehearsal.ts      # Rehearsal and Q&A preparation
└── templates/
    └── index.ts          # Talk type templates
```

## Using with Claude

The skill provides a system prompt for Claude:

```typescript
const skill = createTalkPrepSkill();
const systemPrompt = skill.getSystemPrompt();

// Use this system prompt when initializing Claude
// to enable TalkPrep AI capabilities
```

## Workflow Example

```typescript
import { createTalkPrepSkill } from 'talkprep-ai';

async function prepareTalk() {
  const skill = createTalkPrepSkill();

  // 1. Initialize
  skill.initialize({
    topic: 'Introduction to Machine Learning',
    audience: 'general',
    duration: 30,
    talkType: 'technical_deep_dive',
    tone: 'educational',
  });

  // 2. Get discovery questions (for Claude to ask user)
  const questions = skill.getDiscoveryQuestions();

  // 3. Generate outline
  const outline = skill.generateOutline([
    'What is ML?',
    'Types of ML',
    'Real-world applications',
    'Getting started',
  ]);

  // 4. Generate script
  const script = skill.generateScript();

  // 5. Generate slides
  const slides = skill.generateSlides();

  // 6. Export
  const slidesMarkdown = skill.exportSlides({
    format: 'markdown',
    includeNotes: true,
    includeTimings: true,
  });

  // 7. Prepare for Q&A
  const qaPrep = skill.generateQAPrep();

  // 8. Get timing cues for rehearsal
  const timingCues = skill.getTimingCues();

  return {
    outline: skill.getOutlineMarkdown(),
    script: skill.getScriptMarkdown(),
    slides: slidesMarkdown.content,
    qa: skill.getQAMarkdown(),
    timingCues,
  };
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Format
npm run format
```

## License

MIT
