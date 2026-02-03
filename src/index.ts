/**
 * TalkPrep AI - Main Entry Point
 * A Claude Skill for conference talk preparation
 */

// Re-export all types
export * from './types/index.js';

// Re-export schemas
export * from './schemas/validation.js';

// Re-export prompts
export {
  TALKPREP_SYSTEM_PROMPT,
  PHASE_PROMPTS,
  AUDIENCE_GUIDANCE,
  TALK_TYPE_TEMPLATES,
} from './prompts/system-prompt.js';

// Re-export modules
export * from './modules/ideation.js';
export * from './modules/outline.js';
export * from './modules/content.js';
export * from './modules/slides.js';
export * from './modules/rehearsal.js';

// Re-export templates
export * from './templates/index.js';

// Import for internal use
import type {
  TalkConfig,
  TalkOutline,
  Script,
  SlideDeck,
  QAPreparation,
  WorkflowState,
  WorkflowStep,
  ExportOptions,
  ExportResult,
  ResearchResult,
} from './types/index.js';

import { TalkConfigSchema } from './schemas/validation.js';
import { TALKPREP_SYSTEM_PROMPT } from './prompts/system-prompt.js';
import {
  generateIdeationPrompt,
  generateResearchGuidance,
  createResearchTemplate,
  generateDiscoveryQuestions,
  suggestTopicRefinements,
} from './modules/ideation.js';
import {
  generateOutlinePrompt,
  createOutlineTemplate,
  formatOutlineAsMarkdown,
  validateOutlineTiming,
  suggestOutlineImprovements,
} from './modules/outline.js';
import {
  generateScriptPrompt,
  createScriptTemplate,
  formatScriptAsMarkdown,
  generateHookSuggestions,
  validateContent,
} from './modules/content.js';
import {
  generateSlidesPrompt,
  createSlideDeckTemplate,
  exportSlideDeck,
  validateSlideDeck,
} from './modules/slides.js';
import {
  generateQAPrompt,
  createQAPreparation,
  createRehearsalSession,
  generateRehearsalFeedback,
  generateTimingCues,
  generatePracticeSuggestions,
  formatQAAsMarkdown,
} from './modules/rehearsal.js';
import { getTemplate, generateOutlineFromTemplate } from './templates/index.js';

/**
 * TalkPrep AI Skill - Main class that orchestrates the talk preparation workflow
 */
export class TalkPrepSkill {
  private state: WorkflowState | null = null;

  /**
   * Get the system prompt for this skill
   */
  getSystemPrompt(): string {
    return TALKPREP_SYSTEM_PROMPT;
  }

  /**
   * Initialize a new talk preparation session
   */
  initialize(configInput: unknown): { success: boolean; error?: string; state?: WorkflowState } {
    const result = TalkConfigSchema.safeParse(configInput);

    if (!result.success) {
      return {
        success: false,
        error: `Invalid configuration: ${result.error.issues.map((i) => i.message).join(', ')}`,
      };
    }

    const config = result.data;

    this.state = {
      currentStep: 'ideation',
      completedSteps: [],
      config,
      rehearsals: [],
    };

    return { success: true, state: this.state };
  }

  /**
   * Get discovery questions to understand the user's needs
   */
  getDiscoveryQuestions(): string[] {
    if (!this.state) {
      return [];
    }
    return generateDiscoveryQuestions(this.state.config);
  }

  /**
   * Get topic refinement suggestions
   */
  getTopicSuggestions(): string[] {
    if (!this.state) {
      return [];
    }
    return suggestTopicRefinements(
      this.state.config.topic,
      this.state.config.talkType,
      this.state.config.duration
    );
  }

  /**
   * Generate ideation prompt for Claude
   */
  generateIdeationPrompt(): string {
    if (!this.state) {
      throw new Error('Session not initialized');
    }
    return generateIdeationPrompt(this.state.config);
  }

  /**
   * Set research results
   */
  setResearchResults(research: ResearchResult): void {
    if (!this.state) {
      throw new Error('Session not initialized');
    }
    this.state.research = research;
    this.completeStep('ideation');
    this.state.currentStep = 'outline';
  }

  /**
   * Generate outline
   */
  generateOutline(keyConcepts?: string[]): TalkOutline {
    if (!this.state) {
      throw new Error('Session not initialized');
    }

    // Use template as starting point
    const template = getTemplate(this.state.config.talkType);
    const outline = generateOutlineFromTemplate(
      template,
      this.state.config.topic,
      this.state.config.duration
    );

    // If we have research results, use those key concepts
    if (this.state.research) {
      outline.learningObjectives = this.state.research.keyConcepts.slice(0, 3);
    } else if (keyConcepts) {
      outline.learningObjectives = keyConcepts;
    }

    this.state.outline = outline;
    return outline;
  }

  /**
   * Get outline generation prompt for Claude
   */
  getOutlinePrompt(keyConcepts: string[]): string {
    if (!this.state) {
      throw new Error('Session not initialized');
    }
    return generateOutlinePrompt(this.state.config, keyConcepts);
  }

  /**
   * Set outline and validate it
   */
  setOutline(outline: TalkOutline): { valid: boolean; warnings: string[] } {
    if (!this.state) {
      throw new Error('Session not initialized');
    }

    this.state.outline = outline;
    const validation = validateOutlineTiming(outline);
    const suggestions = suggestOutlineImprovements(outline);

    if (validation.isValid) {
      this.completeStep('outline');
      this.state.currentStep = 'content';
    }

    return {
      valid: validation.isValid,
      warnings: [...validation.warnings, ...suggestions],
    };
  }

