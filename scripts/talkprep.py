#!/usr/bin/env python3
"""
TalkPrep AI - Utility Scripts
Provides helper functions for talk preparation calculations and exports.
"""

import json
from dataclasses import dataclass, field, asdict
from typing import Optional
from datetime import datetime


@dataclass
class Section:
    """Represents a section in a talk outline."""
    title: str
    duration_minutes: float
    key_points: list[str] = field(default_factory=list)
    notes: str = ""
    section_type: str = "main"  # intro, main, conclusion, qa


@dataclass
class TalkOutline:
    """Represents a complete talk outline."""
    title: str
    duration_minutes: int
    audience: str
    talk_type: str
    sections: list[Section] = field(default_factory=list)
    learning_objectives: list[str] = field(default_factory=list)
    call_to_action: str = ""


@dataclass
class Slide:
    """Represents a single slide."""
    title: str
    layout: str  # title, bullets, code, quote, image, section_header
    content: list[str] = field(default_factory=list)
    speaker_notes: str = ""
    duration_seconds: int = 60


# Time allocation templates by talk type
TIME_ALLOCATIONS = {
    "keynote": {"intro": 0.15, "main": 0.55, "conclusion": 0.10, "qa": 0.20},
    "technical_deep_dive": {"intro": 0.10, "main": 0.60, "conclusion": 0.10, "qa": 0.20},
    "workshop": {"intro": 0.10, "main": 0.70, "conclusion": 0.10, "qa": 0.10},
    "lightning_talk": {"intro": 0.10, "main": 0.75, "conclusion": 0.15, "qa": 0.0},
    "panel_discussion": {"intro": 0.10, "main": 0.50, "conclusion": 0.10, "qa": 0.30},
}


def calculate_section_timing(
    total_duration: int,
    talk_type: str = "technical_deep_dive"
) -> dict[str, int]:
    """
    Calculate recommended timing for each section based on talk type.

    Args:
        total_duration: Total talk duration in minutes
        talk_type: Type of talk (keynote, technical_deep_dive, workshop, etc.)

    Returns:
        Dictionary with section names and their durations in minutes
    """
    allocations = TIME_ALLOCATIONS.get(talk_type, TIME_ALLOCATIONS["technical_deep_dive"])

    return {
        section: round(total_duration * percentage)
        for section, percentage in allocations.items()
    }


def estimate_word_count(duration_minutes: int, tone: str = "conversational") -> int:
    """
    Estimate word count needed for a given duration.

    Args:
        duration_minutes: Duration in minutes
        tone: Speaking tone (formal, conversational, energetic)

    Returns:
        Estimated word count
    """
    words_per_minute = {
        "formal": 120,
        "conversational": 150,
        "energetic": 170,
    }
    wpm = words_per_minute.get(tone, 150)
    return duration_minutes * wpm


def estimate_slide_count(duration_minutes: int, talk_type: str = "technical_deep_dive") -> int:
    """
    Estimate recommended number of slides.

    Args:
        duration_minutes: Total duration in minutes
        talk_type: Type of talk

    Returns:
        Recommended slide count
    """
    slides_per_minute = {
        "keynote": 0.8,
        "technical_deep_dive": 1.0,
        "workshop": 0.5,
        "lightning_talk": 2.0,
        "panel_discussion": 0.3,
    }
    rate = slides_per_minute.get(talk_type, 1.0)
    return max(3, round(duration_minutes * rate))


def generate_timing_cues(outline: TalkOutline) -> str:
    """
    Generate timing cues for rehearsal.

    Args:
        outline: The talk outline

    Returns:
        Formatted timing cues as a string
    """
    output = [f"# Timing Cues: {outline.title}\n"]
    output.append(f"**Total Duration:** {outline.duration_minutes} minutes\n")

    running_time = 0.0

    for i, section in enumerate(outline.sections, 1):
        start_time = running_time
        end_time = running_time + section.duration_minutes

        output.append(f"\n## {i}. {section.title}")
        output.append(
            f"**Start:** {format_time(start_time)} | "
            f"**End:** {format_time(end_time)} | "
            f"**Duration:** {section.duration_minutes:.0f} min\n"
        )

        if section.key_points:
            point_duration = section.duration_minutes / len(section.key_points)
            for j, point in enumerate(section.key_points):
                point_time = start_time + (j * point_duration)
                output.append(f"- {format_time(point_time)}: {point}")

        running_time = end_time

    return "\n".join(output)


