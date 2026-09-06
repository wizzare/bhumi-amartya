import type { CanonicalIdentity } from "@/lib/types/canonical";
import type { HumanMeaning, HumanNarrative } from "@/lib/types/humanMeaning";
import { isEnlEdition } from "@/lib/config/edition";

export class HumanMeaningService {
  private static get isEn(): boolean {
    return isEnlEdition();
  }

  private static n(id: HumanNarrative, en: HumanNarrative): HumanNarrative {
    return this.isEn ? en : id;
  }
  public static generate(canonical: CanonicalIdentity, soulIdentityAi?: any): HumanMeaning {
    const identity = this.generateIdentity(canonical.identity);
    const energy = this.generateEnergy(canonical.energy);
    const shadow = this.generateShadow(canonical.shadow);
    const talents = this.generateTalents(canonical.talents);
    const relationships = this.generateRelationships(canonical.relationships);
    const timing = this.generateTiming(canonical.timing);
    return {
      identity: {
        ...identity,
        archetype: soulIdentityAi?.archetype ? {
          short: soulIdentityAi.archetype.short,
          medium: soulIdentityAi.archetype.medium,
          long: soulIdentityAi.archetype.long,
        } : identity,
        hiddenCharacter: this.hiddenCharacterMeaning(canonical.identity.hiddenCharacter),
      },
      purpose: soulIdentityAi?.purpose ? {
        short: soulIdentityAi.purpose.short,
        medium: soulIdentityAi.purpose.medium,
        long: soulIdentityAi.purpose.long,
      } : (soulIdentityAi?.mission ? {
        short: soulIdentityAi.mission.short,
        medium: soulIdentityAi.mission.medium,
        long: soulIdentityAi.mission.long,
      } : this.generatePurpose(canonical.purpose)),
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
      soulIdentity: soulIdentityAi ? {
        mission: {
          short: soulIdentityAi.mission.short,
          medium: soulIdentityAi.mission.medium,
          long: soulIdentityAi.mission.long,
        },
        gifts: {
          short: soulIdentityAi.gifts.short,
          medium: soulIdentityAi.gifts.medium,
          long: soulIdentityAi.gifts.long,
        },
        lessons: {
          short: soulIdentityAi.lessons.short,
          medium: soulIdentityAi.lessons.medium,
          long: soulIdentityAi.lessons.long,
        },
        shadow: {
          short: soulIdentityAi.shadow.short,
          medium: soulIdentityAi.shadow.medium,
          long: soulIdentityAi.shadow.long,
        },
        archetype: {
          short: soulIdentityAi.archetype.short,
          medium: soulIdentityAi.archetype.medium,
          long: soulIdentityAi.archetype.long,
        },
      } : this.generateSoulIdentity(canonical.soulIdentity),
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
    return `${clean.slice(0, -1).join(", ")} ${this.isEn ? "and" : "dan"} ${clean[clean.length - 1]}`;
  }

  private static composeBodyMechanics(domain: CanonicalIdentity["health"]): HumanNarrative {
    return this.n(
      {
        short: "Tubuhmu Punya Cara Sendiri",
        medium: "Tubuhmu bekerja paling baik saat cara makan, ruang, aktivitas, dan istirahat saling mendukung—bukan saat kamu memaksanya mengikuti ritme orang lain.",
        long: "Contohnya, ketika konsentrasi menurun atau tubuh terasa berat, jangan langsung menyalahkan disiplinmu. Coba ubah satu hal sederhana: makan tanpa terburu-buru, pindah ke ruang yang lebih nyaman, atau berhenti sebelum benar-benar kehabisan tenaga.",
      },
      {
        short: "Your Body Has Its Own Way",
        medium: "Your body works best when eating, space, activity, and rest support each other—not when you force it to follow someone else's rhythm.",
        long: "For example, when focus drops or your body feels heavy, don't blame discipline. Try one simple change: eat without rushing, move to a more comfortable space, or stop before you're fully drained.",
      }
    );
  }

  private static hiddenCharacterMeaning(domain: CanonicalIdentity["identity"]["hiddenCharacter"]): HumanNarrative {
    const inward = domain.soulUrge % 2 === 0;
    return this.n(
      {
        short: inward ? "Kedalaman yang Tidak Selalu Terlihat" : "Dorongan untuk Menjadi Diri Sendiri",
        medium: inward
          ? "Di balik sikapmu yang terlihat tenang, ada kebutuhan kuat untuk merasa aman, dipahami, dan tidak dipaksa membuka diri sebelum siap."
          : "Di balik caramu beradaptasi, ada bagian diri yang ingin bergerak bebas, menyampaikan isi hati, dan memilih hidup dengan caranya sendiri.",
        long: "Contohnya, kamu mungkin terlihat baik-baik saja dalam sebuah percakapan padahal masih memproses banyak hal. Beri dirimu waktu sebelum menjawab, lalu ungkapkan satu kebutuhan dengan jujur tanpa merasa harus menjelaskan semuanya.",
      },
      {
        short: inward ? "Depth Not Always Visible" : "The Drive to Be Yourself",
        medium: inward
          ? "Behind your calm exterior lies a strong need to feel safe, understood, and not pressured to open up before you're ready."
          : "Behind your adaptability, there's a part that wants to move freely, speak your heart, and live life on your own terms.",
        long: "For example, you might look fine in a conversation while still processing a lot. Give yourself time before answering, then express one need honestly without feeling obligated to explain everything.",
      }
    );
  }

  private static authorityMeaning(authority: string): HumanNarrative {
    const value = authority.toLowerCase();
    if (value.includes("emotional")) return this.n(
      { short: "Tunggu Sampai Perasaan Jernih", medium: "Keputusan besar jarang terasa jelas pada gelombang emosi pertama. Kamu membutuhkan waktu agar rasa senang, takut, atau kecewa mereda sebelum mengetahui jawaban yang sungguh milikmu.", long: "Contohnya, jangan langsung menerima tawaran penting saat sedang sangat bersemangat. Tidur satu malam, baca kembali besok, lalu pilih ketika tubuh dan pikiran terasa lebih tenang." },
      { short: "Wait Until Clarity Settles", medium: "Big decisions rarely feel clear on the first emotional wave. You need time for excitement, fear, or disappointment to subside before knowing your true answer.", long: "For example, don't accept an important offer when you're very excited. Sleep on it, reread it tomorrow, then choose when body and mind feel calmer." }
    );
    if (value.includes("sacral")) return this.n(
      { short: "Dengarkan Respons Tubuh", medium: "Jawabanmu sering muncul sebagai rasa hidup, tertarik, berat, atau enggan sebelum pikiran sempat menyusun alasan.", long: "Contohnya, saat memilih kegiatan, ucapkan pilihannya dengan lantang dan perhatikan tubuhmu: apakah terasa mengembang atau justru mengerut? Gunakan respons pertama itu sebagai bahan keputusan." },
      { short: "Listen to Your Body's Response", medium: "Your answer often shows up as a feeling of aliveness, attraction, heaviness, or reluctance before the mind can construct reasons.", long: "For example, when choosing an activity, say the options aloud and notice your body: does it expand or contract? Use that first response as your decision compass." }
    );
    if (value.includes("splenic")) return this.n(
      { short: "Percayai Sinyal Tenang yang Pertama", medium: "Intuisimu cenderung hadir cepat dan lembut sebagai rasa aman atau waspada. Ia tidak berteriak dan sering tidak mengulang pesan yang sama.", long: "Contohnya, jika sebuah situasi membuat tubuhmu langsung menegang meski semuanya tampak baik di atas kertas, berhenti sejenak dan periksa apa yang belum kamu lihat." },
      { short: "Trust the First Quiet Signal", medium: "Your intuition tends to arrive quickly and gently as a sense of safety or alertness. It doesn't shout and often doesn't repeat.", long: "For example, if a situation makes your body tense immediately even though everything looks fine on paper, pause and check what you haven't seen yet." }
    );
    return this.n(
      { short: "Beri Keputusan Ruang Bernapas", medium: "Kejernihanmu tumbuh ketika kamu tidak mengambil keputusan hanya untuk menghentikan tekanan dari luar.", long: "Contohnya, katakan 'aku perlu memikirkannya' sebelum menjawab permintaan penting. Perhatikan pilihan mana yang tetap terasa benar setelah desakan mereda." },
      { short: "Give Decisions Room to Breathe", medium: "Your clarity grows when you're not making decisions just to stop external pressure.", long: "For example, say 'I need to think about it' before answering important requests. Notice which choice still feels right after the pressure fades." }
    );
  }

  private static vitalityMeaning(domain: CanonicalIdentity["energy"]): HumanNarrative {
    return domain.vitality.sacralDefined
      ? this.n(
          { short: "Tenaga Tumbuh dari Keterlibatan", medium: "Staminamu menguat ketika kamu terlibat dalam hal yang benar-benar menarik. Pekerjaan yang terasa kosong justru dapat mengurasmu meski secara fisik tidak berat.", long: "Contohnya, jika sore hari kamu lelah setelah pekerjaan yang tidak bermakna tetapi kembali hidup saat mengerjakan hal yang disukai, itu tanda energi membutuhkan keterlibatan, bukan sekadar istirahat. Sisihkan waktu rutin untuk aktivitas yang menyalakanmu." },
          { short: "Energy Grows from Engagement", medium: "Your stamina strengthens when you're involved in something truly compelling. Work that feels empty drains you even when it's not physically demanding.", long: "For example, if you're tired after meaningless work but come alive doing what you love, that's a sign your energy needs engagement, not just rest. Set aside regular time for activities that light you up." }
        )
      : this.n(
          { short: "Tenaga Perlu Dijaga dengan Sadar", medium: "Kamu mudah menyerap tempo orang lain dan tanpa sadar bekerja melewati batas tubuhmu. Kekuatanmu bukan pada bekerja tanpa henti, melainkan mengetahui kapan cukup.", long: "Contohnya, berhentilah saat energimu mulai turun—bukan setelah benar-benar habis. Buat jeda singkat di antara kegiatan dan jangan memakai stamina orang lain sebagai ukuran kemampuanmu." },
          { short: "Energy Needs Conscious Management", medium: "You easily absorb other people's pace and unconsciously work past your body's limits. Your strength isn't in working nonstop, but in knowing when enough is enough.", long: "For example, stop when your energy begins to dip—not after it's completely gone. Create short breaks between activities and don't use other people's stamina as your benchmark." }
        );
  }

  private static emotionalNeedsMeaning(domain: CanonicalIdentity["shadow"]): HumanNarrative {
    return this.n(
      { short: "Aman Saat Perasaanmu Diterima", medium: "Kamu lebih stabil ketika perasaanmu boleh hadir tanpa segera diperbaiki, dihakimi, atau dibandingkan. Yang paling kamu perlukan sering kali bukan solusi, melainkan ruang untuk dipahami.", long: "Contohnya, saat sedang berat, katakan kepada orang tepercaya: 'Aku belum butuh nasihat, aku hanya ingin didengarkan.' Latihan kecil ini membantu orang lain mencintaimu dengan cara yang benar-benar kamu perlukan." },
      { short: "Safe When Your Feelings Are Accepted", medium: "You're more stable when your feelings are allowed to exist without being immediately fixed, judged, or compared. What you need most is often not a solution, but space to be understood.", long: "For example, when things are heavy, tell someone you trust: 'I don't need advice yet, I just want to be heard.' This small practice helps others love you in the way you truly need." }
    );
  }

  private static triggerMeaning(domain: CanonicalIdentity["shadow"]): HumanNarrative {
    const intense = domain.emotionalTriggers.aspects.length > 0;
    return this.n(
      { short: intense ? "Peka terhadap Tekanan dan Perebutan Kendali" : "Peka Saat Batasmu Tidak Dihormati", medium: "Reaksimu menguat ketika merasa didesak, tidak didengar, atau kehilangan pilihan. Di balik kemarahan atau kecemasan biasanya ada kebutuhan untuk kembali merasa aman dan memiliki kendali atas dirimu.", long: "Contohnya, ketika percakapan mulai memanas, jangan paksa diri menyelesaikannya saat itu juga. Minta jeda, rasakan kaki di lantai, lalu kembali ketika kamu bisa menyampaikan kebutuhan tanpa menyerang." },
      { short: intense ? "Sensitive to Pressure and Control Struggles" : "Sensitive When Boundaries Are Disrespected", medium: "Your reactions intensify when feeling pressured, unheard, or lacking options. Behind anger or anxiety usually lies a need to regain safety and control over yourself.", long: "For example, when a conversation heats up, don't force yourself to resolve it on the spot. Pause, feel your feet on the ground, then return when you can express needs without attacking." }
    );
  }

  private static ancestralMeaning(domain: CanonicalIdentity["shadow"]): HumanNarrative {
    const hasPressure = domain.ancestralLegacy.vedicChallenges.length > 0;
    return this.n(
      { short: "Mewarisi Ketangguhan dan Beban", medium: hasPressure ? "Keluargamu mungkin mengajarkan kekuatan melalui tanggung jawab, ketahanan, atau tuntutan untuk selalu sanggup. Hadiahnya adalah daya tahan; bebannya adalah sulit meminta bantuan." : "Ada pola keluarga yang membuatmu terbiasa menjaga keadaan dan mendahulukan kebutuhan bersama. Kekuatan ini perlu diimbangi dengan hak untuk memiliki pilihan sendiri.", long: "Contohnya, perhatikan satu kebiasaan yang kamu jalankan hanya karena 'di keluarga kami selalu begitu.' Pertahankan nilai yang menyehatkan, tetapi izinkan dirimu menghentikan pola yang membuatmu terus mengecil." },
      { short: "Inherited Strength and Burdens", medium: hasPressure ? "Your family may have taught strength through responsibility, endurance, or demands to always cope. The gift is resilience; the burden is difficulty asking for help." : "Family patterns have conditioned you to keep peace and prioritize collective needs. This strength must be balanced with your right to make your own choices.", long: "For example, notice one habit maintained only because 'that's how our family is.' Keep healthy values, but grant yourself permission to stop patterns that diminish you." }
    );
  }

  private static soulLessonMeaning(domain: CanonicalIdentity["shadow"]): HumanNarrative {
    const moving = Boolean(domain.soulLesson.northNode || domain.soulLesson.rahu);
    return this.n(
      { short: "Berani Meninggalkan Cara Lama", medium: moving ? "Pertumbuhanmu meminta keberanian bergerak menuju pengalaman baru, meski bagian dirimu masih ingin bertahan pada pola yang sudah dikenal." : "Pelajaran terbesarmu adalah memilih respons yang lebih sadar daripada mengulang cara lama hanya karena terasa aman.", long: "Contohnya, ketika pilihan baru terasa menakutkan tetapi sehat, ambil satu langkah kecil alih-alih menunggu rasa takut hilang sepenuhnya. Pertumbuhan sering datang bersama rasa canggung." },
      { short: "Courage to Leave Old Ways", medium: moving ? "Your growth demands courage to move toward new experiences, even while part of you clings to familiar patterns." : "Your greatest lesson is choosing conscious responses over repeating old habits simply because they feel safe.", long: "For example, when a new choice feels scary but healthy, take one small step instead of waiting for fear to vanish. Growth often comes with awkwardness." }
    );
  }

  private static soulTraceMeaning(domain: CanonicalIdentity["shadow"]): HumanNarrative {
    const repeated = domain.soulTrace.karmicTail.length > 0;
    return this.n(
      { short: "Tema Lama yang Meminta Cara Baru", medium: repeated ? "Ada pola hidup yang cenderung kembali dalam bentuk berbeda sampai kamu berhenti meresponsnya secara otomatis. Pola itu bukan hukuman; ia menunjukkan tempat kedewasaanmu sedang dibangun." : "Perjalananmu membawa tema berulang yang mengajakmu melihat diri dengan lebih jujur dan lembut.", long: "Contohnya, jika konflik serupa terus muncul di relasi atau pekerjaan, jangan hanya bertanya 'mengapa ini terjadi lagi?' Tanyakan juga, 'respons baru apa yang belum pernah kucoba?'" },
      { short: "Old Themes Requesting New Ways", medium: repeated ? "Life patterns tend to recur in different forms until you stop responding automatically. They are not punishment; they show where your maturity is being built." : "Your journey carries repeating themes encouraging you to see yourself more honestly and gently.", long: "For example, if similar conflicts recur in relationships or work, don't just ask 'why does this happen again?' Also ask, 'what new response have I not tried yet?'" }
    );
  }

  private static moneyBlockMeaning(domain: CanonicalIdentity["shadow"]): HumanNarrative {
    const cautious = domain.moneyBlock.unfavorableElements.length > 1;
    return this.n(
      { short: cautious ? "Takut Salah Mengelola yang Dimiliki" : "Nilai Diri Mudah Tercampur dengan Uang", medium: "Tekanan finansial dapat membuatmu terlalu menahan, terlalu cepat membuktikan diri, atau merasa harga dirimu bergantung pada hasil. Hambatannya bukan sekadar uang, tetapi rasa aman di baliknya.", long: "Contohnya, sebelum membeli, menolak peluang, atau bekerja berlebihan, tanyakan: 'Ini keputusan yang jernih atau reaksi karena takut tidak cukup?' Buat satu keputusan kecil berdasarkan kebutuhan nyata, bukan kepanikan." },
      { short: cautious ? "Fear of Mismanaging Assets" : "Self-Worth Easily Tangled with Money", medium: "Financial pressure can cause excessive holding back, hasty self-proof, or tying self-worth to outcomes. The obstacle isn't just money, but the security behind it.", long: "For example, before buying, rejecting opportunities, or overworking, ask: 'Is this a clear decision or a reaction to scarcity fear?' Make one small choice based on real needs, not panic." }
    );
  }

  private static loveBlockMeaning(domain: CanonicalIdentity["shadow"]): HumanNarrative {
    const guarded = domain.loveBlock.loveLine.length > 0;
    return this.n(
      { short: guarded ? "Melindungi Hati dengan Menahan Diri" : "Sulit Mempercayai Kedekatan", medium: "Saat hubungan mulai penting, kamu bisa menjadi terlalu waspada, menebak-nebak perasaan orang, atau menyembunyikan kebutuhan agar tidak kecewa. Perlindungan ini masuk akal, tetapi dapat membuat cinta sulit mendekat.", long: "Contohnya, daripada menguji apakah seseorang peduli, sampaikan satu kebutuhan sederhana secara langsung. Lihat apakah tindakannya konsisten; kepercayaan dibangun dari bukti kecil yang berulang." },
      { short: guarded ? "Protecting Heart by Holding Back" : "Difficulty Trusting Intimacy", medium: "When relationships become important, you may grow overly guarded, second-guessing feelings or hiding needs to avoid disappointment. This protection makes sense, but hinders love from reaching you.", long: "For example, instead of testing whether someone cares, state one simple need directly. Watch if their actions are consistent; trust builds on repeated small evidence." }
    );
  }

  private static potentialTalentMeaning(domain: CanonicalIdentity["talents"]): HumanNarrative {
    const varied = domain.potentialTalents.tenGods.length + domain.potentialTalents.majorYogas.length > 2;
    return this.n(
      { short: varied ? "Bakat Menghubungkan Banyak Kemampuan" : "Kemampuan yang Tumbuh lewat Latihan", medium: varied ? "Kamu berpotensi kuat saat menggabungkan analisis, komunikasi, dan tindakan. Bakatmu tidak selalu terlihat sebagai satu keahlian tunggal, tetapi sebagai kemampuan menyatukan bagian-bagian yang terpisah." : "Ada kemampuan yang baru terlihat setelah kamu cukup lama berlatih dan diberi tanggung jawab nyata. Potensimu tumbuh melalui pengalaman, bukan hanya rasa percaya diri.", long: "Contohnya, pilih proyek kecil yang memerlukan berpikir, berkomunikasi, dan menyelesaikan sesuatu. Catat bagian mana yang terasa alami dan bagian mana yang semakin mudah setelah diulang." },
      { short: varied ? "Talent for Connecting Multiple Skills" : "Abilities Developed Through Practice", medium: varied ? "You hold strong potential combining analysis, communication, and execution. Your talent isn't always a single skill, but the ability to synthesize separate pieces." : "Certain abilities only emerge after extended practice and real responsibility. Your potential grows through experience, not just self-confidence.", long: "For example, pick a small project requiring thinking, communication, and completion. Note which parts feel natural and which become easier after repetition." }
    );
  }

  private static workStyleMeaning(domain: CanonicalIdentity["talents"]): HumanNarrative {
    const structured = /struktur|stabil|operasional|presisi|sistem/i.test(domain.workStyle.baziCareer);
    return this.n(
      { short: structured ? "Berkarya Baik dengan Struktur yang Jelas" : "Berkarya Baik dengan Ruang Bergerak", medium: structured ? "Kamu bekerja paling tenang ketika tujuan, peran, dan standar keberhasilan jelas. Struktur membebaskan energimu untuk menghasilkan kualitas." : "Kamu bekerja paling hidup ketika diberi ruang mencoba, menghubungkan ide, dan menyesuaikan cara kerja. Pengawasan yang terlalu rapat dapat mematikan inisiatifmu.", long: "Contohnya, sebelum memulai proyek, sepakati hasil dan batas waktunya. Setelah itu, atur cara kerjamu sendiri dan evaluasi berdasarkan hasil, bukan berdasarkan apakah prosesmu sama dengan orang lain." },
      { short: structured ? "Thrives with Clear Structure" : "Thrives with Room to Maneuver", medium: structured ? "You work best when goals, roles, and success standards are clear. Structure frees your energy for quality work." : "You come alive with room to experiment, connect ideas, and adapt workflow. Micromanagement stifles your initiative.", long: "For example, before starting a project, agree on outcomes and deadlines. Then manage your own workflow and evaluate based on results, not identical process." }
    );
  }

  private static wealthFlowMeaning(domain: CanonicalIdentity["talents"]): HumanNarrative {
    const collaborative = /jejaring|pelayanan|komunikasi|kolaborasi/i.test(domain.wealthFlow.moneyStyle);
    return this.n(
      { short: collaborative ? "Rezeki Tumbuh melalui Hubungan dan Nilai" : "Rezeki Tumbuh melalui Konsistensi", medium: collaborative ? "Peluang lebih mudah terbuka ketika orang memahami nilai yang kamu berikan dan percaya pada caramu bekerja. Hubungan yang sehat lebih berguna daripada mengejar semua kesempatan." : "Aliran materi menguat ketika kamu mengelola peluang dengan disiplin, menyelesaikan yang dimulai, dan tidak bergantung pada momentum sesaat.", long: "Contohnya, pilih satu kontribusi yang paling berguna bagi orang lain, jelaskan nilainya dengan sederhana, lalu kerjakan secara konsisten selama beberapa minggu sebelum menilai hasilnya." },
      { short: collaborative ? "Prosperity Grows Through Relationships & Value" : "Prosperity Grows Through Consistency", medium: collaborative ? "Opportunities open more easily when people understand your value and trust your work style. Healthy relationships matter more than chasing every chance." : "Material flow strengthens when managing opportunities with discipline, completing what was started, and not relying on fleeting momentum.", long: "For example, choose one contribution most useful to others, explain its value simply, and execute consistently for several weeks before evaluating." }
    );
  }

  private static relationshipPatternMeaning(domain: CanonicalIdentity["relationships"]): HumanNarrative {
    const style = domain.relationshipStyle.toLowerCase();
    const needsSpace = /ruang|bebas|mandiri|independen/i.test(style);
    return this.n(
      { short: needsSpace ? "Dekat tanpa Kehilangan Diri" : "Kedekatan Tumbuh melalui Konsistensi", medium: needsSpace ? "Kamu membutuhkan hubungan yang hangat sekaligus memberi ruang bernapas. Kedekatan terasa sehat ketika tidak berubah menjadi pengawasan atau tuntutan terus-menerus." : "Kamu cenderung membuka hati melalui kehadiran yang dapat dipercaya. Kata-kata indah penting, tetapi tindakan yang konsisten membuatmu benar-benar merasa aman.", long: "Contohnya, sepakati cara menjaga kedekatan sekaligus waktu pribadi. Jangan menunggu kesal untuk meminta ruang atau perhatian; bicarakan kebutuhan itu saat hubungan sedang tenang." },
      { short: needsSpace ? "Closeness Without Losing Yourself" : "Closeness Grows Through Consistency", medium: needsSpace ? "You need warm relationships that also allow breathing room. Intimacy feels healthy when it doesn't turn into constant monitoring or demands." : "You tend to open your heart through trustworthy presence. Kind words matter, but consistent actions make you feel truly secure.", long: "For example, agree on maintaining closeness while honoring personal time. Don't wait until frustrated to ask for space or attention; discuss needs when calm." }
    );
  }

  private static loveLanguageMeaning(domain: CanonicalIdentity["relationships"]): HumanNarrative {
    const values = Object.values(domain.loveLanguage.elementBalance);
    const active = values.length ? Math.max(...values) > 30 : false;
    return this.n(
      { short: active ? "Cinta Terasa Nyata melalui Tindakan" : "Cinta Terasa Aman melalui Kehadiran", medium: active ? "Kamu mudah menangkap kasih sayang melalui bantuan konkret, perhatian yang diwujudkan, dan seseorang yang benar-benar hadir saat dibutuhkan." : "Kamu lebih merasa dicintai ketika seseorang memberi waktu, mendengarkan tanpa terburu-buru, dan menciptakan suasana yang membuatmu bisa menjadi diri sendiri.", long: "Contohnya, beri tahu orang terdekat satu tindakan kecil yang membuatmu merasa diperhatikan—seperti menemani tanpa ponsel, membantu tugas tertentu, atau menanyakan kabarmu dengan sungguh-sungguh." },
      { short: active ? "Love Feels Real Through Action" : "Love Feels Safe Through Presence", medium: active ? "You readily receive affection through concrete help, manifested care, and someone who is genuinely present when needed." : "You feel more loved when someone gives time, listens unhurriedly, and creates an environment where you can be yourself.", long: "For example, share one small action with a close person that makes you feel cared for—like spending phone-free time, helping with a task, or asking how you are." }
    );
  }

  private static boundariesMeaning(domain: CanonicalIdentity["relationships"]): HumanNarrative {
    const sensitive = domain.healthyBoundaries.undefinedCenters.length >= 4;
    return this.n(
      { short: sensitive ? "Mudah Menyerap Tekanan Orang Lain" : "Batas Sehat Menjaga Kedekatan", medium: sensitive ? "Kamu peka terhadap suasana dan ekspektasi sekitar. Tanpa batas yang jelas, kamu bisa mengira beban orang lain adalah tanggung jawabmu." : "Kamu mampu hadir bagi orang lain, tetapi tetap perlu membedakan empati dari kewajiban menyelesaikan semua masalah mereka.", long: "Contohnya, sebelum mengatakan ya, tanyakan apakah kamu benar-benar mampu dan bersedia. Kalimat 'aku peduli, tetapi aku tidak bisa mengambil ini sekarang' adalah bentuk kejujuran, bukan penolakan kasih." },
      { short: sensitive ? "Easily Absorbs Others' Pressure" : "Healthy Boundaries Protect Closeness", medium: sensitive ? "You are sensitive to surrounding atmosphere and expectations. Without clear boundaries, you might mistake others' burdens for your own responsibility." : "You can be present for others, but still need to distinguish empathy from the obligation to solve all their problems.", long: "For example, before saying yes, ask if you are truly able and willing. Saying 'I care, but I cannot take this on right now' is honesty, not rejection of love." }
    );
  }

  private static semesterMeaning(domain: CanonicalIdentity["timing"], first: boolean): HumanNarrative {
    const expansive = ["Jupiter", "Venus"].includes(domain.currentDasha);
    if (first) return this.n(
      expansive
        ? { short: "Paruh Awal untuk Membuka Ruang", medium: "Awal tahun mendukung eksplorasi, belajar, dan memperluas kemungkinan. Kuncinya bukan mengambil semua peluang, tetapi mengenali mana yang sungguh sejalan.", long: "Contohnya, pilih satu bidang yang ingin kamu perluas dan buat percobaan kecil selama tiga bulan. Beri ruang untuk belajar sebelum menuntut hasil besar." }
        : { short: "Paruh Awal untuk Merapikan Fondasi", medium: "Awal tahun lebih berguna untuk menyelesaikan urusan tertunda, menata ritme, dan memperkuat hal-hal dasar sebelum bergerak lebih jauh.", long: "Contohnya, pilih satu area yang paling menguras energi—keuangan, jadwal, atau relasi—lalu rapikan satu kebiasaan inti sebelum menambah target baru." },
      expansive
        ? { short: "First Half to Open Space", medium: "The start of the year supports exploration, learning, and expanding possibilities. The key is not taking every opportunity, but recognizing which ones truly align.", long: "For example, pick one area you wish to expand and run a small experiment for three months. Give yourself room to learn before demanding big results." }
        : { short: "First Half to Tidy Foundations", medium: "The start of the year is best used for completing pending matters, organizing rhythm, and strengthening fundamentals before moving further.", long: "For example, choose the area draining most energy—finance, schedule, or relationships—and refine one core habit before adding new goals." }
    );
    return this.n(
      expansive
        ? { short: "Paruh Akhir untuk Mewujudkan Peluang", medium: "Hal yang dipelajari dan dibuka pada awal tahun meminta bentuk yang lebih nyata. Waktunya memilih, berkomitmen, dan membawa satu kemungkinan sampai selesai.", long: "Contohnya, hentikan proyek yang hanya menarik di permukaan dan arahkan tenaga pada satu karya atau keputusan yang paling sesuai dengan nilai hidupmu." }
        : { short: "Paruh Akhir untuk Menguatkan Hasil", medium: "Paruh akhir tahun mengajakmu mempertahankan ritme yang sudah dibangun. Kemajuan datang dari ketekunan, bukan perubahan arah yang terus-menerus.", long: "Contohnya, tinjau apa yang sudah berjalan baik, pertahankan dua kebiasaan yang paling membantu, dan lepaskan target yang tidak lagi relevan." },
      expansive
        ? { short: "Second Half to Manifest Opportunities", medium: "What was learned and opened early in the year calls for tangible form. Time to choose, commit, and bring one possibility to completion.", long: "For example, halt surface-level attractive projects and direct energy to the single work or decision that aligns best with your values." }
        : { short: "Second Half to Consolidate Results", medium: "The latter half of the year invites you to maintain built momentum. Progress comes from persistence, not constant shift in direction.", long: "For example, review what has gone well, keep the two most helpful habits, and let go of targets no longer relevant." }
    );
  }

  private static currentStateMeaning(domain: CanonicalIdentity["timing"]): HumanNarrative {
    const ready = domain.currentState === "ready";
    return this.n(
      ready
        ? { short: "Kamu Sedang Punya Fondasi untuk Melangkah", medium: "Banyak bagian penting dalam dirimu sudah cukup terbaca untuk dijadikan bahan refleksi. Sekarang tantangannya bukan mencari lebih banyak penjelasan, tetapi menguji satu pemahaman dalam hidup nyata.", long: "Contohnya, pilih satu insight yang paling mengena minggu ini dan praktikkan dalam satu percakapan, keputusan, atau kebiasaan. Perhatikan perubahan kecil yang benar-benar terjadi." }
        : { short: "Kamu Sedang Menyusun Kejelasan", medium: "Tidak semua jawaban perlu hadir sekaligus. Fase ini lebih cocok untuk mengamati pola, mengumpulkan pengalaman, dan memberi nama pada apa yang sedang kamu rasakan.", long: "Contohnya, catat satu momen setiap hari ketika energimu naik atau turun. Setelah beberapa hari, lihat situasi apa yang paling sering memengaruhimu." },
      ready
        ? { short: "You Have a Foundation to Move Forward", medium: "Many core aspects of your profile are clear enough for reflection. The challenge now isn't seeking more explanations, but testing one insight in real life.", long: "For example, pick the single most resonant insight this week and practice it in a conversation, decision, or habit. Notice small real changes." }
        : { short: "You Are Building Clarity", medium: "Not all answers need to arrive at once. This phase favors observing patterns, gathering experiences, and naming what you feel.", long: "For example, note one moment daily when your energy rises or dips. After several days, see which situations affect you most often." }
    );
  }

  private static dailyFocusMeaning(domain: CanonicalIdentity["timing"]): HumanNarrative {
    const connection = /hubung|bersama|komunitas|relasi|cinta/i.test(domain.dailyFocus);
    return this.n(
      connection
        ? { short: "Hadir Penuh dalam Satu Hubungan", medium: "Fokus hari ini adalah memperbaiki kualitas kehadiranmu, bukan menambah banyak aktivitas. Satu percakapan yang jujur dapat lebih berarti daripada banyak interaksi yang setengah hati.", long: "Contohnya, pilih satu orang dan dengarkan selama sepuluh menit tanpa menyela atau memegang ponsel. Tanyakan apa yang paling mereka butuhkan hari ini." }
        : { short: "Selesaikan Satu Hal yang Bermakna", medium: "Fokus hari ini adalah mengurangi kebisingan dan membawa satu niat menjadi tindakan kecil. Kejelasan tumbuh ketika kamu berhenti memegang terlalu banyak hal sekaligus.", long: "Contohnya, pilih satu tugas yang paling meringankan hidupmu, kerjakan selama lima belas menit tanpa berpindah aplikasi, lalu berhenti dan nilai dampaknya." },
      connection
        ? { short: "Be Fully Present in One Relationship", medium: "Today's focus is improving your presence quality, not adding activities. One honest conversation matters more than many half-hearted interactions.", long: "For example, pick one person and listen for ten minutes without interrupting or holding your phone. Ask what they need most today." }
        : { short: "Complete One Meaningful Task", medium: "Today's focus is cutting noise and turning one intention into small action. Clarity grows when you stop holding too many things at once.", long: "For example, choose the task that lightens your life most, work on it for fifteen minutes without switching apps, then stop and assess the impact." }
    );
  }

  private static growthAreaMeaning(domain: CanonicalIdentity["timing"]): HumanNarrative {
    const release = /lepas|ubah|transform|bayangan|tantangan/i.test(domain.growthArea);
    return this.n(
      release
        ? { short: "Belajar Melepaskan Respons Lama", medium: "Pertumbuhanmu saat ini terletak pada kemampuan berhenti sejenak sebelum mengulang respons yang dulu terasa aman tetapi kini membatasi.", long: "Contohnya, saat terpicu, tunda pesan atau keputusan selama sepuluh menit. Tanyakan respons apa yang melindungi harga dirimu tanpa melukai hubungan." }
        : { short: "Menjaga Konsistensi yang Lembut", medium: "Pertumbuhanmu tidak membutuhkan perubahan dramatis. Yang paling penting adalah hadir kembali pada kebiasaan yang menyehatkan, terutama setelah hari yang sulit.", long: "Contohnya, pilih satu praktik lima menit—bernapas, menulis, berjalan, atau merapikan ruang—dan lakukan setiap hari selama seminggu tanpa menuntut kesempurnaan." },
      release
        ? { short: "Learning to Let Go of Old Responses", medium: "Your current growth lies in pausing before repeating responses that once felt safe but now limit you.", long: "For example, when triggered, delay your message or decision by ten minutes. Ask which response protects self-worth without harming the relationship." }
        : { short: "Maintaining Gentle Consistency", medium: "Your growth needs no dramatic shifts. What matters most is returning to healthy habits, especially after a hard day.", long: "For example, choose a five-minute practice—breathing, writing, walking, or tidying up—and do it daily for a week without demanding perfection." }
    );
  }

  private static generateIdentity(domain: CanonicalIdentity["identity"]): HumanNarrative {
    const isTaurus = domain.sunSign === "Taurus";
    const isGemini = domain.sunSign === "Gemini";
    const isLibra = domain.sunSign === "Libra";
    const isVirgo = domain.sunSign === "Virgo";

    if (isTaurus) {
      return this.n(
        {
          short: "Sang Pembangun Fondasi",
          medium: "Kamu adalah jangkar yang stabil di tengah badai. Orang lain mencari ketenangan dari kehadiranmu yang tak tergoyahkan.",
          long: "Inti dari dirimu adalah ketekunan dan kesetiaan pada apa yang kamu yakini. Meskipun dunia bergerak sangat cepat, kamu memiliki ritme tersendiri yang memastikan setiap langkah yang kamu ambil kokoh dan tidak mudah diruntuhkan. Kemampuanmu untuk menciptakan keindahan dan kenyamanan membuatmu menjadi tempat berlindung bagi orang terdekatmu.",
        },
        {
          short: "The Foundation Builder",
          medium: "You are a stable anchor in the storm. Others seek calm from your unwavering presence.",
          long: "Core to your nature is perseverance and loyalty to your convictions. Even as the world moves fast, you move to your own rhythm, ensuring each step is firm and solid. Your ability to create beauty and comfort makes you a sanctuary for those close to you.",
        }
      );
    } else if (isGemini) {
      return this.n(
        {
          short: "Sang Penghubung Gagasan",
          medium: "Pikiranmu bekerja lebih cepat dari orang kebanyakan, selalu mencari koneksi antara dua ide yang tampaknya tidak berhubungan.",
          long: "Rasa ingin tahumu yang tak terbatas adalah bahan bakar utamamu. Kamu menyerap informasi layaknya spons dan membagikannya kembali dengan cara yang membuat orang lain terinspirasi. Tantangan terbesarmu adalah fokus, karena dunia ini dipenuhi oleh terlalu banyak hal menarik untuk kamu pelajari dalam satu masa kehidupan.",
        },
        {
          short: "The Idea Connector",
          medium: "Your mind works faster than most, always seeking connections between seemingly unrelated ideas.",
          long: "Your boundless curiosity is your primary fuel. You absorb information like a sponge and share it in ways that inspire others. Your main challenge is focus, as the world holds far too many fascinating things to learn in a single lifetime.",
        }
      );
    } else if (isVirgo) {
      return this.n(
        {
          short: "Sang Penyempurna Detail",
          medium: "Kamu melihat hal-hal kecil yang dilewatkan oleh dunia, dan kamu selalu memiliki dorongan untuk membuatnya menjadi lebih baik.",
          long: "Ada sebuah standar ekselensi dalam pikiranmu yang terus menyala. Pengabdianmu pada kualitas sering kali membuatmu tanpa sadar memikul tanggung jawab lebih besar dari yang seharusnya. Ingatlah bahwa tidak semua hal perlu menjadi sempurna untuk bisa dinikmati atau memberikan nilai yang besar.",
        },
        {
          short: "The Detail Perfectionist",
          medium: "You notice small things the world overlooks, and you always feel driven to make them better.",
          long: "A standard of excellence constantly burns in your mind. Your devotion to quality often leads you to shoulder more responsibility than necessary. Remember that not everything needs to be perfect to bring joy or deliver great value.",
        }
      );
    }

    return this.n(
      {
        short: "Sang Penjaga Keseimbangan",
        medium: "Kamu memiliki insting alami untuk menciptakan ketertiban dari kekacauan. Di mana orang lain melihat kebingungan, kamu melihat struktur.",
        long: "Inti dari kepribadianmu didorong oleh kebutuhan yang dalam akan keadilan dan struktur. Kamu tidak bisa tenang melihat ketimpangan. Kekuatan sejatimu muncul saat kamu memadukan logika tajammu dengan empati yang luas.",
      },
      {
        short: "The Balance Keeper",
        medium: "You have a natural instinct for creating order from chaos. Where others see confusion, you see structure.",
        long: "The core of your personality is driven by a deep need for fairness and structure. You cannot rest when seeing imbalance. Your true strength emerges when combining sharp logic with expansive empathy.",
      }
    );
  }

  private static generatePurpose(domain: CanonicalIdentity["purpose"]): HumanNarrative {
    if (domain.lifePath === 22) {
      return this.n(
        {
          short: "Membangun Warisan Nyata",
          medium: "Misimu bukan sekadar memimpikan perubahan besar, melainkan meletakkan batu pertama untuk membangun struktur yang akan bertahan lintas generasi.",
          long: "Kamu dilahirkan dengan kapasitas visi yang sangat besar, sering kali merasa bahwa tanggung jawab dunia ada di pundakmu. Namun, visi yang besar membutuhkan fondasi kehidupan sehari-hari yang sangat praktis. Panggilanmu adalah menerjemahkan mimpi-mimpimu yang rasanya mustahil menjadi sistem, struktur, atau karya yang memberikan rasa aman bagi banyak orang.",
        },
        {
          short: "Building a Lasting Legacy",
          medium: "Your mission isn't just to dream of big change, but to lay the first stone for structures that will last across generations.",
          long: "You were born with a vast capacity for vision, often feeling the world's weight on your shoulders. Yet big visions need practical everyday foundations. Your calling is translating seemingly impossible dreams into systems, structures, or creations providing security for many.",
        }
      );
    } else if (domain.lifePath === 6) {
      return this.n(
        {
          short: "Menciptakan Harmoni dan Perlindungan",
          medium: "Jalan hidupmu adalah tentang tanggung jawab, cinta tanpa syarat, dan menjadi perekat yang menyatukan komunitas atau keluargamu.",
          long: "Ada panggilan alami di dalam dirimu untuk mengayomi, membimbing, dan menyembuhkan. Namun, pelajaran terbesar dari misimu adalah mengetahui kapan harus berhenti menolong. Kamu hanya bisa benar-benar melindungi orang lain saat kebutuhan dan kebahagiaanmu sendiri sudah terpenuhi. Kepemimpinanmu berasal dari kasih sayang.",
        },
        {
          short: "Creating Harmony and Protection",
          medium: "Your life path is about responsibility, unconditional love, and being the glue that holds your community or family together.",
          long: "You carry a natural call to nurture, guide, and heal. But your mission's greatest lesson is knowing when to stop helping. You can only truly protect others when your own needs and happiness are satisfied. Your leadership flows from compassion.",
        }
      );
    } else if (domain.lifePath === 4) {
      return this.n(
        {
          short: "Menciptakan Keteraturan Berkelanjutan",
          medium: "Kamu hadir untuk membawa stabilitas di lingkungan yang kacau dengan bekerja secara sistematis, sabar, dan terstruktur.",
          long: "Misimu adalah pembuktian bahwa proses yang benar akan menghasilkan karya yang tak lekang oleh waktu. Kepercayaan diri sejatimu akan muncul setelah kamu berhasil membangun sesuatu—baik karier, keluarga, atau karya—selangkah demi selangkah. Abaikan jalan pintas, kekuatanmu ada pada ketahananmu yang tidak dimiliki oleh orang lain.",
        },
        {
          short: "Creating Sustainable Order",
          medium: "You are here to bring stability to chaotic environments through systematic, patient, structured work.",
          long: "Your mission proves that a proper process creates timeless work. True self-confidence emerges once you build something—career, family, or work—step by step. Ignore shortcuts; your strength lies in endurance unmatched by others.",
        }
      );
    } else if (domain.lifePath === 9) {
      return this.n(
        {
          short: "Menjadi Saksi Kebijaksanaan Penuh",
          medium: "Tujuanmu adalah mencapai pemahaman tanpa syarat, menutup siklus lama, dan membagikan kebenaran universal kepada dunia.",
          long: "Kehidupan memintamu untuk melihat dunia dari perspektif yang sangat luas, seolah kamu sedang berdiri di puncak gunung melihat seluruh umat manusia. Misi terbesarmu melibatkan pengabdian, pelepasan ego, dan keberanian untuk membiarkan hal-hal yang sudah usang pergi agar kebaruan bisa lahir di komunitasmu.",
        },
        {
          short: "Witnessing Complete Wisdom",
          medium: "Your purpose is to reach unconditional understanding, close old cycles, and share universal truths with the world.",
          long: "Life asks you to view the world from a vast perspective, as if atop a mountain observing humanity. Your greatest mission involves devotion, ego release, and courage to let outdated things pass so renewal can take root in your community.",
        }
      );
    } else {
      // Default (Life Path 11 - Eva)
      return this.n(
        {
          short: "Menginspirasi Melalui Pencerahan",
          medium: "Kamu adalah saluran ide-ide revolusioner. Kehadiranmu dirancang untuk mengangkat kesadaran orang-orang di sekitarmu.",
          long: "Panggilan jiwamu menuntutmu untuk berjalan di garis tipis antara intuisi batin yang sangat tajam dan realitas dunia fisik. Seringkali kamu merasa tekanan energi yang sangat besar untuk mencapai sesuatu. Ketahuilah bahwa kamu tidak perlu merencanakan semuanya secara logis; biarkan wawasan batinmu memandumu secara spontan menuju dampak besar yang telah menunggumu.",
        },
        {
          short: "Inspiring Through Illumination",
          medium: "You are a channel for revolutionary ideas. Your presence is designed to elevate the consciousness of those around you.",
          long: "Your soul calling demands walking the fine line between sharp inner intuition and physical reality. You often feel immense energy pressure to achieve. Know that you don't need to logically plan everything; allow inner insights to spontaneously guide you toward impactful results waiting for you.",
        }
      );
    }
  }

  private static generateEnergy(domain: CanonicalIdentity["energy"]): HumanNarrative {
    const isGenerator = domain.strategy.includes("Respond");
    const isProjector = domain.strategy.includes("Invitation");
    const isReflector = domain.strategy.includes("Lunar");

    if (isGenerator) {
      return this.n(
        {
          short: "Merespons Aliran Kehidupan",
          medium: "Energi tertinggimu aktif bukan saat kamu memaksakan kehendak, melainkan saat kamu menanggapi hal-hal yang membuat batinmu seketika bersemangat.",
          long: "Tubuhmu adalah kompas yang paling akurat. Ketika sesuatu terasa tepat, kamu memiliki daya tahan dan stamina energi yang nyaris tak terbatas. Namun, jika kamu memaksa mengerjakan hal yang batinmu menolak—walau secara logika masuk akal—kamu akan cepat terbakar dan merasa sangat frustrasi. Berhentilah memikirkan apa yang 'harus' kamu lakukan, mulailah merasakan apa yang 'menarik' tubuhmu.",
        },
        {
          short: "Responding to Life's Flow",
          medium: "Your highest energy activates not when you force your will, but when you respond to things that ignite your inner spark.",
          long: "Your body is your most accurate compass. When something feels right, you possess near-endless energy and stamina. But forcing yourself to do what your inner self rejects—even if logically sound—will quickly burn you out and leave you frustrated. Stop overthinking what you 'should' do, and start sensing what draws your body in.",
        }
      );
    } else if (isProjector) {
      return this.n(
        {
          short: "Mengarahkan Melalui Kebijaksanaan",
          medium: "Kamu dirancang untuk membaca situasi dan membimbing sistem energi orang lain, bukan untuk bekerja keras layaknya mesin.",
          long: "Keajaibanmu baru akan bekerja saat orang lain mengenali nilaimu dan mengundangmu untuk terlibat. Jangan buang energimu untuk meyakinkan mereka yang belum siap mendengarmu; hal itu hanya akan berujung pada rasa pahit dan kelelahan. Istirahatlah dengan teratur, fokuslah pada keahlianmu, dan biarkan undangan yang tepat datang menghampiri kebijaksanaanmu.",
        },
        {
          short: "Guiding Through Wisdom",
          medium: "You're designed to read situations and guide other people's energy systems, not to work hard like a machine.",
          long: "Your magic shines when others recognize your worth and invite your involvement. Waste no energy trying to convince those unprepared to listen; it leads only to bitterness and exhaustion. Rest regularly, focus on your mastery, and let appropriate invitations come to your wisdom.",
        }
      );
    } else {
      return this.n(
        {
          short: "Memantulkan Realitas Sekitar",
          medium: "Kamu bertindak sebagai cermin bagi lingkunganmu. Kesehatan komunitasmu tercermin dari seberapa sehat dirimu.",
          long: "Kamu sangat reseptif terhadap apa pun dan siapa pun yang ada di sekitarmu. Agar kamu bisa mengambil keputusan besar yang tepat, kamu membutuhkan waktu untuk menyerap informasi dari segala sudut. Jangan biarkan tekanan tenggat waktu membuatmu tergesa-gesa; kebenaranmu membutuhkan waktu untuk mengendap perlahan sebelum menjadi tindakan yang jernih.",
        },
        {
          short: "Reflecting Surrounding Reality",
          medium: "You act as a mirror for your environment. Your community's health is reflected in how healthy you are.",
          long: "You are highly receptive to everything and everyone surrounding you. Making proper major decisions requires time to absorb input from all angles. Do not let deadline pressure rush you; your truth takes time to settle gently into clear action.",
        }
      );
    }
  }

  private static generateShadow(domain: CanonicalIdentity["shadow"]): HumanNarrative {
    const tailStr = domain.karmicTail.join("-");

    if (tailStr === "18-6-15") {
      return this.n(
        {
          short: "Ketakutan akan Kesendirian",
          medium: "Pola paling merugikanmu adalah membiarkan ketakutan akan penolakan membuatmu bertahan dalam interaksi yang tidak sehat.",
          long: "Kamu memiliki empati yang begitu besar sehingga sering kali kamu menyerap masalah orang lain dan menganggapnya sebagai tanggung jawabmu. Ilusi bahwa 'aku bisa memperbaiki mereka' sering kali membuatmu melupakan kebutuhanmu sendiri. Kesembuhanmu dimulai dengan kesadaran bahwa mengatakan 'tidak' tidak membuatmu menjadi jahat—itu adalah bentuk rasa hormat pada dirimu sendiri.",
        },
        {
          short: "Fear of Being Alone",
          medium: "Your most damaging pattern is letting the fear of rejection keep you in unhealthy interactions.",
          long: "Your immense empathy leads you to absorb others' problems as your responsibility. The illusion 'I can fix them' causes you to neglect your own needs. Healing begins when realizing that saying 'no' doesn't make you bad—it honors yourself.",
        }
      );
    } else if (tailStr === "15-5-8") {
      return this.n(
        {
          short: "Perfeksionisme dan Kontrol",
          medium: "Kamu sering merasa bahwa segalanya akan berantakan jika tidak berada di bawah kendalimu langsung.",
          long: "Luka intimu membuatmu sangat takut pada ketidakpastian. Sebagai mekanisme pertahanan, kamu membangun struktur, aturan, dan ekspektasi yang sangat kaku, baik untuk dirimu maupun orang di sekitarmu. Sadarilah bahwa kendali penuh adalah sebuah ilusi; kedamaian pikiran sejati baru bisa hadir ketika kamu belajar mempercayai proses yang berjalan organik tanpa harus kamu atur setiap detailnya.",
        },
        {
          short: "Perfectionism and Control",
          medium: "You often feel everything will fall apart if it's not directly under your control.",
          long: "Your core wound induces fear of uncertainty. As defense, you construct rigid structures, rules, and expectations for yourself and others. Realize complete control is an illusion; true peace arises when trusting organic processes without micromanaging.",
        }
      );
    } else if (tailStr === "21-4-10") {
      return this.n(
        {
          short: "Perlawanan pada Perubahan",
          medium: "Kamu sering memegang erat hal yang sudah biasa karena takut mengambil risiko pada hal yang belum pasti.",
          long: "Pola sabotasemu muncul ketika kehidupan memintamu untuk melangkah maju namun ketakutan akan kegagalan membuatmu lumpuh. Kamu mungkin terjebak memikirkan skenario terburuk alih-alih melihat peluang. Langkah pertama untuk memutus pola ini adalah mengakui bahwa mempertahankan stagnasi jauh lebih menyakitkan daripada mengambil satu langkah berani menuju ketidakpastian.",
        },
        {
          short: "Resistance to Change",
          medium: "You often hold tightly to the familiar because you're afraid to risk the uncertain.",
          long: "Self-sabotage strikes when life invites progress yet fear of failure paralyzes you. You fixate on worst-case scenarios over possibilities. Breaking this pattern requires admitting that lingering in stagnation hurts far more than taking one bold step into uncertainty.",
        }
      );
    } else if (tailStr === "9-3-21") {
      return this.n(
        {
          short: "Isolasi karena Disalahpahami",
          medium: "Ada kecenderungan untuk menarik diri secara ekstrem saat kamu merasa pendapatmu tidak dihargai.",
          long: "Wawasanmu yang sering kali melampaui zaman membuatmu rentan merasa kesepian meski berada di keramaian. Namun, memilih untuk bersembunyi dari dunia hanya akan memperbesar rasa frustrasi. Daripada menutup diri karena sakit hati, belajarlah menemukan cara kreatif untuk mengekspresikan sudut pandangmu tanpa menuntut persetujuan instan dari orang-orang yang belum siap mengerti.",
        },
        {
          short: "Isolation from Being Misunderstood",
          medium: "There's a tendency to withdraw extremely when you feel your opinions aren't valued.",
          long: "Ahead-of-time insights can leave you feeling lonely even in crowds. Hiding from the world only amplifies frustration. Rather than shutting down over hurt, discover creative ways to voice your perspective without expecting instant validation.",
        }
      );
    } else {
      // 12-16-4
      return this.n(
        {
          short: "Mengorbankan Harga Diri",
          medium: "Kamu kerap kali mendahulukan kenyamanan orang lain di atas kesejahteraan fisik dan mentalmu sendiri.",
          long: "Pola lama yang sering terulang adalah keyakinan bawah sadar bahwa kamu hanya akan dicintai jika kamu terus-menerus memberikan sesuatu. Hal ini membuat energimu terkuras karena kamu tidak tahu cara menerima bantuan. Belajarlah untuk mengizinkan dirimu dilayani, dan ketahuilah bahwa keberadaanmu saja sudah cukup berharga tanpa kamu harus terus menjadi pahlawan bagi orang lain.",
        },
        {
          short: "Sacrificing Self-Worth",
          medium: "You often prioritize others' comfort above your own physical and mental wellbeing.",
          long: "A subconscious belief persists that love requires continuous giving. This drains your energy because receiving help feels foreign. Allow yourself to be cared for, knowing your existence alone holds intrinsic value without playing hero.",
        }
      );
    }
  }

  private static generateTalents(domain: CanonicalIdentity["talents"]): HumanNarrative {
    const isGenerator = domain.hdType.includes("Generator");
    const isProjector = domain.hdType.includes("Projector");

    if (isGenerator) {
      return this.n(
        {
          short: "Daya Cipta Tanpa Henti",
          medium: "Bakat terbesarmu adalah mengubah ide-ide abstrak menjadi kenyataan fisik yang bisa disentuh, digunakan, atau dinikmati oleh orang banyak.",
          long: "Ada bahan bakar produktivitas di dalam dirimu yang sangat magnetis. Ketika kamu mengerjakan sesuatu yang benar-benar kamu cintai, antusiasmemu menular dan mengangkat moral semua orang yang ada di ruangan yang sama. Kamu adalah katalis hidup yang mampu mengubah lingkungan apatis menjadi penuh energi hanya lewat dedikasimu terhadap karya.",
        },
        {
          short: "Unstoppable Creative Power",
          medium: "Your greatest talent is transforming abstract ideas into physical reality that can be touched, used, or enjoyed by many.",
          long: "You possess a magnetic productivity drive. Doing what you truly love radiates enthusiasm that lifts everyone nearby. You are a live catalyst transforming apathy into energy through sheer dedication to your work.",
        }
      );
    } else if (isProjector) {
      return this.n(
        {
          short: "Efisiensi dan Arahan Visi",
          medium: "Kejeniusanmu bukan terletak pada seberapa banyak pekerjaan yang bisa kamu angkat, melainkan seberapa jeli kamu menemukan cara terbaik untuk melakukannya.",
          long: "Kamu dilahirkan dengan insting untuk mengenali potensi sejati di dalam diri orang lain. Bakatmu adalah menjadi arsitek sistem kehidupan: melihat hambatan, memberikan insight yang akurat, dan menempatkan setiap orang pada posisi di mana mereka bisa bersinar. Di dunia yang sibuk berlari tanpa arah, kontribusi terbesarmu adalah memberikan peta yang benar.",
        },
        {
          short: "Efficiency and Vision",
          medium: "Your genius isn't in how much work you can take on, but in how keenly you find the best way to do it.",
          long: "You carry an innate instinct for spotting genuine potential in others. You act as a system architect: spotting bottlenecks, offering pinpoint insights, and placing people where they shine. In a busy world, your core gift is offering a clear map.",
        }
      );
    } else {
      return this.n(
        {
          short: "Menjadi Barometer Komunitas",
          medium: "Kapasitas empati dan kepekaanmu membuatmu ahli dalam mendiagnosis masalah struktural di dalam komunitas atau perusahaan.",
          long: "Bakat utamamu adalah menjadi cermin yang sangat objektif dan jernih. Kamu bisa dengan cepat merasakan siapa yang tidak otentik dan sistem apa yang sedang rusak sebelum orang lain menyadarinya. Kehadiranmu sangat esensial bagi kelompok mana pun karena kamu menjaga agar mereka tetap sadar dan berada pada jalur integritas.",
        },
        {
          short: "Becoming a Community Barometer",
          medium: "Your empathy and sensitivity make you expert at diagnosing structural problems within communities or organizations.",
          long: "Your prime talent is serving as an objective, clear mirror. You swiftly sense inauthenticity and broken systems before others do. Your presence keeps groups grounded in integrity.",
        }
      );
    }
  }

  private static generateRelationships(domain: CanonicalIdentity["relationships"]): HumanNarrative {
    const isVenus = domain.darakaraka === "Venus" || domain.darakaraka === "Moon";
    const isSaturn = domain.darakaraka === "Saturn" || domain.darakaraka === "Mars";

    if (isSaturn) {
      return this.n(
        {
          short: "Kesetiaan Melalui Struktur",
          medium: "Dalam hubungan, kamu mencari kepastian, komitmen jangka panjang, dan rasa saling hormat melebihi sekadar romansa sesaat.",
          long: "Kamu mungkin butuh waktu lebih lama dari orang lain untuk benar-benar membuka hati dan membiarkan seseorang masuk. Namun setelah kamu berkomitmen, kesetiaanmu nyaris tak tergoyahkan. Tantangan terbesar dalam kehidupan cintamu adalah melembutkan pertahanan dirimu; belajarlah bahwa kerentanan emosional bukanlah sebuah kelemahan, melainkan jembatan menuju keintiman yang sejati.",
        },
        {
          short: "Loyalty Through Structure",
          medium: "In relationships, you seek certainty, long-term commitment, and mutual respect beyond fleeting romance.",
          long: "You may take longer to open your heart fully. But once committed, your loyalty is steadfast. The key growth in your love life is softening defenses; emotional vulnerability is not weakness, but the gateway to true intimacy.",
        }
      );
    } else if (isVenus) {
      return this.n(
        {
          short: "Pencarian Harmoni dan Keindahan",
          medium: "Kamu sangat responsif terhadap sentuhan fisik, lingkungan yang damai, dan bentuk-bentuk perhatian yang sangat nyata.",
          long: "Hubungan adalah tempat di mana kamu belajar paling banyak tentang kehidupan. Kamu secara alami menarik orang-orang dengan kelembutanmu, tetapi ini juga berarti kamu rentan menjadi tempat pembuangan masalah emosional mereka. Cinta sejatimu akan mekar ketika kamu menemukan seseorang yang tidak hanya menikmati kasih sayangmu, tetapi secara konsisten berusaha menciptakan lingkungan yang nyaman dan aman untukmu berlindung.",
        },
        {
          short: "Seeking Harmony and Beauty",
          medium: "You're highly responsive to physical touch, peaceful environments, and very tangible forms of attention.",
          long: "Relationships serve as your primary learning ground. Your gentleness naturally attracts others, but take care not to become their emotional dumping ground. True love flourishes with a partner who cherishes your affection while actively building a safe space for you.",
        }
      );
    } else {
      return this.n(
        {
          short: "Koneksi Melalui Ide",
          medium: "Kamu membutuhkan pasangan yang bisa menyeimbangi kecepatan pikiranmu dan memberikan ruang untuk bertukar gagasan.",
          long: "Bagimu, percakapan yang mendalam dan menstimulasi secara intelektual adalah bentuk awal dari ketertarikan romantis. Jika komunikasi terhenti, koneksi emosional pun akan memudar. Hambatan terbesarmu adalah terlalu sering menganalisis perasaan alih-alih sekadar merasakannya; izinkan hatimu berbicara tanpa harus masuk akal secara logika.",
        },
        {
          short: "Connection Through Ideas",
          medium: "You need a partner who can match your mental speed and give you space to exchange ideas.",
          long: "Deep intellectual conversation forms your initial spark of attraction. If communication stalls, emotional connection fades. Avoid over-analyzing feelings rather than simply experiencing them; allow your heart to speak without requiring pure logic.",
        }
      );
    }
  }

  private static generateTiming(domain: CanonicalIdentity["timing"]): HumanNarrative {
    const dasha = domain.currentDasha;

    if (dasha === "Rahu" || dasha === "Ketu") {
      return this.n(
        {
          short: "Era Transformasi Mendalam",
          medium: "Ini bukan musim untuk mencari kenyamanan. Ini adalah waktu di mana identitas lamamu diruntuhkan agar versi yang lebih otentik bisa lahir.",
          long: "Kamu sedang berada dalam siklus pembersihan besar-besaran. Apa pun yang tidak selaras dengan kebenaran jiwamu perlahan-lahan akan dijauhkan dari hidupmu—baik itu hubungan, karier, maupun pola pikir. Jangan melawan arus perubahan yang terasa ekstrem ini. Lepaskan ekspektasi lama, berselancarlah di atas gelombang ketidakpastian ini, dan percayalah bahwa kamu sedang diarahkan pada kebangkitan yang nyata.",
        },
        {
          short: "Era of Deep Transformation",
          medium: "This isn't a season for seeking comfort. This is when your old identity is torn down so a more authentic version can be born.",
          long: "You are undergoing a major cleansing cycle. Whatever misaligns with your soul truth will fade—relationships, career, or mindsets. Do not resist these intense shifts. Release old expectations, ride the wave of uncertainty, and trust you are led toward genuine awakening.",
        }
      );
    } else if (dasha === "Jupiter" || dasha === "Venus") {
      return this.n(
        {
          short: "Era Ekspansi dan Pertumbuhan",
          medium: "Pintu-pintu kesempatan sedang terbuka. Ini adalah musim untuk mengambil ruang lebih besar dan menuai hasil dari masa-masa sulit sebelumnya.",
          long: "Ada energi optimisme dan perluasan yang sedang bekerja mendukungmu saat ini. Peluang untuk belajar hal baru, memperluas jaringan, atau menikmati kesejahteraan akan lebih mudah menghampirimu. Tantangannya di era ini bukanlah bagaimana bertahan hidup, melainkan bagaimana tetap fokus pada prioritas di tengah banyaknya hal baik yang tiba-tiba datang menuntut perhatianmu.",
        },
        {
          short: "Era of Expansion and Growth",
          medium: "Doors of opportunity are opening. This is the season to take up more space and reap rewards from difficult times.",
          long: "An optimistic expansion energy supports you now. Opportunities to learn, network, or enjoy prosperity come naturally. The key challenge isn't survival, but staying centered on priorities amidst abundant new prospects.",
        }
      );
    } else {
      return this.n(
        {
          short: "Era Konsolidasi",
          medium: "Saatnya melambat. Musim ini menuntut kedisiplinan, fokus internal, dan evaluasi mendalam atas struktur kehidupanmu.",
          long: "Kamu sedang diuji untuk membangun fondasi yang akan menopangmu di masa depan. Kamu mungkin merasa bahwa segala sesuatunya bergerak lebih lambat atau terasa lebih berat dari biasanya. Namun, ini bukanlah bentuk hukuman; ini adalah undangan untuk merapikan kehidupanmu. Fokuslah pada kedisiplinan, selesaikan apa yang kamu mulai, dan hindari mengambil jalan pintas.",
        },
        {
          short: "Era of Consolidation",
          medium: "Time to slow down. This season demands discipline, internal focus, and deep evaluation of your life structures.",
          long: "You are building the foundation supporting your future. Things may feel slower or heavier than usual. This is no punishment; it invites you to organize life. Focus on discipline, finish what you begin, and avoid taking shortcuts.",
        }
      );
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
      chakra: this.n(
        {
          short: expression ? "Tubuh Meminta Ruang untuk Bersuara" : grounding ? "Tubuh Meminta Rasa Aman" : "Tubuh Menyimpan Pesan Emosional",
          medium: expression ? "Ketegangan dapat lebih cepat terasa ketika banyak hal ditahan dan tidak diucapkan. Tubuhmu cenderung lega saat perasaan mendapat jalan keluar yang aman." : grounding ? "Saat hidup terasa tidak pasti, tubuhmu mungkin lebih cepat tegang atau lelah. Rutinitas sederhana membantu mengembalikan rasa aman." : "Tubuhmu peka terhadap emosi yang belum selesai. Rasa lelah atau tegang dapat menjadi undangan untuk mendengar kebutuhan yang diabaikan.",
          long: "Contohnya, saat tubuh terasa tidak nyaman tanpa sebab yang jelas, periksa napas, ketegangan otot, dan emosi yang sedang kamu tahan. Pilih satu tindakan lembut: berjalan, minum air, menulis, atau meminta jeda."
        },
        {
          short: expression ? "Body Asking for Room to Speak" : grounding ? "Body Asking for Security" : "Body Storing Emotional Messages",
          medium: expression ? "Tension builds quickly when feelings are held back. Your body finds relief when emotions get a safe outlet." : grounding ? "When life feels uncertain, your body may tire or tense sooner. Simple routines restore security." : "Your body is sensitive to unresolved emotions. Fatigue or tension invites you to listen to ignored needs.",
          long: "For example, when experiencing unexplained physical discomfort, check breath, muscle tension, and suppressed emotions. Take one gentle action: walk, drink water, write, or request a pause."
        }
      ),
      digestion: this.n(
        {
          short: quietEating ? "Mencerna Lebih Baik Saat Tenang" : "Makan dengan Perhatian Penuh",
          medium: quietEating ? "Tubuhmu cenderung memproses makanan lebih nyaman ketika suasana tidak terburu-buru dan rangsangan di sekitar berkurang." : "Kualitas perhatian saat makan sama pentingnya dengan pilihan makanannya. Tubuhmu lebih mudah memberi tanda cukup ketika kamu tidak makan sambil mengejar hal lain.",
          long: "Contohnya, pilih satu waktu makan tanpa layar selama beberapa hari. Makan lebih perlahan, berhenti di tengah untuk merasakan tubuh, lalu catat apakah energi dan kenyamananmu berubah."
        },
        {
          short: quietEating ? "Digests Better in Calm" : "Mindful Eating",
          medium: quietEating ? "Your body processes food more comfortably in an unhurried, quiet environment." : "Mindful attention during meals is as vital as food choices. Your body signals fullness when not distracted by tasks.",
          long: "For example, pick one screen-free meal daily for a few days. Eat slowly, pause mid-meal to tune into your body, and note energy changes."
        }
      ),
      environment: this.n(
        {
          short: activeSpace ? "Hidup di Ruang yang Bergerak" : "Pulih di Ruang yang Memberi Napas",
          medium: activeSpace ? "Energi dan fokusmu lebih mudah bangkit di tempat yang memiliki aktivitas dan rasa hidup, selama kamu tetap punya sudut untuk menepi." : "Tubuhmu lebih mudah tenang ketika ruang terasa lapang, teratur, dan tidak membanjiri indra.",
          long: "Contohnya, jika sulit fokus, jangan hanya memaksa pikiran. Uji bekerja di ruang berbeda, rapikan satu area kecil, atau ubah cahaya dan suara sampai tubuh terasa lebih mudah bernapas."
        },
        {
          short: activeSpace ? "Thriving in Dynamic Space" : "Restoring in Breathing Space",
          medium: activeSpace ? "Energy and focus rise in lively environments, provided you have a quiet corner to withdraw to." : "Your body relaxes easily in spacious, orderly, and sensory-balanced settings.",
          long: "For example, when struggling to focus, don't force it. Try a different space, tidy a small area, or adjust lighting/sound until your body breathes easier."
        }
      ),
      rhythm: this.n(
        {
          short: restEarly ? "Istirahat Sebelum Benar-Benar Habis" : "Gunakan Tenaga, Lalu Lepaskan",
          medium: restEarly ? "Tubuhmu tidak perlu mempertahankan tempo tinggi sepanjang hari. Jeda yang dijadwalkan lebih efektif daripada menunggu sampai kelelahan." : "Tidur lebih mudah datang ketika energi hari itu sudah digunakan untuk sesuatu yang terasa hidup dan bermakna.",
          long: "Contohnya, tentukan batas akhir aktivitas dan buat ritual penurunan tempo selama tiga puluh menit. Redupkan cahaya, hentikan pekerjaan, dan beri tubuh sinyal yang sama setiap malam."
        },
        {
          short: restEarly ? "Rest Before Drained" : "Exert Energy, Then Release",
          medium: restEarly ? "Your body doesn't need high tempo all day. Scheduled pauses beat waiting for total collapse." : "Sleep comes readily when daily energy was applied toward something meaningful.",
          long: "For example, set an activity cutoff and establish a thirty-minute wind-down ritual. Dim lights, halt work, and signal your body nightly."
        }
      ),
      element: this.n(
        {
          short: element.includes("fire") ? "Energi yang Cepat Menyala" : element.includes("water") ? "Energi yang Peka dan Adaptif" : element.includes("wood") ? "Energi yang Ingin Bertumbuh" : element.includes("metal") ? "Energi yang Tegas dan Terarah" : "Energi yang Stabil dan Menopang",
          medium: element.includes("fire") ? "Kamu mudah bersemangat dan menularkan energi, tetapi perlu menjaga agar antusiasme tidak berubah menjadi kelelahan." : element.includes("water") ? "Kamu peka membaca suasana dan mudah menyesuaikan diri, tetapi membutuhkan batas agar tidak larut dalam keadaan sekitar." : element.includes("wood") ? "Kamu hidup ketika merasa berkembang dan bergerak maju, tetapi bisa frustrasi saat terlalu lama terhambat." : element.includes("metal") ? "Kamu kuat dalam ketegasan dan kualitas, tetapi perlu berhati-hati agar standar tinggi tidak menjadi kekakuan." : "Kamu membawa daya menenangkan dan ketahanan, tetapi perlu bergerak saat kenyamanan mulai berubah menjadi stagnasi.",
          long: "Contohnya, saat tertekan, cari penyeimbang: perlambat jika terlalu menyala, bergerak jika terlalu diam, dan minta dukungan jika terlalu lama menahan semuanya sendiri."
        },
        {
          short: element.includes("fire") ? "Swiftly Igniting Energy" : element.includes("water") ? "Sensitive & Adaptive Energy" : element.includes("wood") ? "Growth-Oriented Energy" : element.includes("metal") ? "Decisive & Directed Energy" : "Stable & Supportive Energy",
          medium: element.includes("fire") ? "You ignite quickly and spread energy, but must prevent enthusiasm from turning into burnout." : element.includes("water") ? "You adapt and read atmospheres easily, but need boundaries to avoid dissolving into surroundings." : element.includes("wood") ? "You thrive when progressing, but get frustrated when blocked for long." : element.includes("metal") ? "You excel in precision and quality, but beware of high standards becoming rigidity." : "You bring calming resilience, but must stay mobile when comfort breeds stagnation.",
          long: "For example, under stress, seek balance: slow down if burning out, move if stationary, and seek support if carrying everything alone."
        }
      )
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
    ], domain.mission.lifePathRole || (this.isEn ? "a life direction seeking tangible form" : "arah hidup yang sedang meminta bentuk nyata"));
    const giftSignals = this.readable([
      ...domain.gifts.lifePathStrengths,
      ...domain.gifts.tzolkinGifts,
      ...domain.gifts.vedicStrengths,
      ...domain.gifts.wetonStrengths,
      ...domain.gifts.baziStrengths,
      ...domain.gifts.destinyGreatTalents.map((talent) => `Arcana ${talent}`),
    ], this.isEn ? "sensitivity to reading patterns, keeping rhythm, and transforming insights into action" : "kepekaan membaca pola, menjaga ritme, dan mengubah insight menjadi tindakan");
    const lessonSignals = this.readable([
      ...domain.lessons.tzolkinLessons,
      ...domain.lessons.vedicChallenges,
      ...domain.lessons.wetonChallenges,
      ...domain.lessons.baziChallenges,
      domain.lessons.natalChiron,
      domain.lessons.humanDesignNotSelf,
      ...domain.lessons.destinyKarmicTail.map((item) => `Arcana ${item}`),
    ], this.isEn ? "choosing a more conscious response when old patterns trigger" : "memilih respons yang lebih sadar ketika pola lama mulai aktif");
    const shadowSignals = this.readable([
      ...domain.shadow.tzolkinShadow,
      domain.shadow.natalChiron,
      domain.shadow.natalLilith,
      domain.shadow.natalPluto,
      domain.shadow.natalSouthNode,
      domain.shadow.humanDesignNotSelf,
      ...domain.shadow.openCenters,
      ...domain.shadow.destinyKarmicTail.map((item) => `Arcana ${item}`),
    ], this.isEn ? "old self-protections emerging when feeling unsafe" : "perlindungan lama yang muncul saat kamu merasa tidak aman");
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
    ], this.isEn ? "a seeker of meaning learning to ground consciousness" : "pembaca makna yang belajar membumikan kesadaran");

    return {
      mission: this.n(
        {
          short: "Misi Jiwa yang Membumi",
          medium: `Misi jiwamu bergerak di sekitar ${missionSignals}. Ini bukan target kaku, melainkan arah yang makin jelas saat pilihan harianmu terasa jujur dan berguna.`,
          long: `Dalam hidup sehari-hari, misi ini tampak ketika kamu berhenti mengejar semua kemungkinan dan mulai memberi bentuk pada ${missionSignals}. Tanyakan: kontribusi mana yang membuatmu merasa lebih utuh, bukan sekadar terlihat berhasil?`,
        },
        {
          short: "A Grounded Soul Mission",
          medium: `Your soul mission revolves around ${missionSignals}. This is not a rigid target, but a direction becoming clearer as daily choices feel honest and useful.`,
          long: `In daily life, this mission shows up when you stop chasing every possibility and begin shaping ${missionSignals}. Ask: which contribution leaves you feeling whole, rather than merely successful?`,
        }
      ),
      gifts: this.n(
        {
          short: "Hadiah Jiwa yang Bisa Dilatih",
          medium: `Hadiah alami yang paling kuat terlihat melalui ${giftSignals}. Kualitas ini menjadi lebih matang saat dipakai untuk menolong, membangun, menerjemahkan, atau menenangkan sesuatu secara nyata.`,
          long: `Bakat jiwa tidak harus muncul sebagai hal besar. Ia bisa terlihat dari cara kamu membaca situasi, memilih kata, menjaga ritme, atau membantu orang merasa lebih jelas. Latih satu hadiah dari ${giftSignals} dalam konteks kecil yang benar-benar terjadi minggu ini.`,
        },
        {
          short: "Soul Gifts That Can Be Trained",
          medium: `Your strongest natural gifts shine through ${giftSignals}. These qualities mature when used to help, build, translate, or calm real situations.`,
          long: `Soul talents need not appear as massive grand gestures. They manifest in how you read situations, choose words, keep rhythm, or bring clarity. Practice one gift from ${giftSignals} in a small real context this week.`,
        }
      ),
      lessons: this.n(
        {
          short: "Pelajaran Jiwa yang Berulang",
          medium: `Pelajaran utamamu berkaitan dengan ${lessonSignals}. Tema ini biasanya muncul saat hidup meminta respons baru, sementara bagian lama dalam dirimu masih ingin memakai cara yang sudah dikenal.`,
          long: `Saat pelajaran ini muncul, jangan buru-buru menganggapnya sebagai kegagalan. Ia sering datang sebagai kesempatan untuk melihat pola dengan lebih sadar. Perhatikan kapan ${lessonSignals} aktif, lalu pilih satu respons yang lebih dewasa dari biasanya.`,
        },
        {
          short: "Recurring Soul Lessons",
          medium: `Your main lessons involve ${lessonSignals}. This theme surfaces when life requests new responses while older parts of you default to familiar patterns.`,
          long: `When this lesson arises, do not hastily label it a failure. It offers an invitation to observe patterns consciously. Notice when ${lessonSignals} activates, and choose a more mature response.`,
        }
      ),
      shadow: this.n(
        {
          short: "Bayangan Jiwa yang Perlu Dilihat",
          medium: `Bayangan jiwamu paling mudah muncul melalui ${shadowSignals}. Ini bukan sisi buruk, melainkan mekanisme perlindungan yang pernah membantumu bertahan.`,
          long: `Bayangan ini mulai melembut ketika kamu dapat mengenalinya sebelum ia mengambil alih keputusan. Saat ${shadowSignals} terasa aktif, hentikan pembuktian diri sebentar dan tanyakan kebutuhan apa yang sebenarnya sedang dilindungi.`,
        },
        {
          short: "Soul Shadow That Needs Seeing",
          medium: `Your soul shadow surfaces through ${shadowSignals}. This isn't a flaw, but a protective mechanism that once served your survival.`,
          long: `This shadow softens as you recognize it before it drives decisions. When ${shadowSignals} triggers, pause self-proof efforts and ask which core need is seeking protection.`,
        }
      ),
      archetype: this.n(
        {
          short: "Arketipe Jiwa Gabungan",
          medium: `Arketipe jiwamu terbentuk dari perpaduan ${archetypeSignals}. Gabungan ini menunjukkan cara khas kamu hadir, belajar, memengaruhi ruang, dan menemukan makna.`,
          long: `Gunakan arketipe ini sebagai cermin, bukan kotak. Ketika ${archetypeSignals} terasa hidup, kamu biasanya lebih mudah bergerak tanpa meninggalkan dirimu sendiri. Saat terasa jauh, itu tanda untuk kembali pada ritme yang lebih jujur.`,
        },
        {
          short: "Combined Soul Archetype",
          medium: `Your soul archetype blends ${archetypeSignals}. This combination defines your unique way of showing up, learning, influencing spaces, and discovering meaning.`,
          long: `Use this archetype as a mirror, not a cage. When ${archetypeSignals} feels active, moving authentically comes easily. When distant, return to your honest rhythm.`,
        }
      ),
    };
  }

  private static generateSpiritualityHuman(domain: CanonicalIdentity["spirituality"]): HumanMeaning["spirituality"] {
    const pathText = domain.vedicNinthHouse.toLowerCase();
    const devotional = /devotion|bakti|faith|iman|heart|hati/.test(pathText);
    const knowledge = /knowledge|belajar|study|wisdom|pengetahuan/.test(pathText);
    const surrenderControl = /saturn|mars|capricorn|aries/.test(domain.vedicAtmakaraka.toLowerCase());
    const potentialTheme = domain.destinyHighArcana % 3 === 0 ? (this.isEn ? "reading unspoken feelings and needs" : "membaca perasaan dan kebutuhan yang tidak terucap") : domain.destinyHighArcana % 3 === 1 ? (this.isEn ? "seeing patterns and possibilities before others notice" : "melihat pola dan kemungkinan sebelum orang lain menyadarinya") : (this.isEn ? "calming situations and guiding direction" : "menenangkan keadaan dan membantu orang menemukan arah");
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
      path: this.n(
        { short: devotional ? "Menemukan Makna melalui Pengabdian" : knowledge ? "Menemukan Makna melalui Pemahaman" : "Menemukan Makna melalui Tindakan", medium: devotional ? "Kedalaman batinmu tumbuh saat hati terlibat—melalui doa, pelayanan, rasa syukur, atau hubungan yang membuatmu merasa terhubung." : knowledge ? "Kedalaman batinmu tumbuh saat kamu belajar, merenung, dan menemukan hubungan antara pengalaman hidup dengan pemahaman yang lebih luas." : "Kedalaman batinmu tumbuh ketika nilai yang kamu percaya diwujudkan dalam tindakan nyata, bukan hanya dipikirkan.", long: "Contohnya, pilih satu praktik sederhana yang bisa dijalani konsisten: membaca dan merenung, membantu seseorang, berdoa, atau duduk hening. Ukur manfaatnya dari apakah kamu menjadi lebih jernih dan baik dalam hidup sehari-hari." },
        { short: devotional ? "Finding Meaning Through Devotion" : knowledge ? "Finding Meaning Through Understanding" : "Finding Meaning Through Action", medium: devotional ? "Inner depth expands when your heart engages—in prayer, service, gratitude, or meaningful connection." : knowledge ? "Inner depth expands as you learn, reflect, and connect life experience with broader understanding." : "Inner depth expands when held values manifest in tangible action, not just thought.", long: "For example, choose one simple consistent practice: reading, helping someone, praying, or sitting quietly. Measure success by daily clarity and kindness." }
      ),
      evolution: this.n(
        { short: surrenderControl ? "Belajar Melunak tanpa Kehilangan Kekuatan" : "Melepas Identitas yang Sudah Sempit", medium: surrenderControl ? "Pertumbuhanmu meminta kekuatan yang tidak selalu berbentuk kendali. Kamu berkembang saat mampu tetap tegas sekaligus terbuka pada bantuan, perubahan, dan kerentanan." : "Kehidupan mengajakmu meninggalkan gambaran lama tentang siapa dirimu agar pilihanmu tidak lagi dikendalikan oleh kebutuhan membuktikan sesuatu.", long: "Contohnya, saat rencana berubah, perhatikan dorongan untuk memaksa keadaan kembali sesuai keinginan. Tanyakan apa yang masih bisa dijaga dan apa yang perlu dilepaskan agar kamu tetap utuh." },
        { short: surrenderControl ? "Learning Softness Without Losing Strength" : "Releasing Narrow Identities", medium: surrenderControl ? "Growth demands strength that isn't always control. You thrive remaining firm yet open to help, change, and vulnerability." : "Life invites shedding past self-concepts so choices aren't driven by self-proof.", long: "For example, when plans shift, notice impulses to force outcomes. Ask what to uphold and what to release to stay whole." }
      ),
      potential: this.n(
        { short: "Kapasitas Kebijaksanaan", medium: `Kepekaanmu paling berguna ketika dipakai untuk ${potentialTheme}. Ini adalah kemampuan membaca manusia dan situasi, bukan kepastian tentang hal-hal gaib.`, long: "Contohnya, jika kamu menangkap suasana sebelum orang lain mengatakannya, jangan langsung menyimpulan. Ajukan pertanyaan lembut, periksa faktanya, lalu gunakan kepekaanmu untuk menciptakan rasa aman." },
        { short: "Wisdom Capacity", medium: `Your sensitivity works best when applied to ${potentialTheme}. This is skill in reading people and situations, not supernatural certainty.`, long: "For example, if you sense a mood early, don't rush to conclusions. Ask gentle questions, check facts, and use sensitivity to create safety." }
      ),
      talents: this.n(
        { short: talentTheme === 0 ? "Bakat Menenangkan dan Mendampingi" : talentTheme === 1 ? "Bakat Menunjukkan Arah" : "Bakat Menghubungkan Makna", medium: talentTheme === 0 ? "Kehadiranmu dapat membantu orang merasa lebih aman, terutama ketika kamu mendengarkan tanpa terburu-buru memberi jawaban." : talentTheme === 1 ? "Kamu berpotensi melihat langkah berikutnya ketika orang lain masih bingung. Kekuatan ini paling berguna ketika disampaikan sebagai undangan, bukan perintah." : "Kamu mampu menemukan benang merah di antara pengalaman yang tampak terpisah dan membantu orang memahami apa yang sedang mereka jalani.", long: "Contohnya, gunakan kemampuan ini dalam bentuk nyata: menemani teman, menulis refleksi, mengajar, atau membantu seseorang menyusun pilihan—tanpa mengambil alih hidup mereka." },
        { short: talentTheme === 0 ? "Talent for Calming & Accompanying" : talentTheme === 1 ? "Talent for Showing Direction" : "Talent for Connecting Meaning", medium: talentTheme === 0 ? "Your presence calms others, especially when listening without rushing to answer." : talentTheme === 1 ? "You see next steps when others feel confused. Share this strength as invitations, not commands." : "You find common threads across distinct experiences, helping others make sense of their path.", long: "For example, apply this tangibly: support a friend, write reflections, teach, or aid decision-making without taking over." }
      ),
      intuition: this.n(
        { short: sensing ? "Intuisi Hadir sebagai Rasa Tubuh" : seeing ? "Intuisi Hadir sebagai Gambaran dan Pola" : "Intuisi Hadir sebagai Pengetahuan yang Tenang", medium: sensing ? "Kamu sering mengetahui keselarasan melalui sensasi: lega, berat, hangat, atau tegang. Sinyal ini perlu dibedakan dari rasa takut yang mendesak." : seeing ? "Kamu cenderung menangkap pola atau gambaran yang belum jelas bagi orang lain. Wawasanmu menjadi kuat setelah diuji dengan kenyataan." : "Jawaban kadang muncul sebagai keyakinan tenang tanpa rangkaian alasan panjang. Ia berbeda dari pikiran cemas karena tidak memaksa atau berputar-putar.", long: "Contohnya, catat sinyal pertama yang muncul sebelum keputusan penting, lalu bandingkan dengan hasilnya beberapa hari kemudian. Dengan begitu, kamu belajar membedakan intuisi dari kecemasan." },
        { short: sensing ? "Intuition Arrives as Body Sensation" : seeing ? "Intuition Arrives as Images & Patterns" : "Intuition Arrives as Quiet Knowing", medium: sensing ? "You gauge alignment via sensations: relief, heaviness, warmth, or tension. Distinguish these from urgent fear." : seeing ? "You catch subtle patterns or visions. Insights gain strength when tested against reality." : "Answers arise as quiet conviction without lengthy arguments. Unlike anxiety, it doesn't force or loop.", long: "For example, record initial signals before major choices, then compare with results days later to separate intuition from anxiety." }
      ),
      channeling: this.n(
        { short: "Akses Inspirasi", medium: domain.hdHeadAjnaDefined ? "Pikiranmu mampu menahan dan mengembangkan gagasan sampai menjadi kerangka yang jelas. Inspirasi lebih berguna ketika diberi waktu untuk matang." : "Pikiranmu terbuka menangkap banyak gagasan dari lingkungan. Tidak semuanya harus diikuti; pilih ide yang tetap penting setelah suasana berubah.", long: "Contohnya, ketika ide datang tiba-tiba, tulis dalam satu kalimat dan jangan langsung menganggapnya kebenaran. Baca kembali besok, uji dengan fakta, lalu wujudkan hanya jika masih relevan." },
        { short: "Inspiration Access", medium: domain.hdHeadAjnaDefined ? "Your mind can hold and develop ideas into clear frameworks. Inspiration benefits from maturing time." : "Your mind openly catches ideas from surroundings. Filter for what remains vital after moods shift.", long: "For example, when an idea strikes, record it without treating it as absolute truth. Reread tomorrow, test with facts, and implement if relevant." }
      ),
      aura: this.n(
        { short: guiding ? "Kehadiran yang Membaca dan Mengarahkan" : reflecting ? "Kehadiran yang Memantulkan Suasana" : "Kehadiran yang Menghidupkan Ruang", medium: guiding ? "Orang dapat merasa benar-benar terlihat saat kamu memberi perhatian penuh. Pengaruhmu paling kuat ketika nasihatmu diminta dan diterima." : reflecting ? "Kehadiranmu peka terhadap kualitas lingkungan. Kamu sering memperjelas keadaan hanya dengan menunjukkan apa yang sebenarnya sedang terjadi." : "Kehadiranmu cenderung membawa gerak dan daya hidup. Ketika kamu antusias secara autentik, energi itu mudah menular.", long: "Contohnya, perhatikan respons orang ketika kamu memasuki kelompok. Dengarkan sebelum mengarahkan, pilih lingkungan yang sehat, dan jangan mengukur nilai diri dari reaksi setiap orang." },
        { short: guiding ? "Presence That Reads & Guides" : reflecting ? "Presence That Reflects Atmosphere" : "Presence That Enlivens Space", medium: guiding ? "Others feel truly seen under your full attention. Influence peaks when advice is invited." : reflecting ? "You feel environmental quality sharply, clarifying reality simply by reflecting it." : "Your presence sparks vitality. Authentic enthusiasm easily spreads.", long: "For example, observe reactions when entering groups. Listen before guiding, choose healthy spaces, and avoid tying worth to every reaction." }
      ),
      clair: this.n(
        { short: clairFeeling && clairKnowing ? "Peka pada Rasa sekaligus Pola" : clairFeeling ? "Peka pada Perubahan Rasa" : clairKnowing ? "Peka pada Pola dan Pemahaman" : "Peka pada Nuansa yang Halus", medium: clairFeeling && clairKnowing ? "Kamu dapat menangkap suasana melalui tubuh sekaligus memahami pola di baliknya. Kepekaan ini berguna ketika rasa dan fakta diperiksa bersama." : clairFeeling ? "Kamu mudah merasakan perubahan suasana, ketegangan, atau kenyamanan sebelum hal itu dibicarakan." : clairKnowing ? "Kamu cepat melihat hubungan dan memahami sesuatu secara menyeluruh, meski proses berpikirmu sulit dijelaskan." : "Kamu menangkap perubahan kecil dalam nada, ekspresi, atau suasana yang sering dilewatkan orang lain.", long: "Contohnya, ketika merasa mengetahui sesuatu tentang orang atau situasi, ubah kesimpulan menjadi pertanyaan. Periksa dengan lembut dan akui bahwa persepsimu bisa benar, sebagian benar, atau keliru." },
        { short: clairFeeling && clairKnowing ? "Sensitive to Feelings & Patterns" : clairFeeling ? "Sensitive to Feeling Shifts" : clairKnowing ? "Sensitive to Patterns & Understanding" : "Sensitive to Subtle Nuances", medium: clairFeeling && clairKnowing ? "You feel atmosphere bodily while grasping underlying patterns. Best applied when combining feeling and facts." : clairFeeling ? "You sense shifts in mood, tension, or comfort before spoken." : clairKnowing ? "You quickly perceive connections holistically, even if hard to explain." : "You catch subtle nuances in tone, expression, or atmosphere missed by others.", long: "For example, when sensing something about others or situations, turn conclusions into gentle questions to verify." }
      ),
    };
  }

  private static generateSpirituality(domain: CanonicalIdentity["spirituality"]): HumanMeaning["spirituality"] {
    const isEn = this.isEn;
    const path = domain.vedicNinthHouse || (isEn ? "meaning path not yet available" : "jalur makna belum tersedia");
    const evolution = domain.vedicAtmakaraka || (isEn ? "evolution theme not yet available" : "tema evolusi belum tersedia");
    const arcana = domain.destinyHighArcana || (isEn ? "not yet available" : "belum tersedia");
    const talents = domain.destinyTalents.length ? domain.destinyTalents.join(", ") : (isEn ? "not yet available" : "belum tersedia");
    const cognition = domain.hdCognition || (isEn ? "intuition modality not yet available" : "modalitas intuisi belum tersedia");
    const inspiration = domain.hdHeadAjnaDefined 
      ? (isEn ? "head and ajna defined" : "kepala dan ajna terdefinisi")
      : (isEn ? "head and ajna not defined together" : "kepala dan ajna tidak sama-sama terdefinisi");
    const aura = domain.hdAura || (isEn ? "aura type not yet available" : "tipe aura belum tersedia");
    const clair = [
      isEn ? `talent ${domain.clairIndicators.destinyTalents.join(", ") || "not yet available"}` : `talenta ${domain.clairIndicators.destinyTalents.join(", ") || "belum tersedia"}`,
      domain.clairIndicators.spleenDefined ? (isEn ? "spleen defined" : "limpa terdefinisi") : (isEn ? "spleen open" : "limpa terbuka"),
      domain.clairIndicators.ajnaDefined ? (isEn ? "ajna defined" : "ajna terdefinisi") : (isEn ? "ajna open" : "ajna terbuka"),
      domain.clairIndicators.solarPlexusDefined ? (isEn ? "solar plexus defined" : "solar plexus terdefinisi") : (isEn ? "solar plexus open" : "solar plexus terbuka"),
    ].join("; ");

    return {
      path: this.n(
        {
          short: "Jalan Menuju Kedamaian",
          medium: `Jalur makna yang tercatat dalam petamu adalah ${path}.`,
          long: `Jadikan tema ${path} sebagai arah eksplorasi, lalu pilih praktik yang tetap membumi dan selaras dengan nilai hidupmu.`
        },
        {
          short: "Path to Peace",
          medium: `The path of meaning recorded in your chart is ${path}.`,
          long: `Use the theme of ${path} as an exploratory direction, choosing grounded practices aligned with your values.`
        }
      ),
      evolution: this.n(
        {
          short: "Pelajaran Ego Tertinggi",
          medium: `Tema evolusi jiwamu dibaca melalui ${evolution}.`,
          long: `Amati bagaimana tema ${evolution} berulang dalam pilihan dan relasimu; pertumbuhan dimulai saat kamu meresponsnya dengan lebih sadar.`
        },
        {
          short: "Highest Ego Lesson",
          medium: `Your soul evolution theme is read through ${evolution}.`,
          long: `Observe how ${evolution} recurs in choices and relationships; growth begins when responding with awareness.`
        }
      ),
      potential: this.n(
        {
          short: "Kapasitas Kebijaksanaan",
          medium: `Potensi sensitivitas spiritualmu ditandai oleh Arcana ${arcana}.`,
          long: `Gunakan kualitas Arcana ${arcana} sebagai bahasa refleksi untuk memahami sensitivitasmu tanpa mengubahnya menjadi klaim supernatural.`
        },
        {
          short: "Wisdom Capacity",
          medium: `Your spiritual sensitivity potential is marked by Arcana ${arcana}.`,
          long: `Use the qualities of Arcana ${arcana} as reflective language to understand sensitivity without supernatural claims.`
        }
      ),
      talents: this.n(
        {
          short: "Bakat Pengabdian",
          medium: `Garis bakat spiritualmu membawa pola ${talents}.`,
          long: `Kembangkan pola ${talents} melalui pelayanan yang konkret, proporsional, dan tetap menghormati batas energimu.`
        },
        {
          short: "Devotional Gifts",
          medium: `Your spiritual talent line carries the pattern of ${talents}.`,
          long: `Develop ${talents} through concrete, balanced service respecting your energy bounds.`
        }
      ),
      intuition: this.n(
        {
          short: "Cara Intuisi Berbicara",
          medium: `Jejak intuisi yang tercatat untukmu hadir melalui ${cognition}.`,
          long: `Catat kapan sinyal ${cognition} muncul dan bandingkan dengan hasil nyata agar kepercayaan pada intuisi tumbuh secara teruji.`
        },
        {
          short: "How Intuition Speaks",
          medium: `Your intuition trace presents through ${cognition}.`,
          long: `Track when ${cognition} signals surface and compare with real results to build grounded trust.`
        }
      ),
      channeling: this.n(
        {
          short: "Akses Inspirasi",
          medium: `Pola penerimaan inspirasi dibaca sebagai ${inspiration}.`,
          long: `Perlakukan pola ${inspiration} sebagai kecenderungan menerima ide mendadak, bukan komunikasi dengan entitas; tangkap idenya lalu uji dalam karya nyata.`
        },
        {
          short: "Inspiration Access",
          medium: `Your inspiration pattern reads as ${inspiration}.`,
          long: `Treat ${inspiration} as a tendency to catch sudden ideas, test them, and bring them into work.`
        }
      ),
      aura: this.n(
        {
          short: "Karakter Medan Energi",
          medium: `Karakter medan energimu mengikuti pola ${aura}.`,
          long: `Amati bagaimana pola ${aura} memengaruhi cara orang merespons kehadiranmu, tanpa menganggapnya sebagai ukuran nilai diri.`
        },
        {
          short: "Energy Field Character",
          medium: `Your energy field character follows the pattern of ${aura}.`,
          long: `Observe how ${aura} affects others' response to your presence without defining your self-worth.`
        }
      ),
      clair: this.n(
        {
          short: "Kepekaan Khusus",
          medium: `Kecenderungan kepekaanmu dibaca dari ${clair}.`,
          long: `Gunakan kombinasi ${clair} sebagai peta probabilistik untuk mengamati cara kamu merasa, mengetahui, melihat pola, atau menangkap nada—bukan sebagai kepastian kemampuan gaib.`
        },
        {
          short: "Special Sensitivity",
          medium: `Your sensitivity tendency reads from ${clair}.`,
          long: `Use ${clair} as a probabilistic map to observe how you feel, know, or see patterns.`
        }
      )
    };
  }
}
