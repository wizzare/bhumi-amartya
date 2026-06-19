import type { AstroHouseActivation } from "@/lib/astrology/astroHouseActivations";
import type { BodyStatus } from "@/lib/astrology/calculateCurrentSky";
import { getCanonicalHumanDesignType } from "@/lib/humandesign/hdAudit";

type RecordValue = Record<string, unknown>;

export type TransitNarrative = {
  title: string;
  collectiveTheme: string;
  personalImpact: string;
  action: string;
  isLongTransit: boolean;
};

const LABELS: Record<string, string> = {
  Sun: "Matahari",
  Moon: "Bulan",
  Mercury: "Merkurius",
  Venus: "Venus",
  Mars: "Mars",
  Jupiter: "Jupiter",
  Saturn: "Saturnus",
  Uranus: "Uranus",
  Neptune: "Neptunus",
  Pluto: "Pluto",
  Chiron: "Chiron",
};

const LONG_TRANSITS = new Set(["Saturn", "Uranus", "Neptune", "Pluto", "Chiron"]);

const PLANET_COLLECTIVES: Record<string, string> = {
  Sun: "Matahari memancarkan vitalitas, identitas sadar, dan arah fokus utama kita.",
  Moon: "Bulan mengalirkan kepekaan emosional, kebutuhan rasa aman, dan pasang surut perasaan harian.",
  Mercury: "Merkurius mengaktifkan cara berpikir, pola komunikasi, proses belajar, dan pertukaran informasi.",
  Venus: "Venus menyoroti nilai estetika, daya tarik, keharmonisan relasi, dan rasa harga diri.",
  Mars: "Mars menggerakkan keberanian bertindak, momentum fisik, kekuatan kehendak, dan dorongan inisiatif.",
  Jupiter: "Jupiter membuka ruang pertumbuhan, perluasan makna hidup, keyakinan batin, dan peluang baru.",
  Saturn: "Saturnus membawa pelajaran tentang tanggung jawab, pendewasaan diri, batasan sehat, dan struktur jangka panjang.",
  Uranus: "Uranus memicu pembaruan ide, dorongan kebebasan batin, inovasi, dan pecahnya pola-pola usang.",
  Neptune: "Neptunus memperdalam intuisi spiritual, kepekaan seni, sekaligus melarutkan kepastian batin.",
  Pluto: "Pluto mendorong transformasi psikologis, pelepasan kontrol lama, dan regenerasi kekuatan diri.",
  Chiron: "Chiron menyentuh area kerentanan batin untuk diolah menjadi kebijaksanaan penyembuhan yang mendalam.",
};

const SIGN_THEMES: Record<string, string> = {
  Aries: "keberanian memulai dan inisiatif aktif",
  Taurus: "stabilitas nyata dan kenyamanan materi",
  Gemini: "pertukaran ide dan kelincahan berpikir",
  Cancer: "kehangatan emosional dan rasa aman batin",
  Leo: "ekspresi diri yang percaya diri dan kemurahan hati",
  Virgo: "ketelitian analisis dan perbaikan rutinitas harian",
  Libra: "keseimbangan relasi dan keharmonisan bersama",
  Scorpio: "kedalaman emosi dan kekuatan transformasi",
  Sagittarius: "perluasan makna hidup dan petualangan batin",
  Capricorn: "disiplin terstruktur dan tanggung jawab nyata",
  Aquarius: "pembaruan sosial dan kebebasan batin yang orisinal",
  Pisces: "keheningan spiritual dan penyerahan diri yang tulus",
};

