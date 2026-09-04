"use client";

import type { AstrocartographyAutomaticPresentation, AstrocartographyCityReferenceResult } from "@/lib/astrocartography/types";
import { isEnlEdition } from "@/lib/config/edition";

const flag = (code: string) => String.fromCodePoint(...[...code].map((character) => 127397 + character.charCodeAt(0)));

function ReferenceCityCard({ city, fallback = false, isEn = false }: { city: AstrocartographyCityReferenceResult; fallback?: boolean; isEn?: boolean }) {
  return (
    <article className="rounded-2xl border border-[#EEE8DD] p-4">
      <h4 className="font-semibold text-[#4F5E52]">{flag(city.countryCode)} {city.cityName}</h4>
      <p className="text-xs text-[#8A9489]">{city.region || city.country}</p>
      {fallback && (
        <p className="mt-2 text-[11px] font-semibold text-[#8A6F52]">
          {isEn ? "Status: Nearest reference, gentler influence" : "Status: Referensi terdekat, pengaruh lebih halus"}
        </p>
      )}
      <div className="mt-3 space-y-3">
        {city.lineInterpretations.map((line, index) => (
          <div key={line.lineId}>
            <div className="flex items-center justify-between gap-3 text-xs text-[#657568]">
              <strong className="uppercase">{line.label}</strong>
              <span>± {city.nearestLines[index].approximateDistanceKm.toLocaleString(isEn ? "en-US" : "id-ID")} km</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-[#7B8776]">{line.narrative}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 rounded-xl bg-[#F5F1E8] p-3 text-xs leading-5 text-[#657568]">{city.integratedSummary}</p>
    </article>
  );
}

export function AstrocartographyMap({ automatic, isEn = isEnlEdition() }: { automatic: AstrocartographyAutomaticPresentation; isEn?: boolean }) {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-[#4F5E52] p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D4DDD4]">{isEn ? "Primary Geographic Theme" : "Tema Geografis Utama"}</p>
        <h2 className="mt-2 font-serif text-3xl">{automatic.strongestCategory}</h2>
        <p className="mt-4 max-w-3xl leading-7 text-[#D8E0D7]">{automatic.dominantTheme}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {automatic.dominantLineIds.map((id) => (
            <span key={id} className="rounded-full bg-white/10 px-3 py-2 text-xs uppercase">{id.replace("-", " · ")}</span>
          ))}
        </div>
      </section>

      <div className="space-y-6">
        {automatic.categories.map((category) => (
          <section key={category.categoryId} className="rounded-3xl border border-[#E8E1D3] bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-serif text-3xl text-[#4F5E52]">{category.categoryName}</h2>
            <p className="mt-4 text-sm leading-7 text-[#7B8776]">{category.interpretation}</p>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#657568]">{isEn ? "Dominant lines" : "Dominant lines"}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {category.dominantLineIds.map((id) => (
                    <span key={id} className="rounded-full bg-[#F5F1E8] px-3 py-2 text-xs font-semibold uppercase text-[#4F5E52]">{id.replace("-", " · ")}</span>
                  ))}
                </div>
                <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-[#657568]">{isEn ? "Reference regions" : "Wilayah referensi"}</h3>
                <p className="mt-2 text-sm text-[#7B8776]">{category.regions.join(" · ")}</p>
                <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-[#657568]">{isEn ? "Potential" : "Potensi"}</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#7B8776]">
                  {category.potentialItems.map((item) => <li key={item}>{item}</li>)}
                </ul>
                {category.challenge && (
                  <>
                    <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-[#A05A4F]">{isEn ? "Areas for care" : "Hal yang perlu dijaga"}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#7B8776]">{category.challenge}</p>
                  </>
                )}
                <p className="mt-5 rounded-2xl bg-[#F5F1E8] p-4 text-sm leading-6 text-[#657568]">{category.groundingNote}</p>
              </div>
              <div>
                {category.domesticCountryName && (
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#657568]">
                    {category.domesticAvailabilityMessage?.startsWith("Belum ada") || category.domesticAvailabilityMessage?.startsWith("No regions")
                      ? (isEn ? "Nearest domestic reference" : "Referensi domestik terdekat")
                      : category.domesticCountryName}
                  </h3>
                )}
                {category.domesticAvailabilityMessage && <p className="mt-2 text-xs leading-5 text-[#8A9489]">{category.domesticAvailabilityMessage}</p>}
                <div className="mt-2 space-y-3">
                  {category.domesticReferences.map((city) => (
                    <ReferenceCityCard
                      key={city.cityId}
                      city={city}
                      fallback={Boolean(category.domesticAvailabilityMessage?.startsWith("Belum ada") || category.domesticAvailabilityMessage?.startsWith("No regions"))}
                      isEn={isEn}
                    />
                  ))}
                </div>
                {(category.domesticAvailabilityMessage?.startsWith("Belum ada") || category.domesticAvailabilityMessage?.startsWith("No regions")) && category.domesticReferences.length > 0 && (
                  <p className="mt-3 rounded-xl bg-[#F8F4EC] p-3 text-xs leading-5 text-[#7B8776]">
                    {isEn ? "This domestic reference lies further from the primary line, so its symbolic influence is expected to be gentler." : "Referensi domestik ini berada lebih jauh dari garis utama, sehingga pengaruh simboliknya diperkirakan lebih lembut."}
                  </p>
                )}
                <h3 className="mt-5 text-xs font-bold uppercase tracking-wider text-[#657568]">{isEn ? "Global key regions" : "Wilayah utama global"}</h3>
                <div className="mt-2 space-y-3">
                  {category.globalReferences.map((city) => <ReferenceCityCard key={city.cityId} city={city} isEn={isEn} />)}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section>
        <h2 className="font-serif text-3xl text-[#4F5E52]">{isEn ? "Reference Cities and Regions" : "Kota dan Wilayah Referensi"}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#7B8776]">
          {isEn
            ? "These cities are not destinations you must choose, but reference points situated close to your Astrocartography lines."
            : "Kota-kota ini bukan tujuan yang harus dipilih, melainkan titik referensi yang berada dekat dengan garis Astrocartography-mu."}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {automatic.referenceCities.map((city) => (
            <div key={city.cityId} className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="font-semibold text-[#4F5E52]">{flag(city.countryCode)} {city.cityName}</h3>
              <p className="mt-1 text-xs text-[#8A9489]">{city.region || city.country}</p>
              <p className="mt-2 text-xs text-[#657568]">
                {isEn ? "Nearest line:" : "Garis terdekat:"} {city.nearestLines[0].body} {city.nearestLines[0].angleType} · ± {city.nearestLines[0].approximateDistanceKm.toLocaleString(isEn ? "en-US" : "id-ID")} km
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-[#F1EBDD] p-6 sm:p-8">
        <h2 className="font-serif text-3xl text-[#4F5E52]">{isEn ? "General Overview" : "Gambaran Umum"}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {automatic.overallRegions.map((region) => (
            <article key={region.locationId} className="rounded-2xl bg-white p-4">
              <h3 className="font-semibold text-[#4F5E52]">{region.locationName}</h3>
              <p className="mt-2 text-sm leading-6 text-[#7B8776]">{region.dominantTheme}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[#657568]">
                {region.bestFitActivities.map((item) => <li key={item}>{item}</li>)}
              </ul>
              {region.caution && (
                <p className="mt-3 text-xs text-[#A05A4F]">
                  {isEn ? "Areas for care:" : "Yang perlu dijaga:"} {region.caution.replace(/^(Yang perlu dijaga adalah|What needs care is)\s*/i, "")}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
