import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import type { AstroWeatherReflection } from "@/lib/astrology/astroWeather";
import { ASTRO_WEATHER_FALLBACK_MESSAGE } from "@/lib/astrology/astroWeather";

interface AstroEnergyTodayProps {
  weather: AstroWeatherReflection | null;
}

export function AstroEnergyToday({ weather }: AstroEnergyTodayProps) {
  if (!weather) {
    return (
      <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-purple-800/20 mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-200">Astro Hari Ini</CardTitle>
          <Zap className="h-4 w-4 text-purple-300" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-purple-400/80">
            {ASTRO_WEATHER_FALLBACK_MESSAGE}
          </p>
        </CardContent>
      </Card>
    );
  }

  const skyItems = [
    {
      label: "Fase Bulan",
      value: weather.currentSky.moonPhase,
      subValue: weather.currentSky.nextMajorMoonPhase,
    },
    {
      label: "Retrograde",
      value: weather.currentSky.retrogrades.length > 0 ? weather.currentSky.retrogrades.join(", ") : "N/A",
    },
    {
      label: "Aspek Utama",
      value: weather.currentSky.majorAspects.length > 0 ? weather.currentSky.majorAspects.join(", ") : "N/A",
    },
    {
      label: "Gerhana",
      value: weather.currentSky.eclipses.length > 0 ? weather.currentSky.eclipses.join(", ") : "N/A",
    },
  ].filter(item => item.value !== "N/A");

  return (
    <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-purple-800/20 mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-purple-200">Astro Hari Ini</CardTitle>
        <Zap className="h-4 w-4 text-purple-300" />
      </CardHeader>
      <CardContent className="space-y-4 text-purple-50">
        <div>
          <h4 className="text-xs font-semibold text-purple-300 mb-2">Langit Saat Ini</h4>
          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            {skyItems.map(item => (
              <div key={item.label} className="bg-purple-500/10 p-2 rounded-md">
                <p className="font-semibold text-purple-200">{item.label}</p>
                <p className="text-purple-300">{item.value}</p>
                {item.subValue && (
                  <p className="text-[10px] text-purple-400 mt-1">{item.subValue}</p>
                )}
              </div>
            ))}
          </div>

          {weather.currentSky.planetPeriods && weather.currentSky.planetPeriods.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-semibold text-purple-300">Periode Planet</h4>
              <div className="grid grid-cols-1 gap-1">
                {weather.currentSky.planetPeriods.map((pp, idx) => (
                  <div key={idx} className="flex justify-between text-[10px] bg-purple-500/5 px-2 py-1 rounded">
                    <span className="text-purple-200">{pp.planet} di {pp.sign}</span>
                    <span className="text-purple-400">{pp.period}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-purple-400/80 italic mt-3">
            {weather.currentSky.transitSummary}
          </p>
        </div>
        
        <div>
          <h4 className="text-xs font-semibold text-purple-300 mb-1">Suasana Kolektif</h4>
          <p className="text-xs text-purple-400/80">{weather.collectiveTheme}</p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-purple-300 mb-1">Refleksi Personal</h4>
          <p className="text-xs text-purple-400/80">{weather.personalReflection}</p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-purple-300 mb-1">Saran Praktik</h4>
          <p className="text-xs text-purple-400/80">{weather.suggestedPractice}</p>
        </div>
        
        <div className="bg-purple-500/10 p-3 rounded-lg">
          <h4 className="text-xs font-semibold text-purple-300 mb-1">Journal Prompt</h4>
          <p className="text-xs text-purple-200 italic">"{weather.journalPrompt}"</p>
        </div>
      </CardContent>
    </Card>
  );
}
