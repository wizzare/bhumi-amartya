import type { CanonicalDestinyMatrix } from "../types/destinyMatrix";
import { destinyMatrixArcanaDictionary, destinyMatrixArcanaDictionaryEn, type ArcanaDictionaryEntry } from "../data/destinyMatrixArcanaDictionary";
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
import { isEnlEdition } from "@/lib/config/edition";

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

const entry = (value: number, isEn = false): ArcanaDictionaryEntry => {
  const dict = isEn ? destinyMatrixArcanaDictionaryEn : destinyMatrixArcanaDictionary;
  const found = dict[value] || destinyMatrixArcanaDictionary[value];
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
const phrase = (value: string, isEn = false) => {
  const words = clean(value).split(/(\s+)/);
  let wordIndex = 0;
  return words
    .map((token) => {
      if (/^\s+$/.test(token) || token === "") return token;
      const normalized = wordIndex === 0 ? lower(token) : (isEn ? token.toLowerCase() : token.toLocaleLowerCase("id-ID"));
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

function section(matrix: CanonicalDestinyMatrix, line: DestinyMatrixTopologyLine, isEn: boolean, narrative: (items: ArcanaDictionaryEntry[]) => string): DestinyMatrixPresentationSection {
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
    narrative: narrative(values.map((val) => entry(val, isEn))),
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

const CHAKRA_CONTEXT_EN: Record<string, { domain: string; embodied: string; movement: string; emotional: string; balance: string }> = {
  Sahasrara: { domain: "life purpose and trust in your unfolding path", embodied: "making space for values, creativity, and broader perspectives", movement: "learning and acting from reasons you genuinely believe in", emotional: "feeling clarity without needing to micromanage the entire process", balance: "keeping trust flexible when life does not follow predetermined scripts" },
  Ajna: { domain: "how you perceive, imagine, and interpret experience", embodied: "pausing before jumping to conclusions", movement: "directing attention to what truly needs understanding", emotional: "distinguishing intuitive knowing from anxious anticipation", balance: "meeting imagination with grounded reality checks" },
  Vishuddha: { domain: "communication, truthfulness, and voicing lived experience", embodied: "communicating essential matters with clarity and care", movement: "choosing attuned timing and expression", emotional: "acknowledging feelings before explaining them to others", balance: "listening as deeply as you wish to be heard" },
  Anahata: { domain: "intimacy, empathy, compassion, and relational boundaries", embodied: "giving and receiving care without neglecting your own center", movement: "nurturing reciprocal, balanced connections", emotional: "opening the heart while upholding healthy boundaries", balance: "distinguishing loving kindness from an urge to rescue everyone" },
  Manipura: { domain: "willpower, self-trust, decisive agency, and relationship with control", embodied: "taking clear, accountable action", movement: "sustaining forward momentum without forcing outcomes", emotional: "calming the impulse to always be right or perfectly prepared", balance: "exercising firm resolve without losing supple flexibility" },
  Svadhisthana: { domain: "creativity, pleasure, intimacy, and adaptive flow", embodied: "allowing routine to hold room for play and organic change", movement: "following creative flow without losing your grounding", emotional: "processing changing moods with honest transparency", balance: "enjoying closeness without clinging to constant certainty" },
  Muladhara: { domain: "safety, stability, material foundations, and belonging", embodied: "building reliable routines and steady ground", movement: "investing energy in tangible, step-by-step priorities", emotional: "recognizing survival reactions before reacting", balance: "cultivating grounded safety through simple steps, supportive community, and healthy limits" },
};

function chakraNarrative(chakra: string, physical: number | null, energy: number | null, emotion: number | null, isEn = false) {
  const context = (isEn ? CHAKRA_CONTEXT_EN : CHAKRA_CONTEXT)[chakra] ?? (isEn ? CHAKRA_CONTEXT_EN.Sahasrara : CHAKRA_CONTEXT.Sahasrara);
  const physicsMeaning = physical === null ? null : entry(physical, isEn);
  const energyMeaning = energy === null ? null : entry(energy, isEn);
  const emotionMeaning = emotion === null ? null : entry(emotion, isEn);
  const physicsExplanation = physicsMeaning
    ? (isEn
      ? `In daily life, the area of ${context.domain} often manifests through ${phrase(physicsMeaning.lightSide, isEn)}. This pattern feels most grounded when you ${context.embodied}.`
      : `Dalam keseharian, area ${context.domain} cenderung tampak melalui ${phrase(physicsMeaning.lightSide)}. Pola ini terasa lebih membumi ketika kamu ${context.embodied}.`)
    : null;
  const energyExplanation = energyMeaning
    ? (isEn
      ? `Your drive in this domain strengthens through ${phrase(energyMeaning.gift, isEn)}. Its flow remains steady when you ${context.movement}, without turning it into a biological measure of high or low energy.`
      : `Doronganmu pada area ini menguat melalui ${phrase(energyMeaning.gift)}. Alirannya lebih terjaga ketika kamu ${context.movement}, tanpa menjadikannya ukuran biologis tentang banyak atau sedikitnya tenaga.`)
    : null;
  const emotionsExplanation = emotionMeaning
    ? (isEn
      ? `Emotionally, you may feel sensitive to ${phrase(emotionMeaning.challenge, isEn)} when this area feels uncertain. Equilibrium blossoms when you ${context.emotional}.`
      : `Secara emosional, kamu dapat peka terhadap ${phrase(emotionMeaning.challenge)} ketika area ini terasa tidak pasti. Keseimbangan tumbuh saat kamu ${context.emotional}.`)
    : null;
  const available = [physicsMeaning?.gift, energyMeaning?.lightSide, emotionMeaning?.growthDirection].filter((value): value is string => Boolean(value));
  const integratedExplanation = available.length
    ? (isEn
      ? `In the area of ${context.domain}, your modes of action, drive, and emotional responses continually inform one another. You find a healthy rhythm when you ${context.balance}, allowing space for processes that unfold over time.`
      : `Pada area ${context.domain}, cara bertindak, dorongan, dan respons perasaanmu saling memengaruhi. Kamu lebih mudah menemukan ritme yang sehat ketika dapat ${context.balance}, sambil memberi ruang bagi proses yang tidak selalu langsung selesai.`)
    : (isEn
      ? `Interpretations for ${context.domain} are partial as some values are unavailable. Available aspects can be read clearly without assuming blank cells represent zero.`
      : `Penjelasan area ${context.domain} belum lengkap karena sebagian nilai belum tersedia. Bagian yang tersedia tetap dapat dibaca tanpa menganggap sel kosong sebagai angka nol.`);
  return {
    physicsExplanation,
    energyExplanation,
    emotionsExplanation,
    integratedExplanation,
    shortInsight: isEn ? `This area invites you to ${context.balance}.` : `Area ini mengajakmu ${context.balance}.`,
    symbolicContext: isEn
      ? `The ${chakra} reading utilizes symbolic chakra archetypes, column positions, and Arcana meanings simultaneously.`
      : `Pembacaan ${chakra} menggunakan domain simbolik chakra, posisi kolom, dan makna Arcana secara bersamaan.`,
    safetyContext: isEn
      ? "This interpretation is reflective and symbolic, not an evaluation of physical health or mental condition."
      : "Makna ini bersifat reflektif, bukan penilaian kondisi tubuh atau kesehatan mental.",
  };
}

export function buildDestinyMatrixPresentation(
  matrix: CanonicalDestinyMatrix,
  context: DestinyMatrixAnnualArcanaContext = {},
  options: { isEn?: boolean } = {},
): DestinyMatrixPresentation {
  const isEn = options.isEn ?? isEnlEdition();

  const center = section(matrix, DESTINY_MATRIX_PATHS.CENTER, isEn, ([core]) =>
    isEn
      ? `You naturally structure life through ${phrase(core.coreEssence, isEn)}, so decisions feel deeply grounded when your values and actions align. Your innate strength emerges through ${phrase(core.gift, isEn)}, while recurring friction may arise during ${phrase(core.challenge, isEn)}. You mature steadily as you ${phrase(core.growthDirection, isEn)}.`
      : `Kamu cenderung menata hidup melalui ${phrase(core.coreEssence)}, sehingga keputusan terasa mantap ketika nilai dan tindakanmu sejalan. Kekuatanmu muncul lewat ${phrase(core.gift)}, sementara ketegangan berulang dapat hadir saat ${phrase(core.challenge)}. Kamu semakin matang ketika ${phrase(core.growthDirection)}.`);

  const commonEnergy = section(matrix, DESTINY_MATRIX_PATHS.COMMON_ENERGY, isEn, ([start, process, expression]) =>
    isEn
      ? `Your foundational rhythm moves from ${phrase(start.lightSide, isEn)}, expanding as you learn ${phrase(process.lifeLesson, isEn)}. This process can stall through ${phrase(process.shadowSide, isEn)}, but becomes deeply practical in daily living as you courageously ${phrase(expression.growthDirection, isEn)}.`
      : `Ritme dasarmu bergerak dari ${phrase(start.lightSide)}, lalu berkembang ketika kamu belajar ${phrase(process.lifeLesson)}. Proses ini dapat tersendat oleh ${phrase(process.shadowSide)}, tetapi menjadi berguna dalam keseharian saat kamu berani ${phrase(expression.growthDirection)}.`);

  const karmicTile = section(matrix, DESTINY_MATRIX_PATHS.KARMIC_TILE, isEn, ([pattern, pressure, integration]) =>
    isEn
      ? `There is a recurrent pattern when ${phrase(pattern.shadowSide, isEn)} colors your perception. Under pressure, you can get caught in ${phrase(pressure.challenge, isEn)}, not out of retribution, but because familiar responses feel most natural. Integration blossoms when you consciously choose ${phrase(integration.growthDirection, isEn)}.`
      : `Ada pola yang mudah berulang saat ${phrase(pattern.shadowSide)} mengambil alih cara pandangmu. Di bawah tekanan, kamu dapat tersangkut pada ${phrase(pressure.challenge)}, bukan karena hukuman melainkan karena respons lama terasa paling akrab. Integrasi tumbuh ketika kamu memilih ${phrase(integration.growthDirection)} dengan sadar.`);

  const lovePath = section(matrix, DESTINY_MATRIX_PATHS.LOVE_PATH, isEn, ([opening, trust, maturity]) =>
    isEn
      ? `In relationship, emotional connection often initiates through ${phrase(opening.relationshipPattern, isEn)}. Trust strengthens when there is spaciousness for ${phrase(trust.lightSide, isEn)}, whereas tension surfaces if ${phrase(trust.shadowSide, isEn)} drives reactions. This pattern ripens as you learn to ${phrase(maturity.growthDirection, isEn)} without abandoning your personal boundaries.`
      : `Dalam hubungan, kedekatan biasanya dimulai melalui ${phrase(opening.relationshipPattern)}. Kepercayaan menguat ketika ada ruang untuk ${phrase(trust.lightSide)}, sedangkan ketegangan muncul jika ${phrase(trust.shadowSide)} dibiarkan menentukan arah. Pola ini matang saat kamu mampu ${phrase(maturity.growthDirection)} tanpa meninggalkan batas dirimu.`);

  const moneyPath = section(matrix, DESTINY_MATRIX_PATHS.MONEY_PATH, isEn, ([foundation, uncertainty, transition, calling, contribution]) =>
    isEn
      ? `In livelihood and enterprise, value is built through ${phrase(foundation.moneyPattern, isEn)}, and tested when ${phrase(uncertainty.shadowSide, isEn)} blurs your sense of direction. Meaningful transition becomes possible when you integrate ${phrase(transition.lifeLesson, isEn)} and honor ${phrase(calling.gift, isEn)} in tangible ways. Your contribution matures as you dare to ${phrase(contribution.growthDirection, isEn)} without measuring worth solely by material metrics.`
      : `Dalam karya dan penghasilan, nilai dibangun melalui ${phrase(foundation.moneyPattern)}, lalu diuji ketika ${phrase(uncertainty.shadowSide)} membuat arah terasa kabur. Peralihan menjadi mungkin saat kamu menerima ${phrase(transition.lifeLesson)} dan menanggapi ${phrase(calling.gift)} secara nyata. Kontribusimu paling matang ketika kamu berani ${phrase(contribution.growthDirection)} tanpa menjadikan hasil materi sebagai satu-satunya ukuran.`);

  const higherTalents = section(matrix, DESTINY_MATRIX_PATHS.HIGHER_TALENTS, isEn, ([root, process, expression]) =>
    isEn
      ? `Your higher gifts emerge when ${phrase(root.gift, isEn)} meets the courage to navigate ${phrase(process.challenge, isEn)}. This potential becomes genuinely useful through ${phrase(expression.gift, isEn)}, but can become obscure if ${phrase(process.shadowSide, isEn)} goes unexamined. Stillness, grounded verification, and consistent work rhythms keep this capacity anchored.`
      : `Bakat yang lebih tinggi terlihat saat ${phrase(root.gift)} bertemu keberanian menghadapi ${phrase(process.challenge)}. Potensi ini menjadi berguna melalui ${phrase(expression.gift)}, tetapi dapat kabur bila ${phrase(process.shadowSide)} tidak diperiksa. Keheningan, verifikasi nyata, dan ritme kerja yang konsisten menjaga daya ini tetap membumi.`);

  const ancestral = buildDestinyMatrixAncestralProjection(matrix.graph);
  const fatherKarmaMeanings = ancestral.fatherKarma.map((node) => entry(node.value, isEn));
  const fatherTalentMeanings = ancestral.fatherTalent.map((node) => entry(node.value, isEn));
  const motherKarmaMeanings = ancestral.motherKarma.map((node) => entry(node.value, isEn));
  const motherTalentMeanings = ancestral.motherTalent.map((node) => entry(node.value, isEn));
  const fatherWisdom = isEn
    ? `From your paternal lineage, you carry lessons surrounding ${phrase(fatherKarmaMeanings[0].lifeLesson, isEn)} alongside the inherited talent of ${phrase(fatherTalentMeanings[0].gift, isEn)}. This power matures when structure and sensitivity walk hand in hand, allowing you to lead without having to control every detail.`
    : `Dari garis ayah, kamu membawa pelajaran tentang ${phrase(fatherKarmaMeanings[0].lifeLesson)} sekaligus kemampuan ${phrase(fatherTalentMeanings[0].gift)}. Kekuatan ini matang ketika struktur dan kepekaan berjalan bersama, sehingga kamu dapat memimpin tanpa harus mengendalikan semuanya.`;
  const motherWisdom = isEn
    ? `From your maternal lineage, you navigate ${phrase(motherKarmaMeanings[0].lifeLesson, isEn)} while blossoming through ${phrase(motherTalentMeanings[1].gift, isEn)}. Your intuition and flexibility deepen when change is welcomed without losing your inner center.`
    : `Dari garis ibu, kamu belajar menjalani ${phrase(motherKarmaMeanings[0].lifeLesson)} sambil bertumbuh melalui ${phrase(motherTalentMeanings[1].gift)}. Intuisi dan kelenturanmu menguat ketika perubahan diterima tanpa kehilangan pusat diri.`;
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
      const activeMeaning = entry(active, isEn);
      const receptiveMeaning = entry(receptive, isEn);
      const resultMeaning = entry(result, isEn);
      return {
        sectionId: "SOCIALIZATION",
        canonicalLabel: "Socialization",
        displayLabel: isEn ? "Social Dynamics" : "Cara Bersosialisasi",
        sourceValues: [active, receptive],
        resultValue: result,
        shortExplanation: isEn
          ? `Your way of entering shared environments emerges from ${phrase(activeMeaning.lightSide, isEn)} and sensitivity to ${phrase(receptiveMeaning.gift, isEn)}.`
          : `Cara masuk ke lingkungan bersama bergerak dari ${phrase(activeMeaning.lightSide)} dan kepekaan pada ${phrase(receptiveMeaning.gift)}.`,
        fullExplanation: isEn
          ? `When joining groups, you tend to bring ${phrase(activeMeaning.lightSide, isEn)} while reading the room through ${phrase(receptiveMeaning.gift, isEn)}. Belonging flourishes when your community gives space for ${phrase(resultMeaning.relationshipPattern, isEn)}, whereas social stress arises if ${phrase(resultMeaning.shadowSide, isEn)} dictates responses. You don't have to force yourself to be more extroverted or introverted; what genuinely supports you is ${phrase(resultMeaning.growthDirection, isEn)} in an authentic rhythm.`
          : `Saat memasuki kelompok, kamu cenderung membawa ${phrase(activeMeaning.lightSide)} sambil membaca suasana melalui ${phrase(receptiveMeaning.gift)}. Rasa memiliki tumbuh ketika keluarga atau lingkungan memberi ruang bagi ${phrase(resultMeaning.relationshipPattern)}, sedangkan ketegangan sosial muncul bila ${phrase(resultMeaning.shadowSide)} menentukan respons. Kamu tidak harus menjadi lebih terbuka atau lebih tertutup; yang mendukungmu adalah ${phrase(resultMeaning.growthDirection)} dengan ritme yang terasa jujur.`,
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
    const narrative = chakraNarrative(row.canonicalLabel, physical, energy, emotion, isEn);
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
  const physicalPattern = entry(physicalTotal ?? energyRows.find((row) => row.physical !== null)?.physical ?? 8, isEn);
  const energyPattern = entry(energyTotal ?? energyRows.find((row) => row.energy !== null)?.energy ?? 8, isEn);
  const emotionPattern = entry(emotionTotal ?? energyRows.find((row) => row.emotion !== null)?.emotion ?? 8, isEn);
  const healthSummary = isEn
    ? [
      `In daily living, you navigate responsibility through ${phrase(physicalPattern.lightSide, isEn)} and an innate desire to keep experiences organized. Your capacity for action and adaptation can harmoniously coexist with your need for certainty. When juggling multiple commitments, your awareness requires intentional pauses so it doesn't run without recovery.`,
      `Your vital drive flourishes through ${phrase(energyPattern.growthDirection, isEn)}, while your emotional life asks for spaciousness to process ${phrase(emotionPattern.challenge, isEn)} with honest grace. Intuition becomes truly constructive when coupled with clarity, rhythm, and reality checks. Mood shifts do not always require immediate fixing; many simply need acknowledgement before choosing your next step.`,
      `Balance does not mean all areas must constantly hold equal intensity. You are invited to discern when to step forward, when to pause, and when to ask for support or clarify boundaries. Simple routines, restorative rest, and single decisions carried out step-by-step help this entire pattern operate in harmony.`,
    ]
    : [
      `Dalam keseharian, kamu cenderung membawa tanggung jawab melalui ${phrase(physicalPattern.lightSide)} dan keinginan untuk membuat pengalaman terasa tertata. Kemampuan bertindak dan beradaptasi dapat berjalan berdampingan dengan kebutuhan akan kepastian. Ketika terlalu banyak hal harus dipegang sekaligus, perhatianmu perlu diberi jeda agar tidak terus bekerja tanpa ruang pulih.`,
      `Daya gerakmu berkembang saat ${phrase(energyPattern.growthDirection)}, sementara respons perasaanmu membutuhkan ruang untuk mengolah ${phrase(emotionPattern.challenge)} secara jujur. Intuisi menjadi lebih berguna ketika bertemu dengan kejelasan, ritme, dan pemeriksaan realitas. Perubahan suasana tidak harus segera diselesaikan; sebagian cukup dikenali sebelum kamu menentukan tindakan.`,
      `Keseimbangan bukan berarti seluruh bagian harus selalu sama kuat. Kamu sedang diajak mengenali kapan perlu bergerak, kapan perlu berhenti, dan kapan perlu meminta dukungan atau memperjelas batas. Rutinitas sederhana, waktu istirahat, serta satu keputusan yang dijalankan secara bertahap dapat membantu seluruh pola ini bekerja lebih selaras.`,
    ];
  const symbolicContext = isEn
    ? "Each row represents a symbolic domain of self. The Physics column illustrates how patterns appear in daily habits and actions, the Energy column describes the flow of drive and attention, and the Emotions column shows internal feelings and emotional responses. Numbers are interpreted through Arcana archetypes and chakra placement simultaneously, meaning the same number carries nuanced meanings across different chakras."
    : "Setiap baris menggambarkan satu area simbolik dalam diri. Kolom Fisik menunjukkan bagaimana pola tersebut cenderung muncul dalam kebiasaan dan tindakan sehari-hari, kolom Energi menggambarkan cara dorongan dan perhatian bergerak, sedangkan kolom Emosi memperlihatkan bagaimana perasaan dan kebutuhan batin merespons area tersebut. Angka dibaca melalui makna Arcana dan posisi chakranya, sehingga angka yang sama dapat memiliki penjelasan berbeda pada chakra atau kolom yang berbeda.";
  const safetyContext = isEn
    ? "The Energy Balance Map is a reflective, symbolic reading within the Destiny Matrix model. Its values do not diagnose organ health, physical wellness, mental conditions, or spiritual attainment. Larger numbers do not denote greater health, and smaller numbers do not signal danger; use this section to identify patterns and invitations for equilibrium, not for medical diagnosis."
    : "Peta Keseimbangan Energi adalah pembacaan simbolik dalam kerangka Destiny Matrix. Nilainya tidak mengukur kondisi organ, kesehatan fisik, kesehatan mental, atau tingkat spiritual seseorang. Angka yang lebih besar bukan berarti lebih sehat atau lebih baik, dan angka yang lebih kecil bukan tanda bahaya; gunakan bagian ini untuk mengenali pola dan kebutuhan akan keseimbangan, bukan untuk membuat diagnosis atau keputusan medis.";
  const totalExplanation = isEn
    ? "Total values synthesize patterns of action, attention movement, and emotional processing symbolically. They do not constitute a health score, balance percentage, or spiritual ranking."
    : "Nilai Total merangkum pola tindakan, pergerakan perhatian, dan pemrosesan emosi secara simbolik. Ia bukan skor kesehatan, persentase keseimbangan, atau peringkat spiritual.";

  const energyMatrix: DestinyMatrixEnergyMatrix | null = energyRows.length > 0
    ? {
      sectionId: DESTINY_MATRIX_ENERGY_MATRIX.sectionId,
      canonicalLabel: DESTINY_MATRIX_ENERGY_MATRIX.canonicalLabel,
      displayLabel: isEn ? "Energy Balance Map" : DESTINY_MATRIX_ENERGY_MATRIX.displayLabel,
      rows: energyRows,
      totals: { physical: physicalTotal, energy: energyTotal, emotion: emotionTotal },
      totalExplanation,
      summary: healthSummary,
      shortExplanation: symbolicContext,
      fullExplanation: healthSummary.join("\n\n"),
      safetyNotice: safetyContext,
      sourceClassification: DESTINY_MATRIX_ENERGY_MATRIX.sourceClassification,
      sourceVersion: DESTINY_MATRIX_ENERGY_MATRIX.sourceVersion,
      availabilityStatus: "available",
    }
    : null;

  const centerMeaning = entry(center.mainArcana, isEn);
  const commonMiddle = entry(commonEnergy.values[1], isEn);
  const karmicMiddle = entry(karmicTile.values[1], isEn);
  const loveMain = entry(lovePath.mainArcana, isEn);
  const moneyMain = entry(moneyPath.mainArcana, isEn);
  const higherGift = entry(higherTalents.mainArcana, isEn);

  const strengths = isEn
    ? `Your natural capacity unites ${phrase(centerMeaning.lightSide, isEn)} with ${phrase(commonMiddle.gift, isEn)}, allowing you to maintain clear direction while attuning to change. This strength feels most radiant when decisions stem from transparent values rather than a need to control outcomes.`
    : `Kapasitas alammu menyatukan ${phrase(centerMeaning.lightSide)} dengan ${phrase(commonMiddle.gift)}, sehingga kamu mampu menjaga arah sekaligus membaca perubahan. Kekuatan ini paling terasa ketika keputusan lahir dari nilai yang jernih, bukan kebutuhan untuk mengendalikan hasil.`;
  const challenges = isEn
    ? `Overused patterns can tilt into ${phrase(centerMeaning.shadowSide, isEn)}, particularly when uncertainty triggers ${phrase(karmicMiddle.shadowSide, isEn)}. Blind spots diminish when firmness is balanced with flexibility and honest reality checks.`
    : `Pola yang terlalu sering digunakan dapat berubah menjadi ${phrase(centerMeaning.shadowSide)}, terutama ketika ketidakpastian memancing ${phrase(karmicMiddle.shadowSide)}. Titik butamu berkurang saat ketegasan berjalan bersama kelenturan dan pemeriksaan realitas.`;
  const relationshipThemes = isEn
    ? `You cultivate intimacy through ${phrase(loveMain.relationshipPattern, isEn)}, yet true security requires boundaries that can be voiced honestly. When triggered, the habit of ${phrase(karmicMiddle.shadowSide, isEn)} can close down open dialogue; maturity blossoms when trust does not demand forfeiting autonomy.`
    : `Kamu membangun kedekatan melalui ${phrase(loveMain.relationshipPattern)}, tetapi rasa aman tetap memerlukan batas yang dapat dibicarakan dengan jujur. Saat terpicu, kecenderungan ${phrase(karmicMiddle.shadowSide)} bisa menutup ruang dialog; kematangan hadir ketika kepercayaan tidak menuntut hilangnya kemandirian.`;
  const livelihoodThemes = isEn
    ? `You generate value when ${phrase(moneyMain.gift, isEn)} is anchored by ${phrase(centerMeaning.gift, isEn)} and patient skill cultivation. The healthiest work rhythm leaves room for intuition and practical evidence alike, as resource anxieties easily germinate from ${phrase(moneyMain.shadowSide, isEn)}. Your contribution thrives when talents meet genuine community needs.`
    : `Kamu menciptakan nilai ketika ${phrase(moneyMain.gift)} ditopang oleh ${phrase(centerMeaning.gift)} dan ketekunan mengembangkan kemampuan. Ritme kerja paling sehat memberi ruang bagi intuisi sekaligus bukti nyata, karena ketegangan sumber daya mudah tumbuh dari ${phrase(moneyMain.shadowSide)}. Kontribusimu menguat saat bakat digunakan untuk menyelesaikan hal yang sungguh dibutuhkan.`;
  const growthDirection = isEn
    ? `Your growth direction invites the courage to ${phrase(centerMeaning.growthDirection, isEn)} while acknowledging parts of yourself that remain in process. When ${phrase(karmicMiddle.challenge, isEn)} is met without self-reproach, your choices become calmer and more grounded. Maturity feels like keeping values, relationships, and work aligned without demanding perfection.`
    : `Arah pertumbuhanmu meminta keberanian untuk ${phrase(centerMeaning.growthDirection)} sambil tetap mengakui bagian diri yang belum pasti. Ketika ${phrase(karmicMiddle.challenge)} dihadapi tanpa menghakimi diri, pilihanmu menjadi lebih tenang dan bertanggung jawab. Kedewasaan terasa sebagai kemampuan menjaga nilai, hubungan, dan karya tetap selaras tanpa memaksakan kesempurnaan.`;

  const summary = isEn
    ? [
      `You possess a grounded way of ordering your life, with natural strength anchored in ${phrase(centerMeaning.gift, isEn)}. Your inner rhythm evolves through ${phrase(commonMiddle.lifeLesson, isEn)}, so changes often invite you to reconsider what truly matters. Tension arises when ${phrase(centerMeaning.shadowSide, isEn)} takes excessive room, but lucidity returns when you welcome flexibility.`,
      `In closeness, you flourish in connections that offer space for ${phrase(loveMain.relationshipPattern, isEn)}. Trust grows through transparency, clear boundaries, and willingness to let processes unfold without micromanagement. Emotional patterns become healthier when ${phrase(karmicMiddle.challenge, isEn)} can be shared without self-blame or projecting onto family.`,
      `In livelihood, you feel most alive when applying ${phrase(centerMeaning.gift, isEn)} and ${phrase(higherGift.gift, isEn)} in tangible form. Resources expand when intuition connects with reality testing, cadence, and accountability. Recurring roadblocks often stem from ${phrase(moneyMain.shadowSide, isEn)}, calling your contributions to remain grounded in genuine needs.`,
      `A recurring lesson is having the courage to ${phrase(centerMeaning.growthDirection, isEn)} without waiting for flawless circumstances. You are learning to hold values steadfastly while letting outmoded habits transform when no longer helpful. A grounded next step is choosing one honest action, seeing it through to completion, and assessing its impact with kindness.`,
    ]
    : [
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
  const annualArcana = buildDestinyMatrixAnnualArcana(matrix, context, { isEn });

  return {
    systemName: "Destiny Matrix",
    hero: {
      eyebrow: "Destiny Matrix",
      title: isEn ? "Map of Destiny and Life Patterns" : "Peta Takdir dan Pola Kehidupanmu",
      metrics: [
        { label: "Center Arcana", value: center.displayValue },
        { label: "Common Energy", value: commonEnergy.displayValue },
      ],
      insight: isEn
        ? `You naturally move through ${phrase(centerMeaning.lightSide, isEn)}, reaching your highest potential as you ${phrase(commonMiddle.growthDirection, isEn)}.`
        : `Kamu cenderung bergerak melalui ${phrase(centerMeaning.lightSide)}, lalu menemukan daya terbaikmu saat ${phrase(commonMiddle.growthDirection)}.`,
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
      insight: isEn
        ? `Your strength radiates through ${phrase(centerMeaning.gift, isEn)}, with a rhythm that matures through ${phrase(commonMiddle.lifeLesson, isEn)}.`
        : `Kekuatanmu terasa saat ${phrase(centerMeaning.gift)}, dengan ritme yang berkembang melalui ${phrase(commonMiddle.lifeLesson)}.`,
      action: isEn ? "View full details" : "Lihat detail selengkapnya",
      href: "/blueprint/destiny-matrix",
    },
    sourceVersion: DESTINY_MATRIX_TOPOLOGY.sourceVersion,
    sourceClassification: DESTINY_MATRIX_TOPOLOGY.sourceClassification,
  };
}
