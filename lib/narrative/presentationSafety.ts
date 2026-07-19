export type NarrativeSafetyStatus = "PASS" | "SANITIZED" | "BLOCKED_REGENERATE" | "SAFE_FALLBACK_USED";

export type NarrativeSafetyResult = {
  text: string;
  status: NarrativeSafetyStatus;
  issues: string[];
};

const RAW_REPLACEMENTS: Array<[RegExp, string]> = [
  // Combined / specific phrases first
  [/Anjing Putih\s*\((?:OC|Oc)\)/gi, "kesetiaan tulus dan kasih tanpa syarat"],
  [/Badai Biru\s*\((?:Cauac)\)/gi, "kekuatan transformasi dan regenerasi diri"],
  [/Naga Merah\s*\((?:Imix)\)/gi, "awal kehidupan baru dan keberanian memulai"],
  [/Matahari Kuning\s*\((?:Ahau)\)/gi, "cahaya cinta kasih dan pencerahan batin"],
  [/Benih Kuning\s*\((?:Kan)\)/gi, "potensi kesadaran yang terus bertumbuh"],
  [/Cermin Putih\s*\((?:Etznab)\)/gi, "kejernihan refleksi batin apa adanya"],
  [/Ksatria Kuning\s*\((?:Cib)\)/gi, "keberanian menghadapi ketakutan dengan sadar"],
  [/Elang Biru\s*\((?:Men)\)/gi, "visi yang luas dan sudut pandang menyeluruh"],
  [/Bumi Merah\s*\((?:Caban)\)/gi, "koneksi dengan alam dan mengikuti sinkronisitas"],
  [/Penyihir Putih\s*\((?:Ix)\)/gi, "kehadiran utuh di saat ini dan keheningan"],
  [/Penjelajah Langit Merah\s*\((?:Ben)\)/gi, "keberanian menjelajah ruang baru"],
  [/Manusia Kuning\s*\((?:Eb)\)/gi, "kebijaksanaan memilih dan kehendak bebas"],
  [/Monyet Biru\s*\((?:Chuen)\)/gi, "kegembiraan batin dan melihat menembus ilusi"],
  [/Bulan Merah\s*\((?:Muluc)\)/gi, "aliran emosi dan pemurnian batin"],
  [/Bintang Kuning\s*\((?:Lamat)\)/gi, "keindahan batin dan keanggunan hidup"],
  [/Tangan Biru\s*\((?:Manik)\)/gi, "tindakan nyata dan pemulihan keadaan"],
  [/Penghubung Dunia Putih\s*\((?:Cimi)\)/gi, "pelepasan masa lalu dan jembatan transisi"],
  [/Ular Merah\s*\((?:Chicchan)\)/gi, "daya hidup tubuh dan insting alami"],
  [/Malam Biru\s*\((?:Akbal)\)/gi, "intuisi mendalam dan ruang kelimpahan batin"],
  [/Angin Putih\s*\((?:Ik)\)/gi, "komunikasi spiritual dan penyebaran inspirasi"],

  [/Jupiter\s+(?:is|berada)\s+4th\s+from\s+the\s+Moon/gi, "dorongan menemukan rasa aman melalui keluarga, rumah, dan ruang batin"],
  [/Sun\s+and\s+Mercury\s+are\s+conjunct(?:\s+within\s+[\d.]+°)?/gi, "sinergi erat antara tujuan hidup utama dan cara berpikir komunikatif"],
  [/Venus\s+and\s+Mercury/gi, "keharmonisan dalam mencintai dan berkomunikasi"],
  [/wealth-house\s+lords/gi, "pengelola tema rezeki"],
  [/lords\s+(?:of\s+)?angular(?:\/|\s+)trinal\s+houses/gi, "pengelola tema tindakan dan wawasan spiritual"],
  [/conjoin(?:ed)?\s+in\s+([A-Za-z]+)/gi, "menyatu erat dalam kualitas $1"],
  [/conjoin(?:ed)?\s+([A-Za-z]+)/gi, "menyatu erat dalam kualitas $1"],
  [/\b(?:4th\s+from\s+the\s+Moon|from\s+the\s+Moon)\b/gi, "dalam kaitannya dengan rasa aman dan ruang batin"],
  [/\((?:Imix|Ik|Akbal|Kan|Chicchan|Cimi|Manik|Lamat|Muluc|Oc|Chuen|Eb|Ben|Ix|Men|Cib|Caban|Etznab|Cauac|Ahau)\)/gi, ""],
  
  // Standalone Tzolkin seals
  [/\bNaga Merah\b/gi, "awal kehidupan baru dan keberanian memulai"],
  [/\bAngin Putih\b/gi, "komunikasi spiritual dan penyebaran inspirasi"],
  [/\bMalam Biru\b/gi, "intuisi mendalam dan ruang kelimpahan batin"],
  [/\bBenih Kuning\b/gi, "potensi kesadaran yang terus bertumbuh"],
  [/\bUlar Merah\b/gi, "daya hidup tubuh dan insting alami"],
  [/\bPenghubung Dunia Putih\b/gi, "pelepasan masa lalu dan jembatan transisi"],
  [/\bTangan Biru\b/gi, "tindakan nyata dan pemulihan keadaan"],
  [/\bBintang Kuning\b/gi, "keindahan batin dan keanggunan hidup"],
  [/\bBulan Merah\b/gi, "aliran emosi dan pemurnian batin"],
  [/\bAnjing Putih\b/gi, "kesetiaan tulus dan kasih tanpa syarat"],
  [/\bMonyet Biru\b/gi, "kegembiraan batin dan melihat menembus ilusi"],
  [/\bManusia Kuning\b/gi, "kebijaksanaan memilih dan kehendak bebas"],
  [/\bPenjelajah Langit Merah\b/gi, "keberanian menjelajah ruang baru"],
  [/\bPenyihir Putih\b/gi, "kehadiran utuh di saat ini dan keheningan"],
  [/\bElang Biru\b/gi, "visi yang luas dan sudut pandang menyeluruh"],
  [/\bKsatria Kuning\b/gi, "keberanian menghadapi ketakutan dengan sadar"],
  [/\bBumi Merah\b/gi, "koneksi dengan alam dan mengikuti sinkronisitas"],
  [/\bCermin Putih\b/gi, "kejernihan refleksi batin apa adanya"],
  [/\bBadai Biru\b/gi, "kekuatan transformasi dan regenerasi diri"],
  [/\bMatahari Kuning\b/gi, "cahaya cinta kasih dan pencerahan batin"],
  
  // Tzolkin terms
  [/\bWavespell\b/gi, "siklus perkembangan"],
  [/\bTone\b/gi, "irama dasar"],
  [/\bKin\b/gi, "pola dasar"],
  [/\b(?:Imix|Ik|Akbal|Kan|Chicchan|Cimi|Manik|Lamat|Muluc|Oc|Chuen|Eb|Ben|Ix|Men|Cib|Caban|Etznab|Cauac|Ahau)\b/gi, ""],

  // Astrology Signs
  [/\bPisces\b/gi, "kepekaan batin yang kuat dan pemahaman emosional"],
  [/\bAries\b/gi, "keberanian memulai dan semangat kepeloporan"],
  [/\bTaurus\b/gi, "kestabilan langkah dan kemampuan merawat kenyamanan"],
  [/\bGemini\b/gi, "kelincahan berpikir dan kemudahan berbagi informasi"],
  [/\bCancer\b/gi, "kelembutan hati dan dorongan merawat kedekatan"],
  [/\bLeo\b/gi, "keberanian mengekspresikan diri dan kehangatan hati"],
  [/\bVirgo\b/gi, "kecermatan mengelola detail dan keinginan melayani"],
  [/\bLibra\b/gi, "pencarian harmoni dan keadilan dalam berelasi"],
  [/\bScorpio\b/gi, "daya analisis mendalam dan transformasi batin"],
  [/\bSagittarius\b/gi, "pencarian makna hidup dan keterbukaan wawasan"],
  [/\bCapricorn\b/gi, "ketekunan membangun fondasi dan tanggung jawab"],
  [/\bAquarius\b/gi, "kemandirian berpikir dan kepedulian sosial"],

  // Astrology Planets & Houses
  [/\bJupiter\b/gi, "dorongan bertumbuh dan menemukan kelapangan batin"],
  [/\bVenus\b/gi, "daya tarik relasi dan penghargaan terhadap keindahan"],
  [/\bMercury\b/gi, "cara berkomunikasi dan menyusun gagasan"],
  [/\bMars\b/gi, "dorongan bertindak dan kekuatan kehendak"],
  [/\bSaturn\b/gi, "proses kedewasaan melalui disiplin dan batas diri"],
  [/\bUranus\b/gi, "dorongan membawa pembaruan dan kebebasan"],
  [/\bNeptune\b/gi, "daya imajinasi dan koneksi spiritual"],
  [/\bPluto\b/gi, "kekuatan untuk lahir kembali dari perubahan besar"],
  [/\bMoon\b/gi, "kebutuhan emosional dan rasa aman terdalam"],
  [/\bSun\b/gi, "tujuan hidup utama dan pancaran jati diri"],
  [/\bAscendant\b/gi, "cara pertama mengekspresikan diri"],
  [/\bMidheaven\b/gi, "arah kontribusi dan panggilan karya"],
  [/\b(?:House\s+4|Rumah\s+ke-4)\b/gi, "ruang batin, keluarga, dan akar kehidupan"],
  [/\b(?:House\s+1|Rumah\s+ke-1)\b/gi, "kesadaran diri dan ekspresi pribadi"],
  [/\b(?:House\s+2|Rumah\s+ke-2)\b/gi, "sumber daya batin dan kemandirian"],
  [/\b(?:House\s+3|Rumah\s+ke-3)\b/gi, "lingkungan terdekat dan cara belajar"],
  [/\b(?:House\s+5|Rumah\s+ke-5)\b/gi, "kreativitas dan kegembiraan batin"],
  [/\b(?:House\s+6|Rumah\s+ke-6)\b/gi, "kebiasaan harian dan kepedulian pada tubuh"],
  [/\b(?:House\s+7|Rumah\s+ke-7)\b/gi, "cermin hubungan dan kemitraan"],
  [/\b(?:House\s+8|Rumah\s+ke-8)\b/gi, "proses melepaskan dan perubahan mendalam"],
  [/\b(?:House\s+9|Rumah\s+ke-9)\b/gi, "perjalanan batin dan pencarian kebijaksanaan"],
  [/\b(?:House\s+10|Rumah\s+ke-10)\b/gi, "tanggung jawab publik dan puncak karya"],
  [/\b(?:House\s+11|Rumah\s+ke-11)\b/gi, "harapan masa depan dan jejaring sosial"],
  [/\b(?:House\s+12|Rumah\s+ke-12)\b/gi, "keheningan batin dan ruang meditasi"],
  
  [/\b(?:conjunction|conjoin|conjunct)\b/gi, "perpaduan erat"],
  [/\btrine\b/gi, "aliran keselarasan"],
  [/\bopposition\b/gi, "keseimbangan dua sisi"],
  [/\bretrograde\b/gi, "peninjauan kembali ke dalam diri"],
  [/\bnakshatra\b/gi, "bintang pemandu batin"],
  [/\bbhava\b/gi, "bidang pengalaman hidup"],
  [/\b(?:lord|dispositor)\b/gi, "pengelola energi"],

  // Human Design Terms
  [/\bManifesting Generator\b/gi, "pribadi aktif dengan energi respons cepat"],
  [/\bGenerator\b/gi, "pembawa energi kehidupan yang konsisten"],
  [/\bProjector\b/gi, "pembimbing dengan wawasan yang jernih"],
  [/\bManifestor\b/gi, "inisiator mandiri dengan dorongan kuat"],
  [/\bReflector\b/gi, "pemantul kondisi lingkungan sekitar"],
  [/\bSacral Authority\b/gi, "kebijaksanaan merespons dari tubuh"],
  [/\bEmotional Authority\b/gi, "kejernihan setelah melewati gelombang rasa"],
  [/\bProfile\s+\d+\/\d+\b/gi, "peran batin"],
  [/\bGate\s+\d+\b/gi, "fokus kekuatan diri"],
  [/\bGate\b/gi, "titik fokus energi"],
  [/\bChannel\s+\d+-\d+\b/gi, "jalur aliran kekuatan"],
  [/\bChannel\b/gi, "jalur aliran kekuatan"],
  [/\bIncarnation Cross\b/gi, "tujuan hidup kolektif"],
  [/\bNot-Self\b/gi, "pola pengabaian diri"],
  [/\bSignature\b/gi, "kepuasan batin"],
  [/\bDefinition\b/gi, "struktur energi"],

  // Destiny Matrix / Arcana
  [/\bArcana Center\b/gi, "pusat tema kehidupan"],
  [/\bArcana\s+\d+\b/gi, "tema batin utama"],
  [/\bArcana\b/gi, "tema batin"],
  [/\bkarmic tail\b/gi, "pelajaran batin masa lalu"],
  [/\blove line\b/gi, "pola hubungan asmara"],
  [/\bmoney line\b/gi, "jalur pengelolaan rezeki"],
  [/\bcommon energy\b/gi, "selarasnya kekuatan batin"],
  [/\bkarmic tile\b/gi, "tantangan pertumbuhan"],
  [/\bfather line\b/gi, "warisan energi maskulin"],
  [/\bmother line\b/gi, "warisan energi feminin"],

  // Numerology
  [/\bLife Path\s+\d+\b/gi, "jalan hidup utama"],
  [/\bLife Path\b/gi, "jalan hidup utama"],
  [/\bSoul Urge\b/gi, "keinginan jiwa terdalam"],
  [/\bDestiny Number\b/gi, "tujuan perjalanan batin"],
  [/\bPersonal Year\b/gi, "tema tahunan pribadi"],
  [/\bMaster Number\b/gi, "potensi kekuatan khusus"],
  [/\bExpression Number\b/gi, "cara mengekspresikan diri"],

  // Weton
  [/\b(?:Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu)\s+(?:Legi|Pahing|Pon|Wage|Kliwon)\b/gi, "perpaduan energi hari lahirmu yang unik"],
  [/\bwatak weton\b/gi, "corak kepribadian dasar"],
  [/\bneptu\b/gi, "ukuran ritme hari"],
  [/\bpancawara\b/gi, "siklus lima energi"],
  [/\bpasaran\b/gi, "warna sosial hubungan"],
  [/\blaku\b/gi, "arah tindakan"],
  [/\bpadu\b/gi, "selisih pandang"],
  [/\btopo\b/gi, "tirakat batin"],
  [/\btinari\b/gi, "kemudahan rezeki"],

  // BaZi
  [/\bDay Master\b/gi, "inti energi diri"],
  [/\bRen Water\b/gi, "aliran air yang luas dan beradaptasi"],
  [/\bYang Water\b/gi, "energi air yang dinamis"],
  [/\bMetal\b/gi, "ketegasan dan kejelasan"],
  [/\bWood\b/gi, "pertumbuhan dan kelenturan"],
  [/\bFire\b/gi, "kehangatan dan ekspresi"],
  [/\bEarth\b/gi, "kestabilan dan membumi"],
  [/\bWater\b/gi, "kebijaksanaan dan aliran"],
  [/\bHeavenly Stem\b/gi, "pola energi langit"],
  [/\bEarthly Branch\b/gi, "ekspresi energi membumi"],
  [/\bTen Gods\b/gi, "aspek peran kehidupan"],
  [/\bluck pillar\b/gi, "fase perjalanan waktu"],

  // Vedic
  [/\bLagna\b/gi, "titik awal orientasi diri"],
  [/\bRashi\b/gi, "tanda zodiak batin"],
  [/\bNakshatra\s+[A-Za-z]+\b/gi, "bintang pemandu batin"],
  [/\bNakshatra\b/gi, "bintang pemandu jalan"],
  [/\bMahadasha\s+[A-Za-z]+\b/gi, "periode utama perjalanan"],
  [/\bMahadasha\b/gi, "periode utama perjalanan hidup"],
  [/\bAntardasha\s+[A-Za-z]+\b/gi, "sub-periode perjalanan"],
  [/\bAntardasha\b/gi, "sub-periode perjalanan hidup"],
  [/\bAtmakaraka\b/gi, "penunjuk arah evolusi jiwa"],
  [/\bDarakaraka\b/gi, "penunjuk karakter relasi terdekat"],
  [/\byoga\b/gi, "kombinasi kekuatan batin"],
  [/\bwealth-house lords\b/gi, "pengelola tema rezeki"],
  [/\bangular houses\b/gi, "rumah-rumah tindakan nyata"],
  [/\btrinal houses\b/gi, "rumah-rumah wawasan spiritual"],

  // Zi Wei Dou Shu
  [/\bLife Palace\b/gi, "pusat kepribadian diri"],
  [/\bBody Palace\b/gi, "cara bertindak dalam hidup"],
  [/\bLife Master\b/gi, "pilar kekuatan pribadi"],
  [/\bBody Master\b/gi, "pilar tindakan praktis"],
  [/\b[A-Za-z]+\s+Palace\b/gi, "aspek kehidupan"],
  [/\b[A-Za-z]+\s+Master\b/gi, "pilar kekuatan"],
  
  // Astrocartography
  [/\bplanetary line\b/gi, "garis pengaruh energi"],
  [/\bVenus line\b/gi, "jalur keharmonisan dan kedekatan"],
  [/\bJupiter line\b/gi, "jalur kelapangan dan pertumbuhan"],
  [/\bMC line\b/gi, "jalur pencapaian karya"],
  [/\bIC line\b/gi, "jalur ketenangan batin"],
  [/\bASC line\b/gi, "jalur ekspresi diri"],
  [/\bDSC line\b/gi, "jalur interaksi relasi"],
  [/\brelocation chart\b/gi, "peta penyesuaian tempat"]
];

