export const userRoutes = {
  home: "/",
  experiences: "/local-experiences",
  curations: "/curations",
  events: "/events",
  journal: "/journal",
  b2b: "/b2b",
  b2bPackages: "/b2b/packages",
  b2bQuote: "/b2b/quote",
  login: "/auth/login",
  signup: "/auth/signup",
  signupGeneral: "/auth/signup/general",
  signupCorporate: "/auth/signup/corporate",
  me: "/me",
  search: "/search",
  help: "/help",
  terms: "/policies/terms",
  privacy: "/policies/privacy",
  refund: "/policies/refund",
} as const;

export function experiencePath(slug: string) {
  return `${userRoutes.experiences}/${slug}`;
}

export function curationPath(slug: string) {
  return `${userRoutes.curations}/${slug}`;
}

export function normalizeUserHref(href?: string | null) {
  if (!href) return "";

  if (href === "/experiences" || href.startsWith("/experiences?") || href.startsWith("/experiences#")) {
    return href.replace("/experiences", userRoutes.experiences);
  }

  if (href.startsWith("/experiences/")) {
    return href.replace("/experiences", userRoutes.experiences);
  }

  if (href === "/packages#quote") return userRoutes.b2bQuote;
  if (href.startsWith("/packages#quote")) return href.replace("/packages#quote", userRoutes.b2bQuote);
  if (href === "/packages") return userRoutes.b2b;
  if (href.startsWith("/packages/")) return href.replace("/packages", userRoutes.b2bPackages);

  if (href === "/signup" || href.startsWith("/signup?")) {
    return href.replace("/signup", userRoutes.signup);
  }

  if (href === "/mypage" || href.startsWith("/mypage?")) {
    return href.replace("/mypage", userRoutes.me);
  }

  return href;
}
