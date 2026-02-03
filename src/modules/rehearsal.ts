/**
 * TalkPrep AI - Rehearsal Simulation Module
 */

import type {
  TalkConfig,
  TalkOutline,
  Script,
  QAPair,
  QAPreparation,
  RehearsalSession,
  RehearsalSectionTiming,
  RehearsalFeedback,
  SectionFeedback,
  AudienceType,
} from '../types/index.js';

/**
 * Generates Q&A preparation materials
 */
export function generateQAPrompt(config: TalkConfig, outline: TalkOutline): string {
  return `Generate potential Q&A questions for my ${config.duration}-minute ${config.talkType.replace('_', ' ')} on "${config.topic}".

**Audience:** ${config.audience}
**Key points covered:**
${outline.sections.map((s) => `- ${s.title}: ${s.keyPoints.join(', ')}`).join('\n')}

Please generate 15-20 questions across these categories:
1. **Technical/Detail questions** - Deep dives into specific points
2. **Clarification questions** - Requests to explain something again
3. **Challenge questions** - Push back on claims or suggestions
4. **Expansion questions** - Requests for more on a topic
5. **Practical questions** - How to apply in real situations

For each question, provide:
- The question text
- Difficulty level (easy/medium/hard)
- Category
- Suggested answer approach (3-5 key points)
- Common pitfalls to avoid
- Potential follow-up questions`;
}

/**
 * Creates Q&A preparation template
 */
export function createQAPreparation(config: TalkConfig, outline: TalkOutline): QAPreparation {
  const anticipatedQuestions = generateAnticipatedQuestions(config, outline);
  const challengingTopics = identifyChallengingTopics(outline);
  const redirectStrategies = generateRedirectStrategies();

  return {
    anticipatedQuestions,
    challengingTopics,
    preparedResponses: new Map(),
    redirectStrategies,
  };
}

/**
 * Generates anticipated questions based on talk content
 */
