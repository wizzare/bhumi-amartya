import type { BaziBlueprint, BaziElement, TenGodEntry } from "./types";
import { isEnlEdition } from "@/lib/config/edition";

export interface EnrichedBaziBlueprint extends BaziBlueprint {
  dayMaster: BaziBlueprint["dayMaster"] & {
    description: string;
  };
  tenGods: Array<TenGodEntry & {
    description: string;
  }>;
  fiveElementsDescription: string;
  leastPresentElements: BaziElement[];
  mostPresentElements: BaziElement[];
}

// Deterministic seed generation helper
function getSeed(blueprint: BaziBlueprint, key: string): number {
  const code = key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pillarsSum = [
    blueprint.yearPillar,
    blueprint.monthPillar,
    blueprint.dayPillar,
    blueprint.hourPillar
  ].reduce((acc, p) => acc + p.stem.charCodeAt(0) + p.branch.charCodeAt(0), 0);
  const elementsSum = Object.values(blueprint.fiveElements).reduce((acc, v) => acc + v, 0);
  const dmCharSum = blueprint.dayMaster.stem.charCodeAt(0) + blueprint.dayMaster.pinyin.charCodeAt(0);
  return code + pillarsSum + elementsSum + dmCharSum;
}

function selectOption(options: string[], seed: number): string {
  return options[seed % options.length];
}

const DAY_MASTER_P1_SENTENCE1: Record<string, string[]> = {
  Jia: [
    "Karakter Kayu Yang berakar kuat dan bertumbuh lurus ke atas, membawa dorongan alami untuk merintis serta membuka arah bagi lingkungan sekitarmu.",
    "Sebagai struktur pohon besar, orientasi utamamu adalah pertumbuhan vertikal yang mandiri, teguh memegang prinsip, dan siap menaungi proses bersama.",
    "Arah gerak alamimu berfokus pada pembangunan jangka panjang, melangkah maju dengan inisiatif yang jelas tanpa menunggu dorongan pihak luar."
  ],
  Yi: [
    "Kayu Yin membawa kelenturan dan daya tahan ulet, pandai menyesuaikan arah di tengah rintangan tanpa mematahkan batang utamanya.",
    "Karakter tanaman merambat ini bertumbuh lewat jejaring kerja sama, membaca dinamika sekitar secara taktis, dan menemukan jalur tengah yang harmonis.",
    "Kapasitas utamamu adalah keluwesan beradaptasi, mengandalkan diplomasi dan hubungan suportif untuk terus berkembang melintasi musim yang berganti."
  ],
  Bing: [
    "Api Yang memancar terang dan langsung bagaikan matahari siang, menghidupkan ruang sosial dengan antusiasme yang jujur dan terbuka.",
    "Karakter energimu bersifat ekspansif dan mudah terlihat, membawa kejelasan visi serta keberanian menggerakkan banyak orang di garis depan.",
    "Kecenderungan alamimu adalah menyinari keadaan dengan optimisme nyata, mengutamakan keterbukaan dan kecepatan eksekusi tanpa menyembunyikan maksud."
  ],
  Ding: [
    "Api Yin bekerja dengan intensitas yang terpusat dan mendalam, menyinari detail penting yang kerap terlewat oleh pandangan umum.",
    "Karakter kehangatanmu bersifat personal dan terkontrol, tekun menjaga fokus serta membimbing orang lain melalui pendekatan yang tenang.",
    "Arah energimu bergerak secara terarah ke dalam, mengutamakan dedikasi batin, ketelitian rasa, dan kesetiaan pada nilai yang kamu yakini."
  ],
  Wu: [
    "Tanah Yang memiliki bobot stabil dan daya tumpu kokoh, menjadi landasan yang memberi rasa aman di tengah perubahan keadaan.",
    "Karakter gunung ini membawa keteguhan yang matang, sanggup memikul tanggung jawab besar serta menolak spekulasi yang tergesa-gesa.",
    "Kapasitas utamamu terletak pada konsistensi dan daya tahan, menjaga keteraturan hidup dengan komitmen yang tidak mudah goyah."
  ],
  Ji: [
    "Tanah Yin adalah tanah ladang yang subur, berdaya guna tinggi dalam menyerap masukan dan merawat potensi bertumbuh dengan sabar.",
    "Karakter pengolahanmu teliti dan membumi, mengutamakan hasil nyata serta kepedulian praktis terhadap kebutuhan orang-orang di sekitarmu.",
    "Kecenderungan alamimu adalah mendampingi proses perkembangan secara bertahap, piawai mengelola rincian harian demi kesejahteraan bersama."
  ],
  Geng: [
    "Logam Yang memiliki ketegasan tajam dan struktur yang kuat, siap ditempa oleh tantangan untuk menegakkan aturan yang jelas.",
    "Arah gerakmu lugas dan objektif, piawai memilah masalah, memotong keraguan, serta membenahi kekacauan menjadi sistem yang efisien.",
    "Karakter dasarmu menuntut keadilan dan hasil yang nyata, bertindak disiplin tanpa kompromi berbelit demi mempertahankan integritas."
  ],
  Xin: [
    "Logam Yin mencerminkan kualitas yang telah terasah halus, menuntut standar tinggi, presisi, dan keaslian dalam setiap hasil karya.",
    "Kapasitas utamamu terletak pada ketajaman menyaring detail, menghargai keanggunan bentuk, serta menjaga martabat diri secara mandiri.",
    "Kecenderunganmu adalah menyempurnakan hal-hal yang bernilai, selektif terhadap lingkungan pergaulan, dan menolak hasil kerja yang asal jadi."
  ],
  Ren: [
    "Air Yang membawa volume besar dan daya alir dinamis, memiliki kapasitas alami untuk memetakan peluang dalam skala luas.",
    "Karakter aliranmu bebas dan fleksibel, pandai menghubungkan gagasan dengan manusia serta mencari jalan baru ketika menghadapi kebuntuan.",
    "Orientasi utamamu adalah eksplorasi dan pergerakan strategis, melihat gambaran besar dengan rasa ingin tahu yang tidak mudah terhalang."
  ],
  Gui: [
    "Air Yin meresap perlahan dan sejuk, memiliki daya tembus yang tekun melalui kesabaran mengamati nuansa di balik permukaan.",
    "Karakter embun ini membawa kepekaan intuitif yang tenang, mencerna keadaan secara mendalam sebelum menentukan respons yang tepat.",
    "Kapasitas alamimu terletak pada adaptabilitas yang halus, memulihkan suasana yang tegang lewat ketenangan dan empati yang tulus."
  ]
};

const DAY_MASTER_P1_SENTENCE2: Record<string, string[]> = {
  Jia: [
    "Cara berpikirmu lurus dan terstruktur, selalu melihat potensi perkembangan dari setiap situasi yang dihadapi.",
    "Pola pikirmu visioner dan sistematis, merancang target jangka panjang secara mantap.",
    "Kamu mencerna gagasan secara logis dengan tujuan akhir yang jelas untuk perkembangan dirimu."
  ],
  Yi: [
    "Cara berpikirmu cair dan taktis, sangat peka menangkap dinamika sosial dan membaca peluang yang tersembunyi.",
    "Pola pikirmu mengutamakan strategi adaptif, menghubungkan satu konsep dengan konsep lainnya secara cerdas.",
    "Kamu memiliki pemikiran yang luwes, ahli dalam merancang jalan tengah yang selaras bagi semua."
  ],
  Bing: [
    "Cara berpikirmu luas dan berorientasi pada gambaran besar, selalu bersemangat untuk memulai inisiatif baru.",
    "Pola pikirmu didorong oleh visi masa depan yang terang, merangkul banyak gagasan sekaligus.",
    "Kamu mencerna tantangan secara optimistis, mengutamakan kejelasan ide dan kecepatan eksekusi."
  ],
  Ding: [
    "Cara berpikirmu intuitif, sangat memperhatikan detail, dan peka terhadap hal-hal yang tidak terlihat di permukaan.",
    "Pola pikirmu tajam secara batiniah, merenungkan setiap informasi secara perlahan dan mendalam.",
    "Kamu memiliki pemikiran analitis yang tenang, mendeteksi nuansa terkecil sebelum bertindak."
  ],
  Wu: [
    "Cara berpikirmu pragmatis, berakar pada realitas harian, dan sangat menghargai komitmen.",
    "Pola pikirmu realistis dan terstruktur, menyukai fondasi gagasan yang sudah teruji waktu.",
    "Kamu mencerna keadaan dengan kedewasaan praktis, mengutamakan keselamatan dan keteraturan."
  ],
  Ji: [
    "Cara berpikirmu praktis, penuh perhatian pada detail harian, dan berorientasi pada hasil nyata yang membumi.",
    "Pola pikirmu didominasi kepedulian sosial, merancang solusi yang membawa kebaikan bersama.",
    "Kamu memiliki pemikiran yang memelihara, sabar memproses setiap detail hingga siap dieksekusi."
  ],
  Geng: [
    "Cara berpikirmu logis, jernih, dan langsung mengarah pada solusi tanpa berbelit-belit.",
    "Pola pikirmu objektif dan terstruktur ketat, memilah fakta secara adil tanpa bias emosional.",
    "Kamu mencerna tantangan secara sistematis, menyukai efisiensi tinggi dan kejelasan informasi."
  ],
  Xin: [
    "Cara berpikirmu tajam, analitis, dan memiliki standar estetika yang halus.",
    "Pola pikirmu presisi dan kritis, sangat ahli dalam menyaring serta meningkatkan kualitas gagasan.",
    "Kamu memiliki pemikiran yang selektif, mengutamakan detail bernilai tinggi di atas kuantitas."
  ],
  Ren: [
    "Cara berpikirmu visioner, imajinatif, dan senang memetakan gambaran besar secara konseptual.",
    "Pola pikirmu strategis dan luas, menyukai kebebasan bereksplorasi tanpa batasan kaku.",
    "Kamu mencerna informasi dengan menghubungkan berbagai sudut pandang yang berbeda secara cerdas."
  ],
  Gui: [
    "Cara berpikirmu sangat intuitif, imajinatif, dan mampu menangkap nuansa emosi yang paling halus dari sekelilingmu.",
    "Pola pikirmu mengalir secara naluriah, memahami pesan-pesan batin tersembunyi di balik kata.",
    "Kamu memiliki pemikiran kontemplatif yang dalam, mencerna pengalaman hidup lewat keheningan rasa."
  ]
};

const DAY_MASTER_P1_SENTENCE3: Record<string, string[]> = {
  Jia: [
    "Dalam mengambil keputusan, kamu mengandalkan visi jangka panjang yang kuat dan kejelasan arah, bertindak sebagai penunjuk jalan bagi sekitarmu.",
    "Keputusanmu diambil secara mandiri berlandaskan kemandirian prinsip yang kokoh, menolak keraguan sesaat.",
    "Kamu memutuskan langkah hidup dengan keteguhan batin yang lurus, siap memikul segala tanggung jawab perkembangannya."
  ],
  Yi: [
    "Kamu mengambil keputusan dengan mempertimbangkan keharmonisan kelompok serta kelayakan praktis, mengandalkan kekuatan jejaring kerja.",
    "Keputusanmu diambil secara taktis, merespon perubahan secara cepat demi kelangsungan tujuan bersama.",
    "Kamu memutuskan langkah secara luwes, mengutamakan keseimbangan hubungan sosial dan kelancaran proses harian."
  ],
  Bing: [
    "Dalam mengambil keputusan, kamu mengandalkan antusiasme alami dan visi yang terang, bertindak sebagai penunjuk arah yang jelas.",
    "Keputusanmu diambil secara berani dan cepat, membagikan semangat perubahan kepada kelompok sekitar.",
    "Kamu memutuskan langkah hidup secara transparan, didorong oleh panggilan untuk memimpin perubahan secara nyata."
  ],
  Ding: [
    "Keputusanmu diambil setelah melalui perenungan mendalam dan analisis yang teliti dari hati ke hati.",
    "Dalam memutuskan sesuatu, kamu mengandalkan intuisi personal yang tenang serta kejelasan moral batin.",
    "Kamu memutuskan langkah secara hati-hati, memastikan keselarasan batiniah dengan nilai terdalammu."
  ],
  Wu: [
    "Dalam mengambil keputusan, kamu bertindak dengan kehati-hatian, mengutamakan keselamatan dan keberlanjutan jangka panjang.",
    "Keputusanmu diambil secara matang setelah menakar stabilitas keadaan, menolak spekulasi terburu-buru.",
    "Kamu memutuskan langkah dengan kedewasaan membumi, memastikan setiap tindakan membawa keamanan bagi sekitar."
  ],
  Ji: [
    "Keputusanmu diambil berdasarkan kepedulian yang tulus terhadap kesejahteraan dan keharmonisan bersama.",
    "Dalam memutuskan langkah, kamu mengutamakan solusi praktis yang aman bagi kelangsungan hidup kelompok harian.",
    "Kamu memutuskan sesuatu secara matang, merawat potensi tumbuh kembang relasi dengan kesabaran membumi."
  ],
  Geng: [
    "Dalam mengambil keputusan, kamu mengandalkan analisis yang objektif dan kesiapan untuk menghadapi konsekuensi sulit.",
    "Keputusanmu diambil dengan keberanian untuk menertibkan ketidakadilan secara langsung tanpa kompromi.",
    "Kamu memutuskan langkah hidup dengan ketegasan yang jernih, menyelaraskan tindakan dengan aturan logis."
  ],
  Xin: [
    "Keputusanmu diambil secara terukur dan presisi, mengutamakan nilai jangka panjang dan keaslian karya.",
    "Dalam memutuskan langkah, kamu menyaring pilihan secara kritis demi memastikan standar tertinggi terpenuhi.",
    "Kamu memutuskan langkah secara elegan, menjaga integritas harga diri dan kemandirian berkarya."
  ],
  Ren: [
    "Dalam mengambil keputusan, kamu mengandalkan keluwesan strategis dan kesiapan untuk mengalir mengikuti arah peluang.",
    "Keputusanmu diambil secara dinamis, mengarahkan aliran tenagamu secara strategis pada target luas.",
    "Kamu memutuskan langkah secara fleksibel, selalu siap menyesuaikan tindakan dengan arus peluang baru."
  ],
  Gui: [
    "Keputusanmu diambil berdasarkan bisikan nurani dan pemahaman mendalam tentang pola kehidupan batin.",
    "Dalam memutuskan langkah, kamu bersandar pada ketenangan intuisi yang menembus kerumitan logika.",
    "Kamu memutuskan langkah secara lembut namun pasti, mengalir mengikuti tuntunan batin yang sunyi."
  ]
};

const DAY_MASTER_P2_SENTENCE1: Record<string, string[]> = {
  Jia: [
    "Secara emosional, terdapat keteguhan yang mendalam namun cenderung kaku saat situasi tidak selaras dengan ekspektasi.",
    "Irama emosimu stabil namun rentan mengeras menjadi sikap enggan berkompromi saat rencana hidup terganggu.",
    "Secara batiniah, ada ketegaran yang luar biasa namun kadang menyulitkanmu menyadari kerapuhan diri sendiri."
  ],
  Yi: [
    "Emosimu bergerak halus namun sangat peka menyerap getaran dan suasana hati lingkungan di sekitarmu.",
    "Secara emosional, kamu sangat peka dan mudah larut dalam dinamika energi kelompok di sekelilingmu.",
    "Irama batinmu cair, mudah beresonansi dengan rasa orang lain secara tulus."
  ],
  Bing: [
    "Emosimu bergerak cepat dan menyala terang, namun rentan meredup atau merasa hampa ketika kontribusimu kurang diapresiasi.",
    "Secara emosional, kamu sangat ekspresif dan berapi-api, mengekspresikan sukacita maupun amarah secara langsung.",
    "Irama batinmu menyala dengan semangat hangat, namun butuh ruang teduh berkala agar tidak mengalami kejenuhan batin."
  ],
  Ding: [
    "Secara emosional, kamu cenderung menyimpan perasaan rapat-rapat dan sangat berhati-hati dalam mengekspresikan kerentanan diri.",
    "Irama emosimu mengalir sunyi di kedalaman batin, hanya dibagikan kepada mereka yang benar-benar kamu percayai.",
    "Secara batiniah, ada sensitivitas yang sangat halus, merawat luka rasa secara hening."
  ],
  Wu: [
    "Emosimu lambat bergejolak, namun menumpuk secara perlahan di bawah permukaan tanpa suara.",
    "Secara emosional, kamu membentengi diri dengan ketenangan gunung, jarang meluapkan ketidakpuasan secara terburu-buru.",
    "Irama batinmu kokoh, menahan gejolak rasa secara mandiri tanpa ingin membebani sekeliling."
  ],
  Ji: [
    "Dalam emosi, ada kelembutan yang mendalam namun sering kali disertai kecemasan batin yang tersembunyi mengenai kebutuhan orang lain.",
    "Secara emosional, kamu menampung perasaan sekitar dengan empati tinggi, terkadang melupakan kebutuhan rasamu sendiri.",
    "Irama batinmu merawat dengan tulus, meski rentan memendam rasa bersalah saat mengutamakan diri."
  ],
  Geng: [
    "Emosimu tegak dan jarang ditunjukkan secara terbuka, karena kamu lebih memilih terlihat kuat di hadapan dunia.",
    "Secara emosional, kamu menyaring perasaan lewat logika, bersikap disiplin untuk menahan kerapuhan diri.",
    "Irama batinmu tegap menghadapi badai emosional, memproses kesedihan lewat kejelasan tindakan."
  ],
  Xin: [
    "Secara emosional, kamu sangat peka terhadap kritik luar dan membutuhkan lingkungan yang bersih dari kekacauan relasi.",
    "Irama emosimu elegan, melindungi harga diri dengan sangat ketat dari pengaruh luar yang kasar.",
    "Secara batiniah, kamu peka merasakan retakan relasi, memproses kekecewaan secara mandiri."
  ],
  Ren: [
    "Emosimu mengalir bagai gelombang samudra—tenang di permukaan namun menyimpan kedalaman misteri di bawahnya.",
    "Secara emosional, kamu mengalir luwes namun rentan kehilangan jangkar batin saat arus kehidupan bergerak terlalu cepat.",
    "Irama batinmu dinamis, menampung berbagai getaran perasaan tanpa ingin terikat secara sempit."
  ],
  Gui: [
    "Emosimu sangat cair dan peka, mudah terpengaruh oleh getaran energi dari lingkungan sekitar secara instan.",
    "Secara emosional, kamu bagaikan spons yang menyerap kesedihan sekeliling, membutuhkan ruang bersih untuk memulihkan diri.",
    "Irama batinmu kontemplatif dan halus, peka meraba getaran rasa batin terdalam sesama."
  ]
};

