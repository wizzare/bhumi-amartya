import type { CanonicalDestinyMatrix } from "../types/destinyMatrix";
import { destinyMatrixArcanaDictionary, type ArcanaDictionaryEntry } from "../data/destinyMatrixArcanaDictionary";
import {
  DESTINY_MATRIX_ENERGY_MATRIX,
  DESTINY_MATRIX_NODES,
  DESTINY_MATRIX_PATHS,
  DESTINY_MATRIX_TOPOLOGY,
  DESTINY_MATRIX_VISUAL_EDGES,
  type DestinyMatrixTopologyLine,
} from "./topology";
import { buildDestinyMatrixAncestralProjection, type AncestralProjectionNode } from "./ancestralProjection";
import { buildDestinyMatrixAnnualArcana, type DestinyMatrixAnnualArcana, type DestinyMatrixAnnualArcanaContext } from "./annualArcana";

export type DestinyMatrixPresentationSection = {
  id: string;
  label: string;
  nodeIds: string[];
  values: number[];
  displayValue: string;
  mainNodeId: string;
  mainArcana: number;
  narrative: string;
};

export type DestinyMatrixOptionalSection = {
  sectionId: string;
  canonicalLabel: string;
  displayLabel: string;
  sourceValues: number[];
  resultValue: number;
  shortExplanation: string;
  fullExplanation: string;
  sourceClassification: "STRUCTURED_PRE_CUTOFF_SOURCE";
  sourceVersion: string;
  availabilityStatus: "available";
};

export type DestinyMatrixEnergyMatrix = {
  sectionId: string;
  canonicalLabel: string;
  displayLabel: string;
  rows: Array<{
    rowId: string;
    chakra: string;
    nodeIds: { physical: string; energy: string; emotion: string };
    physical: number | null;
    energy: number | null;
    emotion: number | null;
    physicsExplanation: string | null;
    energyExplanation: string | null;
    emotionsExplanation: string | null;
    integratedExplanation: string;
    shortInsight: string;
    symbolicContext: string;
    safetyContext: string;
  }>;
  totals: { physical: number | null; energy: number | null; emotion: number | null };
  totalExplanation: string;
  summary: string[];
  shortExplanation: string;
  fullExplanation: string;
  safetyNotice: string;
  sourceClassification: "STRUCTURED_PRE_CUTOFF_SOURCE";
  sourceVersion: string;
  availabilityStatus: "available";
};

export type DestinyMatrixLineagePresentation = {
  id: "FATHER_LINE" | "MOTHER_LINE";
  label: "Father Line" | "Mother Line";
  karma: DestinyMatrixPresentationSection;
  talent: DestinyMatrixPresentationSection;
  narrative: string;
};

export type DestinyMatrixPresentation = {
  systemName: "Destiny Matrix";
  hero: { eyebrow: string; title: string; metrics: Array<{ label: string; value: string }>; insight: string; detailHref: string };
  center: DestinyMatrixPresentationSection;
  commonEnergy: DestinyMatrixPresentationSection;
  karmicTile: DestinyMatrixPresentationSection;
  lovePath: DestinyMatrixPresentationSection;
  moneyPath: DestinyMatrixPresentationSection;
  fatherLine: DestinyMatrixLineagePresentation | null;
  motherLine: DestinyMatrixLineagePresentation | null;
  fatherTalents: DestinyMatrixPresentationSection | null;
  motherTalents: DestinyMatrixPresentationSection | null;
  higherTalents: DestinyMatrixPresentationSection;
  soulSearching: DestinyMatrixOptionalSection | null;
  socialization: DestinyMatrixOptionalSection | null;
  spiritualKnowledge: DestinyMatrixOptionalSection | null;
  energyMatrix: DestinyMatrixEnergyMatrix | null;
  annualArcana: DestinyMatrixAnnualArcana | null;
  ageCycle: null;
  strengths: string;
  challenges: string;
  relationshipThemes: string;
  livelihoodThemes: string;
  ancestralThemes: string | null;
  growthDirection: string;
  diagram: {
    viewBox: string;
    nodes: Array<(typeof DESTINY_MATRIX_NODES)[number] & { value: number }>;
    edges: typeof DESTINY_MATRIX_VISUAL_EDGES;
  };
  summary: string[];
  profileCard: { title: string; center: string; commonEnergy: string; insight: string; action: string; href: string };
  sourceVersion: string;
  sourceClassification: "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION";
};

