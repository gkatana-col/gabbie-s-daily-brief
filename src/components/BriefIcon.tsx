import {
  BadgeDollarSign,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CircleCheck,
  Clock3,
  CloudSun,
  ExternalLink,
  GraduationCap,
  Home,
  Languages,
  Leaf,
  MapPin,
  MoonStar,
  Newspaper,
  Palette,
  Settings,
  Sparkles,
  Sun,
  TriangleAlert,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

export type BriefIconName =
  | "aiInsight"
  | "briefUpdates"
  | "calendar"
  | "complete"
  | "evening"
  | "externalLink"
  | "finance"
  | "home"
  | "important"
  | "language"
  | "location"
  | "morning"
  | "news"
  | "settings"
  | "task"
  | "theme"
  | "time"
  | "university"
  | "weather"
  | "work"
  | "brand";

const icons: Record<BriefIconName, LucideIcon> = {
  aiInsight: Sparkles,
  briefUpdates: Bell,
  calendar: CalendarDays,
  complete: Check,
  evening: MoonStar,
  externalLink: ExternalLink,
  finance: BadgeDollarSign,
  home: Home,
  important: TriangleAlert,
  language: Languages,
  location: MapPin,
  morning: Sun,
  news: Newspaper,
  settings: Settings,
  task: CircleCheck,
  theme: Palette,
  time: Clock3,
  university: GraduationCap,
  weather: CloudSun,
  work: BriefcaseBusiness,
  brand: Leaf,
};

export function BriefIcon({ name, size = 16, strokeWidth = 1.75, ...props }: { name: BriefIconName } & LucideProps) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" size={size} strokeWidth={strokeWidth} {...props} />;
}