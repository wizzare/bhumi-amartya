# CANONICAL TRANSLATOR SERVICE V1

## OVERVIEW
The `CanonicalTranslatorService` is the central nervous system of Bhumi V4. Its sole responsibility is to ingest the raw, system-specific `Blueprint` object (Human Design, Vedic, BaZi, etc.) and translate it into a single, cohesive, human-readable `CanonicalIdentity` object.

**Core Rule**: Profile, Dashboard, Journey, Innerwork, and Gaia **must never** read from the raw `Blueprint` systems. They only consume `CanonicalIdentity`.

---

## 1. IDENTITY DOMAIN
*Who is the user at their core?*

- **Input Sources**: `astrology.sunSign`, `humanDesign.profile`, `weton.watak`
- **Ownership**: Astrology (Sun) [60%], Human Design (Profile) [40%]
- **Conflict Resolution**: If Weton Watak contradicts Sun Sign (e.g., Sun is fiery/outgoing, Weton is reserved), append Weton as an internal nuance ("Kamu terlihat [Sun], namun aslinya [Weton]").
- **Fallback Logic**: If HD Profile fails, rely 100% on Astrology Sun Sign.
- **Output Structure**:
  ```json
  "identity": {
    "coreArchetype": "Sang Pembimbing yang Tenang",
    "primaryTrait": "Karisma",
    "secondaryTrait": "Kebijaksanaan",
    "narrative": "Kamu memiliki aura kepemimpinan alami..."
  }
  ```

---

## 2. PURPOSE DOMAIN
*Why is the user here?*

- **Input Sources**: `numerology.lifePath`, `destinyMatrix.destinyPoint`
- **Ownership**: Numerology (Life Path) [70%], Destiny Matrix (Destiny Point) [30%]
- **Conflict Resolution**: Life path is the "What" (Theme), Destiny Point is the "How" (Action). They do not conflict; they stack.
- **Fallback Logic**: If Matrix fails, rely 100% on Numerology.
- **Output Structure**:
  ```json
  "purpose": {
    "lifeMission": "Menjadi Jembatan Pemahaman",
    "coreTheme": "Komunikasi & Harmoni",
    "narrative": "Misi utamamu dalam hidup ini adalah..."
  }
  ```

---

## 3. ENERGY DOMAIN
*How does the user naturally operate?*

- **Input Sources**: `humanDesign.authority`, `humanDesign.strategy`, `bazi.fiveElements`
- **Ownership**: Human Design [80%], BaZi [20%]
- **Conflict Resolution**: HD dictates decision-making mechanics. BaZi dictates the *flavor* of that energy (e.g., Emotional Authority + Strong Fire Element = "Tunggu emosi mereda, meski api dalam dirimu ingin cepat bertindak").
- **Fallback Logic**: If exact birth time is missing (HD fails), fallback to BaZi Day Master Element for general energy advice.
- **Output Structure**:
  ```json
  "energy": {
    "decisionMechanic": "Emotional Authority",
    "actionStrategy": "Wait to Respond",
    "vitalityCapacity": "Moderate-High (Wood Dominant)",
    "actionableAdvice": "Jangan ambil keputusan saat emosi memuncak."
  }
  ```

---

## 4. PSYCHOLOGY DOMAIN
*What are the deep subconscious drives and emotional needs?*

- **Input Sources**: `astrology.moonSign`, `numerology.soulUrge`, `destinyMatrix.innerChild`
- **Ownership**: Astrology (Moon) [50%], Numerology [25%], Matrix [25%]
- **Conflict Resolution**: Moon is emotional safety; Soul Urge is psychological motivation. Synthesize into one emotional baseline.
- **Fallback Logic**: If Matrix fails, Moon + Soul Urge are sufficient.
- **Output Structure**:
  ```json
  "psychology": {
    "emotionalNeed": "Rasa Aman & Keteraturan",
    "subconsciousDrive": "Kebebasan Berekspresi",
    "innerChildSoothing": "Berikan dirimu ruang untuk..."
  }
  ```

---

## 5. ARCHETYPE DOMAIN
*What is the symbolic representation of the user?*

- **Input Sources**: `tzolkin.galacticSignature`, `destinyMatrix.highArcana`
- **Ownership**: Tzolkin [50%], Matrix [50%]
- **Conflict Resolution**: Select the most dominant recurring mythic theme across both systems.
- **Fallback Logic**: Use Destiny Matrix High Arcana if Tzolkin is unavailable.
- **Output Structure**:
  ```json
  "archetype": {
    "symbolicName": "Yellow Resonant Warrior",
    "mythicRole": "Sang Penanya Tanpa Rasa Takut",
    "narrative": "Secara simbolis, energi jiwamu bergerak seperti..."
  }
  ```

