# KARA OVEREXPLANATION AUDIT

Flagging areas where Bhumi says the same thing too many times or explains "why" too hard.

### 1. Repeat Idea (Twice)
- **Area**: `catatanHariIniRuntimeAdapter.ts` -> `sharedReason`.
- **Finding**: It often combines `calendar.tone` ("Minggu memberi ruang...") with `state.summary` ("Kondisimu membutuhkan beban lebih ringan").
- **Result**: "Minggu memberi ruang untuk melihat kembali perjalananmu tanpa terburu-buru. Kondisimu sedang membutuhkan beban yang lebih ringan and ruang pemulihan yang nyata." (Basically saying "Take it easy" twice).

### 2. Repeat Idea (Three Times)
- **Area**: `DailyNoteV2.tsx` -> `synthesizeSection`.
- **Finding**: Combines `sourceContext.main` + `categoryMain` + `sectionBridge`.
- **Result**: 
  1. (Issue): "Sepertinya hari ini ada kebingungan soal arah..."
  2. (Insight): "Pikiran yang bingung biasanya nyari kepastian..."
  3. (Bridge): "Pikiran yang tenang nggak berarti semuanya harus hilang; kadang cukup dengan tahu mana yang perlu didengar duluan."
- **Critique**: The user is being lectured on the same topic from three different "logic blocks".

### 3. Explaining "Why"
- **Area**: `innerworkIntelligence.ts` -> `whyThisPractice`.
- **Finding**: "Isu Inner Child membutuhkan rasa aman; mode pemulihan memilih pendekatan paling lembut."
- **Critique**: A friend doesn't explain the "selection mode" of their advice. They just give the advice.
