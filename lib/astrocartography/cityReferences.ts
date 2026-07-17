export type AstrocartographyReferenceCity = {
  id: string;
  name: string;
  region: string | null;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
};

// Natural Earth 1:110m Populated Places v5.1.2, scalerank 0 subset.
// Bundled as calculation references; population, tourism, climate, and economic attributes are intentionally omitted.
export const ASTROCARTOGRAPHY_CITY_DATASET_VERSION = "natural-earth-populated-places-5.1.2-global-rank0-plus-indonesia-50m";
export const ASTROCARTOGRAPHY_REFERENCE_CITIES: AstrocartographyReferenceCity[] = [
  { id: "1159151569", name: "Los Angeles", region: "California", country: "United States of America", countryCode: "US", latitude: 33.991924, longitude: -118.181926 },
  { id: "1159151573", name: "Washington, D.C.", region: "District of Columbia", country: "United States of America", countryCode: "US", latitude: 38.901495, longitude: -77.011364 },
  { id: "1159151575", name: "New York", region: "New York", country: "United States of America", countryCode: "US", latitude: 40.751925, longitude: -73.981963 },
  { id: "1159151577", name: "London", region: "Westminster", country: "United Kingdom", countryCode: "GB", latitude: 51.501941, longitude: -0.118668 },
  { id: "1159151579", name: "Istanbul", region: "Istanbul", country: "Turkey", countryCode: "TR", latitude: 41.106942, longitude: 29.008056 },
  { id: "1159151581", name: "Riyadh", region: "Ar Riyad", country: "Saudi Arabia", countryCode: "SA", latitude: 24.642779, longitude: 46.770796 },
  { id: "1159151583", name: "Cape Town", region: "Western Cape", country: "South Africa", countryCode: "ZA", latitude: -33.918065, longitude: 18.433042 },
  { id: "1159151585", name: "Moscow", region: "Moskva", country: "Russia", countryCode: "RU", latitude: 55.75411, longitude: 37.613577 },
  { id: "1159151587", name: "Mexico City", region: "Distrito Federal", country: "Mexico", countryCode: "MX", latitude: 19.444388, longitude: -99.132934 },
  { id: "1159151591", name: "Lagos", region: "Lagos", country: "Nigeria", countryCode: "NG", latitude: 6.445208, longitude: 3.389585 },
  { id: "1159151593", name: "Rome", region: "Lazio", country: "Italy", countryCode: "IT", latitude: 41.897902, longitude: 12.481313 },
  { id: "1159151595", name: "Beijing", region: "Beijing", country: "China", countryCode: "CN", latitude: 39.930838, longitude: 116.38634 },
  { id: "1159151597", name: "Nairobi", region: "Nairobi", country: "Kenya", countryCode: "KE", latitude: -1.281401, longitude: 36.814711 },
  { id: "1159151599", name: "Jakarta", region: "Jakarta Raya", country: "Indonesia", countryCode: "ID", latitude: -6.172472, longitude: 106.827492 },
  { id: "1159151601", name: "Bogota", region: "Bogota", country: "Colombia", countryCode: "CO", latitude: 4.598369, longitude: -74.08529 },
  { id: "1159151603", name: "Cairo", region: "Al Qahirah", country: "Egypt", countryCode: "EG", latitude: 30.051906, longitude: 31.248022 },
  { id: "1159151605", name: "Shanghai", region: "Shanghai", country: "China", countryCode: "CN", latitude: 31.218398, longitude: 121.434559 },
  { id: "1159151609", name: "Tokyo", region: "Tokyo", country: "Japan", countryCode: "JP", latitude: 35.686963, longitude: 139.749462 },
  { id: "1159151611", name: "Mumbai", region: "Maharashtra", country: "India", countryCode: "IN", latitude: 19.018936, longitude: 72.855043 },
  { id: "1159151613", name: "Paris", region: "Île-de-France", country: "France", countryCode: "FR", latitude: 48.868639, longitude: 2.33139 },
  { id: "1159151615", name: "Santiago", region: "Región Metropolitana de Santiago", country: "Chile", countryCode: "CL", latitude: -33.448068, longitude: -70.668987 },
  { id: "1159151617", name: "Kolkata", region: "West Bengal", country: "India", countryCode: "IN", latitude: 22.496915, longitude: 88.32273 },
  { id: "1159151619", name: "Rio de Janeiro", region: "Rio de Janeiro", country: "Brazil", countryCode: "BR", latitude: -22.923077, longitude: -43.226967 },
  { id: "1159151621", name: "Sao Paulo", region: "São Paulo", country: "Brazil", countryCode: "BR", latitude: -23.556734, longitude: -46.626966 },
  { id: "1159151623", name: "Sydney", region: "New South Wales", country: "Australia", countryCode: "AU", latitude: -33.918065, longitude: 151.183234 },
  { id: "1159151627", name: "Singapore", region: null, country: "Singapore", countryCode: "SG", latitude: 1.294979, longitude: 103.853875 },
  { id: "1159151629", name: "Hong Kong", region: null, country: "Hong Kong S.A.R.", countryCode: "HK", latitude: 22.306927, longitude: 114.183064 },
  { id: "1159149743", name: "Ternate", region: "Maluku Utara", country: "Indonesia", countryCode: "ID", latitude: 0.792961, longitude: 127.363016 },
  { id: "1159149745", name: "Ambon", region: "Maluku", country: "Indonesia", countryCode: "ID", latitude: -3.716687, longitude: 128.20002 },
  { id: "1159149747", name: "Raba", region: "Nusa Tenggara Barat", country: "Indonesia", countryCode: "ID", latitude: -8.449989, longitude: 118.766642 },
  { id: "1159149749", name: "Jayapura", region: "Papua", country: "Indonesia", countryCode: "ID", latitude: -2.532986, longitude: 140.69998 },
  { id: "1159149763", name: "Banda Aceh", region: "Aceh", country: "Indonesia", countryCode: "ID", latitude: 5.549983, longitude: 95.320011 },
  { id: "1159149801", name: "Balikpapan", region: "Kalimantan Timur", country: "Indonesia", countryCode: "ID", latitude: -1.250015, longitude: 116.830016 },
  { id: "1159149815", name: "Surakarta", region: "Jawa Tengah", country: "Indonesia", countryCode: "ID", latitude: -7.564979, longitude: 110.825008 },
  { id: "1159149817", name: "Bandar Lampung", region: "Lampung", country: "Indonesia", countryCode: "ID", latitude: -5.428073, longitude: 105.268052 },
  { id: "1159149819", name: "Tanjungpandan", region: "Bangka-Belitung", country: "Indonesia", countryCode: "ID", latitude: -2.750027, longitude: 107.650008 },
  { id: "1159149821", name: "Malang", region: "Jawa Timur", country: "Indonesia", countryCode: "ID", latitude: -7.978046, longitude: 112.608069 },
  { id: "1159149823", name: "Kupang", region: "Nusa Tenggara Timur", country: "Indonesia", countryCode: "ID", latitude: -10.178669, longitude: 123.582989 },
  { id: "1159149827", name: "Parepare", region: "Sulawesi Selatan", country: "Indonesia", countryCode: "ID", latitude: -4.016668, longitude: 119.633307 },
  { id: "1159149937", name: "Gorontalo", region: "Gorontalo", country: "Indonesia", countryCode: "ID", latitude: 0.549978, longitude: 123.070048 },
  { id: "1159150801", name: "Padang", region: "Sumatera Barat", country: "Indonesia", countryCode: "ID", latitude: -0.958061, longitude: 100.358068 },
  { id: "1159150827", name: "Tarakan", region: "Kalimantan Timur", country: "Indonesia", countryCode: "ID", latitude: 3.300017, longitude: 117.633016 },
  { id: "1159150837", name: "Semarang", region: "Jawa Tengah", country: "Indonesia", countryCode: "ID", latitude: -6.964672, longitude: 110.418074 },
  { id: "1159150839", name: "Palembang", region: "Sumatera Selatan", country: "Indonesia", countryCode: "ID", latitude: -2.978093, longitude: 104.748084 },
  { id: "1159150841", name: "Bandjarmasin", region: "Kalimantan Selatan", country: "Indonesia", countryCode: "ID", latitude: -3.329992, longitude: 114.580076 },
  { id: "1159150843", name: "Makassar", region: "Sulawesi Selatan", country: "Indonesia", countryCode: "ID", latitude: -5.138013, longitude: 119.430082 },
  { id: "1159151307", name: "Medan", region: "Sumatera Utara", country: "Indonesia", countryCode: "ID", latitude: 3.58192, longitude: 98.648094 },
  { id: "1159151335", name: "Bandung", region: "Jawa Barat", country: "Indonesia", countryCode: "ID", latitude: -6.948083, longitude: 107.568067 },
  { id: "1159151339", name: "Surabaya", region: "Jawa Timur", country: "Indonesia", countryCode: "ID", latitude: -7.24729, longitude: 112.748887 },
];

export function resolveBirthCountryCode(countryCode?: string | null, countryName?: string | null): string | null {
  const normalizedCode = countryCode?.trim().toUpperCase();
  if (normalizedCode && /^[A-Z]{2}$/.test(normalizedCode)) return normalizedCode;
  const normalizedName = countryName?.trim().toLocaleLowerCase("en");
  if (!normalizedName) return null;
  return ASTROCARTOGRAPHY_REFERENCE_CITIES.find((city) => city.country.toLocaleLowerCase("en") === normalizedName)?.countryCode || null;
}
