# SPRINT 1 - LIANA V3 FINAL STATUS

## COMPLETE

* Yoga Save Fix
* Workout Save Fix
* Dashboard Humanization
* Dynamic Share Card
* TypeScript Fix
* ESLint Pass
* TypeScript Pass

## BLOCKED

* Lemurian Integration
  Reason:
  Dataset / protocol not available in repository.

## PRIORITY 4 - MONETIZATION & PRODUCTION GROWTH

### Google Play Billing & Monetization Foundation

Status:

BACKLOG / POST-PRODUCTION ACCESS

Execution rule:

Do not implement billing before:

1. Production access is approved.
2. Current LIANA stabilization bugs are resolved.
3. First production release is stable as a free app.
4. Billing has been documented, reviewed, and tested on non-production tracks.

Scope:

Implement Google Play Billing only for digital products consumed or unlocked inside the app.

Billing-required product examples:

1. Premium monthly/yearly subscription.
2. Unlock premium in-app features.
3. Paid meditation/audio healing content inside the app.
4. Paid digital reflection/journaling modules inside the app.
5. Any in-app digital unlock, token, or premium access.

Outside Play Billing / off-app service examples:

1. Manual PDF blueprint reading via WhatsApp/form.
2. 1:1 consultation or coaching via WhatsApp/Zoom.
3. Human-delivered advisory service outside the app.
4. Off-app donation, as long as it does not unlock digital in-app content.

Implementation TODO:

1. Set up Play Console merchant/payment profile.
2. Add and verify bank payout account.
3. Complete tax information if requested by Google.
4. Define monetization model: subscription product, one-time in-app product, and free vs premium feature boundary.
5. Create products/subscriptions in Play Console.
6. Integrate Google Play Billing Library.
7. Implement purchase flow.
8. Validate purchase token securely.
9. Unlock entitlement only after valid purchase.
10. Handle subscription lifecycle: active, renewal, grace period if applicable, canceled, expired, refunded, chargeback.
11. Add restore purchase behavior.
12. Add clear premium state in user profile/account.
13. Add payout tracking notes: transactions/refunds/chargebacks from the 1st to end of month are generally paid around the 15th of the following month.
14. Test billing on internal/closed testing track before production rollout.
15. Do not expose paid features until billing behavior is verified.

Guardrails:

* Do not redesign the app.
* Do not alter KARA behavior.
* Do not add a new payment provider for in-app digital goods.
* Do not route in-app digital unlocks to WhatsApp, bank transfer, donation, or external payment links.
* Do not mix manual services and in-app digital products in the same entitlement logic.
* Do not make billing a blocker for the first production release.
* Keep app free first until production access and stabilization are complete.
