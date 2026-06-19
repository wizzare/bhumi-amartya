# HUMAN MEANING LEAK AUDIT

Audit basis: user-visible `short`, `medium`, and `long` values produced by `HumanMeaningService` and passed through `ProfileRuntimeAdapter`.

Classification:

- `HUMAN_READY`: interpretation is expressed as ordinary human understanding.
- `PARTIAL_TRANSLATION`: readable framing exists, but raw labels or technical source values remain visible.
- `RAW_ENGINE_LEAK`: raw keys, numeric arrays, metrics, statuses, signs, center states, or engine terminology are directly serialized.

| SECTION | CARD | STATUS | RAW_FIELDS_VISIBLE | USER_READABILITY_SCORE |
| :--- | :--- | :--- | :--- | ---: |
| SIAPA DIRIMU | Arketipe Utama | HUMAN_READY | None | 9/10 |
| SIAPA DIRIMU | Misi Kehidupan | HUMAN_READY | None | 9/10 |
| SIAPA DIRIMU | Karakter Tersembunyi | RAW_ENGINE_LEAK | Soul Urge number, Moon sign, Chart Heart keys and values | 3/10 |
| ENERGI & MEKANIKA | Otoritas Batin | PARTIAL_TRANSLATION | Human Design authority label | 6/10 |
| ENERGI & MEKANIKA | Strategi Aksi | HUMAN_READY | None in output narrative | 9/10 |
| ENERGI & MEKANIKA | Kapasitas Vitalitas | RAW_ENGINE_LEAK | Element names and scores, Sacral definition state, chakra keys and physics values | 2/10 |
| ENERGI & MEKANIKA | Cara Tubuhmu Bekerja | RAW_ENGINE_LEAK | HD digestion/environment/type labels and BaZi element concatenated directly | 3/10 |
| LUKA, BAYANGAN & WARISAN | Kebutuhan Emosional | RAW_ENGINE_LEAK | Moon sign, Chart Heart keys and numbers | 3/10 |
| LUKA, BAYANGAN & WARISAN | Pola Sabotase | HUMAN_READY | Karmic Tail is interpreted internally and not displayed | 9/10 |
| LUKA, BAYANGAN & WARISAN | Trigger Emosional | RAW_ENGINE_LEAK | Mars/Pluto signs, aspect names, Chart Heart keys and values | 2/10 |
| LUKA, BAYANGAN & WARISAN | Warisan Leluhur | RAW_ENGINE_LEAK | Father/Mother/Ancestor line numbers and Vedic engine text | 2/10 |
| LUKA, BAYANGAN & WARISAN | Pelajaran Jiwa | RAW_ENGINE_LEAK | North Node, South Node, Rahu and Ketu signs | 3/10 |
| LUKA, BAYANGAN & WARISAN | Jejak Jiwa | RAW_ENGINE_LEAK | Karmic Tail numbers, occult seal and tone terminology | 3/10 |
| LUKA, BAYANGAN & WARISAN | Money Block | RAW_ENGINE_LEAK | Money Line numbers, unfavorable element labels, house signs | 2/10 |
| LUKA, BAYANGAN & WARISAN | Love Block | RAW_ENGINE_LEAK | Love Line numbers and Venus sign | 3/10 |
| KARYA & TALENTA | DNA Talenta | HUMAN_READY | HD type is interpreted internally and not displayed | 9/10 |
| KARYA & TALENTA | Potensi Bakat | RAW_ENGINE_LEAK | Ten Gods, yoga names and astrology aspect labels | 2/10 |
| KARYA & TALENTA | Gaya Karya | PARTIAL_TRANSLATION | Midheaven label/value and Money Line numbers remain beside readable BaZi text | 5/10 |
| KARYA & TALENTA | Aliran Rezeki | PARTIAL_TRANSLATION | Money Line numbers and Dhana Yoga evidence remain beside readable money-style text | 5/10 |
| CINTA & RELASI | Gaya Ketertarikan | HUMAN_READY | Darakaraka is interpreted internally and not displayed | 9/10 |
| CINTA & RELASI | Pola Relasi | PARTIAL_TRANSLATION | Love Line numbers remain visible beside relationship-style prose | 5/10 |
| CINTA & RELASI | Bahasa Cinta Alami | RAW_ENGINE_LEAK | Five-element keys and scores plus Venus sign | 2/10 |
| CINTA & RELASI | Batasan Sehat | RAW_ENGINE_LEAK | Undefined center names and Chart Heart keys/numbers | 2/10 |
| RAGA & RUANG | Peta Chakra | RAW_ENGINE_LEAK | Chakra/internal center names and physics/energy/emotion metric triplets | 1/10 |
| RAGA & RUANG | Sistem Cerna | PARTIAL_TRANSLATION | Raw Human Design digestion label | 6/10 |
| RAGA & RUANG | Lingkungan Ideal | PARTIAL_TRANSLATION | Raw Human Design environment label | 6/10 |
| RAGA & RUANG | Ritme Tubuh | PARTIAL_TRANSLATION | Human Design type label | 6/10 |
| RAGA & RUANG | Energi Dominan | PARTIAL_TRANSLATION | Raw BaZi element label | 6/10 |
| SPIRITUALITAS & EVOLUSI | Jalur Spiritual | PARTIAL_TRANSLATION | Vedic spiritual-style output can expose Atmakaraka, sign and Nakshatra terminology | 5/10 |
| SPIRITUALITAS & EVOLUSI | Evolusi Jiwa | RAW_ENGINE_LEAK | Atmakaraka planet, sign and house | 3/10 |
| SPIRITUALITAS & EVOLUSI | Potensi Spiritual | RAW_ENGINE_LEAK | Arcana number | 3/10 |
| SPIRITUALITAS & EVOLUSI | Bakat Spiritual | RAW_ENGINE_LEAK | Destiny talent numbers | 2/10 |
| SPIRITUALITAS & EVOLUSI | Jejak Intuisi | PARTIAL_TRANSLATION | Raw cognition-variable label | 6/10 |
| SPIRITUALITAS & EVOLUSI | Potensi Channeling | PARTIAL_TRANSLATION | Head/Ajna definition terminology | 5/10 |
| SPIRITUALITAS & EVOLUSI | Aura Dominan | PARTIAL_TRANSLATION | Human Design type used as aura output | 6/10 |
| SPIRITUALITAS & EVOLUSI | Clair Potential | RAW_ENGINE_LEAK | Talent numbers and Spleen/Ajna/Solar Plexus definition states | 2/10 |
| FASE KEHIDUPAN SAAT INI | Musim Kehidupan | HUMAN_READY | Dasha value is interpreted internally and not displayed | 9/10 |
| FASE KEHIDUPAN SAAT INI | Semester 1 | RAW_ENGINE_LEAK | Yearly Arcana number, Mahadasha and Antardasha planet labels | 3/10 |
| FASE KEHIDUPAN SAAT INI | Semester 2 | RAW_ENGINE_LEAK | Yearly Arcana number, Mahadasha and Antardasha planet labels | 3/10 |
| FASE KEHIDUPAN SAAT INI | Kondisimu Saat Ini | RAW_ENGINE_LEAK | Blueprint status such as `ready` | 1/10 |
| FASE KEHIDUPAN SAAT INI | Fokus Hari Ini | PARTIAL_TRANSLATION | Prebuilt Tzolkin engine output is wrapped but not translated by Human Meaning | 6/10 |
| FASE KEHIDUPAN SAAT INI | Area Pertumbuhan | PARTIAL_TRANSLATION | Prebuilt Tzolkin growth output may retain seal/tone terminology | 5/10 |

## Primary Leak Mechanism

`HumanMeaningService.fromSignals()` joins source values and places them directly into:

- `"[Card] terbaca melalui ${evidence}"`
- `"Gunakan pola ${evidence}..."`

`recordText()` additionally exposes internal object keys and raw values using:

`key + " " + value`

Therefore these outputs are connected to Human Meaning structurally, but they are not semantically translated into human understanding.