// Planet x House Movements (Apa yang Sedang Bergerak Dalam Hidupmu)
const PLANET_HOUSE_MOVEMENTS: Record<string, Record<number, string>> = {
  Sun: {
    1: "kesadaran sadarmu sedang dituntun untuk mengenali bagaimana kamu menampilkan diri dan merawat energi vitalitas fisikmu.",
    2: "perhatian sadarmu diarahkan penuh pada pengelolaan keuangan, kepemilikan, dan memperkuat rasa berharga dalam dirimu.",
    3: "fokus utamamu hari ini berada pada percakapan penting, penyusunan rencana, dan bagaimana kamu bertukar ide dengan lingkungan terdekat.",
    4: "kamu diajak untuk mengarahkan energimu ke dalam rumah, memperhatikan kenyamanan batin, dan memperkuat akar emosionalmu.",
    5: "dorongan kreatif, ekspresi diri yang jujur, serta kegembiraan inner child-mu sedang menjadi pusat perhatian.",
    6: "fokus sadarmu sedang diarahkan pada perbaikan rutinitas harian, kebiasaan hidup sehat, serta pengelolaan tugas-tugas teknis.",
    7: "perhatian utamamu tertuju pada dinamika hubungan satu-lawan-satu, kemitraan, dan bagaimana kamu berinteraksi dengan orang lain.",
    8: "kamu dituntun untuk menyelami kedalaman emosi, menghadapi hal-hal yang tersembunyi, serta mengelola sumber daya bersama.",
    9: "fokusmu sedang meluas ke arah pencarian makna hidup, filsafat, pendidikan, atau petualangan batin yang lebih luas.",
    10: "perhatian sadarmu terpusat pada karier, tanggung jawab publik, serta bagaimana kamu membangun kontribusi nyata bagi dunia.",
    11: "energi sadarmu diarahkan ke lingkaran pertemanan, kolaborasi komunitas, serta harapan-harapan besarmu untuk masa depan.",
    12: "kamu dituntun untuk menarik diri dari keramaian, mengistirahatkan pikiran, dan memproses pelepasan di ruang hening batinmu.",
  },
  Moon: {
    1: "suasana hatimu sangat dipengaruhi oleh kenyamanan fisik dan bagaimana tubuhmu merespons lingkungan secara langsung.",
    2: "kebutuhan emosionalmu hari ini sangat erat kaitannya dengan rasa aman materi, stabilitas, dan keinginan untuk merasa berharga.",
    3: "pikiranmu terasa lebih peka dan emosional, membuatmu ingin mengekspresikan perasaan lewat tulisan atau obrolan santai.",
    4: "kamu merasakan tarikan kuat untuk mencari perlindungan di rumah, beristirahat di ruang privat, dan memulihkan energi emosionalmu.",
    5: "keadaan emosionalmu hari ini dipicu oleh keinginan untuk bermain, berekspresi secara bebas, atau bersenang-senang dengan hal yang kamu sukai.",
    6: "kenyamanan emosionalmu hari ini sangat dipengaruhi oleh keteraturan rutinitas harian dan seberapa baik kamu merawat kesehatan tubuhmu.",
    7: "kepekaan emosionalmu terhubung erat dengan hubungan terdekat, membuatmu lebih peka terhadap dinamika memberi dan menerima rasa aman.",
    8: "kamu merasakan gelombang emosi yang mendalam, memicu kebutuhan untuk jujur pada kerentanan batin dan melepaskan keterikatan lama.",
    9: "kebutuhan emosionalmu hari ini dipenuhi lewat perenungan mendalam, mencari makna spiritual, atau mendengarkan perspektif baru.",
    10: "suasana hatimu terpengaruh oleh tanggung jawab profesional atau bagaimana kontribusimu dinilai oleh orang lain.",
    11: "kamu mencari kenyamanan emosional di tengah persahabatan, kelompok pendukung, atau berbagi harapan masa depan dengan orang yang sefrekuensi.",
    12: "kepekaan emosionalmu hari ini mengarah ke dalam batin, memanggilmu untuk hening, melepas beban pikiran, dan memulihkan diri secara spiritual.",
  },
  Mercury: {
    1: "pikiranmu bergerak cepat untuk menganalisis identitas diri, cara berkomunikasi, dan menyusun gagasan tentang masa depanmu.",
    2: "logika dan pemikiranmu sedang diarahkan penuh untuk mengevaluasi keuangan, efisiensi sumber daya, dan menilai kegunaan barang kepemilikan.",
    3: "proses berpikir dan komunikasi harianmu sedang sangat aktif, mendorongmu untuk menulis, belajar, atau bertukar informasi penting.",
    4: "percakapan dalam rumah atau pemikiran tentang kenyamanan dan pondasi batinmu sedang membutuhkan susunan ide yang lebih rapi.",
    5: "pikiranmu dipenuhi ide-ide kreatif, dorongan untuk menulis dengan jujur, atau mendiskusikan hal-hal yang menyenangkan inner child-mu.",
    6: "kapasitas analisismu sedang tajam untuk mengorganisasi jadwal harian, merencanakan kebiasaan sehat, atau menyelesaikan pekerjaan teknis.",
    7: "fokus pikiranmu terarah pada diskusi satu-lawan-satu, merundingkan kesepakatan, atau bertukar pikiran secara mendalam dengan pasangan.",
    8: "pikiranmu tertarik untuk menyelidiki hal-hal mendalam, menganalisis pola psikologis bawah sadar, atau membicarakan sumber daya bersama.",
    9: "proses belajarmu sedang berkembang pesat, membuatmu ingin membaca buku tebal, mempelajari konsep filsafat, atau merencanakan perjalanan.",
    10: "logika dan komunikasi profesionalmu sedang menjadi kunci utama untuk merapikan rencana karier atau tugas penting pekerjaan.",
    11: "kamu terdorong untuk bertukar ide di komunitas, merencanakan visi masa depan bersama teman, atau menyaring informasi sosial.",
    12: "pikiranmu diajak untuk hening, memproses informasi secara intuitif di bawah sadar, dan menghindari kebisingan mental dunia luar.",
  },
  Venus: {
    1: "kamu diajak untuk memancarkan kelembutan, menghargai tubuhmu, dan memperbarui cara kamu membawa diri ke hadapan orang lain.",
    2: "perhatianmu tertuju pada keharmonisan materi, kenyamanan finansial, dan bagaimana tindakanmu mencerminkan penghargaan atas nilai dirimu.",
    3: "cara komunikasimu menjadi terasa lebih menyenangkan, damai, penuh pengertian, dan membawa keindahan ke obrolan harian.",
    4: "kamu merasakan keinginan kuat untuk memperindah rumah, menciptakan kedamaian dengan keluarga, atau merawat kehangatan ruang privatmu.",
    5: "romansa, kesenangan kreatif, dan ekspresi seni terasa lebih hidup, memberi izin bagi inner child-mu untuk menikmati keindahan hidup.",
    6: "rutinitas harianmu terasa lebih lunak, membantumu membawa kedamaian ke pekerjaan kecil dan memperlakukan tubuhmu dengan penuh kasih.",
    7: "fokus utamamu adalah menciptakan keharmonisan, kesetaraan, dan hubungan yang jujur sekaligus penuh kasih dengan orang terdekat.",
    8: "kamu diajak untuk memperdalam keintiman emosional, membangun kepercayaan batin yang tulus, dan melunakkan batas-batas ketakutan lama.",
    9: "kamu merasakan ketertarikan pada keindahan spiritual, filsafat yang mendamaikan, atau menemukan makna hidup melalui seni dan koneksi budaya.",
    10: "keharmonisan mengalir ke dalam kariermu, memperhalus hubungan dengan rekan kerja, serta memperindah reputasi publikmu.",
    11: "ikatan persahabatan terasa lebih erat, membuat kolaborasi komunitas menyenangkan, dan memperluas jaringan sosialmu dengan damai.",
    12: "kamu dituntun untuk menemukan keindahan dalam kesendirian, memaafkan luka masa lalu, dan menyerahkan diri pada kedamaian spiritual.",
  },
  Mars: {
    1: "energi fisik dan dorongan aksimu sedang meluap, menantangmu untuk bergerak aktif dan menyatakan kehadiranmu dengan berani.",
    2: "keberanian dan tenagamu sedang dikerahkan untuk memperjuangkan keamanan finansial, kemandirian materi, atau mempertahankan harga dirimu.",
    3: "cara bicaramu terasa lebih tegas dan berenergi, mendorongmu untuk menyuarakan pikiranmu secara langsung namun hindari gesekan mental.",
    4: "ada dinamika aktif yang membutuhkan penyelesaian di rumah atau dorongan kuat untuk merombak kenyamanan batinmu dengan tegas.",
    5: "semangat kreativitasmu terasa terbakar, mendorong keberanian untuk berekspresi, berolahraga, atau mengejar hal yang paling kamu sukai.",
    6: "tenagamu sedang terarah penuh untuk menyelesaikan tugas-tugas tertunda, merapikan kebiasaan harian, dan melatih kekuatan fisik tubuhmu.",
    7: "inisiatif baru sekaligus potensi gesekan muncul dalam hubungan, menantangmu untuk menegakkan batasan jujur dengan orang lain.",
    8: "kamu didorong untuk mengambil tindakan tegas dalam membongkar kontrol lama, menyelesaikan urusan utang/sumber daya, atau menghadapi kerentanan.",
    9: "keberanianmu terpanggil untuk membela prinsip keyakinan, mengeksplorasi wilayah baru, atau mengejar target pembelajaran yang menantang.",
    10: "ambisi kariermu terasa terdorong, memicu momentum kuat untuk menyelesaikan proyek profesional dan mengambil kendali atas arah hidupmu.",
    11: "energi aksimu terarah pada perjuangan kelompok, memimpin inisiatif sosial, atau bekerja keras mencapai visi masa depan.",
    12: "energimu diarahkan untuk menyelesaikan urusan masa lalu yang belum tuntas di bawah sadar, memanggilmu untuk beristirahat secara aktif.",
  },
  Jupiter: {
    1: "ada peluang besar untuk memperluas cara kamu mengenali jati diri dan memancarkan rasa percaya diri ke luar.",
    2: "pintu pertumbuhan terbuka untuk meningkatkan kapasitas keuangan, memahami arti kemakmuran, dan memperluas rasa harga diri.",
    3: "proses belajar dan caramu menyampaikan ide sedang mendapat dorongan ekspansif, membuka ruang bagi percakapan yang penuh makna.",
    4: "ruang rumah dan akar emosionalmu sedang dilimpahi rasa hangat, membuka peluang pertumbuhan melalui kedamaian batin.",
    5: "kreativitas, asmara, dan kegembiraan batinmu sedang berkembang, memberikan ruang lebih luas bagi inner child-mu untuk berekspresi.",
    6: "rutinitas harian dan pekerjaan teknismu terasa lebih ringan, membuka ruang bagi kebiasaan baru yang mendukung kebugaran tubuh.",
    7: "pertumbuhan positif mengalir dalam relasi, membantumu memperdalam pemahaman bersama dan memperluas kolaborasi dengan orang lain.",
    8: "pintu kesembuhan emosional terbuka lebar, membantumu melepaskan ketakutan terdalam dan memperluas kepercayaan batiniah.",
    9: "Jupiter berada di rumah alaminya, memicu dorongan kuat untuk mencari kebijaksanaan spiritual, filsafat hidup, atau memperluas wawasan akademis.",
    10: "arah karier dan pencapaian publikmu sedang mendapat momentum perluasan, membuka peluang promosi atau tanggung jawab baru.",
    11: "lingkaran pertemanan dan kelompok pendukungmu sedang berkembang, menghubungkanmu dengan jaringan sosial yang menginspirasi.",
    12: "kedamaian spiritual dan penyembuhan batinmu sedang diperluas, menuntunmu pada pelepasan tulus di bawah kesadaran.",
  },
  Saturn: {
    1: "kamu diajak untuk membangun kedewasaan diri, menertibkan kebiasaan tubuh, dan mengambil tanggung jawab penuh atas caramu hadir di dunia.",
    2: "kedisiplinan finansial, penataan aset jangka panjang, serta pengokohan fondasi harga diri sedang diuji untuk diperbaiki secara matang.",
    3: "cara berkomunikasimu ditantang untuk lebih rapi, menyaring informasi secara disiplin, dan menjaga integritas setiap kata-katamu.",
    4: "tanggung jawab di rumah tangga, batasan dengan keluarga, serta struktur rasa aman batiniah menuntut penataan ulang yang stabil.",
    5: "ekspresi kreatif dan komitmen pada proyek seni sedang dievaluasi, memintamu menyikapi impian inner child secara realistis.",
    6: "kebiasaan harian, disiplin merawat tubuh, serta ritme kerjamu sedang dituntut untuk ditata secara praktis agar terhindar dari kelelahan.",
    7: "pelajaran penting tentang kedewasaan komitmen, pembagian tanggung jawab, dan batasan sehat dalam hubungan kemitraan sedang berjalan.",
    8: "pengelolaan keuangan bersama, pelepasan kontrol emosional, serta penanganan ketakutan bawah sadar menuntut tanggung jawab penuh.",
    9: "kamu diajak untuk menstrukturkan filosofi hidupmu, memperdalam keahlian akademis/spiritual, dan mencari nilai kebenaran yang teruji waktu.",
    10: "tanggung jawab profesional, kedewasaan karier, dan bentuk nyata kontribusi publikmu sedang dievaluasi untuk dibangun secara kokoh.",
    11: "penyaringan dalam lingkaran pertemanan sedang berjalan, memintamu memperjelas peran nyata dan komitmenmu di dalam kelompok.",
    12: "kamu didorong untuk menertibkan jadwal istirahat, menghadapi pola sabotase diri lama, dan merampungkan siklus batin yang tertunda.",
  },
  Uranus: {
    1: "topeng lama sedang terkelupas, mendorongmu melepaskan ekspektasi orang lain dan mengekspresikan kemandirianmu secara autentik.",
    2: "sumber keuangan atau caramu menghargai aset sedang dirombak, membebaskanmu dari keterikatan materi yang kaku.",
    3: "pola berpikirmu mendapat kilatan ide orisinal yang segar, memicu cara berkomunikasi yang tidak biasa dan mendobrak kebiasaan lama.",
    4: "cara kamu mencari rasa aman batin sedang bergeser radikal, mendorong pembebasan dari pola keluarga lama yang membatasi dirimu.",
    5: "inisiatif kreatif out-of-the-box sedang menyala, membebaskan ekspresi seni dan membawa kejutan menyegarkan dalam asmaramu.",
    6: "inovasi praktis masuk ke dalam rutinitas kerjamu, mengajakmu mencoba metode kesehatan baru dan mengubah jadwal harian agar lebih bebas.",
    7: "dinamika relasi terdekatmu meminta ruang kebebasan dan kesepakatan baru yang lebih jujur tanpa saling membatasi ruang gerak.",
    8: "terobosan psikologis sedang berjalan, membebaskanmu dari ketakutan tersembunyi, trauma masa lalu, atau keterikatan emosional usang.",
    9: "pandangan hidupmu sedang mengalami pergeseran radikal, membuka ketertarikan pada ilmu baru yang mendobrak keyakinan lama.",
    10: "pembaruan mendadak terjadi pada arah kariermu, mendorongmu mencari kebebasan profesional atau merombak caramu memandang otoritas.",
    11: "kolaborasi sosial dan lingkaran pertemanan baru yang unik sedang terbentuk, menginspirasimu untuk melakukan pembaruan bersama.",
    12: "pola sabotase diri yang tersembunyi sedang dibebaskan secara terobosan, melepas trauma bawah sadar demi kebebasan spiritual.",
  },
  Neptune: {
    1: "kamu diajak untuk memperhalus kehadiranmu, mendengarkan intuisi tubuh, dan memaafkan ketidaksempurnaan citra dirimu.",
    2: "navigasi keuanganmu membutuhkan kepekaan intuisi yang membumi; hindari spekulasi finansial yang tidak memiliki pijakan fakta jernih.",
    3: "cara komunikasimu menjadi lebih peka dan imajinatif, namun pastikan pesanmu tetap jelas agar tidak memicu kesalahpahaman.",
    4: "kelembutan spiritual mengalir ke dalam rumah, merawat kedamaian batin, dan memaafkan luka masa kecil di akar keluargamu.",
    5: "imajinasi kreatif dan romansa batiniah terasa mendalam, membuka ruang ekspresi melalui keheningan batin dan seni yang peka.",
    6: "sensitivitas fisik tubuhmu sedang meningkat; kamu membutuhkan istirahat yang cukup dan rutinitas yang ramah terhadap kesehatan mentalmu.",
    7: "relasi terdekatmu meminta penerimaan tulus dan welas asih, namun waspadai kecenderungan penyelamatan atau ekspektasi yang semu.",
    8: "kamu diajak melarutkan ketakutan lama, memproses duka di bawah sadar, dan memperdalam keintiman emosional secara spiritual.",
    9: "pencarian spiritualmu sedang diperluas, menuntunmu pada pemahaman mistis, filsafat universal, atau perjalanan batin yang hening.",
    10: "tujuan kariermu sedang diselaraskan dengan panggilan jiwa yang lebih tinggi; pastikan rencana kerjamu tetap membumi di dunia nyata.",
    11: "koneksi idealis terbangun dengan komunitas sefrekuensi; pastikan menyaring batas energimu agar tidak menyerap kelelahan kelompok.",
    12: "ego dirimu diajak untuk melebur dalam keheningan total, memproses pelepasan tulus, dan mengalami pemulihan spiritual yang mendalam.",
  },
  Pluto: {
    1: "proses transformasi mendalam sedang mendefinisikan ulang siapa dirimu, memintamu melepas topeng pertahanan lama untuk lahir kembali.",
    2: "kamu diajak membongkar pola keterikatan finansial yang tidak sehat, melepaskan kontrol materi, dan menemukan sumber harga diri sejatimu.",
    3: "cara berkomunikasi dan pola berpikir harianmu sedang mengalami pembongkaran agar kamu bisa menyuarakan kebenaran batin secara jujur.",
    4: "pola asuh masa kecil, trauma akar keluarga, atau rasa tidak aman batiniah sedang dibongkar agar dapat disembuhkan secara tuntas.",
    5: "hambatan batin dalam berekspresi sedang dihadapi, memintamu melepaskan kontrol dalam asmara, dan menghidupkan kembali daya cipta sejatimu.",
    6: "kebiasaan harian yang merusak atau pola kerja yang memicu stres sedang dituntut untuk dibongkar demi pemulihan kesehatan tubuhmu.",
    7: "hubungan terdekatmu menjadi cermin yang membongkar permainan kekuasaan, ketergantungan emosional, atau pola kontrol lama.",
    8: "transformasi psikologis paling dalam sedang aktif, menuntut pelepasan total atas ketakutan tersembunyi dan kontrol yang tidak perlu.",
    9: "keyakinan hidup lama sedang runtuh untuk digantikan oleh pemahaman kebenaran batin yang lebih kokoh, jujur, dan mendalam.",
    10: "perubahan radikal terjadi pada arah kontribusi profesionalmu, memintamu melepaskan status semu demi integritas kariermu.",
    11: "lingkaran pertemanan dan visi masa depanmu sedang mengalami penyaringan ketat, membebaskanmu dari jaringan sosial yang tidak lagi selaras.",
    12: "pola sabotase diri bawah sadar yang paling dalam sedang dibongkar, menuntunmu pada pelepasan karma lama dan regenerasi spiritual.",
  },
  Chiron: {
    1: "Chiron menyoroti rasa rapuh terkait caramu hadir atau penampilan fisikmu, mengajakmu berdamai dengan ketidaksempurnaan sebagai kebijaksanaan.",
    2: "kerentanan terkait rasa berharga atau kemandirian finansial sedang disentuh; belajarlah menerima keterbatasan tanpa menghakimi dirimu.",
    3: "ada rasa ragu dalam menyuarakan pikiran atau takut salah bicara; gunakan momen ini untuk melatih kejujuran kata-kata yang memulihkan.",
    4: "luka masa kecil, rasa tidak memiliki tempat pulang, atau kerentanan keluarga sedang muncul agar dipeluk dengan penuh welas asih.",
    5: "kamu diingatkan pada rasa takut ditolak saat berekspresi kreatif atau bermain; belajarlah menyembuhkan inner child-mu lewat apresiasi kecil.",
    6: "kerentanan terkait kesehatan fisik atau rasa bersalah saat tidak produktif sedang disentuh; bawalah kelembutan ke dalam ritme kerjamu.",
    7: "pola hubungan lama memunculkan rasa takut ditinggalkan atau ditolak; Chiron mengajakmu membangun relasi yang saling menyembuhkan.",
    8: "luka emosional terkait kepercayaan batin, keintiman, atau penyerahan diri sedang disentuh agar kamu bisa melepas kontrol dengan aman.",
    9: "kamu mungkin merasa ragu pada keyakinan hidupmu atau arah makna batinmu; Chiron menuntunmu menemukan kebijaksanaan dari pencarianmu.",
    10: "rasa tidak mampu di bidang karier atau takut gagal memenuhi ekspektasi publik sedang muncul; definisikan ulang kesuksesan versimu sendiri.",
    11: "kerentanan terkait rasa tidak diterima di kelompok sosial sedang disentuh; Chiron memintamu menjadi bagian dari komunitas dengan tulus.",
    12: "rasa sunyi yang mendalam atau kesedihan bawah sadar yang tanpa sebab sedang muncul agar disembuhkan lewat penerimaan spiritual.",
  },
};

