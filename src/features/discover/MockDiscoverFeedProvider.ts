import energy from "@/assets/discover-energy.jpg";
import tech from "@/assets/discover-tech.jpg";
import sofia from "@/assets/discover-sofia.jpg";
import education from "@/assets/discover-education.jpg";
import type { DiscoverCategory, DiscoverFeedProvider, DiscoverSourceStory } from "./types";

const t = (bg: string, en: string) => ({ bg, en });

export const mockDiscoverStories: DiscoverSourceStory[] = [
  { id: "d1", topicKey: "eu-renewables", category: "green", important: true, imageUrl: energy, readingMinutes: 4,
    headline: t("ЕС се договори за нови мерки за възобновяема енергия", "EU agrees on new renewable-energy measures"),
    excerpt: t("Европейските институции постигнаха споразумение по нови мерки за ускоряване на внедряването на възобновяема енергия. Мерките включват по-кратки срокове за разрешителни.", "European institutions reached agreement on new measures to speed up the rollout of renewable energy. The measures include shorter permitting deadlines."),
    keyFacts: [t("Споразумението е между Съвета и Европейския парламент.", "The agreement is between the Council and the European Parliament."), t("Предвидени са по-кратки срокове за разрешителни.", "Shorter permitting deadlines are planned."), t("Текстът предстои да бъде официално одобрен.", "The text still awaits formal approval.")],
    context: t("Може да има значение за енергийния преход и инвестициите в чиста енергия.", "It may matter for the energy transition and clean-energy investment."),
    source: { name: "Reuters", url: "https://www.reuters.com/" }, publishedAt: "2026-10-03T10:20:00+03:00" },
  { id: "d1b", topicKey: "eu-renewables", category: "green", readingMinutes: 3,
    headline: t("Брюксел ускорява разрешителните за зелена енергия", "Brussels speeds up permits for green energy"),
    excerpt: t("Новите правила съкращават сроковете за разрешителни за проекти за възобновяема енергия.", "New rules shorten permit timelines for renewable-energy projects."),
    keyFacts: [], source: { name: "Euractiv", url: "https://www.euractiv.com/" }, publishedAt: "2026-10-03T09:50:00+03:00" },
  { id: "d2", topicKey: "bg-budget", category: "bulgaria", imageUrl: sofia, readingMinutes: 3,
    headline: t("Министерството на финансите публикува проектобюджета за 2027 г.", "Finance Ministry publishes the draft 2027 budget"),
    excerpt: t("Проектът е публикуван за обществено обсъждане. Документът съдържа прогнозите за приходите и разходите за следващата година.", "The draft has been published for public consultation. The document contains revenue and spending forecasts for next year."),
    keyFacts: [t("Проектът е отворен за обществено обсъждане.", "The draft is open for public consultation."), t("Окончателното гласуване е в Народното събрание.", "The final vote takes place in Parliament.")],
    source: { name: "Дневник", url: "https://www.dnevnik.bg/" }, publishedAt: "2026-10-03T11:05:00+03:00" },
  { id: "d3", topicKey: "eu-chips", category: "technology", imageUrl: tech, readingMinutes: 5,
    headline: t("Европейски консорциум представи нов енергийно ефективен чип", "European consortium unveils a new energy-efficient chip"),
    excerpt: t("Консорциумът представи прототип на чип, предназначен за изкуствен интелект на устройството. Според разработчиците той използва по-малко енергия.", "The consortium presented a prototype chip designed for on-device AI. According to its developers, it uses less energy."),
    keyFacts: [t("Става дума за прототип, а не за търговски продукт.", "It is a prototype, not a commercial product."), t("Данните за енергията са на разработчиците.", "Energy figures come from the developers.")],
    source: { name: "BBC", url: "https://www.bbc.com/news/technology" }, publishedAt: "2026-10-03T08:40:00+03:00" },
  { id: "d4", topicKey: "erasmus", category: "education", imageUrl: education, readingMinutes: 3,
    headline: t("Отвориха нови стипендии по „Еразъм+“ за студенти", "New Erasmus+ scholarships open for students"),
    excerpt: t("Университетите обявиха нов прием за мобилност по програма „Еразъм+“. Кандидатстването е онлайн.", "Universities announced a new Erasmus+ mobility call. Applications are online."),
    keyFacts: [t("Кандидатстването се извършва онлайн.", "Applications are submitted online."), t("Сроковете зависят от всеки университет.", "Deadlines depend on each university.")],
    context: t("Полезно, ако планираш обучение в чужбина.", "Useful if you plan to study abroad."),
    source: { name: "Капитал", url: "https://www.capital.bg/" }, publishedAt: "2026-10-03T07:55:00+03:00" },
  { id: "d5", topicKey: "james-webb", category: "science", readingMinutes: 4,
    headline: t("Астрономи публикуваха нови наблюдения на далечна галактика", "Astronomers publish new observations of a distant galaxy"),
    excerpt: t("Изследването е публикувано в рецензирано научно списание и използва данни от телескопа „Джеймс Уеб“.", "The study was published in a peer-reviewed journal and uses data from the James Webb telescope."),
    keyFacts: [t("Изследването е рецензирано.", "The study is peer reviewed.")],
    source: { name: "Nature", url: "https://www.nature.com/" }, publishedAt: "2026-10-03T06:30:00+03:00" },
  { id: "d6", topicKey: "ecb-rates", category: "business", readingMinutes: 3,
    headline: t("ЕЦБ остави лихвите без промяна", "ECB leaves interest rates unchanged"),
    excerpt: t("Европейската централна банка запази основните си лихвени проценти на досегашното ниво.", "The European Central Bank kept its key interest rates at their current level."),
    keyFacts: [t("Решението засяга еврозоната.", "The decision affects the euro area.")],
    source: { name: "Reuters", url: "https://www.reuters.com/markets/" }, publishedAt: "2026-10-02T15:15:00+03:00" },
  { id: "d7", topicKey: "un-climate", category: "world", readingMinutes: 4,
    headline: t("ООН подготвя следващата климатична конференция", "UN prepares the next climate conference"),
    excerpt: t("Делегациите се срещнаха, за да обсъдят програмата на предстоящата конференция.", "Delegations met to discuss the agenda of the upcoming conference."),
    keyFacts: [], source: { name: "BBC", url: "https://www.bbc.com/news/world" }, publishedAt: "2026-10-03T05:45:00+03:00" },
  { id: "d8", topicKey: "sofia-film", category: "culture", readingMinutes: 2,
    headline: t("Започва есенното издание на кинофестивал в София", "Autumn edition of a Sofia film festival begins"),
    excerpt: t("Фестивалът представя програма от европейски филми в няколко зали в града.", "The festival presents a programme of European films across several venues in the city."),
    keyFacts: [], source: { name: "БНТ", url: "https://bntnews.bg/" }, publishedAt: "2026-10-02T18:20:00+03:00" },
  { id: "d9", topicKey: "explainer-inflation", category: "explainers", readingMinutes: 6,
    headline: t("Какво всъщност измерва инфлацията", "What inflation actually measures"),
    excerpt: t("Кратко обяснение как се изчислява индексът на потребителските цени и какво включва.", "A short explainer on how the consumer price index is calculated and what it includes."),
    keyFacts: [t("Индексът следи цените на типична потребителска кошница.", "The index tracks prices of a typical consumer basket.")],
    source: { name: "Евростат", url: "https://ec.europa.eu/eurostat" }, publishedAt: "2026-10-01T12:00:00+03:00" },
];

const categories: DiscoverCategory[] = ["bulgaria", "world", "technology", "science", "business", "education", "green", "culture"];

export class MockDiscoverFeedProvider implements DiscoverFeedProvider {
  constructor(private stories: DiscoverSourceStory[] = mockDiscoverStories, private delayMs = 350) {}
  getCategories() { return categories; }
  getStory(id: string) { return this.stories.find((story) => story.id === id); }
  getSnapshot() { return this.stories; }
  now() { return "2026-10-03T12:00:00+03:00"; }
  async getStories() { return this.stories; }
  refresh() { return new Promise<DiscoverSourceStory[]>((resolve) => setTimeout(() => resolve(this.stories), this.delayMs)); }
}

export const discoverFeedProvider = new MockDiscoverFeedProvider();
