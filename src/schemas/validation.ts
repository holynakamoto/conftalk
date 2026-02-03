/**
 * TalkPrep AI - Input Validation Schemas
 * Using Zod for runtime validation
 */

import { z } from 'zod';

// ============================================================================
// Enum Schemas
// ============================================================================

export const AudienceTypeSchema = z.enum(['technical', 'academic', 'business', 'general']);

export const ExpertiseLevelSchema = z.enum(['beginner', 'intermediate', 'expert']);

export const TalkTypeSchema = z.enum([
  'keynote',
  'technical_deep_dive',
  'workshop',
  'lightning_talk',
  'panel_discussion',
]);

export const ToneTypeSchema = z.enum(['formal', 'conversational', 'inspirational', 'educational']);

export const ExportFormatSchema = z.enum(['markdown', 'json', 'html', 'pdf']);

export const SlideLayoutSchema = z.enum([
  'title',
  'section_header',
  'content',
  'two_column',
  'image_full',
  'code',
  'quote',
  'bullet_points',
  'comparison',
  'timeline',
  'qa',
]);

// ============================================================================
// Talk Configuration Schema
// ============================================================================

export const TalkConfigSchema = z.object({
  topic: z
    .string()
    .min(3, 'Topic must be at least 3 characters')
    .max(200, 'Topic must be less than 200 characters'),
  audience: AudienceTypeSchema.default('general'),
  duration: z
    .number()
    .int()
    .min(5, 'Duration must be at least 5 minutes')
    .max(120, 'Duration must be at most 120 minutes')
    .default(30),
  expertiseLevel: ExpertiseLevelSchema.default('intermediate'),
  talkType: TalkTypeSchema.default('technical_deep_dive'),
  tone: ToneTypeSchema.default('conversational'),
  speakerName: z.string().optional(),
  conferenceContext: z.string().max(500).optional(),
  additionalNotes: z.string().max(1000).optional(),
});

// ============================================================================
// Research Schemas
// ============================================================================

export const ResearchSourceSchema = z.object({
  title: z.string(),
  url: z.string().url().optional(),
  author: z.string().optional(),
  date: z.string().optional(),
  relevance: z.enum(['high', 'medium', 'low']),
  summary: z.string(),
  keyPoints: z.array(z.string()),
});

export const ResearchResultSchema = z.object({
  refinedTopic: z.string(),
  topicSuggestions: z.array(z.string()),
  keyConcepts: z.array(z.string()),
  sources: z.array(ResearchSourceSchema),
  potentialBiases: z.array(z.string()),
  audienceConsiderations: z.array(z.string()),
});

// ============================================================================
// Outline Schemas
// ============================================================================

export const OutlineSubsectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  keyPoints: z.array(z.string()),
  suggestedVisuals: z.array(z.string()).optional(),
});

export const OutlineSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.number().positive(),
  order: z.number().int().nonnegative(),
  type: z.enum(['intro', 'main', 'conclusion', 'qa', 'transition']),
  keyPoints: z.array(z.string()),
  subsections: z.array(OutlineSubsectionSchema).optional(),
  notes: z.string().optional(),
});

export const TalkOutlineSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  totalDuration: z.number().positive(),
  sections: z.array(OutlineSectionSchema),
  learningObjectives: z.array(z.string()),
  callToAction: z.string().optional(),
});

// ============================================================================
// Content Schemas
// ============================================================================

export const CodeExampleSchema = z.object({
  language: z.string(),
  code: z.string(),
  explanation: z.string(),
  highlightLines: z.array(z.number()).optional(),
});

export const SpeakerNoteSchema = z.object({
  sectionId: z.string(),
  content: z.string(),
  timing: z.string(),
  emphasis: z.array(z.string()).optional(),
  pausePoints: z.array(z.string()).optional(),
});

export const ScriptSectionSchema = z.object({
  sectionId: z.string(),
  title: z.string(),
  content: z.string(),
  transitions: z.object({
    in: z.string().optional(),
    out: z.string().optional(),
  }),
  codeExamples: z.array(CodeExampleSchema).optional(),
  anecdotes: z.array(z.string()).optional(),
});

export const ScriptSchema = z.object({
  title: z.string(),
  introduction: z.string(),
  sections: z.array(ScriptSectionSchema),
  conclusion: z.string(),
  speakerNotes: z.array(SpeakerNoteSchema),
});

// ============================================================================
// Slide Schemas
// ============================================================================

export const SlideThemeSchema = z.object({
  name: z.string(),
  type: z.enum(['tech', 'business', 'academic', 'minimal', 'creative']),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  fontFamily: z.string().optional(),
});

export const SlideSchema = z.object({
  id: z.string(),
  order: z.number().int().nonnegative(),
  layout: SlideLayoutSchema,
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  bulletPoints: z.array(z.string()).optional(),
  imagePrompt: z.string().optional(),
  code: CodeExampleSchema.optional(),
  quote: z
    .object({
      text: z.string(),
      attribution: z.string().optional(),
    })
    .optional(),
  speakerNotes: z.string(),
  duration: z.number().positive(),
});

export const SlideMetadataSchema = z.object({
  totalSlides: z.number().int().positive(),
  estimatedDuration: z.number().positive(),
  generatedAt: z.string(),
  version: z.string(),
});

export const SlideDeckSchema = z.object({
  title: z.string(),
  author: z.string().optional(),
  date: z.string().optional(),
  theme: SlideThemeSchema,
  slides: z.array(SlideSchema),
  metadata: SlideMetadataSchema,
});

// ============================================================================
// Q&A Schemas
// ============================================================================

export const QAPairSchema = z.object({
  id: z.string(),
  question: z.string(),
  category: z.enum(['technical', 'clarification', 'challenge', 'expansion', 'practical']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  suggestedAnswer: z.string(),
  followUpQuestions: z.array(z.string()).optional(),
  pitfalls: z.array(z.string()).optional(),
});

export const QAPreparationSchema = z.object({
  anticipatedQuestions: z.array(QAPairSchema),
  challengingTopics: z.array(z.string()),
  redirectStrategies: z.array(z.string()),
});

// ============================================================================
// Export Schemas
// ============================================================================

export const ExportOptionsSchema = z.object({
  format: ExportFormatSchema,
  includeNotes: z.boolean().default(true),
  includeTimings: z.boolean().default(true),
  theme: SlideThemeSchema.optional(),
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type TalkConfigInput = z.infer<typeof TalkConfigSchema>;
export type ResearchSourceInput = z.infer<typeof ResearchSourceSchema>;
export type TalkOutlineInput = z.infer<typeof TalkOutlineSchema>;
export type SlideInput = z.infer<typeof SlideSchema>;
export type SlideDeckInput = z.infer<typeof SlideDeckSchema>;
export type QAPairInput = z.infer<typeof QAPairSchema>;
export type ExportOptionsInput = z.infer<typeof ExportOptionsSchema>;
