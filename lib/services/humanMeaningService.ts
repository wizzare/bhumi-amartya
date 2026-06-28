import type { CanonicalIdentity } from "@/lib/types/canonical";
import type { HumanMeaning, HumanNarrative } from "@/lib/types/humanMeaning";

export class HumanMeaningService {
  public static generate(canonical: CanonicalIdentity): HumanMeaning {
    const identity = this.generateIdentity(canonical.identity);
    const energy = this.generateEnergy(canonical.energy);
    const shadow = this.generateShadow(canonical.shadow);
    const talents = this.generateTalents(canonical.talents);
    const relationships = this.generateRelationships(canonical.relationships);
    const timing = this.generateTiming(canonical.timing);
    return {
      identity: {
        ...identity,
        archetype: identity,
        hiddenCharacter: this.hiddenCharacterMeaning(canonical.identity.hiddenCharacter),
      },
      purpose: this.generatePurpose(canonical.purpose),
      energy: {
        ...energy,
        authority: this.authorityMeaning(canonical.energy.authority),
        strategy: energy,
        vitality: this.vitalityMeaning(canonical.energy),
        bodyMechanics: this.composeBodyMechanics(canonical.health),
      },
      shadow: {
        ...shadow,
        emotionalNeeds: this.emotionalNeedsMeaning(canonical.shadow),
        sabotage: shadow,
        triggers: this.triggerMeaning(canonical.shadow),
        ancestralLegacy: this.ancestralMeaning(canonical.shadow),
        soulLesson: this.soulLessonMeaning(canonical.shadow),
        soulTrace: this.soulTraceMeaning(canonical.shadow),
        moneyBlock: this.moneyBlockMeaning(canonical.shadow),
        loveBlock: this.loveBlockMeaning(canonical.shadow),
      },
      talents: {
        ...talents,
        dna: talents,
        potential: this.potentialTalentMeaning(canonical.talents),
        workStyle: this.workStyleMeaning(canonical.talents),
        wealthFlow: this.wealthFlowMeaning(canonical.talents),
      },
      relationships: {
        ...relationships,
        attraction: relationships,
        pattern: this.relationshipPatternMeaning(canonical.relationships),
        loveLanguage: this.loveLanguageMeaning(canonical.relationships),
        boundaries: this.boundariesMeaning(canonical.relationships),
      },
      timing: {
        ...timing,
        season: timing,
        semester1: this.semesterMeaning(canonical.timing, true),
        semester2: this.semesterMeaning(canonical.timing, false),
        currentState: this.currentStateMeaning(canonical.timing),
        dailyFocus: this.dailyFocusMeaning(canonical.timing),
        growthArea: this.growthAreaMeaning(canonical.timing),
      },
      health: this.generateHealth(canonical.health),
      spirituality: this.generateSpiritualityHuman(canonical.spirituality),
      soulIdentity: this.generateSoulIdentity(canonical.soulIdentity),
    };
  }

  private static cleanItems(items: Array<string | number | undefined | null>): string[] {
    return items
      .map((item) => String(item ?? "").trim())
      .filter(Boolean);
  }

  private static readable(items: Array<string | number | undefined | null>, fallback: string, limit = 4): string {
    const clean = this.cleanItems(items).slice(0, limit);
    if (!clean.length) return fallback;
    if (clean.length === 1) return clean[0];
    return `${clean.slice(0, -1).join(", ")} dan ${clean[clean.length - 1]}`;
  }

  private static composeBodyMechanics(domain: CanonicalIdentity["health"]): HumanNarrative {
    return {
      short: "Tubuhmu Punya Cara Sendiri",
      medium: "Tubuhmu bekerja paling baik saat cara makan, ruang, aktivitas, dan istirahat saling mendukung—bukan saat kamu memaksanya mengikuti ritme orang lain.",
      long: "Contohnya, ketika konsentrasi menurun atau tubuh terasa berat, jangan langsung menyalahkan disiplinmu. Coba ubah satu hal sederhana: makan tanpa terburu-buru, pindah ke ruang yang lebih nyaman, atau berhenti sebelum benar-benar kehabisan tenaga.",
    };
  }

  private static hiddenCharacterMeaning(domain: CanonicalIdentity["identity"]["hiddenCharacter"]): HumanNarrative {
    const inward = domain.soulUrge % 2 === 0;
    return {
      short: inward ? "Kedalaman yang Tidak Selalu Terlihat" : "Dorongan untuk Menjadi Diri Sendiri",
      medium: inward
        ? "Di balik sikapmu yang terlihat tenang, ada kebutuhan kuat untuk merasa aman, dipahami, dan tidak dipaksa membuka diri sebelum siap."
        : "Di balik caramu beradaptasi, ada bagian diri yang ingin bergerak bebas, menyampaikan isi hati, dan memilih hidup dengan caranya sendiri.",
      long: "Contohnya, kamu mungkin terlihat baik-baik saja dalam sebuah percakapan padahal masih memproses banyak hal. Beri dirimu waktu sebelum menjawab, lalu ungkapkan satu kebutuhan dengan jujur tanpa merasa harus menjelaskan semuanya.",
    };
  }

  private static authorityMeaning(authority: string): HumanNarrative {
    const value = authority.toLowerCase();
    if (value.includes("emotional")) return { short: "Tunggu Sampai Perasaan Jernih", medium: "Keputusan besar jarang terasa jelas pada gelombang emosi pertama. Kamu membutuhkan waktu agar rasa senang, takut, atau kecewa mereda sebelum mengetahui jawaban yang sungguh milikmu.", long: "Contohnya, jangan langsung menerima tawaran penting saat sedang sangat bersemangat. Tidur satu malam, baca kembali besok, lalu pilih ketika tubuh dan pikiran terasa lebih tenang." };
    if (value.includes("sacral")) return { short: "Dengarkan Respons Tubuh", medium: "Jawabanmu sering muncul sebagai rasa hidup, tertarik, berat, atau enggan sebelum pikiran sempat menyusun alasan.", long: "Contohnya, saat memilih kegiatan, ucapkan pilihannya dengan lantang dan perhatikan tubuhmu: apakah terasa mengembang atau justru mengerut? Gunakan respons pertama itu sebagai bahan keputusan." };
    if (value.includes("splenic")) return { short: "Percayai Sinyal Tenang yang Pertama", medium: "Intuisimu cenderung hadir cepat dan lembut sebagai rasa aman atau waspada. Ia tidak berteriak dan sering tidak mengulang pesan yang sama.", long: "Contohnya, jika sebuah situasi membuat tubuhmu langsung menegang meski semuanya tampak baik di atas kertas, berhenti sejenak dan periksa apa yang belum kamu lihat." };
    return { short: "Beri Keputusan Ruang Bernapas", medium: "Kejernihanmu tumbuh ketika kamu tidak mengambil keputusan hanya untuk menghentikan tekanan dari luar.", long: "Contohnya, katakan 'aku perlu memikirkannya' sebelum menjawab permintaan penting. Perhatikan pilihan mana yang tetap terasa benar setelah desakan mereda." };
  }

  private static vitalityMeaning(domain: CanonicalIdentity["energy"]): HumanNarrative {
    return domain.vitality.sacralDefined
      ? { short: "Tenaga Tumbuh dari Keterlibatan", medium: "Staminamu menguat ketika kamu terlibat dalam hal yang benar-benar menarik. Pekerjaan yang terasa kosong justru dapat mengurasmu meski secara fisik tidak berat.", long: "Contohnya, jika sore hari kamu lelah setelah pekerjaan yang tidak bermakna tetapi kembali hidup saat mengerjakan hal yang disukai, itu tanda energi membutuhkan keterlibatan, bukan sekadar istirahat. Sisihkan waktu rutin untuk aktivitas yang menyalakanmu." }
      : { short: "Tenaga Perlu Dijaga dengan Sadar", medium: "Kamu mudah menyerap tempo orang lain dan tanpa sadar bekerja melewati batas tubuhmu. Kekuatanmu bukan pada bekerja tanpa henti, melainkan mengetahui kapan cukup.", long: "Contohnya, berhentilah saat energimu mulai turun—bukan setelah benar-benar habis. Buat jeda singkat di antara kegiatan dan jangan memakai stamina orang lain sebagai ukuran kemampuanmu." };
  }