// Planet x House Actions (Yang Bisa Dilakukan)
const PLANET_HOUSE_ACTIONS: Record<string, Record<number, string>> = {
  Sun: {
    1: "Pilih satu kebiasaan kecil hari ini yang langsung meningkatkan vitalitas tubuhmu secara nyata.",
    2: "Tinjau satu pengeluaran atau buat rencana anggaran harian yang sederhana untuk menertibkan keuanganmu.",
    3: "Tuliskan satu gagasan penting atau lakukan diskusi singkat untuk menyamakan persepsi dengan orang terdekat.",
    4: "Luangkan waktu 15 menit malam ini untuk merapikan salah satu sudut rumah agar suasana terasa lebih tenang.",
    5: "Lakukan satu aktivitas kreatif atau luangkan waktu bermain yang murni untuk menyegarkan pikiranmu.",
    6: "Jadwalkan rutinitas tidur atau makan yang teratur hari ini untuk menghormati ritme fisik tubuhmu.",
    7: "Sampaikan satu apresiasi yang tulus atau buat kesepakatan kecil yang jelas dengan pasangan atau rekan kerjamu.",
    8: "Tuliskan satu rasa tidak aman atau ketakutan yang muncul hari ini, lalu peluk perasaan tersebut tanpa menghakimi.",
    9: "Bacalah artikel bermanfaat, bab dari buku penting, atau dengarkan kajian yang memperluas wawasanmu.",
    10: "Tentukan satu prioritas tugas profesional yang paling penting hari ini, lalu selesaikan dengan fokus penuh.",
    11: "Kirim pesan hangat atau lakukan sapaan ringan kepada salah satu teman di lingkaran komunitasmu.",
    12: "Matikan semua notifikasi gawai 30 menit sebelum tidur dan biarkan dirimu beristirahat di ruang sunyi.",
  },
  Moon: {
    1: "Tanyakan pada dirimu, 'Bagaimana kondisi tubuhku saat ini?' lalu berikan satu hal kecil yang membuatnya nyaman.",
    2: "Hindari pembelian impulsif hari ini; pilihlah tindakan yang memperkuat rasa aman materimu secara membumi.",
    3: "Gunakan waktu journaling singkat untuk menuangkan perasaan berkecamukmu agar pikiran terasa lebih jernih.",
    4: "Ciptakan suasana nyaman di rumah malam ini—redupkan lampu, nikmati minuman hangat, dan istirahatlah.",
    5: "Izinkan dirimu melakukan hal menyenangkan tanpa rasa bersalah, dengarkan musik kesukaanmu sejenak.",
    6: "Periksa tingkat kelelahan tubuhmu; kurangi beban pekerjaan jika merasa energi fisikmu mulai terkuras.",
    7: "Bagikan perasaanmu secara tenang dan jujur kepada orang terdekat, pastikan kamu merasa didengarkan.",
    8: "Izinkan dirimu menangis atau melepas sesak emosi yang tersimpan tanpa harus menganalisis penyebabnya.",
    9: "Tuliskan satu perenungan tentang makna di balik peristiwa emosional yang kamu alami belakangan ini.",
    10: "Ambil jeda napas 5 menit di sela kerja; jangan biarkan kecemasan profesional mendikte keputusanmu.",
    11: "Hubungi seseorang yang kamu percayai untuk sekadar berbagi cerita tentang suasana hatimu hari ini.",
    12: "Luangkan waktu 10 menit untuk hening total, pejamkan mata, dan biarkan semua emosi melarut dengan tenang.",
  },
  Mercury: {
    1: "Tuliskan 3 kata yang menggambarkan komitmen pribadimu hari ini, lalu gunakan sebagai panduan melangkah.",
    2: "Catat setiap transaksi keuangan harianmu secara rinci untuk merapikan pemantauan sumber daya.",
    3: "Kirim satu pesan tertulis atau buat email klarifikasi untuk memperjelas diskusi yang tertunda.",
    4: "Diskusikan secara terbuka batas kenyamanan atau pembagian tugas rumah tangga dengan keluarga.",
    5: "Tuliskan satu ide kreatif, puisi singkat, atau draf jurnal tanpa perlu memikirkan hasilnya bagus atau tidak.",
    6: "Susun draf tugas harianmu berdasarkan skala prioritas yang logis sebelum kamu mulai bekerja.",
    7: "Buat janji temu atau lakukan diskusi tatap muka untuk menyelaraskan rencana dengan rekan kerja/pasangan.",
    8: "Evaluasi kembali rincian kesepakatan atau pembagian pengeluaran bersama secara tenang dan logis.",
    9: "Gunakan waktu 20 menit untuk mempelajari satu konsep baru yang menantang rasa ingin tahumu.",
    10: "Buat draf rencana kerja mingguan atau rapikan folder file profesionalmu agar lebih teratur.",
    11: "Ikuti diskusi kelompok atau bagikan satu gagasan tertulismu di grup komunitas yang selaras.",
    12: "Catat setiap mimpi atau lintasan pikiran bawah sadarmu sesaat setelah bangun tidur di buku catatan khusus.",
  },
  Venus: {
    1: "Gunakan pakaian yang membuatmu merasa nyaman dan lakukan satu hal kecil yang menghargai fisikmu.",
    2: "Beli satu barang kecil yang benar-benar berharga dan memberi manfaat nyata jangka panjang bagi dirimu.",
    3: "Kirim pesan teks yang penuh kehangatan atau pujian kecil kepada saudara atau tetangga terdekat.",
    4: "Hias mejamu dengan bunga segar atau rapikan tempat tidur agar ruang privatmu terasa lebih indah.",
    5: "Nikmati satu momen romantis, makan makanan lezat, atau luangkan waktu untuk menikmati keindahan seni.",
    6: "Bawa kebiasaan ramah ke tempat kerja; ucapkan terima kasih yang tulus pada orang yang membantumu.",
    7: "Pilih satu percakapan penting dengan pasangan, lalu tanggapi dengan kelembutan tanpa memaksakan kehendak.",
    8: "Luangkan waktu intim dengan orang terdekat; bagikan rasa percaya tanpa rasa takut ditolak.",
    9: "Dengarkan musik yang menenangkan jiwa atau renungkan nilai keindahan spiritual di sekitarmu.",
    10: "Berikan senyum ramah pada rekan kerja atau hias ruang kerjamu agar suasananya terasa menyenangkan.",
    11: "Luangkan waktu berkumpul dengan sahabat terdekat, nikmati obrolan ringan yang menghangatkan hati.",
    12: "Lakukan satu tindakan pemaafan batin: lepaskan dendam masa lalu secara perlahan demi kedamaian dirimu.",
  },
  Mars: {
    1: "Lakukan olahraga ringan selama 15 menit hari ini untuk menyalurkan energi aktif dalam tubuhmu.",
    2: "Ambil satu tindakan nyata untuk menolak satu pengeluaran konsumtif demi menjaga kemandirian materimu.",
    3: "Suarakan pendapatmu dengan tegas dan sopan dalam diskusi penting hari ini; jangan memendam gagasanmu.",
    4: "Bereskan barang-barang berat yang berserakan di rumah atau lakukan perbaikan fisik pada ruanganmu.",
    5: "Salurkan energi Mars untuk menyelesaikan karya seni yang tertunda atau lakukan aktivitas fisik yang seru.",
    6: "Selesaikan tugas administratif paling sulit atau bersihkan area kerjamu agar energi bergerak lancar.",
    7: "Tegakkan batasan yang jelas dan jujur dalam interaksi hari ini; katakan 'tidak' jika memang diperlukan.",
    8: "Ambil keputusan tegas untuk menyelesaikan urusan utang atau tagihan tertunda tanpa menundanya lagi.",
    9: "Tantang dirimu untuk mempelajari keahlian baru yang membutuhkan disiplin tinggi dan keberanian mental.",
    10: "Selesaikan satu tenggat waktu penting pekerjaan hari ini dengan mengerahkan energi penuh secara fokus.",
    11: "Pimpin satu inisiatif kecil dalam kelompok atau ambil langkah aktif untuk membantu rencana komunitas.",
    12: "Salurkan ketegangan batinmu dengan melakukan relaksasi fisik atau menuliskan kekesalanmu di kertas lalu buang.",
  },
  Jupiter: {
    1: "Coba satu hal baru hari ini yang memperluas zona nyamanmu dan meningkatkan rasa percaya diri.",
    2: "Luangkan waktu untuk memikirkan ide-ide baru dalam meningkatkan kapasitas pendapatan atau nilai tokomu.",
    3: "Dengarkan satu siniar (podcast) inspiratif atau baca bab buku baru yang membahas wawasan kehidupan.",
    4: "Berikan apresiasi hangat atau sediakan waktu berkumpul yang ceria bersama keluarga di rumah.",
    5: "Mulailah proyek kreatif baru yang selama ini ragu kamu jalankan; biarkan imajinasimu mengalir bebas.",
    6: "Terapkan satu kebiasaan sehat baru yang segar (seperti minum air putih lebih banyak) ke dalam rutinitasmu.",
    7: "Buka obrolan mendalam dengan pasangan tentang impian masa depan kalian berdua secara optimis.",
    8: "Tuliskan 3 pelajaran hidup terbesar yang kamu petik dari krisis emosional masa lalu untuk disyukuri.",
    9: "Rencanakan atau pelajari materi perjalanan jauh, atau ikuti kursus singkat yang memperluas keilmuanmu.",
    10: "Ajukan ide inovatif dalam rapat kerja atau ambil tanggung jawab baru yang menantang kepemimpinanmu.",
    11: "Bergabunglah dengan kelompok komunitas baru yang memiliki visi pertumbuhan batin yang sejalan.",
    12: "Lakukan meditasi syukur mendalam atas seluruh berkah tersembunyi yang kamu miliki dalam hidup.",
  },
  Saturn: {
    1: "Buat satu jadwal harian yang realistis, lalu berkomitmenlah untuk mematuhinya dengan penuh tanggung jawab.",
    2: "Tinjau kembali laporan keuangan bulananmu, rapikan catatan utang piutang, dan hemat pengeluaran.",
    3: "Batasi konsumsi informasi atau gawai hari ini; pilihlah membaca bacaan yang berbobot secara terarah.",
    4: "Selesaikan perbaikan rumah yang tertunda atau tegakkan kesepakatan batas privasi yang sehat di rumah.",
    5: "Tentukan waktu khusus untuk melatih keahlian senimu secara terstruktur; disiplin melahirkan karya.",
    6: "Rancang rutinitas olahraga atau perbaikan nutrisi yang konsisten untuk menjaga daya tahan fisikmu.",
    7: "Buat kesepakatan tertulis atau sampaikan batas pembagian tugas yang adil dengan pasangan/rekan kerja.",
    8: "Hadapi rasa cemburu atau keinginan mengontrol keuangan pasangan; gantilah dengan dialog terstruktur.",
    9: "Rancang rencana belajar jangka panjang atau pelajari kembali prinsip dasar spiritual yang membumi.",
    10: "Bereskan satu tanggung jawab profesional yang paling mendesak; tunjukkan integritas kerjamu.",
    11: "Evaluasi lingkaran pertemananmu secara jujur; luangkan energi hanya untuk hubungan yang saling membangun.",
    12: "Disiplinkan jam tidurmu malam ini; pastikan tidur tepat waktu untuk memulihkan energi batin.",
  },
  Uranus: {
    1: "Cobalah penampilan baru atau lakukan sesuatu yang berbeda dari rutinitas biasamu hari ini.",
    2: "Cari alternatif sumber penghasilan baru yang memanfaatkan teknologi atau metode yang tidak konvensional.",
    3: "Gunakan cara mencatat baru atau bagikan satu ide orisinal yang mendobrak kebiasaan kelompok.",
    4: "Tata ulang letak perabot di kamar tidurmu untuk menyegarkan aliran energi di ruang pribadi.",
    5: "Ekspresikan karyamu dengan media baru yang belum pernah kamu coba sebelumnya; bebaskan imajinasimu.",
    6: "Ubah urutan rutinitas pagimu hari ini untuk memberikan perspektif baru yang menyegarkan pikiran.",
    7: "Diskusikan kesepakatan baru yang memberi ruang gerak lebih bebas dan setara bagi kalian berdua.",
    8: "Lepaskan satu barang kenangan dari masa lalu yang selama ini menahan energimu untuk bergerak maju.",
    9: "Pelajari satu topik sains alternatif, astrologi, atau teknologi masa depan yang menantang logikamu.",
    10: "Gunakan pendekatan baru yang orisinal untuk menyelesaikan salah satu masalah rumit di pekerjaan.",
    11: "Hubungi teman lama yang tidak terduga atau hadiri pertemuan dengan orang-orang berlatar belakang berbeda.",
    12: "Tuliskan semua pola sabotase diri yang kamu sadari, lalu bakar kertas tersebut sebagai simbol pembebasan.",
  },
  Neptune: {
    1: "Lakukan latihan napas perlahan selama 5 menit pagi ini untuk memperhalus kehadiran energimu.",
    2: "Tunda keputusan keuangan besar hari ini jika situasinya masih terasa samar atau kurang memiliki data nyata.",
    3: "Gunakan kata-kata yang lembut dan penuh empati dalam setiap obrolan harianmu hari ini.",
    4: "Nyalakan wewangian aromaterapi di rumah dan luangkan waktu untuk relaksasi emosional yang menenangkan.",
    5: "Biarkan dirimu melukis, menulis, atau menikmati seni secara bebas tanpa terikat pada hasil akhir.",
    6: "Lakukan detoksifikasi tubuh harian dengan minum jus buah segar atau air putih hangat secara teratur.",
    7: "Hindari memaksakan ekspektasi ideal pada pasangan; terimalah ia apa adanya dengan penuh welas asih.",
    8: "Gunakan meditasi hening untuk memeluk kerentanan emosionalmu, biarkan rasa tersebut mengalir lalu larut.",
    9: "Luangkan waktu membaca teks spiritual, puisi mendalam, atau merenungkan makna hidup di keheningan.",
    10: "Visualisasikan tujuan kariermu yang ideal, lalu catat satu langkah paling sederhana yang bisa diwujudkan.",
    11: "Sumbangkan sebagian energimu untuk aksi sosial secara ikhlas tanpa mengharapkan pujian orang lain.",
    12: "Nikmati mandi air hangat atau dengarkan musik terapi sebelum tidur untuk membersihkan sisa energi harian.",
  },
  Pluto: {
    1: "Identifikasi satu topeng pertahanan diri yang sering kamu pakai, lalu bertekadlah untuk melepaskannya.",
    2: "Lepaskan satu barang berharga yang sudah tidak terpakai sebagai latihan melepaskan kemelekatan materi.",
    3: "Jujurlah dalam menyuarakan hal penting yang selama ini kamu pendam karena takut ditolak.",
    4: "Tulis surat pelepasan untuk memaafkan luka masa lalu dari akar keluarga, lalu bakar surat tersebut.",
    5: "Bongkar ketakutanmu akan kegagalan kreatif; lakukan satu aksi ekspresi tanpa takut dinilai.",
    6: "Identifikasi satu kebiasaan buruk yang merusak fisikmu, lalu mulailah proses eliminasi kebiasaan tersebut.",
    7: "Lepaskan satu dinamika kontrol atau manipulasi emosi yang tidak sehat dalam hubungan terdekatmu.",
    8: "Luangkan waktu menyendiri untuk memproses emosi bayangan (seperti iri hati atau kemarahan) secara jujur.",
    9: "Tantang satu dogma atau keyakinan usang yang selama ini membatasi cara pandangmu terhadap dunia.",
    10: "Lepaskan ambisi karier yang lahir hanya dari keinginan membuktikan diri kepada orang tua atau dunia luar.",
    11: "Sering kembali pertemananmu; beranikan diri menetapkan jarak dari lingkungan sosial yang beracun.",
    12: "Lakukan ritual pelepasan batin: ikhlaskan penyesalan masa lalu dan serahkan semuanya pada semesta.",
  },
  Chiron: {
    1: "Berdirilah di depan cermin, tatap matamu, dan katakan kalimat penerimaan penuh welas asih pada dirimu.",
    2: "Katakan pada dirimu bahwa harga dirimu tidak ditentukan oleh angka di rekening atau status kepemilikan.",
    3: "Beranikan diri berbicara jujur meskipun suaramu gemetar; kerentananmu adalah kekuatan penyembuh.",
    4: "Peluk inner child-mu yang merasa tidak aman; berikan pelukan fisik pada dirimu sendiri dengan penuh kasih.",
    5: "Lakukan satu ekspresi seni yang sederhana khusus untuk menghibur luka inner child-mu yang pernah ditolak.",
    6: "Beri dirimu izin untuk beristirahat penuh tanpa merasa bersalah karena tidak produktif hari ini.",
    7: "Maafkan satu kesalahan relasi masa lalu sebagai langkah awal menyembuhkan pola hubunganmu saat ini.",
    8: "Izinkan dirimu berbagi rasa rapuh secara jujur dengan orang terpercaya; kerentanan memperdalam keintiman.",
    9: "Renungkan bagaimana luka atau kegagalan masa lalu telah membentukmu menjadi pribadi yang lebih bijaksana.",
    10: "Katakan pada dirimu bahwa kegagalan profesional bukanlah akhir; apresiasi usaha keras yang telah kamu lakukan.",
    11: "Tawarkan bantuan sederhana kepada seseorang di komunitasmu yang sedang mengalami kesulitan serupa.",
    12: "Lakukan journaling reflektif: tuliskan rasa sakit yang kamu rasakan, lalu berikan kalimat penenang di bawahnya.",
  },
};

