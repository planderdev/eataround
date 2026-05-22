import {
  adminMembers,
  adminQuoteRequests,
  adminReservations,
  collections,
  events,
  experiences,
  heroSlides,
  packageCtas,
  productReviews,
} from "@/lib/data";
import type {
  AdminBanner,
  AdminEvent,
  AdminListResult,
  AdminMember,
  AdminMutationResult,
  AdminProduct,
  AdminQuote,
  AdminReservation,
  AdminReview,
} from "@/types/api";

export function paginated<T>(request: Request, items: T[], fallbackPageSize = 20): AdminListResult<T> {
  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const pageSize = Math.max(Number(searchParams.get("pageSize") ?? fallbackPageSize), 1);
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}

export function adminOk(message: string, data?: unknown): AdminMutationResult {
  return { ok: true, message, data };
}

export const adminApiData = {
  reservations: adminReservations.map<AdminReservation>((reservation, index) => ({
    id: `reservation-${index + 1}`,
    product: reservation.product,
    user: reservation.user,
    date: reservation.date,
    people: reservation.people,
    status: reservation.status,
    amount: reservation.amount ?? 0,
    reservationType: reservation.reservationType,
    approvalRequired: reservation.approvalRequired,
  })),

  members: adminMembers.map<AdminMember>((member, index) => ({
    id: `member-${index + 1}`,
    name: member.name,
    type: member.type,
    email: member.email,
    status: member.status,
  })),

  products: experiences.map<AdminProduct>((experience) => ({
    slug: experience.slug,
    title: experience.title,
    category: experience.category,
    region: experience.region,
    price: experience.price,
    originalPrice: experience.originalPrice,
    status: "판매중",
    schedules: experience.schedules.map((schedule) => ({
      date: schedule.date,
      label: schedule.label,
      capacity: schedule.capacity,
      booked: schedule.booked,
      maxTeams: schedule.maxTeams,
      reservedTeams: schedule.reservedTeams,
    })),
  })),

  events: events.map<AdminEvent>((event) => ({
    slug: event.slug,
    title: event.title,
    period: event.period,
    status: event.status,
    location: event.venue,
    image: event.image,
  })),

  quotes: adminQuoteRequests.map<AdminQuote>((quote, index) => ({
    id: `quote-${index + 1}`,
    org: quote.org,
    contact: quote.contact,
    people: quote.people,
    program: quote.program,
    budget: quote.budget,
    status: quote.status,
    estimatedTotal: quote.estimatedTotal,
    options: quote.options,
  })),

  banners: [
    ...heroSlides.map<AdminBanner>((slide, index) => ({
      id: `hero-${index + 1}`,
      slot: "메인 배너",
      title: slide.title,
      subtitle: slide.description,
      image: slide.image,
      href: slide.href,
      status: "노출",
    })),
    ...packageCtas.map<AdminBanner>((cta, index) => ({
      id: `package-cta-${index + 1}`,
      slot: "패키지 CTA",
      title: cta.title,
      subtitle: cta.subtitle,
      image: cta.hostImages[0],
      href: cta.href,
      status: "노출",
    })),
  ],

  curations: collections.map<AdminBanner>((collection) => ({
    id: collection.slug,
    slot: "기획전",
    title: collection.title,
    subtitle: collection.description,
    image: collection.image,
    href: collection.href,
    status: "노출",
  })),

  reviews: Object.entries(productReviews).flatMap<AdminReview>(([productSlug, reviews]) =>
    reviews.map((review, index) => ({
      id: `${productSlug}-${index + 1}`,
      productSlug,
      author: review.name,
      rating: review.rating,
      text: review.text,
      status: "approved",
      reportCount: 0,
      createdAt: "2026-05-22",
    })),
  ),
};
