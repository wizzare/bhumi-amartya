MOANA V3 EXECUTION MODE

PROJECT:
Bhumi Amartya

STATUS:
Production Application
Google Play Released

========================================
SOURCE OF TRUTH (HIGHEST PRIORITY)
========================================

1. KARA Source of Truth
2. MOANA V3 Source of Truth
3. Existing Production Behavior
4. Existing Firestore Data Model

Never replace the Source of Truth with generic SaaS best practices.

If there is a conflict:

KARA / MOANA SoT ALWAYS WINS.

========================================
PRIMARY MISSION
========================================

Build a stable production application.

Priority:

1.
Stability

2.
Consistency

3.
Personalization

4.
Retention

5.
Growth

Never reverse this order.

========================================
WORKFLOW
========================================

For EVERY task:

STEP 1

Audit

↓

STEP 2

Compare against KARA SoT

↓

STEP 3

Find regression

↓

STEP 4

Fix ONLY proven root cause

↓

STEP 5

Runtime verification

↓

STEP 6

Report

Never:

Guess

Invent

Redesign

========================================
DO NOT CREATE
========================================

Do NOT create:

new architecture

new save pipeline

new badge system

new billing flow

new premium engine

new dashboard engine

new memory engine

new Journey engine

unless explicitly approved.

========================================
PRODUCTION PRINCIPLE
========================================

Build PASS

is NOT

Runtime PASS

TypeScript PASS

is NOT

Production PASS

Play Store Release

is NOT

User Validation

PASS only exists when:

Real Android

↓

Real Firebase

↓

Real User

↓

Feature Works

========================================
SAVE PIPELINE
========================================

The canonical pipeline is:

User Action

↓

Save

↓

Firestore

↓

Journey

↓

Dashboard

↓

Refleksi Jiwa

↓

Catatan Hari Ini

↓

Manifestasi

↓

AI Memory

If any stage fails,

the pipeline FAILS.

Never audit pages separately.

Always audit the entire pipeline.

========================================
SECTION 4
========================================

The following MUST behave identically:

Meditation

Journaling

Yoga

Workout

Audio Healing

Healthy Food

Herbal

Manifestasi

All use ONE canonical save pipeline.

Never let one page diverge.

========================================
JOURNEY
========================================

Journey is the heart of MOANA.

Every save must:

update Journey

update Progress Today

persist after refresh

persist after logout/login

No fallback when records exist.

========================================
AI MEMORY
========================================

Memory is NOT allowed to break Save.

Correct order:

Save

↓

Journey

↓

Success to User

↓

Memory Update

If Memory fails:

Journey still succeeds.

Save still succeeds.

========================================
DAILY INTELLIGENCE
========================================

Dashboard

Refleksi Jiwa

Catatan Hari Ini

Manifestasi

must always be generated from:

Journey

Blueprint

Current Environment

Time Window

Today's Context

Never produce static daily text.

========================================
ENVIRONMENT
========================================

Environment changes every 6 hours.

Morning

Afternoon

Evening

Night

must influence:

Dashboard

Refleksi Jiwa

Catatan Hari Ini

Manifestasi

Wellness Recommendation

Future versions:

Meditation recommendation

Workout recommendation

Journaling recommendation

Food recommendation

based on time.

========================================
BLUEPRINT
========================================

Supported systems:

Life Path

Human Design

Natal Chart

Destiny Matrix

MBTI

BaZi

Weton

Tzolkin

Never remove existing calculations.

========================================
SUBSCRIPTION
========================================

IMPORTANT

Do NOT replace Bhumi's business model.

Bhumi uses:

Badge

Plan

Membership

Trial

AccessUntil

These are

SERVER OWNED.

Client NEVER owns:

badge

plan

membership

trial

accessUntil

subscriptionStatus

isPremium

entitlements

========================================
BADGE SOURCE OF TRUTH
========================================

Existing categories:

Founder

Penjaga Bhumi Inti

Penjaga Bhumi Alfa

Penjaga Bhumi

Tester 2 Bulan

Tester 1 Bulan

New User (3 Hari)

Expired

Do NOT invent new badge categories.

Do NOT replace with generic Premium/Free model.

========================================
GOOGLE PLAY BILLING
========================================

Billing is ONLY payment.

Billing NEVER decides access.

Correct flow:

Purchase

↓

Backend Verification

↓

Server updates:

badge

plan

membership

accessUntil

↓

Client reads

↓

Feature unlocked

Never let client unlock itself.

========================================
TRIAL
========================================

Business Rule:

Starting July 1

New User

↓

3-day Trial

Existing testers

keep their badge.

Founder

always full access.

========================================
SECURITY
========================================

Firestore owns:

badge

plan

membership

trial

trialEndsAt

accessUntil

subscriptionStatus

Client may NEVER write these.

========================================
RETENTION
========================================

Future roadmap:

Daily Reminder

Weekly Insight

Monthly Journey

Achievement

Streak

Rating

Referral

Only after stability.

========================================
RATING
========================================

Never ask for rating randomly.

Preferred trigger:

Journey ≥ 7 days

Login ≥ 10

Refleksi Jiwa ≥ 3

Dashboard ≥ 5

Positive usage

Unhappy users

↓

Feedback

Happy users

↓

Google Play Review

========================================
REPORTING
========================================

Never write:

Probably

Likely

Should work

Looks correct

Instead:

PASS

FAIL

ROOT CAUSE

Evidence

Runtime Proof

========================================
FINAL RELEASE RULE
========================================

READY FOR RELEASE only if:

✓ Save works

✓ Journey works

✓ Dashboard reads Journey

✓ Refleksi Jiwa changes

✓ Catatan Hari Ini changes

✓ Manifestasi changes

✓ AI Memory updates

✓ Firestore rules verified

✓ Badge rules verified

✓ Trial verified

✓ Billing safe

✓ Runtime verified

✓ Real Android verified

✓ Real Firebase verified

✓ Real User verified

Otherwise:

NOT READY.

Never override this rule.
