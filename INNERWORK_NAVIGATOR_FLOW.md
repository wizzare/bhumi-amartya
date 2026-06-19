# Innerwork Navigator Flow

## Generation

Wellness assessment answers  
→ assessment dimension scores  
→ `wellnessMappingEngine` category scores  
→ top wellness category plus body score  
→ `wellnessNavigatorEngine.getNavigatorMode`.

Rules:

- Body score below 30 → Recovery.
- Burnout, Anxiety, Life Crisis, Loss/Grief → Recovery.
- Meaning Crisis, Life Transition, Spiritual Crisis → Reflection.
- Growth Phase, Spiritual Awakening → Growth.
- Anything else → Reflection.

Navigator is calculated in the assessment UI. The Innerwork page only reads `wellnessNavigator/{uid}`; it does not calculate it.

## Content changes on Innerwork

- Recovery hides supporting practices.
- Reflection can show up to two supporting practices after completion.
- Growth can show up to three supporting practices plus “Eksplorasi Lanjut.”
- Mode affects issue selection only after all Human Meaning regex rules fail.

## Current mode

Not verified. No Navigator document reached the authorized browser runtime. The page’s code fallback would be Reflection, but that is not evidence of Widhi’s stored mode.

## Persistence gap

The assessment component calculates Navigator state for display but the inspected submission path saves the Wellness Mapping, not `wellnessNavigatorRepository.saveNavigatorState`. Therefore the source inspected does not prove that the Navigator document read by Innerwork is refreshed after assessment.