---

## 6. SHADOW DOMAIN
*What are the user's negative loops and triggers?*

- **Input Sources**: `destinyMatrix.karmicTail`, `astrology.chiron`, `astrology.pluto`
- **Ownership**: Matrix Karmic Tail [60%], Astrology Chiron/Pluto [40%]
- **Conflict Resolution**: Karmic Tail is the *behavioral loop*. Chiron is the *core wound*. Pluto is the *trigger*. Synthesize as: Trigger -> Wound -> Loop.
- **Fallback Logic**: If exact birth time missing (houses fail), rely entirely on Karmic Tail.
- **Output Structure**:
  ```json
  "shadow": {
    "coreWound": "Takut Tertolak",
    "actionablePattern": "People Pleasing / Sulit Berkata Tidak",
    "emotionalTrigger": "Konflik terbuka atau suara keras",
    "interruptionTactic": "Ambil jeda 5 detik sebelum menjawab 'Ya'."
  }
  ```

---

## 7. KARMA DOMAIN
*What inherited patterns or spiritual lessons must be learned?*

- **Input Sources**: `vedic.rahuKetu`, `destinyMatrix.fatherLine`, `destinyMatrix.motherLine`
- **Ownership**: Vedic Nodes [50%], Matrix Ancestral Lines [50%]
- **Conflict Resolution**: Rahu/Ketu defines the *soul's evolution*. Matrix defines *ancestral baggage*. Keep them logically distinct in the output.
- **Fallback Logic**: If Vedic fails, output only Ancestral Karma.
- **Output Structure**:
  ```json
  "karma": {
    "evolutionaryLesson": "Berhenti mengontrol, mulai percaya (Rahu di Pisces)",
    "ancestralPattern": "Pola kerja keras tanpa istirahat dari garis Ayah",
    "narrative": "Tugasmu dalam hidup ini adalah memutus pola..."
  }
  ```

---

## 8. TALENTS DOMAIN
*What comes naturally and effortlessly?*

- **Input Sources**: `destinyMatrix.talentsLine`, `humanDesign.channels`
- **Ownership**: Matrix Talents [60%], HD Channels [40%]
- **Conflict Resolution**: Matrix dictates the *theme* of the talent. HD dictates the *mechanism* (e.g., Matrix: "Communication". HD Channel 43-23: "Structuring freakish insight").
- **Fallback Logic**: If exact birth time missing (HD fails), rely 100% on Matrix Talents.
- **Output Structure**:
  ```json
  "talents": {
    "topGifts": ["Komunikasi Persuasif", "Analisis Sistem", "Empati Mendalam"],
    "mechanics": "Kamu paling bersinar saat dibiarkan merenung sendiri...",
    "narrative": "Bakat terbesarmu bukanlah sesuatu yang harus kamu latih keras..."
  }
  ```

---

## 9. RELATIONSHIPS DOMAIN
*How does the user connect, attract, and set boundaries?*

- **Input Sources**: `vedic.darakaraka`, `destinyMatrix.loveLine`, `humanDesign.undefinedCenters`
- **Ownership**: Matrix Love Line [40%], Vedic Darakaraka [40%], HD Centers [20%]
- **Conflict Resolution**: Darakaraka = *Who you attract*. Matrix = *How you act in love*. HD Centers = *Where you lose boundaries*.
- **Fallback Logic**: If exact time missing (Vedic/HD fail), rely 100% on Matrix Love Line.
- **Output Structure**:
  ```json
  "relationships": {
    "attractionStyle": "Tertarik pada sosok yang stabil dan membumi",
    "relationshipPattern": "Cenderung dominan saat merasa tidak aman",
    "boundaryLesson": "Jangan menyerap amarah pasangan (Undefined Solar Plexus)",
    "loveBlock": "Takut kehilangan kemerdekaan"
  }
  ```

---

## 10. CAREER DOMAIN
*How does the user work and generate wealth?*

- **Input Sources**: `bazi.careerPath`, `destinyMatrix.moneyLine`, `astrology.midheaven`
- **Ownership**: BaZi [40%], Matrix Money Line [40%], Astrology MC [20%]
- **Conflict Resolution**: BaZi = *Environment* (e.g., Corporate vs Solo). Matrix = *Money flow mechanism*. MC = *Public reputation*.
- **Fallback Logic**: If exact time missing (BaZi/MC fail), rely 100% on Matrix Money Line.
- **Output Structure**:
  ```json
  "career": {
    "idealWorkStyle": "Mandiri / Freelance",
    "wealthMechanism": "Uang mengalir saat kamu membagikan pengetahuan",
    "moneyBlock": "Merasa bersalah menetapkan harga mahal",
    "narrative": "Jalur karir terbaikmu adalah..."
  }
  ```