const entry = (value: number): ArcanaDictionaryEntry => {
  const found = destinyMatrixArcanaDictionary[value];
  if (!found) throw new Error(`Verified Arcana dictionary has no entry for ${value}.`);
  return found;
};

const lower = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);
const clean = (value: string) => value.replace(/\s*\([^)]*\)/g, "").replace(/Burnout/gi, "kelelahan").trim();
/**
 * Dictionary values are stored as title-cased fragments (for example,
 * "Kemampuan Beradaptasi, Optimisme"). They are embedded inside complete
 * sentences in the blueprint, so only the first word may retain sentence
 * casing; words that follow must not introduce an unexpected capital.
 */
const phrase = (value: string) => {
  const words = clean(value).split(/(\s+)/);
  let wordIndex = 0;
  return words
    .map((token) => {
      if (/^\s+$/.test(token) || token === "") return token;
      const normalized = wordIndex === 0 ? lower(token) : token.toLocaleLowerCase("id-ID");
      wordIndex += 1;
      return normalized;
    })
    .join("");
};

function valuesFor(matrix: CanonicalDestinyMatrix, line: DestinyMatrixTopologyLine): number[] {
  const nodeMap = new Map(matrix.graph.nodes.map((node) => [node.id, node.value]));
  return line.orderedNodeIds.map((nodeId) => {
    const value = nodeMap.get(nodeId);
    if (value === undefined) throw new Error(`Canonical topology references missing node ${nodeId}.`);
    return value;
  });
}

function section(matrix: CanonicalDestinyMatrix, line: DestinyMatrixTopologyLine, narrative: (items: ArcanaDictionaryEntry[]) => string): DestinyMatrixPresentationSection {
  const values = valuesFor(matrix, line);
  const mainIndex = line.orderedNodeIds.indexOf(line.mainNodeId);
  if (mainIndex < 0) throw new Error(`${line.lineId} main node is outside its ordered path.`);
  return {
    id: line.lineId,
    label: line.canonicalLabel,
    nodeIds: [...line.orderedNodeIds],
    values,
    displayValue: values.join("–"),
    mainNodeId: line.mainNodeId,
    mainArcana: values[mainIndex],
    narrative: narrative(values.map(entry)),
  };
}

function optionalNodeValue(nodeMap: Map<string, number>, nodeId: string): number | null {
  const value = nodeMap.get(nodeId);
  return typeof value === "number" ? value : null;
}

function ancestralSection(id: string, label: string, nodes: AncestralProjectionNode[], narrative: string): DestinyMatrixPresentationSection {
  const values = nodes.map((node) => node.value);
  return {
    id,
    label,
    nodeIds: nodes.map((node) => node.projectionNodeId),
    values,
    displayValue: values.join("–"),
    mainNodeId: nodes[0].projectionNodeId,
    mainArcana: values[0],
    narrative,
  };
}