function getCollectiveTheme(planet: string, sign: string): string {
  const base = PLANET_COLLECTIVES[planet] || "Energi langit hari ini membawa pengaruh baru bagi ritme kolektif.";
  const signTheme = SIGN_THEMES[sign] || "tema yang sedang berjalan";
  return `${base} Di ${sign}, energinya bergerak melalui ${signTheme}.`;
}

function getMovementTheme(planet: string, house: number | undefined): string {
  if (!house) {
    return `Hari ini dorongan dari energi ${LABELS[planet] || planet} sedang mengalirkan pengaruhnya secara menyeluruh ke dalam caramu membaca keadaan sekitar dan menentukan respons harian.`;
  }

  const movements = PLANET_HOUSE_MOVEMENTS[planet];
  const desc = movements ? movements[house] : undefined;

  if (desc) {
    return `Hari ini ${desc}`;
  }

  const houseAreas: Record<number, string> = {
    1: "area identitas diri dan caramu hadir secara fisik",
    2: "area nilai diri, keuangan, dan aset keamanan materimu",
    3: "area komunikasi harian, pertukaran informasi, dan interaksi lingkungan",
    4: "area kenyamanan batin, hubungan keluarga, dan pondasi rumah tanggamu",
    5: "area kreativitas, asmara, kegembiraan ekspresi, dan inner child-mu",
    6: "area rutinitas harian, ritme kerja, serta kebiasaan kesehatan tubuhmu",
    7: "area relasi satu-lawan-satu, kemitraan, dan cermin dirimu lewat orang lain",
    8: "area transformasi psikologis, kerentanan, dan pengelolaan daya bersama",
    9: "area pencarian makna hidup, filsafat batin, dan perluasan wawasan",
    10: "area karier profesional, reputasi publik, dan bentuk nyata kontribusimu",
    11: "area lingkaran pertemanan, kolaborasi sosial, dan visi masa depanmu",
    12: "area istirahat, refleksi alam bawah sadar, dan penyelesaian batin di ruang hening",
  };
  const area = houseAreas[house] || "aspek hidupmu yang membutuhkan perhatian";
  return `Hari ini pengaruh energi ${LABELS[planet] || planet} sedang mengaktifkan ${area} kamu secara mendalam.`;
}