function generateAnticipatedQuestions(
  config: TalkConfig,
  outline: TalkOutline
): QAPair[] {
  const questions: QAPair[] = [];
  let questionId = 1;

  // Generic questions for any talk
  const genericQuestions: Omit<QAPair, 'id'>[] = [
    {
      question: 'Can you elaborate on that last point?',
      category: 'clarification',
      difficulty: 'easy',
      suggestedAnswer:
        'Sure, let me break that down further. The key aspect is... [elaborate with an example]',
      followUpQuestions: ['How does that apply in practice?'],
      pitfalls: ['Don\'t repeat the same words, provide new context'],
    },
    {
      question: 'How did you get started with this topic?',
      category: 'expansion',
      difficulty: 'easy',
      suggestedAnswer:
        'Share your personal journey briefly, then connect it to why this matters for the audience.',
      pitfalls: ['Don\'t make it too long or self-focused'],
    },
    {
      question: 'What are the main challenges or limitations?',
      category: 'challenge',
      difficulty: 'medium',
      suggestedAnswer:
        'Acknowledge limitations honestly, then explain how to mitigate them.',
      followUpQuestions: ['How do you work around those limitations?'],
      pitfalls: ['Don\'t be defensive', 'Don\'t oversell or dismiss concerns'],
    },
    {
      question: 'How does this compare to [alternative approach]?',
      category: 'technical',
      difficulty: 'hard',
      suggestedAnswer:
        'Provide an honest comparison, acknowledging trade-offs. Each approach has strengths...',
      pitfalls: ['Don\'t bash alternatives', 'Be fair and objective'],
    },
    {
      question: 'Where can I learn more about this?',
      category: 'practical',
      difficulty: 'easy',
      suggestedAnswer:
        'Have 2-3 resources ready: documentation, books, tutorials, or communities.',
      pitfalls: ['Don\'t say you\'ll follow up if you won\'t'],
    },
  ];

  genericQuestions.forEach((q) => {
    questions.push({ ...q, id: `q-${questionId++}` });
  });

  // Audience-specific questions
  const audienceQuestions: Record<AudienceType, Omit<QAPair, 'id'>[]> = {
    technical: [
      {
        question: 'What\'s the performance impact of this approach?',
        category: 'technical',
        difficulty: 'hard',
        suggestedAnswer:
          'Provide benchmarks if available, or explain the theoretical complexity and trade-offs.',
        pitfalls: ['Don\'t make up numbers', 'Admit if you haven\'t measured'],
      },
      {
        question: 'How does this scale in production?',
        category: 'technical',
        difficulty: 'hard',
        suggestedAnswer:
          'Share real-world experience or case studies. Discuss scaling considerations.',
        followUpQuestions: ['What was your largest deployment?'],
        pitfalls: ['Be honest about scale you\'ve actually handled'],
      },
    ],
    academic: [
      {
        question: 'What\'s your methodology for this research?',
        category: 'technical',
        difficulty: 'medium',
        suggestedAnswer:
          'Explain your methodology clearly, including sample size, variables, and controls.',
        pitfalls: ['Don\'t oversimplify if it would misrepresent your work'],
      },
      {
        question: 'What are the limitations of this study?',
        category: 'challenge',
        difficulty: 'medium',
        suggestedAnswer:
          'Acknowledge limitations proactively. Discuss how future work could address them.',
        pitfalls: ['Don\'t be defensive about limitations'],
      },
    ],
    business: [
      {
        question: 'What\'s the ROI on implementing this?',
        category: 'practical',
        difficulty: 'medium',
        suggestedAnswer:
          'Provide concrete examples or case studies. Discuss both direct and indirect benefits.',
        pitfalls: ['Don\'t make up numbers', 'Acknowledge context matters'],
      },
      {
        question: 'How long until we see results?',
        category: 'practical',
        difficulty: 'medium',
        suggestedAnswer:
          'Give realistic timelines. Discuss quick wins vs long-term benefits.',
        pitfalls: ['Don\'t overpromise on timelines'],
      },
    ],
    general: [
      {
        question: 'How does this affect everyday people?',
        category: 'expansion',
        difficulty: 'easy',
        suggestedAnswer:
          'Connect to relatable, everyday scenarios. Use analogies.',
        pitfalls: ['Don\'t be condescending', 'Use inclusive examples'],
      },
      {
        question: 'Can you give a simple example?',
        category: 'clarification',
        difficulty: 'easy',
        suggestedAnswer:
          'Have 2-3 simple analogies or examples ready for key concepts.',
        pitfalls: ['Don\'t oversimplify to the point of inaccuracy'],
      },
    ],
  };

  audienceQuestions[config.audience].forEach((q) => {
    questions.push({ ...q, id: `q-${questionId++}` });
  });

  // Questions based on outline sections
  outline.sections.forEach((section) => {
    if (section.type === 'main' && section.keyPoints.length > 0) {
      questions.push({
        id: `q-${questionId++}`,
        question: `Can you tell us more about "${section.keyPoints[0]}"?`,
        category: 'expansion',
        difficulty: 'medium',
        suggestedAnswer: `Expand with additional details, examples, or context about ${section.keyPoints[0]}.`,
        pitfalls: ['Don\'t just repeat what you said'],
      });
    }
  });

  return questions;
}

/**
 * Identifies topics that might be challenging in Q&A
 */
function identifyChallengingTopics(outline: TalkOutline): string[] {
  const challengingTopics: string[] = [];

  outline.sections.forEach((section) => {
    // Complex topics (many key points)
    if (section.keyPoints.length > 4) {
      challengingTopics.push(`${section.title} - complex with many sub-points`);
    }

    // Topics with controversial keywords
    const controversialKeywords = ['best', 'only', 'always', 'never', 'wrong'];
    section.keyPoints.forEach((point) => {
      if (controversialKeywords.some((kw) => point.toLowerCase().includes(kw))) {
        challengingTopics.push(`"${point}" - absolute claims may be challenged`);
      }
    });
  });

  return challengingTopics;
}

/**
 * Generates redirect strategies for difficult questions
 */
function generateRedirectStrategies(): string[] {
  return [
    'Bridge to your key message: "That\'s interesting, and what\'s even more relevant is..."',
    'Acknowledge and defer: "Great question. Let me address that after we finish, as it deserves full attention."',
    'Turn to the audience: "That\'s a great point. Has anyone else encountered this?"',
    'Provide partial answer: "I can speak to part of that. The aspect I\'m most familiar with is..."',
    'Admit boundaries: "That\'s outside my area of expertise, but I can point you to some resources."',
    'Reframe the question: "If I understand correctly, you\'re asking about... Let me address that."',
  ];
}

