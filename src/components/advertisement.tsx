"use client"

import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getRandomAdvertisement, getRandomAdvertisementByCategory } from "@/src/lib/config"
import { trackAdImpression, trackAdClick } from "@/src/lib/business-events"
import { useEffect, useRef } from "react"

interface AdvertisementProps {
  type?: "banner" | "sponsored" | "sidebar"
  className?: string
  category?: string
}

export default function Advertisement({ type = "sidebar", className = "", category }: AdvertisementProps) {
  const advertisement = category
    ? getRandomAdvertisementByCategory(category, type)
    : getRandomAdvertisement(type)

  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!advertisement) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackAdImpression({
              ad_id: advertisement.id || `ad-${type}-${Date.now()}`,
              placement: type === 'banner' ? 'header' : type === 'sponsored' ? 'content_body' : 'sidebar',
              type: 'banner',
              position: 1,
              cost: advertisement.cost,
              cost_model: advertisement.cost_model,
              campaign_id: advertisement.campaign_id,
              advertiser_id: advertisement.advertiser_id
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (adRef.current) observer.observe(adRef.current);
    return () => observer.disconnect();
  }, [advertisement, type]);

  if (!advertisement) return null

  if (type === "banner") {
    return (
      <div ref={adRef} className={`border-t border-b border-rule py-4 ${className}`}>
        <div className="kicker kicker--muted mb-3">Paid Post</div>
        <Link
          href={advertisement.ctaLink}
          onClick={() => trackAdClick({
            ad_id: advertisement.id, placement: 'header', type: 'banner', position: 1,
            cost: advertisement.cost, cost_model: advertisement.cost_model,
            campaign_id: advertisement.campaign_id, advertiser_id: advertisement.advertiser_id
          })}
          className="group grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] gap-5 items-center"
        >
          <Image
            src={advertisement.image}
            alt={advertisement.title}
            className="w-full aspect-[4/3] object-cover"
            width={180}
            height={135}
          />
          <div>
            <h4
              className="headline text-lg mb-1 group-hover:underline decoration-1 underline-offset-4"
              style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
            >
              {advertisement.title}
            </h4>
            <p
              className="text-sm leading-snug text-muted-foreground mb-2"
              style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
            >
              {advertisement.description}
            </p>
            <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink inline-flex items-center">
              {advertisement.ctaText}
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </span>
          </div>
        </Link>
      </div>
    )
  }

  if (type === "sponsored") {
    return (
      <div ref={adRef} className={`border-l-2 border-ink pl-5 py-2 my-6 ${className}`}>
        <div className="kicker kicker--muted mb-2">Sponsored Content</div>
        <Link
          href={advertisement.ctaLink}
          onClick={() => trackAdClick({
            ad_id: advertisement.id, placement: 'content_body', type: 'sponsored_content', position: 1,
            cost: advertisement.cost, cost_model: advertisement.cost_model,
            campaign_id: advertisement.campaign_id, advertiser_id: advertisement.advertiser_id
          })}
          className="group block"
        >
          <h4
            className="headline text-lg mb-1.5 group-hover:underline decoration-1 underline-offset-4"
            style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
          >
            {advertisement.title}
          </h4>
          <p
            className="text-sm leading-snug text-muted-foreground mb-2"
            style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
          >
            {advertisement.description}
          </p>
          <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink inline-flex items-center">
            {advertisement.ctaText}
            <ArrowUpRight className="h-3 w-3 ml-1" />
          </span>
        </Link>
      </div>
    )
  }

  // Sidebar
  return (
    <div ref={adRef} className={`border-t-2 border-ink pt-3 ${className}`}>
      <div className="kicker kicker--muted mb-3">Advertisement</div>
      <Link
        href={advertisement.ctaLink}
        onClick={() => trackAdClick({
          ad_id: advertisement.id, placement: 'sidebar', type: 'banner', position: 1,
          cost: advertisement.cost, cost_model: advertisement.cost_model,
          campaign_id: advertisement.campaign_id, advertiser_id: advertisement.advertiser_id
        })}
        className="group block"
      >
        <Image
          src={advertisement.image}
          alt={advertisement.title}
          className="w-full aspect-[4/3] object-cover mb-3"
          width={400}
          height={300}
        />
        <h4
          className="headline text-base mb-1.5 group-hover:underline decoration-1 underline-offset-4"
          style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
        >
          {advertisement.title}
        </h4>
        <p
          className="text-sm leading-snug text-muted-foreground mb-2"
          style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
        >
          {advertisement.description}
        </p>
        <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink inline-flex items-center">
          {advertisement.ctaText}
          <ArrowUpRight className="h-3 w-3 ml-1" />
        </span>
      </Link>
    </div>
  )
}
