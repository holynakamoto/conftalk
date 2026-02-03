/**
 * TalkPrep AI - Slide Generation Module
 */

import type {
  TalkConfig,
  TalkOutline,
  Script,
  Slide,
  SlideDeck,
  SlideLayout,
  SlideTheme,
  SlideMetadata,
  CodeExample,
  ExportFormat,
  ExportOptions,
  ExportResult,
} from '../types/index.js';

/**
 * Default themes for different audience types
 */
export const DEFAULT_THEMES: Record<string, SlideTheme> = {
  tech: {
    name: 'Tech Modern',
    type: 'tech',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    fontFamily: 'JetBrains Mono, monospace',
  },
  business: {
    name: 'Corporate Clean',
    type: 'business',
    primaryColor: '#1f2937',
    secondaryColor: '#374151',
    fontFamily: 'Inter, sans-serif',
  },
  academic: {
    name: 'Academic Classic',
    type: 'academic',
    primaryColor: '#7c3aed',
    secondaryColor: '#5b21b6',
    fontFamily: 'Crimson Pro, serif',
  },
  minimal: {
    name: 'Minimal Light',
    type: 'minimal',
    primaryColor: '#000000',
    secondaryColor: '#6b7280',
    fontFamily: 'system-ui, sans-serif',
  },
  creative: {
    name: 'Creative Bold',
    type: 'creative',
    primaryColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Poppins, sans-serif',
  },
};

/**
 * Generates a slide deck generation prompt
 */
export function generateSlidesPrompt(config: TalkConfig, outline: TalkOutline): string {
  const slidesPerMinute = 1; // Approximately 1 slide per minute
  const targetSlides = Math.round(config.duration * slidesPerMinute);

  return `Create a slide deck for my ${config.duration}-minute ${config.talkType.replace('_', ' ')} on "${config.topic}".

**Target:** ~${targetSlides} slides
**Audience:** ${config.audience}
**Tone:** ${config.tone}

**Outline:**
${outline.sections.map((s) => `- ${s.title} (${s.duration} min): ${s.keyPoints.join(', ')}`).join('\n')}

For each slide, provide:
1. Layout type (title, section_header, bullet_points, code, quote, image_full, two_column)
2. Title and content
3. Speaker notes (what to say while showing this slide)
4. Any image or diagram suggestions

Guidelines:
- One main idea per slide
- Maximum 5 bullet points per slide (prefer 3)
- Include section divider slides
- Suggest visuals where helpful
- Keep text concise and scannable`;
}

/**
 * Creates a slide deck template
 */
