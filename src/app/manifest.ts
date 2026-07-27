import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KIAN Privé",
    short_name: "KIAN Privé",
    description: "Concierge wellness in Miami — clinical aesthetics, regenerative care, and luxury protocols.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffdf9",
    theme_color: "#b78d4b",
    icons: [
      {
        src: "/images/kian-prive-logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/kian-prive-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
