export type AstrocartographyPlace = {
  locationId: string;
  label: string;
  name: string;
  region: string | null;
  country: string;
  countryCode: string | null;
  latitude: number;
  longitude: number;
  inclusionReason: "birthplace" | "user-selected";
};

export function createAstrocartographyPlace(input: {
  name: string;
  region?: string | null;
  country?: string | null;
  countryCode?: string | null;
  latitude: number;
  longitude: number;
  inclusionReason: AstrocartographyPlace["inclusionReason"];
}): AstrocartographyPlace {
  const name = input.name.trim() || "Lokasi pilihan";
  const country = input.country?.trim() || "Negara belum dicantumkan";
  return {
    locationId: `${input.inclusionReason}-${name.toLocaleLowerCase("id").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${input.latitude.toFixed(4)}-${input.longitude.toFixed(4)}`,
    label: [name, input.region, country].filter(Boolean).join(", "),
    name,
    region: input.region?.trim() || null,
    country,
    countryCode: input.countryCode?.trim().toUpperCase() || null,
    latitude: input.latitude,
    longitude: input.longitude,
    inclusionReason: input.inclusionReason,
  };
}
