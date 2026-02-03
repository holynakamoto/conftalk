/**
 * TalkPrep AI - Core Type Definitions
 */

// ============================================================================
// Input Types
// ============================================================================

export type AudienceType = 'technical' | 'academic' | 'business' | 'general';

export type ExpertiseLevel = 'beginner' | 'intermediate' | 'expert';

export type TalkType =
  | 'keynote'
  | 'technical_deep_dive'
  | 'workshop'
  | 'lightning_talk'
  | 'panel_discussion';

export type ToneType = 'formal' | 'conversational' | 'inspirational' | 'educational';

export type ExportFormat = 'markdown' | 'json' | 'html' | 'pdf';

export interface TalkConfig {
  topic: string;
  audience: AudienceType;
  duration: number; // in minutes
  expertiseLevel: ExpertiseLevel;
  talkType: TalkType;
  tone: ToneType;
  speakerName?: string;
  conferenceContext?: string;
  additionalNotes?: string;
}

// ============================================================================
// Research Types
// ============================================================================

export interface ResearchSource {
  title: string;
  url?: string;
  author?: string;
  date?: string;
  relevance: 'high' | 'medium' | 'low';
  summary: string;
  keyPoints: string[];
}

export interface ResearchResult {
  refinedTopic: string;
  topicSuggestions: string[];
  keyConcepts: string[];
  sources: ResearchSource[];
  potentialBiases: string[];
  audienceConsiderations: string[];
}

// ============================================================================
// Outline Types
// ============================================================================

export interface OutlineSection {
  id: string;
  title: string;
  duration: number; // in minutes
  order: number;
  type: 'intro' | 'main' | 'conclusion' | 'qa' | 'transition';
  keyPoints: string[];
  subsections?: OutlineSubsection[];
  notes?: string;
}

export interface OutlineSubsection {
  id: string;
  title: string;
  keyPoints: string[];
  suggestedVisuals?: string[];
}

export interface TalkOutline {
  title: string;
  subtitle?: string;
  totalDuration: number;
  sections: OutlineSection[];
  learningObjectives: string[];
  callToAction?: string;
}

// ============================================================================
// Content Types
// ============================================================================

export interface SpeakerNote {
  sectionId: string;
  content: string;
  timing: string;
  emphasis?: string[];
  pausePoints?: string[];
}

export interface Script {
  title: string;
  introduction: string;
  sections: ScriptSection[];
  conclusion: string;
  speakerNotes: SpeakerNote[];
}

export interface ScriptSection {
  sectionId: string;
  title: string;
  content: string;
  transitions: {
    in?: string;
    out?: string;
  };
  codeExamples?: CodeExample[];
  anecdotes?: string[];
}

export interface CodeExample {
  language: string;
  code: string;
  explanation: string;
  highlightLines?: number[];
}

// ============================================================================
// Slide Types
// ============================================================================

export type SlideLayout =
  | 'title'
  | 'section_header'
  | 'content'
  | 'two_column'
  | 'image_full'
  | 'code'
  | 'quote'
  | 'bullet_points'
  | 'comparison'
  | 'timeline'
  | 'qa';

export interface Slide {
  id: string;
  order: number;
  layout: SlideLayout;
  title?: string;
  subtitle?: string;
  content?: string;
  bulletPoints?: string[];
  imagePrompt?: string;
  code?: CodeExample;
  quote?: {
    text: string;
    attribution?: string;
  };
  speakerNotes: string;
  duration: number; // seconds
}

export interface SlideDeck {
  title: string;
  author?: string;
  date?: string;
  theme: SlideTheme;
  slides: Slide[];
  metadata: SlideMetadata;
}

export interface SlideTheme {
  name: string;
  type: 'tech' | 'business' | 'academic' | 'minimal' | 'creative';
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

export interface SlideMetadata {
  totalSlides: number;
  estimatedDuration: number;
  generatedAt: string;
  version: string;
}

// ============================================================================
// Q&A Types
// ============================================================================

export interface QAPair {
  id: string;
  question: string;
  category: 'technical' | 'clarification' | 'challenge' | 'expansion' | 'practical';
  difficulty: 'easy' | 'medium' | 'hard';
  suggestedAnswer: string;
  followUpQuestions?: string[];
  pitfalls?: string[];
}

export interface QAPreparation {
  anticipatedQuestions: QAPair[];
  challengingTopics: string[];
  preparedResponses: Map<string, string>;
  redirectStrategies: string[];
}

// ============================================================================
// Rehearsal Types
// ============================================================================

export interface RehearsalSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  sections: RehearsalSectionTiming[];
  feedback: RehearsalFeedback;
}

export interface RehearsalSectionTiming {
  sectionId: string;
  targetDuration: number;
  actualDuration?: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface RehearsalFeedback {
  overallTiming: {
    target: number;
    actual: number;
    variance: number;
  };
  sectionFeedback: SectionFeedback[];
  suggestions: string[];
  strengthAreas: string[];
  improvementAreas: string[];
}

export interface SectionFeedback {
  sectionId: string;
  timingStatus: 'on_track' | 'too_fast' | 'too_slow';
  suggestions: string[];
}

// ============================================================================
// Workflow Types
// ============================================================================

export type WorkflowStep = 'ideation' | 'outline' | 'content' | 'export' | 'rehearsal';

export interface WorkflowState {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  config: TalkConfig;
  research?: ResearchResult;
  outline?: TalkOutline;
  script?: Script;
  slides?: SlideDeck;
  qaPrep?: QAPreparation;
  rehearsals: RehearsalSession[];
}

// ============================================================================
// Export Types
// ============================================================================

export interface ExportOptions {
  format: ExportFormat;
  includeNotes: boolean;
  includeTimings: boolean;
  theme?: SlideTheme;
}

export interface ExportResult {
  format: ExportFormat;
  content: string;
  filename: string;
  mimeType: string;
}
