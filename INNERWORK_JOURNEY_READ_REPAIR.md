# Innerwork Journey Read Repair

Innerwork reads seven recent Journey states and passes issue, type, practice ID, completion, and reflection result into the mapper.

The mapper avoids the identical recent practice when another mode-compatible variant exists. `DashboardJourneyRuntimeAdapter` now sends the latest completed practice, type, issue, and result into Catatan's Journey context.