const CHAKRA_CONTEXT: Record<string, { domain: string; embodied: string; movement: string; emotional: string; balance: string }> = {
  Sahasrara: { domain: "makna hidup dan kepercayaan pada perjalananmu", embodied: "memberi ruang bagi nilai, kreativitas, dan perspektif yang lebih luas", movement: "belajar dan bergerak dari alasan yang dapat kamu percaya", emotional: "merasakan kejelasan tanpa harus mengendalikan seluruh proses", balance: "menjaga keyakinan tetap lentur ketika hidup tidak berjalan sesuai rencana" },
  Ajna: { domain: "cara memahami, membayangkan, dan menafsirkan pengalaman", embodied: "memberi jeda sebelum menarik kesimpulan", movement: "mengarahkan perhatian pada hal yang benar-benar perlu dipahami", emotional: "membedakan intuisi dari kekhawatiran", balance: "mempertemukan imajinasi dengan pemeriksaan realitas" },
  Vishuddha: { domain: "komunikasi, kejujuran, dan kemampuan menyuarakan pengalaman", embodied: "menyampaikan hal penting dengan kata-kata yang dapat diterima", movement: "memilih waktu dan cara bicara yang selaras", emotional: "mengakui perasaan sebelum menjelaskannya kepada orang lain", balance: "mendengarkan sedalam kamu ingin didengarkan" },
  Anahata: { domain: "kedekatan, empati, kepedulian, dan batas dalam hubungan", embodied: "memberi serta menerima perhatian tanpa mengabaikan diri", movement: "merawat hubungan yang memiliki timbal balik", emotional: "membuka hati sambil tetap menjaga batas", balance: "membedakan kasih sayang dari kewajiban untuk menyelamatkan semua orang" },
  Manipura: { domain: "kehendak, keyakinan diri, keputusan, dan hubungan dengan kendali", embodied: "mengambil tindakan yang jelas dan bertanggung jawab", movement: "menjaga daya dorong tanpa memaksakan hasil", emotional: "menenangkan kebutuhan untuk selalu benar atau selalu siap", balance: "menggunakan ketegasan tanpa kehilangan kelenturan" },
  Svadhisthana: { domain: "kreativitas, kenikmatan, keintiman, dan kemampuan beradaptasi", embodied: "membiarkan rutinitas memiliki ruang untuk bermain dan berubah", movement: "mengikuti aliran kreatif tanpa kehilangan arah", emotional: "memproses perubahan suasana dengan jujur", balance: "menikmati kedekatan tanpa bergantung pada kepastian terus-menerus" },
  Muladhara: { domain: "rasa aman, kestabilan, kebutuhan material, dan rasa memiliki", embodied: "membangun rutinitas serta pijakan yang dapat diandalkan", movement: "menggunakan tenaga untuk kebutuhan yang nyata dan bertahap", emotional: "mengenali respons bertahan sebelum bereaksi", balance: "menciptakan keamanan melalui langkah sederhana, dukungan, dan batas yang sehat" },
};

function chakraNarrative(chakra: string, physical: number | null, energy: number | null, emotion: number | null) {
  const context = CHAKRA_CONTEXT[chakra] ?? CHAKRA_CONTEXT.Sahasrara;
  const physicsMeaning = physical === null ? null : entry(physical);
  const energyMeaning = energy === null ? null : entry(energy);
  const emotionMeaning = emotion === null ? null : entry(emotion);
  const physicsExplanation = physicsMeaning
    ? `Dalam keseharian, area ${context.domain} cenderung tampak melalui ${phrase(physicsMeaning.lightSide)}. Pola ini terasa lebih membumi ketika kamu ${context.embodied}.`
    : null;
  const energyExplanation = energyMeaning
    ? `Doronganmu pada area ini menguat melalui ${phrase(energyMeaning.gift)}. Alirannya lebih terjaga ketika kamu ${context.movement}, tanpa menjadikannya ukuran biologis tentang banyak atau sedikitnya tenaga.`
    : null;
  const emotionsExplanation = emotionMeaning
    ? `Secara emosional, kamu dapat peka terhadap ${phrase(emotionMeaning.challenge)} ketika area ini terasa tidak pasti. Keseimbangan tumbuh saat kamu ${context.emotional}.`
    : null;
  const available = [physicsMeaning?.gift, energyMeaning?.lightSide, emotionMeaning?.growthDirection].filter((value): value is string => Boolean(value));
  const integratedExplanation = available.length
    ? `Pada area ${context.domain}, cara bertindak, dorongan, dan respons perasaanmu saling memengaruhi. Kamu lebih mudah menemukan ritme yang sehat ketika dapat ${context.balance}, sambil memberi ruang bagi proses yang tidak selalu langsung selesai.`
    : `Penjelasan area ${context.domain} belum lengkap karena sebagian nilai belum tersedia. Bagian yang tersedia tetap dapat dibaca tanpa menganggap sel kosong sebagai angka nol.`;
  return {
    physicsExplanation,
    energyExplanation,
    emotionsExplanation,
    integratedExplanation,
    shortInsight: `Area ini mengajakmu ${context.balance}.`,
    symbolicContext: `Pembacaan ${chakra} menggunakan domain simbolik chakra, posisi kolom, dan makna Arcana secara bersamaan.`,
    safetyContext: "Makna ini bersifat reflektif, bukan penilaian kondisi tubuh atau kesehatan mental.",
  };
}