def format_time(minutes: float) -> str:
    """Format minutes as MM:SS."""
    mins = int(minutes)
    secs = int((minutes - mins) * 60)
    return f"{mins:02d}:{secs:02d}"


def create_outline_template(
    title: str,
    duration: int,
    audience: str,
    talk_type: str,
    key_concepts: list[str]
) -> TalkOutline:
    """
    Create an outline template based on talk parameters.

    Args:
        title: Talk title
        duration: Duration in minutes
        audience: Target audience
        talk_type: Type of talk
        key_concepts: List of key concepts to cover

    Returns:
        TalkOutline with template sections
    """
    timing = calculate_section_timing(duration, talk_type)

    sections = [
        Section(
            title="Introduction",
            duration_minutes=timing["intro"],
            key_points=["Hook/attention grabber", "Why this matters", "What you'll learn"],
            section_type="intro"
        )
    ]

    # Distribute key concepts across main sections
    main_duration = timing["main"]
    num_main_sections = min(4, max(2, len(key_concepts)))
    section_duration = main_duration / num_main_sections

    for i in range(num_main_sections):
        concept_idx = i if i < len(key_concepts) else 0
        sections.append(Section(
            title=f"Section {i + 1}: {key_concepts[concept_idx] if key_concepts else 'Main Point'}",
            duration_minutes=section_duration,
            key_points=[key_concepts[concept_idx]] if concept_idx < len(key_concepts) else [],
            section_type="main"
        ))

    sections.append(Section(
        title="Conclusion",
        duration_minutes=timing["conclusion"],
        key_points=["Summary of key points", "Call to action", "Memorable closing"],
        section_type="conclusion"
    ))

    if timing["qa"] > 0:
        sections.append(Section(
            title="Q&A",
            duration_minutes=timing["qa"],
            key_points=["Prepared for common questions"],
            section_type="qa"
        ))

    return TalkOutline(
        title=title,
        duration_minutes=duration,
        audience=audience,
        talk_type=talk_type,
        sections=sections,
        learning_objectives=key_concepts[:3] if key_concepts else []
    )


def export_outline_markdown(outline: TalkOutline) -> str:
    """Export outline as Markdown."""
    lines = [
        f"# {outline.title}\n",
        f"**Duration:** {outline.duration_minutes} minutes",
        f"**Audience:** {outline.audience}",
        f"**Type:** {outline.talk_type.replace('_', ' ').title()}\n",
    ]

    if outline.learning_objectives:
        lines.append("## Learning Objectives\n")
        for obj in outline.learning_objectives:
            lines.append(f"- {obj}")
        lines.append("")

    lines.append("## Outline\n")

    for i, section in enumerate(outline.sections, 1):
        lines.append(f"### {i}. {section.title} ({section.duration_minutes:.0f} min)\n")
        for point in section.key_points:
            lines.append(f"- {point}")
        if section.notes:
            lines.append(f"\n*Notes: {section.notes}*")
        lines.append("")

    if outline.call_to_action:
        lines.append(f"## Call to Action\n\n{outline.call_to_action}")

    return "\n".join(lines)


def export_outline_json(outline: TalkOutline) -> str:
    """Export outline as JSON."""
    data = asdict(outline)
    data["generated_at"] = datetime.now().isoformat()
    return json.dumps(data, indent=2)


