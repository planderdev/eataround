export type Category = {
  label: string;
  href: string;
  iconAsset: string;
  tone: "green" | "coral" | "blue" | "yellow" | "red" | "ink";
};

export type HeroSlide = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  image: string;
};

export type ScheduleStock = {
  date: string;
  label: string;
  capacity: number;
  booked: number;
  price: number;
  maxTeams?: number;
  reservedTeams?: number;
  teamCapacity?: number;
  reservationType?: "instant" | "approval" | "inquiry";
  approvalRequired?: boolean;
};

export type Experience = {
  slug: string;
  title: string;
  eyebrow: string;
  region: string;
  category: string;
  price: number;
  originalPrice?: number;
  duration: string;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: string;
  tags: string[];
  summary: string;
  description: string;
  highlights: string[];
  included: string[];
  notices: string[];
  recommendedFor?: string[];
  excluded?: string[];
  scheduleSteps?: { time: string; title: string }[];
  host: {
    name: string;
    description: string;
  };
  place: {
    name: string;
    address: string;
  };
  schedules: ScheduleStock[];
};

export type ExperienceReview = {
  name: string;
  rating: number;
  text: string;
};

export type CollectionItem = {
  slug: string;
  href: string;
  image: string;
  eyebrow: string;
  title: string;
  description: string;
};

export type EventItem = {
  slug: string;
  title: string;
  status: "ongoing" | "ended";
  period: string;
  venue: string;
  image: string;
  badge: string;
  summary: string;
  partner: string;
};

export type Journal = {
  slug: string;
  title: string;
  category: string;
  image: string;
  excerpt: string;
  date: string;
};

export type PackageProgram = {
  id: string;
  title: string;
  basePrice: number;
  duration: string;
  type: "체험" | "강의" | "투어";
};

export type PackageOptionCategory = "lodging" | "meal" | "transport" | "extra";

export type PackageOption = {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: "person" | "flat";
  category?: PackageOptionCategory;
};

export type DiscountTier = {
  min: number;
  rate: number;
  label: string;
};

export type PackageCta = {
  title: string;
  subtitle: string;
  href: string;
  theme: "red" | "green" | "blue";
  hostLabel: string;
  hostImages: string[];
};

export type AdminReservation = {
  product: string;
  user: string;
  date: string;
  people: number;
  status: string;
  amount?: number;
  reservationType?: string;
  approvalRequired?: boolean;
};

export type AdminQuoteRequest = {
  org: string;
  contact?: string;
  people: number;
  program: string;
  budget: string;
  status: string;
  estimatedTotal?: number;
  options?: string;
};

export type AdminMember = {
  name: string;
  type: string;
  email: string;
  status: string;
};