/**
 * Creates a rehearsal session
 */
export function createRehearsalSession(outline: TalkOutline): RehearsalSession {
  const sectionTimings: RehearsalSectionTiming[] = outline.sections.map((section) => ({
    sectionId: section.id,
    targetDuration: section.duration * 60, // Convert to seconds
    actualDuration: undefined,
    status: 'not_started',
  }));

  return {
    id: `rehearsal-${Date.now()}`,
    startTime: new Date(),
    endTime: undefined,
    sections: sectionTimings,
    feedback: {
      overallTiming: {
        target: outline.totalDuration * 60,
        actual: 0,
        variance: 0,
      },
      sectionFeedback: [],
      suggestions: [],
      strengthAreas: [],
      improvementAreas: [],
    },
  };
}

/**
 * Updates rehearsal session with section timing
 */
export function updateSectionTiming(
  session: RehearsalSession,
  sectionId: string,
  actualDuration: number
): RehearsalSession {
  const updatedSections = session.sections.map((section) => {
    if (section.sectionId === sectionId) {
      return {
        ...section,
        actualDuration,
        status: 'completed' as const,
      };
    }
    return section;
  });

  return {
    ...session,
    sections: updatedSections,
  };
}

/**
 * Generates rehearsal feedback
 */
export function generateRehearsalFeedback(
  session: RehearsalSession,
  outline: TalkOutline
): RehearsalFeedback {
  const sectionFeedback: SectionFeedback[] = [];
  let totalActual = 0;

  session.sections.forEach((section) => {
    if (section.actualDuration !== undefined) {
      totalActual += section.actualDuration;
      const variance = section.actualDuration - section.targetDuration;
      const variancePercent = (variance / section.targetDuration) * 100;

      let timingStatus: 'on_track' | 'too_fast' | 'too_slow';
      const suggestions: string[] = [];

      if (variancePercent > 15) {
        timingStatus = 'too_slow';
        suggestions.push(
          'Consider cutting some content or speaking more concisely',
          'Identify non-essential points that could be shortened'
        );
      } else if (variancePercent < -15) {
        timingStatus = 'too_fast';
        suggestions.push(
          'You might be rushing - add pauses for emphasis',
          'Consider adding more examples or elaboration'
        );
      } else {
        timingStatus = 'on_track';
        suggestions.push('Good pacing - maintain this tempo');
      }

      sectionFeedback.push({
        sectionId: section.sectionId,
        timingStatus,
        suggestions,
      });
    }
  });

  const targetTotal = session.sections.reduce((sum, s) => sum + s.targetDuration, 0);
  const variance = totalActual - targetTotal;

  // Generate overall suggestions
  const suggestions: string[] = [];
  const strengthAreas: string[] = [];
  const improvementAreas: string[] = [];

  if (Math.abs(variance) < targetTotal * 0.1) {
    strengthAreas.push('Overall timing is well-calibrated');
  } else if (variance > 0) {
    improvementAreas.push('Talk is running long - identify sections to trim');
    suggestions.push('Practice the longest sections more to tighten delivery');
  } else {
    improvementAreas.push('Talk is running short - add depth or examples');
    suggestions.push('Consider where you can elaborate or add stories');
  }

  // Check for consistency
  const onTrackSections = sectionFeedback.filter((s) => s.timingStatus === 'on_track');
  if (onTrackSections.length >= sectionFeedback.length * 0.7) {
    strengthAreas.push('Consistent pacing across sections');
  } else {
    improvementAreas.push('Pacing varies significantly between sections');
    suggestions.push('Work on evening out your delivery speed');
  }

  return {
    overallTiming: {
      target: targetTotal,
      actual: totalActual,
      variance,
    },
    sectionFeedback,
    suggestions,
    strengthAreas,
    improvementAreas,
  };
}

/**
 * Generates timing cue script
 */
