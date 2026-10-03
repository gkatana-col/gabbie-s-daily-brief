import { createFileRoute } from "@tanstack/react-router";
import { DiscoverFeed } from "@/components/discover/DiscoverFeed";

export const Route = createFileRoute("/news/")({
  head: () => ({ meta: [
    { title: "Открий — Brief" },
    { name: "description", content: "Подбрани истории с ясен източник и кратки обобщения." },
    { property: "og:title", content: "Открий — Brief" },
    { property: "og:description", content: "Подбрано за теб: най-важното, без излишен шум." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: DiscoverFeed,
});