  private static emotionalNeedsMeaning(domain: CanonicalIdentity["shadow"]): HumanNarrative {
    return { short: "Aman Saat Perasaanmu Diterima", medium: "Kamu lebih stabil ketika perasaanmu boleh hadir tanpa segera diperbaiki, dihakimi, atau dibandingkan. Yang paling kamu perlukan sering kali bukan solusi, melainkan ruang untuk dipahami.", long: "Contohnya, saat sedang berat, katakan kepada orang tepercaya: 'Aku belum butuh nasihat, aku hanya ingin didengarkan.' Latihan kecil ini membantu orang lain mencintaimu dengan cara yang benar-benar kamu perlukan." };
  }

  private static triggerMeaning(domain: CanonicalIdentity["shadow"]): HumanNarrative {
    const intense = domain.emotionalTriggers.aspects.length > 0;
    return { short: intense ? "Peka terhadap Tekanan dan Perebutan Kendali" : "Peka Saat Batasmu Tidak Dihormati", medium: "Reaksimu menguat ketika merasa didesak, tidak didengar, atau kehilangan pilihan. Di balik kemarahan atau kecemasan biasanya ada kebutuhan untuk kembali merasa aman dan memiliki kendali atas dirimu.", long: "Contohnya, ketika percakapan mulai memanas, jangan paksa diri menyelesaikannya saat itu juga. Minta jeda, rasakan kaki di lantai, lalu kembali ketika kamu bisa menyampaikan kebutuhan tanpa menyerang." };
  }

  private static ancestralMeaning(domain: CanonicalIdentity["shadow"]): HumanNarrative {
    const hasPressure = domain.ancestralLegacy.vedicChallenges.length > 0;
    return { short: "Mewarisi Ketangguhan dan Beban", medium: hasPressure ? "Keluargamu mungkin mengajarkan kekuatan melalui tanggung jawab, ketahanan, atau tuntutan untuk selalu sanggup. Hadiahnya adalah daya tahan; bebannya adalah sulit meminta bantuan." : "Ada pola keluarga yang membuatmu terbiasa menjaga keadaan dan mendahulukan kebutuhan bersama. Kekuatan ini perlu diimbangi dengan hak untuk memiliki pilihan sendiri.", long: "Contohnya, perhatikan satu kebiasaan yang kamu jalankan hanya karena 'di keluarga kami selalu begitu.' Pertahankan nilai yang menyehatkan, tetapi izinkan dirimu menghentikan pola yang membuatmu terus mengecil." };
  }

  private static soulLessonMeaning(domain: CanonicalIdentity["shadow"]): HumanNarrative {
    const moving = Boolean(domain.soulLesson.northNode || domain.soulLesson.rahu);
    return { short: "Berani Meninggalkan Cara Lama", medium: moving ? "Pertumbuhanmu meminta keberanian bergerak menuju pengalaman baru, meski bagian dirimu masih ingin bertahan pada pola yang sudah dikenal." : "Pelajaran terbesarmu adalah memilih respons yang lebih sadar daripada mengulang cara lama hanya karena terasa aman.", long: "Contohnya, ketika pilihan baru terasa menakutkan tetapi sehat, ambil satu langkah kecil alih-alih menunggu rasa takut hilang sepenuhnya. Pertumbuhan sering datang bersama rasa canggung." };
  }

  private static soulTraceMeaning(domain: CanonicalIdentity["shadow"]): HumanNarrative {
    const repeated = domain.soulTrace.karmicTail.length > 0;
    return { short: "Tema Lama yang Meminta Cara Baru", medium: repeated ? "Ada pola hidup yang cenderung kembali dalam bentuk berbeda sampai kamu berhenti meresponsnya secara otomatis. Pola itu bukan hukuman; ia menunjukkan tempat kedewasaanmu sedang dibangun." : "Perjalananmu membawa tema berulang yang mengajakmu melihat diri dengan lebih jujur dan lembut.", long: "Contohnya, jika konflik serupa terus muncul di relasi atau pekerjaan, jangan hanya bertanya 'mengapa ini terjadi lagi?' Tanyakan juga, 'respons baru apa yang belum pernah kucoba?'" };
  }

  private static moneyBlockMeaning(domain: CanonicalIdentity["shadow"]): HumanNarrative {
    const cautious = domain.moneyBlock.unfavorableElements.length > 1;
    return { short: cautious ? "Takut Salah Mengelola yang Dimiliki" : "Nilai Diri Mudah Tercampur dengan Uang", medium: "Tekanan finansial dapat membuatmu terlalu menahan, terlalu cepat membuktikan diri, atau merasa harga dirimu bergantung pada hasil. Hambatannya bukan sekadar uang, tetapi rasa aman di baliknya.", long: "Contohnya, sebelum membeli, menolak peluang, atau bekerja berlebihan, tanyakan: 'Ini keputusan yang jernih atau reaksi karena takut tidak cukup?' Buat satu keputusan kecil berdasarkan kebutuhan nyata, bukan kepanikan." };
  }

  private static loveBlockMeaning(domain: CanonicalIdentity["shadow"]): HumanNarrative {
    const guarded = domain.loveBlock.loveLine.length > 0;
    return { short: guarded ? "Melindungi Hati dengan Menahan Diri" : "Sulit Mempercayai Kedekatan", medium: "Saat hubungan mulai penting, kamu bisa menjadi terlalu waspada, menebak-nebak perasaan orang, atau menyembunyikan kebutuhan agar tidak kecewa. Perlindungan ini masuk akal, tetapi dapat membuat cinta sulit mendekat.", long: "Contohnya, daripada menguji apakah seseorang peduli, sampaikan satu kebutuhan sederhana secara langsung. Lihat apakah tindakannya konsisten; kepercayaan dibangun dari bukti kecil yang berulang." };
  }

  private static potentialTalentMeaning(domain: CanonicalIdentity["talents"]): HumanNarrative {
    const varied = domain.potentialTalents.tenGods.length + domain.potentialTalents.majorYogas.length > 2;
    return { short: varied ? "Bakat Menghubungkan Banyak Kemampuan" : "Kemampuan yang Tumbuh lewat Latihan", medium: varied ? "Kamu berpotensi kuat saat menggabungkan analisis, komunikasi, dan tindakan. Bakatmu tidak selalu terlihat sebagai satu keahlian tunggal, tetapi sebagai kemampuan menyatukan bagian-bagian yang terpisah." : "Ada kemampuan yang baru terlihat setelah kamu cukup lama berlatih dan diberi tanggung jawab nyata. Potensimu tumbuh melalui pengalaman, bukan hanya rasa percaya diri.", long: "Contohnya, pilih proyek kecil yang memerlukan berpikir, berkomunikasi, dan menyelesaikan sesuatu. Catat bagian mana yang terasa alami dan bagian mana yang semakin mudah setelah diulang." };
  }

  private static workStyleMeaning(domain: CanonicalIdentity["talents"]): HumanNarrative {
    const structured = /struktur|stabil|operasional|presisi|sistem/i.test(domain.workStyle.baziCareer);
    return { short: structured ? "Berkarya Baik dengan Struktur yang Jelas" : "Berkarya Baik dengan Ruang Bergerak", medium: structured ? "Kamu bekerja paling tenang ketika tujuan, peran, dan standar keberhasilan jelas. Struktur membebaskan energimu untuk menghasilkan kualitas." : "Kamu bekerja paling hidup ketika diberi ruang mencoba, menghubungkan ide, dan menyesuaikan cara kerja. Pengawasan yang terlalu rapat dapat mematikan inisiatifmu.", long: "Contohnya, sebelum memulai proyek, sepakati hasil dan batas waktunya. Setelah itu, atur cara kerjamu sendiri dan evaluasi berdasarkan hasil, bukan berdasarkan apakah prosesmu sama dengan orang lain." };
  }

  private static wealthFlowMeaning(domain: CanonicalIdentity["talents"]): HumanNarrative {
    const collaborative = /jejaring|pelayanan|komunikasi|kolaborasi/i.test(domain.wealthFlow.moneyStyle);
    return { short: collaborative ? "Rezeki Tumbuh melalui Hubungan dan Nilai" : "Rezeki Tumbuh melalui Konsistensi", medium: collaborative ? "Peluang lebih mudah terbuka ketika orang memahami nilai yang kamu berikan dan percaya pada caramu bekerja. Hubungan yang sehat lebih berguna daripada mengejar semua kesempatan." : "Aliran materi menguat ketika kamu mengelola peluang dengan disiplin, menyelesaikan yang dimulai, dan tidak bergantung pada momentum sesaat.", long: "Contohnya, pilih satu kontribusi yang paling berguna bagi orang lain, jelaskan nilainya dengan sederhana, lalu kerjakan secara konsisten selama beberapa minggu sebelum menilai hasilnya." };
  }

