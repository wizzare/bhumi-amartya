# Reflection to Journey Audit

Journey receives all four results.

- `Lebih Tenang`: helpful.
- `Sedikit Lebih Berat`: heavy.
- `Sama Saja`: persisted, but effectiveness classifies it as unknown.
- `Belum Yakin`: persisted and classified unknown.

Tomorrow Innerwork receives the result through `getDailyMemory().last30Days`.

Practice Effectiveness receives it, but its neutral parser does not recognize the exact UI value `Sama Saja`.

Verdict: connected with semantic and atomicity gaps.
