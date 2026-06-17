/**
 * BHUMI AMARTYA - Career Intelligence Engine
 * Synthesizes multi-source blueprint data into specific career potentials.
 * Logic: 80% Rule Engine, 15% Template, 5% AI (handled via prompts).
 */

import { Blueprint } from "@/lib/types/blueprint";
import { getCanonicalHumanDesignType } from "@/lib/humandesign/hdAudit";

export interface CareerIntelligence {
  summary: string;
  careerDna: string;
  topRoles: string[];
  workStyle: string;
  idealEnvironment: string;
  challenges: string[];
  prosperityPattern: string;
  thingsToAvoid: string[];
  sources: string[];
}

export const careerIntelligenceEngine = {
  calculateCareer(blueprint: Blueprint): CareerIntelligence {
    const lp = blueprint.lifePath?.number || 1;
    const hdType = getCanonicalHumanDesignType(blueprint.humanDesign);
    const dm = blueprint.destinyMatrix || {};
    const moneyLine = dm.moneyLine || [];
    const mc = (blueprint.natalChart as any)?.midheaven || (blueprint.astrology as any)?.midheaven || "";

    // 1. Career DNA Dominant
    let careerDna = "System Builder";
    if ([1, 8].includes(lp) || dm.arcanaCenter === 8 || dm.center === 8) careerDna = "Founder / Operator";
    else if ([3, 5].includes(lp) || dm.center === 3) careerDna = "Creator / Storyteller";
    else if ([7, 11].includes(lp) || dm.center === 7) careerDna = "Researcher / Strategist";
    else if ([6, 9, 33].includes(lp) || dm.center === 6) careerDna = "Healing Guide / Mentor";
    else if (hdType === "Projector") careerDna = "Cultural Architect / Advisor";

    // 2. Top 5 Peran Cocok
    let topRoles = ["Operations Manager", "Business Analyst", "Product Lead", "Consultant", "Specialist"];

    // Refine by HD Type
    if (hdType === "Manifestor") topRoles = ["Founder", "Creative Director", "Initiator", "Independent Consultant", "Visionary Leader"];
    if (hdType === "Projector") topRoles = ["Advisor", "Coach", "Curator", "System Designer", "Strategic Planner"];

    // Refine by MC (Midheaven)
    if (mc === "Aries") topRoles = ["Entrepreneur", "Leader", "Pioneer", "Coach", "Contractor"];
    if (mc === "Taurus") topRoles = ["Financial Advisor", "Manager", "Chef", "Designer", "Real Estate"];
    if (mc === "Gemini") topRoles = ["Writer", "Journalist", "Public Speaker", "Sales", "Educator"];
    if (mc === "Cancer") topRoles = ["Psychologist", "Chef", "Human Resources", "Nurturer", "Historian"];
    if (mc === "Leo") topRoles = ["Actor", "CEO", "Creative Director", "Manager", "Performer"];
    if (mc === "Virgo") topRoles = ["Editor", "Analyst", "Researcher", "Service Specialist", "Health Practitioner"];
    if (mc === "Libra") topRoles = ["Lawyer", "Diplomat", "Designer", "Mediator", "Partner"];
    if (mc === "Scorpio") topRoles = ["Investigator", "Psychologist", "Researcher", "Crisis Manager", "Strategist"];
    if (mc === "Sagittarius") topRoles = ["Professor", "Travel Guide", "Philosopher", "Publisher", "Entrepreneur"];
    if (mc === "Capricorn") topRoles = ["Administrator", "Government Official", "Executive", "Architect", "Scientist"];
    if (mc === "Aquarius") topRoles = ["Social Worker", "IT Specialist", "Humanitarian", "Innovator", "Scientist"];
    if (mc === "Pisces") topRoles = ["Artist", "Healer", "Musician", "Visionary", "Counselor"];

    // 3. Gaya Kerja Alami
    let workStyle = "Mandiri & Terstruktur";
    if (hdType === "Generator") workStyle = "Tekun, Konsisten, Step-by-step (Needs response)";
    if (hdType === "Manifesting Generator") workStyle = "Cepat, Multi-tasking, Menggabungkan inisiasi dan dedikasi";
    if (hdType === "Projector") workStyle = "Efisien, Mendalam, Bimbingan (Needs invitation)";
    if (hdType === "Manifestor") workStyle = "Inisiatif tinggi, Otonom, Memberi pengaruh (Needs to inform)";
    if (hdType === "Reflector") workStyle = "Observatif, Objektif, Penyelaras lingkungan";

    // 4. Lingkungan Kerja Ideal
    let idealEnvironment = "Organisasi Profesional";
    if (lp === 5 || hdType === "Manifestor") idealEnvironment = "Lingkungan yang Dinamis & Memiliki Otonomi Penuh";
    if ([2, 6, 33].includes(lp)) idealEnvironment = "Komunitas, Edukasi, atau Tim yang Mengutamakan Harmoni";
    if (lp === 8 || dm.center === 8) idealEnvironment = "Lingkungan Kompetitif, Skala Besar, atau Institusi Finansial";
    if (lp === 7 || dm.center === 7) idealEnvironment = "Lingkungan Hening, Akademik, atau Studio Kreatif";

    // 5. Tantangan Karir
    let challenges = ["Perfeksionisme berlebih", "Kesulitan dalam delegasi"];
    if (lp === 4) challenges = ["Terlalu memikul tanggung jawab orang lain", "Kaku pada perubahan"];
    if (lp === 5) challenges = ["Sulit fokus pada satu bidang", "Kegelisahan saat rutinitas melambat"];
    if (hdType === "Projector") challenges = ["Burnout karena mencoba 'keep up' dengan Generator", "Pahit saat tidak diapresiasi"];
    if (hdType === "Manifestor") challenges = ["Merasa ditahan oleh orang lain", "Sulit berkomunikasi sebelum bergerak"];

    // 6. Pola Rezeki
    let prosperityPattern = "Rezeki menguat saat kamu membangun pondasi yang stabil.";
    if (dm.moneyLine?.includes(3) || lp === 3) prosperityPattern = "Pendapatan mengalir melalui kreativitas, komunikasi, dan kejujuran ekspresi.";
    if (dm.moneyLine?.includes(8) || lp === 8) prosperityPattern = "Kelimpahan datang saat kamu berani mengelola daya besar dan sistem material.";
    if (dm.moneyLine?.includes(6) || lp === 6) prosperityPattern = "Rezeki terhubung dengan caramu merawat, membimbing, dan memberi manfaat bagi sesama.";
    if (hdType === "Projector") prosperityPattern = "Kemakmuran datang lewat pengakuan atas sistem yang kamu bimbing, bukan dari tenaga fisik.";

    // 7. Hal yang Perlu Dihindari
    let thingsToAvoid = ["Lingkungan toxic", "Rutinitas tanpa visi"];
    if (hdType === "Reflector") thingsToAvoid = ["Lingkungan yang sibuk dan bising secara konstan", "Keputusan mendesak"];
    if (lp === 1) thingsToAvoid = ["Menjadi pengikut yang tidak memiliki inisiatif", "Sistem yang birokratis kaku"];
    if (dm.moneyLine?.includes(15)) thingsToAvoid = ["Pekerjaan yang membatasi hasrat dan antusiasme", "Keterikatan material yang berlebihan"];

    // 8. Summary
    const summary = `Kamu memiliki Career DNA sebagai ${careerDna}. Kesuksesanmu berakar pada ${workStyle.toLowerCase()} dan kemampuanmu untuk ${prosperityPattern.split(" ").slice(3, 7).join(" ")}.`;

    const sources = ["Life Path"];
    if (hdType) sources.push("Human Design");
    if (moneyLine.length > 0 || dm.center) sources.push("Destiny Matrix");
    if (mc) sources.push("Natal Chart");

    return {
      summary,
      careerDna,
      topRoles: topRoles.slice(0, 5),
      workStyle,
      idealEnvironment,
      challenges,
      prosperityPattern,
      thingsToAvoid,
      sources
    };
  }
};
