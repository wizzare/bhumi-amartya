# INNERWORK GUDANG IDENTITAS USAGE

Verifying the consumption of the "Profile V4 Human Meaning" layer.

| Identitas Item | Used? | Evidence in `app/innerwork/page.tsx` |
|---|---|---|
| **Shadow Patterns** | **YES** | `meaning?.shadow.sabotage` used in `deriveCurrentIssue`. |
| **Money Block** | **YES** | `meaning?.shadow.moneyBlock` scanned for keywords. |
| **Love Block** | **YES** | `meaning?.shadow.loveBlock` scanned for keywords. |
| **Relationship Pattern**| **YES** | `meaning?.relationships.boundaries` scanned for keywords. |
| **Career Pattern** | **NO** | Talent-specific work patterns are not yet mapped to practices. |
| **Boundary Pattern** | **YES** | Keywords like "batas" or "sulit berkata tidak" trigger specific issues. |

**Evidence:** The `deriveCurrentIssue` function explicitly scans the `profileText` (concatenated from Human Meaning blocks) to determine whether the user is facing "Over Responsibility", "Need for Boundaries", or "Achievement Worth".