export function createSlideDeckTemplate(config: TalkConfig, outline: TalkOutline): SlideDeck {
  const slides: Slide[] = [];
  let slideOrder = 0;

  // Title slide
  slides.push(createSlide({
    order: slideOrder++,
    layout: 'title',
    title: outline.title,
    subtitle: outline.subtitle || config.speakerName,
    speakerNotes: 'Introduce yourself. Wait for audience attention before starting.',
    duration: 30,
  }));

  // Create slides from outline sections
  outline.sections.forEach((section) => {
    // Section header slide
    slides.push(createSlide({
      order: slideOrder++,
      layout: 'section_header',
      title: section.title,
      speakerNotes: `Transition to ${section.title}. ${section.notes || ''}`,
      duration: 15,
    }));

    // Content slides for key points
    if (section.keyPoints.length > 0) {
      // Group key points into slides (max 4 per slide)
      const pointsPerSlide = Math.min(4, section.keyPoints.length);
      for (let i = 0; i < section.keyPoints.length; i += pointsPerSlide) {
        const points = section.keyPoints.slice(i, i + pointsPerSlide);
        slides.push(createSlide({
          order: slideOrder++,
          layout: 'bullet_points',
          title: section.title,
          bulletPoints: points,
          speakerNotes: `Cover these points: ${points.join('; ')}`,
          duration: (section.duration * 60) / Math.ceil(section.keyPoints.length / pointsPerSlide),
        }));
      }
    }
  });

  // Q&A slide if applicable
  if (outline.sections.some((s) => s.type === 'qa')) {
    slides.push(createSlide({
      order: slideOrder++,
      layout: 'qa',
      title: 'Questions?',
      speakerNotes: 'Open the floor for questions. Have backup topics ready.',
      duration: 60,
    }));
  }

  // Thank you slide
  slides.push(createSlide({
    order: slideOrder++,
    layout: 'title',
    title: 'Thank You',
    subtitle: outline.callToAction || 'Questions and discussion welcome',
    speakerNotes: 'Thank the audience. Remind them of the call to action.',
    duration: 15,
  }));

  const theme = selectThemeForAudience(config.audience);

  return {
    title: outline.title,
    author: config.speakerName,
    date: new Date().toISOString().split('T')[0],
    theme,
    slides,
    metadata: {
      totalSlides: slides.length,
      estimatedDuration: slides.reduce((sum, s) => sum + s.duration, 0),
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}

/**
 * Creates a single slide
 */
export function createSlide(options: Partial<Slide> & { order: number }): Slide {
  return {
    id: `slide-${options.order}-${Date.now()}`,
    order: options.order,
    layout: options.layout || 'content',
    title: options.title,
    subtitle: options.subtitle,
    content: options.content,
    bulletPoints: options.bulletPoints,
    imagePrompt: options.imagePrompt,
    code: options.code,
    quote: options.quote,
    speakerNotes: options.speakerNotes || '',
    duration: options.duration || 60,
  };
}

/**
 * Selects appropriate theme based on audience
 */
export function selectThemeForAudience(audience: string): SlideTheme {
  const audienceThemeMap: Record<string, string> = {
    technical: 'tech',
    academic: 'academic',
    business: 'business',
    general: 'minimal',
  };

  return DEFAULT_THEMES[audienceThemeMap[audience] || 'minimal'];
}

/**
 * Suggests layout for content type
 */
export function suggestLayout(content: {
  hasCode?: boolean;
  hasQuote?: boolean;
  hasImage?: boolean;
  bulletCount?: number;
  isSection?: boolean;
  isTitle?: boolean;
}): SlideLayout {
  if (content.isTitle) return 'title';
  if (content.isSection) return 'section_header';
  if (content.hasCode) return 'code';
  if (content.hasQuote) return 'quote';
  if (content.hasImage) return 'image_full';
  if (content.bulletCount && content.bulletCount > 3) return 'two_column';
  if (content.bulletCount) return 'bullet_points';
  return 'content';
}

/**
 * Creates a code slide
 */
export function createCodeSlide(
  order: number,
  title: string,
  code: CodeExample,
  speakerNotes: string
): Slide {
  return createSlide({
    order,
    layout: 'code',
    title,
    code,
    speakerNotes,
    duration: 90, // Code slides typically need more time
  });
}

/**
 * Creates a quote slide
 */
export function createQuoteSlide(
  order: number,
  quoteText: string,
  attribution: string,
  speakerNotes: string
): Slide {
  return createSlide({
    order,
    layout: 'quote',
    quote: { text: quoteText, attribution },
    speakerNotes,
    duration: 45,
  });
}

/**
 * Exports slide deck to specified format
 */
export function exportSlideDeck(
  deck: SlideDeck,
  options: ExportOptions
): ExportResult {
  switch (options.format) {
    case 'markdown':
      return exportToMarkdown(deck, options);
    case 'json':
      return exportToJson(deck, options);
    case 'html':
      return exportToHtml(deck, options);
    default:
      return exportToMarkdown(deck, options);
  }
}

/**
 * Exports to Markdown format
 */
function exportToMarkdown(deck: SlideDeck, options: ExportOptions): ExportResult {
  let md = `# ${deck.title}\n\n`;

  if (deck.author) {
    md += `**Presenter:** ${deck.author}\n`;
  }
  if (deck.date) {
    md += `**Date:** ${deck.date}\n`;
  }
  md += `**Total Slides:** ${deck.metadata.totalSlides}\n\n`;
  md += `---\n\n`;

  deck.slides.forEach((slide, index) => {
    md += `## Slide ${index + 1}`;
    if (slide.title) {
      md += `: ${slide.title}`;
    }
    md += '\n\n';

    md += `*Layout: ${slide.layout}*\n\n`;

    if (slide.subtitle) {
      md += `*${slide.subtitle}*\n\n`;
    }

    if (slide.content) {
      md += `${slide.content}\n\n`;
    }

    if (slide.bulletPoints && slide.bulletPoints.length > 0) {
      slide.bulletPoints.forEach((point) => {
        md += `- ${point}\n`;
      });
      md += '\n';
    }

    if (slide.code) {
      md += `\`\`\`${slide.code.language}\n${slide.code.code}\n\`\`\`\n\n`;
      if (slide.code.explanation) {
        md += `*${slide.code.explanation}*\n\n`;
      }
    }

    if (slide.quote) {
      md += `> ${slide.quote.text}\n`;
      if (slide.quote.attribution) {
        md += `> — ${slide.quote.attribution}\n`;
      }
      md += '\n';
    }

    if (slide.imagePrompt) {
      md += `**[Image suggestion: ${slide.imagePrompt}]**\n\n`;
    }

    if (options.includeNotes && slide.speakerNotes) {
      md += `---\n**Speaker Notes:** ${slide.speakerNotes}\n\n`;
    }

    if (options.includeTimings) {
      md += `*Duration: ${slide.duration} seconds*\n\n`;
    }

    md += `---\n\n`;
  });

  return {
    format: 'markdown',
    content: md,
    filename: `${deck.title.toLowerCase().replace(/\s+/g, '-')}-slides.md`,
    mimeType: 'text/markdown',
  };
}

/**
 * Exports to JSON format (suitable for tools like reveal.js)
 */
function exportToJson(deck: SlideDeck, options: ExportOptions): ExportResult {
  const exportData = {
    ...deck,
    slides: deck.slides.map((slide) => ({
      ...slide,
      speakerNotes: options.includeNotes ? slide.speakerNotes : undefined,
      duration: options.includeTimings ? slide.duration : undefined,
    })),
  };

  return {
    format: 'json',
    content: JSON.stringify(exportData, null, 2),
    filename: `${deck.title.toLowerCase().replace(/\s+/g, '-')}-slides.json`,
    mimeType: 'application/json',
  };
}

/**
 * Exports to HTML format
 */
function exportToHtml(deck: SlideDeck, options: ExportOptions): ExportResult {
  const theme = options.theme || deck.theme;

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${deck.title}</title>
  <style>
    :root {
      --primary-color: ${theme.primaryColor || '#2563eb'};
      --secondary-color: ${theme.secondaryColor || '#1e40af'};
      --font-family: ${theme.fontFamily || 'system-ui, sans-serif'};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-family); line-height: 1.6; }
    .slide {
      min-height: 100vh;
      padding: 4rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-bottom: 1px solid #e5e7eb;
    }
    .slide-title {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: white;
      text-align: center;
    }
    .slide-section-header {
      background: var(--primary-color);
      color: white;
      text-align: center;
    }
    h1 { font-size: 3rem; margin-bottom: 1rem; }
    h2 { font-size: 2.5rem; margin-bottom: 1rem; color: var(--primary-color); }
    .subtitle { font-size: 1.5rem; opacity: 0.9; }
    ul { list-style: none; padding-left: 0; }
    li {
      padding: 0.75rem 0;
      padding-left: 2rem;
      position: relative;
      font-size: 1.25rem;
    }
    li::before {
      content: "•";
      color: var(--primary-color);
      position: absolute;
      left: 0;
      font-size: 1.5rem;
    }
    pre {
      background: #1f2937;
      color: #f9fafb;
      padding: 1.5rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      font-size: 1rem;
    }
    blockquote {
      font-size: 1.75rem;
      font-style: italic;
      border-left: 4px solid var(--primary-color);
      padding-left: 1.5rem;
      margin: 2rem 0;
    }
    .attribution {
      font-size: 1rem;
      opacity: 0.7;
      margin-top: 1rem;
    }
    .speaker-notes {
      margin-top: 2rem;
      padding: 1rem;
      background: #f3f4f6;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      color: #6b7280;
    }
    .slide-number {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      font-size: 0.875rem;
      color: #9ca3af;
    }
    @media print {
      .slide { page-break-after: always; }
      .speaker-notes { display: none; }
    }
  </style>
</head>
<body>
`;

  deck.slides.forEach((slide, index) => {
    const layoutClass =
      slide.layout === 'title'
        ? 'slide-title'
        : slide.layout === 'section_header'
          ? 'slide-section-header'
          : '';

    html += `  <div class="slide ${layoutClass}">\n`;

    if (slide.title) {
      html += `    <h${slide.layout === 'title' ? '1' : '2'}>${escapeHtml(slide.title)}</h${slide.layout === 'title' ? '1' : '2'}>\n`;
    }

    if (slide.subtitle) {
      html += `    <p class="subtitle">${escapeHtml(slide.subtitle)}</p>\n`;
    }

    if (slide.content) {
      html += `    <p>${escapeHtml(slide.content)}</p>\n`;
    }

    if (slide.bulletPoints && slide.bulletPoints.length > 0) {
      html += `    <ul>\n`;
      slide.bulletPoints.forEach((point) => {
        html += `      <li>${escapeHtml(point)}</li>\n`;
      });
      html += `    </ul>\n`;
    }

    if (slide.code) {
      html += `    <pre><code class="language-${slide.code.language}">${escapeHtml(slide.code.code)}</code></pre>\n`;
    }

    if (slide.quote) {
      html += `    <blockquote>${escapeHtml(slide.quote.text)}</blockquote>\n`;
      if (slide.quote.attribution) {
        html += `    <p class="attribution">— ${escapeHtml(slide.quote.attribution)}</p>\n`;
      }
    }

    if (options.includeNotes && slide.speakerNotes) {
      html += `    <div class="speaker-notes">\n`;
      html += `      <strong>Notes:</strong> ${escapeHtml(slide.speakerNotes)}\n`;
      html += `    </div>\n`;
    }

    html += `    <span class="slide-number">${index + 1} / ${deck.slides.length}</span>\n`;
    html += `  </div>\n\n`;
  });

  html += `</body>\n</html>`;

  return {
    format: 'html',
    content: html,
    filename: `${deck.title.toLowerCase().replace(/\s+/g, '-')}-slides.html`,
    mimeType: 'text/html',
  };
}

/**
 * Helper to escape HTML entities
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates slide deck
 */
export function validateSlideDeck(deck: SlideDeck, config: TalkConfig): {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check slide count
  const expectedSlides = config.duration; // ~1 per minute
  if (deck.slides.length > expectedSlides * 1.5) {
    warnings.push(
      `Too many slides (${deck.slides.length}) for ${config.duration}-min talk. Consider consolidating.`
    );
  } else if (deck.slides.length < expectedSlides * 0.5) {
    suggestions.push(
      `Few slides (${deck.slides.length}) for ${config.duration}-min talk. Ensure each has enough content.`
    );
  }

  // Check for slides without titles
  const untitledSlides = deck.slides.filter(
    (s) => !s.title && s.layout !== 'image_full'
  );
  if (untitledSlides.length > 0) {
    suggestions.push(`${untitledSlides.length} slides lack titles`);
  }

  // Check for too many bullet points
  deck.slides.forEach((slide, index) => {
    if (slide.bulletPoints && slide.bulletPoints.length > 6) {
      warnings.push(
        `Slide ${index + 1} has ${slide.bulletPoints.length} bullet points - consider splitting`
      );
    }
  });

  // Check for speaker notes
  const slidesWithoutNotes = deck.slides.filter((s) => !s.speakerNotes);
  if (slidesWithoutNotes.length > deck.slides.length * 0.3) {
    suggestions.push('Many slides lack speaker notes - add notes for better delivery');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions,
  };
}