  private static relationshipPatternMeaning(domain: CanonicalIdentity["relationships"]): HumanNarrative {
    const style = domain.relationshipStyle.toLowerCase();
    const needsSpace = /ruang|bebas|mandiri|independen/i.test(style);
    return { short: needsSpace ? "Dekat tanpa Kehilangan Diri" : "Kedekatan Tumbuh melalui Konsistensi", medium: needsSpace ? "Kamu membutuhkan hubungan yang hangat sekaligus memberi ruang bernapas. Kedekatan terasa sehat ketika tidak berubah menjadi pengawasan atau tuntutan terus-menerus." : "Kamu cenderung membuka hati melalui kehadiran yang dapat dipercaya. Kata-kata indah penting, tetapi tindakan yang konsisten membuatmu benar-benar merasa aman.", long: "Contohnya, sepakati cara menjaga kedekatan sekaligus waktu pribadi. Jangan menunggu kesal untuk meminta ruang atau perhatian; bicarakan kebutuhan itu saat hubungan sedang tenang." };
  }

  private static loveLanguageMeaning(domain: CanonicalIdentity["relationships"]): HumanNarrative {
    const values = Object.values(domain.loveLanguage.elementBalance);
    const active = values.length ? Math.max(...values) > 30 : false;
    return { short: active ? "Cinta Terasa Nyata melalui Tindakan" : "Cinta Terasa Aman melalui Kehadiran", medium: active ? "Kamu mudah menangkap kasih sayang melalui bantuan konkret, perhatian yang diwujudkan, dan seseorang yang benar-benar hadir saat dibutuhkan." : "Kamu lebih merasa dicintai ketika seseorang memberi waktu, mendengarkan tanpa terburu-buru, dan menciptakan suasana yang membuatmu bisa menjadi diri sendiri.", long: "Contohnya, beri tahu orang terdekat satu tindakan kecil yang membuatmu merasa diperhatikan—seperti menemani tanpa ponsel, membantu tugas tertentu, atau menanyakan kabarmu dengan sungguh-sungguh." };
  }

  private static boundariesMeaning(domain: CanonicalIdentity["relationships"]): HumanNarrative {
    const sensitive = domain.healthyBoundaries.undefinedCenters.length >= 4;
    return { short: sensitive ? "Mudah Menyerap Tekanan Orang Lain" : "Batas Sehat Menjaga Kedekatan", medium: sensitive ? "Kamu peka terhadap suasana dan ekspektasi sekitar. Tanpa batas yang jelas, kamu bisa mengira beban orang lain adalah tanggung jawabmu." : "Kamu mampu hadir bagi orang lain, tetapi tetap perlu membedakan empati dari kewajiban menyelesaikan semua masalah mereka.", long: "Contohnya, sebelum mengatakan ya, tanyakan apakah kamu benar-benar mampu dan bersedia. Kalimat 'aku peduli, tetapi aku tidak bisa mengambil ini sekarang' adalah bentuk kejujuran, bukan penolakan kasih." };
  }

  private static semesterMeaning(domain: CanonicalIdentity["timing"], first: boolean): HumanNarrative {
    const expansive = ["Jupiter", "Venus"].includes(domain.currentDasha);
    if (first) return expansive
      ? { short: "Paruh Awal untuk Membuka Ruang", medium: "Awal tahun mendukung eksplorasi, belajar, dan memperluas kemungkinan. Kuncinya bukan mengambil semua peluang, tetapi mengenali mana yang sungguh sejalan.", long: "Contohnya, pilih satu bidang yang ingin kamu perluas dan buat percobaan kecil selama tiga bulan. Beri ruang untuk belajar sebelum menuntut hasil besar." }
      : { short: "Paruh Awal untuk Merapikan Fondasi", medium: "Awal tahun lebih berguna untuk menyelesaikan urusan tertunda, menata ritme, dan memperkuat hal-hal dasar sebelum bergerak lebih jauh.", long: "Contohnya, pilih satu area yang paling menguras energi—keuangan, jadwal, atau relasi—lalu rapikan satu kebiasaan inti sebelum menambah target baru." };
    return expansive
      ? { short: "Paruh Akhir untuk Mewujudkan Peluang", medium: "Hal yang dipelajari dan dibuka pada awal tahun meminta bentuk yang lebih nyata. Waktunya memilih, berkomitmen, dan membawa satu kemungkinan sampai selesai.", long: "Contohnya, hentikan proyek yang hanya menarik di permukaan dan arahkan tenaga pada satu karya atau keputusan yang paling sesuai dengan nilai hidupmu." }
      : { short: "Paruh Akhir untuk Menguatkan Hasil", medium: "Paruh akhir tahun mengajakmu mempertahankan ritme yang sudah dibangun. Kemajuan datang dari ketekunan, bukan perubahan arah yang terus-menerus.", long: "Contohnya, tinjau apa yang sudah berjalan baik, pertahankan dua kebiasaan yang paling membantu, dan lepaskan target yang tidak lagi relevan." };
  }

  private static currentStateMeaning(domain: CanonicalIdentity["timing"]): HumanNarrative {
    const ready = domain.currentState === "ready";
    return ready
      ? { short: "Kamu Sedang Punya Fondasi untuk Melangkah", medium: "Banyak bagian penting dalam dirimu sudah cukup terbaca untuk dijadikan bahan refleksi. Sekarang tantangannya bukan mencari lebih banyak penjelasan, tetapi menguji satu pemahaman dalam hidup nyata.", long: "Contohnya, pilih satu insight yang paling mengena minggu ini dan praktikkan dalam satu percakapan, keputusan, atau kebiasaan. Perhatikan perubahan kecil yang benar-benar terjadi." }
      : { short: "Kamu Sedang Menyusun Kejelasan", medium: "Tidak semua jawaban perlu hadir sekaligus. Fase ini lebih cocok untuk mengamati pola, mengumpulkan pengalaman, dan memberi nama pada apa yang sedang kamu rasakan.", long: "Contohnya, catat satu momen setiap hari ketika energimu naik atau turun. Setelah beberapa hari, lihat situasi apa yang paling sering memengaruhimu." };
  }

  private static dailyFocusMeaning(domain: CanonicalIdentity["timing"]): HumanNarrative {
    const connection = /hubung|bersama|komunitas|relasi|cinta/i.test(domain.dailyFocus);
    return connection
      ? { short: "Hadir Penuh dalam Satu Hubungan", medium: "Fokus hari ini adalah memperbaiki kualitas kehadiranmu, bukan menambah banyak aktivitas. Satu percakapan yang jujur dapat lebih berarti daripada banyak interaksi yang setengah hati.", long: "Contohnya, pilih satu orang dan dengarkan selama sepuluh menit tanpa menyela atau memegang ponsel. Tanyakan apa yang paling mereka butuhkan hari ini." }
      : { short: "Selesaikan Satu Hal yang Bermakna", medium: "Fokus hari ini adalah mengurangi kebisingan dan membawa satu niat menjadi tindakan kecil. Kejelasan tumbuh ketika kamu berhenti memegang terlalu banyak hal sekaligus.", long: "Contohnya, pilih satu tugas yang paling meringankan hidupmu, kerjakan selama lima belas menit tanpa berpindah aplikasi, lalu berhenti dan nilai dampaknya." };
  }

  private static growthAreaMeaning(domain: CanonicalIdentity["timing"]): HumanNarrative {
    const release = /lepas|ubah|transform|bayangan|tantangan/i.test(domain.growthArea);
    return release
      ? { short: "Belajar Melepaskan Respons Lama", medium: "Pertumbuhanmu saat ini terletak pada kemampuan berhenti sejenak sebelum mengulang respons yang dulu terasa aman tetapi kini membatasi.", long: "Contohnya, saat terpicu, tunda pesan atau keputusan selama sepuluh menit. Tanyakan respons apa yang melindungi harga dirimu tanpa melukai hubungan." }
      : { short: "Menjaga Konsistensi yang Lembut", medium: "Pertumbuhanmu tidak membutuhkan perubahan dramatis. Yang paling penting adalah hadir kembali pada kebiasaan yang menyehatkan, terutama setelah hari yang sulit.", long: "Contohnya, pilih satu praktik lima menit—bernapas, menulis, berjalan, atau merapikan ruang—dan lakukan setiap hari selama seminggu tanpa menuntut kesempurnaan." };
  }

