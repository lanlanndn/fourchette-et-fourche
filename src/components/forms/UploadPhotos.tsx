"use client";

import { useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type FichierLocal = {
  id: string; // identifiant local temporaire
  file: File;
  preview: string; // URL blob locale
  statut: "en cours" | "ok" | "erreur";
  url?: string; // URL Supabase finale
};

export default function UploadPhotos({
  photosExistantes = [],
  prefixe = "",
}: {
  photosExistantes?: string[];
  prefixe?: string; // préfixe pour les noms de champs (évite les collisions)
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fichiers, setFichiers] = useState<FichierLocal[]>([]);
  const [existantes, setExistantes] = useState<string[]>(photosExistantes);
  const [glisse, setGlisse] = useState(false);

  const uploaderFichier = useCallback(
    async (fichierLocal: FichierLocal) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        setFichiers((prev) =>
          prev.map((f) => (f.id === fichierLocal.id ? { ...f, statut: "erreur" as const } : f)),
        );
        return;
      }

      const chemin = `${userId}/${Date.now()}-${fichierLocal.file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const { data, error } = await supabase.storage
        .from("annonces")
        .upload(chemin, fichierLocal.file, { upsert: false });

      if (error) {
        setFichiers((prev) =>
          prev.map((f) => (f.id === fichierLocal.id ? { ...f, statut: "erreur" as const } : f)),
        );
        return;
      }

      const url = supabase.storage.from("annonces").getPublicUrl(data.path).data.publicUrl;

      setFichiers((prev) =>
        prev.map((f) =>
          f.id === fichierLocal.id ? { ...f, statut: "ok" as const, url } : f,
        ),
      );
    },
    [supabase],
  );

  const ajouterFichiers = useCallback(
    (files: FileList | File[]) => {
      const nouveaux: FichierLocal[] = Array.from(files)
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, 8 - fichiers.length - existantes.length) // max 8 photos
        .map((file) => ({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          statut: "en cours" as const,
        }));

      if (nouveaux.length === 0) return;

      setFichiers((prev) => [...prev, ...nouveaux]);

      // Uploader chaque fichier
      nouveaux.forEach((f) => uploaderFichier(f));
    },
    [fichiers.length, existantes.length, uploaderFichier],
  );

  const retirerNouveau = useCallback((id: string) => {
    setFichiers((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const retirerExistante = useCallback((url: string) => {
    setExistantes((prev) => prev.filter((u) => u !== url));
  }, []);

  const totalPhotos = existantes.length + fichiers.length;

  return (
    <div>
      <p className="libelle mb-2">
        Photos{" "}
        <span className="font-medium normal-case tracking-normal text-encre-doux">
          (facultatif, max 8 — glisse ou clique)
        </span>
      </p>

      {/* Zone de drop */}
      <div
        onDragOver={(e) => { e.preventDefault(); setGlisse(true); }}
        onDragLeave={() => setGlisse(false)}
        onDrop={(e) => { e.preventDefault(); setGlisse(false); ajouterFichiers(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed bg-[#fbf7ec] p-6 text-center transition-colors ${
          glisse
            ? "border-outremer bg-outremer/5"
            : totalPhotos >= 8
              ? "border-encre/15 opacity-50"
              : "border-encre/30 hover:border-verdigris hover:bg-verdigris/5"
        }`}
      >
        {totalPhotos === 0 ? (
          <>
            <p className="text-sm font-medium text-encre-doux">
              Glisse tes photos ici, ou clique pour les choisir
            </p>
            <p className="mt-1 text-xs text-encre-doux/70">
              JPG, PNG ou WebP
            </p>
          </>
        ) : (
          <p className="text-xs font-medium text-encre-doux">
            {totalPhotos}/8 photos · clique ou glisse pour en ajouter
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && ajouterFichiers(e.target.files)}
        />
      </div>

      {/* Prévisualisation */}
      {totalPhotos > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {/* Photos existantes (mode édition) */}
          {existantes.map((url) => (
            <div key={url} className="group relative overflow-hidden rounded-xs border-2 border-encre/25">
              <img
                src={url}
                alt=""
                className="h-20 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => retirerExistante(url)}
                className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-garance text-[14px] leading-none text-platre opacity-0 transition-opacity group-hover:opacity-100"
                title="Retirer cette photo"
                aria-label="Retirer cette photo"
              >
                ×
              </button>
            </div>
          ))}

          {/* Nouvelles photos */}
          {fichiers.map((f) => (
            <div key={f.id} className="group relative overflow-hidden rounded-xs border-2 border-encre/25">
              <img
                src={f.preview}
                alt=""
                className={`h-20 w-full object-cover ${f.statut === "en cours" ? "opacity-50" : ""}`}
              />
              {f.statut === "en cours" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-outremer uppercase">↑</span>
                </div>
              )}
              {f.statut === "erreur" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-garance">Erreur</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => retirerNouveau(f.id)}
                className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-garance text-[14px] leading-none text-platre opacity-0 transition-opacity group-hover:opacity-100"
                title="Retirer cette photo"
                aria-label="Retirer cette photo"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Champs cachés pour le formulaire */}
      {existantes.map((url) => (
        <input key={`exist-${url}`} type="hidden" name={`${prefixe}photos`} value={url} />
      ))}
      {fichiers
        .filter((f) => f.statut === "ok" && f.url)
        .map((f) => (
          <input key={f.id} type="hidden" name={`${prefixe}photos`} value={f.url!} />
        ))}

      {/* Message si uploads en cours */}
      {fichiers.some((f) => f.statut === "en cours") && (
        <p className="mt-2 text-xs text-outremer font-medium">
          Upload en cours… ne ferme pas la page.
        </p>
      )}
    </div>
  );
}
