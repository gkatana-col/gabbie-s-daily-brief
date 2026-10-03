import { useApp } from "@/features/i18n/I18nProvider";
import { categoryKey } from "@/features/discover/useDiscoverFeed";
import type { DiscoverCategory, DiscoverCategoryFilter } from "@/features/discover/types";

export function DiscoverCategoryTabs({ categories, value, onChange }: { categories: DiscoverCategory[]; value: DiscoverCategoryFilter; onChange: (value: DiscoverCategoryFilter) => void }) {
  const { t } = useApp();
  const all: DiscoverCategoryFilter[] = ["all", ...categories];
  return (
    <div role="tablist" aria-label={t("discoverCategories")} className="discover-tabs">
      {all.map((category) => (
        <button key={category} role="tab" type="button" aria-selected={value === category} onClick={() => onChange(category)} className={value === category ? "discover-tab discover-tab-active" : "discover-tab"}>
          {t(categoryKey(category))}
        </button>
      ))}
    </div>
  );
}
