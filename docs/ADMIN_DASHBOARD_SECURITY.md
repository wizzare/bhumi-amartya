# Admin Dashboard Security Notes

## MVP Scope
- Admin access in this MVP is local and client-side only.
- This approach is not secure for production environments.
- The current rule is intended for soft launch and internal dev usage only.

## Production Requirement
- Production must use Firebase custom claims or server-side role checks.
- Role decisions must not rely on client-side localStorage values.
- Access to admin routes should be validated on the server.

## Data Privacy
- Admin dashboard must never expose raw journal content.
- Admin analytics should use aggregated summaries only.
- Sensitive innerwork text must remain private to the user context.

## Soft Launch Guidance
- LocalStorage admin controls are for development and soft launch only.
- Before public release, migrate admin authorization and analytics access to secure backend enforcement.
