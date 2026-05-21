import Link from "next/link";
import { RiMapPinLine, RiStarFill, RiTimeLine } from "@remixicon/react";
import { ProductBadge } from "@/components/Badge";
import type { Experience } from "@/lib/data";
import { getBadgeTone, type BadgeTone } from "@/lib/badges";
import { formatWon } from "@/lib/format";
import { experiencePath } from "@/lib/routes";

type ExperienceCardProps = {
  experience: Experience;
  compact?: boolean;
};

export function ExperienceCard({ experience, compact = false }: ExperienceCardProps) {
  const badgeLabels = getExperienceBadgeLabels(experience);

  return (
    <Link
      className={compact ? "experience-card compact" : "experience-card"}
      data-aos="fade-up"
      href={experiencePath(experience.slug)}
    >
      <span className="card-image-wrap">
        <img src={experience.image} alt={experience.title} className="card-image" loading="lazy" />
        {badgeLabels.length ? (
          <span className="badge-row">
            {badgeLabels.map((badge) => (
              <ProductBadge tone={badge.tone} key={badge.label}>
                {badge.label}
              </ProductBadge>
            ))}
          </span>
        ) : null}
      </span>
      <span className="card-body">
        <span className="card-eyebrow">{experience.eyebrow}</span>
        <strong>{experience.title}</strong>
        <span className="card-meta">
          <span>
            <RiMapPinLine size={14} />
            {experience.region}
          </span>
          <span>
            <RiTimeLine size={14} />
            {experience.duration}
          </span>
        </span>
        <span className="card-tags">
          {experience.tags.slice(0, 3).map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </span>
        <span className="price-row">
          <span>
            {experience.originalPrice ? <del>{formatWon(experience.originalPrice)}</del> : null}
            <b>{formatWon(experience.price)}</b>
          </span>
          <span className="rating">
            <RiStarFill size={14} />
            {experience.rating.toFixed(1)}
          </span>
        </span>
      </span>
    </Link>
  );
}

function getExperienceBadgeLabels(experience: Experience) {
  const labels: { label: string; tone: BadgeTone }[] = [];
  const hasLastSeat = experience.schedules.some((schedule) => schedule.capacity - schedule.booked === 1);

  if (experience.badge) {
    labels.push({ label: experience.badge, tone: getBadgeTone(experience.badge) });
  }

  if (hasLastSeat) {
    labels.push({ label: "1자리 남음", tone: "stock" });
  }

  return labels;
}
