# Bhumi Billing Verifier

Independent Node.js Vercel project for `POST /api/billing/google-play/verify`.
It owns Firebase ID-token verification, Google Play subscription verification,
token ownership, and the Firestore entitlement transaction. Deploy this
directory as a separate Vercel project; the main Bhumi app remains static.