export function buildDestinyMatrixPresentation(matrix: CanonicalDestinyMatrix, context: DestinyMatrixAnnualArcanaContext = {}): DestinyMatrixPresentation {
  const center = section(matrix, DESTINY_MATRIX_PATHS.CENTER, ([core]) =>
    `Kamu cenderung menata hidup melalui ${phrase(core.coreEssence)}, sehingga keputusan terasa mantap ketika nilai dan tindakanmu sejalan. Kekuatanmu muncul lewat ${phrase(core.gift)}, sementara ketegangan berulang dapat hadir saat ${phrase(core.challenge)}. Kamu semakin matang ketika ${phrase(core.growthDirection)}.`);

  const commonEnergy = section(matrix, DESTINY_MATRIX_PATHS.COMMON_ENERGY, ([start, process, expression]) =>
    `Ritme dasarmu bergerak dari ${phrase(start.lightSide)}, lalu berkembang ketika kamu belajar ${phrase(process.lifeLesson)}. Proses ini dapat tersendat oleh ${phrase(process.shadowSide)}, tetapi menjadi berguna dalam keseharian saat kamu berani ${phrase(expression.growthDirection)}.`);

  const karmicTile = section(matrix, DESTINY_MATRIX_PATHS.KARMIC_TILE, ([pattern, pressure, integration]) =>
    `Ada pola yang mudah berulang saat ${phrase(pattern.shadowSide)} mengambil alih cara pandangmu. Di bawah tekanan, kamu dapat tersangkut pada ${phrase(pressure.challenge)}, bukan karena hukuman melainkan karena respons lama terasa paling akrab. Integrasi tumbuh ketika kamu memilih ${phrase(integration.growthDirection)} dengan sadar.`);

  const lovePath = section(matrix, DESTINY_MATRIX_PATHS.LOVE_PATH, ([opening, trust, maturity]) =>
    `Dalam hubungan, kedekatan biasanya dimulai melalui ${phrase(opening.relationshipPattern)}. Kepercayaan menguat ketika ada ruang untuk ${phrase(trust.lightSide)}, sedangkan ketegangan muncul jika ${phrase(trust.shadowSide)} dibiarkan menentukan arah. Pola ini matang saat kamu mampu ${phrase(maturity.growthDirection)} tanpa meninggalkan batas dirimu.`);

  const moneyPath = section(matrix, DESTINY_MATRIX_PATHS.MONEY_PATH, ([foundation, uncertainty, transition, calling, contribution]) =>
    `Dalam karya dan penghasilan, nilai dibangun melalui ${phrase(foundation.moneyPattern)}, lalu diuji ketika ${phrase(uncertainty.shadowSide)} membuat arah terasa kabur. Peralihan menjadi mungkin saat kamu menerima ${phrase(transition.lifeLesson)} dan menanggapi ${phrase(calling.gift)} secara nyata. Kontribusimu paling matang ketika kamu berani ${phrase(contribution.growthDirection)} tanpa menjadikan hasil materi sebagai satu-satunya ukuran.`);

  const higherTalents = section(matrix, DESTINY_MATRIX_PATHS.HIGHER_TALENTS, ([root, process, expression]) =>
    `Bakat yang lebih tinggi terlihat saat ${phrase(root.gift)} bertemu keberanian menghadapi ${phrase(process.challenge)}. Potensi ini menjadi berguna melalui ${phrase(expression.gift)}, tetapi dapat kabur bila ${phrase(process.shadowSide)} tidak diperiksa. Keheningan, verifikasi nyata, dan ritme kerja yang konsisten menjaga daya ini tetap membumi.`);

  const ancestral = buildDestinyMatrixAncestralProjection(matrix.graph);
  const fatherKarmaMeanings = ancestral.fatherKarma.map((node) => entry(node.value));
  const fatherTalentMeanings = ancestral.fatherTalent.map((node) => entry(node.value));
  const motherKarmaMeanings = ancestral.motherKarma.map((node) => entry(node.value));
  const motherTalentMeanings = ancestral.motherTalent.map((node) => entry(node.value));
  const fatherWisdom = `Dari garis ayah, kamu membawa pelajaran tentang ${phrase(fatherKarmaMeanings[0].lifeLesson)} sekaligus kemampuan ${phrase(fatherTalentMeanings[0].gift)}. Kekuatan ini matang ketika struktur dan kepekaan berjalan bersama, sehingga kamu dapat memimpin tanpa harus mengendalikan semuanya.`;
  const motherWisdom = `Dari garis ibu, kamu belajar menjalani ${phrase(motherKarmaMeanings[0].lifeLesson)} sambil bertumbuh melalui ${phrase(motherTalentMeanings[1].gift)}. Intuisi dan kelenturanmu menguat ketika perubahan diterima tanpa kehilangan pusat diri.`;
  const fatherLine: DestinyMatrixLineagePresentation = {
    id: "FATHER_LINE",
    label: "Father Line",
    karma: ancestralSection("FATHER_KARMA", "Father Karma", ancestral.fatherKarma, fatherWisdom),
    talent: ancestralSection("FATHER_TALENT", "Father Talent", ancestral.fatherTalent, fatherWisdom),
    narrative: fatherWisdom,
  };
  const motherLine: DestinyMatrixLineagePresentation = {
    id: "MOTHER_LINE",
    label: "Mother Line",
    karma: ancestralSection("MOTHER_KARMA", "Mother Karma", ancestral.motherKarma, motherWisdom),
    talent: ancestralSection("MOTHER_TALENT", "Mother Talent", ancestral.motherTalent, motherWisdom),
    narrative: motherWisdom,
  };

  const graphValues = new Map(matrix.graph.nodes.map((node) => [node.id, node.value]));
  const socialProjection = matrix.projections.find((item) => item.id === "SOCIALIZATION" && item.status === "ready");
  const socialValues = socialProjection?.nodeIds.map((nodeId) => optionalNodeValue(graphValues, nodeId)) ?? [];
  const socialization: DestinyMatrixOptionalSection | null = socialValues.length === 3 && socialValues.every((value): value is number => value !== null)
    ? (() => {
      const [active, receptive, result] = socialValues;
      const activeMeaning = entry(active);
      const receptiveMeaning = entry(receptive);
      const resultMeaning = entry(result);
      return {
        sectionId: "SOCIALIZATION",
        canonicalLabel: "Socialization",
        displayLabel: "Cara Bersosialisasi",
        sourceValues: [active, receptive],
        resultValue: result,
        shortExplanation: `Cara masuk ke lingkungan bersama bergerak dari ${phrase(activeMeaning.lightSide)} dan kepekaan pada ${phrase(receptiveMeaning.gift)}.`,
        fullExplanation: `Saat memasuki kelompok, kamu cenderung membawa ${phrase(activeMeaning.lightSide)} sambil membaca suasana melalui ${phrase(receptiveMeaning.gift)}. Rasa memiliki tumbuh ketika keluarga atau lingkungan memberi ruang bagi ${phrase(resultMeaning.relationshipPattern)}, sedangkan ketegangan sosial muncul bila ${phrase(resultMeaning.shadowSide)} menentukan respons. Kamu tidak harus menjadi lebih terbuka atau lebih tertutup; yang mendukungmu adalah ${phrase(resultMeaning.growthDirection)} dengan ritme yang terasa jujur.`,
        sourceClassification: "STRUCTURED_PRE_CUTOFF_SOURCE",
        sourceVersion: "bhumi-matrix-1.0.0",
        availabilityStatus: "available",
      };
    })()
    : null;

  const healthProjection = matrix.projections.find((item) => item.id === "HEALTH" && item.status === "ready");
  const energyRows = healthProjection ? DESTINY_MATRIX_ENERGY_MATRIX.rows.map((row) => {
    const physical = optionalNodeValue(graphValues, row.physicalNodeId);
    const energy = optionalNodeValue(graphValues, row.energyNodeId);
    const emotion = optionalNodeValue(graphValues, row.emotionNodeId);
    const narrative = chakraNarrative(row.canonicalLabel, physical, energy, emotion);
    return {
      rowId: row.rowId,
      chakra: row.canonicalLabel,
      nodeIds: { physical: row.physicalNodeId, energy: row.energyNodeId, emotion: row.emotionNodeId },
      physical, energy, emotion,
      ...narrative,
    };
  }) : [];
  const physicalTotal = optionalNodeValue(graphValues, DESTINY_MATRIX_ENERGY_MATRIX.totals.physicalNodeId);
  const energyTotal = optionalNodeValue(graphValues, DESTINY_MATRIX_ENERGY_MATRIX.totals.energyNodeId);
  const emotionTotal = optionalNodeValue(graphValues, DESTINY_MATRIX_ENERGY_MATRIX.totals.emotionNodeId);
  const physicalPattern = entry(physicalTotal ?? energyRows.find((row) => row.physical !== null)?.physical ?? 8);
  const energyPattern = entry(energyTotal ?? energyRows.find((row) => row.energy !== null)?.energy ?? 8);
  const emotionPattern = entry(emotionTotal ?? energyRows.find((row) => row.emotion !== null)?.emotion ?? 8);
  const healthSummary = [
    `Dalam keseharian, kamu cenderung membawa tanggung jawab melalui ${phrase(physicalPattern.lightSide)} dan keinginan untuk membuat pengalaman terasa tertata. Kemampuan bertindak dan beradaptasi dapat berjalan berdampingan dengan kebutuhan akan kepastian. Ketika terlalu banyak hal harus dipegang sekaligus, perhatianmu perlu diberi jeda agar tidak terus bekerja tanpa ruang pulih.`,
    `Daya gerakmu berkembang saat ${phrase(energyPattern.growthDirection)}, sementara respons perasaanmu membutuhkan ruang untuk mengolah ${phrase(emotionPattern.challenge)} secara jujur. Intuisi menjadi lebih berguna ketika bertemu dengan kejelasan, ritme, dan pemeriksaan realitas. Perubahan suasana tidak harus segera diselesaikan; sebagian cukup dikenali sebelum kamu menentukan tindakan.`,
    `Keseimbangan bukan berarti seluruh bagian harus selalu sama kuat. Kamu sedang diajak mengenali kapan perlu bergerak, kapan perlu berhenti, dan kapan perlu meminta dukungan atau memperjelas batas. Rutinitas sederhana, waktu istirahat, serta satu keputusan yang dijalankan secara bertahap dapat membantu seluruh pola ini bekerja lebih selaras.`,
  ];
  const symbolicContext = "Setiap baris menggambarkan satu area simbolik dalam diri. Kolom Fisik menunjukkan bagaimana pola tersebut cenderung muncul dalam kebiasaan dan tindakan sehari-hari, kolom Energi menggambarkan cara dorongan dan perhatian bergerak, sedangkan kolom Emosi memperlihatkan bagaimana perasaan dan kebutuhan batin merespons area tersebut. Angka dibaca melalui makna Arcana dan posisi chakranya, sehingga angka yang sama dapat memiliki penjelasan berbeda pada chakra atau kolom yang berbeda.";
  const safetyContext = "Peta Keseimbangan Energi adalah pembacaan simbolik dalam kerangka Destiny Matrix. Nilainya tidak mengukur kondisi organ, kesehatan fisik, kesehatan mental, atau tingkat spiritual seseorang. Angka yang lebih besar bukan berarti lebih sehat atau lebih baik, dan angka yang lebih kecil bukan tanda bahaya; gunakan bagian ini untuk mengenali pola dan kebutuhan akan keseimbangan, bukan untuk membuat diagnosis atau keputusan medis.";
  const energyMatrix: DestinyMatrixEnergyMatrix | null = energyRows.length > 0
    ? {
      sectionId: DESTINY_MATRIX_ENERGY_MATRIX.sectionId,
      canonicalLabel: DESTINY_MATRIX_ENERGY_MATRIX.canonicalLabel,
      displayLabel: DESTINY_MATRIX_ENERGY_MATRIX.displayLabel,
      rows: energyRows,
      totals: { physical: physicalTotal, energy: energyTotal, emotion: emotionTotal },
      totalExplanation: "Nilai Total merangkum pola tindakan, pergerakan perhatian, dan pemrosesan emosi secara simbolik. Ia bukan skor kesehatan, persentase keseimbangan, atau peringkat spiritual.",
      summary: healthSummary,
      shortExplanation: symbolicContext,
      fullExplanation: healthSummary.join("\n\n"),
      safetyNotice: safetyContext,
      sourceClassification: DESTINY_MATRIX_ENERGY_MATRIX.sourceClassification,
      sourceVersion: DESTINY_MATRIX_ENERGY_MATRIX.sourceVersion,
      availabilityStatus: "available",
    }
    : null;

  const centerMeaning = entry(center.mainArcana);
  const commonMiddle = entry(commonEnergy.values[1]);
  const karmicMiddle = entry(karmicTile.values[1]);
  const loveMain = entry(lovePath.mainArcana);
  const moneyMain = entry(moneyPath.mainArcana);
  const higherGift = entry(higherTalents.mainArcana);

  const strengths = `Kapasitas alammu menyatukan ${phrase(centerMeaning.lightSide)} dengan ${phrase(commonMiddle.gift)}, sehingga kamu mampu menjaga arah sekaligus membaca perubahan. Kekuatan ini paling terasa ketika keputusan lahir dari nilai yang jernih, bukan kebutuhan untuk mengendalikan hasil.`;
  const challenges = `Pola yang terlalu sering digunakan dapat berubah menjadi ${phrase(centerMeaning.shadowSide)}, terutama ketika ketidakpastian memancing ${phrase(karmicMiddle.shadowSide)}. Titik butamu berkurang saat ketegasan berjalan bersama kelenturan dan pemeriksaan realitas.`;
  const relationshipThemes = `Kamu membangun kedekatan melalui ${phrase(loveMain.relationshipPattern)}, tetapi rasa aman tetap memerlukan batas yang dapat dibicarakan dengan jujur. Saat terpicu, kecenderungan ${phrase(karmicMiddle.shadowSide)} bisa menutup ruang dialog; kematangan hadir ketika kepercayaan tidak menuntut hilangnya kemandirian.`;
  const livelihoodThemes = `Kamu menciptakan nilai ketika ${phrase(moneyMain.gift)} ditopang oleh ${phrase(centerMeaning.gift)} dan ketekunan mengembangkan kemampuan. Ritme kerja paling sehat memberi ruang bagi intuisi sekaligus bukti nyata, karena ketegangan sumber daya mudah tumbuh dari ${phrase(moneyMain.shadowSide)}. Kontribusimu menguat saat bakat digunakan untuk menyelesaikan hal yang sungguh dibutuhkan.`;
  const growthDirection = `Arah pertumbuhanmu meminta keberanian untuk ${phrase(centerMeaning.growthDirection)} sambil tetap mengakui bagian diri yang belum pasti. Ketika ${phrase(karmicMiddle.challenge)} dihadapi tanpa menghakimi diri, pilihanmu menjadi lebih tenang dan bertanggung jawab. Kedewasaan terasa sebagai kemampuan menjaga nilai, hubungan, dan karya tetap selaras tanpa memaksakan kesempurnaan.`;

  const summary = [
    `Kamu memiliki cara yang tegas untuk menata hidup, dengan kekuatan alami pada ${phrase(centerMeaning.gift)}. Ritme batinmu berkembang melalui ${phrase(commonMiddle.lifeLesson)}, sehingga perubahan sering mengajakmu meninjau kembali apa yang benar-benar penting. Ketegangan muncul ketika ${phrase(centerMeaning.shadowSide)} mengambil terlalu banyak ruang, tetapi kejernihan kembali saat kamu memberi tempat bagi kelenturan.`,
    `Dalam kedekatan, kamu membutuhkan hubungan yang memberi ruang bagi ${phrase(loveMain.relationshipPattern)}. Kepercayaan tumbuh lewat kejujuran, batas yang jelas, dan kesediaan untuk tidak mengendalikan seluruh proses. Pola emosional menjadi lebih sehat ketika ${phrase(karmicMiddle.challenge)} dapat dibicarakan tanpa menyalahkan diri atau keluarga.`,
    `Dalam karya, kamu paling hidup saat dapat menggunakan ${phrase(centerMeaning.gift)} dan ${phrase(higherGift.gift)} secara nyata. Sumber daya berkembang ketika intuisi dipertemukan dengan verifikasi, ritme, dan tanggung jawab. Hambatan berulang biasanya muncul saat ${phrase(moneyMain.shadowSide)}, sehingga kontribusi perlu tetap berpijak pada kebutuhan yang benar-benar ada.`,
    `Pelajaran yang kembali hadir adalah keberanian untuk ${phrase(centerMeaning.growthDirection)} tanpa menunggu semua keadaan sempurna. Kamu sedang belajar memegang nilai dengan teguh sekaligus membiarkan cara lama berubah ketika tidak lagi berguna. Langkah yang membumi adalah memilih satu tindakan jujur, menjalaninya sampai selesai, lalu menilai dampaknya dengan lembut.`,
  ];

  const nodeValues = graphValues;
  const diagramNodes = DESTINY_MATRIX_NODES.map((node) => {
    const value = nodeValues.get(node.arcanaSource);
    if (value === undefined) throw new Error(`Diagram references missing Arcana source ${node.arcanaSource}.`);
    return { ...node, value };
  });
  const annualArcana = buildDestinyMatrixAnnualArcana(matrix, context);

  return {
    systemName: "Destiny Matrix",
    hero: {
      eyebrow: "Destiny Matrix",
      title: "Peta Takdir dan Pola Kehidupanmu",
      metrics: [
        { label: "Center Arcana", value: center.displayValue },
        { label: "Common Energy", value: commonEnergy.displayValue },
      ],
      insight: `Kamu cenderung bergerak melalui ${phrase(centerMeaning.lightSide)}, lalu menemukan daya terbaikmu saat ${phrase(commonMiddle.growthDirection)}.`,
      detailHref: "#detail-destiny-matrix",
    },
    center, commonEnergy, karmicTile, lovePath, moneyPath,
    fatherLine,
    motherLine,
    fatherTalents: null, motherTalents: null, higherTalents,
    soulSearching: null,
    socialization,
    spiritualKnowledge: null,
    energyMatrix,
    annualArcana,
    ageCycle: null,
    strengths, challenges, relationshipThemes, livelihoodThemes,
    ancestralThemes: `${fatherWisdom} ${motherWisdom}`,
    growthDirection,
    diagram: { viewBox: DESTINY_MATRIX_TOPOLOGY.viewBox, nodes: diagramNodes, edges: DESTINY_MATRIX_VISUAL_EDGES },
    summary,
    profileCard: {
      title: "Destiny Matrix",
      center: `Center Arcana · ${center.displayValue}`,
      commonEnergy: `Common Energy · ${commonEnergy.displayValue}`,
      insight: `Kekuatanmu terasa saat ${phrase(centerMeaning.gift)}, dengan ritme yang berkembang melalui ${phrase(commonMiddle.lifeLesson)}.`,
      action: "Lihat detail selengkapnya",
      href: "/blueprint/destiny-matrix",
    },
    sourceVersion: DESTINY_MATRIX_TOPOLOGY.sourceVersion,
    sourceClassification: DESTINY_MATRIX_TOPOLOGY.sourceClassification,
  };
}
