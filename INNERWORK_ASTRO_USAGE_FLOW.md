# Innerwork Astro Usage Flow

## Direct Innerwork page use

None. The page imports no moon, transit, awareness, eclipse, Vedic timing, BaZi timing, Tzolkin timing, or Weton engine.

## Indirect paths

1. Natal blueprint fields can influence Human Meaning and therefore profile-keyword issue selection.
2. `dailyNoteText`, read from Daily Guidance and truncated into Focus, may have been generated earlier with transit/current-sky/house context.
3. Stored `innerworkRecommendations` may have been generated earlier with astro activations, although the current `innerworkIntelligence` implementation is stubbed.

## Requested signals

| Signal | Alters issue? | Alters intensity? | Alters practice? | Alters narrative? |
|---|---|---|---|---|
| Moon phase | No direct path | No direct path | No direct path | Only if upstream Daily Guidance used it |
| Transit | No direct path | No direct path | Possible upstream only | Possible Focus upstream |
| Awareness engine | Not called | Not called | Passed upstream in Dashboard generation only | Not directly |
| Vedic | Indirect profile narrative | No explicit intensity | Indirect fallback issue only | Indirect Human Meaning |
| BaZi | Indirect profile narrative | No explicit intensity | Indirect fallback issue only | Indirect Human Meaning |
| Tzolkin | Indirect profile narrative | No explicit intensity | Indirect fallback issue only | Indirect Human Meaning |
| Jawa/Weton | No traced page path | No | No | No |
| Gerhana | No traced page path | No | No | No |

Astro provenance is lost by the time Focus reaches Innerwork: the page receives only a stored prose string.