---

## 11. HEALTH DOMAIN
*How does the physical body operate optimally?*

- **Input Sources**: `humanDesign.variables`, `destinyMatrix.chakraMatrix`, `bazi.elements`
- **Ownership**: HD Variables [50%], Matrix Chakras [30%], BaZi [20%]
- **Conflict Resolution**: HD Variables are highly specific (Digestion/Environment) and take precedence. Chakras indicate somatic vulnerabilities. BaZi indicates general temperament.
- **Fallback Logic**: If exact birth time missing (HD Variables fail), rely on Matrix Chakras and BaZi Elements.
- **Output Structure**:
  ```json
  "health": {
    "digestionRule": "Makan dalam kondisi tenang (Calm Touch)",
    "idealEnvironment": "Ruang yang sibuk/aktif (Kitchens)",
    "vulnerableChakra": "Tenggorokan (Throat) - Rentan radang saat memendam suara",
    "dominantElement": "Api - Rentan kelelahan jantung/insomnia"
  }
  ```

---

## 12. SPIRITUALITY DOMAIN
*How does the user connect to meaning and intuition?*

- **Input Sources**: `vedic.mokshaFocus`, `humanDesign.cognition`, `destinyMatrix.highArcana`
- **Ownership**: HD Cognition [40%], Matrix [40%], Vedic [20%]
- **Conflict Resolution**: HD Cognition defines the *Clair-sense* (Feeling, Knowing, etc). Matrix defines the *Spiritual Tendency* (Healer, Guide, etc).
- **Fallback Logic**: If exact time missing (HD Cognition fails), rely on Matrix.
- **Output Structure**:
  ```json
  "spirituality": {
    "spiritualPath": "Jalur Pengetahuan (Jnana)",
    "intuitiveMode": "Mengetahui tiba-tiba (Claircognizance / Inner Vision)",
    "channelingPotential": "Tinggi - Sering mendapat 'download' ide",
    "auraArchetype": "Menyerap & Memantulkan (Reflector)"
  }
  ```

---

## 13. GROWTH DOMAIN
*What is the user actively working on improving?*

- **Input Sources**: `innerwork.journeys`, `innerwork.logs`, `stateEngine`
- **Ownership**: Innerwork Engine [100%]
- **Conflict Resolution**: N/A (Derived entirely from user activity, not blueprints).
- **Fallback Logic**: If new user, default Growth Area to fixing their "Pola Sabotase" (Shadow Domain).
- **Output Structure**:
  ```json
  "growth": {
    "currentFocusArea": "Menyembuhkan Luka Penolakan",
    "activeJourney": "The Boundary Bootcamp",
    "progressMetric": 45
  }
  ```

---

## 14. TIMING DOMAIN
*What life chapter is the user in right now?*

- **Input Sources**: `vedic.dashas`, `destinyMatrix.yearlyArcana`, `bazi.luckPillars`
- **Ownership**: Vedic Mahadasha [40%], Matrix Yearly [40%], BaZi [20%]
- **Conflict Resolution**: Vedic/BaZi define the *Macro 10-year Theme*. Matrix defines the *Micro 1-year Theme*.
- **Fallback Logic**: If exact time missing (Vedic/BaZi fail), rely entirely on Matrix Yearly Arcana.
- **Output Structure**:
  ```json
  "timing": {
    "macroCycleTheme": "Era Membangun Fondasi Material (2020-2030)",
    "currentYearTheme": "Pelepasan dan Transformasi Total (Arcana 13)",
    "semester1Focus": "Kesehatan & Struktur",
    "semester2Focus": "Koneksi Sosial & Karir"
  }
  ```

---

## 15. STATE DOMAIN
*What is the user's real-time emotional and physical condition?*

- **Input Sources**: `stateEngine.dailyLogs`
- **Ownership**: State Engine [100%]
- **Conflict Resolution**: N/A
- **Fallback Logic**: If user hasn't logged today, infer state from last 3 days moving average. If no history, default to "Netral".
- **Output Structure**:
  ```json
  "state": {
    "currentMood": "Cemas",
    "energyLevel": 2,
    "stressLevel": 4,
    "dailyRecommendation": "Lakukan Grounding 5 Menit"
  }
  ```
