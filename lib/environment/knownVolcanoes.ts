/**
 * Known Volcano Catalog
 *
 * PROVENANCE & LEGAL AUDIT RECORD:
 * - Bundled Repository Dataset: Volcanoes of the World (VOTW) v5.1.0 Holocene Volcano List
 * - Bundled Acquired Date: 2024
 * - Current Official Database: VOTW v5.4.0 (Version Date: 2026-08-07, Smithsonian Institution / USGS)
 * - Bundled vs Current: Preserved separately. Bundled catalog is VOTW v5.1.0 and is NOT claimed as current.
 * - Fields: Pure factual geographic coordinates (Name, Country, Region, Latitude, Longitude, Elevation, Morphology)
 * - Commercial Status: UNRESOLVED (Smithsonian Terms of Use reserve commercial licensing rights for database compilations;
 *   official commercial use requires prior written agreement).
 *
 * PRODUCTION POLICY (BUILD 108):
 * - GVP_PRODUCTION_USE = UNRESOLVED
 * - VOLCANIC_ATTRIBUTION_BUILD108 = ACCEPTED_UNAVAILABLE / FAIL-CLOSED
 * - In production builds, named volcanic source attribution is strictly FAIL-CLOSED (probableSource = null, volcanicOrigin = null).
 * - This catalog is retained as an offline geographical reference / dev fixture only.
 */

export interface KnownVolcano {
  id: string;
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  primaryVolcanoType: string;
}

