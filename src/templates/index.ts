/**
 * TalkPrep AI - Templates for Different Talk Types
 */

import type { TalkOutline, OutlineSection, SlideTheme, TalkType } from '../types/index.js';

/**
 * Template definitions for each talk type
 */
export interface TalkTemplate {
  name: string;
  description: string;
  defaultDuration: number;
  structure: TemplateSection[];
  tips: string[];
  exampleHooks: string[];
  recommendedTheme: SlideTheme;
}

interface TemplateSection {
  title: string;
  type: OutlineSection['type'];
  durationPercent: number;
  keyPointPrompts: string[];
  notes: string;
}

/**
 * Keynote Talk Template
 */
export const keynoteTemplate: TalkTemplate = {
  name: 'Keynote',
  description: 'Inspirational, visionary talk that sets the tone for an event',
  defaultDuration: 45,
  structure: [
    {
      title: 'Opening Hook',
      type: 'intro',
      durationPercent: 10,
      keyPointPrompts: [
        'Start with a story, question, or surprising fact',
        'Establish your credibility briefly',
        'Preview the journey you\'ll take them on',
      ],
      notes: 'Make it personal. Connect emotionally. Create anticipation.',
    },
    {
      title: 'The Problem / Opportunity',
      type: 'main',
      durationPercent: 15,
      keyPointPrompts: [
        'Describe the current state of the industry/world',
        'Identify the challenge or opportunity',
        'Make the audience feel the urgency',
      ],
      notes: 'Paint a vivid picture. Use data to support your claims.',
    },
    {
      title: 'The Vision',
      type: 'main',
      durationPercent: 25,
      keyPointPrompts: [
        'Describe what\'s possible',
        'Share examples of early success',
        'Connect vision to audience\'s aspirations',
      ],
      notes: 'Be bold but credible. Inspire action.',
    },
    {
      title: 'The Path Forward',
      type: 'main',
      durationPercent: 20,
      keyPointPrompts: [
        'Outline concrete steps',
        'Address potential obstacles',
        'Share resources and support available',
      ],
      notes: 'Make it actionable. Don\'t just inspire - enable.',
    },
    {
      title: 'Call to Action',
      type: 'conclusion',
      durationPercent: 10,
      keyPointPrompts: [
        'Summarize the key message',
        'Issue a clear call to action',
        'End with a memorable statement',
      ],
      notes: 'Circle back to your opening. Leave them energized.',
    },
    {
      title: 'Q&A',
      type: 'qa',
      durationPercent: 20,
      keyPointPrompts: [
        'Prepare for skeptical questions',
        'Have examples ready',
        'Bridge answers to key messages',
      ],
      notes: 'Stay composed. Every question is an opportunity.',
    },
  ],
  tips: [
    'Practice your opening until it\'s flawless',
    'Use personal stories to make abstract ideas concrete',
    'Vary your pace and volume for emphasis',
    'Make eye contact across different sections of the room',
    'End on time - respect your audience',
  ],
  exampleHooks: [
    'Start with a bold prediction about the future',
    'Share a personal failure that led to an insight',
    'Ask a provocative question that challenges assumptions',
    'Present a striking statistic that reframes the conversation',
  ],
  recommendedTheme: {
    name: 'Keynote Bold',
    type: 'creative',
    primaryColor: '#0f172a',
    secondaryColor: '#3b82f6',
    fontFamily: 'Inter, sans-serif',
  },
};

/**
 * Technical Deep Dive Template
 */
export const technicalDeepDiveTemplate: TalkTemplate = {
  name: 'Technical Deep Dive',
  description: 'Detailed exploration of a technical topic for expert audiences',
  defaultDuration: 45,
  structure: [
    {
      title: 'Problem Context',
      type: 'intro',
      durationPercent: 10,
      keyPointPrompts: [
        'Define the technical problem clearly',
        'Explain why existing solutions fall short',
        'Preview your approach',
      ],
      notes: 'Establish technical context quickly. Your audience knows the basics.',
    },
    {
      title: 'Background & Prior Art',
      type: 'main',
      durationPercent: 15,
      keyPointPrompts: [
        'Review relevant prior work',
        'Explain key concepts needed',
        'Acknowledge trade-offs of existing approaches',
      ],
      notes: 'Be fair to alternatives. Show you\'ve done your homework.',
    },
    {
      title: 'Solution Architecture',
      type: 'main',
      durationPercent: 25,
      keyPointPrompts: [
        'Present your approach at a high level',
        'Explain key design decisions',
        'Discuss trade-offs you made',
      ],
      notes: 'Use diagrams. Explain the "why" not just the "what".',
    },
    {
      title: 'Implementation Details',
      type: 'main',
      durationPercent: 20,
      keyPointPrompts: [
        'Show key code or configurations',
        'Highlight interesting challenges',
        'Demonstrate with working examples',
      ],
      notes: 'Don\'t show every line. Focus on insights.',
    },
    {
      title: 'Results & Lessons',
      type: 'conclusion',
      durationPercent: 10,
      keyPointPrompts: [
        'Share benchmarks or outcomes',
        'Discuss what you learned',
        'Suggest next steps or future work',
      ],
      notes: 'Be honest about limitations. Share real numbers.',
    },
    {
      title: 'Q&A',
      type: 'qa',
      durationPercent: 20,
      keyPointPrompts: [
        'Prepare for edge case questions',
        'Know your performance numbers',
        'Be ready to discuss alternatives',
      ],
      notes: 'It\'s OK to say "I don\'t know, let me check."',
    },
  ],
  tips: [
    'Test all demos before the talk',
    'Have backup slides if live coding fails',
    'Explain your reasoning, not just your solution',
    'Be prepared for "what about X?" questions',
    'Leave code examples accessible for later',
  ],
  exampleHooks: [
    'Show the end result first, then explain how you got there',
    'Share a war story of a production incident',
    'Present a performance comparison that surprised you',
    'Demonstrate a common mistake and its consequences',
  ],
  recommendedTheme: {
    name: 'Tech Modern',
    type: 'tech',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    fontFamily: 'JetBrains Mono, monospace',
  },
};