function getActionTheme(planet: string, house: number | undefined): string {
  if (!house) {
    const generalActions: Record<string, string> = {
      Sun: "Luangkan waktu sejenak untuk menjejakkan kakimu di bumi, lalu pilihlah satu hal yang ingin kamu beri energi penuh hari ini.",
      Moon: "Namai satu kebutuhan perasaanmu saat ini secara jujur sebelum kamu merencanakan agenda berikutnya.",
      Mercury: "Tuliskan satu gagasan penting atau rapikan daftar tugas harianmu agar pikiran terasa lebih jernih.",
      Venus: "Lakukan satu tindakan kecil yang menghargai dirimu sendiri sekaligus menjaga kehangatan hubungan.",
      Mars: "Arahkan energimu pada satu langkah nyata yang bisa diselesaikan hari ini, hindari memecah fokus pada banyak hal sekaligus.",
      Jupiter: "Ambil satu kesempatan untuk membaca, belajar, atau mendengarkan sudut pandang yang memperluas wawasanmu.",
      Saturn: "Rapikan satu komitmen, jadwal, atau tanggung jawab kecil yang selama ini terasa berserakan.",
      Uranus: "Cobalah satu cara atau pendekatan baru yang memberikan lebih banyak ruang bagi kebebasan batinmu.",
      Neptune: "Saring kembali asumsi pikiranmu dan bedakan mana intuisi yang hening dari ketakutan yang bising.",
      Pluto: "Tuliskan satu kebiasaan atau kontrol lama yang mulai terasa sempit dan ingin kamu lepaskan secara bertahap.",
      Chiron: "Berikan ucapan atau respons yang ramah pada bagian diri yang biasanya paling keras kamu kritik.",
    };
    return generalActions[planet] || "Ambil satu tindakan kecil yang membumi untuk membantu menyelaraskan energimu hari ini.";
  }

  const actions = PLANET_HOUSE_ACTIONS[planet];
  const act = actions ? actions[house] : undefined;
  return act || "Ambil satu langkah praktis yang paling sesuai dengan kapasitas energimu saat ini.";
}