  /**
   * Get outline as markdown
   */
  getOutlineMarkdown(): string {
    if (!this.state?.outline) {
      throw new Error('No outline available');
    }
    return formatOutlineAsMarkdown(this.state.outline);
  }

  /**
   * Generate content/script
   */
  generateScript(): Script {
    if (!this.state?.outline) {
      throw new Error('Outline required before generating script');
    }

    const script = createScriptTemplate(this.state.outline);
    this.state.script = script;
    return script;
  }

  /**
   * Get script generation prompt
   */
  getScriptPrompt(): string {
    if (!this.state?.outline) {
      throw new Error('Outline required');
    }
    return generateScriptPrompt(this.state.config, this.state.outline);
  }

  /**
   * Set script and validate
   */
  setScript(script: Script): { valid: boolean; issues: string[]; suggestions: string[] } {
    if (!this.state) {
      throw new Error('Session not initialized');
    }

    this.state.script = script;
    const validation = validateContent(script, this.state.config);

    if (validation.isValid) {
      this.completeStep('content');
      this.state.currentStep = 'export';
    }

    return validation;
  }

  /**
   * Get script as markdown
   */
  getScriptMarkdown(): string {
    if (!this.state?.script) {
      throw new Error('No script available');
    }
    return formatScriptAsMarkdown(this.state.script);
  }

  /**
   * Get hook suggestions
   */
  getHookSuggestions(): string[] {
    if (!this.state) {
      throw new Error('Session not initialized');
    }
    return generateHookSuggestions(this.state.config);
  }

  /**
   * Generate slides
   */
  generateSlides(): SlideDeck {
    if (!this.state?.outline) {
      throw new Error('Outline required before generating slides');
    }

    const slides = createSlideDeckTemplate(this.state.config, this.state.outline);
    this.state.slides = slides;
    return slides;
  }

  /**
   * Get slides generation prompt
   */
  getSlidesPrompt(): string {
    if (!this.state?.outline) {
      throw new Error('Outline required');
    }
    return generateSlidesPrompt(this.state.config, this.state.outline);
  }

  /**
   * Set slides
   */
  setSlides(slides: SlideDeck): { valid: boolean; warnings: string[]; suggestions: string[] } {
    if (!this.state) {
      throw new Error('Session not initialized');
    }

    this.state.slides = slides;
    const validation = validateSlideDeck(slides, this.state.config);

    this.completeStep('export');
    this.state.currentStep = 'rehearsal';

    return validation;
  }

  /**
   * Export slides
   */
  exportSlides(options: ExportOptions): ExportResult {
    if (!this.state?.slides) {
      throw new Error('No slides available');
    }
    return exportSlideDeck(this.state.slides, options);
  }

  /**
   * Generate Q&A preparation
   */
  generateQAPrep(): QAPreparation {
    if (!this.state?.outline) {
      throw new Error('Outline required');
    }

    const qaPrep = createQAPreparation(this.state.config, this.state.outline);
    this.state.qaPrep = qaPrep;
    return qaPrep;
  }

  /**
   * Get Q&A prompt for Claude
   */
  getQAPrompt(): string {
    if (!this.state?.outline) {
      throw new Error('Outline required');
    }
    return generateQAPrompt(this.state.config, this.state.outline);
  }

  /**
   * Get Q&A preparation as markdown
   */
  getQAMarkdown(): string {
    if (!this.state?.qaPrep) {
      throw new Error('No Q&A preparation available');
    }
    return formatQAAsMarkdown(this.state.qaPrep);
  }

  /**
   * Start a rehearsal session
   */
  startRehearsal(): string {
    if (!this.state?.outline) {
      throw new Error('Outline required');
    }

    const session = createRehearsalSession(this.state.outline);
    this.state.rehearsals.push(session);

    this.completeStep('rehearsal');

    return session.id;
  }

  /**
   * Get timing cues for rehearsal
   */
  getTimingCues(): string {
    if (!this.state?.outline) {
      throw new Error('Outline required');
    }
    return generateTimingCues(this.state.outline);
  }

  /**
   * Get practice suggestions
   */
  getPracticeSuggestions(): string[] {
    if (!this.state) {
      throw new Error('Session not initialized');
    }
    return generatePracticeSuggestions(this.state.config);
  }

  /**
   * Get current workflow state
   */
  getState(): WorkflowState | null {
    return this.state;
  }

  /**
   * Get current step
   */
  getCurrentStep(): WorkflowStep | null {
    return this.state?.currentStep || null;
  }

  /**
   * Check if a step is completed
   */
  isStepCompleted(step: WorkflowStep): boolean {
    return this.state?.completedSteps.includes(step) || false;
  }

  /**
   * Mark a step as complete
   */
  private completeStep(step: WorkflowStep): void {
    if (this.state && !this.state.completedSteps.includes(step)) {
      this.state.completedSteps.push(step);
    }
  }

  /**
   * Get research guidance
   */
  getResearchGuidance(keyConcepts: string[]): string {
    if (!this.state) {
      throw new Error('Session not initialized');
    }
    return generateResearchGuidance(
      this.state.config.topic,
      this.state.config.audience,
      keyConcepts
    );
  }

  /**
   * Get template for current talk type
   */
  getTemplate() {
    if (!this.state) {
      throw new Error('Session not initialized');
    }
    return getTemplate(this.state.config.talkType);
  }
}

// Export default instance factory
export function createTalkPrepSkill(): TalkPrepSkill {
  return new TalkPrepSkill();
}
