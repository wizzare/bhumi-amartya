# Innerwork Personalization Audit

Audit date: 19 June 2026  
Test users: Widhi, Ning, Widya, Amartya, Eva

## Output comparison

| User | Static hub/modules | Local recommendation fallback | AI recommendation |
|---|---|---|---|
| Widhi | Same library | Empty object | Potentially different, but dependent on cached AI output |
| Ning | Same library | Empty object | Potentially different, but dependent on cached AI output |
| Widya | Same library | Empty object | Potentially different, but dependent on cached AI output |
| Amartya | Same library | Empty object | Potentially different, but dependent on cached AI output |
| Eva | Same library | Empty object | Potentially different, but dependent on cached AI output |

The five-user comparison is deterministic for the two locally inspectable paths:

1. Every user can see the same complete static practice library.
2. Every user passed through the current local recommendation engine receives the same invalid result: `{}`.

The AI prompt contains many personalization inputs, so an AI-generated Daily Guidance document may vary. However, that variation is neither guaranteed by the UI nor protected by a working deterministic fallback. Cached outputs also cannot prove that the currently identified Catatan issue caused the selected practice.

## Distinguishability test

Without names, a reader cannot reliably distinguish Widhi from Ning, Widya, Amartya, or Eva from the hub or library pages. Differences may appear in generated journaling or manifestation content, but not as a coherent recommendation-system guarantee.

## Verdict

**FAIL**

Personalization is optional and path-dependent, rather than an invariant of Innerwork.