export const KNOWN_ACTIVE_VOLCANOES: KnownVolcano[] = [
  // Indonesia & Southeast Asia (High regional significance for Bhumi)
  { id: "merapi", name: "Merapi", country: "Indonesia", region: "Central Java", latitude: -7.540, longitude: 110.446, elevationMeters: 2910, primaryVolcanoType: "Stratovolcano" },
  { id: "semeru", name: "Semeru", country: "Indonesia", region: "East Java", latitude: -8.108, longitude: 112.922, elevationMeters: 3676, primaryVolcanoType: "Stratovolcano" },
  { id: "krakatau", name: "Anak Krakatau", country: "Indonesia", region: "Sunda Strait", latitude: -6.102, longitude: 105.423, elevationMeters: 157, primaryVolcanoType: "Caldera" },
  { id: "sinabung", name: "Sinabung", country: "Indonesia", region: "Sumatra", latitude: 3.170, longitude: 98.392, elevationMeters: 2460, primaryVolcanoType: "Stratovolcano" },
  { id: "marapi", name: "Marapi", country: "Indonesia", region: "Sumatra", latitude: -0.381, longitude: 100.473, elevationMeters: 2891, primaryVolcanoType: "Complex volcano" },
  { id: "ruang", name: "Ruang", country: "Indonesia", region: "Sangihe Islands", latitude: 2.300, longitude: 125.370, elevationMeters: 725, primaryVolcanoType: "Stratovolcano" },
  { id: "lewotobi", name: "Lewotobi Laki-laki", country: "Indonesia", region: "Flores", latitude: -8.538, longitude: 122.775, elevationMeters: 1584, primaryVolcanoType: "Stratovolcano" },
  { id: "ibu", name: "Ibu", country: "Indonesia", region: "Halmahera", latitude: 1.488, longitude: 127.630, elevationMeters: 1325, primaryVolcanoType: "Stratovolcano" },
  { id: "dukono", name: "Dukono", country: "Indonesia", region: "Halmahera", latitude: 1.693, longitude: 127.894, elevationMeters: 1229, primaryVolcanoType: "Complex volcano" },
  { id: "kelud", name: "Kelud", country: "Indonesia", region: "East Java", latitude: -7.930, longitude: 112.308, elevationMeters: 1731, primaryVolcanoType: "Stratovolcano" },
  { id: "bromo", name: "Bromo", country: "Indonesia", region: "East Java", latitude: -7.942, longitude: 112.950, elevationMeters: 2329, primaryVolcanoType: "Caldera" },
  { id: "agung", name: "Agung", country: "Indonesia", region: "Bali", latitude: -8.343, longitude: 115.508, elevationMeters: 3031, primaryVolcanoType: "Stratovolcano" },
  { id: "batur", name: "Batur", country: "Indonesia", region: "Bali", latitude: -8.242, longitude: 115.375, elevationMeters: 1717, primaryVolcanoType: "Caldera" },
  { id: "rinjani", name: "Rinjani", country: "Indonesia", region: "Lombok", latitude: -8.420, longitude: 116.470, elevationMeters: 3726, primaryVolcanoType: "Stratovolcano" },
  { id: "soputan", name: "Soputan", country: "Indonesia", region: "Sulawesi", latitude: 1.112, longitude: 124.737, elevationMeters: 1809, primaryVolcanoType: "Stratovolcano" },
  { id: "lokon", name: "Lokon-Empung", country: "Indonesia", region: "Sulawesi", latitude: 1.358, longitude: 124.792, elevationMeters: 1580, primaryVolcanoType: "Stratovolcano" },
  { id: "taal", name: "Taal", country: "Philippines", region: "Luzon", latitude: 14.002, longitude: 120.993, elevationMeters: 311, primaryVolcanoType: "Caldera" },
  { id: "mayon", name: "Mayon", country: "Philippines", region: "Luzon", latitude: 13.257, longitude: 123.685, elevationMeters: 2462, primaryVolcanoType: "Stratovolcano" },
  { id: "kanlaon", name: "Kanlaon", country: "Philippines", region: "Negros", latitude: 10.412, longitude: 123.132, elevationMeters: 2435, primaryVolcanoType: "Stratovolcano" },

  // Key Global Active Volcanoes
  { id: "etna", name: "Etna", country: "Italy", region: "Sicily", latitude: 37.748, longitude: 14.999, elevationMeters: 3357, primaryVolcanoType: "Stratovolcano" },
  { id: "stromboli", name: "Stromboli", country: "Italy", region: "Aeolian Islands", latitude: 38.789, longitude: 15.213, elevationMeters: 924, primaryVolcanoType: "Stratovolcano" },
  { id: "vesuvius", name: "Vesuvius", country: "Italy", region: "Campania", latitude: 40.821, longitude: 14.426, elevationMeters: 1281, primaryVolcanoType: "Complex volcano" },
  { id: "fagradalsfjall", name: "Fagradalsfjall / Reykjanes", country: "Iceland", region: "Reykjanes", latitude: 63.892, longitude: -22.269, elevationMeters: 385, primaryVolcanoType: "Fissure vent" },
  { id: "kilauea", name: "Kilauea", country: "United States", region: "Hawaii", latitude: 19.421, longitude: -155.287, elevationMeters: 1222, primaryVolcanoType: "Shield volcano" },
  { id: "mauna_loa", name: "Mauna Loa", country: "United States", region: "Hawaii", latitude: 19.475, longitude: -155.608, elevationMeters: 4170, primaryVolcanoType: "Shield volcano" },
  { id: "popocatepetl", name: "Popocatépetl", country: "Mexico", region: "Central Mexico", latitude: 19.023, longitude: -98.622, elevationMeters: 5426, primaryVolcanoType: "Stratovolcano" },
  { id: "fuego", name: "Fuego", country: "Guatemala", region: "Central Highlands", latitude: 14.473, longitude: -90.880, elevationMeters: 3763, primaryVolcanoType: "Stratovolcano" },
  { id: "cotopaxi", name: "Cotopaxi", country: "Ecuador", region: "Andes", latitude: -0.677, longitude: -78.436, elevationMeters: 5897, primaryVolcanoType: "Stratovolcano" },
  { id: "villarrica", name: "Villarrica", country: "Chile", region: "Southern Andes", latitude: -39.420, longitude: -71.930, elevationMeters: 2847, primaryVolcanoType: "Stratovolcano" },
  { id: "sakurajima", name: "Sakurajima", country: "Japan", region: "Kyushu", latitude: 31.585, longitude: 130.657, elevationMeters: 1117, primaryVolcanoType: "Stratovolcano" },
  { id: "fuji", name: "Fuji", country: "Japan", region: "Honshu", latitude: 35.360, longitude: 138.727, elevationMeters: 3776, primaryVolcanoType: "Stratovolcano" },
  { id: "erebus", name: "Erebus", country: "Antarctica", region: "Ross Island", latitude: -77.530, longitude: 167.170, elevationMeters: 3794, primaryVolcanoType: "Stratovolcano" },
  { id: "nyiragongo", name: "Nyiragongo", country: "DR Congo", region: "Virunga", latitude: -1.520, longitude: 29.250, elevationMeters: 3470, primaryVolcanoType: "Stratovolcano" }
];