  private static generateIdentity(domain: CanonicalIdentity["identity"]): HumanNarrative {
    const isTaurus = domain.sunSign === "Taurus";
    const isGemini = domain.sunSign === "Gemini";
    const isLibra = domain.sunSign === "Libra";
    const isVirgo = domain.sunSign === "Virgo";
    
    let short = "Sang Penjaga Keseimbangan";
    let medium = "Kamu memiliki insting alami untuk menciptakan ketertiban dari kekacauan. Di mana orang lain melihat kebingungan, kamu melihat struktur.";
    let long = "Inti dari kepribadianmu didorong oleh kebutuhan yang dalam akan keadilan dan struktur. Kamu tidak bisa tenang melihat ketimpangan. Kekuatan sejatimu muncul saat kamu memadukan logika tajammu dengan empati yang luas.";

    if (isTaurus) {
      short = "Sang Pembangun Fondasi";
      medium = "Kamu adalah jangkar yang stabil di tengah badai. Orang lain mencari ketenangan dari kehadiranmu yang tak tergoyahkan.";
      long = "Inti dari dirimu adalah ketekunan dan kesetiaan pada apa yang kamu yakini. Meskipun dunia bergerak sangat cepat, kamu memiliki ritme tersendiri yang memastikan setiap langkah yang kamu ambil kokoh dan tidak mudah diruntuhkan. Kemampuanmu untuk menciptakan keindahan dan kenyamanan membuatmu menjadi tempat berlindung bagi orang terdekatmu.";
    } else if (isGemini) {
      short = "Sang Penghubung Gagasan";
      medium = "Pikiranmu bekerja lebih cepat dari orang kebanyakan, selalu mencari koneksi antara dua ide yang tampaknya tidak berhubungan.";
      long = "Rasa ingin tahumu yang tak terbatas adalah bahan bakar utamamu. Kamu menyerap informasi layaknya spons dan membagikannya kembali dengan cara yang membuat orang lain terinspirasi. Tantangan terbesarmu adalah fokus, karena dunia ini dipenuhi oleh terlalu banyak hal menarik untuk kamu pelajari dalam satu masa kehidupan.";
    } else if (isVirgo) {
      short = "Sang Penyempurna Detail";
      medium = "Kamu melihat hal-hal kecil yang dilewatkan oleh dunia, dan kamu selalu memiliki dorongan untuk membuatnya menjadi lebih baik.";
      long = "Ada sebuah standar ekselensi dalam pikiranmu yang terus menyala. Pengabdianmu pada kualitas sering kali membuatmu tanpa sadar memikul tanggung jawab lebih besar dari yang seharusnya. Ingatlah bahwa tidak semua hal perlu menjadi sempurna untuk bisa dinikmati atau memberikan nilai yang besar.";
    }

    return { short, medium, long };
  }

  private static generatePurpose(domain: CanonicalIdentity["purpose"]): HumanNarrative {
    if (domain.lifePath === 22) {
      return {
        short: "Membangun Warisan Nyata",
        medium: "Misimu bukan sekadar memimpikan perubahan besar, melainkan meletakkan batu pertama untuk membangun struktur yang akan bertahan lintas generasi.",
        long: "Kamu dilahirkan dengan kapasitas visi yang sangat besar, sering kali merasa bahwa tanggung jawab dunia ada di pundakmu. Namun, visi yang besar membutuhkan fondasi kehidupan sehari-hari yang sangat praktis. Panggilanmu adalah menerjemahkan mimpi-mimpimu yang rasanya mustahil menjadi sistem, struktur, atau karya yang memberikan rasa aman bagi banyak orang.",
      };
    } else if (domain.lifePath === 6) {
      return {
        short: "Menciptakan Harmoni dan Perlindungan",
        medium: "Jalan hidupmu adalah tentang tanggung jawab, cinta tanpa syarat, dan menjadi perekat yang menyatukan komunitas atau keluargamu.",
        long: "Ada panggilan alami di dalam dirimu untuk mengayomi, membimbing, dan menyembuhkan. Namun, pelajaran terbesar dari misimu adalah mengetahui kapan harus berhenti menolong. Kamu hanya bisa benar-benar melindungi orang lain saat kebutuhan dan kebahagiaanmu sendiri sudah terpenuhi. Kepemimpinanmu berasal dari kasih sayang.",
      };
    } else if (domain.lifePath === 4) {
      return {
        short: "Menciptakan Keteraturan Berkelanjutan",
        medium: "Kamu hadir untuk membawa stabilitas di lingkungan yang kacau dengan bekerja secara sistematis, sabar, dan terstruktur.",
        long: "Misimu adalah pembuktian bahwa proses yang benar akan menghasilkan karya yang tak lekang oleh waktu. Kepercayaan diri sejatimu akan muncul setelah kamu berhasil membangun sesuatu—baik karier, keluarga, atau karya—selangkah demi selangkah. Abaikan jalan pintas, kekuatanmu ada pada ketahananmu yang tidak dimiliki oleh orang lain.",
      };
    } else if (domain.lifePath === 9) {
      return {
        short: "Menjadi Saksi Kebijaksanaan Penuh",
        medium: "Tujuanmu adalah mencapai pemahaman tanpa syarat, menutup siklus lama, dan membagikan kebenaran universal kepada dunia.",
        long: "Kehidupan memintamu untuk melihat dunia dari perspektif yang sangat luas, seolah kamu sedang berdiri di puncak gunung melihat seluruh umat manusia. Misi terbesarmu melibatkan pengabdian, pelepasan ego, dan keberanian untuk membiarkan hal-hal yang sudah usang pergi agar kebaruan bisa lahir di komunitasmu.",
      };
    } else {
      // Default (Life Path 11 - Eva)
      return {
        short: "Menginspirasi Melalui Pencerahan",
        medium: "Kamu adalah saluran ide-ide revolusioner. Kehadiranmu dirancang untuk mengangkat kesadaran orang-orang di sekitarmu.",
        long: "Panggilan jiwamu menuntutmu untuk berjalan di garis tipis antara intuisi batin yang sangat tajam dan realitas dunia fisik. Seringkali kamu merasa tekanan energi yang sangat besar untuk mencapai sesuatu. Ketahuilah bahwa kamu tidak perlu merencanakan semuanya secara logis; biarkan wawasan batinmu memandumu secara spontan menuju dampak besar yang telah menunggumu.",
      };
    }
  }

  private static generateEnergy(domain: CanonicalIdentity["energy"]): HumanNarrative {
    const isGenerator = domain.strategy.includes("Respond");
    const isProjector = domain.strategy.includes("Invitation");
    const isReflector = domain.strategy.includes("Lunar");

    if (isGenerator) {
      return {
        short: "Merespons Aliran Kehidupan",
        medium: "Energi tertinggimu aktif bukan saat kamu memaksakan kehendak, melainkan saat kamu menanggapi hal-hal yang membuat batinmu seketika bersemangat.",
        long: "Tubuhmu adalah kompas yang paling akurat. Ketika sesuatu terasa tepat, kamu memiliki daya tahan dan stamina energi yang nyaris tak terbatas. Namun, jika kamu memaksa mengerjakan hal yang batinmu menolak—walau secara logika masuk akal—kamu akan cepat terbakar dan merasa sangat frustrasi. Berhentilah memikirkan apa yang 'harus' kamu lakukan, mulailah merasakan apa yang 'menarik' tubuhmu.",
      };
    } else if (isProjector) {
      return {
        short: "Mengarahkan Melalui Kebijaksanaan",
        medium: "Kamu dirancang untuk membaca situasi dan membimbing sistem energi orang lain, bukan untuk bekerja keras layaknya mesin.",
        long: "Keajaibanmu baru akan bekerja saat orang lain mengenali nilaimu dan mengundangmu untuk terlibat. Jangan buang energimu untuk meyakinkan mereka yang belum siap mendengarmu; hal itu hanya akan berujung pada rasa pahit dan kelelahan. Istirahatlah dengan teratur, fokuslah pada keahlianmu, dan biarkan undangan yang tepat datang menghampiri kebijaksanaanmu.",
      };
    } else {
      return {
        short: "Memantulkan Realitas Sekitar",
        medium: "Kamu bertindak sebagai cermin bagi lingkunganmu. Kesehatan komunitasmu tercermin dari seberapa sehat dirimu.",
        long: "Kamu sangat reseptif terhadap apa pun dan siapa pun yang ada di sekitarmu. Agar kamu bisa mengambil keputusan besar yang tepat, kamu membutuhkan waktu untuk menyerap informasi dari segala sudut. Jangan biarkan tekanan tenggat waktu membuatmu tergesa-gesa; kebenaranmu membutuhkan waktu untuk mengendap perlahan sebelum menjadi tindakan yang jernih.",
      };
    }
  }

