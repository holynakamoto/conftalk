/**
 * TalkPrep AI - Outline Generation Module
 */

import type {
  TalkConfig,
  TalkOutline,
  OutlineSection,
  OutlineSubsection,
  TalkType,
} from '../types/index.js';

/**
 * Default time allocation percentages by section type
 */
const TIME_ALLOCATIONS: Record<string, Record<string, number>> = {
  default: {
    intro: 0.1,
    main: 0.65,
    conclusion: 0.1,
    qa: 0.15,
  },
  keynote: {
    intro: 0.15,
    main: 0.6,
    conclusion: 0.15,
    qa: 0.1,
  },
  workshop: {
    intro: 0.1,
    main: 0.7,
    conclusion: 0.1,
    qa: 0.1,
  },
  lightning_talk: {
    intro: 0.1,
    main: 0.75,
    conclusion: 0.15,
    qa: 0,
  },
};

/**
 * Generates a complete talk outline based on configuration
 */
export function generateOutlinePrompt(config: TalkConfig, keyConcepts: string[]): string {
  const allocations = TIME_ALLOCATIONS[config.talkType] || TIME_ALLOCATIONS.default;

  return `Create a detailed outline for my ${config.duration}-minute ${config.talkType.replace('_', ' ')} on "${config.topic}".

**Audience:** ${config.audience}
**Tone:** ${config.tone}
**Key concepts to cover:** ${keyConcepts.join(', ')}

Please create an outline with the following structure:

1. **Introduction** (~${Math.round(config.duration * allocations.intro)} minutes)
   - Attention-grabbing hook
   - Why this topic matters now
   - What the audience will learn

2. **Main Content** (~${Math.round(config.duration * allocations.main)} minutes)
   - 2-4 main sections depending on duration
   - Each section with clear key points
   - Transitions between sections

3. **Conclusion** (~${Math.round(config.duration * allocations.conclusion)} minutes)
   - Summary of key takeaways
   - Call to action
   - Memorable closing

${allocations.qa > 0 ? `4. **Q&A** (~${Math.round(config.duration * allocations.qa)} minutes)` : ''}

For each section, include:
- Estimated duration
- Key points (3-5 per section)
- Suggested transitions
- Notes on delivery`;
}

/**
 * Creates an outline template structure
 */
export function createOutlineTemplate(config: TalkConfig): TalkOutline {
  const allocations = TIME_ALLOCATIONS[config.talkType] || TIME_ALLOCATIONS.default;

  const sections: OutlineSection[] = [
    {
      id: 'intro',
      title: 'Introduction',
      duration: Math.round(config.duration * allocations.intro),
      order: 0,
      type: 'intro',
      keyPoints: [
        'Hook: Grab attention immediately',
        'Context: Why this matters',
        'Preview: What audience will learn',
      ],
      notes: 'Start strong. Make them curious.',
    },
    {
      id: 'main-1',
      title: 'Main Section 1',
      duration: Math.round(config.duration * allocations.main * 0.5),
      order: 1,
      type: 'main',
      keyPoints: [],
      subsections: [],
      notes: 'Core content begins here.',
    },
    {
      id: 'main-2',
      title: 'Main Section 2',
      duration: Math.round(config.duration * allocations.main * 0.5),
      order: 2,
      type: 'main',
      keyPoints: [],
      subsections: [],
      notes: 'Build on previous section.',
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      duration: Math.round(config.duration * allocations.conclusion),
      order: 3,
      type: 'conclusion',
      keyPoints: [
        'Summarize key takeaways',
        'Call to action',
        'Memorable closing statement',
      ],
      notes: 'End with impact. Leave them inspired.',
    },
  ];

  if (allocations.qa > 0) {
    sections.push({
      id: 'qa',
      title: 'Q&A',
      duration: Math.round(config.duration * allocations.qa),
      order: 4,
      type: 'qa',
      keyPoints: ['Prepare for common questions', 'Have backup topics ready'],
      notes: 'Stay composed. Bridge to your key messages.',
    });
  }

  return {
    title: config.topic,
    subtitle: undefined,
    totalDuration: config.duration,
    sections,
    learningObjectives: [],
    callToAction: undefined,
  };
}

/**
 * Generates main section recommendations based on talk type
 */
export function getMainSectionRecommendations(talkType: TalkType, duration: number): string[] {
  const recommendations: Record<TalkType, string[]> = {
    keynote: [
      'The Vision: Paint a picture of the future',
      'The Journey: Share the path to get there',
      'The Evidence: Prove it\'s possible',
      'The Invitation: Call audience to action',
    ],
    technical_deep_dive: [
      'The Problem: What we\'re solving',
      'The Solution: How it works',
      'The Implementation: Practical details',
      'The Lessons: What we learned',
    ],
    workshop: [
      'Foundations: Core concepts',
      'Guided Practice: Step-by-step exercises',
      'Independent Work: Apply learnings',
      'Advanced Topics: Next-level techniques',
    ],
    lightning_talk: [
      'The Problem: One clear challenge',
      'The Solution: Your key insight',
    ],
    panel_discussion: [
      'Opening Positions: Your stance',
      'Key Arguments: Supporting points',
      'Common Ground: Shared perspectives',
    ],
  };

  let sections = recommendations[talkType];

  // Adjust based on duration
  if (duration <= 15) {
    sections = sections.slice(0, 2);
  } else if (duration <= 30) {
    sections = sections.slice(0, 3);
  }

  return sections;
}