const DAY_MASTER_P2_SENTENCE2: Record<string, string[]> = {
  Jia: [
    "Menghadapi tekanan, respon pertamamu adalah bertahan dan memikul semua beban secara mandiri tanpa ingin terlihat goyah.",
    "Saat berada di bawah tekanan berat, kamu cenderung mengencangkan kedisiplinan dan bekerja lebih keras untuk membuktikan kekuatanmu.",
    "Menghadapi kesulitan, kamu merespon secara kokoh, memikul ketegangan secara sepihak."
  ],
  Yi: [
    "Ketika menghadapi tekanan, kamu merespon dengan meliuk atau beradaptasi secara cerdas demi menghindari benturan langsung.",
    "Saat situasi memanas, responmu adalah mencari celah alternatif yang aman untuk menjaga harmoni tim.",
    "Menghadapi ketegangan relasi, kamu merespon secara taktis, melenturkan sikap demi meredam perselisihan harian."
  ],
  Bing: [
    "Di bawah tekanan, kamu cenderung menghadapi tantangan secara langsung dan terbuka tanpa menyembunyikan ketidaknyamanan.",
    "Saat terdesak, respon pertamamu adalah meluapkan ketidakpuasan dengan vokal demi mencari kejelasan masalah segera.",
    "Menghadapi krisis batin, kamu bertindak secara reaktif dan dinamis, membongkar sumbatan komunikasi dengan berani."
  ],
  Ding: [
    "Menghadapi tekanan batin, respon pertamamu adalah menarik diri ke dalam keheningan untuk memproses keadaan secara mandiri.",
    "Saat situasi menegang, responmu adalah mundur perlahan ke ruang privat demi menata getaran rasa yang kacau.",
    "Menghadapi konflik luar, kamu merespon secara tertutup, mencerna masalah secara sunyi sebelum bertindak."
  ],
  Wu: [
    "Menghadapi tekanan yang berat, kamu merespon dengan mengencangkan benteng pertahanan dan memikul semua tanggung jawab sendirian.",
    "Saat krisis melanda kelompok, kamu berdiri tegak menopang beban keadaan demi melindungi ketenangan sekitar.",
    "Menghadapi ancaman ketidakpastian, responmu adalah menjadi jangkar kestabilan bagi sesama secara tabah."
  ],
  Ji: [
    "Di bawah tekanan, kamu cenderung bekerja lebih keras untuk menjaga kestabilan relasi, terkadang hingga mengabaikan keletihan fisikmu.",
    "Saat situasi menuntut kontribusi besar, kamu merespon dengan menyembuhkan luka relasi sekitar secara sabar.",
    "Menghadapi konflik harian, responmu adalah menawarkan perawatan dan dukungan ekstra agar keharmonisan terjaga."
  ],
  Geng: [
    "Saat tertekan, kamu merespon dengan memperketat kedisiplinan diri dan menyusun pertahanan yang teratur.",
    "Menghadapi tekanan berat, respon pertamamu adalah mengambil kendali situasi secara tegas dan objektif.",
    "Menghadapi ketegangan, kamu merespon dengan mengencangkan aturan rasional untuk menyederhanakan masalah."
  ],
  Xin: [
    "Menghadapi tekanan, respon pertamamu adalah menjaga jarak secara anggun untuk memproses perasaan secara mandiri.",
    "Saat situasi memanas, kamu menarik diri dari kekacauan relasi demi mempertahankan ketenangan harga dirimu.",
    "Menghadapi kritik tajam, responmu adalah mengisolasi diri secara elegan untuk menyaring wawasan secara jernih."
  ],
  Ren: [
    "Menghadapi tekanan batin, kamu merespon dengan mencari celah-celah baru untuk terus bergerak alih-alih menabrak rintangan secara frontal.",
    "Saat situasi tersumbat, responmu adalah melenturkan arah tindakan secara strategis demi kelancaran arus kerja.",
    "Menghadapi hambatan keras, kamu merespon secara dinamis, mengalihkan fokus pada peluang-peluang baru yang lebih luwes."
  ],
  Gui: [
    "Di bawah tekanan, kamu merespon dengan menarik diri ke dalam keheningan batin untuk mencerna keadaan secara perlahan.",
    "Saat situasi luar terlalu bising, kamu merespon dengan hening batiniah, membiarkan waktu melunakkan kekerasan.",
    "Menghadapi gesekan rasa, responmu adalah mundur ke kedalaman kontemplatif demi memulihkan energi spritualmu."
  ]
};

const DAY_MASTER_P2_SENTENCE3: Record<string, string[]> = {
  Jia: [
    "Blind spot-mu adalah kecenderungan menolak perubahan arah secara mendadak dan memaksakan diri melampaui batas stamina batinmu.",
    "Kecenderungan bersikap keras kepala saat rencana berubah adalah kebiasaan emosional yang perlu terus kamu waspadai.",
    "Kebiasaan menahan beban sendirian tanpa menunjukkan kelemahan menjadi celah yang rentan membuat jiwamu keletihan batin."
  ],
  Yi: [
    "Blind spot-mu adalah kecenderungan menunda keputusan penting karena terlalu cemas memikirkan penerimaan orang lain.",
    "Kebiasaan membiarkan jiwamu bergantung terlalu kuat pada penopang luar adalah titik rapuh yang perlu kamu sadari.",
    "Kecenderungan kehilangan jati diri akibat terlalu larut menyelaraskan diri dengan sekitar adalah kebiasaan batinmu."
  ],
  Bing: [
    "Blind spot-mu adalah kecenderungan terburu-buru bertindak sebelum mencerna detail situasi secara mendalam.",
    "Kebiasaan mengabaikan keletihan fisik demi mempertahankan citra bersemangat adalah celah kejenuhan batinmu.",
    "Kecenderungan membakar habis energimu seketika demi panggung luar adalah kebiasaan emosional yang perlu dikurangi."
  ],
  Ding: [
    "Blind spot-mu adalah kecenderungan mencurigai motif sekeliling dan memendam kekecewaan secara sunyi.",
    "Kebiasaan menarik diri terlalu jauh hingga memicu kesalahpahaman relasi adalah titik rapuh yang perlu disadari.",
    "Kecenderungan melelahkan diri sendiri demi menghangatkan sekitar secara rahasia adalah kebiasaan batinmu."
  ],
  Wu: [
    "Blind spot-mu adalah kecenderungan bersikap kaku dan enggan bergeser dari zona nyaman yang sudah mapan.",
    "Kebiasaan menyimpan ketidakpuasan rasa hingga mengeras menjadi sikap dingin adalah celah batiniahmu.",
    "Kecenderungan menolak perubahan struktural karena takut kehilangan kestabilan adalah kebiasaan emosionalmu."
  ],
  Ji: [
    "Blind spot-mu adalah kesulitan berkata tidak dan rasa bersalah yang muncul saat merawat diri sendiri.",
    "Kebiasaan membiarkan tanah jiwamu tandus akibat terus menyembuhkan sesama adalah celah batin yang utama.",
    "Kecenderungan memendam keletihan demi keharmonisan semu menjadi titik rapuh yang perlu terus diwaspadai."
  ],
  Geng: [
    "Blind spot-mu adalah ketidaksabaran terhadap kelemahan orang lain serta kecenderungan memotong diskusi dengan ketegasan yang kaku.",
    "Kebiasaan meredam kelembutan rasa dengan bersikap dingin adalah titik rapuh emosionalmu harian.",
    "Kecenderungan memaksakan aturan rasional tanpa memedulikan nuansa perasaan sekitar adalah kebiasaan batinmu."
  ],
  Xin: [
    "Blind spot-mu adalah kritik diri yang terlampau tajam dan kecenderungan menarik diri saat merasa kurang dihargai.",
    "Kebiasaan menghakimi ketidaksempurnaan proses batin secara berlebihan menjadi celah kejenuhan jiwamu.",
    "Kecenderungan memendam kekecewaan secara elegan namun dingin adalah kebiasaan emosional yang membatasi relasi."
  ],
  Ren: [
    "Blind spot-mu adalah kecenderungan menghindari konflik nyata dengan terus hanyut dan menunda fokus jangka panjang.",
    "Kebiasaan melarikan diri dari komitmen erat saat ketegangan melanda adalah titik rapuh batinmu harian.",
    "Kecenderungan membiarkan energimu meluap ke terlalu banyak arah tanpa tujuan wadah yang jelas adalah kebiasaanmu."
  ],
  Gui: [
    "Blind spot-mu adalah keraguan diri yang mendalam serta kebiasaan membiarkan kecemasan melumpuhkan langkah nyatamu.",
    "Kebiasaan tenggelam dalam kesedihan luar hingga kehilangan pegangan logika nyata adalah titik rapuh emosionalmu.",
    "Kecenderungan menarik diri terlalu dalam ke ruang imajinasi saat kenyataan memanas adalah kebiasaan batinmu."
  ]
};

const DAY_MASTER_P3_SENTENCE1: Record<string, string[]> = {
  Jia: [
    "Pertumbuhan sejatimu lahir saat kamu bersedia melunakkan pertahanan diri dan belajar meliuk bersama angin ketidakpastian.",
    "Misi kedewasaan jiwamu menuntut pembelajaran untuk menyambut perubahan arah hidup secara lapang dada.",
    "Arah kematanganmu terbuka lebar ketika kamu berani melonggarkan ekspektasi kaku terhadap target perkembangan."
  ],
  Yi: [
    "Kematanganmu terbentuk ketika kamu berani menetapkan batasan batin yang jelas dan kokoh.",
    "Misi kedewasaan jiwamu tercapai saat kamu percaya pada kekuatan internalmu sendiri tanpa terus bersandar luar.",
    "Arah kematanganmu menuntut kesediaan berdiri mandiri mengawal keputusan jiwamu secara utuh."
  ],
  Bing: [
    "Pertumbuhan jiwamu menuntut pembelajaran untuk memelihara kestabilan api di dalam dirimu agar tidak cepat padam.",
    "Misi kedewasaan batinmu tercapai saat kamu menyadari pentingnya jeda istirahat demi menjaga kelestarian energi.",
    "Arah kematangan jiwamu terbuka ketika kamu belajar menyinari sekitar secara teduh dan konsisten."
  ],
  Ding: [
    "Kematanganmu berkembang seiring keberanianmu mempercayai cahaya unikmu sendiri tanpa bergantung pada validasi luar.",
    "Misi kedewasaan batinmu menuntut kesediaan mengekspresikan intuisi jujurmu secara terbuka pada dunia.",
    "Arah kematangan jiwamu tercapai ketika kamu berani keluar dari kesunyian batin untuk berbagi wawasan khusus."
  ],
  Wu: [
    "Pertumbuhanmu terjadi saat kamu mengizinkan tanah jiwamu digemburkan oleh pengalaman-pengalaman baru yang tidak terduga.",
    "Misi kedewasaan batinmu menuntut kerelaan melepaskan kendali atas ketidakpastian harian.",
    "Arah kematangan jiwamu terbuka ketika kamu bersedia melunakkan pertahanan benteng batin demi perubahan baru."
  ],
  Ji: [
    "Kedewasaanmu matang ketika kamu menyadari pentingnya memulihkan tanah jiwamu sendiri terlebih dahulu sebelum menumbuhkan yang lain.",
    "Misi kedewasaan jiwamu menuntut kedisiplinan mengutamakan perawatan batin diri tanpa merasa bersalah.",
    "Arah kematangan jiwamu terbuka ketika kamu berani membiarkan dirimu dirawat dan dipulihkan secara seimbang."
  ],
  Geng: [
    "Kematanganmu terbentuk ketika ketegasan mentalmu melunak oleh kepekaan rasa dan empati.",
    "Misi kedewasaan jiwamu menuntut kesediaan mendengarkan secara tulus sebelum menawarkan pembenahan logis.",
    "Arah kematangan jiwamu terbuka saat kamu mampu memadukan ketegasan prinsip dengan kelembutan komunikasi harian."
  ],
  Xin: [
    "Kematangan jiwamu tercapai saat kamu belajar merangkul ketidaksempurnaan sebagai bagian indah dari proses manusia.",
    "Misi kedewasaan batinmu menuntut kerelaan memaafkan kegagalan kecil diri sendiri dan sekitar secara ikhlas.",
    "Arah kematangan jiwamu terbuka saat perhiasan jiwamu memancar teduh tanpa menuntut kesempurnaan mutlak."
  ],
  Ren: [
    "Pertumbuhan sejatimu menuntut kedisiplinan batin untuk mengarahkan aliran energimu yang melimpah pada tujuan yang jelas.",
    "Misi kedewasaan jiwamu tercapai saat kamu membangun wadah batasan diri yang sehat guna memusatkan tenaga batin.",
    "Arah kematangan jiwamu terbuka ketika kamu berani berkomitmen penuh mengawal satu tujuan hingga tuntas."
  ],
  Gui: [
    "Kedewasaanmu terbentuk ketika kamu berani menyuarakan kebenaran intuitifmu secara lugas kepada dunia.",
    "Misi kedewasaan jiwamu menuntut keyakinan penuh akan kekuatan kelembutan rasa yang kamu miliki.",
    "Arah kematangan jiwamu terbuka ketika kamu bangkit mengatasi keraguan diri dan melangkah maju secara mandiri."
  ]
};

const DAY_MASTER_P3_SENTENCE2: Record<string, string[]> = {
  Jia: [
    "Kematangan jiwamu tercapai dengan mengintegrasikan kelembutan ke dalam keteguhanmu, menyadari bahwa adakalanya bersandar pada sesama adalah bagian dari kekuatan.",
    "Dengan melatih kelenturan diri menghadapi badai, jiwamu menemukan kedamaian sejati yang lestari.",
    "Integrasi batin terjadi saat kekuatan besarmu selaras dengan kesediaan menerima kerapuhan diri."
  ],
  Yi: [
    "Integrasi sejati terjadi saat kamu bisa beradaptasi secara luwes dengan lingkungan tanpa harus mengorbankan kebenaran jiwamu sendiri.",
    "Dengan memelihara jati diri yang mandiri, sulur jiwamu bertumbuh subur meraih tujuan tertingginya secara berdaulat.",
    "Integrasi batin tercapai saat kamu menopang harmoni hubungan luar tanpa kehilangan keaslian prinsip diri."
  ],
  Bing: [
    "Kematangan sejati dicapai saat kamu mampu memancarkan kehangatan secara teduh, menyadari bahwa sinar yang tenang lebih menopang.",
    "Dengan mengintegrasikan jeda kontemplatif, api semangatmu dapat terus menyala secara stabil menyatukan sesama.",
    "Integrasi batin terwujud ketika kepemimpinanmu menginspirasi kelompok tanpa menguras habis tenagamu sendiri."
  ],
  Ding: [
    "Integrasi batin dicapai saat kamu mampu menyinari jalan orang lain tanpa harus mengorbankan kedamaian batinmu sendiri.",
    "Dengan menyeimbangkan dedikasi luar dan perlindungan batin, fokusmu dapat terjaga stabil menopang orang-orang di sekitarmu.",
    "Integrasi sejati terbentuk saat kamu berbagi wawasan mendalam dengan sekeliling tanpa rasa takut diabaikan."
  ],
  Wu: [
    "Kematangan sejati dicapai ketika kamu bersedia melunakkan kekakuan batin, melepaskan kebutuhan mengendali, dan membiarkan perubahan mengalir.",
    "Dengan melatih keluwesan menerima perbedaan cara kerja sekitar, kapasitas kepemimpinanmu berdiri kokoh menaungi stabilitas bersama.",
    "Integrasi batin terwujud ketika kestabilan prinsipmu berpadu luwes dengan dinamika perubahan eksternal harian."
  ],
  Ji: [
    "Integrasi sejati terjadi saat kamu mampu memberi dukungan secara tulus tanpa melupakan batasan sehat untuk menjaga energi tetap lestari.",
    "Dengan memelihara keseimbangan merawat luar dan dalam, kapasitasmu tetap subur melahirkan kebaikan jangka panjang.",
    "Integrasi batin tercapai ketika kamu mengizinkan dirimu menerima cinta kasih yang setara dari sekitarmu secara terbuka."
  ],
  Geng: [
    "Integrasi sejati dicapai saat kamu mampu mengarahkan kekuatan pembenahanmu dengan kelembutan, memimpin tanpa memaksakan aturan kaku.",
    "Dengan memadukan logika tajam dan kepekaan empati, karaktermu tampil sebagai pembawa keadilan yang disegani sekaligus dihormati.",
    "Integrasi batin terwujud ketika tindakan tegasmu didasari oleh niat tulus melindungi kerapuhan rasa sesama."
  ],
  Xin: [
    "Integrasi batin terjadi ketika karya dan keahlianmu dihargai secara wajar tanpa terus menuntut pengakuan sempurna dari luar.",
    "Dengan menerima proses belajar sebagai perjalanan bertahap, kualitas yang kamu hadirkan membawa dampak nyata yang menenangkan sekeliling.",
    "Integrasi sejati terbentuk ketika standar tinggimu berjalan selaras dengan toleransi hangat terhadap keterbatasan diri."
  ],
  Ren: [
    "Kematangan sejati terbentuk saat kamu mampu membangun wadah disiplin yang sehat, sehingga aliran energimu terpusat menjadi karya nyata.",
    "Dengan menyelaraskan kedinamisan arah hidup bersama kedisiplinan harian, energimu terarah nyata memberi manfaat luas bagi lingkunganmu.",
    "Integrasi batin tercapai saat kebebasan melangkah berjalan beriringan dengan tanggung jawab mengawal komitmen erat."
  ],
  Gui: [
    "Integrasi sejati dicapai saat kamu meyakini bahwa kelembutanmu adalah kekuatan besar yang mampu melunakkan kekerasan hidup.",
    "Dengan mempercayai ketekunan sunyimu, hujan jiwamu menyuburkan setiap celah kekeringan hidup secara konsisten harian.",
    "Integrasi batin terwujud saat sensitivitas indrawimu berdiri tegak bersama ketegasan logika mengawal misi kehidupan."
  ]
};

