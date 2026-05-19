import Link from "next/link";
import { RiArrowRightLine } from "@remixicon/react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  actionLabel?: string;
  level?: "h1" | "h2";
};

export function SectionHeader({ eyebrow, title, description, href, actionLabel = "전체보기", level = "h2" }: SectionHeaderProps) {
  const Heading = level;

  return (
    <div className="section-header" data-aos="fade-up">
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <Heading>{title}</Heading>
        {description ? <p>{description}</p> : null}
      </div>
      {href ? (
        <Link className="link-button" href={href}>
          {actionLabel}
          <RiArrowRightLine size={16} />
        </Link>
      ) : null}
    </div>
  );
}