const RAW_PATTERNS: Array<[RegExp, string]> = [
  [/\b(?:sourceVersion|factIds?|systemIds?|fingerprint|provenance|providerResponse|fallbackReason|commonEnergy|wealthHouseLord|moonFourthHouse|currentBuild|promptVariant)\b/gi, ""],
  [/\b(?:HIGH_CONFIDENCE|LOW_CONFIDENCE|UNRESOLVED|undefined|null)\b/gi, ""],
  [/\b(?:berdasarkan data di atas|sistem mendeteksi|input menunjukkan|model menyimpulkan|hasil kalkulasi|berdasarkan sistem|menurut algoritma|data mengindikasikan|sebagai AI|berikut adalah|kesimpulannya adalah)\b/gi, ""],
  [/\{[^{}]*\}|\[[^\[\]]*\]/g, ""],
];

const FORBIDDEN_KEYWORDS = [
  "pisces", "aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius",
  "jupiter", "venus", "mercury", "mars", "saturn", "uranus", "neptune", "pluto", "moon", "sun",
  "conjunction", "conjoin", "trine", "opposition", "retrograde", "nakshatra", "bhava", "lord", "dispositor",
  "anjing putih", "naga merah", "badai biru", "matahari kuning", "imix", "oc", "cauac", "ahau", "kin", "tone", "wavespell",
  "manifesting generator", "generator", "projector", "manifestor", "reflector", "sacral authority", "emotional authority",
  "arcana", "karmic tail", "love line", "money line", "common energy", "karmic tile", "father line", "mother line",
  "life path", "soul urge", "destiny number", "personal year", "master number", "expression number",
  "sabtu legi", "neptu", "pancawara", "pasaran", "watak weton", "laku", "padu", "topo", "tinari",
  "day master", "ren water", "yang water", "metal", "wood", "fire", "earth", "water", "heavenly stem", "earthly branch", "ten gods", "luck pillar",
  "lagna", "rashi", "mahadasha", "antardasha", "atmakaraka", "darakaraka", "yoga", "wealth-house lords", "angular houses", "trinal houses",
  "life palace", "body palace", "life master", "body master",
  "planetary line", "venus line", "jupiter line", "mc line", "ic line", "asc line", "dsc line", "relocation chart"
];