/**
 * Validates outline timing adds up correctly
 */
export function validateOutlineTiming(outline: TalkOutline): {
  isValid: boolean;
  totalAllocated: number;
  difference: number;
  warnings: string[];
} {
  const totalAllocated = outline.sections.reduce((sum, section) => sum + section.duration, 0);
  const difference = outline.totalDuration - totalAllocated;
  const warnings: string[] = [];

  if (Math.abs(difference) > 2) {
    warnings.push(
      `Timing mismatch: Total duration is ${outline.totalDuration} min but sections total ${totalAllocated} min`
    );
  }

  // Check for reasonable section lengths
  outline.sections.forEach((section) => {
    if (section.duration < 1 && section.type !== 'transition') {
      warnings.push(`Section "${section.title}" is very short (${section.duration} min)`);
    }
    if (section.duration > outline.totalDuration * 0.5 && section.type !== 'main') {
      warnings.push(`Section "${section.title}" takes more than 50% of total time`);
    }
  });

  return {
    isValid: warnings.length === 0,
    totalAllocated,
    difference,
    warnings,
  };
}

/**
 * Suggests improvements to an outline
 */
export function suggestOutlineImprovements(outline: TalkOutline): string[] {
  const suggestions: string[] = [];

  // Check for learning objectives
  if (outline.learningObjectives.length === 0) {
    suggestions.push('Add 2-3 clear learning objectives for your audience');
  }

  // Check for call to action
  if (!outline.callToAction) {
    suggestions.push('Add a specific call to action for your conclusion');
  }

  // Check section count
  const mainSections = outline.sections.filter((s) => s.type === 'main');
  if (mainSections.length > 4) {
    suggestions.push('Consider consolidating main sections - more than 4 can overwhelm');
  }
  if (mainSections.length < 2 && outline.totalDuration > 15) {
    suggestions.push('Consider breaking your main content into multiple sections');
  }

  // Check key points
  outline.sections.forEach((section) => {
    if (section.keyPoints.length === 0) {
      suggestions.push(`Add key points to section "${section.title}"`);
    }
    if (section.keyPoints.length > 6) {
      suggestions.push(`Section "${section.title}" has too many points - consider consolidating`);
    }
  });

  // Check for transitions
  const hasTransitions = outline.sections.some((s) => s.type === 'transition');
  if (!hasTransitions && outline.totalDuration > 20) {
    suggestions.push('Consider adding transition slides/moments between major sections');
  }

  return suggestions;
}

/**
 * Formats outline as markdown
 */
export function formatOutlineAsMarkdown(outline: TalkOutline): string {
  let md = `# ${outline.title}\n\n`;

  if (outline.subtitle) {
    md += `*${outline.subtitle}*\n\n`;
  }

  md += `**Total Duration:** ${outline.totalDuration} minutes\n\n`;

  if (outline.learningObjectives.length > 0) {
    md += `## Learning Objectives\n\n`;
    outline.learningObjectives.forEach((obj) => {
      md += `- ${obj}\n`;
    });
    md += '\n';
  }

  md += `## Outline\n\n`;

  outline.sections.forEach((section, index) => {
    md += `### ${index + 1}. ${section.title} (${section.duration} min)\n\n`;

    if (section.keyPoints.length > 0) {
      section.keyPoints.forEach((point) => {
        md += `- ${point}\n`;
      });
      md += '\n';
    }

    if (section.subsections && section.subsections.length > 0) {
      section.subsections.forEach((sub) => {
        md += `#### ${sub.title}\n`;
        sub.keyPoints.forEach((point) => {
          md += `  - ${point}\n`;
        });
        md += '\n';
      });
    }

    if (section.notes) {
      md += `*Notes: ${section.notes}*\n\n`;
    }
  });

  if (outline.callToAction) {
    md += `## Call to Action\n\n${outline.callToAction}\n`;
  }

  return md;
}

/**
 * Creates a subsection
 */
export function createSubsection(
  title: string,
  keyPoints: string[],
  suggestedVisuals?: string[]
): OutlineSubsection {
  return {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title,
    keyPoints,
    suggestedVisuals,
  };
}

/**
 * Reorders sections and updates order numbers
 */
export function reorderSections(
  outline: TalkOutline,
  fromIndex: number,
  toIndex: number
): TalkOutline {
  const sections = [...outline.sections];
  const [moved] = sections.splice(fromIndex, 1);
  sections.splice(toIndex, 0, moved);

  // Update order numbers
  sections.forEach((section, index) => {
    section.order = index;
  });

  return {
    ...outline,
    sections,
  };
}
