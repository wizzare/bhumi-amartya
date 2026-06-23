# KARA Final Expected Features (Audit Baseline)

This document lists the major visual and functional changes that should be present in the KARA Final build (Build 51) but are reported missing in the current installation.

## 1. Global Gatekeeper & Security
- **Root-Level Version Check**: `VersionChecker` migrated to `RootLayout`. App should block access *before* Dashboard if Build < Min.
- **Privileged User Bypass**: Hardcoded bypass for `wizzare@gmail.com` and roles `founder`/`admin`.

## 2. Wellness V3
- **V3 Baseline**: Mandatory baseline assessment with `V3_BASELINE` versioning.
- **Daily Check-in**: Redesigned `WellnessCheckInCard` with mood selection.
- **Module Cleanup**: No "Update Available" screens inside the Wellness module (migrated to global).

## 3. Destiny Matrix Recovery
- **Node Parity**: Correct secondary parents for nodes `BM25` through `BM32`.
- **Channel Mapping**: Father/Mother Lines mapped as full lineage channels (7 nodes) rather than simple endpoints.
- **Love & Money Channels**: Relationship/Financial channels connecting from Center Arcana.

## 4. Profile & Identitas Jiwa
- **Identitas Jiwa Hub**: New UI section with 8 distinct icons (Life Path, Destiny Matrix, Human Design, etc.).
- **Gudang Identitas Jiwa**: Grid layout for exploration of deep identity layers.

## 5. Metadata
- **Version**: 3.1.10-RC
- **Build Number**: 51
- **Sprint**: KARA RC FINAL