const SAFE_FALLBACK_SENTENCES = [
  "Keheningan batin membantumu memahami pola diri yang terdalam secara lembut.",
  "Setiap langkah dalam perjalanan hidupmu membawa kesempatan untuk bertumbuh dan belajar.",
  "Menjaga keseimbangan antara tindakan nyata dan refleksi diri adalah kunci kedamaianmu.",
  "Relasi yang sehat dibangun dari batas diri yang jelas dan komunikasi yang jujur.",
  "Pertumbuhan sejati tidak terburu-buru, melainkan mekar secara alami seiring kesadaranmu."
];

export function sanitizeUserNarrative(value: string | null | undefined): NarrativeSafetyResult {
  if (!value) return { text: "", status: "PASS", issues: [] };
  
  // Split paragraph into sentences by . ? ! followed by space
  const sentences = value.split(/(?<=[.!?])\s+/);
  const cleanedSentences: string[] = [];
  const issues: string[] = [];
  let finalStatus: NarrativeSafetyStatus = "PASS";
  
  for (const sentence of sentences) {
    if (!sentence.trim()) continue;
    let sText = sentence;
    let sIssuesCount = 0;
    
    for (const [pattern, replacement] of RAW_REPLACEMENTS) {
      if (pattern.test(sText)) {
        sIssuesCount++;
        issues.push(`raw phrase: ${pattern.source}`);
        sText = sText.replace(pattern, replacement);
      }
    }
    for (const [pattern, replacement] of RAW_PATTERNS) {
      if (pattern.test(sText)) {
        sIssuesCount++;
        issues.push(`raw metadata: ${pattern.source}`);
        sText = sText.replace(pattern, replacement);
      }
    }
    
    sText = sText.replace(/\s{2,}/g, " ").replace(/\s+([,.!?;:])/g, "$1").trim();
    
    if (sIssuesCount > 0 && finalStatus === "PASS") {
      finalStatus = "SANITIZED";
    }
    
    const lowerSText = sText.toLowerCase();
    let hasForbidden = false;
    for (const keyword of FORBIDDEN_KEYWORDS) {
      // Use boundary-aware checking for forbidden keywords to prevent false positives inside other words (e.g. perpaduan vs padu)
      let regex: RegExp;
      if (/^[a-zA-Z0-9\s-]+$/.test(keyword)) {
        regex = new RegExp(`\\b${keyword}\\b`, "i");
      } else {
        regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
      }
      if (regex.test(lowerSText)) {
        hasForbidden = true;
        issues.push(`Forbidden term remains: ${keyword}`);
      }
    }
    
    if (hasForbidden) {
      const idx = Math.abs(sText.length) % SAFE_FALLBACK_SENTENCES.length;
      sText = SAFE_FALLBACK_SENTENCES[idx];
      finalStatus = "SAFE_FALLBACK_USED";
    }
    
    cleanedSentences.push(sText);
  }
  
  const text = cleanedSentences.join(" ");
  return { text, status: finalStatus, issues };
}

export function auditUserNarrative(value: string | null | undefined): NarrativeSafetyResult {
  const result = sanitizeUserNarrative(value);
  if (result.status === "SAFE_FALLBACK_USED" || result.issues.some(iss => iss.includes("Forbidden term remains"))) {
    return { ...result, status: "BLOCKED_REGENERATE" };
  }
  return result;
}