function getSingleBlueprintAccent(planet: string, context: RecordValue): string {
  const blueprint = (context.blueprint || context) as any;
  const profile = (context.profile || {}) as any;

  const hd = (blueprint.humanDesign || profile.humanDesign || {}) as any;
  const lifePath = String(blueprint.lifePath?.number || blueprint.numerology?.lifePath || profile.lifePath || "");
  const dm = (blueprint.destinyMatrix || {}) as any;
  const arcanaCenter = String(dm.center || dm.arcanaCenter || profile.arcanaCenter || "");

  const hdTypeCanonical = getCanonicalHumanDesignType(hd) || "";
  let notSelfText = "";
  if (hdTypeCanonical === "Generator" || hdTypeCanonical === "Manifesting Generator") {
    notSelfText = "kecenderungan batinmu yang mudah merasa frustrasi ketika memaksakan diri melakukan hal yang tidak disetujui oleh respons jujur tubuhmu";
  } else if (hdTypeCanonical === "Projector") {
    notSelfText = "luka halus berupa rasa pahit atau tidak dihargai yang muncul saat kamu memaksakan diri membagikan energi tanpa adanya pengakuan yang tepat";
  } else if (hdTypeCanonical === "Manifestor") {
    notSelfText = "dorongan rasa amarah atau resistensi yang timbul ketika kamu merasa ruang gerakmu dihambat atau dipaksa berkompromi terlalu cepat";
  } else if (hdTypeCanonical === "Reflector") {
    notSelfText = "rasa kecewa yang muncul ketika lingkungan sekitar tidak memantulkan kejernihan dan keselarasan yang kamu harapkan";
  } else {
    notSelfText = "kecenderungan bawah sadar untuk memaksakan kendali secara berlebihan saat merasa tidak aman";
  }

  if (planet === "Sun" || planet === "Moon") {
    if (hdTypeCanonical === "Generator") {
      return "Ini beresonansi dengan pola energimu yang berjalan paling selaras saat bergerak berdasarkan respons jujur tubuhmu, bukan dari desakan pikiran.";
    } else if (hdTypeCanonical === "Manifesting Generator") {
      return "Ini sangat selaras dengan ritme alamimu yang cepat namun tetap membutuhkan respons jujur dari tubuh sebelum meluncur ke berbagai arah.";
    } else if (hdTypeCanonical === "Projector") {
      return "Ini mengingatkan kembali pada kebutuhan alamimu untuk menjaga energi dan mengutamakan jeda sebelum membagikan perhatianmu kepada orang lain.";
    } else if (hdTypeCanonical === "Manifestor") {
      return "Ini memanggil dorongan perintis di dalam dirimu untuk memulai inisiatif baru secara mandiri sambil tetap menjaga ruang gerak yang bebas.";
    } else if (hdTypeCanonical === "Reflector") {
      return "Ini memperkuat kepekaan alamimu yang membutuhkan waktu untuk menyerap keadaan sekitar sebelum mengambil keputusan penting.";
    }
  }

  if (planet === "Mercury" || planet === "Uranus") {
    const lpThemes: Record<string, string> = {
      "1": "kapasitasmu untuk merintis keputusan secara mandiri dan mempercayai langkah pertamamu",
      "2": "kepekaan alamimu dalam menjembatani keselarasan dan harmoni di sekitarmu",
      "3": "kemampuanmu untuk mengomunikasikan kebenaran batin secara kreatif dan jujur",
      "4": "keinginan mendasarmu untuk menyusun rencana harian secara teratur dan berfondasi kokoh",
      "5": "dorongan alamimu untuk bereksperimen dengan kebebasan tanpa harus kehilangan arah",
      "6": "pola alamimu dalam merawat hubungan dengan kepedulian yang seimbang tanpa memikul semuanya",
      "7": "kapasitas analisismu untuk membaca makna terdalam di balik situasi yang terjadi",
      "8": "kemampuanmu untuk mengolah daya, pilihan batin, dan kepemimpinan secara berintegritas",
      "9": "kedewasaan batinmu untuk menyelesaikan siklus lama dan melepaskan apa yang tidak lagi melayani pertumbuhanmu",
      "11": "kepekaan intuitifmu untuk menurunkan inspirasi besar menjadi langkah-langkah praktis",
      "22": "kapasitas besarmu untuk merancang visi jangka panjang lewat tindakan kecil yang konsisten",
      "33": "panggilan batinmu untuk melayani dengan kepedulian tanpa melupakan batas kapasitas diri",
    };
    const theme = lpThemes[lifePath];
    if (theme) {
      return `Ini menyentuh ${theme}.`;
    }
  }

  if (planet === "Venus" || planet === "Mars") {
    const arcanaThemes: Record<string, string> = {
      "4": "kemampuanmu menegakkan disiplin batin yang kokoh namun tetap luwes dalam hubungan",
      "6": "cara alamimu dalam menjaga keselarasan hubungan dengan membuat pilihan yang lebih sadar",
      "8": "keberanian batinmu untuk menetapkan batasan yang jelas dan meredam keinginan mengontrol orang lain",
      "9": "kebijaksanaan dalam dirimu untuk merangkul kesendirian yang menenangkan demi kejernihan hubungan",
      "11": "kepekaan rasa yang mendalam untuk menyalurkan kepedulian tanpa kehilangan pusat dirimu",
      "12": "kemampuanmu untuk melihat dinamika hubungan dari sudut pandang baru sebelum bereaksi",
    };
    const theme = arcanaThemes[arcanaCenter];
    if (theme) {
      return `Ini mengaktifkan ${theme}.`;
    }
    return "Ini menantangmu untuk menjaga arah diri dan keselarasan dalam hubungan tanpa mengorbankan jati dirimu.";
  }

  if (planet === "Saturn" || planet === "Pluto" || planet === "Chiron") {
    return `Momen ini menantangmu untuk menyadari ${notSelfText}.`;
  }

  if (planet === "Jupiter") {
    return "Fase ini mendukung panggilan jiwamu untuk terus tumbuh melampaui zona nyaman lama dan membagikan kebijaksanaanmu secara lebih luas.";
  }

  return "";
}

