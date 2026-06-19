# Innerwork Why Bhumi Flow

## What Bhumi notices

Renderer: `currentIssue.notices`.

Source: static text returned by local `issueNarrative(issueKey)`.

## Why it matters

Renderer: `currentIssue.matters`.

Source: static text from the same issue record.

## Why practice was chosen

The third paragraph is always the same literal sentence:

“Karena itulah Bhumi mengajakmu kembali ke latihan sederhana yang membantu batinmu menemukan ritme yang lebih stabil.”

It does not cite the selected practice, recommendation reason, or actual mapping decision.

## Decision inputs

The issue key can be influenced by:

- Human Meaning keyword matches first;
- then Navigator mode or today’s mood/energy;
- then a default.

The Why copy itself is not dynamically generated from those values. Inputs select one member of a static narrative catalog.

## Answer

“Kenapa Bhumi” is a static issue narrative selected by dominant-issue rules. It is not generated from the chosen practice. Navigator and wellness can select an issue only if no higher-priority Human Meaning regex already matched.

