# Bhumi Amartya Product and Interface Design

## 1. Purpose and Scope

This document describes the current committed V4 / Build 80 product and interface design. It is derived from the committed repository code and existing canonical documentation. Roadmap V5 design concepts are not represented as current implementation.

## 2. Product Experience Principles

The following principles are evidenced by the current product implementation:

- **Reflection and self-knowledge:** Dashboard, Profile, and Blueprint features emphasize personal insight and understanding rather than task completion.
- **Calm and accessible interaction:** Earth-tone color palette, serif headings, generous spacing, minimal visual noise.
- **Progressive disclosure:** Blueprint results are shown immediately where data exists; loading and pending states are distinct; partial insight is rendered rather than hidden behind Coming Soon.
- **User ownership of personal data:** Profile and Blueprint data is user-created and user-owned; no external sharing without explicit action.
- **Clarity between guidance and deterministic data:** Daily Guidance is presented as reflective content, while Blueprint systems (Life Path, Human Design, etc.) are presented as calculated deterministic results with their own interpretive frameworks.

## 3. Information Architecture

### Implemented areas

| Route/Area | Purpose | Status |
|---|---|---|
| `/` (Landing) | Application entry, call to action | COMMITTED |
| `/setup` | Profile creation, birth data input | COMMITTED |
| `/dashboard` | Main experience: guidance, profile snapshot, daily reflection | COMMITTED |
| `/profile` | Detailed Blueprint display and personal data | COMMITTED |
| `/journey` | Growth journey tracking and learning | COMMITTED |
| `/wellness` | Wellness check-in, assessments, inner work | COMMITTED |
| `/inbox` | User-Admin communication | COMMITTED |
| `/settings` | Application settings | COMMITTED |
| `/premium-bhumi` | Premium subscription page | COMMITTED |
| `/admin/activity` | Founder/Admin dashboard | COMMITTED |

### Navigation

Main navigation is handled via bottom tab bar or header links depending on the route. Dashboard serves as the primary hub. Profile, Journey, Wellness, and Inbox are accessible from the navigation structure. Admin routes are separate and require Founder/Admin authorization.

## 4. UI Architecture

- **Page components** (`app/`): App Router pages with server/client component split. Pages own route-level data loading and orchestration.
- **UI components** (`components/`): Presentational and container components. Shared UI primitives in `components/ui/`.
- **State ownership:** Auth state via `context/AuthContext.tsx`. Page-level and component-level React state. No global state management library.
- **Loading states:** Skeleton loaders, spinner indicators, distinct empty states.
- **Error states:** Error boundaries at route level, inline error messaging for forms.
- **Responsive behavior:** Tailwind breakpoints for mobile-first responsive layout.

## 5. Visual System

| Element | Implementation | Status |
|---|---|---|
| Typography | Serif headings, sans-serif body, Tailwind configuration | COMMITTED |
| Color palette | Earth tones (greens, warm browns, creams, golds) via Tailwind | COMMITTED |
| Cards | Rounded, bordered containers with subtle shadows | COMMITTED |
| Icons | Lucide React icon library | COMMITTED |
| Spacing | Tailwind spacing scale, generous whitespace | COMMITTED |
| Dark mode | Not implemented | NOT VERIFIED |
| Design tokens | Tailwind config, no custom design token system | PARTIAL |

## 6. Interaction Patterns

| Pattern | Implementation | Status |
|---|---|---|
| Navigation | Bottom tab bar, header links, back navigation | COMMITTED |
| Form handling | Controlled React inputs, validation messages | COMMITTED |
| Async loading | Loading spinners, skeleton placeholders | COMMITTED |
| Empty states | Distinct empty state messaging per feature | COMMITTED |
| Error states | Error boundary, inline form errors, toast messages | COMMITTED |
| Confirmations | Modal dialogs for destructive actions | COMMITTED |
| Modal/Dialog | Overlay modal with backdrop click-to-close | COMMITTED |

## 7. Accessibility

| Area | Status | Notes |
|---|---|---|
| Semantic HTML | PARTIAL | Not systematically audited |
| ARIA attributes | PARTIAL | Used in some interactive components |
| Keyboard navigation | PARTIAL | Basic form navigation works |
| Focus management | PARTIAL | Modal focus trapping implemented |
| Color contrast | NOT VERIFIED | No formal contrast audit |
| Screen reader | NOT VERIFIED | No screen reader testing evidence |
| Text scaling | PARTIAL | Responsive layout scales text |

No formal WCAG compliance has been verified.

## 8. Android-Specific Design

| Area | Status |
|---|---|
| Capacitor WebView shell | COMMITTED |
| targetSdk 36 | COMMITTED (build verified) |
| Runtime Android 16 QA | PENDING |
| Edge-to-edge | NOT VERIFIED — may require viewport-fit=cover and safe-area CSS |
| Predictive back | NOT VERIFIED — may require testing |
| Keyboard insets | NOT VERIFIED on API 36 |
| Orientation | Config changes declared in manifest |
| Tablet/split-screen | NOT VERIFIED — hardwareAccelerated=true, resizeableActivity default |

## 9. Admin Dashboard Design

| Area | Implementation |
|---|---|
| User table | Sortable, searchable, paginated table of all users |
| Metrics cards | Total users, DAU/WAU/MAU, retention, funnel, features |
| Detail modal | User identity, activity, blueprint, membership detail |
| Personal messaging | Admin-to-user direct messaging from detail modal |
| Internal-account exclusion | Email-based exclusion filters users, activities, and analytics before aggregation |

Admin exclusion is display/aggregation filtering. It does not delete data and does not replace Firestore Rules authorization.

## 10. Design Verification Status

| Area | Implemented | Runtime Verified | Status |
|---|---|---|---|
| Core navigation | YES | PARTIAL | COMMITTED |
| Dashboard | YES | PARTIAL | COMMITTED |
| Profile | YES | PARTIAL | COMMITTED |
| Journey | YES | PARTIAL | COMMITTED |
| Wellness | YES | PARTIAL | COMMITTED |
| Inbox | YES | PARTIAL | COMMITTED |
| Settings | YES | PARTIAL | COMMITTED |
| Admin Dashboard | YES | PARTIAL (exclusion logic test-verified) | INTEGRATED |
| Android rendering | YES | Android 16 PENDING | BUILD VERIFIED |

## 11. Known Design Gaps

- Android 16 edge-to-edge and predictive back behavior not verified
- No formal accessibility audit
- No formal design token system
- No dark mode
- Admin exclusion runtime/dashboard behavior not fully verified in production

## 12. V5 Design Boundary

Future redesigns, localization, dark mode, formal design token system, and accessibility audit are V5 roadmap items unless committed in Build 80 scope.