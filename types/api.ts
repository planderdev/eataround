export type ApiTone = "pending" | "confirmed" | "done" | "received" | "cancelled";

export type ApiSuccess<T = unknown> = {
  ok: boolean;
  message: string;
  data?: T;
};

export type Reservation = {
  id: string;
  title: string;
  status: string;
  statusTone: ApiTone;
  schedule: string;
  people: string;
  reservationType: string;
  amount: string;
  location: string;
  payment: string;
  host: string;
  href: string;
  nextAction: string;
  timeline: string[];
};

export type Quote = {
  id: string;
  title: string;
  status: string;
  statusTone: ApiTone;
  program: string;
  period: string;
  people: string;
  estimatedTotal: string;
  manager: string;
  lastUpdated: string;
  href: string;
  timeline: string[];
};

export type WishlistItem = {
  title: string;
  region: string;
  price: string;
  badge: string;
  href: string;
  image: string;
};

export type Review = {
  title: string;
  status: string;
  statusTone: ApiTone;
  date: string;
  rating: number | null;
  text: string;
  href: string;
};

export type Profile = {
  name: string;
  organization: string;
  memberType: string;
  email: string;
  phone: string;
  joinedAt: string;
  point: string;
  couponCount: number;
  verified: boolean;
  marketing?: boolean;
};

export type ReviewPayload = {
  reservationId?: string;
  reviewId?: string;
  rating: number;
  text: string;
  images?: string[];
};

export type ProfilePayload = Partial<Pick<Profile, "name" | "organization" | "phone" | "marketing">> & {
  password?: {
    currentPassword: string;
    nextPassword: string;
  };
};

export type InquiryPayload = {
  name: string;
  phone: string;
  message: string;
  productSlug?: string;
};

export type AuthLoginPayload = {
  email: string;
  password: string;
  keepSignedIn?: boolean;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

export type AdminMutationResult<T = unknown> = {
  ok: boolean;
  message: string;
  data?: T;
};

export type AdminListResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminReservation = {
  id: string;
  product: string;
  user: string;
  date: string;
  people: number;
  status: string;
  amount: number;
  reservationType?: string;
  approvalRequired?: boolean;
};

export type AdminMember = {
  id?: string;
  name: string;
  type: string;
  email: string;
  status: string;
  joinedAt?: string;
  organization?: string;
};

export type AdminProduct = {
  slug: string;
  title: string;
  category: string;
  region: string;
  price: number;
  originalPrice?: number;
  status?: string;
  schedules?: Array<{
    date: string;
    label: string;
    capacity: number;
    booked: number;
    maxTeams?: number;
    reservedTeams?: number;
  }>;
};

export type AdminSchedule = {
  id?: string;
  productSlug: string;
  date: string;
  label: string;
  capacity: number;
  booked: number;
  maxTeams?: number;
  reservedTeams?: number;
  status?: "open" | "closed" | "soldout";
};

export type AdminQuote = {
  id?: string;
  org: string;
  contact?: string;
  people: number;
  program: string;
  budget: string;
  status: string;
  estimatedTotal?: number;
  options?: string;
};

export type AdminEvent = {
  slug: string;
  title: string;
  period: string;
  status?: "upcoming" | "ongoing" | "ended";
  location?: string;
  image?: string;
};

export type AdminBanner = {
  id?: string;
  slot: string;
  title: string;
  subtitle?: string;
  image: string;
  href: string;
  status: string;
  startsAt?: string;
  endsAt?: string;
};

export type AdminReview = {
  id?: string;
  productSlug?: string;
  author: string;
  rating: number;
  text: string;
  status: "pending" | "approved" | "hidden";
  reportCount?: number;
  createdAt?: string;
};

export type AdminNotification = {
  id: string;
  category: string;
  title: string;
  href: string;
  unread: boolean;
};
