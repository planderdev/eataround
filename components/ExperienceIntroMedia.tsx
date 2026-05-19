"use client";

import { useState } from "react";

type ExperienceIntroMediaProps = {
  images: string[];
  title: string;
};

export function ExperienceIntroMedia({ images, title }: ExperienceIntroMediaProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const introImages = images.slice(0, 3);

  return (
    <div className="experience-intro-media" data-expanded={isExpanded}>
      <div className="experience-intro-media-grid">
        {introImages.map((image, index) => (
          <span className="experience-intro-media-card" key={`${image}-intro-${index}`}>
            <img src={image} alt={`${title} 소개 이미지 ${index + 1}`} loading="lazy" />
          </span>
        ))}
      </div>
      <button
        className="experience-intro-more"
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((current) => !current)}
      >
        {isExpanded ? "접기" : "내용 더보기"}
      </button>
    </div>
  );
}