def generate_slide_template(outline: TalkOutline) -> list[Slide]:
    """
    Generate slide templates from an outline.

    Args:
        outline: The talk outline

    Returns:
        List of slide templates
    """
    slides = []

    # Title slide
    slides.append(Slide(
        title=outline.title,
        layout="title",
        content=[outline.audience, f"{outline.duration_minutes} minutes"],
        speaker_notes="Welcome the audience. Wait for attention.",
        duration_seconds=30
    ))

    for section in outline.sections:
        # Section header
        slides.append(Slide(
            title=section.title,
            layout="section_header",
            speaker_notes=f"Transition to {section.title}. {section.notes}",
            duration_seconds=15
        ))

        # Content slides for key points
        if section.key_points:
            slides.append(Slide(
                title=section.title,
                layout="bullets",
                content=section.key_points,
                speaker_notes=f"Cover: {', '.join(section.key_points[:3])}",
                duration_seconds=int(section.duration_minutes * 60 / max(1, len(section.key_points)))
            ))

    # Closing slide
    slides.append(Slide(
        title="Thank You",
        layout="title",
        content=[outline.call_to_action or "Questions?"],
        speaker_notes="Thank the audience. Open for questions.",
        duration_seconds=15
    ))

    return slides


def export_slides_markdown(slides: list[Slide], title: str) -> str:
    """Export slides as Markdown."""
    lines = [f"# {title} - Slides\n"]

    for i, slide in enumerate(slides, 1):
        lines.append(f"## Slide {i}: {slide.title}")
        lines.append(f"*Layout: {slide.layout}*\n")

        if slide.content:
            for item in slide.content:
                lines.append(f"- {item}")
            lines.append("")

        lines.append(f"**Speaker Notes:** {slide.speaker_notes}")
        lines.append(f"**Duration:** {slide.duration_seconds} seconds\n")
        lines.append("---\n")

    return "\n".join(lines)


def export_slides_html(slides: list[Slide], title: str) -> str:
    """Export slides as standalone HTML."""
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{ font-family: system-ui, sans-serif; line-height: 1.6; }}
        .slide {{
            min-height: 100vh;
            padding: 4rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            border-bottom: 2px solid #e5e7eb;
            page-break-after: always;
        }}
        .slide-title {{ background: #1e40af; color: white; text-align: center; }}
        .slide-section_header {{ background: #3b82f6; color: white; text-align: center; }}
        h1 {{ font-size: 3rem; margin-bottom: 1rem; }}
        h2 {{ font-size: 2rem; margin-bottom: 1rem; color: #1e40af; }}
        ul {{ list-style: none; padding-left: 0; }}
        li {{ padding: 0.75rem 0; font-size: 1.25rem; }}
        li::before {{ content: "→ "; color: #3b82f6; }}
        .notes {{ margin-top: 2rem; padding: 1rem; background: #f3f4f6; border-radius: 0.5rem; font-size: 0.875rem; }}
        @media print {{ .notes {{ display: none; }} }}
    </style>
</head>
<body>
"""

    for slide in slides:
        layout_class = f"slide-{slide.layout}" if slide.layout in ["title", "section_header"] else ""
        html += f'    <div class="slide {layout_class}">\n'
        html += f'        <h{"1" if slide.layout == "title" else "2"}>{slide.title}</h{"1" if slide.layout == "title" else "2"}>\n'

        if slide.content:
            html += '        <ul>\n'
            for item in slide.content:
                html += f'            <li>{item}</li>\n'
            html += '        </ul>\n'

        html += f'        <div class="notes"><strong>Notes:</strong> {slide.speaker_notes}</div>\n'
        html += '    </div>\n'

    html += "</body>\n</html>"
    return html


# Example usage and demonstration
if __name__ == "__main__":
    # Create a sample outline
    outline = create_outline_template(
        title="Building Scalable APIs with GraphQL",
        duration=30,
        audience="technical",
        talk_type="technical_deep_dive",
        key_concepts=[
            "Why GraphQL over REST",
            "Schema design patterns",
            "Performance optimization",
            "Real-world lessons"
        ]
    )

    print("=== Outline (Markdown) ===\n")
    print(export_outline_markdown(outline))

    print("\n=== Timing Cues ===\n")
    print(generate_timing_cues(outline))

    print("\n=== Estimates ===")
    print(f"Recommended slides: {estimate_slide_count(30, 'technical_deep_dive')}")
    print(f"Target word count: {estimate_word_count(30, 'conversational')}")

    # Generate slides
    slides = generate_slide_template(outline)
    print(f"\nGenerated {len(slides)} slides")
