# Gentle Night Reminder

## Purpose

Bhumi schedules one local Android notification for 21:00 device time when the app has not been opened that day.

## Current Implementation

- Uses Capacitor Local Notifications; no remote push service is required.
- App launch or resume stores `lastOpenedAt` and local `lastOpenedDate` in Capacitor Preferences with a localStorage fallback.
- App launch or resume cancels notification ID `2100` for the current day and schedules the next reminder for tomorrow at 21:00 local device time.
- Opening the app on the scheduled day cancels that night's reminder and moves it to the following night.
- Notification permission is requested at most once automatically. A denial does not block app usage and is remembered locally.

## Notification Copy

Title: "Bhumi menunggumu sebentar"

Body: "Ambil satu menit untuk menyapa dirimu malam ini."

## Rules

- Maximum once per day through the fixed notification ID `2100`.
- Reminder eligibility is based on app open/resume, not innerwork completion.
- Scheduling uses the device's local timezone.
- Permission denial is handled silently after the first request.

## Verification

Inspect pending notifications with Android Studio or `adb shell dumpsys alarm` and filter for the application package or notification ID `2100`.
