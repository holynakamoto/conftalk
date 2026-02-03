/**
 * TalkPrep AI - Tests
 */

import { createTalkPrepSkill, TalkPrepSkill } from './index.js';
import { TalkConfigSchema } from './schemas/validation.js';

describe('TalkPrepSkill', () => {
  let skill: TalkPrepSkill;

  beforeEach(() => {
    skill = createTalkPrepSkill();
  });

  describe('initialization', () => {
    it('should create a new skill instance', () => {
      expect(skill).toBeInstanceOf(TalkPrepSkill);
    });

    it('should initialize with valid config', () => {
      const result = skill.initialize({
        topic: 'Test Topic',
        audience: 'technical',
        duration: 30,
        talkType: 'technical_deep_dive',
        tone: 'conversational',
      });

      expect(result.success).toBe(true);
      expect(result.state).toBeDefined();
      expect(result.state?.config.topic).toBe('Test Topic');
    });

    it('should fail with invalid config', () => {
      const result = skill.initialize({
        topic: '', // Too short
        duration: 200, // Too long
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should use default values for optional fields', () => {
      const result = skill.initialize({
        topic: 'Test Topic',
      });

      expect(result.success).toBe(true);
      expect(result.state?.config.audience).toBe('general');
      expect(result.state?.config.duration).toBe(30);
      expect(result.state?.config.tone).toBe('conversational');
    });
  });

  describe('workflow', () => {
    beforeEach(() => {
      skill.initialize({
        topic: 'Building APIs with GraphQL',
        audience: 'technical',
        duration: 30,
        talkType: 'technical_deep_dive',
        tone: 'conversational',
      });
    });

    it('should start at ideation step', () => {
      expect(skill.getCurrentStep()).toBe('ideation');
    });

    it('should generate discovery questions', () => {
      const questions = skill.getDiscoveryQuestions();
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.some((q) => q.includes('topic'))).toBe(true);
    });

    it('should generate topic suggestions', () => {
      const suggestions = skill.getTopicSuggestions();
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should generate outline', () => {
      const outline = skill.generateOutline(['GraphQL basics', 'Schema design']);
      expect(outline.title).toBe('Building APIs with GraphQL');
      expect(outline.sections.length).toBeGreaterThan(0);
      expect(outline.totalDuration).toBe(30);
    });

    it('should generate outline markdown', () => {
      skill.generateOutline(['GraphQL basics']);
      const markdown = skill.getOutlineMarkdown();
      expect(markdown).toContain('# Building APIs with GraphQL');
      expect(markdown).toContain('## Outline');
    });

    it('should generate script', () => {
      skill.generateOutline(['GraphQL basics']);
      const script = skill.generateScript();
      expect(script.title).toBe('Building APIs with GraphQL');
      expect(script.sections.length).toBeGreaterThan(0);
    });

    it('should generate slides', () => {
      skill.generateOutline(['GraphQL basics']);
      const slides = skill.generateSlides();
      expect(slides.title).toBe('Building APIs with GraphQL');
      expect(slides.slides.length).toBeGreaterThan(0);
      expect(slides.metadata.totalSlides).toBe(slides.slides.length);
    });

    it('should export slides to markdown', () => {
      skill.generateOutline(['GraphQL basics']);
      skill.generateSlides();
      const result = skill.exportSlides({
        format: 'markdown',
        includeNotes: true,
        includeTimings: true,
      });
      expect(result.format).toBe('markdown');
      expect(result.content).toContain('# Building APIs with GraphQL');
      expect(result.mimeType).toBe('text/markdown');
    });

    it('should export slides to HTML', () => {
      skill.generateOutline(['GraphQL basics']);
      skill.generateSlides();
      const result = skill.exportSlides({
        format: 'html',
        includeNotes: true,
        includeTimings: true,
      });
      expect(result.format).toBe('html');
      expect(result.content).toContain('<!DOCTYPE html>');
      expect(result.mimeType).toBe('text/html');
    });

    it('should export slides to JSON', () => {
      skill.generateOutline(['GraphQL basics']);
      skill.generateSlides();
      const result = skill.exportSlides({
        format: 'json',
        includeNotes: true,
        includeTimings: true,
      });
      expect(result.format).toBe('json');
      expect(() => JSON.parse(result.content)).not.toThrow();
      expect(result.mimeType).toBe('application/json');
    });

    it('should generate Q&A preparation', () => {
      skill.generateOutline(['GraphQL basics']);
      const qaPrep = skill.generateQAPrep();
      expect(qaPrep.anticipatedQuestions.length).toBeGreaterThan(0);
      expect(qaPrep.redirectStrategies.length).toBeGreaterThan(0);
    });

    it('should generate timing cues', () => {
      skill.generateOutline(['GraphQL basics']);
      const cues = skill.getTimingCues();
      expect(cues).toContain('# Timing Cues');
      expect(cues).toContain('**Start:**');
    });

    it('should generate practice suggestions', () => {
      const suggestions = skill.getPracticeSuggestions();
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('templates', () => {
    it('should get template for talk type', () => {
      skill.initialize({
        topic: 'Test',
        talkType: 'keynote',
      });
      const template = skill.getTemplate();
      expect(template.name).toBe('Keynote');
      expect(template.structure.length).toBeGreaterThan(0);
    });

    it('should have different templates for different talk types', () => {
      skill.initialize({ topic: 'Test', talkType: 'keynote' });
      const keynoteTemplate = skill.getTemplate();

      skill.initialize({ topic: 'Test', talkType: 'lightning_talk' });
      const lightningTemplate = skill.getTemplate();

      expect(keynoteTemplate.name).not.toBe(lightningTemplate.name);
      expect(keynoteTemplate.defaultDuration).not.toBe(lightningTemplate.defaultDuration);
    });
  });
});

describe('TalkConfigSchema', () => {
  it('should validate valid config', () => {
    const result = TalkConfigSchema.safeParse({
      topic: 'Valid Topic',
      audience: 'technical',
      duration: 30,
    });
    expect(result.success).toBe(true);
  });

  it('should reject topic less than 3 characters', () => {
    const result = TalkConfigSchema.safeParse({
      topic: 'AB',
    });
    expect(result.success).toBe(false);
  });

  it('should reject duration less than 5 minutes', () => {
    const result = TalkConfigSchema.safeParse({
      topic: 'Valid Topic',
      duration: 3,
    });
    expect(result.success).toBe(false);
  });

  it('should reject duration more than 120 minutes', () => {
    const result = TalkConfigSchema.safeParse({
      topic: 'Valid Topic',
      duration: 150,
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid audience type', () => {
    const result = TalkConfigSchema.safeParse({
      topic: 'Valid Topic',
      audience: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});
