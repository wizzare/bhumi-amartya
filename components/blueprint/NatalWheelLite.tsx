"use client";

type Props = { astrology: Record<string, any> };
const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const glyphs: Record<string, string> = { Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇", Chiron: "⚷", NorthNode: "☊", SouthNode: "☋", Lilith: "⚸" };
const aspectColors: Record<string, string> = { Opposition: "#B84F45", Square: "#C86B4A", Trine: "#4E8B73", Sextile: "#4F7FA3", Conjunction: "#7B5C92" };
const polar = (longitude: number, radius: number) => {
  const angle = (longitude - 90) * Math.PI / 180;
  return { x: 210 + Math.cos(angle) * radius, y: 210 + Math.sin(angle) * radius };
};

export function NatalWheelLite({ astrology }: Props) {
  const planets = { ...(astrology.planets || {}) };
  if (astrology.lilith) planets.Lilith = { ...astrology.lilith, longitude: signs.indexOf(astrology.lilith.sign) * 30 + Number(astrology.lilith.degree) };
  const entries = Object.entries(planets).filter(([, value]: any) => Number.isFinite(Number(value.longitude)));
  const aspects = Array.isArray(astrology.aspects) ? astrology.aspects : [];
  const ascLongitude = astrology.placidusHouses?.house1?.longitude ?? astrology.houses?.house1?.longitude;
  const mcLongitude = astrology.midheavenLongitude ?? astrology.placidusHouses?.house10?.longitude;

  return (
    <section className="rounded-3xl border border-[#DED7CA] bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7B8776]">Visual Blueprint Audit</p>
      <h2 className="mt-1 font-serif text-2xl text-[#4F5E52]">Natal Wheel Lite</h2>
      <svg viewBox="0 0 420 420" className="mx-auto mt-4 w-full max-w-[440px]" aria-label="Natal wheel">
        <circle cx="210" cy="210" r="200" fill="#FCFAF5" stroke="#4F5E52" strokeWidth="2" />
        <circle cx="210" cy="210" r="150" fill="white" stroke="#B8B0A3" />
        <circle cx="210" cy="210" r="92" fill="#FCFAF5" stroke="#D8D0C3" />
        {signs.map((sign, index) => {
          const a = polar(index * 30, 200); const b = polar(index * 30, 92); const label = polar(index * 30 + 15, 176);
          return <g key={sign}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#D8D0C3" /><text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill="#6D756D">{sign.slice(0, 3)}</text></g>;
        })}
        {Array.from({ length: 12 }, (_, index) => {
          const cusp = astrology.placidusHouses?.[`house${index + 1}`] || astrology.houses?.[`house${index + 1}`];
          if (!cusp || !Number.isFinite(Number(cusp.longitude))) return null;
          const outer = polar(Number(cusp.longitude), 150); const inner = polar(Number(cusp.longitude), 92); const label = polar(Number(cusp.longitude) + 8, 113);
          return <g key={index}><line x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="#857968" strokeWidth="1.2" /><text x={label.x} y={label.y} fontSize="9" textAnchor="middle" fill="#857968">{index + 1}</text></g>;
        })}
        {aspects.map((aspect: any, index: number) => {
          const p1 = planets[aspect.p1 || aspect.planet1]; const p2 = planets[aspect.p2 || aspect.planet2];
          if (!p1 || !p2) return null;
          const a = polar(Number(p1.longitude), 88); const b = polar(Number(p2.longitude), 88);
          return <line key={index} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={aspectColors[aspect.type || aspect.aspectType] || "#999"} strokeWidth="1.2" opacity=".75" />;
        })}
        {entries.map(([name, value]: any) => {
          const point = polar(Number(value.longitude), 135);
          return <g key={name}><circle cx={point.x} cy={point.y} r="10" fill="#4F5E52" /><text x={point.x} y={point.y + 4} textAnchor="middle" fontSize="13" fill="white">{glyphs[name] || name[0]}</text></g>;
        })}
        {Number.isFinite(Number(ascLongitude)) && <text x="210" y="205" textAnchor="middle" fontSize="11" fontWeight="700" fill="#4F5E52">ASC {astrology.risingSign || astrology.ascendant}</text>}
        {Number.isFinite(Number(mcLongitude)) && <text x="210" y="220" textAnchor="middle" fontSize="11" fontWeight="700" fill="#4F5E52">MC {astrology.mc || astrology.midheaven}</text>}
      </svg>
      <div className="mt-3 flex flex-wrap gap-2 text-[10px]">{Object.entries(aspectColors).map(([type, color]) => <span key={type} className="rounded-full px-2 py-1 text-white" style={{ backgroundColor: color }}>{type}</span>)}</div>
    </section>
  );
}
