# MOANA V64 Founder Dashboard Redesign Report

## Status

PARTIAL PASS.

Founder Dashboard UI and aggregation logic were redesigned in `app/admin/activity/page.tsx`.
The runtime Firestore failure reported as `Gagal memuat Founder Dashboard dari Firestore.` was addressed by:

- adding minimal Firestore rules for existing `analytics` and `user_activity` collections
- changing dashboard loading to tolerate partial Firestore source failures
- surfacing per-source status for `users`, `user_activity`, and `analytics`

## Implemented Widgets

- Founder Health Overview: Total User, DAU, MAU, Premium Member
- Business Metrics: Retention D1, Retention D7, Free to Premium Conversion, Play Store Rating as `No data`
- Acquisition Funnel: New Install to Finish Daily Practice
- Cohort Retention table: daily cohorts with D1, D3, D7
- Churn Dashboard: inactive 1, 3, 7, 14, 30 days
- Founder Alert: generated only from available Firestore analytics/activity data
- AI Founder Insight: deterministic executive summary from available data only
- Location Analytics: aggregate country/province/city/timezone only, no raw GPS
- Top Features: ranked feature usage for the selected day
- User Table: search, filter, sort, and row click detail
- Detail User modal: identity, blueprint summary, user journey, navigation flow, device/location
- Export controls: XLSX, CSV, PDF print view
- Date Range controls: Today, Yesterday, Last 7 Days, Last 30 Days, Custom

## Data Sources

- `users`: total users, premium status, registration date, active days, last login/seen, app version, status, aggregate location fields
- `user_activity`: DAU source fallback, first login source, activity dates, app version/session fields when present
- `analytics`: funnel, feature usage, alerts, retention/cohort activity dates, user journey detail
- `blueprints/{uid}`: user detail blueprint summary only when Founder opens a user

## Metrics Formulas

- Total User: count of readable `users` documents, excluding QA delete test users
- DAU: unique users active on selected end date from `analytics`, `user_activity`, or `users.participationMetrics.activeDays`
- MAU: unique users active in the 30-day window ending on selected end date
- Premium Member: users with `isPremium`, premium membership fields, Founder/Inti/Alfa badge markers
- Conversion: premium users divided by total users
- Retention D1/D7: users whose first observed activity date has activity again on day +1 / day +7
- Cohort Retention: first observed activity date cohort, retained on D1/D3/D7
- Churn: users whose last seen timestamp is at least 1/3/7/14/30 days old
- Funnel: unique users per mapped event step for selected day; conversion is current step divided by previous step

## Firestore Collections Used

- `users`
- `user_activity`
- `analytics`
- `blueprints`

No new Firestore collections were introduced.

## Firestore Rules Update

Added rules for existing collections:

- `analytics`: signed-in users can create own/null-uid events; Founder/Admin can read/update/delete
- `user_activity`: signed-in users can create/update own activity; owner or Founder/Admin can read

This is required because the dashboard now reads the existing analytics collections directly.

## Screenshots

- `screenshots/moana-v64-founder-dashboard.png`

Screenshot captured in an unauthenticated browser, showing the Founder access gate remains intact.

## Export Verification

- CSV export implemented with escaped values.
- XLSX export implemented as a browser-generated minimal OpenXML workbook.
- PDF export implemented as a print-ready browser document.

Full authenticated click verification was not completed because the browser session available to automation was not logged in as Founder.

## Performance Impact

- Dashboard performs one `users` read plus date-range bounded reads for `user_activity` and `analytics`.
- Blueprint reads are lazy and only happen when opening a user detail modal.
- Aggregation runs client-side over the loaded range and does not create duplicate analytics data.

## Verification

- `npx tsc --noEmit`: PASS
- `GET http://localhost:3000/admin/activity`: PASS, HTTP 200
- `npm run build`: FAIL after successful compile and TypeScript, blocked by missing Firebase public environment variables while collecting page data for `/api/kenali-diri/aura`

Build blocker:

`Missing Firebase public environment variables: apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId.`

## Known Limitations

- Play Store Rating remains `No data` because no rating collection/API exists in the current dashboard data path.
- Founder Alert and AI Founder Insight only use available local Firestore analytics/activity data; unavailable source status is shown in the UI.
- Live production fix requires deploying updated `firestore.rules`.
- Authenticated Founder screenshot/export click QA still needs a logged-in Founder browser session.