export const TEN_GODS_LOOKUP: Record<string, string> = {
  Friend: "Pola Friend memperkuat kemandirian prinsip dan ketahanan berdiri di atas kaki sendiri. Karunia tersembunyinya adalah keteguhan hati dan ketahanan batin yang kuat. Sisi bayangannya adalah kecenderungan bersikap keras kepala serta enggan menerima masukan orang lain di saat lelah.",
  "Rob Wealth": "Pola Rob Wealth menghadirkan keluwesan sosial, karisma, dan daya dorong kompetitif yang tinggi. Karunia tersembunyinya adalah kejelian membaca motivasi orang lain dan memimpin kelompok secara dinamis. Sisi bayangannya adalah dorongan bersaing yang melelahkan serta kesulitan menetapkan batas energi diri.",
  "Eating God": "Pola Eating God membawa dorongan alami untuk mencipta, menikmati ketenangan batin, dan mengekspresikan gagasan secara orisinal. Karunia tersembunyinya adalah aliran kreativitas yang murni serta pembawaan tenang yang menyembuhkan sekitar. Sisi bayangannya adalah kecenderungan menunda tindakan atau tenggelam dalam kenyamanan pasif.",
  "Hurting Officer": "Pola Hurting Officer didorong oleh kecerdasan berekspresi yang tajam, keberanian berinovasi, dan dorongan mendobrak batasan lama. Karunia tersembunyinya adalah kecerdasan komunikatif yang tajam dan persuasif. Sisi bayangannya adalah kecenderungan bersikap kritis secara berlebihan yang rentan melukai rasa sesama.",
  "Indirect Wealth": "Pola Indirect Wealth membawa kejelian membaca peluang bernilai dan keberanian mengelola perputaran sumber daya secara dinamis. Karunia tersembunyinya adalah ketangkasan merancang perputaran nilai konseptual. Sisi bayangannya adalah ketidaksabaran mengelola detail kecil serta kejenuhan jika ritme berjalan lambat.",
  "Direct Wealth": "Pola Direct Wealth menekankan ketekunan mengelola hasil kerja nyata, keteraturan aset, dan tanggung jawab praktis harian. Karunia tersembunyinya adalah keandalan yang luar biasa serta kedisiplinan menjaga keberlanjutan hidup. Sisi bayangannya adalah kecemasan berlebih akan ketidakpastian atau keengganan berinvestasi pada hal baru.",
  "Seven Killings": "Pola Seven Killings berakar pada ketangguhan menghadapi tekanan nyata dan ketegasan mengambil keputusan di saat kritis. Karunia tersembunyinya adalah keberanian memimpin di situasi sulit dengan integritas baja. Sisi bayangannya adalah ketegangan internal yang konstan serta dorongan untuk mengontrol keadaan secara berlebihan.",
  "Direct Officer": "Pola Direct Officer mencerminkan kepemimpinan yang berlandaskan etika, ketertiban sistem, dan penghormatan pada keharmonisan bersama. Karunia tersembunyinya adalah kepemimpinan yang etis dan tepercaya. Sisi bayangannya adalah ketakutan berbuat salah serta kekakuan dalam menyikapi pelanggaran aturan kecil.",
  "Indirect Resource": "Pola Indirect Resource memiliki kepekaan membaca pola tersembunyi, minat pada pengetahuan mendalam, dan cara berpikir nonkonvensional. Karunia tersembunyinya adalah pemikiran orisinal dan kepekaan menangkap nuansa batin. Sisi bayangannya adalah kecenderungan bersikap sinis atau kesulitan mempercayai ketulusan relasi.",
  "Direct Resource": "Pola Direct Resource membawa kapasitas menyerap ilmu, memelihara integritas pengetahuan, dan memberikan bimbingan yang menenangkan. Karunia tersembunyinya adalah kearifan mengayomi bagaikan pembimbing moral. Sisi bayangannya adalah kebiasaan berpikir terlalu teoritis tanpa tindakan nyata."
};

export const TEN_GODS_LOOKUP_EN: Record<string, string> = {
  Friend: "Possesses a natural tendency toward independence and holding firmly to personal principles. Its hidden gift is inner fortitude and resilience. Its shadow is a stubborn resistance to outside input when fatigued.",
  "Rob Wealth": "Driven by social agility and charismatic magnetism. Its hidden gift is discerning others' underlying motivations and mobilizing groups dynamically. Its shadow is an exhausting competitive drive and difficulty setting energetic boundaries.",
  "Eating God": "Endowed with an innate orientation toward inner harmony, calm discernment, and genuine self-expression. Its hidden gift is pure creative flow and an ease of being that heals those around them. Its shadow is procrastination or retreating into passive comfort.",
  "Hurting Officer": "Propelled by an urge to express original thought boldly and challenge orthodoxy. Its hidden gift is sharp, persuasive communicative brilliance. Its shadow is overly sharp critique that risks wounding sensitive bonds.",
  "Indirect Wealth": "Naturally drawn to dynamic opportunities and calculated risks. Its hidden gift is resourcefulness and spotting latent value where others see obstacles. Its shadow is impatience with mundane details and restlessness when pacing slows.",
  "Direct Wealth": "Values steady practical outcomes and conscientious stewardship of resources. Its hidden gift is reliability and disciplined sustainability. Its shadow is excessive anxiety over uncertainty and reluctance to invest in new ventures.",
  "Seven Killings": "Driven by tough resilience under crisis and protective instincts. Its hidden gift is the courage to lead in high-stakes environments with steel integrity. Its shadow is persistent internal tension and a tendency to over-control outcomes.",
  "Direct Officer": "Carries deep reverence for lawful order, social harmony, and moral responsibility. Its hidden gift is ethical leadership and trustworthy governance. Its shadow is fear of missteps and rigidity when facing minor rule infractions.",
  "Indirect Resource": "Deeply drawn to specialized insights, philosophical depth, unconventional wisdom, and hidden patterns. Its hidden gift is profound originality and subtle perceptual awareness. Its shadow is cynicism or difficulty trusting the sincerity of connections.",
  "Direct Resource": "Guided by an innate desire to study deeply, preserve wisdom traditions, and cultivate moral peace. Its hidden gift is mentoring guidance and comforting counsel. Its shadow is theoretical overthinking without grounding in practical execution.",
};

type TenGodPillar = "year" | "month" | "day" | "hour";

const TEN_GODS_PILLAR_CONTEXT: Record<TenGodPillar, string> = {
  year: "Pada Pilar Tahun, pola ini memberi warna pada lingkungan awal dan cara dunia pertama kali mengenalmu. Seiring dewasa, kamu dapat memilih bagian dari warisan pengalaman yang masih selaras tanpa harus mengulang semua pola lama.",
  month: "Pada Pilar Bulan, pola ini terlihat dalam pekerjaan, tanggung jawab harian, dan hubunganmu dengan sistem. Kekuatan ini tumbuh ketika pengetahuan serta kemampuanmu dipakai untuk memberi kontribusi nyata.",
  day: "Pada Pilar Hari, pola ini terasa paling dekat dengan dirimu: cara kamu merasakan kebutuhan pribadi dan membangun kedekatan. Kejujuran pada pengalaman batin membantu kamu mengekspresikan diri tanpa menyembunyikan beban.",
  hour: "Pada Pilar Jam, pola ini hadir dalam ruang batin, gagasan, dan visi jangka panjang yang belum selalu terlihat orang lain. Waktu sunyi membantu pemahamanmu matang lalu berubah menjadi karya, perhatian, atau arah yang ingin kamu tinggalkan.",
};

const TEN_GODS_PILLAR_CONTEXT_EN: Record<TenGodPillar, string> = {
  year: "In the Year Pillar, this archetype colors your early environment and how the world first perceives you. With maturity, you consciously choose which ancestral heritage to carry forward without repeating obsolete patterns.",
  month: "In the Month Pillar, this archetype expresses through your career, daily responsibilities, and relationship to broader systems. This strength blossoms when your expertise is dedicated to tangible contribution.",
  day: "In the Day Pillar, this archetype sits closest to your private core: how you experience intimate needs and form close bonds. Emotional honesty helps you express vulnerability without hiding beneath a facade.",
  hour: "In the Hour Pillar, this archetype lives in your inner realm, future aspirations, and legacy that others do not always see immediately. Quiet hours allow these insights to mature into meaningful work and lasting wisdom.",
};

/**
 * Combines the shared Ten Gods meaning with the life domain represented by a
 * pillar. This is presentation-only: it never calculates or changes a type.
 */
export function buildTenGodsNarrative({
  tenGod,
  pillar,
  sourceMeaning,
  isEn,
}: {
  tenGod: string;
  pillar: TenGodPillar;
  stem?: string;
  dayMaster?: string;
  sourceMeaning?: string;
  isEn?: boolean;
}): string {
  if (isEn) {
    const core = sourceMeaning || TEN_GODS_LOOKUP_EN[tenGod] || "This archetype brings a distinctive signature to your lived experience.";
    const coreLead = core.split(/(?<=[.!?])\s+/).filter(Boolean)[0] || core;
    return `${coreLead} ${TEN_GODS_PILLAR_CONTEXT_EN[pillar]}`;
  }
  const core = sourceMeaning || TEN_GODS_LOOKUP[tenGod] || "Pola ini membawa kecenderungan khas dalam cara kamu menjalani pengalaman.";
  const coreLead = core.split(/(?<=[.!?])\s+/).filter(Boolean)[0] || core;
  return `${coreLead} ${TEN_GODS_PILLAR_CONTEXT[pillar]}`;
}