export function generateTimingCues(outline: TalkOutline): string {
  let cues = '# Timing Cues\n\n';
  let runningTime = 0;

  outline.sections.forEach((section, index) => {
    const startMinutes = runningTime;
    runningTime += section.duration;
    const endMinutes = runningTime;

    cues += `## ${index + 1}. ${section.title}\n`;
    cues += `**Start:** ${formatTime(startMinutes)} | **End:** ${formatTime(endMinutes)} | **Duration:** ${section.duration} min\n\n`;

    if (section.keyPoints.length > 0) {
      const pointDuration = section.duration / section.keyPoints.length;
      section.keyPoints.forEach((point, pointIndex) => {
        const pointTime = startMinutes + pointDuration * pointIndex;
        cues += `- ${formatTime(pointTime)}: ${point}\n`;
      });
    }

    cues += '\n';
  });

  cues += `**Total Duration:** ${formatTime(outline.totalDuration)}\n`;

  return cues;
}

/**
 * Formats minutes as MM:SS
 */
function formatTime(minutes: number): string {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generates practice suggestions based on talk type
 */
export function generatePracticeSuggestions(config: TalkConfig): string[] {
  const suggestions: string[] = [
    'Record yourself and watch for filler words and nervous habits',
    'Practice in front of a mirror to observe body language',
    'Do a full run-through at least 3 times before the event',
    'Practice with different time constraints (tight vs relaxed)',
  ];

  switch (config.talkType) {
    case 'keynote':
      suggestions.push(
        'Practice your opening 10 times - it sets the tone',
        'Work on dramatic pauses and emphasis',
        'Rehearse the call to action until it feels natural'
      );
      break;
    case 'technical_deep_dive':
      suggestions.push(
        'Test all demos multiple times',
        'Have backup slides if live coding fails',
        'Practice explaining complex concepts simply'
      );
      break;
    case 'workshop':
      suggestions.push(
        'Time each exercise carefully',
        'Prepare for common errors and questions',
        'Have extension activities for fast finishers'
      );
      break;
    case 'lightning_talk':
      suggestions.push(
        'Every second counts - time it precisely',
        'Cut ruthlessly - one point only',
        'Practice transitioning smoothly'
      );
      break;
    case 'panel_discussion':
      suggestions.push(
        'Prepare 3-4 strong talking points',
        'Practice active listening and building on others\' points',
        'Have data ready to support your positions'
      );
      break;
  }

  return suggestions;
}

/**
 * Formats Q&A preparation as markdown
 */
export function formatQAAsMarkdown(qaPrep: QAPreparation): string {
  let md = '# Q&A Preparation Guide\n\n';

  md += '## Anticipated Questions\n\n';

  const byCategory = new Map<string, QAPair[]>();
  qaPrep.anticipatedQuestions.forEach((q) => {
    const existing = byCategory.get(q.category) || [];
    existing.push(q);
    byCategory.set(q.category, existing);
  });

  byCategory.forEach((questions, category) => {
    md += `### ${category.charAt(0).toUpperCase() + category.slice(1)} Questions\n\n`;

    questions.forEach((q) => {
      md += `**Q: ${q.question}**\n`;
      md += `*Difficulty: ${q.difficulty}*\n\n`;
      md += `**Suggested approach:** ${q.suggestedAnswer}\n\n`;

      if (q.pitfalls && q.pitfalls.length > 0) {
        md += `**Pitfalls to avoid:**\n`;
        q.pitfalls.forEach((p) => {
          md += `- ${p}\n`;
        });
        md += '\n';
      }

      if (q.followUpQuestions && q.followUpQuestions.length > 0) {
        md += `**Possible follow-ups:** ${q.followUpQuestions.join(', ')}\n\n`;
      }

      md += '---\n\n';
    });
  });

  if (qaPrep.challengingTopics.length > 0) {
    md += '## Challenging Topics\n\n';
    md += 'Be prepared for pushback on these areas:\n\n';
    qaPrep.challengingTopics.forEach((topic) => {
      md += `- ${topic}\n`;
    });
    md += '\n';
  }

  md += '## Redirect Strategies\n\n';
  md += 'When you need to redirect a difficult question:\n\n';
  qaPrep.redirectStrategies.forEach((strategy) => {
    md += `- ${strategy}\n`;
  });

  return md;
}
