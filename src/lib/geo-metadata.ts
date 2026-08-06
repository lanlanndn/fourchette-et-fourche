// Métadonnées géographiques françaises (noms + codes), issues de geo.api.gouv.fr
import departementsJson from "../../public/geojson/departements.json";
import regionsJson from "../../public/geojson/regions.json";

export type DepartementInfo = { nom: string; code: string; codeRegion: string };
export type RegionInfo = { nom: string; code: string };

export const DEPARTEMENTS = departementsJson as DepartementInfo[];
export const REGIONS = regionsJson as RegionInfo[];

const mapDepVersRegion = new Map(
  DEPARTEMENTS.map((d) => [d.code, d.codeRegion]),
);

export function regionDuDepartement(codeDepartement: string): string {
  return mapDepVersRegion.get(codeDepartement) ?? "";
}

export function nomDepartement(code: string): string {
  return DEPARTEMENTS.find((d) => d.code === code)?.nom ?? code;
}

export function nomRegion(code: string): string {
  return REGIONS.find((r) => r.code === code)?.nom ?? code;
}
