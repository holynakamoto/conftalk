/**
 * TalkPrep AI - Content Creation Module
 */

import type {
  TalkConfig,
  TalkOutline,
  Script,
  ScriptSection,
  SpeakerNote,
  CodeExample,
  AudienceType,
  ToneType,
} from '../types/index.js';

/**
 * Generates a prompt for creating the full script
 */
export function generateScriptPrompt(config: TalkConfig, outline: TalkOutline): string {
  return `Create a speaker script for my ${config.duration}-minute ${config.talkType.replace('_', ' ')} on "${config.topic}".

**Audience:** ${config.audience}
**Tone:** ${config.tone}

**Outline:**
${outline.sections.map((s) => `- ${s.title} (${s.duration} min): ${s.keyPoints.join(', ')}`).join('\n')}

Please create:
1. An engaging introduction with a hook
2. Full content for each section with natural transitions
3. A memorable conclusion with clear call to action
4. Speaker notes with timing cues, emphasis points, and pause markers

Use these markers in the script:
- [PAUSE] - For dramatic pauses
- [EMPHASIS] - For words to stress
- [TRANSITION] - For section transitions
- [DEMO] - For demonstration moments
- [AUDIENCE] - For audience interaction points`;
}

/**
 * Creates a script template structure
 */
export function createScriptTemplate(outline: TalkOutline): Script {
  const sections: ScriptSection[] = outline.sections
    .filter((s) => s.type !== 'qa')
    .map((section) => ({
      sectionId: section.id,
      title: section.title,
      content: '',
      transitions: {
        in: undefined,
        out: undefined,
      },
      codeExamples: [],
      anecdotes: [],
    }));

  const speakerNotes: SpeakerNote[] = outline.sections.map((section) => ({
    sectionId: section.id,
    content: section.notes || '',
    timing: `${section.duration} minutes`,
    emphasis: [],
    pausePoints: [],
  }));

  return {
    title: outline.title,
    introduction: '',
    sections,
    conclusion: '',
    speakerNotes,
  };
}

/**
 * Generates opening hook suggestions based on talk type and tone
 */
export function generateHookSuggestions(config: TalkConfig): string[] {
  const hooks: string[] = [];

  // Universal hooks
  hooks.push(
    'Start with a surprising statistic or fact',
    'Open with a thought-provoking question',
    'Begin with a brief, relevant story'
  );

  // Tone-specific hooks
  const toneHooks: Record<ToneType, string[]> = {
    formal: [
      'Reference a respected authority or research',
      'State the problem formally and its significance',
      'Quote a relevant industry leader',
    ],
    conversational: [
      'Share a personal experience or mistake',
      'Ask the audience a show-of-hands question',
      'Use humor to break the ice',
    ],
    inspirational: [
      'Paint a vision of what\'s possible',
      'Share a transformation story',
      'Challenge conventional wisdom',
    ],
    educational: [
      'Preview what they\'ll be able to do after the talk',
      'Show a before/after comparison',
      'Demonstrate the problem they\'ll solve',
    ],
  };

  hooks.push(...toneHooks[config.tone]);

  // Audience-specific hooks
  if (config.audience === 'technical') {
    hooks.push(
      'Show a code snippet or architecture diagram',
      'Reference a common pain point in their work',
      'Demo the end result first'
    );
  } else if (config.audience === 'business') {
    hooks.push(
      'Lead with an ROI or impact number',
      'Reference a well-known business case',
      'Connect to current market trends'
    );
  }

  return hooks;
}

/**
 * Generates transition phrases between sections
 */
export function generateTransitions(fromSection: string, toSection: string): string[] {
  return [
    `Now that we've covered ${fromSection}, let's dive into ${toSection}.`,
    `This brings us to an important point: ${toSection}.`,
    `Building on what we just discussed, let's explore ${toSection}.`,
    `With that foundation in place, we can now look at ${toSection}.`,
    `Here's where it gets interesting. Let's talk about ${toSection}.`,
    `So how does this connect to ${toSection}? Let me show you.`,
  ];
}

/**
 * Generates conclusion patterns
 */
export function generateConclusionPatterns(config: TalkConfig): string[] {
  const patterns: string[] = [];

  // Universal patterns
  patterns.push(
    'Summarize the 3 key takeaways',
    'Circle back to your opening hook',
    'Issue a clear call to action'
  );

  // Tone-specific patterns
  const tonePatterns: Record<ToneType, string[]> = {
    formal: [
      'Restate your thesis with supporting evidence',
      'Acknowledge limitations and future directions',
      'Provide references for further reading',
    ],
    conversational: [
      'Share what you hope they remember most',
      'Offer to continue the conversation',
      'End with a memorable quote or insight',
    ],
    inspirational: [
      'Paint the picture of success if they take action',
      'Leave them with a challenge',
      'End with an empowering message',
    ],
    educational: [
      'Summarize what they can now do',
      'Provide next steps for learning',
      'Offer resources and practice opportunities',
    ],
  };

  patterns.push(...tonePatterns[config.tone]);

  return patterns;
}

/**
 * Creates a code example structure
 */
export function createCodeExample(
  language: string,
  code: string,
  explanation: string,
  highlightLines?: number[]
): CodeExample {
  return {
    language,
    code,
    explanation,
    highlightLines,
  };
}

/**
 * Generates speaker notes for a section
 */
