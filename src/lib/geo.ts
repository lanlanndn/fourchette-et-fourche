// Outils de géolocalisation — utilise les API gratuites du gouvernement français
// (api-adresse.data.gouv.fr et geo.api.gouv.fr), aucune clé API nécessaire.

export type AdresseGeocodee = {
  adresse: string; // adresse complète formatée
  ville: string;
  codePostal: string;
  codeDepartement: string;
  codeRegion: string;
  lat: number;
  lng: number;
};

type ApiAdresseFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    label: string;
    city: string;
    postcode: string;
    context: string; // ex : "44, Loire-Atlantique, Pays de la Loire"
  };
};

// Transforme une adresse saisie en coordonnées GPS + département + région
export async function geocoderAdresse(
  adresse: string,
): Promise<AdresseGeocodee | null> {
  const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
    adresse,
  )}&limit=1`;

  const reponse = await fetch(url, { next: { revalidate: 86400 } });
  if (!reponse.ok) return null;

  const donnees = (await reponse.json()) as { features: ApiAdresseFeature[] };
  const resultat = donnees.features[0];
  if (!resultat) return null;

  const [lng, lat] = resultat.geometry.coordinates;
  const codeDepartement = resultat.properties.context.split(",")[0]?.trim();

  // On récupère le code région via le département
  let codeRegion = "";
  if (codeDepartement) {
    try {
      const repDep = await fetch(
        `https://geo.api.gouv.fr/departements/${codeDepartement}?fields=region`,
        { next: { revalidate: 86400 * 30 } },
      );
      if (repDep.ok) {
        const dep = (await repDep.json()) as { region?: { code: string } };
        codeRegion = dep.region?.code ?? "";
      }
    } catch {
      // Pas grave : la région restera vide, on pourra la corriger plus tard
    }
  }

  return {
    adresse: resultat.properties.label,
    ville: resultat.properties.city,
    codePostal: resultat.properties.postcode,
    codeDepartement: codeDepartement ?? "",
    codeRegion,
    lat,
    lng,
  };
}

// Suggestions d'adresses pendant la saisie (autocomplétion)
export async function suggererAdresses(
  texte: string,
): Promise<{ label: string; ville: string }[]> {
  if (texte.trim().length < 3) return [];
  const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
    texte,
  )}&limit=5&type=housenumber,street,locality,municipality`;

  try {
    const reponse = await fetch(url);
    if (!reponse.ok) return [];
    const donnees = (await reponse.json()) as { features: ApiAdresseFeature[] };
    return donnees.features.map((f) => ({
      label: f.properties.label,
      ville: f.properties.city,
    }));
  } catch {
    return [];
  }
}
