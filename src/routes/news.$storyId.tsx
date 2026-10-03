import { createFileRoute } from "@tanstack/react-router";
import { DiscoverArticleView } from "@/components/discover/DiscoverArticleView";
import { discoverFeedProvider } from "@/features/discover/MockDiscoverFeedProvider";
import { useDiscoverFeed } from "@/features/discover/useDiscoverFeed";

export const Route = createFileRoute("/news/$storyId")({
  loader: ({ params }) => ({ headline: discoverFeedProvider.getStory(params.storyId)?.headline.bg ?? null }),
  head: ({ loaderData }) => {
    const title = loaderData?.headline ? `${loaderData.headline} — Brief` : "Открий — Brief";
    return { meta: [
      { title },
      { name: "description", content: "Кратко обобщение с ясен източник и връзка към оригиналната статия." },
      { property: "og:title", content: title },
      { property: "og:description", content: "Обобщение от Brief с връзка към оригиналния източник." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ] };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { storyId } = Route.useParams();
  const { stories } = useDiscoverFeed();
  return <DiscoverArticleView story={stories.find((story) => story.id === storyId)} />;
}
