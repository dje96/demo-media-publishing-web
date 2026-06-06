"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react"
import {
  startMediaTracking,
  trackMediaPlay,
  trackMediaPause,
  trackMediaEnd,
  trackMediaVolumeChange,
  trackMediaFullscreenChange,
  trackMediaSeekStart,
  trackMediaSeekEnd,
  updateMediaTracking,
} from "@snowplow/browser-plugin-media"

interface VideoPlayerProps {
  /** Stable id used to correlate all Snowplow media events for this player */
  videoId: string
  /** Path to the video file (e.g. /videos/clip.mp4) */
  src: string
  /** Human-readable title, shown in the overlay and used as the element title */
  title: string
  /** Optional kicker label shown above the title (defaults to "Watch") */
  kicker?: string
  /** Optional poster image displayed before playback starts */
  poster?: string
}

const PERCENT_BOUNDARIES = [25, 50, 75, 100]

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

/**
 * Light, on-brand custom video player for The Daily Query.
 *
 * Renders a real HTML5 <video> element (no native controls) with a minimal
 * custom control surface, and wires the full Snowplow Media plugin so genuine
 * media events fire: play, pause, end, seek start/end, volume change,
 * fullscreen change, and 25/50/75/100% percent-progress boundaries.
 */
export default function VideoPlayer({
  videoId,
  src,
  title,
  kicker = "Watch",
  poster,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const isVisible = useRef(false)
  const isSeeking = useRef(false)

  const [hasStarted, setHasStarted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Initialise Snowplow media tracking and attach the HTML5 media event
  // listeners that translate native events into Snowplow media events.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Always start muted. React's `muted` JSX attribute is unreliable, so set
    // the DOM property imperatively.
    video.muted = true

    startMediaTracking({
      id: videoId,
      player: { playerType: "org.whatwg-media_element" },
      boundaries: PERCENT_BOUNDARIES,
    })

    // Metadata may already be loaded before this effect runs (preload="metadata"),
    // in which case the loadedmetadata event won't fire again — seed duration now.
    if (video.readyState >= 1 && Number.isFinite(video.duration)) {
      setDuration(video.duration)
    }

    // Guard against a spurious initial play event before the user interacts.
    const visibilityTimer = setTimeout(() => {
      isVisible.current = true
    }, 100)

    const handlePlay = () => {
      setIsPlaying(true)
      setHasStarted(true)
      if (isVisible.current) trackMediaPlay({ id: videoId })
    }
    const handlePause = () => {
      setIsPlaying(false)
      trackMediaPause({ id: videoId })
    }
    const handleEnded = () => {
      setIsPlaying(false)
      trackMediaEnd({ id: videoId })
    }
    const handleVolumeChange = () => {
      setIsMuted(video.muted || video.volume === 0)
      trackMediaVolumeChange({ id: videoId, newVolume: Math.round(video.volume * 100) })
    }
    const handleFullscreenChange = () => {
      trackMediaFullscreenChange({ id: videoId, fullscreen: !!document.fullscreenElement })
    }
    const handleLoadedMetadata = () => setDuration(video.duration)
    const handleTimeUpdate = () => {
      if (!video.duration) return
      setCurrentTime(video.currentTime)
      setDuration(video.duration)
      // Drive the plugin's percent-progress boundary detection.
      updateMediaTracking({
        id: videoId,
        player: {
          currentTime: video.currentTime,
          duration: video.duration,
          paused: video.paused,
          muted: video.muted,
          volume: Math.round(video.volume * 100),
          fullscreen: !!document.fullscreenElement,
        },
      })
    }
    const handleSeeking = () => {
      if (!isSeeking.current) {
        isSeeking.current = true
        trackMediaSeekStart({ id: videoId })
      }
    }
    const handleSeeked = () => {
      if (isSeeking.current) {
        isSeeking.current = false
        trackMediaSeekEnd({ id: videoId })
      }
    }

    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("ended", handleEnded)
    video.addEventListener("volumechange", handleVolumeChange)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("seeking", handleSeeking)
    video.addEventListener("seeked", handleSeeked)
    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      clearTimeout(visibilityTimer)
      isVisible.current = false
      isSeeking.current = false
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("ended", handleEnded)
      video.removeEventListener("volumechange", handleVolumeChange)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("seeking", handleSeeking)
      video.removeEventListener("seeked", handleSeeked)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [videoId])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen?.()
    }
  }

  const handleSeekBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !video.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    video.currentTime = Math.min(Math.max(ratio, 0), 1) * video.duration
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <figure className="my-8 not-prose">
      <div className="group relative overflow-hidden border border-rule bg-ink">
        <div className="relative w-full aspect-video">
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            playsInline
            muted
            preload="metadata"
            title={title}
            onClick={togglePlay}
            className="absolute inset-0 w-full h-full bg-ink cursor-pointer"
          />

          {/* Center play overlay — shown before first play and while paused */}
          {!isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={hasStarted ? "Play video" : `Play ${title}`}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/30 transition-colors hover:bg-ink/40 cursor-pointer"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper/95 shadow-lg transition-transform duration-200 group-hover:scale-105">
                <Play className="h-7 w-7 translate-x-0.5 text-ink" fill="currentColor" />
              </span>
              {!hasStarted && (
                <span className="text-center">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-paper/80">
                    {kicker}
                  </span>
                  <span className="mt-1 block max-w-md px-4 text-sm font-medium text-paper">
                    {title}
                  </span>
                </span>
              )}
            </button>
          )}
        </div>

        {/* Custom control bar */}
        <div className="flex items-center gap-3 border-t border-paper/10 bg-ink px-3 py-2.5">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="shrink-0 text-paper/90 transition-colors hover:text-paper cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" fill="currentColor" />
            ) : (
              <Play className="h-4 w-4" fill="currentColor" />
            )}
          </button>

          <span className="shrink-0 font-mono text-[11px] tabular-nums text-paper/70">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Seek bar */}
          <div
            onClick={handleSeekBarClick}
            className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-paper/20"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-paper transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="shrink-0 text-paper/90 transition-colors hover:text-paper cursor-pointer"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Fullscreen"
            className="shrink-0 text-paper/90 transition-colors hover:text-paper cursor-pointer"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <figcaption className="mt-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        {kicker} · {title}
      </figcaption>
    </figure>
  )
}