/**
 * Workshop Template
 */
export const workshopTemplate: TalkTemplate = {
  name: 'Workshop',
  description: 'Hands-on, interactive learning session',
  defaultDuration: 90,
  structure: [
    {
      title: 'Introduction & Setup',
      type: 'intro',
      durationPercent: 10,
      keyPointPrompts: [
        'Welcome and introductions',
        'Learning objectives',
        'Verify everyone\'s setup works',
      ],
      notes: 'Don\'t skip setup verification - it saves time later.',
    },
    {
      title: 'Foundation Concepts',
      type: 'main',
      durationPercent: 15,
      keyPointPrompts: [
        'Core concepts needed for exercises',
        'Quick demonstration',
        'Check for understanding',
      ],
      notes: 'Keep theory minimal. Get to hands-on quickly.',
    },
    {
      title: 'Guided Exercise 1',
      type: 'main',
      durationPercent: 20,
      keyPointPrompts: [
        'Step-by-step walkthrough',
        'Common pitfalls to avoid',
        'Check-in point',
      ],
      notes: 'Walk around the room. Help those who are stuck.',
    },
    {
      title: 'Guided Exercise 2',
      type: 'main',
      durationPercent: 20,
      keyPointPrompts: [
        'Build on previous exercise',
        'Introduce new concept',
        'Allow exploration time',
      ],
      notes: 'Have extension tasks for fast finishers.',
    },
    {
      title: 'Independent Practice',
      type: 'main',
      durationPercent: 15,
      keyPointPrompts: [
        'Challenge exercise',
        'Minimal guidance',
        'Encourage peer help',
      ],
      notes: 'This is where real learning happens. Be available.',
    },
    {
      title: 'Wrap-up & Next Steps',
      type: 'conclusion',
      durationPercent: 10,
      keyPointPrompts: [
        'Summarize what was learned',
        'Provide resources for continued learning',
        'Collect feedback',
      ],
      notes: 'Leave them with a clear path forward.',
    },
    {
      title: 'Q&A',
      type: 'qa',
      durationPercent: 10,
      keyPointPrompts: [
        'Address remaining questions',
        'Troubleshoot lingering issues',
        'Share contact info for follow-up',
      ],
      notes: 'Be available after for individual questions.',
    },
  ],
  tips: [
    'Test your setup instructions on a fresh machine',
    'Prepare for the 3 most common errors',
    'Have a backup plan for WiFi issues',
    'Bring helpers if possible',
    'Share materials in advance',
  ],
  exampleHooks: [
    'Show what they\'ll be able to build by the end',
    'Share a quick win they can achieve in 5 minutes',
    'Ask about their experience level and adjust',
    'Start with a "why" story of someone who benefited',
  ],
  recommendedTheme: {
    name: 'Workshop Clear',
    type: 'minimal',
    primaryColor: '#059669',
    secondaryColor: '#047857',
    fontFamily: 'system-ui, sans-serif',
  },
};

/**
 * Lightning Talk Template
 */
