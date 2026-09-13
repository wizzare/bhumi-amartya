"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface CitySelection {
  formattedCity: string;
  latitude: number;
  longitude: number;
  country: string | null;
}

interface PhotonSuggestion {
  id: string;
  formattedCity: string;
  latitude: number;
  longitude: number;
  country: string | null;
}

type PhotonFeature = {
  properties?: {
    osm_id?: string | number;
    osm_type?: string;
    osm_key?: string;
    osm_value?: string;
    name?: string;
    state?: string;
    country?: string;
  };
  geometry?: {
    coordinates?: [number, number];
  };
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

// Reliable offline fallback for setup and recovery. Coordinates are deliberately
// broad city centroids; a selected Photon result still wins whenever the network
// is available. This keeps registration usable when geocoding is unavailable.
const LOCAL_CITY_INDEX: Array<[string, number, number, string]> = [
  ["Jakarta", -6.2088, 106.8456, "Indonesia"],
  ["Bandung", -6.9175, 107.6191, "Indonesia"],
  ["Surabaya", -7.2575, 112.7521, "Indonesia"],
  ["Yogyakarta", -7.7956, 110.3695, "Indonesia"],
  ["Denpasar", -8.65, 115.2167, "Indonesia"],
  ["Medan", 3.5952, 98.6722, "Indonesia"],
  ["Makassar", -5.1477, 119.4327, "Indonesia"],
  ["Semarang", -6.9667, 110.4167, "Indonesia"],
  ["Palembang", -2.9761, 104.7754, "Indonesia"],
  ["Malang", -7.9666, 112.6326, "Indonesia"],
];
const LOCAL_CITY_SUGGESTIONS: PhotonSuggestion[] = LOCAL_CITY_INDEX.map(([name, latitude, longitude, country]) => ({
  id: `local-${name.toLowerCase()}`,
  formattedCity: `${name}, ${country}`,
  latitude,
  longitude,
  country,
}));

export interface CityAutocompleteProps {
  value: string;
  placeholder?: string;
  onInputChange: (value: string) => void;
  onCitySelect: (selection: CitySelection) => void;
}

export default function CityAutocomplete({
  value,
  placeholder = "City",
  onInputChange,
  onCitySelect,
}: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PhotonSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const trimmedValue = value.trim();

  const visibleSuggestions = useMemo(
    () => (searchEnabled && trimmedValue ? suggestions : []),
    [searchEnabled, suggestions, trimmedValue],
  );

  useEffect(() => {
    if (!searchEnabled || !trimmedValue) return;

    const controller = new AbortController();

    const loadSuggestions = async () => {
      setLoading(true);
      setError(null);

      const query = encodeURIComponent(trimmedValue);
      const url = `https://photon.komoot.io/api/?q=${query}&limit=8`;

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Failed to fetch city suggestions.");
        }
        const data = (await response.json()) as PhotonResponse;
        const suggestions = (data.features ?? [])
          .filter((feature) => {
            const props = feature.properties ?? {};
            return (
              props.osm_key === "place" &&
              typeof props.osm_value === "string" &&
              ["city", "town", "village", "municipality"].includes(props.osm_value)
            );
          })
          .map((feature) => {
            const props = feature.properties ?? {};
            const parts = [props.name, props.state, props.country].filter(Boolean);
            const coordinates = feature.geometry?.coordinates ?? [0, 0];
            return {
              id: `${props.osm_id}-${props.osm_type}`,
              formattedCity: parts.join(", "),
              latitude: coordinates[1],
              longitude: coordinates[0],
              country: props.country ?? null,
            };
          })
          .filter((suggestion) => suggestion.formattedCity)
          .slice(0, 6);

        setSuggestions(suggestions);
        setActiveIndex(0);
        setOpen(suggestions.length > 0);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        // Geocoding is enhancement-only. Keep setup usable offline and in
        // localhost QA instead of blocking the first-user path on Photon.
        console.warn("City autocomplete network unavailable; using local city index.", fetchError);
        const localSuggestions = LOCAL_CITY_SUGGESTIONS.filter((suggestion) =>
          suggestion.formattedCity.toLocaleLowerCase().includes(trimmedValue.toLocaleLowerCase()),
        ).slice(0, 6);
        setError(null);
        setSuggestions(localSuggestions);
        setActiveIndex(0);
        setOpen(localSuggestions.length > 0);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadSuggestions();

    return () => {
      controller.abort();
    };
  }, [searchEnabled, trimmedValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = (suggestion: PhotonSuggestion) => {
    onCitySelect({
      formattedCity: suggestion.formattedCity,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      country: suggestion.country,
    });
    setOpen(false);
    setSearchEnabled(false);
    setSuggestions([]);
    setActiveIndex(0);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          if (!event.target.value.trim()) {
            setSuggestions([]);
            setOpen(false);
          }
          setSearchEnabled(true);
          onInputChange(event.target.value);
        }}
        onKeyDown={(event) => {
          if (!open || visibleSuggestions.length === 0) return;

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((current) => (current + 1) % visibleSuggestions.length);
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) => (current - 1 + visibleSuggestions.length) % visibleSuggestions.length);
          }

          if (event.key === "Enter") {
            event.preventDefault();
            selectSuggestion(visibleSuggestions[activeIndex]);
          }

          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className="w-full rounded-2xl border border-black/5 bg-[#FCFAF5] px-5 py-4 outline-none"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls="birth-city-suggestions"
        aria-autocomplete="list"
      />

      {error ? (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      ) : null}

      {open && visibleSuggestions.length > 0 ? (
        <div id="birth-city-suggestions" className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-xl sm:text-sm" role="listbox">
          {visibleSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => selectSuggestion(suggestion)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`w-full text-left px-4 py-3 transition ${
                activeIndex === index ? "bg-[#F5F1E8]" : "hover:bg-slate-50"
              }`}
              role="option"
              aria-selected={activeIndex === index}
            >
              <span className="block text-sm font-medium text-slate-900">
                {suggestion.formattedCity}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {loading && !error ? (
        <div className="mt-2 text-sm text-slate-500">Searching cities...</div>
      ) : null}
    </div>
  );
}