  private static generateShadow(domain: CanonicalIdentity["shadow"]): HumanNarrative {
    const tailStr = domain.karmicTail.join("-");

    if (tailStr === "18-6-15") {
      return {
        short: "Ketakutan akan Kesendirian",
        medium: "Pola paling merugikanmu adalah membiarkan ketakutan akan penolakan membuatmu bertahan dalam interaksi yang tidak sehat.",
        long: "Kamu memiliki empati yang begitu besar sehingga sering kali kamu menyerap masalah orang lain dan menganggapnya sebagai tanggung jawabmu. Ilusi bahwa 'aku bisa memperbaiki mereka' sering kali membuatmu melupakan kebutuhanmu sendiri. Kesembuhanmu dimulai dengan kesadaran bahwa mengatakan 'tidak' tidak membuatmu menjadi jahat—itu adalah bentuk rasa hormat pada dirimu sendiri.",
      };
    } else if (tailStr === "15-5-8") {
      return {
        short: "Perfeksionisme dan Kontrol",
        medium: "Kamu sering merasa bahwa segalanya akan berantakan jika tidak berada di bawah kendalimu langsung.",
        long: "Luka intimu membuatmu sangat takut pada ketidakpastian. Sebagai mekanisme pertahanan, kamu membangun struktur, aturan, dan ekspektasi yang sangat kaku, baik untuk dirimu maupun orang di sekitarmu. Sadarilah bahwa kendali penuh adalah sebuah ilusi; kedamaian pikiran sejati baru bisa hadir ketika kamu belajar mempercayai proses yang berjalan organik tanpa harus kamu atur setiap detailnya.",
      };
    } else if (tailStr === "21-4-10") {
      return {
        short: "Perlawanan pada Perubahan",
        medium: "Kamu sering memegang erat hal yang sudah biasa karena takut mengambil risiko pada hal yang belum pasti.",
        long: "Pola sabotasemu muncul ketika kehidupan memintamu untuk melangkah maju namun ketakutan akan kegagalan membuatmu lumpuh. Kamu mungkin terjebak memikirkan skenario terburuk alih-alih melihat peluang. Langkah pertama untuk memutus pola ini adalah mengakui bahwa mempertahankan stagnasi jauh lebih menyakitkan daripada mengambil satu langkah berani menuju ketidakpastian.",
      };
    } else if (tailStr === "9-3-21") {
      return {
        short: "Isolasi karena Disalahpahami",
        medium: "Ada kecenderungan untuk menarik diri secara ekstrem saat kamu merasa pendapatmu tidak dihargai.",
        long: "Wawasanmu yang sering kali melampaui zaman membuatmu rentan merasa kesepian meski berada di keramaian. Namun, memilih untuk bersembunyi dari dunia hanya akan memperbesar rasa frustrasi. Daripada menutup diri karena sakit hati, belajarlah menemukan cara kreatif untuk mengekspresikan sudut pandangmu tanpa menuntut persetujuan instan dari orang-orang yang belum siap mengerti.",
      };
    } else {
      // 12-16-4
      return {
        short: "Mengorbankan Harga Diri",
        medium: "Kamu kerap kali mendahulukan kenyamanan orang lain di atas kesejahteraan fisik dan mentalmu sendiri.",
        long: "Pola lama yang sering terulang adalah keyakinan bawah sadar bahwa kamu hanya akan dicintai jika kamu terus-menerus memberikan sesuatu. Hal ini membuat energimu terkuras karena kamu tidak tahu cara menerima bantuan. Belajarlah untuk mengizinkan dirimu dilayani, dan ketahuilah bahwa keberadaanmu saja sudah cukup berharga tanpa kamu harus terus menjadi pahlawan bagi orang lain.",
      };
    }
  }

  private static generateTalents(domain: CanonicalIdentity["talents"]): HumanNarrative {
    const isGenerator = domain.hdType.includes("Generator");
    const isProjector = domain.hdType.includes("Projector");

    if (isGenerator) {
      return {
        short: "Daya Cipta Tanpa Henti",
        medium: "Bakat terbesarmu adalah mengubah ide-ide abstrak menjadi kenyataan fisik yang bisa disentuh, digunakan, atau dinikmati oleh orang banyak.",
        long: "Ada bahan bakar produktivitas di dalam dirimu yang sangat magnetis. Ketika kamu mengerjakan sesuatu yang benar-benar kamu cintai, antusiasmemu menular dan mengangkat moral semua orang yang ada di ruangan yang sama. Kamu adalah katalis hidup yang mampu mengubah lingkungan apatis menjadi penuh energi hanya lewat dedikasimu terhadap karya.",
      };
    } else if (isProjector) {
      return {
        short: "Efisiensi dan Arahan Visi",
        medium: "Kejeniusanmu bukan terletak pada seberapa banyak pekerjaan yang bisa kamu angkat, melainkan seberapa jeli kamu menemukan cara terbaik untuk melakukannya.",
        long: "Kamu dilahirkan dengan insting untuk mengenali potensi sejati di dalam diri orang lain. Bakatmu adalah menjadi arsitek sistem kehidupan: melihat hambatan, memberikan insight yang akurat, dan menempatkan setiap orang pada posisi di mana mereka bisa bersinar. Di dunia yang sibuk berlari tanpa arah, kontribusi terbesarmu adalah memberikan peta yang benar.",
      };
    } else {
      return {
        short: "Menjadi Barometer Komunitas",
        medium: "Kapasitas empati dan kepekaanmu membuatmu ahli dalam mendiagnosis masalah struktural di dalam komunitas atau perusahaan.",
        long: "Bakat utamamu adalah menjadi cermin yang sangat objektif dan jernih. Kamu bisa dengan cepat merasakan siapa yang tidak otentik dan sistem apa yang sedang rusak sebelum orang lain menyadarinya. Kehadiranmu sangat esensial bagi kelompok mana pun karena kamu menjaga agar mereka tetap sadar dan berada pada jalur integritas.",
      };
    }
  }

  private static generateRelationships(domain: CanonicalIdentity["relationships"]): HumanNarrative {
    const isVenus = domain.darakaraka === "Venus" || domain.darakaraka === "Moon";
    const isSaturn = domain.darakaraka === "Saturn" || domain.darakaraka === "Mars";

    if (isSaturn) {
      return {
        short: "Kesetiaan Melalui Struktur",
        medium: "Dalam hubungan, kamu mencari kepastian, komitmen jangka panjang, dan rasa saling hormat melebihi sekadar romansa sesaat.",
        long: "Kamu mungkin butuh waktu lebih lama dari orang lain untuk benar-benar membuka hati dan membiarkan seseorang masuk. Namun setelah kamu berkomitmen, kesetiaanmu nyaris tak tergoyahkan. Tantangan terbesar dalam kehidupan cintamu adalah melembutkan pertahanan dirimu; belajarlah bahwa kerentanan emosional bukanlah sebuah kelemahan, melainkan jembatan menuju keintiman yang sejati.",
      };
    } else if (isVenus) {
      return {
        short: "Pencarian Harmoni dan Keindahan",
        medium: "Kamu sangat responsif terhadap sentuhan fisik, lingkungan yang damai, dan bentuk-bentuk perhatian yang sangat nyata.",
        long: "Hubungan adalah tempat di mana kamu belajar paling banyak tentang kehidupan. Kamu secara alami menarik orang-orang dengan kelembutanmu, tetapi ini juga berarti kamu rentan menjadi tempat pembuangan masalah emosional mereka. Cinta sejatimu akan mekar ketika kamu menemukan seseorang yang tidak hanya menikmati kasih sayangmu, tetapi secara konsisten berusaha menciptakan lingkungan yang nyaman dan aman untukmu berlindung.",
      };
    } else {
      return {
        short: "Koneksi Melalui Ide",
        medium: "Kamu membutuhkan pasangan yang bisa menyeimbangi kecepatan pikiranmu dan memberikan ruang untuk bertukar gagasan.",
        long: "Bagimu, percakapan yang mendalam dan menstimulasi secara intelektual adalah bentuk awal dari ketertarikan romantis. Jika komunikasi terhenti, koneksi emosional pun akan memudar. Hambatan terbesarmu adalah terlalu sering menganalisis perasaan alih-alih sekadar merasakannya; izinkan hatimu berbicara tanpa harus masuk akal secara logika.",
      };
    }
  }