export const heroSlides: HeroSlide[] = [
  {
    eyebrow: "EAT.AROUND JEJU",
    title: "진짜 제주를 맛보는 로컬 경험",
    description:
      "요리연구가, 명인, 로컬 호스트가 안내하는 미식 클래스와 마을 투어를 한곳에서 예약하세요.",
    href: "/local-experiences",
    image: "https://images.unsplash.com/photo-1612977512598-3b8d6a498bbb?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    eyebrow: "FOR TEAMS",
    title: "기관과 기업을 위한 맞춤 패키지",
    description:
      "10명, 20명, 30명 단위의 팀 예약과 할인 견적을 편하게 확인하세요.",
    href: "/b2b",
    image: "https://images.unsplash.com/photo-1668755929372-89773da5547b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export const categories: Category[] = [
  { label: "쿠킹·베이킹", href: "/local-experiences?tag=쿠킹", iconAsset: "/assets/images/plat-icon-cook.png", tone: "coral" },
  { label: "아이와함께", href: "/local-experiences?tag=가족", iconAsset: "/assets/images/plat-icon-child.png", tone: "yellow" },
  { label: "지역·전통", href: "/local-experiences?tag=마을", iconAsset: "/assets/images/plat-icon-org.png", tone: "ink" },
  { label: "혼자여행", href: "/local-experiences?tag=소규모", iconAsset: "/assets/images/plat-icon-travel.png", tone: "red" },
  { label: "웰니스·치유", href: "/local-experiences?tag=웰니스", iconAsset: "/assets/images/plat-icon-heal.png", tone: "green" },
  { label: "비오는날", href: "/local-experiences?tag=실내", iconAsset: "/assets/images/plat-icon-rain.png", tone: "blue" },
  { label: "캠핑·액티비티", href: "/local-experiences?tag=피크닉", iconAsset: "/assets/images/plat-icon-camp.png", tone: "green" },
];

export const collections: CollectionItem[] = [
  {
    slug: "jeju-local-food",
    href: "/curations/jeju-local-food",
    image: "https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg",
    eyebrow: "미식 여행",
    title: "제주 한 끼를 오래 기억하는 방법",
    description: "로컬 식재료와 호스트가 있는 기획전",
  },
  {
    slug: "seogwipo-brewery",
    href: "/curations/seogwipo-brewery",
    image: "https://cdn.imweb.me/thumbnail/20230831/65c0d9fa53fd2.jpg",
    eyebrow: "서귀포",
    title: "양조장과 마을 산책",
    description: "마을과 술 이야기를 함께 걷는 코스",
  },
  {
    slug: "team-workshop",
    href: "/curations/team-workshop",
    image: "https://cdn.imweb.me/thumbnail/20230831/dca60ec8c7676.jpg",
    eyebrow: "Team",
    title: "기관 워크숍 추천 코스",
    description: "단체 인원에 맞춘 제주 로컬 패키지",
  },
];

export const experiences: Experience[] = [
  {
    slug: "jeju-fermentation-table",
    title: "제주 발효 밥상 클래스",
    eyebrow: "명인 클래스",
    region: "제주시",
    category: "미식",
    price: 68000,
    originalPrice: 82000,
    duration: "150분",
    rating: 4.9,
    reviewCount: 128,
    image: "https://cdn.imweb.me/thumbnail/20230831/5089900ac1a12.jpg",
    badge: "특가",
    tags: ["쿠킹", "막걸리", "소규모", "실내"],
    summary: "제주 식재료와 발효장을 활용해 로컬 밥상을 직접 완성하는 클래스입니다.",
    description:
      "호스트가 준비한 제철 식재료를 함께 손질하고, 제주 장과 술지게미를 활용한 반찬과 메인 메뉴를 만듭니다. 여행 중 하루를 깊게 기억하고 싶은 분에게 잘 맞습니다.",
    highlights: ["제철 식재료 해설", "발효장 테이스팅", "완성 메뉴 식사", "레시피 카드 제공"],
    included: ["재료비", "시음 2종", "식사", "앞치마 대여"],
    notices: ["알레르기가 있다면 예약 시 남겨주세요.", "시작 10분 전 도착을 권장합니다."],
    host: {
      name: "이더라운드 로컬 키친",
      description: "제주의 음식 문화와 생산자를 연결하는 미식 경험팀입니다.",
    },
    place: {
      name: "제주 로컬 키친",
      address: "제주특별자치도 제주시 중앙로 12",
    },
    schedules: [
      { date: "2026-05-23", label: "오전 10:30", capacity: 12, booked: 7, price: 68000, maxTeams: 3, reservedTeams: 2, teamCapacity: 4, reservationType: "approval", approvalRequired: true },
      { date: "2026-05-24", label: "오후 14:00", capacity: 12, booked: 11, price: 68000, maxTeams: 3, reservedTeams: 3, teamCapacity: 4, reservationType: "approval", approvalRequired: true },
      { date: "2026-05-30", label: "오전 10:30", capacity: 16, booked: 4, price: 72000, maxTeams: 4, reservedTeams: 1, teamCapacity: 4, reservationType: "instant", approvalRequired: false },
    ],
  },
  {
    slug: "brewery-village-walk",
    title: "제주 양조장과 마을 산책",
    eyebrow: "로컬 투어",
    region: "서귀포",
    category: "양조",
    price: 54000,
    duration: "120분",
    rating: 4.8,
    reviewCount: 94,
    image: "https://cdn.imweb.me/thumbnail/20230831/65c0d9fa53fd2.jpg",
    tags: ["양조장", "마을", "시음"],
    summary: "작은 양조장의 발효실을 둘러보고 마을 이야기를 따라 걷는 투어입니다.",
    description:
      "양조사가 직접 들려주는 술 빚는 과정, 로컬 재료의 이동 경로, 마을 골목 산책이 이어집니다.",
    highlights: ["양조장 투어", "전통주 시음", "마을 해설", "로컬 간식"],
    included: ["전문 해설", "시음", "간식"],
    notices: ["만 19세 이상만 시음이 가능합니다.", "편한 신발을 권장합니다."],
    host: {
      name: "서귀포 브루잉 크루",
      description: "제주 남쪽의 작은 양조장과 로컬 문화를 소개합니다.",
    },
    place: {
      name: "서귀포 로컬 브루어리",
      address: "제주특별자치도 서귀포시 남원읍 태위로 44",
    },
    schedules: [
      { date: "2026-05-22", label: "오후 15:00", capacity: 20, booked: 8, price: 54000, maxTeams: 4, reservedTeams: 2, teamCapacity: 5, reservationType: "instant", approvalRequired: false },
      { date: "2026-05-29", label: "오후 15:00", capacity: 20, booked: 19, price: 54000, maxTeams: 4, reservedTeams: 4, teamCapacity: 5, reservationType: "approval", approvalRequired: true },
      { date: "2026-06-05", label: "오후 16:00", capacity: 20, booked: 2, price: 56000, maxTeams: 4, reservedTeams: 1, teamCapacity: 5, reservationType: "instant", approvalRequired: false },
    ],
  },
  {
    slug: "haenyeo-seafood-table",
    title: "해녀의 계절 바다 밥상",
    eyebrow: "프리미엄",
    region: "구좌",
    category: "미식",
    price: 96000,
    duration: "180분",
    rating: 5,
    reviewCount: 47,
    image: "https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg",
    badge: "마감임박",
    tags: ["해녀", "식사", "스토리", "웰니스"],
    summary: "해녀가 들려주는 바다 이야기와 제철 해산물 식사를 함께합니다.",
    description:
      "구좌 바다의 계절과 물질 이야기를 듣고, 그날 들어온 식재료로 차린 밥상을 나눕니다.",
    highlights: ["해녀 토크", "계절 해산물", "사진 포인트", "소규모 식사"],
    included: ["식사", "웰컴 티", "호스트 해설"],
    notices: ["기상 상황에 따라 메뉴가 바뀔 수 있습니다.", "해산물 알레르기 확인이 필요합니다."],
    host: {
      name: "구좌 바다 호스트",
      description: "지역 생산자와 여행자를 연결하는 해녀 커뮤니티입니다.",
    },
    place: {
      name: "구좌 바다 작업장",
      address: "제주특별자치도 제주시 구좌읍 해맞이해안로 88",
    },
    schedules: [
      { date: "2026-05-25", label: "오전 11:00", capacity: 10, booked: 9, price: 96000, maxTeams: 2, reservedTeams: 2, teamCapacity: 5, reservationType: "approval", approvalRequired: true },
      { date: "2026-06-01", label: "오전 11:00", capacity: 10, booked: 3, price: 96000, maxTeams: 2, reservedTeams: 1, teamCapacity: 5, reservationType: "approval", approvalRequired: true },
    ],
  },
  {
    slug: "citrus-dessert-lab",
    title: "제주 감귤 디저트 랩",
    eyebrow: "가족 추천",
    region: "애월",
    category: "베이킹",
    price: 42000,
    originalPrice: 50000,
    duration: "100분",
    rating: 4.7,
    reviewCount: 83,
    image: "https://cdn.imweb.me/thumbnail/20230831/266f4e7d5ddb5.jpg",
    tags: ["쿠킹", "베이킹", "가족", "감귤", "실내"],
    summary: "감귤을 활용한 작은 디저트와 음료를 만드는 체험입니다.",
    description:
      "아이와 어른이 함께 즐길 수 있도록 난도를 낮추고, 제주 감귤의 품종 이야기를 곁들였습니다.",
    highlights: ["감귤청 만들기", "미니 타르트", "포장 제공", "가족석 운영"],
    included: ["재료비", "포장 박스", "음료"],
    notices: ["초등 저학년은 보호자 동반이 필요합니다.", "예약 인원 기준으로 재료가 준비됩니다."],
    host: {
      name: "애월 디저트 스튜디오",
      description: "제주 과일을 활용한 베이킹 클래스를 운영합니다.",
    },
    place: {
      name: "애월 스위트룸",
      address: "제주특별자치도 제주시 애월읍 애월로 22",
    },
    schedules: [
      { date: "2026-05-23", label: "오후 13:30", capacity: 18, booked: 17, price: 42000, maxTeams: 6, reservedTeams: 6, teamCapacity: 3, reservationType: "instant", approvalRequired: false },
      { date: "2026-05-31", label: "오후 13:30", capacity: 18, booked: 12, price: 42000, maxTeams: 6, reservedTeams: 4, teamCapacity: 3, reservationType: "instant", approvalRequired: false },
    ],
  },
  {
    slug: "farm-to-market-picnic",
    title: "팜투마켓 피크닉",
    eyebrow: "기획전",
    region: "한림",
    category: "팜투어",
    price: 38000,
    duration: "90분",
    rating: 4.6,
    reviewCount: 62,
    image: "https://cdn.imweb.me/thumbnail/20230831/dca60ec8c7676.jpg",
    tags: ["농장", "마켓", "피크닉"],
    summary: "농장 산책 후 로컬 마켓 키트로 피크닉을 즐기는 프로그램입니다.",
    description:
      "생산자의 밭을 둘러보고 직접 고른 재료로 작은 피크닉 바구니를 준비합니다.",
    highlights: ["농장 산책", "마켓 쿠폰", "피크닉 매트", "사진 스팟"],
    included: ["입장", "마켓 키트", "피크닉 대여"],
    notices: ["우천 시 실내 마켓 투어로 전환됩니다.", "반려동물 동반은 별도 문의가 필요합니다."],
    host: {
      name: "한림 로컬팜",
      description: "농장과 작은 시장을 연결하는 로컬 파트너입니다.",
    },
    place: {
      name: "한림 로컬팜",
      address: "제주특별자치도 제주시 한림읍 협재로 33",
    },
    schedules: [
      { date: "2026-05-26", label: "오전 10:00", capacity: 25, booked: 11, price: 38000, maxTeams: 5, reservedTeams: 3, teamCapacity: 5, reservationType: "instant", approvalRequired: false },
      { date: "2026-06-02", label: "오전 10:00", capacity: 25, booked: 8, price: 38000, maxTeams: 5, reservedTeams: 2, teamCapacity: 5, reservationType: "instant", approvalRequired: false },
    ],
  },
  {
    slug: "private-fine-dining-night",
    title: "제주 파인다이닝 나이트",
    eyebrow: "스페셜",
    region: "중문",
    category: "미식",
    price: 142000,
    duration: "210분",
    rating: 4.9,
    reviewCount: 36,
    image: "https://cdn.imweb.me/thumbnail/20230831/c0504b329b735.jpg",
    tags: ["파인다이닝", "와인", "프라이빗"],
    summary: "제주 식재료 기반의 코스와 페어링을 즐기는 저녁 프로그램입니다.",
    description:
      "셰프가 큐레이션한 코스 메뉴와 로컬 술 페어링으로 여행의 밤을 완성합니다.",
    highlights: ["코스 다이닝", "페어링", "셰프 토크", "프라이빗 테이블"],
    included: ["코스 식사", "페어링 3종", "서비스 차지"],
    notices: ["메뉴는 제철 재료에 따라 변경됩니다.", "노쇼 방지를 위해 사전 결제가 필요합니다."],
    host: {
      name: "중문 셰프 테이블",
      description: "제주 식재료를 현대적으로 해석하는 다이닝 팀입니다.",
    },
    place: {
      name: "중문 셰프 테이블",
      address: "제주특별자치도 서귀포시 중문관광로 72",
    },
    schedules: [
      { date: "2026-05-24", label: "오후 18:30", capacity: 8, booked: 5, price: 142000, maxTeams: 2, reservedTeams: 2, teamCapacity: 4, reservationType: "approval", approvalRequired: true },
      { date: "2026-05-31", label: "오후 18:30", capacity: 8, booked: 7, price: 142000, maxTeams: 2, reservedTeams: 2, teamCapacity: 4, reservationType: "approval", approvalRequired: true },
    ],
  },
  {
    slug: "haenyeo-private-storytelling",
    title: "해녀 프라이빗 스토리텔링 살롱",
    eyebrow: "문의 예약",
    region: "구좌",
    category: "스토리",
    price: 0,
    duration: "120분",
    rating: 5,
    reviewCount: 12,
    image: "https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg",
    badge: "문의예약",
    tags: ["해녀", "스토리", "실내", "프라이빗", "소규모"],
    summary: "해녀의 일생과 바다 이야기를 작은 살롱에서 깊이 듣는 비공개 프로그램입니다.",
    description:
      "회당 정원이 작고, 해녀 호스트의 일정과 인원 구성에 맞춰 운영되어 사전 문의 예약으로 진행됩니다. 희망 일정·인원을 남기면 호스트가 운영 가능 여부와 안내를 함께 회신합니다.",
    highlights: ["해녀 호스트와의 1:1 살롱", "잠수 도구 시연", "지역 차 페어링", "기록 사진 제공"],
    included: ["입장", "웰컴 티", "촬영", "호스트 해설"],
    notices: ["호스트 일정에 따라 회신까지 24시간 정도 걸릴 수 있습니다.", "단체·기업 진행은 별도 견적으로 안내합니다."],
    host: {
      name: "구좌 해녀 살롱",
      description: "구좌 해녀 5인이 직접 운영하는 비공개 살롱입니다.",
    },
    place: {
      name: "구좌 해녀 살롱",
      address: "제주특별자치도 제주시 구좌읍 해맞이해안로 88",
    },
    schedules: [
      { date: "2026-06-08", label: "오전 11:00", capacity: 6, booked: 0, price: 0, maxTeams: 1, reservedTeams: 0, teamCapacity: 6, reservationType: "inquiry", approvalRequired: true },
      { date: "2026-06-15", label: "오후 15:00", capacity: 6, booked: 0, price: 0, maxTeams: 1, reservedTeams: 0, teamCapacity: 6, reservationType: "inquiry", approvalRequired: true },
      { date: "2026-06-22", label: "오전 11:00", capacity: 6, booked: 0, price: 0, maxTeams: 1, reservedTeams: 0, teamCapacity: 6, reservationType: "inquiry", approvalRequired: true },
    ],
  },
  {
    slug: "corporate-workshop-package",
    title: "기업·기관 제주 로컬 워크숍 패키지",
    eyebrow: "기업·기관 패키지",
    region: "제주시",
    category: "워크숍",
    price: 580000,
    duration: "1박 2일",
    rating: 4.9,
    reviewCount: 21,
    image: "https://cdn.imweb.me/thumbnail/20230831/5089900ac1a12.jpg",
    badge: "단체",
    tags: ["기업·기관", "단체", "워크숍", "패키지", "프라이빗"],
    summary: "팀 빌딩과 로컬 체험을 묶은 단체 견적 전용 패키지입니다. 10명부터 단체 할인이 적용됩니다.",
    description:
      "발효 클래스·양조장 투어·해녀 살롱을 기간과 인원에 맞춰 조합합니다. 기간·인원·옵션(숙박·식사·이동)을 선택해 단체 견적을 즉시 받아볼 수 있습니다.",
    highlights: ["맞춤 프로그램 조합", "단체 할인 자동 적용", "운영팀 24시간 검토", "최종 견적서 발송"],
    included: ["프로그램 진행", "운영 인력", "단체 사진"],
    excluded: ["숙박", "이동", "식사 옵션은 별도 견적"],
    notices: ["10인부터 단체 할인이 적용되고 50인 이상은 별도 안내합니다.", "공휴일·성수기 진행은 가용성에 따라 변동될 수 있습니다."],
    host: {
      name: "이더라운드 B2B 운영팀",
      description: "기업·기관 워크숍과 로컬 패키지를 전담 운영합니다.",
    },
    place: {
      name: "제주 전역 (희망 지역 기준)",
      address: "선택한 일정·지역에 따라 운영팀이 안내합니다.",
    },
    schedules: [
      { date: "2026-06-12", label: "패키지 견적", capacity: 50, booked: 0, price: 580000, maxTeams: 5, reservedTeams: 0, teamCapacity: 10, reservationType: "inquiry", approvalRequired: true },
    ],
  },
];

export const events: EventItem[] = [
  {
    slug: "jeju-local-table-2026",
    title: "제주 로컬테이블 2026",
    status: "ongoing",
    period: "2026.05.01 - 2026.06.30",
    venue: "제주시 원도심 일대",
    image: "https://cdn.imweb.me/thumbnail/20230831/5089900ac1a12.jpg",
    badge: "진행중",
    summary: "제주 생산자, 셰프, 여행자가 만나는 시즌형 미식 행사입니다.",
    partner: "제주시 문화재단",
  },
  {
    slug: "brewery-week",
    title: "로컬 브루어리 위크",
    status: "ongoing",
    period: "2026.05.20 - 2026.05.28",
    venue: "서귀포 로컬 브루어리",
    image: "https://cdn.imweb.me/thumbnail/20230831/65c0d9fa53fd2.jpg",
    badge: "예약중",
    summary: "양조장 투어, 페어링 다이닝, 토크가 이어지는 일주일 프로그램입니다.",
    partner: "서귀포 브루어리 협의체",
  },
  {
    slug: "market-picnic-day",
    title: "마켓 피크닉 데이",
    status: "ended",
    period: "2025.10.03 - 2025.10.05",
    venue: "한림 로컬마켓",
    image: "https://cdn.imweb.me/thumbnail/20230831/dca60ec8c7676.jpg",
    badge: "포트폴리오",
    summary: "로컬 생산자 마켓과 가족 피크닉 체험을 결합한 행사 결과입니다.",
    partner: "한림읍 상인회",
  },
];

export const journals: Journal[] = [
  {
    slug: "how-to-meet-jeju-hosts",
    title: "좋은 로컬 호스트를 만나는 방법",
    category: "Guide",
    image: "https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg",
    excerpt: "체험을 고를 때 살펴보면 좋은 호스트, 장소, 일정 기준을 소개합니다.",
    date: "2026.05.10",
  },
  {
    slug: "jeju-fermentation-notes",
    title: "제주 발효장의 작은 노트",
    category: "Food",
    image: "https://cdn.imweb.me/thumbnail/20230831/266f4e7d5ddb5.jpg",
    excerpt: "여행자가 클래스에서 자주 묻는 제주 장과 술 이야기를 모았습니다.",
    date: "2026.04.28",
  },
  {
    slug: "team-workshop-checklist",
    title: "기관 워크숍 견적 전 체크리스트",
    category: "B2B",
    image: "https://cdn.imweb.me/thumbnail/20230831/c0504b329b735.jpg",
    excerpt: "인원, 기간, 프로그램 조합을 빠르게 확정하기 위한 실무형 체크리스트입니다.",
    date: "2026.04.12",
  },
];

export const packagePrograms: PackageProgram[] = [
  { id: "food-class", title: "제주 미식 클래스", basePrice: 68000, duration: "150분", type: "체험" },
  { id: "brewery-tour", title: "양조장 투어", basePrice: 54000, duration: "120분", type: "투어" },
  { id: "host-lecture", title: "로컬 브랜드 강의", basePrice: 350000, duration: "90분", type: "강의" },
  { id: "market-picnic", title: "팜투마켓 피크닉", basePrice: 38000, duration: "90분", type: "체험" },
];

export const packageOptions: PackageOption[] = [
  { id: "lodging-standard", title: "스탠다드 숙박", description: "1박 2인실 기준 숙소 추천 및 섭외", price: 90000, priceType: "person", category: "lodging" },
  { id: "lodging-pension", title: "단체 펜션 섭외", description: "그룹 단위로 활용 가능한 펜션 풀패키지", price: 70000, priceType: "person", category: "lodging" },
  { id: "meal-local", title: "로컬 식당 식사", description: "지역 로컬 식당 사전 예약·세팅", price: 25000, priceType: "person", category: "meal" },
  { id: "meal-catering", title: "케이터링 식사", description: "체험 현장으로 도착하는 단체 케이터링", price: 32000, priceType: "person", category: "meal" },
  { id: "transport-bus", title: "전세 버스", description: "전 일정 단체 이동(45인승)", price: 480000, priceType: "flat", category: "transport" },
  { id: "transport-van", title: "프라이빗 밴", description: "소규모 이동을 위한 12인승 밴", price: 300000, priceType: "flat", category: "transport" },
  { id: "extra-photo", title: "현장 사진 기록", description: "행사 운영 사진·하이라이트 영상 제공", price: 250000, priceType: "flat", category: "extra" },
];

export const discountTiers: DiscountTier[] = [
  { min: 50, rate: 0.15, label: "50명 이상 별도 문의" },
  { min: 30, rate: 0.15, label: "30명 이상 단체 할인" },
  { min: 20, rate: 0.1, label: "20명 이상 단체 할인" },
  { min: 10, rate: 0.05, label: "10명 이상 단체 할인" },
  { min: 1, rate: 0, label: "기본가" },
];

export const productReviews: Record<string, ExperienceReview[]> = {
  "jeju-fermentation-table": [
    { name: "김하나", rating: 5, text: "일정 안내가 명확했고 호스트 설명이 좋아서 제주를 더 가까이 느낄 수 있었어요." },
    { name: "박준호", rating: 5, text: "팀 단위로 예약 가능한 회차가 보여서 인원 조율이 편했습니다." },
  ],
};

export const productDetailContent: Record<string, Pick<Experience, "recommendedFor" | "excluded" | "scheduleSteps">> = {
  "jeju-fermentation-table": {
    recommendedFor: ["제주시에서 미식 체험을 찾는 분", "소규모로 깊이 있는 시간을 보내고 싶은 분", "호스트 확인 후 확정되는 일정을 원하는 분"],
    excluded: ["개인 여행자 보험", "왕복 교통", "포함사항 외 추가 주문"],
    scheduleSteps: [
      { time: "도착 10분 전", title: "체크인과 안내" },
      { time: "0:10", title: "호스트 소개와 지역 이야기" },
      { time: "0:30", title: "메인 체험 진행" },
      { time: "마무리", title: "식사 또는 시음, 질의응답" },
    ],
  },
};

export const adminReservations: AdminReservation[] = [
  { product: "제주 발효 밥상 클래스", user: "김하나", date: "2026-05-23 오전 10:30", people: 2, status: "확정대기", amount: 136000, reservationType: "승인예약", approvalRequired: true },
  { product: "양조장과 마을 산책", user: "박준호", date: "2026-05-29 오후 15:00", people: 4, status: "결제완료", amount: 216000, reservationType: "즉시예약", approvalRequired: false },
  { product: "해녀의 계절 바다 밥상", user: "오민지", date: "2026-06-01 오전 11:00", people: 1, status: "확정", amount: 96000, reservationType: "승인예약", approvalRequired: true },
];

export const adminQuoteRequests: AdminQuoteRequest[] = [
  { org: "제주문화재단", contact: "문화사업팀", people: 30, program: "미식 클래스 + 강의", budget: "2,000만원 이내", status: "검토중", estimatedTotal: 2380000, options: "식사, 이동" },
  { org: "서울 A초등학교", contact: "체험학습 담당자", people: 40, program: "팜투마켓 피크닉", budget: "견적 요청", status: "답변필요", estimatedTotal: 1292000, options: "식사" },
];

export const adminMembers: AdminMember[] = [
  { name: "김하나", type: "일반회원", email: "hana@example.com", status: "정상" },
  { name: "제주문화재단", type: "기업·기관", email: "culture@example.org", status: "승인완료" },
  { name: "서울 A초등학교", type: "기업·기관", email: "school@example.kr", status: "승인대기" },
];

export const packageCtas: PackageCta[] = [
  {
    title: "기업·기관 맞춤 패키지",
    subtitle: "기관 워크숍 견적 안내",
    href: "/b2b/quote",
    theme: "red",
    hostLabel: "SELECTED HOST",
    hostImages: [
      "https://cdn.imweb.me/thumbnail/20230831/5089900ac1a12.jpg",
      "https://cdn.imweb.me/thumbnail/20230831/65c0d9fa53fd2.jpg",
      "https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg",
    ],
  },
  {
    title: "단체 원데이 클래스",
    subtitle: "10명부터 일정 조율 가능",
    href: "/b2b/quote",
    theme: "green",
    hostLabel: "GROUP CLASS",
    hostImages: [
      "https://cdn.imweb.me/thumbnail/20230831/266f4e7d5ddb5.jpg",
      "https://cdn.imweb.me/thumbnail/20230831/dca60ec8c7676.jpg",
      "https://cdn.imweb.me/thumbnail/20230831/c0504b329b735.jpg",
    ],
  },
];


export function getExperience(slug: string) {
  return experiences.find((experience) => experience.slug === slug);
}

export function getEvent(slug: string) {
  return events.find((event) => event.slug === slug);
}

export function getJournal(slug: string) {
  return journals.find((journal) => journal.slug === slug);
}
