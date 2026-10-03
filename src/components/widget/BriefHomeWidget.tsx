import { BriefIcon } from "@/components/BriefIcon";
import type { BriefWidgetData, BriefWidgetSize } from "@/features/widget/types";
import { cn } from "@/lib/utils";

interface BriefHomeWidgetProps {
  data: BriefWidgetData;
  size?: BriefWidgetSize;
  onActivate?: () => void;
  className?: string;
  openLabel: string;
}

export function BriefHomeWidget({ data, size = "4x2", onActivate, className, openLabel }: BriefHomeWidgetProps) {
  const isCompact = size === "compact";
  return (
    <button
      type="button"
      className={cn("brief-home-widget", `brief-home-widget-${size}`, className)}
      onClick={onActivate}
      aria-label={`${openLabel}: ${data.title}`}
    >
      <div className="widget-heading">
        <span className="widget-period-icon"><BriefIcon name={data.icon} size={isCompact ? 18 : 20} /></span>
        <div className="min-w-0">
          <p className="widget-brand">Brief</p>
          <h2 className="widget-title">{data.title}</h2>
        </div>
        <time className="widget-time">{data.timestamp}</time>
      </div>
      <p className="widget-summary">{data.summary}</p>
      {!isCompact && <div className="widget-items">
        {[data.primaryItem, data.secondaryItem].filter((item) => item !== null).map((item) => (
          <p className="widget-item" key={`${item.icon}-${item.text}`}><BriefIcon name={item.icon} size={14} /><span>{item.text}</span></p>
        ))}
      </div>}
    </button>
  );
}