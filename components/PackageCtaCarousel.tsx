"use client";

import Link from "next/link";
import { RiArrowRightSLine } from "@remixicon/react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { PackageCta } from "@/lib/data";

export function PackageCtaCarousel({ items }: { items: PackageCta[] }) {
  if (!items.length) return null;

  return (
    <div className="package-cta-carousel" data-aos="zoom-in">
      <Swiper
        autoplay={items.length > 1 ? { delay: 3600, disableOnInteraction: false } : false}
        className="package-cta-swiper"
        loop={items.length > 1}
        modules={[Autoplay]}
        slidesPerView={1}
        spaceBetween={12}
        speed={650}
      >
        {items.map((item) => (
          <SwiperSlide key={item.title}>
            <Link className="package-cta-card" data-theme={item.theme} href={item.href}>
              <span className="package-cta-copy">
                <strong>{item.title}</strong>
                <p>
                  {item.subtitle}
                  <RiArrowRightSLine size={17} />
                </p>
              </span>
              <span className="package-cta-hosts" aria-hidden="true">
                <small>{item.hostLabel}</small>
                <i />
                {item.hostImages.map((image, index) => (
                  <img
                    alt=""
                    className={`package-cta-host host-${index + 1}`}
                    key={`${item.title}-${image}`}
                    src={image}
                  />
                ))}
              </span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