export class BaziMeaningService {
  public static enrich(blueprint: BaziBlueprint, options: { isEn?: boolean } = {}): EnrichedBaziBlueprint {
    const isEn = options.isEn ?? isEnlEdition();
    if (isEn) {
      return this.enrichEn(blueprint);
    }
    const dayMasterPinyin = blueprint.dayMaster.pinyin;
    const dayMasterPolarity = blueprint.dayMaster.polarity;
    const fiveElements = blueprint.fiveElements;
    const tenGods = blueprint.tenGods;
    const currentLuckCycle = blueprint.currentLuckCycle;

    // Seeds for deterministic selection to guarantee variety and uniqueness
    const sDM_P1 = getSeed(blueprint, "DM_P1");
    const sDM_P2 = getSeed(blueprint, "DM_P2");
    const sDM_P3 = getSeed(blueprint, "DM_P3");

    // Resolve Day Master Paragraph 1
    const dmP1_S1 = selectOption(DAY_MASTER_P1_SENTENCE1[dayMasterPinyin] || ["Karakter inti jiwamu memiliki keunikan tersendiri."], sDM_P1);
    const dmP1_S2 = selectOption(DAY_MASTER_P1_SENTENCE2[dayMasterPinyin] || ["Cara berpikirmu berjalan seiring pembawaan alamimu."], sDM_P1 + 1);
    const dmP1_S3 = selectOption(DAY_MASTER_P1_SENTENCE3[dayMasterPinyin] || ["Gaya keputusanmu berlandaskan pada prinsip hidup yang kuat."], sDM_P1 + 2);

    // Resolve Day Master Paragraph 2
    const dmP2_S1 = selectOption(DAY_MASTER_P2_SENTENCE1[dayMasterPinyin] || ["Secara emosional, kamu memiliki getaran batin yang tenang."], sDM_P2);
    const dmP2_S2 = selectOption(DAY_MASTER_P2_SENTENCE2[dayMasterPinyin] || ["Menghadapi tekanan, kamu merespon sesuai keselarasan diri harian."], sDM_P2 + 1);
    const dmP2_S3 = selectOption(DAY_MASTER_P2_SENTENCE3[dayMasterPinyin] || ["Waspadai kecenderungan memendam beban rasa secara berlebihan."], sDM_P2 + 2);

    // Resolve Day Master Paragraph 3
    const dmP3_S1 = selectOption(DAY_MASTER_P3_SENTENCE1[dayMasterPinyin] || ["Pertumbuhan sejatimu tercapai melalui keseimbangan rasa batin."], sDM_P3);
    const dmP3_S2 = selectOption(DAY_MASTER_P3_SENTENCE2[dayMasterPinyin] || ["Kedewasaan jiwamu matang seiring keberanian menyelaraskan diri harian."], sDM_P3 + 1);

    const dayMasterDescription = `${dmP1_S1} ${dmP1_S2} ${dmP1_S3}\n\n${dmP2_S1} ${dmP2_S2} ${dmP2_S3}\n\n${dmP3_S1} ${dmP3_S2}`;

    // Resolve Ten Gods Descriptions
    const enrichedTenGods = tenGods.map((entry) => ({
      ...entry,
      description: buildTenGodsNarrative({
        tenGod: entry.tenGod,
        pillar: entry.pillar,
        sourceMeaning: TEN_GODS_LOOKUP[entry.tenGod],
      })
    }));

    // Elements distribution calculation
    const elementsList: BaziElement[] = ["Wood", "Fire", "Earth", "Metal", "Water"];
    const sortedElements = [...elementsList].sort((a, b) => fiveElements[b] - fiveElements[a]);
    const maxCount = fiveElements[sortedElements[0]];

    // Identify dominant elements (count >= 2 and equals maxCount)
    const dominantElements = elementsList.filter((e) => fiveElements[e] === maxCount && maxCount >= 2);
    const weakElements = elementsList.filter((e) => fiveElements[e] <= 1);    // descriptive balance explanation (no prescription)
    const sElements = getSeed(blueprint, "ELEMENTS");
    let fiveElementsDescription = "Dalam tubuh energimu, aliran unsur-unsur membentuk keunikan tersendiri. ";

    if (dominantElements.length > 0) {
      const dominantDesc = dominantElements.map((e, idx) => {
        const sDom = sElements + idx;
        if (e === "Wood") {
          return selectOption([
            "daya dorong pertumbuhan bertahap yang kuat untuk merintis konsep jangka panjang",
            "ambisi alami untuk berkembang tegak dan menginisiasi gerakan baru di garis depan",
            "dorongan batiniah yang aktif untuk belajar, menyemai ide, dan merawat potensi tim"
          ], sDom);
        }
        if (e === "Fire") {
          return selectOption([
            "kobaran api semangat yang hangat untuk berekspresi dan menyatukan hubungan sosial",
            "antusiasme sosial yang terbuka, jujur, serta berani menyinari sekeliling secara vokal",
            "energi ekspresi kreatif yang memikat rasa dan menginspirasi perubahan positif kelompok"
          ], sDom);
        }
        if (e === "Earth") {
          return selectOption([
            "keteguhan batin dan rasa tanggung jawab membumi yang stabil untuk mengayomi sesama",
            "kedewasaan batin yang kokoh, realistis, dan menjadi penopang aman bagi sekitar",
            "kestabilan operasional yang konsisten, berakar nyata pada integritas janji membumi"
          ], sDom);
        }
        if (e === "Metal") {
          return selectOption([
            "disiplin internal yang presisi dan kejelasan struktur untuk membenahi kekacauan",
            "ketangguhan mental yang logis, adil, serta berani menegakkan batas profesional",
            "kejelian menyaring detail, menyederhanakan alur kerja, dan menyempurnakan kualitas"
          ], sDom);
        }
        return selectOption([
          "kedalaman intuisi dan keluwesan mengalir bebas untuk memetakan strategi visioner",
          "rasa ingin tahu konseptual yang luas, dinamis, serta pandai memecahkan kebuntuan",
          "ketenangan kontemplatif yang sunyi guna meriset dan menghubungkan berbagai jejaring"
        ], sDom);
      });

      const optionsDominant = [
        `Terdapat penekanan energi pada ${dominantDesc.join(" serta ")}, yang memberikan dorongan nyata dalam tindakanmu. `,
        `Kecenderungan energimu didukung kuat oleh perpaduan ${dominantDesc.join(" dan ")}, mewarnai respons harianmu secara jernih. `,
        `Fokus tenagamu berpusat secara alami pada ${dominantDesc.join(" serta ")}, memberikan fondasi karakter yang nyata. `
      ];
      fiveElementsDescription += selectOption(optionsDominant, sElements);
    } else {
      fiveElementsDescription += "Distribusi lima elemen dalam susunan kelahiranmu mengalir secara berimbang, memberikan keluwesan karakter yang dinamis dan adaptif menghadapi berbagai keadaan harian. ";
    }

    if (weakElements.length > 0) {
      const weakDesc = weakElements.map((e, idx) => {
        const sWeak = sElements + idx + 10;
        if (e === "Wood") {
          return selectOption([
            "ritme pertumbuhan bertahap hadir secara lebih samar, mengundangmu memupuk kesabaran proses",
            "kesadaran menyemai benih potensi secara sabar melengkapi jiwamu tanpa menuntut hasil instan",
            "proses belajar bertahap berjalan lebih sunyi, mengingatkanmu merawat benih batin secara tekun"
          ], sWeak);
        }
        if (e === "Fire") {
          return selectOption([
            "percikan ekspresi luar dan keceriaan hadir lebih teduh, menuntutmu memantik inspirasi secara sadar",
            "keberanian meluapkan keceriaan batin mengalir lebih halus, mengajakmu menyalakan semangat secara aktif",
            "pertukaran emosi terbuka terasa lebih ringan, memanggilmu sengaja berbagi kerentanan hangat"
          ], sWeak);
        }
        if (e === "Earth") {
          return selectOption([
            "kestabilan fisik dan rutinitas praktis terasa lebih ringan, memanggilmu sengaja menyusun jadwal teratur",
            "fondasi keamanan harian berjalan lebih dinamis, mengingatkanmu membangun kedisiplinan membumi",
            "keteguhan memegang rutinitas fisik mengalir lebih samar, mengundangmu menata kestabilan praktis"
          ], sWeak);
        }
        if (e === "Metal") {
          return selectOption([
            "penyederhanaan struktur batin berjalan lebih halus, mengingatkanmu melatih ketegasan batas diri",
            "kedisiplinan menegakkan batas pribadi berjalan lebih santai, menuntut kesadaran merapikan kekacauan",
            "ketegasan mengambil keputusan objektif mengalir lebih sunyi, memanggilmu menyaring detail secara presisi"
          ], sWeak);
        }
        return selectOption([
          "ketenangan kontemplatif mengalir secara sunyi, memintamu meluangkan waktu hening di tengah kesibukan",
          "kedalaman intuisi spiritual berjalan lebih tersembunyi, mengajakmu meluangkan waktu hening berkala",
          "arus perenungan sunyi hadir lebih teduh, memintamu beristirahat memulihkan getaran rasa batin"
        ], sWeak);
      });
      const optionsWeak = [
        `Di sisi lain, ${weakDesc.join(" dan ")} hadir sebagai daya dukung yang tenang dan perlu diundang masuk dengan perhatian sadar.`,
        `Sementara itu, ${weakDesc.join(" serta ")} melengkapi susunan elemenmu sebagai kualitas pendukung yang perlu dibangun perlahan.`,
        `Sebagai penyeimbang alami, ${weakDesc.join(" dan ")} mengalir secara halus, mengundangmu melatih kualitas tersebut secara membumi.`
      ];
      fiveElementsDescription += selectOption(optionsWeak, sElements + 1);
    }

    // The visible UI is a raw distribution report, not a useful-element
    // diagnosis. Preserve the legacy fields for compatibility, but expose
    // complete tie-aware groups with neutral presentation semantics.
    const minimumCount = Math.min(...elementsList.map((element) => fiveElements[element]));
    const maximumCount = Math.max(...elementsList.map((element) => fiveElements[element]));
    const leastPresentElements = elementsList.filter((element) => fiveElements[element] === minimumCount);
    const mostPresentElements = elementsList.filter((element) => fiveElements[element] === maximumCount);
    fiveElementsDescription = minimumCount === maximumCount
      ? "Sebaran elemen yang terlihat relatif seimbang di antara empat pilar kelahiranmu. Angka ini membantu melihat pola yang tampak, bukan menentukan elemen yang harus ditambah atau dikurangi."
      : `Bagian ini menunjukkan sebaran elemen yang terlihat pada empat pilar kelahiranmu. Elemen yang muncul lebih jarang adalah ${leastPresentElements.join(", ")}, sedangkan yang lebih sering terlihat adalah ${mostPresentElements.join(", ")}. Pembacaan ini belum menentukan elemen yang paling mendukung atau perlu dihindari karena kekuatan energi, musim kelahiran, dan hubungan antarelemen belum dihitung di sini.`;

    // Generate Strengths (No favorable elements used)
    const sStrengths = getSeed(blueprint, "STRENGTHS");
    const dmStrengths: Record<string, string[]> = {
      Jia: [
        "Gaya keputusanmu berorientasi pada visi masa depan yang jelas, mandiri, dengan ketahanan alami yang kokoh menghadapi badai kehidupan.",
        "Kamu memutuskan sesuatu dengan keteguhan prinsip jangka panjang, tangguh menjaga integritas di saat penuh tekanan.",
        "Gaya keputusanmu tegas memegang visi pertumbuhan diri, ditopang ketahanan mental yang tidak mudah patah."
      ],
      Yi: [
        "Kamu mengambil keputusan secara luwes dan taktis, dengan ketahanan batin yang cerdas dalam menyesuaikan diri dengan keadaan baru.",
        "Gaya keputusanmu adaptif membaca situasi sekitar, berpadu ketahanan batin yang bangkit lewat kolaborasi erat.",
        "Kamu memutuskan sesuatu secara fleksibel demi harmoni bersama, tangguh bertahan lewat kelenturan menyikapi badai."
      ],
      Bing: [
        "Gaya keputusanmu cepat dan didorong oleh optimisme alami yang hangat, dengan ketahanan yang lahir dari keyakinan kuat akan hari esok.",
        "Kamu mengambil keputusan secara spontan dan berani, didukung ketahanan batin yang bersinar menerangi arah kelompok.",
        "Gaya keputusanmu didorong antusiasme yang jujur, didukung ketahanan mental yang selalu melihat harapan baru."
      ],
      Ding: [
        "Kamu memutuskan sesuatu secara intuitif dan teliti, dengan ketahanan gigih yang sunyi dalam menjaga hal-hal kecil yang berharga.",
        "Gaya keputusanmu lahir dari perenungan detail dari hati ke hati, ditopang ketahanan sunyi yang sabar mengawal proses.",
        "Kamu memutuskan secara tenang berdasarkan nurani mendalam, memiliki ketangguhan batiniah menjaga amanah hidup."
      ],
      Wu: [
        "Keputusanmu diambil secara terukur dan bertanggung jawab, dengan ketahanan alami yang menjadi penopang stabil di kala krisis.",
        "Gaya keputusanmu mengutamakan keberlanjutan jangka panjang, ditopang ketahanan batin yang kokoh bagaikan bukit perlindungan.",
        "Kamu memutuskan secara pragmatis berdasarkan realitas nyata, tangguh meredam kekacauan sekitar secara konsisten."
      ],
      Ji: [
        "Kamu mengambil keputusan secara praktis dan membumi, dengan ketahanan sabar yang mengutamakan kelangsungan proses bertumbuh.",
        "Gaya keputusanmu mengutamakan kenyamanan bersama kelompok, ditopang ketahanan memelihara benih potensi secara tekun.",
        "Kamu memutuskan secara nyata demi harmoni harian, tangguh mendampingi proses tumbuh kembang sekitar secara membumi."
      ],
      Geng: [
        "Gaya keputusanmu tegas, langsung pada sasaran, dengan ketahanan mental yang tangguh menghadapi rintangan besar.",
        "Kamu memutuskan sesuatu secara logis dan objektif, memiliki ketangguhan mental melakukan pembenahan terstruktur.",
        "Gaya keputusanmu jernih tanpa bias emosi, ditopang keberanian menertibkan situasi kacau secara profesional."
      ],
      Xin: [
        "Kamu memutuskan sesuatu secara presisi dan terukur demi kualitas terbaik, dengan ketahanan elegan yang menolak kompromi murahan.",
        "Gaya keputusanmu tajam mengutamakan nilai keaslian, ditopang ketahanan elegan yang menjaga standar kehormatan diri.",
        "Kamu memutuskan secara kritis demi hasil akhir yang sempurna, tangguh memproses tantangan lewat penyaringan logika."
      ],
      Ren: [
        "Gaya keputusanmu visioner dan mengalir mengikuti arah peluang, dengan ketahanan dinamis yang mengubah hambatan menjadi rute baru.",
        "Kamu memutuskan secara dinamis melihat gambaran besar, ditopang ketahanan mengalir luwes menembus rintangan kaku.",
        "Gaya keputusanmu taktis merangkul berbagai kemungkinan luas, tangguh beradaptasi dengan dinamika keadaan baru."
      ],
      Gui: [
        "Keputusanmu lahir dari kedalaman intuisi yang peka membaca suasana, dengan ketahanan tekun yang perlahan mengatasi kesulitan.",
        "Gaya keputusanmu dibimbing bisikan nurani yang tenang, ditopang ketangguhan sunyi mengikis batu keras kehidupan.",
        "Kamu memutuskan langkah secara halus menyikapi dinamika batin, memiliki ketekunan batiniah yang mengalir memulihkan sekitar."
      ]
    };

    let elementStrength = "Perpaduan energi unsur yang seimbang memberikan fleksibilitas kepemimpinan yang tinggi, membuatmu mampu berkontribusi secara luwes dalam berbagai situasi.";
    if (dominantElements.length > 0) {
      const e = dominantElements[0];
      const optWood = [
        "Kepemimpinanmu berciri membimbing; kamu berkontribusi dalam merancang ruang tumbuh yang menginspirasi kemandirian sesama.",
        "Gaya memimpinmu mendidik secara sabar; kamu berkontribusi menyemai inisiatif baru yang menginspirasi kemajuan tim.",
        "Kamu berkontribusi membimbing potensi batin sekitar, memimpin dengan fokus jangka panjang yang konsisten."
      ];
      const optFire = [
        "Kontribusimu adalah menyalakan semangat tim; gaya memimpinmu hangat, komunikatif, dan menyatukan berbagai perbedaan.",
        "Kepemimpinanmu berciri ekspresif dan komunikatif; berkontribusi membawa antusiasme segar ke dalam kelompok.",
        "Kamu memimpin dengan menyebarkan visi hangat secara terbuka, berkontribusi menyatukan perbedaan pendapat secara harmonis."
      ];
      const optEarth = [
        "Kamu berkontribusi menstabilkan kekacauan; memimpin secara tenang, mengayomi, dan memberikan rasa aman yang konsisten.",
        "Kepemimpinanmu membumi dan mengayomi; berkontribusi menjaga kepastian harian dan sistem penopang organisasi.",
        "Kamu memimpin sebagai benteng kestabilan tim, berkontribusi membangun rasa aman jangka panjang secara nyata."
      ];
      const optMetal = [
        "Gaya memimpinmu berfokus pada kedisiplinan dan standar tinggi; berkontribusi menata kerapian struktur batin.",
        "Kepemimpinanmu berciri terstruktur dan efisien; berkontribusi menyederhanakan alur kerja yang rumit secara logis.",
        "Kamu berkontribusi menyempurnakan kualitas kerja kelompok, memimpin dengan disiplin internal yang jernih."
      ];
      const optWater = [
        "Kamu memimpin lewat pengaruh luwes dan visi strategis, menghubungkan jejaring dan memetakan pola-pola masa depan.",
        "Kepemimpinanmu bekerja secara strategis di balik layar; berkontribusi memetakan gambaran besar konseptual.",
        "Kamu memimpin melalui keluwesan mengalirkan ide, berkontribusi memperluas kolaborasi jejaring sosial secara cerdas."
      ];

      if (e === "Wood") elementStrength = selectOption(optWood, sStrengths);
      else if (e === "Fire") elementStrength = selectOption(optFire, sStrengths);
      else if (e === "Earth") elementStrength = selectOption(optEarth, sStrengths);
      else if (e === "Metal") elementStrength = selectOption(optMetal, sStrengths);
      else if (e === "Water") elementStrength = selectOption(optWater, sStrengths);
    }

    const tenGodStrengths: Record<string, string[]> = {
      Friend: [
        "Keberanianmu untuk mandiri dan memegang teguh prinsip hidup menginspirasi sekeliling untuk lebih percaya diri.",
        "Keteguhanmu berdiri di atas kaki sendiri menjadi teladan kemandirian bagi rekan sekitarmu."
      ],
      "Rob Wealth": [
        "Kemampuan sosialmu yang karismatik mempermudahmu dalam memimpin kelompok dan membaca arah motivasi sekitar.",
        "Keluwesan sosialmu membantu menyatukan kolaborasi tim kerja secara menyenangkan."
      ],
      "Eating God": [
        "Gagasan kreatifmu mengalir secara murni, membawa ketulusan rasa yang memulihkan dan menenangkan suasana.",
        "Daya kreasi murnimu melahirkan solusi inovatif secara tenang tanpa paksaan luar."
      ],
      "Hurting Officer": [
        "Kecerdasan komunikasimu yang tajam dan persuasif membantumu menyuarakan kebenaran inovatif secara berani.",
        "Kekuatan bicaramu yang memikat mempermudah penyampaian ide baru di depan umum."
      ],
      "Indirect Wealth": [
        "Kejelianmu melihat peluang finansial dan bisnis membuatmu tangkas dalam merancang strategi perputaran nilai.",
        "Ketangkasanmu membaca tren masa depan memberikan arah pengembangan usaha secara jernih."
      ],
      "Direct Wealth": [
        "Keandalan harianmu luar biasa, tekun membangun fondasi finansial secara bertahap dan membumi.",
        "Kedisiplinanmu mengelola aset harian memastikan keberlanjutan hidup jangka panjang secara teratur."
      ],
      "Seven Killings": [
        "Ketahanan mentalmu di bawah tekanan melahirkan kepemimpinan yang teguh melindungi orang-orang di sekitarmu.",
        "Kekuatan kepemimpinanmu teruji saat mengawal keputusan penting dalam situasi yang menantang."
      ],
      "Direct Officer": [
        "Keteladanan etis dan tanggung jawabmu membantu menjaga sistem kerja tetap adil dan tertib.",
        "Kedewasaan sikapmu memelihara keadilan organisasi agar selaras dengan integritas bersama."
      ],
      "Indirect Resource": [
        "Kepekaan intuitif dan cara berpikir nonkonvensional membantumu menyingkap pola penting yang terlewatkan.",
        "Ketajaman analisismu mendeteksi nuansa tersirat, menghasilkan terobosan berpikir yang orisinal."
      ],
      "Direct Resource": [
        "Keluasan wawasan dan komitmenmu merawat pengetahuan menjadikannya rujukan yang tepercaya bagi rekan kerja.",
        "Kearifan sikapmu menenangkan tim dan membantu mereka mengambil keputusan dengan pertimbangan matang."
      ]
    };
    const primaryTenGod = tenGods[0]?.tenGod || "Friend";
    const tenGodStrength = selectOption(tenGodStrengths[primaryTenGod] || ["Memiliki keunikan karakter yang mewarnai bakat kepemimpinanmu."], sStrengths);

    const strengths = [
      selectOption(dmStrengths[dayMasterPinyin] || ["Gaya keputusanmu berorientasi pada kemandirian batin harian."], sStrengths),
      elementStrength,
      tenGodStrength
    ];

    // Generate Challenges (No favorable elements)
    const sChallenges = getSeed(blueprint, "CHALLENGES");
    const dmChallenges: Record<string, string[]> = {
      Jia: [
        "Kecenderungan bersikap kaku dan enggan berbelok arah ketika rencana bergeser, serta kebiasaan memikul beban sendirian karena enggan terlihat rapuh.",
        "Sikap enggan berkompromi saat menghadapi perubahan mendadak, berpadu kebiasaan menahan beban sendirian tanpa suara.",
        "Kekakuan menuntut kemandirian prinsip hidup, yang jika berlebih membuat jiwamu keletihan memikul beban tanggung jawab."
      ],
      Yi: [
        "Keraguan saat harus berdiri mandiri tanpa dukungan sekitar, serta kebiasaan membiarkan diri hanyut dalam dinamika suasana hati lingkungan.",
        "Kecenderungan bergantung terlalu kuat pada persetujuan luar, berpadu kebiasaan menyerap ketegangan rasa sekeliling.",
        "Ketakutan mengambil inisiatif mandiri di kala krisis, rentan menyelaraskan diri berlebih hingga kehilangan pegangan jati diri."
      ],
      Bing: [
        "Tuntutan batin untuk terus terlihat bersemangat di depan umum, yang rentan menutupi keletihan emosional dan memicu kejenuhan mendadak.",
        "Kebiasaan mengabaikan keletihan diri demi panggung luar, memicu ledakan kejenuhan emosional secara tiba-tiba.",
        "Dorongan mengekspresikan gairah secara berlebih tanpa jeda teduh, rentan membakar habis cadangan stamina batinmu."
      ],
      Ding: [
        "Kebiasaan memendam kekhawatiran secara mendalam hingga menciptakan jarak, serta ketakutan batin bahwa ketulusanmu tidak dihargai setara.",
        "Kecenderungan mencurigai motif tersembunyi relasi, berpadu kebiasaan menarik diri ke kesunyian dingin saat kecewa.",
        "Kebiasaan memendam kekecewaan secara sunyi batin, rentan menciptakan jarak relasi yang menyulitkan komunikasi terbuka."
      ],
      Wu: [
        "Keengganan keluar dari zona aman yang sudah stabil, serta kecenderungan menyimpan beban rasa hingga mengeras menjadi sikap dingin.",
        "Kekakuan menolak perubahan sistem kerja lama, berpadu kebiasaan memendam ketidakpuasan rasa hingga membeku.",
        "Kecenderungan mempertahankan benteng pertahanan kaku, menyulitkan aliran pengalaman baru masuk menyegarkan jiwa."
      ],
      Ji: [
        "Kecenderungan mencemaskan kebutuhan sekitar secara berlebihan, serta rasa bersalah batin ketika mencoba menetapkan batasan diri yang sehat.",
        "Kesulitan berkata tidak demi keharmonisan semu, membiarkan tanah jiwamu keletihan merawat potensi luar tanpa jeda.",
        "Rasa bersalah yang menghantui saat memprioritaskan diri sendiri, rentan membuat tenagamu habis terkuras sepihak."
      ],
      Geng: [
        "Sikap terlalu menuntut kejelasan yang bisa berubah menjadi kritik tajam, serta kebiasaan meredam kerapuhan dengan bersikap keras.",
        "Ketidaksabaran menyikapi lambatnya proses bertumbuh sekitar, rentan meluapkan kritik tajam yang melukai rasa.",
        "Kebiasaan memendam kerapuhan emosional dengan bersikap tegar kaku, menyulitkan terjalinnya kedekatan personal yang hangat."
      ],
      Xin: [
        "Standar kesempurnaan diri yang terlalu tinggi sehingga memicu kritik internal destruktif, serta kecenderungan menarik diri saat kecewa.",
        "Kritik batiniah yang terlalu keras terhadap retakan proses diri, berpadu kecenderungan menjauh secara dingin.",
        "Keengganan berkolaborasi akibat standar kualitas luar yang dianggap kurang bernilai, rentan memicu kesepian batin."
      ],
      Ren: [
        "Dorongan untuk terus bergerak dinamis yang jika tidak terarah bisa memicu kebingungan, serta kecenderungan menghindari konflik dengan hanyut.",
        "Kebiasaan melarikan diri dari komitmen erat saat suasana memanas, rentan membiarkan perhatian batinmu tersebar luas.",
        "Kecenderungan hanyut mengikuti arus peluang luar tanpa wadah disiplin, memicu kebingungan arah jangka panjang."
      ],
      Gui: [
        "Sensitivitas emosional yang tinggi sehingga mudah kewalahan oleh konflik luar, serta kebiasaan lari ke ruang imajinasi saat kenyataan terasa berat.",
        "Keraguan diri yang mendalam menghambat eksekusi nyata, berpadu kebiasaan menyerap ketegangan rasa sekeliling secara instan.",
        "Kebiasaan melarikan diri ke kedalaman kontemplatif saat gesekan memanas, menunda tindakan praktis menyelesaikan masalah."
      ]
    };

    let elementOveruse = "Perhatian batin yang tersebar karena mencoba menyeimbangkan terlalu banyak peran sekaligus, sehingga sulit menemukan jangkar kedamaian.";
    if (dominantElements.length > 0) {
      const e = dominantElements[0];
      const optWood = [
        "Kecenderungan memaksakan target perkembangan diri secara berlebihan hingga lupa menikmati ketenangan proses saat ini.",
        "Kebiasaan menuntut pertumbuhan batin instan, memicu ketegangan mental akibat kurang menghargai waktu jeda bertahap."
      ];
      const optFire = [
        "Kebiasaan mengekspresikan energi secara berlebihan demi menjaga getaran semangat kelompok, hingga menguras habis daya batin sendiri.",
        "Dorongan menjaga keceriaan kelompok secara berlebih, rentan melelahkan batin akibat terus memancarkan energi luar."
      ];
      const optEarth = [
        "Kecenderungan terlalu gigih melindungi kenyamanan rutinitas lama, sehingga menutup jalan bagi aliran perubahan baru.",
        "Kekakuan mempertahankan stabilitas hidup lama, menghambat masuknya pembaruan ide segar yang dibutuhkan jiwamu."
      ];
      const optMetal = [
        "Penerapan disiplin dan tuntutan standar keteraturan yang terlampau ketat, sehingga memicu ketegangan relasi.",
        "Kecenderungan memaksakan struktur logis kaku pada keadaan batin, memicu jarak emosional dengan orang sekitar."
      ];
      const optWater = [
        "Kebiasaan terlalu lama tenggelam dalam perenungan sunyi atau analisis konsep, sehingga menunda eksekusi nyata.",
        "Kecenderungan hanyut dalam pemetaan teori luas, rentan menunda tindakan praktis menyikapi peluang harian."
      ];

      if (e === "Wood") elementOveruse = selectOption(optWood, sChallenges);
      else if (e === "Fire") elementOveruse = selectOption(optFire, sChallenges);
      else if (e === "Earth") elementOveruse = selectOption(optEarth, sChallenges);
      else if (e === "Metal") elementOveruse = selectOption(optMetal, sChallenges);
      else if (e === "Water") elementOveruse = selectOption(optWater, sChallenges);
    }

    let weakElementChallenge = "Pentingnya menata batas energi agar tidak tersebar ke terlalu banyak arah secara bersamaan.";
    if (weakElements.length > 0) {
      const e = weakElements[0];
      const optWood = [
        "Melatih kesabaran untuk menyusun pertumbuhan karakter secara perlahan, alih-alih terburu-buru menuntut hasil instan.",
        "Perlu secara sadar menyemai kesabaran batin, membiasakan diri bertumbuh secara bertahap tanpa paksaan."
      ];
      const optFire = [
        "Keberanian memantik kembali kegembiraan batin dan mengekspresikan perasaan secara terbuka dan hangat kepada dunia luar.",
        "Mengundang kembali keceriaan dan ekspresi luar secara hangat, menyeimbangkan kesunyian batin yang terlampau dingin."
      ];
      const optEarth = [
        "Membangun disiplin rutinitas harian yang stabil guna menjaga kesehatan fisik dan keselarasan batin.",
        "Sengaja merancang struktur aktivitas praktis yang stabil demi memberi rasa aman membumi bagi jiwamu."
      ];
      const optMetal = [
        "Belajar menyederhanakan kompleksitas pemikiran serta berani mengambil keputusan tegas di saat ketidakpastian.",
        "Melatih ketegasan membatasi diri dan menyaring detail logis, meredakan kerumitan pemikiran batiniah."
      ];
      const optWater = [
        "Meluangkan waktu untuk hening sejenak demi mendengarkan intuisi dan memulihkan energi batin yang lelah.",
        "Mengizinkan jiwamu hening berkala demi mendengar getaran intuisi, memulihkan keletihan emosional luar."
      ];

      if (e === "Wood") weakElementChallenge = selectOption(optWood, sChallenges + 1);
      else if (e === "Fire") weakElementChallenge = selectOption(optFire, sChallenges + 1);
      else if (e === "Earth") weakElementChallenge = selectOption(optEarth, sChallenges + 1);
      else if (e === "Metal") weakElementChallenge = selectOption(optMetal, sChallenges + 1);
      else if (e === "Water") weakElementChallenge = selectOption(optWater, sChallenges + 1);
    }

    const challenges = [
      selectOption(dmChallenges[dayMasterPinyin] || ["Kecenderungan menahan ketegangan rasa batin secara mandiri."], sChallenges),
      elementOveruse,
      weakElementChallenge
    ];

    // Generate Career Style (work rhythm, leadership, collaboration, contribution, learning)
    const sCareer = getSeed(blueprint, "CAREER");
    const dmCareerRhythms: Record<string, string[]> = {
      Jia: [
        "Ritme kerjamu digerakkan oleh target jangka panjang; kamu membutuhkan lingkungan yang menghargai inisiatif, memberi ruang untuk bertumbuh secara vertikal, dan minim mikro-manajemen.",
        "Kamu bekerja secara terarah mengawal inisiatif jangka panjang, berkembang pesat dalam ruang profesional yang membebaskan visi perkembangnmu."
      ],
      Yi: [
        "Ritme kerjamu sangat adaptif dan berjejaring; kamu berkembang pesat dalam lingkungan kolaboratif yang mengutamakan keluwesan sosial dan pertukaran ide yang dinamis.",
        "Kamu berkembang dalam iklim kerja yang menuntut keluwesan berjejaring sosial, menyukai proses belajar bersama tim."
      ],
      Bing: [
        "Ritme kerjamu penuh semangat dan inisiatif awal yang kuat; kamu membutuhkan ruang kerja yang ekspresif, menuntut komunikasi terbuka, serta memberi panggung untuk membagikan visimu.",
        "Kamu bekerja dengan energi permulaan yang tinggi, membutuhkan lingkungan yang menuntut keterbukaan berekspresi dan komunikasi publik."
      ],
      Ding: [
        "Ritme kerjamu teliti, mendalam, dan fokus pada detail; kamu paling produktif dalam lingkungan yang tenang, menuntut fokus personal, serta menghargai dedikasi batin yang konsisten.",
        "Kamu berkembang pesat pada ruang kerja yang menawarkan ketenangan batin, menyelesaikan tugas-tugas rumit secara fokus dan detail."
      ],
      Wu: [
        "Ritme kerjamu stabil, teratur, dan dapat diandalkan; kamu berkembang dalam lingkungan yang membutuhkan pengelolaan aset jangka panjang, struktur organisasi yang jelas, serta rasa aman yang kokoh.",
        "Kamu bekerja secara mantap menjaga stabilitas operasional, menyukai iklim kerja terencana yang mengutamakan keamanan jangka panjang."
      ],
      Ji: [
        "Ritme kerjamu merawat, praktis, dan berorientasi pada penyelesaian nyata; kamu tumbuh subur dalam lingkungan kerja yang bersifat mendukung perkembangan sesama serta mengutamakan harmoni tim.",
        "Kamu bekerja secara praktis mendampingi kemajuan rekan tim, berkembang subur pada iklim kerja yang berciri memelihara."
      ],
      Geng: [
        "Ritme kerjamu terstruktur, disiplin, dan berorientasi pada pembenahan; kamu membutuhkan lingkungan yang menuntut keputusan tegas, efisiensi tinggi, serta standar profesionalisme yang jernih.",
        "Kamu bekerja secara disiplin merapikan kekacauan, produktif pada lingkungan yang menuntut standar profesional objektif."
      ],
      Xin: [
        "Ritme kerjamu presisi, berkualitas, dan memperhatikan detail estetika; kamu berkembang dalam lingkungan yang menghargai keahlian khusus, karya bernilai tinggi, serta kebebasan berkarya tanpa gangguan.",
        "Kamu bekerja dengan standar keahlian tinggi demi hasil berkualitas, produktif pada ruang kerja yang bersih dari kekacauan."
      ],
      Ren: [
        "Ritme kerjamu dinamis, strategis, dan senang memetakan arah baru; kamu membutuhkan ruang kerja yang menawarkan mobilitas tinggi, tantangan konseptual yang luas, serta kebebasan bereksplorasi.",
        "Kamu berkembang dalam iklim kerja yang menawarkan mobilitas luas, senang memetakan gagasan visioner secara dinamis."
      ],
      Gui: [
        "Ritme kerjamu intuitif, tenang, dan digerakkan oleh panggilan batin; kamu produktif dalam lingkungan yang selaras dengan nilai kemanusiaan, menuntut sensitivitas mendalam, serta memberi keheningan untuk merenung.",
        "Kamu bekerja secara tenang dibimbing nurani tulus, produktif dalam ruang profesional yang mendukung nilai sosial kemanusiaan."
      ]
    };
    const careerRhythm = selectOption(dmCareerRhythms[dayMasterPinyin] || ["Menyukai fleksibilitas kerja yang memberimu kebebasan merancang proses secara mandiri."], sCareer);

    const polarityCareers = {
      Yang: [
        "Dalam kerja tim, kamu cenderung mengambil inisiatif secara langsung dan berorientasi pada hasil nyata. Gaya memimpinmu lugas dan proaktif membawa kejelasan arah, dengan catatan tetap meluangkan ruang mendengarkan masukan rekan.",
        "Saat berkolaborasi, kamu tampil sebagai penggerak yang berani memikul tanggung jawab di depan. Kamu memimpin dengan komunikasi terbuka dan mengutamakan ketepatan eksekusi.",
        "Gaya kerjamu asertif dan menyukai ritme yang jelas; kamu mendorong kemajuan proyek secara aktif sambil menjaga agar beban kerja terdistribusi secara seimbang."
      ],
      Yin: [
        "Dalam kerja tim, kamu berperan sebagai perekat hubungan yang peka terhadap keselarasan proses. Gaya memimpinmu mengayomi dan persuasif, mampu mengarahkan potensi rekan kerja tanpa perlu memaksakan kehendak.",
        "Saat berkolaborasi, kekuatanmu ada pada ketelatenan mendengarkan dan merawat iklim kerja yang kondusif. Kamu memimpin lewat keteladanan tenang dan pendekatan personal yang suportif.",
        "Gaya kerjamu diplomatis dan adaptif; kamu menonjol sebagai fasilitator yang menjembatani perbedaan gagasan menjadi kesepakatan bersama yang solid."
      ]
    };
    const polarityCareer = selectOption(polarityCareers[dayMasterPolarity] || [""], sCareer + 1);

    let elementCareer = "Kontribusimu sangat fleksibel di berbagai bidang, belajar dengan cara memadukan gagasan konseptual dengan tindakan nyata.";
    if (dominantElements.length > 0) {
      const e = dominantElements[0];
      const optWood = [
        "Kontribusimu terletak pada penyusunan konsep pengembangan jangka panjang, belajar dengan cara bereksperimen langsung.",
        "Kamu berkontribusi merancang program pertumbuhan bertahap tim, menyerap wawasan baru lewat praktik aktif harian."
      ];
      const optFire = [
        "Kontribusimu bersinar dalam seni ekspresi dan komunikasi visual, belajar melalui pertukaran ide kreatif yang dinamis.",
        "Kamu berkontribusi menghidupkan antusiasme tim secara komunikatif, belajar lewat diskusi inspiratif."
      ];
      const optEarth = [
        "Kontribusimu adalah membangun sistem operasional yang stabil dan aman, belajar lewat pembuktian praktis yang nyata.",
        "Kamu berkontribusi mengamankan sistem penopang organisasi secara terencana, belajar efektif melalui contoh konkret."
      ];
      const optMetal = [
        "Kontribusimu terasa dalam merapikan kekacauan menjadi efisiensi teratur, belajar melalui analisis mendalam yang presisi.",
        "Kamu berkontribusi menyaring detail logis demi standar kualitas tertinggi, belajar secara analitis."
      ];
      const optWater = [
        "Kontribusimu berupa pemetaan strategi konseptual dan riset, belajar lewat eksplorasi sunyi dan perenungan mendalam.",
        "Kamu berkontribusi memetakan gambaran besar konseptual secara strategis, belajar lewat observasi tenang."
      ];

      if (e === "Wood") elementCareer = selectOption(optWood, sCareer + 2);
      else if (e === "Fire") elementCareer = selectOption(optFire, sCareer + 2);
      else if (e === "Earth") elementCareer = selectOption(optEarth, sCareer + 2);
      else if (e === "Metal") elementCareer = selectOption(optMetal, sCareer + 2);
      else if (e === "Water") elementCareer = selectOption(optWater, sCareer + 2);
    }
    const careerStyle = `${careerRhythm} ${polarityCareer} ${elementCareer}`;

    // Generate Relationship Style (trust, intimacy, communication, emotional rhythm, conflict style)
    const sRel = getSeed(blueprint, "RELATIONSHIP");
    const dmRelationshipStyles: Record<string, string[]> = {
      Jia: [
        "Dalam relasi dekat, kamu berkomitmen bagaikan pelindung yang setia, menghargai kejujuran mutlak, serta mengekspresikan kedekatan dengan mendukung perkembangan impian pasangan secara nyata.",
        "Kedekatan bagimu terjalin lewat komitmen perlindungan setia, mendampingi impian pribadi pasangan tumbuh nyata."
      ],
      Yi: [
        "Gaya kedekatanmu penuh perhatian dan bersandar pada kebersamaan; kamu mengekspresikan keintiman melalui sentuhan kata yang halus serta kelenturan untuk selalu menemani pasangan di setiap dinamika.",
        "Keintiman bagimu terpelihara lewat pendampingan yang luwes, menyentuh rasa pasangan lewat kebersamaan hangat."
      ],
      Bing: [
        "Kamu mencintai dengan hangat dan penuh gairah ekspresif; keintiman bagimu adalah berbagi keceriaan hidup secara terbuka, petualangan bersama, serta saling menginspirasi mimpi besar.",
        "Cintamu memancar hangat secara terbuka, menyukai keintiman berupa pertukaran antusiasme dan petualangan bersama."
      ],
      Ding: [
        "Gaya kedekatanmu mendalam, privat, dan penuh dedikasi; keintiman bagimu dibangun melalui obrolan sunyi dari hati ke hati di ruang yang tenang serta kepekaan batin yang saling memahami tanpa kata.",
        "Keintiman sejati bagimu terwujud lewat obrolan sunyi dari hati ke hati, merawat ikatan batin secara personal."
      ],
      Wu: [
        "Kamu memberikan rasa aman yang kokoh dan perlindungan tanpa pamrih; keintiman bagimu adalah kehadiran yang konsisten, kenyamanan rutinitas bersama, serta janji setia yang tidak mudah goyah.",
        "Kamu merawat kedekatan lewat jaminan kenyamanan harian dan rasa aman yang kokoh tak tergoyahkan badai."
      ],
      Ji: [
        "Gaya kedekatanmu merawat dan penuh penerimaan; kamu memupuk keintiman dengan bersikap peka terhadap kebutuhan harian pasangan, mendengarkan keluh kesahnya, serta menciptakan rumah batin yang hangat.",
        "Keintiman bagimu dirawat lewat kepekaan rasa menyikapi kebutuhan pasangan, menyemai penerimaan yang tulus."
      ],
      Geng: [
        "Kamu mengekspresikan cinta lewat perlindungan yang kuat dan kejujuran tanpa topeng; keintiman bagimu terjalin saat ada rasa hormat timbal balik terhadap kemandirian dan integritas masing-masing.",
        "Keintiman bagimu tegak berdiri saat kejujuran tanpa topeng berpadu rasa hormat penuh atas otonomi pasangan."
      ],
      Xin: [
        "Gaya kedekatanmu elegan, selektif, dan menghargai apresiasi tulus; keintiman bagimu adalah ruang berkualitas yang bebas dari kekasaran, di mana keunikan dirimu dihargai sepenuhnya oleh pasangan.",
        "Keintiman bagimu menuntut kualitas ruang relasi yang indah, merasa dicintai lewat apresiasi tulus atas standar nilaimu."
      ],
      Ren: [
        "Kamu mencintai dengan jiwa yang merdeka dan dinamis; keintiman bagimu adalah kebebasan untuk tetap tumbuh dan menjelajah bersama, didukung oleh ruang diskusi gagasan yang tak bertepi.",
        "Cintamu memberi kebebasan tumbuh bagi pasangan, menyukai keintiman berupa penjelajahan visi hidup bersama."
      ],
      Gui: [
        "Gaya kedekatanmu sangat intuitif dan menyatu secara emosional; keintiman bagimu adalah keterikatan batin yang mendalam, empati yang tulus, serta kemampuan untuk saling memulihkan luka rasa.",
        "Keintiman bagimu terjalin lewat empati batiniah mendalam, peka memulihkan luka rasa pasangan secara sunyi."
      ]
    };
    const relationshipIntimacy = selectOption(dmRelationshipStyles[dayMasterPinyin] || ["Relasi bagimu adalah perjalanan batin yang menuntut rasa saling menghargai kemandirian masing-masing."], sRel);

    const polarityRels = {
      Yang: [
        "Gaya komunikasimu terbuka dan langsung pada pokok persoalan. Ketika terjadi perbedaan pandangan, kamu memilih membicarakannya tanpa menunda demi kejernihan hubungan, sambil tetap menjaga agar penyampaianmu ramah bagi pasangan.",
        "Kamu menyampaikan pikiran secara transparan dan lugas. Menghadapi dinamika relasi, kamu fokus mencari solusi nyata agar rasa saling percaya tetap terjaga utuh.",
        "Dalam percakapan dekat, kamu mengutamakan kejujuran yang sehat dan kejelasan komitmen, seraya memberi ruang bagi pasangan untuk mencerna perasaannya."
      ],
      Yin: [
        "Gaya komunikasimu halus dan penuh pertimbangan. Ketika menghadapi ketegangan, kamu cenderung meredakan suasana terlebih dahulu sebelum mendiskusikan inti masalah secara tenang dan penuh empati.",
        "Kamu berkomunikasi dengan kepekaan rasa dan sentuhan personal. Saat ada selisih paham, kamu mendengarkan dengan saksama demi memahami sudut pandang pasangan secara utuh.",
        "Dalam relasi dekat, kamu mengutamakan kenyamanan emosional dan pendekatan yang tidak menghakimi, merawat keharmonisan lewat kesediaan untuk saling memahami."
      ]
    };
    const polarityRel = selectOption(polarityRels[dayMasterPolarity] || [""], sRel + 1);

    let elementRel = "Kepercayaan bagimu tumbuh melalui kesediaan untuk saling mendukung proses perkembangan karakter secara konsisten dari waktu ke waktu.";
    if (dominantElements.length > 0) {
      const e = dominantElements[0];
      const optWood = [
        "Rasa percaya dalam dirimu terpelihara lewat komitmen mendukung inisiatif baru pasangan secara antusias.",
        "Kepercayaan terjalin erat saat ada usaha bersama merancang rencana pertumbuhan batin jangka panjang."
      ];
      const optFire = [
        "Rasa percaya terpelihara lewat keterbukaan emosi yang hangat serta kejujuran berbagi kerentanan batin tanpa takut dihakimi.",
        "Kepercayaan bagimu menuntut transparansi rasa batin, dicintai secara utuh apa adanya tanpa topeng."
      ];
      const optEarth = [
        "Kamu membangun rasa percaya di atas landasan tindakan nyata yang konsisten, kepastian harian, serta keselarasan janji.",
        "Rasa percaya dalam dirimu tumbuh subur seiring kepastian kehadiran nyata pasangan secara membumi."
      ];
      const optMetal = [
        "Rasa percaya tegak berdiri di atas integritas yang jernih, kejelasan komitmen, serta kesediaan menghormati batasan pribadi.",
        "Rasa percaya bagimu terawat saat ada kejujuran moral mutlak dan saling mematuhi kesepakatan tertulis."
      ];
      const optWater = [
        "Rasa percaya terjalin erat ketika ada ruang perenungan yang sunyi untuk memahami kedalaman batin masing-masing.",
        "Rasa percaya tumbuh tenang saat ada kesunyian yang saling memahami tanpa praduga emosional terburu-buru."
      ];

      if (e === "Wood") elementRel = selectOption(optWood, sRel + 2);
      else if (e === "Fire") elementRel = selectOption(optFire, sRel + 2);
      else if (e === "Earth") elementRel = selectOption(optEarth, sRel + 2);
      else if (e === "Metal") elementRel = selectOption(optMetal, sRel + 2);
      else if (e === "Water") elementRel = selectOption(optWater, sRel + 2);
    }
    const relationshipStyle = `${relationshipIntimacy} ${polarityRel} ${elementRel}`;

    // Generate Money Style (value, opportunities, sustainability, resource rhythm) (No favorable elements used)
    const sMoney = getSeed(blueprint, "MONEY");
    const dmMoneyStyles: Record<string, string[]> = {
      Jia: [
        "Kemakmuran bagimu berfungsi sebagai sarana memperluas dampak dan membangun landasan masa depan; nilai finansial diarahkan untuk menopang pertumbuhan jangka panjang.",
        "Kamu memaknai pengelolaan sumber daya sebagai instrumen perkembangan nyata, menyalurkan dana untuk menopang inisiatif jangka panjang."
      ],
      Yi: [
        "Pengelolaan nilai bergerak melalui kejelian membaca momentum pasar dan merajut kolaborasi; rezeki mengalir subur lewat keluwesan beradaptasi serta jejaring yang sehat.",
        "Arah finansialmu terkait erat dengan keluwesan membaca kebutuhan sosial, memutar nilai lewat kemitraan kerja yang saling menguntungkan."
      ],
      Bing: [
        "Finansial bagimu adalah energi yang mengalir untuk menggerakkan proyek visioner; nilai terbaik diraih saat dana dipakai memperluas manfaat nyata bagi banyak orang.",
        "Kamu memandang perputaran materi sebagai sarana berbagi manfaat luas, menemukan kepuasan saat proyek yang kamu jalankan membawa dampak sosial yang terang."
      ],
      Ding: [
        "Pengelolaan rezeki berkaitan erat dengan penguasaan keahlian khusus dan ketekunan terarah; nilai bertumbuh melalui dedikasi pada detail berkualitas tinggi.",
        "Kemakmuran bagimu mengalir lewat penguasaan keahlian mendalam, merawat kelangsungan finansial melalui ketelitian yang konsisten."
      ],
      Wu: [
        "Dasar kemakmuranmu bertumpu pada kestabilan aset fisik dan kehati-hatian mengelola sumber daya; nilai finansial diwujudkan dalam keamanan jangka panjang yang terukur.",
        "Kepemilikan aset yang aman dan pengelolaan anggaran yang tertib menjadi fondasi utama ketahanan finansialmu."
      ],
      Ji: [
        "Kapasitas finansialmu bertumbuh lewat usaha yang bersifat merawat dan memelihara; nilai diwujudkan melalui ketelatenan mengelola modal secara bertahap hingga membuahkan hasil stabil.",
        "Rezeki bagimu berakar pada kegiatan yang memupuk kesejahteraan tim dan keluarga, menyemai kemakmuran secara tekun dan sabar."
      ],
      Geng: [
        "Kekuatan finansialmu dibangun lewat kedisiplinan kerja dan efisiensi sistem; nilai uang dioptimalkan melalui pengelolaan yang bersih, transparan, dan terstruktur ketat.",
        "Kemakmuran bagimu dicapai lewat ketegasan menertibkan pos pengeluaran, menuntut efisiensi tinggi tanpa pemborosan yang tidak perlu."
      ],
      Xin: [
        "Kemakmuran bagimu mencerminkan apresiasi atas keahlian terasah dan karya bernilai tinggi; sumber daya dikelola untuk mempertahankan standar mutu dan integritas profesional.",
        "Rezeki bagimu melambangkan hasil karya yang bernilai tinggi, mengalokasikan dana secara selektif demi menjaga mutu hidup terbaik."
      ],
      Ren: [
        "Perputaran rezekimu bergerak dinamis dalam skala luas; nilai finansial dioptimalkan melalui keberanian menjelajahi jalur baru, perputaran modal strategis, dan keluwesan melihat arah peluang.",
        "Arah finansialmu bergerak lincah mengikuti arus peluang, menyukai alokasi modal strategis yang berjangkauan luas."
      ],
      Gui: [
        "Aliran finansialmu terjaga saat selaras dengan nurani dan ketekunan yang tenang; nilai rezeki terpelihara melalui usaha yang memberikan manfaat pemulihan nyata bagi sekeliling.",
        "Kemakmuran bagimu terpelihara melalui karya yang membawa ketenangan batin, mengalirkan hasil kerja untuk menopang keberlanjutan hidup yang sehat."
      ]
    };
    const moneyValue = selectOption(dmMoneyStyles[dayMasterPinyin] || ["Kemakmuran bagimu diukur dari kebebasan yang diberikan oleh pengelolaan sumber daya secara bijaksana."], sMoney);

    const polarityMoneys = {
      Yang: [
        "Keberlanjutan finansialmu menuntut keseimbangan antara dorongan ekspansi yang berani dengan kedisiplinan mengamankan hasil; pastikan tidak tergiur oleh peluang besar yang spekulatif tanpa riset membumi.",
        "Keberlanjutan finansial terjaga saat keberanian mengambil peluang diimbangi manajemen risiko terencana.",
        "Kemakmuran jangka panjang menuntut kedisiplinan mengamankan modal, menyeimbangkan dorongan ekspansi bisnis aktif."
      ],
      Yin: [
        "Keberlanjutan finansialmu tumbuh subur melalui ketekunan mengelola detail kecil serta kehati-hatian mengalir bersama arus perubahan; keberhasilan jangka panjang datang dari pengelolaan tabungan yang aman dan terencana.",
        "Keberlanjutan finansialmu diperkuat oleh ketelitian menyusun tabungan secara konsisten dari hasil kecil.",
        "Kamu memelihara aliran kemakmuran lewat kedisiplinan menabung terencana, bergerak hati-hati menyikapi tren bisnis."
      ]
    };
    const polarityMoney = selectOption(polarityMoneys[dayMasterPolarity] || [""], sMoney + 1);

    let elementMoney = "Peluang finansialmu terbuka lebar saat kamu bersedia memadukan kerja taktis dengan kepatuhan pada visi hidup.";
    if (dominantElements.length > 0) {
      const e = dominantElements[0];
      const optWood = [
        "Ritme keuanganmu menemukan momentum terbaik pada peluang yang menuntut inovasi pertumbuhan bertahap.",
        "Peluang rezeki terbuka lewat keterlibatan pada industri yang menuntut pembinaan karakter berkelanjutan."
      ];
      const optFire = [
        "Peluang finansialmu mengalir kuat di bidang ekspresi kreatif, hubungan publik, dan proyek komunikatif.",
        "Rezeki mengalir dinamis pada usaha yang menuntut antusiasme sosial dan komunikasi kelompok."
      ];
      const optEarth = [
        "Kemakmuranmu terpelihara melalui investasi aman pada aset fisik atau pengelolaan sistem penopang yang stabil.",
        "Peluang finansial terbaik hadir lewat pengelolaan aset nyata yang menawarkan kepastian kestabilan."
      ];
      const optMetal = [
        "Ritme keuanganmu menguat melalui analisis bisnis yang sistematis, presisi, dan penyederhanaan struktur manajemen.",
        "Kemakmuranmu menuntut efisiensi tinggi melalui audit logis dan pembersihan alur pengeluaran."
      ];
      const optWater = [
        "Peluang terbaik datang dari pemetaan arah strategis jangka panjang serta keluwesan mengalirkan modal secara terencana.",
        "Ritme rezeki mengalir subur melalui pengelolaan jalur jejaring bisnis dan pemetaan konsep strategis."
      ];

      if (e === "Wood") elementMoney = selectOption(optWood, sMoney + 2);
      else if (e === "Fire") elementMoney = selectOption(optFire, sMoney + 2);
      else if (e === "Earth") elementMoney = selectOption(optEarth, sMoney + 2);
      else if (e === "Metal") elementMoney = selectOption(optMetal, sMoney + 2);
      else if (e === "Water") elementMoney = selectOption(optWater, sMoney + 2);
    }
    const moneyStyle = `${moneyValue} ${elementMoney} ${polarityMoney}`;

    // Select a deterministic synthesis family from chart structure. This
    // affects presentation only; all calculator-owned facts remain intact.
    type StructureFamily = "strong-day-master" | "weak-day-master" | "resource" | "output" | "wealth" | "power" | "companion" | "balanced" | "strongly-imbalanced";
    const tenGodFamily = (tenGod: string): StructureFamily => {
      if (/Resource/.test(tenGod)) return "resource";
      if (/Eating God|Hurting Officer/.test(tenGod)) return "output";
      if (/Friend|Rob Wealth/.test(tenGod)) return "companion";
      if (/Wealth/.test(tenGod)) return "wealth";
      if (/Officer|Seven Killings/.test(tenGod)) return "power";
      return "companion";
    };
    const tenGodCounts = tenGods.reduce((counts, entry) => {
      const family = tenGodFamily(entry.tenGod);
      counts.set(family, (counts.get(family) || 0) + 1);
      return counts;
    }, new Map<StructureFamily, number>());
    const dominantTenGod = [...tenGodCounts.entries()]
      .sort((left, right) => right[1] - left[1] || tenGods.findIndex((entry) => tenGodFamily(entry.tenGod) === left[0]) - tenGods.findIndex((entry) => tenGodFamily(entry.tenGod) === right[0]))[0];
    const dayMasterElementCount = fiveElements[blueprint.dayMaster.element];
    const elementSpread = maximumCount - minimumCount;
    const dominantTenGodFamily = dominantTenGod?.[0] || tenGodFamily(primaryTenGod);
    const structureFamily: StructureFamily = elementSpread >= 4
        ? "strongly-imbalanced"
        : dayMasterElementCount <= 1
          ? "weak-day-master"
          : (dominantTenGod?.[1] || 0) >= 2
            ? dominantTenGodFamily
            : dayMasterElementCount >= 3
              ? "strong-day-master"
              : "balanced";

    const supportElements = blueprint.favorableElements.join(" dan ");
    const challengeElements = blueprint.unfavorableElements.join(" dan ");
    const missions: Record<StructureFamily, string> = {
      resource: `Dua penanda Resource menempatkan pembelajaran sebagai poros perkembangan ${dayMasterPinyin}. Pengalaman perlu disaring hingga menjadi pengetahuan yang menolong keputusan nyata, bukan berhenti sebagai renungan. Fire dan Wood menyediakan keberanian serta pertumbuhan yang dibutuhkan untuk menyeimbangkan beban Earth dan Metal.`,
      output: `Jalurmu meminta gagasan memperoleh bentuk yang dapat dilihat, didengar, atau dipakai. ${dayMasterPinyin} matang melalui keberanian menyelesaikan karya dan menerima tanggapan atas ekspresinya. Dukungan ${supportElements} menjaga proses penciptaan tetap hidup ketika ${challengeElements} mulai mengambil ruang berlebihan.`,
      wealth: `Dua pola Wealth menjadikan pengelolaan nilai sebagai latihan panjang ${dayMasterPinyin}. Ukur peluang, tetapkan risiko yang sanggup ditanggung, lalu rawat hasil tanpa mengejar semuanya sekaligus. Fire dan Earth memperkuat ketegasan praktis agar tekanan Wood dan Metal tidak mengubah efisiensi menjadi kekakuan.`,
      power: `Dua penanda Power mengarahkan ${dayMasterPinyin} pada tanggung jawab, standar, dan dampak keputusan. Kepemimpinan bertumbuh saat aturan dipakai untuk melindungi mutu sekaligus mendengar keadaan yang berubah. Fire dan Water membantu Wood dan Earth bekerja sebagai struktur yang lentur, bukan tuntutan tanpa jeda.`,
      companion: `Perjalanan ${dayMasterPinyin} bergerak melalui kemitraan, pembagian daya, dan keberanian menjaga pendirian. Kolaborasi menjadi matang ketika peran disepakati sebelum energi dicurahkan. ${supportElements} memperkuat batas sehat agar dorongan ${challengeElements} tidak membuat arah pribadi larut dalam kelompok.`,
      "strong-day-master": `${dayMasterPinyin} membawa tenaga inti yang cukup besar untuk memulai dan menopang keputusan. Tugas jangka panjangnya ialah mengarahkan kekuatan itu pada bangunan yang selesai, bukan menambah sasaran baru. ${supportElements} membuka kelenturan ketika dorongan ${challengeElements} membuat langkah terlalu padat.`,
      "weak-day-master": `Pusat ${dayMasterPinyin} bekerja lebih peka dibanding unsur-unsur yang mengelilinginya. Bangun dukungan, ritme, dan batas terlebih dahulu; dari fondasi itu pengetahuan dapat berubah menjadi kontribusi yang tahan lama. Water dan Metal memulihkan kejernihan saat Earth dan Wood membawa tuntutan yang melampaui kapasitas.`,
      balanced: `Komposisi yang relatif rata memberi ${dayMasterPinyin} banyak jalur yang sama-sama mungkin. Arah dewasa muncul setelah satu prioritas dipilih dan benar-benar dituntaskan. ${supportElements} berfungsi sebagai penajam keputusan, sementara ${challengeElements} perlu dijaga agar keluwesan tidak berubah menjadi penyebaran fokus.`,
      "strongly-imbalanced": `Selisih unsur yang lebar membuat penataan ritme lebih penting daripada menambah intensitas bagi ${dayMasterPinyin}. Ekspresi kreatif perlu memperoleh wadah, waktu pulih, dan ukuran selesai yang realistis. Metal serta Water membawa ruang jernih agar tekanan Earth dan Fire tidak menguasai seluruh cara hidup.`,
    };
    const lifeMission = missions[structureFamily];

    // Generate 4-Paragraph Summary
    const sSummary = getSeed(blueprint, "SUMMARY");

    // Paragraph 1: Identity
    const p1Thinking = dayMasterPinyin === "Jia" ? "visioner dan berorientasi pertumbuhan" :
                       dayMasterPinyin === "Yi" ? "adaptif dan peka membaca jejaring sosial" :
                       dayMasterPinyin === "Bing" ? "terbuka, luas, dan didorong inisiatif perubahan" :
                       dayMasterPinyin === "Ding" ? "analitis, intuitif, dan memperhatikan detail-detail kecil" :
                       dayMasterPinyin === "Wu" ? "pragmatis, stabil, dan berlandaskan pada tanggung jawab kokoh" :
                       dayMasterPinyin === "Ji" ? "praktis, penuh perhatian pada detail harian, dan berorientasi hasil nyata" :
                       dayMasterPinyin === "Geng" ? "logis, langsung pada sasaran, dan mengutamakan kejelasan" :
                       dayMasterPinyin === "Xin" ? "presisi, tajam, dan menghargai nilai kualitas tinggi" :
                       dayMasterPinyin === "Ren" ? "dinamis, luas, dan memiliki rasa ingin tahu yang tak bertepi" :
                       "sangat intuitif, imajinatif, dan mampu membaca nuansa emosi halus";

    const p1Emotional = dayMasterPinyin === "Jia" ? "kokoh namun menuntut kelenturan rasa" :
                        dayMasterPinyin === "Yi" ? "cair mengikuti perubahan suasana sekitar" :
                        dayMasterPinyin === "Bing" ? "hangat, bersemangat, namun membutuhkan jeda teduh" :
                        dayMasterPinyin === "Ding" ? "mendalam and tersimpan secara sunyi" :
                        dayMasterPinyin === "Wu" ? "tenang bagaikan benteng perlindungan yang kokoh" :
                        dayMasterPinyin === "Ji" ? "lembut merawat namun rentan menyimpan kecemasan" :
                        dayMasterPinyin === "Geng" ? "kuat menghadapi badai secara mandiri" :
                        dayMasterPinyin === "Xin" ? "elegan dan menghargai ruang batin yang tenang" :
                        dayMasterPinyin === "Ren" ? "mengalir dinamis seperti gelombang pasang" :
                        "lembut, cair, dan peka memulihkan luka rasa";

    const p1Contribution = dayMasterPinyin === "Jia" ? "menginspirasi kemandirian sesama untuk berdiri tegak" :
                           dayMasterPinyin === "Yi" ? "menghubungkan jejaring kerja kolaboratif yang harmonis" :
                           dayMasterPinyin === "Bing" ? "menyalakan antusiasme dan visi perubahan bersama" :
                           dayMasterPinyin === "Ding" ? "menyinari hal-hal kecil yang bermakna namun terlewatkan" :
                           dayMasterPinyin === "Wu" ? "menawarkan perlindungan and penstabil di saat krisis" :
                           dayMasterPinyin === "Ji" ? "menyemai potensi batin sekitar secara sabar" :
                           dayMasterPinyin === "Geng" ? "menghadirkan kejelasan arah di tengah ketidakpastian" :
                           dayMasterPinyin === "Xin" ? "menyempurnakan nilai estetika dan standar profesional" :
                           dayMasterPinyin === "Ren" ? "menghubungkan berbagai gagasan secara taktis" :
                           "menyejukkan dan memulihkan batin yang lelah";

    const identityOpenings: Record<StructureFamily, string> = {
      resource: `Kekuatan chart-mu bertumpu pada kemampuan menyerap, menimbang, lalu mematangkan pengalaman sebelum bertindak.`,
      output: `Dorongan untuk mengungkapkan sesuatu menjadi pintu utama yang menggerakkan susunan energimu.`,
      wealth: `Chart-mu segera mengarahkan perhatian pada nilai, pilihan nyata, dan cara sumber daya dipertanggungjawabkan.`,
      power: `Struktur tanggung jawab menjadi poros yang membuat kualitas Day Master-mu terlihat jelas.`,
      companion: `Hubungan setara dan pertukaran daya menjadi arena utama pembentukan arah pribadimu.`,
      "strong-day-master": `Day Master ${dayMasterPinyin} hadir dengan tenaga inti yang kuat dan mudah mengambil posisi.`,
      "weak-day-master": `Day Master ${dayMasterPinyin} bekerja secara peka dan membutuhkan fondasi yang tepat sebelum bergerak penuh.`,
      balanced: `Lima elemen dalam chart-mu tersebar cukup merata, sehingga kekuatanmu terletak pada keluwesan memilih respons.`,
      "strongly-imbalanced": `Jarak yang lebar antara unsur terkuat dan tertipis membuat chart-mu bergerak dengan intensitas yang sangat terarah.`,
    };
    const p1Identity = `${identityOpenings[structureFamily]} Cara berpikirmu cenderung ${p1Thinking}, sementara respons emosionalmu ${p1Emotional}. Daya ini memperoleh bentuk paling matang ketika kamu ${p1Contribution}.`;

    // Paragraph 2: Recurring life patterns
    const elementPatterns: Record<StructureFamily, string> = {
      resource: `${mostPresentElements.join(" dan ")} membangun ruang besar untuk menyerap pengalaman, sedangkan ${leastPresentElements.join(" dan ")} menunjukkan area yang tidak otomatis memperoleh tenaga. Kesamaan unsur ${blueprint.monthPillar.element} pada Pilar Bulan dan Jam membuat proses belajar mudah terbawa sampai wilayah privat.`,
      output: `Arus ${mostPresentElements.join(" dan ")} mendorong sesuatu keluar menjadi ekspresi, sementara tipisnya ${leastPresentElements.join(" dan ")} menentukan jenis penyangga yang perlu disiapkan. Pertemuan Pilar Bulan ${blueprint.monthPillar.element} dengan Pilar Jam ${blueprint.hourPillar.element} menjelaskan mengapa gagasan dan waktu pribadi perlu dikelola berbeda.`,
      wealth: `Peta ini memperlihatkan ${mostPresentElements.join(" dan ")} sebagai modal paling tersedia dan ${leastPresentElements.join(" dan ")} sebagai kapasitas yang perlu dipakai lebih sengaja. Pergeseran dari Pilar Bulan ${blueprint.monthPillar.element} menuju Pilar Jam ${blueprint.hourPillar.element} menghubungkan tuntutan luar dengan keputusan sumber daya pribadi.`,
      power: `Tekanan struktural bertumpu pada ${mostPresentElements.join(" dan ")}; sebaliknya, ${leastPresentElements.join(" dan ")} tidak selalu hadir ketika keputusan harus dilunakkan. Pilar Bulan ${blueprint.monthPillar.element} dan Pilar Jam ${blueprint.hourPillar.element} menuntut standar sosial diterjemahkan ulang sebelum menjadi aturan personal.`,
      companion: `${mostPresentElements.join(" dan ")} memperkuat cara bertemu dan bertukar daya, sementara ${leastPresentElements.join(" dan ")} meminta batas yang lebih sadar. Hubungan Pilar Bulan ${blueprint.monthPillar.element} dan Pilar Jam ${blueprint.hourPillar.element} menunjukkan tempat kebutuhan kelompok dapat berbeda dari irama diri.`,
      "strong-day-master": `Kepadatan ${mostPresentElements.join(" dan ")} memberi pusat energi yang mudah bergerak, tetapi ${leastPresentElements.join(" dan ")} tidak selalu menyusul dengan kecepatan sama. Pilar Bulan ${blueprint.monthPillar.element} dan Pilar Jam ${blueprint.hourPillar.element} menjadi pengingat agar dorongan kuat diterjemahkan sesuai konteks.`,
      "weak-day-master": `${mostPresentElements.join(" dan ")} mengelilingi Day Master dengan tuntutan besar, sedangkan ${leastPresentElements.join(" dan ")} memperlihatkan sumber pemulihan yang terbatas. Perbedaan Pilar Bulan ${blueprint.monthPillar.element} dan Pilar Jam ${blueprint.hourPillar.element} membuat dukungan eksternal dan kebutuhan batin perlu dibedakan.`,
      balanced: `Sebaran ${mostPresentElements.join(" dan ")} berhadapan dengan ${leastPresentElements.join(" dan ")} tanpa satu jurang yang terlalu lebar. Pilar Bulan ${blueprint.monthPillar.element} dan Pilar Jam ${blueprint.hourPillar.element} lalu menentukan konteks mana yang patut didahulukan.`,
      "strongly-imbalanced": `${mostPresentElements.join(" dan ")} mendominasi aliran, sedangkan ${leastPresentElements.join(" dan ")} hampir tidak memperoleh ruang spontan. Tarikan Pilar Bulan ${blueprint.monthPillar.element} menuju Pilar Jam ${blueprint.hourPillar.element} perlu diatur agar intensitas luar tidak menghabiskan cadangan privat.`,
    };
    const p2Patterns = elementPatterns[structureFamily];

    // Paragraph 3: Current life season (Luck Pillar, Da Yun only when valid)
    let p3Season = "";
    const optionsGeneralSeason = [
      "Perjalanan hidupmu saat ini melintasi fase pendewasaan yang alami, mengundangmu merefleksikan pengalaman masa lalu guna menata arah melangkah berikutnya secara membumi.",
      "Saat ini jiwamu diajak memulihkan stamina batin melalui rutinitas harian yang teratur, menyaring wawasan berharga secara hening.",
      "Fase ini berjalan bagaikan aliran sungai yang mencari jalurnya yang mantap, memperkokoh kesiapan menyambut komitmen hidup baru."
    ];

    const p3Seed = sSummary + fiveElements.Water * 3;

    if (currentLuckCycle) {
      const luckElement = currentLuckCycle.pillar.element;
      const sSeasonOpt = p3Seed + (currentLuckCycle.pillar.element.charCodeAt(0) || 0);
      let theme = "";
      let lesson = "";

      if (luckElement === "Wood") {
        theme = selectOption([
          "pertumbuhan baru dan pembelajaran bertahap",
          "perintisan gagasan jangka panjang dan pengembangan kreativitas diri",
          "penyemaian benih potensi baru dan pembinaan karakter berkelanjutan"
        ], sSeasonOpt);
        lesson = selectOption([
          "seni bersabar menyemai benih potensi",
          "proses tumbuh bertahap tanpa paksaan target instan",
          "kesabaran merawat akar batin di tengah badai perubahan"
        ], sSeasonOpt + 1);
      } else if (luckElement === "Fire") {
        theme = selectOption([
          "ekspresi kreatif, komunikasi terbuka, dan kehangatan sosial",
          "penyebaran inspirasi luas, panggung publik, dan pertukaran sukacita",
          "kehangatan relasi dekat, kejelasan visi bersama, dan gairah berkarya"
        ], sSeasonOpt);
        lesson = selectOption([
          "keberanian mengekspresikan kerentanan diri secara jujur",
          "jeda teduh berkala agar api semangatmu tidak padam",
          "seni menyinari sekitar secara teduh tanpa membakar stamina batin"
        ], sSeasonOpt + 1);
      } else if (luckElement === "Earth") {
        theme = selectOption([
          "pemantapan fondasi hidup, tanggung jawab membumi, dan kestabilan",
          "pengamanan aset harian, komitmen keluarga, dan perlindungan rasa aman",
          "stabilitas rutinitas harian, kedewasaan membumi, dan kepastian sistem"
        ], sSeasonOpt);
        lesson = selectOption([
          "kelenturan melepas kendali atas ketidakpastian",
          "kesediaan melunakkan kekakuan demi mengalir bersama perubahan",
          "keberanian membuka benteng batin menyambut pengalaman baru"
        ], sSeasonOpt + 1);
      } else if (luckElement === "Metal") {
        theme = selectOption([
          "pembenahan struktur, penajaman analisis, dan keputusan bisnis yang tegas",
          "penyempurnakan efisiensi kerja, penegasan batas kepemimpinan, dan kedisiplinan organisasi",
          "penataan ulang manajemen, penyaringan detail secara logis, dan standardisasi kualitas kerja"
        ], sSeasonOpt);
        lesson = selectOption([
          "kebijaksanaan mendengarkan empati sebelum memotong situasi",
          "kesadaran menyelaraskan aturan rasional dengan kelembutan rasa batin",
          "keberanian melepas ketegasan kaku demi merangkul kerentanan rasa sesama"
        ], sSeasonOpt + 1);
      } else {
        theme = selectOption([
          "perenungan mendalam, pemetaan strategi, dan pemulihan batin yang tenang",
          "strategi konseptual jangka panjang, riset sunyi, dan perluasan jejaring",
          "observasi tenang, analisis tren masa depan, dan kebebasan mengalir"
        ], sSeasonOpt);
        lesson = selectOption([
          "disiplin internal untuk mengarahkan aliran tenagamu",
          "wadah batasan diri yang sehat guna memusatkan fokus",
          "kesunyian batin yang jernih untuk mendengar bisikan intuisi"
        ], sSeasonOpt + 1);
      }

      const optionsSeason = [
        `Saat ini, kamu sedang berjalan melintasi musim kehidupan yang didukung oleh pilar ${currentLuckCycle.pillar.display}, menaungi rentang usiamu dari ${currentLuckCycle.startAge} hingga ${currentLuckCycle.endAge} tahun. Fase ini membawa getaran ${theme} yang menantangmu untuk melatih ${lesson}, membuka ruang bagi kedewasaan rasa yang lebih mendalam.`,
        `Melintasi usia ${currentLuckCycle.startAge} sampai ${currentLuckCycle.endAge} tahun, pilar ${currentLuckCycle.pillar.display} membimbing musim hidupmu saat ini. Kamu diundang mengalirkan energi untuk menguasai ${theme} serta mempraktikkan secara nyata ${lesson}.`,
        `Musim hidupmu kini bernaung di bawah pilar ${currentLuckCycle.pillar.display} untuk usia ${currentLuckCycle.startAge}–${currentLuckCycle.endAge} tahun. Iklim batinmu dipengaruhi getaran ${theme}, mengundangmu melatih ${lesson} demi integritas diri.`
      ];
      p3Season = selectOption(optionsSeason, p3Seed);
    } else {
      p3Season = selectOption(optionsGeneralSeason, p3Seed);
    }

    // Paragraph 4: Life direction (integrated career, relationship, mission)
    const p4CareerTheme = dayMasterPinyin === "Jia" ? "digerakkan target jangka panjang" :
                          dayMasterPinyin === "Yi" ? "adaptif dan berjejaring" :
                          dayMasterPinyin === "Bing" ? "penuh semangat dan komunikatif" :
                          dayMasterPinyin === "Ding" ? "teliti, mendalam, dan fokus detail" :
                          dayMasterPinyin === "Wu" ? "stabil, teratur, dan dapat diandalkan" :
                          dayMasterPinyin === "Ji" ? "merawat dan praktis" :
                          dayMasterPinyin === "Geng" ? "terstruktur dan disiplin" :
                          dayMasterPinyin === "Xin" ? "presisi dan memperhatikan detail estetika" :
                          dayMasterPinyin === "Ren" ? "dinamis dan strategis" :
                          "intuitif, tenang, dan digerakkan panggilan nurani";

    const directionByStructure: Record<StructureFamily, string> = {
      resource: `Arah jangka panjangmu adalah membawa pola kerja yang ${p4CareerTheme} menuju peran pembelajar, perumus, atau pendamping yang membuat pengetahuan menjadi berguna.`,
      output: `Perkembangan berikutnya meminta pola kerja yang ${p4CareerTheme} diterjemahkan menjadi karya, komunikasi, atau metode yang dapat diterima dunia luar.`,
      wealth: `Kematanganmu diuji melalui cara kerja yang ${p4CareerTheme}: menetapkan nilai, mengelola risiko, dan menjaga sumber daya tetap melayani tujuan yang dipilih.`,
      power: `Kontribusi yang ${p4CareerTheme} memperoleh bobot ketika wewenang digunakan untuk melindungi standar, bukan sekadar mengendalikan hasil.`,
      companion: `Jalurmu berkembang saat ritme kerja yang ${p4CareerTheme} masuk ke kolaborasi dengan pembagian peran dan batas keputusan yang jelas.`,
      "strong-day-master": `Tenaga inti yang besar perlu diarahkan melalui kerja yang ${p4CareerTheme}, tujuan terukur, dan kesediaan mengoreksi arah setelah menerima umpan balik.`,
      "weak-day-master": `Sebelum mengejar hasil besar, bangun dukungan bagi pola kerja yang ${p4CareerTheme}; fondasi yang konsisten membuat kontribusimu bertahan lebih lama.`,
      balanced: `Keluwesan chart-mu menjadi bernilai ketika pola kerja yang ${p4CareerTheme} dipusatkan pada satu prioritas yang benar-benar selesai.`,
      "strongly-imbalanced": `Arah integrasinya adalah menjaga pola kerja yang ${p4CareerTheme} tetap produktif tanpa membiarkan unsur dominan mengambil seluruh ruang hidup.`,
    };
    const luckApplications: Record<StructureFamily, string> = {
      resource: `${currentLuckCycle?.pillar.display || "Fase kini"} menguji apakah wawasan dapat dipilih, dirumuskan, lalu dibagikan pada saat yang tepat.`,
      output: `Di bawah ${currentLuckCycle?.pillar.display || "fase kini"}, ukuran kemajuan terletak pada karya yang selesai dan memperoleh tanggapan nyata.`,
      wealth: `${currentLuckCycle?.pillar.display || "Fase kini"} menjadi laboratorium untuk keputusan nilai, batas risiko, serta keberlanjutan hasil.`,
      power: `Musim ${currentLuckCycle?.pillar.display || "saat ini"} menguji cara memegang standar tanpa mengabaikan manusia yang menjalankannya.`,
      companion: `${currentLuckCycle?.pillar.display || "Fase kini"} memperjelas siapa yang berjalan bersama, apa yang dibagi, dan keputusan mana yang tetap personal.`,
      "strong-day-master": `Pilar ${currentLuckCycle?.pillar.display || "kini"} meminta tenaga besar itu dikumpulkan pada sasaran yang dapat dituntaskan.`,
      "weak-day-master": `${currentLuckCycle?.pillar.display || "Fase kini"} mengundang pemulihan kapasitas sebelum tanggung jawab baru diterima.`,
      balanced: `Musim ${currentLuckCycle?.pillar.display || "sekarang"} membantu menyaring banyak pilihan menjadi urutan kerja yang jelas.`,
      "strongly-imbalanced": `Pilar ${currentLuckCycle?.pillar.display || "kini"} menjadi latihan untuk mengatur intensitas, jeda, dan batas selesai.`,
    };
    const p4Direction = `${directionByStructure[structureFamily]} ${luckApplications[structureFamily]}`;

    const summary = [p1Identity, p2Patterns, p3Season, p4Direction];

    // Return the Enriched Blueprint
    return {
      ...blueprint,
      dayMaster: {
        ...blueprint.dayMaster,
        description: dayMasterDescription
      },
      tenGods: enrichedTenGods,
      fiveElementsDescription,
      leastPresentElements,
      mostPresentElements,
      strengths,
      challenges,
      careerStyle,
      relationshipStyle,
      moneyStyle,
      lifeMission,
      summary
    };
  }