export function buildTransitNarrative(
  body: BodyStatus,
  activation: AstroHouseActivation | undefined,
  context: RecordValue
): TransitNarrative {
  const planetName = body.body;
  const sign = body.sign;
  const house = activation ? activation.house : undefined;

  const collective = getCollectiveTheme(planetName, sign);
  const movement = getMovementTheme(planetName, house);
  const contextAccent = getSingleBlueprintAccent(planetName, context);
  const action = getActionTheme(planetName, house);

  const personalImpact = [movement, contextAccent].filter(Boolean).join(" ");

  return {
    title: `${LABELS[planetName] || planetName} di ${sign}`,
    collectiveTheme: collective,
    personalImpact,
    action,
    isLongTransit: LONG_TRANSITS.has(planetName),
  };
}

export function buildPersonalAstroNote(
  bodies: BodyStatus[],
  activations: AstroHouseActivation[],
  context: RecordValue
): string {
  const priority = ["Moon", "Saturn", "Uranus", "Pluto", "Sun"];
  const selected = priority
    .map((name) => bodies.find((body) => body.body === name))
    .filter((body): body is BodyStatus => Boolean(body))
    .slice(0, 2);

  const narratives = selected.map((body) =>
    buildTransitNarrative(
      body,
      activations.find((item) => item.planet === body.body),
      context
    )
  );

  if (!narratives.length) {
    return "Langit hari ini dapat dibaca sebagai ruang untuk mengenali bagian hidup yang paling membutuhkan kejernihan.";
  }

  const joinedImpacts = narratives
    .map((item) =>
      item.personalImpact
        .split(". ")[0]
        .replace(/^hari ini\s+/i, "")
        .toLowerCase()
    )
    .join(" dan ");

  return `Langit hari ini terutama membuka ${joinedImpacts}. ${narratives[0].action}`;
}
