# Innerwork Inventory

Audit date: 19 June 2026  
Scope: rendered Innerwork hub, module pages, dashboard entry points, and active recommendation runtime.

## Runtime surfaces

| Module | Category | UI location | Trigger condition | CTA / completion | Runtime source |
|---|---|---|---|---|---|
| Journaling | Reflection | `/innerwork/journaling` and static hub menu | Always available from hub; access/profile guards apply | Start module; save journal after writing | Local journal prompt or profile/blueprint journal engine; journal and emotional-memory repositories |
| Meditation | Regulation | `/innerwork/meditation` and static hub menu | Always available from hub | Select practice; save completion | Static meditation practice content and completion repository |
| Audio Healing | Regulation | `/innerwork/audio-healing` and static hub menu | Always available; feature access may lock it | Open playlist; save reflection | One fixed playlist plus local reflection helper; daily state records completion |
| Manifestasi | Intention | `/innerwork/manifestasi` and static hub menu | Always available from hub | Save manifestation | Today's `DailyGuidance.manifestation`; local generic fallback when absent |
| Workout | Movement | `/innerwork/workout` and static hub menu | Always available from hub | Select any exercises; Save | Entire static workout database plus variation library |
| Yoga | Movement | `/innerwork/yoga` and static hub menu | Always available from hub | Select any practices; Save | Entire static yoga database |
| Herbal / Healthy Food | Physical support | `/innerwork/herbal` and static hub menu | Always available from hub | Select any items; Save | Entire static healthy-food database plus variation library |
| Today's recommendations | Mixed | Top area of `/innerwork` | `DailyGuidance.innerworkRecommendations` exists and daily scan is considered complete | Open recommended module | Cached Daily Guidance; local recommendation engine when AI guidance is unavailable |
| Daily-scan prompt | Entry gate | `/innerwork` | Recommendations exist but daily scan is not completed today | `Isi Scan Jiwa Hari Ini` | Profile `lastAssessmentAt`; not the current scan result |

## Important UI boundary

The seven module tiles are a library menu, not personalized recommendations. They remain visible regardless of profile, wellness condition, Navigator mode, journey progress, Astro, or Catatan.

`InnerworkTodayCard`, `DailyInnerwork`, and `CompiledInnerworkCard` exist as components, but they are not the active Innerwork system in the current dashboard flow. The dashboard proceeds from Catatan to the general journey/action guide, while the recommendation experience lives separately at `/innerwork`.

## Inventory conclusion

The product contains useful practice modules, but “module exists” and “module was selected for this user today” are currently separate realities.