  private static generateTiming(domain: CanonicalIdentity["timing"]): HumanNarrative {
    const dasha = domain.currentDasha;

    if (dasha === "Rahu" || dasha === "Ketu") {
      return {
        short: "Era Transformasi Mendalam",
        medium: "Ini bukan musim untuk mencari kenyamanan. Ini adalah waktu di mana identitas lamamu diruntuhkan agar versi yang lebih otentik bisa lahir.",
        long: "Kamu sedang berada dalam siklus pembersihan besar-besaran. Apa pun yang tidak selaras dengan kebenaran jiwamu perlahan-lahan akan dijauhkan dari hidupmu—baik itu hubungan, karier, maupun pola pikir. Jangan melawan arus perubahan yang terasa ekstrem ini. Lepaskan ekspektasi lama, berselancarlah di atas gelombang ketidakpastian ini, dan percayalah bahwa kamu sedang diarahkan pada kebangkitan yang nyata.",
      };
    } else if (dasha === "Jupiter" || dasha === "Venus") {
      return {
        short: "Era Ekspansi dan Pertumbuhan",
        medium: "Pintu-pintu kesempatan sedang terbuka. Ini adalah musim untuk mengambil ruang lebih besar dan menuai hasil dari masa-masa sulit sebelumnya.",
        long: "Ada energi optimisme dan perluasan yang sedang bekerja mendukungmu saat ini. Peluang untuk belajar hal baru, memperluas jaringan, atau menikmati kesejahteraan akan lebih mudah menghampirimu. Tantangannya di era ini bukanlah bagaimana bertahan hidup, melainkan bagaimana tetap fokus pada prioritas di tengah banyaknya hal baik yang tiba-tiba datang menuntut perhatianmu.",
      };
    } else {
      return {
        short: "Era Konsolidasi",
        medium: "Saatnya melambat. Musim ini menuntut kedisiplinan, fokus internal, dan evaluasi mendalam atas struktur kehidupanmu.",
        long: "Kamu sedang diuji untuk membangun fondasi yang akan menopangmu di masa depan. Kamu mungkin merasa bahwa segala sesuatunya bergerak lebih lambat atau terasa lebih berat dari biasanya. Namun, ini bukanlah bentuk hukuman; ini adalah undangan untuk merapikan kehidupanmu. Fokuslah pada kedisiplinan, selesaikan apa yang kamu mulai, dan hindari mengambil jalan pintas.",
      };
    }
  }

  private static generateHealth(domain: CanonicalIdentity["health"]): HumanMeaning["health"] {
    const chakraEntries = Object.entries(domain.chakraMatrix);
    const dominant = chakraEntries.sort(([, a], [, b]) =>
      ((b.physics || 0) + (b.energy || 0) + (b.emotion || 0))
      - ((a.physics || 0) + (a.energy || 0) + (a.emotion || 0))
    )[0]?.[0]?.toLowerCase() || "";
    const expression = /vish|throat/.test(dominant);
    const grounding = /mula|root/.test(dominant);
    const quietEating = /calm|quiet|low|tenang|sunyi/.test(domain.hdDigestion.toLowerCase());
    const activeSpace = /kitchen|market|busy|aktif|ramai/.test(domain.hdEnvironment.toLowerCase());
    const lowerType = domain.hdType.toLowerCase();
    const restEarly = lowerType.includes("projector") || lowerType.includes("reflector");
    const element = domain.baziElement.toLowerCase();

    return {
      chakra: {
        short: expression ? "Tubuh Meminta Ruang untuk Bersuara" : grounding ? "Tubuh Meminta Rasa Aman" : "Tubuh Menyimpan Pesan Emosional",
        medium: expression ? "Ketegangan dapat lebih cepat terasa ketika banyak hal ditahan dan tidak diucapkan. Tubuhmu cenderung lega saat perasaan mendapat jalan keluar yang aman." : grounding ? "Saat hidup terasa tidak pasti, tubuhmu mungkin lebih cepat tegang atau lelah. Rutinitas sederhana membantu mengembalikan rasa aman." : "Tubuhmu peka terhadap emosi yang belum selesai. Rasa lelah atau tegang dapat menjadi undangan untuk mendengar kebutuhan yang diabaikan.",
        long: "Contohnya, saat tubuh terasa tidak nyaman tanpa sebab yang jelas, periksa napas, ketegangan otot, dan emosi yang sedang kamu tahan. Pilih satu tindakan lembut: berjalan, minum air, menulis, atau meminta jeda."
      },
      digestion: {
        short: quietEating ? "Mencerna Lebih Baik Saat Tenang" : "Makan dengan Perhatian Penuh",
        medium: quietEating ? "Tubuhmu cenderung memproses makanan lebih nyaman ketika suasana tidak terburu-buru dan rangsangan di sekitar berkurang." : "Kualitas perhatian saat makan sama pentingnya dengan pilihan makanannya. Tubuhmu lebih mudah memberi tanda cukup ketika kamu tidak makan sambil mengejar hal lain.",
        long: "Contohnya, pilih satu waktu makan tanpa layar selama beberapa hari. Makan lebih perlahan, berhenti di tengah untuk merasakan tubuh, lalu catat apakah energi dan kenyamananmu berubah."
      },
      environment: {
        short: activeSpace ? "Hidup di Ruang yang Bergerak" : "Pulih di Ruang yang Memberi Napas",
        medium: activeSpace ? "Energi dan fokusmu lebih mudah bangkit di tempat yang memiliki aktivitas dan rasa hidup, selama kamu tetap punya sudut untuk menepi." : "Tubuhmu lebih mudah tenang ketika ruang terasa lapang, teratur, dan tidak membanjiri indra.",
        long: "Contohnya, jika sulit fokus, jangan hanya memaksa pikiran. Uji bekerja di ruang berbeda, rapikan satu area kecil, atau ubah cahaya dan suara sampai tubuh terasa lebih mudah bernapas."
      },
      rhythm: {
        short: restEarly ? "Istirahat Sebelum Benar-Benar Habis" : "Gunakan Tenaga, Lalu Lepaskan",
        medium: restEarly ? "Tubuhmu tidak perlu mempertahankan tempo tinggi sepanjang hari. Jeda yang dijadwalkan lebih efektif daripada menunggu sampai kelelahan." : "Tidur lebih mudah datang ketika energi hari itu sudah digunakan untuk sesuatu yang terasa hidup dan bermakna.",
        long: "Contohnya, tentukan batas akhir aktivitas dan buat ritual penurunan tempo selama tiga puluh menit. Redupkan cahaya, hentikan pekerjaan, dan beri tubuh sinyal yang sama setiap malam."
      },
      element: {
        short: element.includes("fire") ? "Energi yang Cepat Menyala" : element.includes("water") ? "Energi yang Peka dan Adaptif" : element.includes("wood") ? "Energi yang Ingin Bertumbuh" : element.includes("metal") ? "Energi yang Tegas dan Terarah" : "Energi yang Stabil dan Menopang",
        medium: element.includes("fire") ? "Kamu mudah bersemangat dan menularkan energi, tetapi perlu menjaga agar antusiasme tidak berubah menjadi kelelahan." : element.includes("water") ? "Kamu peka membaca suasana dan mudah menyesuaikan diri, tetapi membutuhkan batas agar tidak larut dalam keadaan sekitar." : element.includes("wood") ? "Kamu hidup ketika merasa berkembang dan bergerak maju, tetapi bisa frustrasi saat terlalu lama terhambat." : element.includes("metal") ? "Kamu kuat dalam ketegasan dan kualitas, tetapi perlu berhati-hati agar standar tinggi tidak menjadi kekakuan." : "Kamu membawa daya menenangkan dan ketahanan, tetapi perlu bergerak saat kenyamanan mulai berubah menjadi stagnasi.",
        long: "Contohnya, saat tertekan, cari penyeimbang: perlambat jika terlalu menyala, bergerak jika terlalu diam, dan minta dukungan jika terlalu lama menahan semuanya sendiri."
      }
    };
  }

