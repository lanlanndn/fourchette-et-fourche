import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fourchette-fourche.fr";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/tableau-de-bord/", "/auth/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
