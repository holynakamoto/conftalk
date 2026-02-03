/**
 * TalkPrep AI - Topic Ideation and Research Module
 */

import type {
  TalkConfig,
  ResearchResult,
  ResearchSource,
  AudienceType,
} from '../types/index.js';

/**
 * Prompts for topic ideation based on user input
 */
export function generateIdeationPrompt(config: TalkConfig): string {
  return `Help me refine the following talk topic for a ${config.duration}-minute ${config.talkType.replace('_', ' ')} presentation.

**Topic:** ${config.topic}
**Audience:** ${config.audience}
**My expertise level:** ${config.expertiseLevel}
**Desired tone:** ${config.tone}
${config.conferenceContext ? `**Conference context:** ${config.conferenceContext}` : ''}
${config.additionalNotes ? `**Additional notes:** ${config.additionalNotes}` : ''}

Please provide:
1. A refined, compelling title for the talk
2. 3-5 alternative angles or framings I could take
3. The single most important takeaway for the audience
4. Key concepts I should cover
5. Potential hooks or opening strategies
6. Any areas where I should do additional research`;
}

/**
 * Generates research guidance based on topic and audience
 */
export function generateResearchGuidance(
  topic: string,
  audience: AudienceType,
  keyConcepts: string[]
): string {
  const audienceSpecificGuidance = {
    technical: 'Focus on implementation details, benchmarks, and real-world case studies.',
    academic: 'Prioritize peer-reviewed sources, cite methodologies, and acknowledge limitations.',
    business: 'Emphasize ROI, case studies, market data, and strategic implications.',
    general: 'Find relatable examples, analogies, and accessible explanations.',
  };

  return `## Research Guidance for "${topic}"

### Key Concepts to Research
${keyConcepts.map((c, i) => `${i + 1}. ${c}`).join('\n')}

### Audience Considerations
${audienceSpecificGuidance[audience]}

### Recommended Source Types
- Recent blog posts or articles from recognized experts
- Conference talks or papers on related topics
- Official documentation or specifications
- Industry reports or surveys
- Case studies from reputable organizations

### Research Questions to Answer
- What's the current state of the art?
- What are common misconceptions?
- What are the main challenges or trade-offs?
- What successful examples exist?
- What's coming next in this space?

### Fact-Checking Reminders
- Verify all statistics with primary sources
- Check dates on information (prefer recent sources)
- Cross-reference claims across multiple sources
- Note any potential biases in sources`;
}

/**
 * Creates a structured research result template
 */
export function createResearchTemplate(config: TalkConfig): ResearchResult {
  return {
    refinedTopic: '',
    topicSuggestions: [],
    keyConcepts: [],
    sources: [],
    potentialBiases: [],
    audienceConsiderations: getAudienceConsiderations(config.audience),
  };
}

/**
 * Get audience-specific considerations
 */
function getAudienceConsiderations(audience: AudienceType): string[] {
  const considerations: Record<AudienceType, string[]> = {
    technical: [
      'Assume familiarity with basic concepts in the domain',
      'Be prepared for detailed technical questions',
      'Include code examples and architecture diagrams',
      'Discuss trade-offs and alternative approaches',
      'Reference specific tools, libraries, or frameworks',
    ],
    academic: [
      'Include proper citations and references',
      'Present methodology transparently',
      'Acknowledge limitations and future work',
      'Use appropriate academic conventions',
      'Be prepared for rigorous methodological questions',
    ],
    business: [
      'Lead with business value and outcomes',
      'Use concrete ROI examples where possible',
      'Minimize technical jargon',
      'Include actionable recommendations',
      'Connect to strategic objectives',
    ],
    general: [
      'Avoid or clearly explain jargon',
      'Use relatable analogies and examples',
      'Focus on practical, everyday applications',
      'Tell stories to make concepts memorable',
      'Keep complexity accessible to newcomers',
    ],
  };

  return considerations[audience];
}

/**
 * Suggests topic refinements based on talk type
 */
export function suggestTopicRefinements(
  topic: string,
  talkType: TalkConfig['talkType'],
  duration: number
): string[] {
  const suggestions: string[] = [];

  // Duration-based suggestions
  if (duration <= 10) {
    suggestions.push(
      `Focus on ONE specific aspect of "${topic}" for a lightning talk`,
      `Consider framing as "The Most Important Thing About ${topic}"`,
      `Try a problem-solution format: one problem, one solution`
    );
  } else if (duration <= 30) {
    suggestions.push(
      `Cover 2-3 key insights about "${topic}"`,
      `Consider a "lessons learned" or "mistakes to avoid" angle`,
      `Frame around a compelling story or case study`
    );
  } else {
    suggestions.push(
      `Deep dive with comprehensive coverage of "${topic}"`,
      `Include hands-on exercises or demos`,
      `Cover both theory and practical application`
    );
  }

  // Talk type specific suggestions
  switch (talkType) {
    case 'keynote':
      suggestions.push(
        'Frame around a bold vision or prediction',
        'Connect to broader industry trends',
        'Include a personal journey or transformation story'
      );
      break;
    case 'technical_deep_dive':
      suggestions.push(
        'Focus on implementation details and gotchas',
        'Include live coding or detailed examples',
        'Discuss performance characteristics and benchmarks'
      );
      break;
    case 'workshop':
      suggestions.push(
        'Define clear learning objectives',
        'Plan hands-on exercises at regular intervals',
        'Prepare materials for different skill levels'
      );
      break;
    case 'lightning_talk':
      suggestions.push(
        'Pick the single most surprising insight',
        'Use a memorable hook or demo',
        'End with a clear call to action'
      );
      break;
    case 'panel_discussion':
      suggestions.push(
        'Prepare strong opening position',
        'Identify areas of potential debate',
        'Have data/examples ready to support points'
      );
      break;
  }

  return suggestions;
}

/**
 * Creates a source evaluation prompt
 */
export function createSourceEvaluationPrompt(source: Partial<ResearchSource>): string {
  return `Please evaluate this source for use in my talk:

**Title:** ${source.title || 'Unknown'}
**URL:** ${source.url || 'Not provided'}
**Author:** ${source.author || 'Unknown'}
**Date:** ${source.date || 'Unknown'}

Please assess:
1. Credibility of the source
2. Relevance to the topic
3. Potential biases to be aware of
4. Key points worth including
5. How to cite or reference appropriately`;
}

/**
 * Generates questions to deepen topic understanding
 */
export function generateDiscoveryQuestions(config: TalkConfig): string[] {
  const baseQuestions = [
    `What inspired you to speak about "${config.topic}"?`,
    'What unique perspective or experience do you bring to this topic?',
    'What do you want the audience to DO after your talk?',
    'What common misconceptions about this topic should be addressed?',
    'What\'s the most surprising or counterintuitive aspect of this topic?',
  ];

  const audienceQuestions: Record<AudienceType, string[]> = {
    technical: [
      'What technical problems does this solve?',
      'What alternatives exist and why is this approach better?',
      'What are the main implementation challenges?',
    ],
    academic: [
      'What research gaps does this address?',
      'What methodology will you present?',
      'What are the implications for future research?',
    ],
    business: [
      'What business outcomes does this enable?',
      'What\'s the ROI or competitive advantage?',
      'What case studies or success stories can you share?',
    ],
    general: [
      'Why should someone unfamiliar with this care?',
      'What everyday analogy explains this concept?',
      'How does this affect people\'s daily lives?',
    ],
  };

  return [...baseQuestions, ...audienceQuestions[config.audience]];
}