  public static enrichEn(blueprint: BaziBlueprint): EnrichedBaziBlueprint {
    const dm = blueprint.dayMaster;
    const dayMasterPinyin = dm.pinyin;
    const dayMasterPolarity = dm.polarity;
    const dayMasterElement = dm.element;
    const fiveElements = blueprint.fiveElements;
    const tenGods = blueprint.tenGods;
    const currentLuckCycle = blueprint.currentLuckCycle;

    const dmEnMap: Record<string, { p1: string; p2: string; p3: string; strengths: string[]; challenges: string[]; career: string; rel: string; money: string; mission: string }> = {
      Jia: {
        p1: "Your inner nature moves with an innate drive to pioneer, stand upright, and direct energy toward constructive future growth. Your thinking is direct and structured, naturally spotting developmental potential in every circumstance. In making choices, you rely on a clear long-term vision and principled independence.",
        p2: "Emotionally, you hold deep inner strength, though you may risk becoming rigid when external circumstances disrupt your expectations. Under pressure, you tend to shoulder burdens alone rather than asking for help. The key growth area is learning to soften and accept support without viewing it as compromise.",
        p3: "Your true maturation unfolds as you learn that bending with the wind does not diminish your strength. By combining upright vision with genuine flexibility, your leadership becomes deeply inspiring.",
        strengths: [
          "Pioneering spirit with a natural urge to lead and break new ground",
          "Upright character with firm long-term vision and principled integrity",
          "Resilient drive to nurture growth in yourself and your community",
        ],
        challenges: [
          "Tendency toward stubbornness when plans encounter unexpected resistance",
          "Hesitation to compromise or admit personal vulnerability under stress",
          "Impatience with slow developmental cycles, risking mental fatigue",
        ],
        career: "You thrive in roles where you can pioneer initiatives, design long-term growth structures, and guide teams toward clear milestones. Your leadership is principled and direct, inspiring others by example.",
        rel: "In relationships, you commit as a steadfast protector who values absolute honesty. You show love by actively supporting your partner's aspirations, while learning that emotional vulnerability deepens true intimacy.",
        money: "You view wealth as a vehicle for sustainable expansion and long-term security. Rather than chasing speculative gains, you invest methodically into foundations that endure across generations.",
        mission: "Your life mission is to serve as an upright pillar of growth—pioneering constructive paths that elevate others and leaving behind enduring structures of wisdom and opportunity.",
      },
      Yi: {
        p1: "Your inner nature flows with resilience, grace, and an innate skill in navigating around life's complexities. Your thinking is tactical and socially perceptive, effortlessly bridging diverse viewpoints. When deciding, you prioritize harmony, practical feasibility, and the enduring strength of collaborative networks.",
        p2: "Emotionally, you are perceptive and sensitive to the energetic climate of your surroundings. Under pressure, you may find yourself absorbing external tension or deferring your own needs to maintain peace. Guard against losing your own anchor in communal currents.",
        p3: "Your inner maturity deepens when you realize your adaptable nature is a profound gift, not an obligation to please everyone. Standing firmly on your own values allows you to collaborate from wholeness.",
        strengths: [
          "Remarkable adaptability and resourcefulness in navigating complex obstacles",
          "Natural diplomacy and talent for cultivating harmonious, collaborative networks",
          "Gentle resilience that bends with changing conditions without breaking",
        ],
        challenges: [
          "Tendency to over-accommodate others to avoid relational discord",
          "Difficulty standing independently without external validation or consensus",
          "Risk of absorbing emotional turbulence from the surrounding environment",
        ],
        career: "You excel in collaborative ecosystems, strategic partnerships, diplomacy, and creative mediation. Your ability to weave alliances and find workable compromises makes you indispensable in complex organizations.",
        rel: "In intimacy, you are attentive, empathetic, and nurturing. You express love through gentle presence and thoughtful support, seeking a partner with whom you can grow organically.",
        money: "You perceive value in social networks and dynamic market trends. Wealth flows to you through partnerships, resourceful adaptation, and spotting synergistic opportunities that others overlook.",
        mission: "Your life mission is to weave harmony and resilient connections—bridging differences, nurturing community vitality, and demonstrating that gentle persistence outlasts brute force.",
      },
      Bing: {
        p1: "Your presence radiates warm, expressive vitality that naturally illuminates and enlivens your surroundings. Your thinking is expansive and big-picture oriented, fueled by optimism and enthusiasm for initiating meaningful change. You decide boldly, leading openly from the front.",
        p2: "Emotionally, your enthusiasm burns bright and fast, but you are vulnerable to feeling depleted when efforts go unrecognized. Under pressure, you may push harder to project strength, risking sudden exhaustion. Cultivating quiet downtime restores your inner spark.",
        p3: "True integration arrives when you learn to shine with warm generosity without needing constant public validation. Pacing your energy and honoring quiet contemplation keeps your vitality sustainable.",
        strengths: [
          "Vibrant, infectious enthusiasm that naturally inspires and motivates others",
          "Expansive vision and courage to champion public initiatives openly",
          "Generous warmth and transparent honesty that disarms cynicism",
        ],
        challenges: [
          "Vulnerability to sudden burnout when high energy is not matched with quiet rest",
          "Restlessness when projects require slow, repetitive, behind-the-scenes effort",
          "Tendency to overlook subtle emotional nuances in the rush toward action",
        ],
        career: "You flourish on public stages, in visionary leadership, creative media, and inspirational advocacy. Your natural charisma and clarity of direction rally others around transformative goals.",
        rel: "You love with expressive passion and open-hearted warmth. Shared adventures, laughter, and uplifting encouragement are your hallmarks, while learning that quiet, ordinary moments hold equal sacredness.",
        money: "You approach wealth as dynamic, flowing energy. You find the greatest prosperity in visionary projects with broad societal impact, provided you maintain disciplined oversight on expenditures.",
        mission: "Your life mission is to be a beacon of clarity, warmth, and hope—igniting courage in the hearts of others and illuminating pathways toward collective upliftment.",
      },
      Ding: {
        p1: "Your inner nature illuminates the world with personal, focused warmth, like a guiding lantern offering quiet clarity. Your thinking is intuitive and discerning, attuned to subtle details beneath the surface. You make decisions with quiet reflection, aligning actions with heartfelt integrity.",
        p2: "Emotionally, you keep feelings close to your chest, reserving deep vulnerability for a trusted inner circle. Under pressure, you may withdraw into cool solitude or harbor unspoken worry. Gentle, honest dialogue keeps your warmth accessible.",
        p3: "Your wisdom blossoms when you share your focused light without fearing vulnerability. Trusting that sincere bonds can hold your private feelings allows your warmth to heal and comfort.",
        strengths: [
          "Penetrating analytical intuition that spots hidden details others miss",
          "Deep devotion to personal crafts, specialized expertise, and authentic bonds",
          "Quiet, reassuring warmth that provides a safe sanctuary for reflection",
        ],
        challenges: [
          "Tendency to harbor unspoken worries and withdraw into cold solitude when hurt",
          "Excessive caution in expressing vulnerability, creating unnecessary relational distance",
          "Perfectionistic anxiety over minor flaws in specialized work",
        ],
        career: "You thrive in specialized craftsmanship, research, depth psychology, mentoring, and strategic advisory. Your ability to focus intensely on critical details produces work of rare refinement.",
        rel: "You cherish deep, private, heart-to-heart intimacy. Loyalty and subtle emotional resonance matter far more than grand gestures, flourishing when trust is tenderly guarded.",
        money: "Wealth comes to you through specialized expertise, proprietary knowledge, and focused dedication. You manage resources with quiet prudence and discerning value judgment.",
        mission: "Your life mission is to bring focused illumination to hidden truths—mentoring individuals, refining specialized arts, and preserving sacred warmth in an often hurried world.",
      },
      Wu: {
        p1: "Your inner nature carries a grounded, steadfast cadence, offering stability and shelter to those around you. Your thinking is pragmatic and anchored in daily reality, valuing proven foundations and steady consistency. In decisions, you hold firm like a protective mountain amidst changing seasons.",
        p2: "Emotionally, your responses build gradually beneath the surface, rarely erupting in haste. Under stress, you may fortify yourself within a stoic silence, keeping frustrations contained. Allowing natural emotion to flow prevents inner ossification.",
        p3: "Your journey reaches fulfillment as you soften rigidity and welcome new winds of change into your sanctuary. True stability lies not in resisting transformation, but in grounding it.",
        strengths: [
          "Steadfast dependability and grounded stability that anchors others in crises",
          "Pragmatic realism and enduring patience in building lasting foundations",
          "Protective loyalty and deep reverence for proven principles and commitments",
        ],
        challenges: [
          "Reluctance to step outside established routines or embrace unfamiliar change",
          "Tendency to bottle up frustrations until they ossify into rigid resistance",
          "Risk of appearing aloof or unyielding when others seek spontaneous connection",
        ],
        career: "You excel in real estate, institutional management, governance, operations, and infrastructure. Your unflinching reliability creates solid platforms where others feel entirely secure.",
        rel: "In relationships, you offer unshakable loyalty, tangible presence, and dependable devotion. You express love by creating a secure home base, while learning that sharing your inner doubts strengthens intimacy.",
        money: "You value capital preservation, tangible assets, and patient accumulation. Your financial strength grows through methodical discipline, risk mitigation, and prudent stewardship.",
        mission: "Your life mission is to provide an enduring sanctuary of stability—preserving foundational values, sheltering those in transition, and building structures that stand the test of time.",
      },
      Ji: {
        p1: "Your inner nature possesses a nurturing instinct to patiently tend and cultivate inner potential in your community. Your thinking is practical, attentive to daily needs, and oriented toward concrete, caring outcomes. You make choices with maternal patience, ensuring everyone has fertile ground to flourish.",
        p2: "Emotionally, you are deeply empathetic toward others' burdens, sometimes at the expense of your own boundaries. Under pressure, you may feel guilty when asserting personal limits. Practicing self-care ensures your wellspring remains replenished.",
        p3: "Your inner growth matures as you cultivate your own soul with the same tender devotion you offer others. Healthy boundaries are the fences that protect your most fertile garden.",
        strengths: [
          "Exceptional nurturing capacity that patiently cultivates human potential",
          "Practical resourcefulness and attention to daily communal well-being",
          "Warm, non-judgmental acceptance that makes others feel safe and valued",
        ],
        challenges: [
          "Difficulty saying no and setting firm personal boundaries",
          "Guilt when prioritizing self-care over the continuous demands of others",
          "Tendency to absorb hidden anxieties about the future of loved ones",
        ],
        career: "You shine in human development, education, healthcare, community organization, and practical logistics. Your patient care transforms raw talent into mature excellence.",
        rel: "You love through thoughtful daily acts of service, emotional warmth, and attentive listening. Creating a comfortable, nourishing environment is your natural relational language.",
        money: "You handle resources with practical wisdom, ensuring everyone is cared for. Wealth grows as you learn to value your own contributions and invest in your personal capacity.",
        mission: "Your life mission is to tend the fertile soil of human potential—cultivating growth in others, fostering compassionate communities, and modeling quiet, unselfish service.",
      },
      Geng: {
        p1: "Your inner nature is guided by resolute honesty, fair justice, and a strong drive to bring clarity and reform. Your thinking is logical, objective, and aimed straight at the core of any issue without compromise. In decisions, you demonstrate uncompromising resolve and ethical fortitude.",
        p2: "Emotionally, you prefer to present an invulnerable front to the world, processing sentiment through the filter of logic. Under pressure, your tone can turn sharply critical when others seem slow or undisciplined. Balancing firmness with empathy is your mastery.",
        p3: "Your mastery shines when your sharp blade is guided by compassionate understanding. Using strength to protect and elevate rather than merely judge transforms discipline into lasting honor.",
        strengths: [
          "Sharp, objective logic that cuts through confusion to core truths",
          "Resolute courage to confront injustice and champion necessary structural reform",
          "Incorruptible integrity and readiness to shoulder demanding responsibilities",
        ],
        challenges: [
          "Blunt communication that can wound sensitive feelings without realizing it",
          "Intolerance for perceived weakness, inefficiency, or indecision in others",
          "Habit of suppressing personal vulnerability behind a stoic, unyielding facade",
        ],
        career: "You thrive in law, executive leadership, engineering, restructuring, surgery, and crisis management. When tough calls must be made without flinching, organizations turn to you.",
        rel: "You express commitment through fierce loyalty and uncompromising truth. Intimacy deepens when you learn to lower your armor, letting your partner see the tender heart behind your protective shield.",
        money: "You manage wealth with decisive discipline and structured efficiency. You cut through financial bloat and allocate capital strictly where it produces measurable utility.",
        mission: "Your life mission is to champion truth, order, and justice—forging resilient systems, confronting stagnation, and using your strength to protect the vulnerable.",
      },
      Xin: {
        p1: "Your inner nature is attuned to beauty, precision, and high refinement, always seeking true distinction. Your thinking is sharp, critical, and analytical, upholding exceptional aesthetic and intellectual standards. You decide with measured elegance, refusing cheap compromises.",
        p2: "Emotionally, you are sensitive to relational discord and criticism, valuing environments free from roughness. Under pressure, you may detach and adopt an aloof posture to protect your self-respect. Recognizing that imperfection is human keeps your heart open.",
        p3: "Your journey reaches depth when you discover beauty in the raw, unfinished aspects of life. Releasing impossible standards allows your natural elegance to inspire rather than intimidate.",
        strengths: [
          "Exacting precision, aesthetic refinement, and dedication to true quality",
          "Sharp discernment that effortlessly elevates standards and filters out mediocrity",
          "Dignified self-respect and principled independence in creative expression",
        ],
        challenges: [
          "Overly harsh internal self-criticism when reality falls short of perfection",
          "Hypersensitivity to criticism or roughness from the surrounding environment",
          "Tendency to detach into aloof isolation when feeling misunderstood",
        ],
        career: "You excel in fine arts, architecture, luxury, editorial curation, high-precision analytics, and jewelry design. Your touch transforms raw materials into polished masterpieces.",
        rel: "You seek partners who honor your refined standards and offer gentle, courteous devotion. Real intimacy flourishes when mutual appreciation is spoken sincerely and vulgarity is absent.",
        money: "You value quality over sheer quantity. You prosper by cultivating rare, high-value assets and establishing premium standards that command enduring respect.",
        mission: "Your life mission is to reveal beauty, dignity, and excellence—refining the cultural fabric, preserving elevated standards, and elevating human experience through art and integrity.",
      },
      Ren: {
        p1: "Your inner nature moves with expansive dynamism, flowing freely to connect diverse ideas, frontiers, and communities. Your thinking is strategic, imaginative, and boundless, embracing broad horizons without rigid constraints. You make decisions with adaptive agility like a deep oceanic current.",
        p2: "Emotionally, you flow like deep water—calm on top, with currents running beneath. Under pressure, you may be tempted to drift away from friction rather than confronting conflict directly. Grounding yourself in steady routines prevents aimless drifting.",
        p3: "Your true power consolidates when your boundless river finds purposeful banks to channel its flow. Guiding expansive curiosity toward focused creation creates enduring impact.",
        strengths: [
          "Expansive, strategic thinking that readily connects diverse frontiers and concepts",
          "Dynamic adaptability and freedom from rigid preconceptions",
          "Resourceful intuition that turns obstacles into fertile avenues of exploration",
        ],
        challenges: [
          "Restlessness and difficulty maintaining focus on repetitive daily maintenance",
          "Tendency to drift away from difficult conversations rather than resolving conflict",
          "Risk of scattering attention across too many intriguing opportunities simultaneously",
        ],
        career: "You flourish in international trade, strategic consulting, technology innovation, travel, and cross-cultural communication. Your ability to ride waves of change puts you ahead of the curve.",
        rel: "You love with open-hearted curiosity and dynamic companionship. You need a partner who shares your love for exploration and honors your need for psychological freedom.",
        money: "You recognize wealth in dynamic liquidity, market momentum, and strategic positioning. You build prosperity by channeling opportunities through innovative networks.",
        mission: "Your life mission is to connect disparate worlds—bridging cultures, breaking down narrow boundaries, and flowing freely toward new horizons of human understanding.",
      },
      Gui: {
        p1: "Your inner nature flows with quiet gentleness yet remarkable penetrating persistence, patiently wearing down obstacles over time. Your thinking is contemplative and deeply intuitive, discerning unspoken emotional currents. You make decisions by listening to quiet inner wisdom and moral truth.",
        p2: "Emotionally, you are a receptive sponge for surrounding vibrations, requiring clean personal boundaries to stay centered. Under pressure, you may escape into fantasy or contemplative avoidance. Grounding your sensitivity in practical steps transforms empathy into strength.",
        p3: "Your integration flourishes when you trust that quiet persistence moves mountains. Combining subtle intuition with decisive practical action allows your gentle wisdom to enrich the world.",
        strengths: [
          "Deep intuitive empathy that senses emotional undercurrents with great accuracy",
          "Gentle, quiet persistence that wears down formidable barriers over time",
          "Contemplative wisdom and capacity to bring soothing restoration to weary souls",
        ],
        challenges: [
          "Tendency to be emotionally overwhelmed by negative environmental energies",
          "Hesitation and self-doubt when required to make abrupt, assertive decisions",
          "Habit of retreating into private contemplation instead of taking practical action",
        ],
        career: "You excel in psychology, spiritual mentorship, creative writing, research, and holistic healing. Your gentle intuition penetrates straight to the emotional core of complex dilemmas.",
        rel: "In intimacy, you seek a sacred, soulful bond rooted in unspoken understanding. You offer unconditional empathy, flourishing when your partner provides a safe container for your sensitivity.",
        money: "You view wealth as a quiet current that supports peace of mind. Prosperity flows when you align your specialized intuitive gifts with tangible needs in the world.",
        mission: "Your life mission is to bring soothing restoration and quiet wisdom to humanity—nourishing dry spirits, healing hidden wounds, and demonstrating the quiet omnipotence of gentle love.",
      },
    };

    const entry = dmEnMap[dayMasterPinyin] || dmEnMap.Jia;
    const dayMasterDescription = `${entry.p1}\n\n${entry.p2}\n\n${entry.p3}`;

    const enrichedTenGods = tenGods.map((e) => ({
      ...e,
      description: buildTenGodsNarrative({
        tenGod: e.tenGod,
        pillar: e.pillar,
        isEn: true,
      }),
    }));

    const elementsList: BaziElement[] = ["Wood", "Fire", "Earth", "Metal", "Water"];
    const sortedElements = [...elementsList].sort((a, b) => fiveElements[b] - fiveElements[a]);
    const maxCount = fiveElements[sortedElements[0]];
    const minCount = fiveElements[sortedElements[sortedElements.length - 1]];
    const dominantElements = elementsList.filter((e) => fiveElements[e] === maxCount && maxCount >= 2);
    const leastPresentElements = elementsList.filter((e) => fiveElements[e] === minCount);
    const mostPresentElements = dominantElements.length > 0 ? dominantElements : [sortedElements[0]];

    const dominantText = dominantElements.length > 0
      ? `Your chart highlights a prominent presence of ${dominantElements.join(" and ")}, providing natural drive and instinct in these areas.`
      : "Your elemental counts are relatively balanced, offering an adaptable and flexible foundation.";
    const leastText = leastPresentElements.length < 5
      ? `In contrast, ${leastPresentElements.join(" and ")} appears in lower concentration, suggesting a sphere of life that invites conscious cultivation.`
      : "";
    const fiveElementsDescription = `Within your energetic blueprint, the five elements form a distinct landscape. ${dominantText} ${leastText} This overview reflects the visible distribution across your four pillars, serving as an observational map rather than a rigid prescription.`;

    const p1Identity = `Your core identity centers on Day Master ${dayMasterPinyin} (${dayMasterElement}), expressing through a ${dayMasterPolarity.toLowerCase()} cadence. ${entry.p1} This energy achieves its finest maturity when your natural strengths are directed toward purposeful service.`;
    const p2Patterns = `Across your four pillars, the interaction between ${mostPresentElements.join(" and ")} and ${leastPresentElements.join(" and ")} shapes your everyday responses. The relationship between your Month Pillar (${blueprint.monthPillar.element}) and Hour Pillar (${blueprint.hourPillar.element}) shows how outward professional responsibilities naturally integrate with your private long-term aspirations.`;
    const p3Season = currentLuckCycle
      ? `Currently, you are moving through the life chapter of the ${currentLuckCycle.pillar.display} pillar, spanning ages ${currentLuckCycle.startAge} to ${currentLuckCycle.endAge}. This phase highlights the energetic theme of ${currentLuckCycle.pillar.element}, inviting you to mature your capacities and align with deeper life integrity.`
      : "Your life journey is currently traversing a natural developmental chapter, inviting you to integrate past lessons and thoughtfully navigate your next steps.";
    const p4Direction = `${entry.mission} Sustainable fulfillment emerges when you build a steady pace that honors your natural rhythms rather than forcing arbitrary outcomes.`;

    const summary = [p1Identity, p2Patterns, p3Season, p4Direction];

    return {
      ...blueprint,
      dayMaster: {
        ...blueprint.dayMaster,
        description: dayMasterDescription,
      },
      tenGods: enrichedTenGods,
      fiveElementsDescription,
      leastPresentElements,
      mostPresentElements,
      strengths: entry.strengths,
      challenges: entry.challenges,
      careerStyle: entry.career,
      relationshipStyle: entry.rel,
      moneyStyle: entry.money,
      lifeMission: entry.mission,
      summary,
    };
  }
}
