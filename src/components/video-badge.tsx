import { Play } from "lucide-react"

interface VideoBadgeProps {
  /** Tailwind size classes for the circular badge (default: h-7 w-7) */
  className?: string
}

/**
 * Small play-icon badge overlaid on an article preview image to indicate the
 * article contains an embedded video. Place inside a `relative` image wrapper.
 */
export default function VideoBadge({ className = "h-7 w-7" }: VideoBadgeProps) {
  return (
    <span
      aria-label="Contains video"
      title="Contains video"
      className={`absolute left-2 top-2 z-10 flex items-center justify-center rounded-full bg-ink/80 text-paper shadow-md ring-1 ring-paper/20 backdrop-blur-sm ${className}`}
    >
      <Play className="h-3.5 w-3.5 translate-x-px" fill="currentColor" />
    </span>
  )
}