  private static generateSoulIdentity(domain: CanonicalIdentity["soulIdentity"]): HumanMeaning["soulIdentity"] {
    const missionSignals = this.readable([
      domain.mission.destinyPoint ? `Arcana ${domain.mission.destinyPoint}` : "",
      domain.mission.destinySoulMission,
      domain.mission.tzolkinLifePurpose,
      domain.mission.baziLifeMission,
      domain.mission.wetonLifeMission,
      domain.mission.vedicDharmaFocus,
    ], domain.mission.lifePathRole || "arah hidup yang sedang meminta bentuk nyata");
    const giftSignals = this.readable([
      ...domain.gifts.lifePathStrengths,
      ...domain.gifts.tzolkinGifts,
      ...domain.gifts.vedicStrengths,
      ...domain.gifts.wetonStrengths,
      ...domain.gifts.baziStrengths,
      ...domain.gifts.destinyGreatTalents.map((talent) => `Arcana ${talent}`),
    ], "kepekaan membaca pola, menjaga ritme, dan mengubah insight menjadi tindakan");
    const lessonSignals = this.readable([
      ...domain.lessons.tzolkinLessons,
      ...domain.lessons.vedicChallenges,
      ...domain.lessons.wetonChallenges,
      ...domain.lessons.baziChallenges,
      domain.lessons.natalChiron,
      domain.lessons.humanDesignNotSelf,
      ...domain.lessons.destinyKarmicTail.map((item) => `Arcana ${item}`),
    ], "memilih respons yang lebih sadar ketika pola lama mulai aktif");
    const shadowSignals = this.readable([
      ...domain.shadow.tzolkinShadow,
      domain.shadow.natalChiron,
      domain.shadow.natalLilith,
      domain.shadow.natalPluto,
      domain.shadow.natalSouthNode,
      domain.shadow.humanDesignNotSelf,
      ...domain.shadow.openCenters,
      ...domain.shadow.destinyKarmicTail.map((item) => `Arcana ${item}`),
    ], "perlindungan lama yang muncul saat kamu merasa tidak aman");
    const archetypeSignals = this.readable([
      domain.archetype.lifePathRole,
      domain.archetype.humanDesignType,
      domain.archetype.humanDesignProfile,
      domain.archetype.destinyArcana ? `Arcana ${domain.archetype.destinyArcana}` : "",
      domain.archetype.sunSign,
      domain.archetype.moonSign,
      domain.archetype.tzolkinKinName,
      domain.archetype.vedicNakshatra,
      domain.archetype.weton,
      domain.archetype.baziDayMaster,
    ], "pembaca makna yang belajar membumikan kesadaran");

    return {
      mission: {
        short: "Misi Jiwa yang Membumi",
        medium: `Misi jiwamu bergerak di sekitar ${missionSignals}. Ini bukan target kaku, melainkan arah yang makin jelas saat pilihan harianmu terasa jujur dan berguna.`,
        long: `Dalam hidup sehari-hari, misi ini tampak ketika kamu berhenti mengejar semua kemungkinan dan mulai memberi bentuk pada ${missionSignals}. Tanyakan: kontribusi mana yang membuatmu merasa lebih utuh, bukan sekadar terlihat berhasil?`,
      },
      gifts: {
        short: "Hadiah Jiwa yang Bisa Dilatih",
        medium: `Hadiah alami yang paling kuat terlihat melalui ${giftSignals}. Kualitas ini menjadi lebih matang saat dipakai untuk menolong, membangun, menerjemahkan, atau menenangkan sesuatu secara nyata.`,
        long: `Bakat jiwa tidak harus muncul sebagai hal besar. Ia bisa terlihat dari cara kamu membaca situasi, memilih kata, menjaga ritme, atau membantu orang merasa lebih jelas. Latih satu hadiah dari ${giftSignals} dalam konteks kecil yang benar-benar terjadi minggu ini.`,
      },
      lessons: {
        short: "Pelajaran Jiwa yang Berulang",
        medium: `Pelajaran utamamu berkaitan dengan ${lessonSignals}. Tema ini biasanya muncul saat hidup meminta respons baru, sementara bagian lama dalam dirimu masih ingin memakai cara yang sudah dikenal.`,
        long: `Saat pelajaran ini muncul, jangan buru-buru menganggapnya sebagai kegagalan. Ia sering datang sebagai kesempatan untuk melihat pola dengan lebih sadar. Perhatikan kapan ${lessonSignals} aktif, lalu pilih satu respons yang lebih dewasa dari biasanya.`,
      },
      shadow: {
        short: "Bayangan Jiwa yang Perlu Dilihat",
        medium: `Bayangan jiwamu paling mudah muncul melalui ${shadowSignals}. Ini bukan sisi buruk, melainkan mekanisme perlindungan yang pernah membantumu bertahan.`,
        long: `Bayangan ini mulai melembut ketika kamu dapat mengenalinya sebelum ia mengambil alih keputusan. Saat ${shadowSignals} terasa aktif, hentikan pembuktian diri sebentar dan tanyakan kebutuhan apa yang sebenarnya sedang dilindungi.`,
      },
      archetype: {
        short: "Arketipe Jiwa Gabungan",
        medium: `Arketipe jiwamu terbentuk dari perpaduan ${archetypeSignals}. Gabungan ini menunjukkan cara khas kamu hadir, belajar, memengaruhi ruang, dan menemukan makna.`,
        long: `Gunakan arketipe ini sebagai cermin, bukan kotak. Ketika ${archetypeSignals} terasa hidup, kamu biasanya lebih mudah bergerak tanpa meninggalkan dirimu sendiri. Saat terasa jauh, itu tanda untuk kembali pada ritme yang lebih jujur.`,
      },
    };
  }

