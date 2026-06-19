# Innerwork Practice Engine Repair

`mapInnerworkPractice()` now returns:

`practiceId`, `issueKey`, `issueLabel`, `issueCategory`, `category`, `type`, `title`, `durationMinutes`, `intensity`, `description`, `whyThisPractice`, `instructions`, `expectedBenefit`, `navigatorMode`, and `sourceSignals`.

Unknown issue input safely normalizes to `low_energy`; no empty object is returned. Recent Journey practice IDs are used to select a non-identical mode variant when the current navigator permits it.