export function generateSpeakerNotes(
  section: ScriptSection,
  duration: number,
  config: TalkConfig
): SpeakerNote {
  const wordsPerMinute = config.tone === 'formal' ? 120 : 150;
  const targetWords = duration * wordsPerMinute;
  const wordCount = section.content.split(/\s+/).length;
  const pacingNote =
    wordCount > targetWords * 1.1
      ? 'Content may be too long - consider cutting'
      : wordCount < targetWords * 0.9
        ? 'Content may be short - add examples or elaboration'
        : 'Pacing looks good';

  return {
    sectionId: section.sectionId,
    content: `Section: ${section.title}\n\nKey points to hit:\n${section.content.slice(0, 200)}...\n\nPacing: ${pacingNote}`,
    timing: `Target: ${duration} min (~${targetWords} words). Current: ~${wordCount} words.`,
    emphasis: extractEmphasisPoints(section.content),
    pausePoints: suggestPausePoints(section.content),
  };
}

/**
 * Extracts points that should be emphasized
 */
function extractEmphasisPoints(content: string): string[] {
  const emphasisMarkers = content.match(/\[EMPHASIS\]([^[]*)/g) || [];
  return emphasisMarkers.map((m) => m.replace('[EMPHASIS]', '').trim());
}

/**
 * Suggests where to pause in the content
 */
function suggestPausePoints(content: string): string[] {
  const points: string[] = [];

  // After questions
  const questions = content.match(/[^.]*\?/g) || [];
  questions.forEach((q) => {
    points.push(`After: "${q.trim().slice(0, 50)}..."`);
  });

  // After key statements (ending with exclamation or in emphasis)
  const exclamations = content.match(/[^.]*!/g) || [];
  exclamations.forEach((e) => {
    points.push(`After: "${e.trim().slice(0, 50)}..."`);
  });

  return points.slice(0, 5); // Limit to 5 suggestions
}

/**
 * Formats script as markdown
 */
export function formatScriptAsMarkdown(script: Script): string {
  let md = `# ${script.title}\n\n`;

  md += `## Introduction\n\n${script.introduction}\n\n`;

  script.sections.forEach((section, index) => {
    md += `## ${index + 1}. ${section.title}\n\n`;

    if (section.transitions.in) {
      md += `*[Transition in: ${section.transitions.in}]*\n\n`;
    }

    md += `${section.content}\n\n`;

    if (section.codeExamples && section.codeExamples.length > 0) {
      section.codeExamples.forEach((code) => {
        md += `\`\`\`${code.language}\n${code.code}\n\`\`\`\n\n`;
        md += `*${code.explanation}*\n\n`;
      });
    }

    if (section.anecdotes && section.anecdotes.length > 0) {
      md += `**Stories/Anecdotes:**\n`;
      section.anecdotes.forEach((a) => {
        md += `- ${a}\n`;
      });
      md += '\n';
    }

    if (section.transitions.out) {
      md += `*[Transition out: ${section.transitions.out}]*\n\n`;
    }
  });

  md += `## Conclusion\n\n${script.conclusion}\n\n`;

  md += `---\n\n## Speaker Notes\n\n`;

  script.speakerNotes.forEach((note) => {
    md += `### ${note.sectionId}\n\n`;
    md += `**Timing:** ${note.timing}\n\n`;
    md += `${note.content}\n\n`;

    if (note.emphasis && note.emphasis.length > 0) {
      md += `**Emphasize:** ${note.emphasis.join(', ')}\n\n`;
    }

    if (note.pausePoints && note.pausePoints.length > 0) {
      md += `**Pause after:**\n`;
      note.pausePoints.forEach((p) => {
        md += `- ${p}\n`;
      });
      md += '\n';
    }
  });

  return md;
}

/**
 * Generates audience-specific content adaptations
 */
export function adaptContentForAudience(
  content: string,
  fromAudience: AudienceType,
  toAudience: AudienceType
): string {
  if (fromAudience === toAudience) return content;

  // This would be handled by Claude in practice, but we provide guidance
  return `[Please adapt the following content from ${fromAudience} to ${toAudience} audience]\n\n${content}`;
}

/**
 * Calculates reading time for content
 */
export function calculateReadingTime(content: string, wordsPerMinute = 150): number {
  const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Validates content meets requirements
 */
export function validateContent(script: Script, config: TalkConfig): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check introduction
  if (!script.introduction || script.introduction.length < 100) {
    issues.push('Introduction is too short or missing');
  }

  // Check conclusion
  if (!script.conclusion || script.conclusion.length < 100) {
    issues.push('Conclusion is too short or missing');
  }

  // Check sections have content
  script.sections.forEach((section) => {
    if (!section.content || section.content.length < 50) {
      issues.push(`Section "${section.title}" needs more content`);
    }
  });

  // Check total length
  const totalContent = [
    script.introduction,
    ...script.sections.map((s) => s.content),
    script.conclusion,
  ].join(' ');

  const readingTime = calculateReadingTime(totalContent);

  if (readingTime > config.duration * 1.2) {
    suggestions.push(
      `Content may be too long (est. ${readingTime} min for ${config.duration} min talk)`
    );
  } else if (readingTime < config.duration * 0.8) {
    suggestions.push(
      `Content may be too short (est. ${readingTime} min for ${config.duration} min talk)`
    );
  }

  // Check for audience-appropriate language
  if (config.audience === 'general') {
    const technicalTerms = totalContent.match(/\b(API|SDK|algorithm|protocol|framework)\b/gi);
    if (technicalTerms && technicalTerms.length > 5) {
      suggestions.push('Consider explaining or reducing technical jargon for general audience');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}