  private static generateSpiritualityHuman(domain: CanonicalIdentity["spirituality"]): HumanMeaning["spirituality"] {
    const pathText = domain.vedicNinthHouse.toLowerCase();
    const devotional = /devotion|bakti|faith|iman|heart|hati/.test(pathText);
    const knowledge = /knowledge|belajar|study|wisdom|pengetahuan/.test(pathText);
    const surrenderControl = /saturn|mars|capricorn|aries/.test(domain.vedicAtmakaraka.toLowerCase());
    const potentialTheme = domain.destinyHighArcana % 3 === 0 ? "membaca perasaan dan kebutuhan yang tidak terucap" : domain.destinyHighArcana % 3 === 1 ? "melihat pola dan kemungkinan sebelum orang lain menyadarinya" : "menenangkan keadaan dan membantu orang menemukan arah";
    const talentTheme = domain.destinyTalents.reduce((sum, value) => sum + value, 0) % 3;
    const cognition = domain.hdCognition.toLowerCase();
    const sensing = /feel|touch|inner|rasa/.test(cognition);
    const seeing = /view|vision|outer|lihat/.test(cognition);
    const aura = domain.hdAura.toLowerCase();
    const guiding = aura.includes("projector");
    const reflecting = aura.includes("reflector");
    const clairFeeling = domain.clairIndicators.spleenDefined || domain.clairIndicators.solarPlexusDefined;
    const clairKnowing = domain.clairIndicators.ajnaDefined;
    return {
      path: { short: devotional ? "Menemukan Makna melalui Pengabdian" : knowledge ? "Menemukan Makna melalui Pemahaman" : "Menemukan Makna melalui Tindakan", medium: devotional ? "Kedalaman batinmu tumbuh saat hati terlibat—melalui doa, pelayanan, rasa syukur, atau hubungan yang membuatmu merasa terhubung." : knowledge ? "Kedalaman batinmu tumbuh saat kamu belajar, merenung, dan menemukan hubungan antara pengalaman hidup dengan pemahaman yang lebih luas." : "Kedalaman batinmu tumbuh ketika nilai yang kamu percaya diwujudkan dalam tindakan nyata, bukan hanya dipikirkan.", long: "Contohnya, pilih satu praktik sederhana yang bisa dijalani konsisten: membaca dan merenung, membantu seseorang, berdoa, atau duduk hening. Ukur manfaatnya dari apakah kamu menjadi lebih jernih dan baik dalam hidup sehari-hari." },
      evolution: { short: surrenderControl ? "Belajar Melunak tanpa Kehilangan Kekuatan" : "Melepas Identitas yang Sudah Sempit", medium: surrenderControl ? "Pertumbuhanmu meminta kekuatan yang tidak selalu berbentuk kendali. Kamu berkembang saat mampu tetap tegas sekaligus terbuka pada bantuan, perubahan, dan kerentanan." : "Kehidupan mengajakmu meninggalkan gambaran lama tentang siapa dirimu agar pilihanmu tidak lagi dikendalikan oleh kebutuhan membuktikan sesuatu.", long: "Contohnya, saat rencana berubah, perhatikan dorongan untuk memaksa keadaan kembali sesuai keinginan. Tanyakan apa yang masih bisa dijaga dan apa yang perlu dilepaskan agar kamu tetap utuh." },
      potential: { short: "Kapasitas Kebijaksanaan", medium: `Kepekaanmu paling berguna ketika dipakai untuk ${potentialTheme}. Ini adalah kemampuan membaca manusia dan situasi, bukan kepastian tentang hal-hal gaib.`, long: "Contohnya, jika kamu menangkap suasana sebelum orang lain mengatakannya, jangan langsung menyimpulkan. Ajukan pertanyaan lembut, periksa faktanya, lalu gunakan kepekaanmu untuk menciptakan rasa aman." },
      talents: { short: talentTheme === 0 ? "Bakat Menenangkan dan Mendampingi" : talentTheme === 1 ? "Bakat Menunjukkan Arah" : "Bakat Menghubungkan Makna", medium: talentTheme === 0 ? "Kehadiranmu dapat membantu orang merasa lebih aman, terutama ketika kamu mendengarkan tanpa terburu-buru memberi jawaban." : talentTheme === 1 ? "Kamu berpotensi melihat langkah berikutnya ketika orang lain masih bingung. Kekuatan ini paling berguna ketika disampaikan sebagai undangan, bukan perintah." : "Kamu mampu menemukan benang merah di antara pengalaman yang tampak terpisah dan membantu orang memahami apa yang sedang mereka jalani.", long: "Contohnya, gunakan kemampuan ini dalam bentuk nyata: menemani teman, menulis refleksi, mengajar, atau membantu seseorang menyusun pilihan—tanpa mengambil alih hidup mereka." },
      intuition: { short: sensing ? "Intuisi Hadir sebagai Rasa Tubuh" : seeing ? "Intuisi Hadir sebagai Gambaran dan Pola" : "Intuisi Hadir sebagai Pengetahuan yang Tenang", medium: sensing ? "Kamu sering mengetahui keselarasan melalui sensasi: lega, berat, hangat, atau tegang. Sinyal ini perlu dibedakan dari rasa takut yang mendesak." : seeing ? "Kamu cenderung menangkap pola atau gambaran yang belum jelas bagi orang lain. Wawasanmu menjadi kuat setelah diuji dengan kenyataan." : "Jawaban kadang muncul sebagai keyakinan tenang tanpa rangkaian alasan panjang. Ia berbeda dari pikiran cemas karena tidak memaksa atau berputar-putar.", long: "Contohnya, catat sinyal pertama yang muncul sebelum keputusan penting, lalu bandingkan dengan hasilnya beberapa hari kemudian. Dengan begitu, kamu belajar membedakan intuisi dari kecemasan." },
      channeling: { short: "Akses Inspirasi", medium: domain.hdHeadAjnaDefined ? "Pikiranmu mampu menahan dan mengembangkan gagasan sampai menjadi kerangka yang jelas. Inspirasi lebih berguna ketika diberi waktu untuk matang." : "Pikiranmu terbuka menangkap banyak gagasan dari lingkungan. Tidak semuanya harus diikuti; pilih ide yang tetap penting setelah suasana berubah.", long: "Contohnya, ketika ide datang tiba-tiba, tulis dalam satu kalimat dan jangan langsung menganggapnya kebenaran. Baca kembali besok, uji dengan fakta, lalu wujudkan hanya jika masih relevan." },
      aura: { short: guiding ? "Kehadiran yang Membaca dan Mengarahkan" : reflecting ? "Kehadiran yang Memantulkan Suasana" : "Kehadiran yang Menghidupkan Ruang", medium: guiding ? "Orang dapat merasa benar-benar terlihat saat kamu memberi perhatian penuh. Pengaruhmu paling kuat ketika nasihatmu diminta dan diterima." : reflecting ? "Kehadiranmu peka terhadap kualitas lingkungan. Kamu sering memperjelas keadaan hanya dengan menunjukkan apa yang sebenarnya sedang terjadi." : "Kehadiranmu cenderung membawa gerak dan daya hidup. Ketika kamu antusias secara autentik, energi itu mudah menular.", long: "Contohnya, perhatikan respons orang ketika kamu memasuki kelompok. Dengarkan sebelum mengarahkan, pilih lingkungan yang sehat, dan jangan mengukur nilai diri dari reaksi setiap orang." },
      clair: { short: clairFeeling && clairKnowing ? "Peka pada Rasa sekaligus Pola" : clairFeeling ? "Peka pada Perubahan Rasa" : clairKnowing ? "Peka pada Pola dan Pemahaman" : "Peka pada Nuansa yang Halus", medium: clairFeeling && clairKnowing ? "Kamu dapat menangkap suasana melalui tubuh sekaligus memahami pola di baliknya. Kepekaan ini berguna ketika rasa dan fakta diperiksa bersama." : clairFeeling ? "Kamu mudah merasakan perubahan suasana, ketegangan, atau kenyamanan sebelum hal itu dibicarakan." : clairKnowing ? "Kamu cepat melihat hubungan dan memahami sesuatu secara menyeluruh, meski proses berpikirmu sulit dijelaskan." : "Kamu menangkap perubahan kecil dalam nada, ekspresi, atau suasana yang sering dilewatkan orang lain.", long: "Contohnya, ketika merasa mengetahui sesuatu tentang orang atau situasi, ubah kesimpulan menjadi pertanyaan. Periksa dengan lembut dan akui bahwa persepsimu bisa benar, sebagian benar, atau keliru." },
    };
  }

  private static generateSpirituality(domain: CanonicalIdentity["spirituality"]): HumanMeaning["spirituality"] {
    const path = domain.vedicNinthHouse || "jalur makna belum tersedia";
    const evolution = domain.vedicAtmakaraka || "tema evolusi belum tersedia";
    const arcana = domain.destinyHighArcana || "belum tersedia";
    const talents = domain.destinyTalents.length ? domain.destinyTalents.join(", ") : "belum tersedia";
    const cognition = domain.hdCognition || "modalitas intuisi belum tersedia";
    const inspiration = domain.hdHeadAjnaDefined ? "kepala dan ajna terdefinisi" : "kepala dan ajna tidak sama-sama terdefinisi";
    const aura = domain.hdAura || "tipe aura belum tersedia";
    const clair = [
      `talenta ${domain.clairIndicators.destinyTalents.join(", ") || "belum tersedia"}`,
      domain.clairIndicators.spleenDefined ? "limpa terdefinisi" : "limpa terbuka",
      domain.clairIndicators.ajnaDefined ? "ajna terdefinisi" : "ajna terbuka",
      domain.clairIndicators.solarPlexusDefined ? "solar plexus terdefinisi" : "solar plexus terbuka",
    ].join("; ");

    return {
      path: {
        short: "Jalan Menuju Kedamaian",
        medium: `Jalur makna yang tercatat dalam petamu adalah ${path}.`,
        long: `Jadikan tema ${path} sebagai arah eksplorasi, lalu pilih praktik yang tetap membumi dan selaras dengan nilai hidupmu.`
      },
      evolution: {
        short: "Pelajaran Ego Tertinggi",
        medium: `Tema evolusi jiwamu dibaca melalui ${evolution}.`,
        long: `Amati bagaimana tema ${evolution} berulang dalam pilihan dan relasimu; pertumbuhan dimulai saat kamu meresponsnya dengan lebih sadar.`
      },
      potential: {
        short: "Kapasitas Kebijaksanaan",
        medium: `Potensi sensitivitas spiritualmu ditandai oleh Arcana ${arcana}.`,
        long: `Gunakan kualitas Arcana ${arcana} sebagai bahasa refleksi untuk memahami sensitivitasmu tanpa mengubahnya menjadi klaim supernatural.`
      },
      talents: {
        short: "Bakat Pengabdian",
        medium: `Garis bakat spiritualmu membawa pola ${talents}.`,
        long: `Kembangkan pola ${talents} melalui pelayanan yang konkret, proporsional, dan tetap menghormati batas energimu.`
      },
      intuition: {
        short: "Cara Intuisi Berbicara",
        medium: `Jejak intuisi yang tercatat untukmu hadir melalui ${cognition}.`,
        long: `Catat kapan sinyal ${cognition} muncul dan bandingkan dengan hasil nyata agar kepercayaan pada intuisi tumbuh secara teruji.`
      },
      channeling: {
        short: "Akses Inspirasi",
        medium: `Pola penerimaan inspirasi dibaca sebagai ${inspiration}.`,
        long: `Perlakukan pola ${inspiration} sebagai kecenderungan menerima ide mendadak, bukan komunikasi dengan entitas; tangkap idenya lalu uji dalam karya nyata.`
      },
      aura: {
        short: "Karakter Medan Energi",
        medium: `Karakter medan energimu mengikuti pola ${aura}.`,
        long: `Amati bagaimana pola ${aura} memengaruhi cara orang merespons kehadiranmu, tanpa menganggapnya sebagai ukuran nilai diri.`
      },
      clair: {
        short: "Kepekaan Khusus",
        medium: `Kecenderungan kepekaanmu dibaca dari ${clair}.`,
        long: `Gunakan kombinasi ${clair} sebagai peta probabilistik untuk mengamati cara kamu merasa, mengetahui, melihat pola, atau menangkap nada—bukan sebagai kepastian kemampuan gaib.`
      }
    };
  }
}