export const lightningTalkTemplate: TalkTemplate = {
  name: 'Lightning Talk',
  description: 'Short, focused presentation delivering one key insight',
  defaultDuration: 5,
  structure: [
    {
      title: 'Hook',
      type: 'intro',
      durationPercent: 20,
      keyPointPrompts: [
        'Grab attention immediately',
        'State the one thing you\'re going to teach',
      ],
      notes: 'No time for pleasantries. Start strong.',
    },
    {
      title: 'The Insight',
      type: 'main',
      durationPercent: 50,
      keyPointPrompts: [
        'Explain your key point clearly',
        'Give one concrete example',
        'Make it memorable',
      ],
      notes: 'One point only. Go deep, not wide.',
    },
    {
      title: 'Takeaway',
      type: 'conclusion',
      durationPercent: 30,
      keyPointPrompts: [
        'Reinforce the key message',
        'Give a clear call to action',
        'End with impact',
      ],
      notes: 'Leave them wanting more. Point to resources.',
    },
  ],
  tips: [
    'Practice to the second - you\'ll be cut off',
    'One slide per minute maximum',
    'No "one more thing" - stick to your point',
    'End early rather than rushing the ending',
    'Have a memorable last line prepared',
  ],
  exampleHooks: [
    'Make a bold claim you\'ll prove in 5 minutes',
    'Show a surprising demo result',
    'Ask a question the audience can\'t answer',
    'Share a number that will shock them',
  ],
  recommendedTheme: {
    name: 'Lightning Fast',
    type: 'creative',
    primaryColor: '#dc2626',
    secondaryColor: '#b91c1c',
    fontFamily: 'Poppins, sans-serif',
  },
};

/**
 * Panel Discussion Template
 */
export const panelDiscussionTemplate: TalkTemplate = {
  name: 'Panel Discussion',
  description: 'Moderated discussion with multiple speakers',
  defaultDuration: 45,
  structure: [
    {
      title: 'Introductions',
      type: 'intro',
      durationPercent: 10,
      keyPointPrompts: [
        'Brief self-introduction',
        'Your key perspective on the topic',
        'One thing you hope to discuss',
      ],
      notes: 'Be memorable but brief. Others need time too.',
    },
    {
      title: 'Opening Positions',
      type: 'main',
      durationPercent: 20,
      keyPointPrompts: [
        'State your main position clearly',
        'Provide supporting evidence',
        'Acknowledge complexity',
      ],
      notes: 'Take a clear stance. It makes for better discussion.',
    },
    {
      title: 'Discussion',
      type: 'main',
      durationPercent: 30,
      keyPointPrompts: [
        'Build on others\' points',
        'Offer alternative perspectives',
        'Share relevant examples',
      ],
      notes: 'Listen actively. Engage, don\'t just wait to talk.',
    },
    {
      title: 'Audience Q&A',
      type: 'qa',
      durationPercent: 30,
      keyPointPrompts: [
        'Answer directly, then add nuance',
        'Invite other panelists to respond',
        'Connect to earlier discussion',
      ],
      notes: 'Keep answers focused. Leave room for others.',
    },
    {
      title: 'Closing Thoughts',
      type: 'conclusion',
      durationPercent: 10,
      keyPointPrompts: [
        'One key takeaway',
        'What you hope the audience remembers',
        'Call to continued conversation',
      ],
      notes: 'Be concise. Don\'t repeat what others said.',
    },
  ],
  tips: [
    'Prepare 3-4 strong talking points, not a script',
    'Listen as much as you speak',
    'Disagree respectfully when you have a different view',
    'Let others finish before jumping in',
    'Use data to support opinions',
  ],
  exampleHooks: [
    'Take a slightly contrarian position',
    'Reference a recent development in the field',
    'Share a personal experience that shaped your view',
    'Ask the other panelists a thoughtful question',
  ],
  recommendedTheme: {
    name: 'Panel Professional',
    type: 'business',
    primaryColor: '#1f2937',
    secondaryColor: '#374151',
    fontFamily: 'Inter, sans-serif',
  },
};

/**
 * Get template by talk type
 */
export function getTemplate(talkType: TalkType): TalkTemplate {
  const templates: Record<TalkType, TalkTemplate> = {
    keynote: keynoteTemplate,
    technical_deep_dive: technicalDeepDiveTemplate,
    workshop: workshopTemplate,
    lightning_talk: lightningTalkTemplate,
    panel_discussion: panelDiscussionTemplate,
  };

  return templates[talkType];
}

/**
 * Generate outline from template
 */
export function generateOutlineFromTemplate(
  template: TalkTemplate,
  topic: string,
  duration: number
): TalkOutline {
  const sections: OutlineSection[] = template.structure.map((section, index) => ({
    id: `section-${index}`,
    title: section.title,
    duration: Math.round((section.durationPercent / 100) * duration),
    order: index,
    type: section.type,
    keyPoints: section.keyPointPrompts,
    notes: section.notes,
  }));

  return {
    title: topic,
    totalDuration: duration,
    sections,
    learningObjectives: [],
  };
}

/**
 * Get all templates
 */
export function getAllTemplates(): TalkTemplate[] {
  return [
    keynoteTemplate,
    technicalDeepDiveTemplate,
    workshopTemplate,
    lightningTalkTemplate,
    panelDiscussionTemplate,
  ];
}
