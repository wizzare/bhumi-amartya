# Future Feature: Daily Innerwork Reminder Notification

## Purpose

If user has not opened the app today and has not completed any innerwork activity today, send a push notification.

## Activities Counted As Innerwork

- Journal entry
- Meditation practice
- Audio healing reflection

## Notification Copy

"Hai, kamu baik-baik aja? Hari ini belum innerwork dan grounding ya? Yuk login."

## Rules

- Send max once per day.
- Do not send if user already opened app today.
- Do not send if user completed journal/meditation/audio healing today.
- User must opt in to notifications.
- Future implementation may use:
  - Web Push Notification
  - Firebase Cloud Messaging
  - Mobile app push notification
  - Scheduled backend job / n8n workflow

## Implementation Note

Do not implement push notification now. Documentation only.
