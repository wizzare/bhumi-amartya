# Weton Engine Implementation Report

## 1. Formula source

The Weton engine is deterministic and does not call AI, an LLM, or an external runtime service.

### Day boundary

The engine treats the Javanese day as changing after the evening boundary. Birth times at or after `18:00` are assigned to the following civil date for Weton calculation.

This is necessary for the validation case: `03 May 1985 23:45 WIB` is civil Friday night but belongs to the Javanese day `Sabtu`.

### Seven-day cycle

The effective Gregorian date is converted to its normal weekday:

```text
0 Minggu
1 Senin
2 Selasa
3 Rabu
4 Kamis
5 Jumat
6 Sabtu
```

### Five-day Pasaran and 210-day Pawukon

The engine uses a verified Pawukon cycle anchor:

```text
2020-07-05 = Pawukon day 1
Wuku Sinta
Minggu Pahing
```

For an effective birth date:

```text
dayOffset = wholeDays(effectiveDate - 2020-07-05)
pasaranIndex = positiveModulo(dayOffset, 5)
pawukonDay = positiveModulo(dayOffset, 210)
wukuIndex = floor(pawukonDay / 7) + 1
```

Pasaran sequence from the anchor:

```text
Pahing → Pon → Wage → Kliwon → Legi
```

The Wuku sequence contains all 30 canonical seven-day Wuku periods from Sinta through Watugunung.

### Neptu

Canonical values implemented:

| Hari | Neptu |
| --- | ---: |
| Minggu | 5 |
| Senin | 4 |
| Selasa | 3 |
| Rabu | 7 |
| Kamis | 8 |
| Jumat | 6 |
| Sabtu | 9 |

| Pasaran | Neptu |
| --- | ---: |
| Legi | 5 |
| Pahing | 9 |
| Pon | 7 |
| Wage | 4 |
| Kliwon | 8 |

```text
totalNeptu = neptuDay + neptuPasaran
```

### Pranata Mangsa

The engine uses the traditional fixed solar-season boundaries:

```text
Kasa       22 June
Karo        3 August
Katelu     26 August
Kapat      19 September
Kalima     14 October
Kanem      10 November
Kapitu     23 December
Kawolu      4 February
Kasanga     2 March
Kasadasa   27 March
Desta      20 April
Saddha     13 May
```

### Public references

- Javanese calendar cycles, Pasaran, Pawukon, and Pranata Mangsa:  
  https://en.wikipedia.org/wiki/Javanese_calendar
- Pawukon 210-day cycle and Gregorian correlation anchor:  
  https://en.wikipedia.org/wiki/Pawukon_calendar
- Wuku sequence and starting Pasaran:  
  https://en.wikipedia.org/wiki/Old_Javanese_calendar
- Karjanto and Beauducel, *An ethnoarithmetic excursion into the Javanese calendar*:  
  https://arxiv.org/abs/2012.10064

## 2. Validation results

Automated validation:

```text
PASS: evening boundary converts 1985-05-03 23:45 to effective date 1985-05-04
PASS: day = Sabtu
PASS: pasaran = Legi
PASS: weton = Sabtu Legi
PASS: neptu day = 9
PASS: neptu pasaran = 5
PASS: total neptu = 14
PASS: Wuku = Bala
PASS: Wuku index = 25
PASS: Pranata Mangsa = Desta
```

Boundary control:

```text
1985-05-03 17:59 = Jumat Kliwon
1985-05-03 23:45 = Sabtu Legi
```

This confirms the expected result comes from the day-boundary formula rather than a Widhi-specific override.

Validation script:

```text
scripts/validateWeton.ts
```

## 3. Widhi results

Input:

```text
Name: Widhi
Birth date: 03 May 1985
Birth time: 23:45 WIB
Birth place: Jakarta
```

Result:

```text
day: Sabtu
pasaran: Legi
weton: Sabtu Legi
neptuDay: 9
neptuPasaran: 5
totalNeptu: 14
wuku.name: Bala
wuku.index: 25
pranataMangsa.name: Desta
```

The day, Pasaran, and Wuku are consistent with the public Pawukon correlation and canonical cycle sequence listed above.

## 4. Storage schema

Weton is stored at `blueprint.weton`:

```text
weton: {
  day
  pasaran
  weton
  neptuDay
  neptuPasaran
  totalNeptu
  wuku: {
    name
    index
    description
  }
  pranataMangsa: {
    name
    description
  }
  watak
  strengths
  challenges
  lifeMission
  relationshipStyle
  workStyle
  moneyStyle
}
```

New blueprints receive Weton during normal blueprint generation.

Legacy behavior:

- Repository normalization calculates missing Weton from stored blueprint input.
- The Weton page calculates missing Weton from blueprint/profile birth data.
- The completed result is saved through the active storage provider.
- Dual storage persists the result to scoped local storage and Firebase when available.
- The result survives refresh and does not require Gaia integration.

## 5. Build result

**PASS**

```text
Command: npm.cmd run build
Next.js: 16.2.6
Compiled successfully
TypeScript phase completed
Static pages generated: 117/117
/blueprint/weton: static route
Exit code: 0
```

## 6. TypeScript result

**PASS**

```text
Command: npx.cmd tsc --noEmit
Errors: 0
Exit code: 0
```

## Production UI result

The Weton page now displays:

- Hari and day neptu
- Pasaran and Pasaran neptu
- Full Weton name and total neptu
- Wuku name, index, and description
- Pranata Mangsa and description
- Watak Dasar
- Kekuatan
- Tantangan
- Misi Kehidupan
- Gaya Relasi
- Gaya Kerja
- Gaya Rezeki
- Five-paragraph deterministic `Kesimpulan Weton`

No `AuditSection`, debug panel, raw JSON, Gemini, or LLM integration was added.
