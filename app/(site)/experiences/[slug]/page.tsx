import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  RiAlarmWarningLine,
  RiArrowRightSLine,
  RiBankCardLine,
  RiCalendarCheckLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiCoupon3Line,
  RiGiftLine,
  RiHeart3Line,
  RiInformationLine,
  RiMapPin2Line,
  RiQuestionAnswerLine,
  RiRouteLine,
  RiShareForwardLine,
  RiShieldCheckLine,
  RiShieldStarLine,
  RiStarFill,
  RiTimeLine,
  RiUserStarLine,
} from "@remixicon/react";
import { DetailHeroSlider } from "@/components/DetailHeroSlider";
import { DetailOptionSelector } from "@/components/DetailOptionSelector";
import { DetailRelatedExperiences } from "@/components/DetailRelatedExperiences";
import { DetailReviewSliders } from "@/components/DetailReviewSliders";
import { ExperienceAnchor } from "@/components/ExperienceAnchor";
import { ExperienceIntroMedia } from "@/components/ExperienceIntroMedia";
import type { Experience, ExperienceReview } from "@/lib/data";
import { getExperience, getExperiences, getProductDetailContent, getProductReviews } from "@/lib/content";
import { userRoutes } from "@/lib/routes";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type DetailCopy = {
  title: string;
  eyebrow: string;
  region: string;
  category: string;
  duration: string;
  language: string;
  summary: string;
  description: string;
  tags: string[];
  highlights: string[];
  recommendedFor: string[];
  included: string[];
  excluded: string[];
  notices: string[];
  refundRules: string[];
  scheduleSteps: { time: string; title: string }[];
  host: Experience["host"];
  place: Experience["place"];
  scheduleLabels: string[];
  reviews: ExperienceReview[];
};

const anchorItems = [
  { id: "intro", label: "상품소개" },
  { id: "course", label: "코스" },
  { id: "included", label: "포함·불포함" },
  { id: "guide", label: "이용안내" },
  { id: "notice", label: "필수확인사항" },
  { id: "refund", label: "취소·환불" },
  { id: "review", label: "후기" },
];

const topShortcutItems = [
  { href: "#course", label: "코스", icon: RiRouteLine },
  { href: "#guide", label: "만나는시간", icon: RiTimeLine },
  { href: "#guide", label: "만나는장소", icon: RiMapPin2Line },
  { href: "#included", label: "포함·불포함사항", icon: RiCheckboxCircleLine },
  { href: "#refund", label: "환불정책", icon: RiShieldCheckLine },
  { href: "#share", label: "공유", icon: RiShareForwardLine },
];

const DETAIL_COPY: Record<string, DetailCopy> = {
  "jeju-fermentation-table": {
    title: "제주 발효 밥상 클래스",
    eyebrow: "미식 클래스",
    region: "제주시",
    category: "미식",
    duration: "150분",
    language: "한국어",
    summary: "제주 식재료와 발효의 맛을 배우고 직접 한 상을 완성하는 로컬 미식 클래스입니다.",
    description:
      "호스트가 준비한 제주 식재료를 함께 살펴보고, 지역 장과 발효 양념을 활용해 반찬과 메인 메뉴를 만듭니다. 완성한 밥상은 함께 나누어 먹으며 제주 생산자의 이야기까지 자연스럽게 들을 수 있습니다.",
    tags: ["쿠킹", "발효", "소규모", "실내"],
    highlights: ["제주 제철 식재료 해설", "발효 양념 테이스팅", "로컬 밥상 조리 실습", "완성 메뉴 식사와 레시피 카드 제공"],
    recommendedFor: ["제주에서 미식 체험을 찾는 분", "소규모로 깊이 있는 시간을 보내고 싶은 분", "실내에서 안정적으로 진행되는 일정을 원하는 분"],
    included: ["식재료비", "발효 양념 테이스팅", "완성 메뉴 식사", "앞치마와 조리 도구"],
    excluded: ["개인 여행자 보험", "왕복 교통", "포함사항 외 추가 주문"],
    notices: ["알레르기가 있다면 예약 전 요청사항에 남겨주세요.", "시작 10분 전 도착을 권장합니다.", "재료 수급 상황에 따라 일부 메뉴가 변경될 수 있습니다."],
    refundRules: ["체험 3일 전까지 100% 환불", "체험 1일 전까지 50% 환불", "당일 취소 및 노쇼는 환불이 어렵습니다.", "호스트 사정 또는 기상 악화로 취소될 경우 전액 환불됩니다."],
    scheduleSteps: [
      { time: "시작 10분 전", title: "체크인 및 재료 안내" },
      { time: "0:10", title: "제주 발효 양념과 식재료 이야기" },
      { time: "0:35", title: "밑반찬과 메인 메뉴 조리" },
      { time: "1:50", title: "완성 밥상 식사와 질의응답" },
    ],
    host: {
      name: "이더라운드 로컬 키친",
      description: "제주의 식문화와 생산자를 여행자에게 연결하는 로컬 미식 호스트입니다.",
    },
    place: {
      name: "제주 로컬 키친",
      address: "제주특별자치도 제주시 중앙로 12",
    },
    scheduleLabels: ["오전 10:30", "오후 2:00", "오전 10:30"],
    reviews: [
      { name: "김하나", rating: 5, text: "일정 안내가 명확했고 호스트 설명이 좋아 제주를 더 가까이 느낄 수 있었어요." },
      { name: "박지윤", rating: 5, text: "팀 단위 예약 가능 시간이 보여서 인원 조율이 편했습니다." },
    ],
  },
  "brewery-village-walk": {
    title: "제주 양조장과 마을 산책",
    eyebrow: "로컬 투어",
    region: "서귀포",
    category: "양조",
    duration: "120분",
    language: "한국어",
    summary: "작은 양조장의 발효실을 둘러보고 마을길을 따라 걷는 제주 로컬 투어입니다.",
    description: "양조가가 들려주는 술이 빚어지는 과정, 로컬 재료와 이동 경로, 마을 골목 산책이 이어지는 프로그램입니다.",
    tags: ["양조장", "마을", "시음"],
    highlights: ["양조장 투어", "전통주 시음", "마을 해설", "로컬 간식"],
    recommendedFor: ["제주의 작은 생산자를 만나고 싶은 분", "가볍게 걷는 투어를 원하는 분", "전통주와 로컬 이야기에 관심 있는 분"],
    included: ["전문 해설", "시음", "간식"],
    excluded: ["왕복 교통", "개인 경비", "추가 주류 구매"],
    notices: ["만 19세 이상만 시음 가능합니다.", "편한 신발을 권장합니다."],
    refundRules: ["체험 3일 전까지 100% 환불", "체험 1일 전까지 50% 환불", "당일 취소 및 노쇼는 환불이 어렵습니다."],
    scheduleSteps: [
      { time: "0:00", title: "양조장 체크인" },
      { time: "0:15", title: "발효실 투어" },
      { time: "0:55", title: "마을 산책" },
      { time: "1:40", title: "시음과 마무리" },
    ],
    host: {
      name: "서귀포 브루어리 크루",
      description: "제주 남쪽의 작은 양조장과 로컬 문화를 소개합니다.",
    },
    place: {
      name: "서귀포 로컬 브루어리",
      address: "제주특별자치도 서귀포시 원도심로 44",
    },
    scheduleLabels: ["오후 3:00", "오후 3:00", "오후 4:00"],
    reviews: [{ name: "이서연", rating: 5, text: "양조장과 마을 이야기가 자연스럽게 이어져서 좋았습니다." }],
  },
  "haenyeo-seafood-table": {
    title: "해녀의 계절 바다 밥상",
    eyebrow: "프리미엄",
    region: "구좌",
    category: "미식",
    duration: "180분",
    language: "한국어",
    summary: "해녀가 들려주는 바다 이야기와 제철 해산물 식사를 함께하는 프리미엄 체험입니다.",
    description: "구좌 바다의 계절과 물질 이야기를 듣고, 그날 들어온 재료로 차린 바다 밥상을 나눕니다.",
    tags: ["해녀", "식사", "스토리", "프리미엄"],
    highlights: ["해녀 토크", "계절 해산물", "사진 포인트", "소규모 식사"],
    recommendedFor: ["제주 바다 문화를 깊이 듣고 싶은 분", "프리미엄 식사 체험을 원하는 분", "조용한 소규모 일정을 선호하는 분"],
    included: ["식사", "음료 1잔", "호스트 해설"],
    excluded: ["왕복 교통", "개인 경비", "추가 음료"],
    notices: ["기상 상황에 따라 메뉴가 변경될 수 있습니다.", "해산물 알레르기 확인이 필요합니다."],
    refundRules: ["체험 5일 전까지 100% 환불", "체험 2일 전까지 50% 환불", "당일 취소 및 노쇼는 환불이 어렵습니다."],
    scheduleSteps: [
      { time: "0:00", title: "바다 이야기와 음료" },
      { time: "0:35", title: "계절 식재료 소개" },
      { time: "1:00", title: "바다 밥상 식사" },
      { time: "2:30", title: "사진 촬영과 마무리" },
    ],
    host: {
      name: "구좌 바다 호스트",
      description: "지역 생산자와 여행자를 연결하는 해녀 커뮤니티입니다.",
    },
    place: {
      name: "구좌 바다 작업장",
      address: "제주특별자치도 제주시 구좌읍 일주동로 88",
    },
    scheduleLabels: ["오전 11:00", "오전 11:00"],
    reviews: [{ name: "오민지", rating: 5, text: "제주 바다를 식탁 위에서 만나는 경험이었어요." }],
  },
  "citrus-dessert-lab": {
    title: "제주 감귤 디저트 랩",
    eyebrow: "가족 추천",
    region: "애월",
    category: "베이킹",
    duration: "100분",
    language: "한국어",
    summary: "제주 감귤을 활용해 작은 디저트와 음료를 만드는 가족형 클래스입니다.",
    description: "아이와 어른이 함께 즐길 수 있도록 난이도를 맞추고 제주 감귤의 품종과 향을 곁들여 배웁니다.",
    tags: ["쿠킹", "베이킹", "가족", "감귤"],
    highlights: ["감귤청 만들기", "미니 타르트", "포장 제공", "가족석 운영"],
    recommendedFor: ["아이와 함께하는 실내 체험을 찾는 분", "짧고 쉬운 베이킹을 원하는 분", "비 오는 날 가능한 일정을 찾는 분"],
    included: ["재료비", "포장 박스", "음료"],
    excluded: ["왕복 교통", "개인 경비", "추가 메뉴 주문"],
    notices: ["초등 저학년은 보호자 동반이 필요합니다.", "예약 인원 기준으로 재료가 준비됩니다."],
    refundRules: ["체험 3일 전까지 100% 환불", "체험 1일 전까지 50% 환불", "당일 취소 및 노쇼는 환불이 어렵습니다."],
    scheduleSteps: [
      { time: "0:00", title: "감귤 품종과 재료 소개" },
      { time: "0:20", title: "감귤청과 디저트 만들기" },
      { time: "1:10", title: "포장과 음료 시음" },
    ],
    host: {
      name: "애월 디저트 스튜디오",
      description: "제주 과일을 활용한 베이킹 클래스를 운영합니다.",
    },
    place: {
      name: "애월 스위트룸",
      address: "제주특별자치도 제주시 애월읍 애월로 22",
    },
    scheduleLabels: ["오후 1:30", "오후 1:30"],
    reviews: [{ name: "최유진", rating: 5, text: "아이와 함께 만들고 포장까지 할 수 있어 만족스러웠어요." }],
  },
  "farm-to-market-picnic": {
    title: "제주 팜투마켓 피크닉",
    eyebrow: "기획전",
    region: "한림",
    category: "팜투어",
    duration: "90분",
    language: "한국어",
    summary: "농장 산책 후 로컬 마켓 키트로 피크닉을 즐기는 야외 체험입니다.",
    description: "생산자의 밭을 둘러보고 직접 고른 재료로 작은 피크닉 바구니를 준비합니다.",
    tags: ["농장", "마켓", "피크닉"],
    highlights: ["농장 산책", "마켓 쿠폰", "피크닉 매트", "사진 스팟"],
    recommendedFor: ["가벼운 야외 체험을 원하는 분", "로컬 농산물과 마켓을 함께 즐기고 싶은 분", "사진이 남는 일정을 찾는 분"],
    included: ["입장", "마켓 키트", "피크닉 대여"],
    excluded: ["왕복 교통", "개인 경비", "추가 구매"],
    notices: ["우천 시 실내 마켓 투어로 전환합니다.", "반려동물 동반은 별도 문의가 필요합니다."],
    refundRules: ["체험 3일 전까지 100% 환불", "체험 1일 전까지 50% 환불", "당일 취소 및 노쇼는 환불이 어렵습니다."],
    scheduleSteps: [
      { time: "0:00", title: "농장 입장과 안내" },
      { time: "0:20", title: "밭 산책과 수확 이야기" },
      { time: "0:55", title: "마켓 키트 픽업" },
      { time: "1:10", title: "피크닉 자유 시간" },
    ],
    host: {
      name: "한림 로컬팜",
      description: "농장과 작은 시장을 연결하는 로컬 파트너입니다.",
    },
    place: {
      name: "한림 로컬팜",
      address: "제주특별자치도 제주시 한림읍 중산간로 33",
    },
    scheduleLabels: ["오전 10:00", "오전 10:00"],
    reviews: [{ name: "오다은", rating: 4, text: "가볍게 걷고 먹기 좋아서 가족 일정으로 좋았습니다." }],
  },
  "private-fine-dining-night": {
    title: "제주 프라이빗 다이닝 나이트",
    eyebrow: "스페셜",
    region: "중문",
    category: "미식",
    duration: "210분",
    language: "한국어",
    summary: "제주 식재료 기반 코스와 페어링을 즐기는 소규모 프라이빗 다이닝입니다.",
    description: "셰프가 큐레이션한 코스 메뉴와 로컬 차, 페어링을 통해 제주의 밤을 깊이 있게 경험합니다.",
    tags: ["파인다이닝", "코스", "프라이빗"],
    highlights: ["코스 다이닝", "페어링", "셰프 토크", "프라이빗 테이블"],
    recommendedFor: ["특별한 저녁 일정을 원하는 분", "제주 식재료 기반 코스를 경험하고 싶은 분", "소규모 모임을 준비하는 분"],
    included: ["코스 식사", "페어링 3종", "서비스 차지"],
    excluded: ["왕복 교통", "추가 주류", "개인 경비"],
    notices: ["메뉴는 제철 재료에 따라 변경됩니다.", "노쇼 방지를 위해 사전 결제가 필요합니다."],
    refundRules: ["체험 5일 전까지 100% 환불", "체험 2일 전까지 50% 환불", "당일 취소 및 노쇼는 환불이 어렵습니다."],
    scheduleSteps: [
      { time: "0:00", title: "웰컴 티와 착석" },
      { time: "0:20", title: "코스 다이닝 시작" },
      { time: "1:40", title: "셰프 토크와 페어링" },
      { time: "3:10", title: "차 서비스와 마무리" },
    ],
    host: {
      name: "중문 다이닝 랩",
      description: "제주 식재료를 코스로 풀어내는 프라이빗 다이닝 팀입니다.",
    },
    place: {
      name: "중문 프라이빗 키친",
      address: "제주특별자치도 서귀포시 중문관광로 72",
    },
    scheduleLabels: ["오후 6:30", "오후 6:30"],
    reviews: [{ name: "강민수", rating: 5, text: "조용한 공간에서 제주의 밤을 오래 기억하게 되는 코스였습니다." }],
  },
};

const extraGalleryImages = [
  "https://cdn.imweb.me/thumbnail/20230831/65c0d9fa53fd2.jpg",
  "https://cdn.imweb.me/thumbnail/20230831/2ca78f5658b74.jpg",
  "https://cdn.imweb.me/thumbnail/20230831/266f4e7d5ddb5.jpg",
  "https://cdn.imweb.me/thumbnail/20230831/c0504b329b735.jpg",
];

export async function generateStaticParams() {
  const experiences = await getExperiences();
  return experiences.map((experience) => ({ slug: experience.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const experience = await getExperience(slug);
  const copy = experience ? getDetailCopy(experience) : null;

  if (!experience || !copy) return {};

  return {
    title: copy.title,
    description: copy.summary,
    openGraph: {
      title: copy.title,
      description: copy.summary,
      images: [experience.image],
      type: "website",
    },
  };
}

export default async function ExperienceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const experience = await getExperience(slug);
  if (!experience) notFound();

  const [experiences, managedDetail, managedReviews] = await Promise.all([
    getExperiences(),
    getProductDetailContent(experience.slug),
    getProductReviews(experience.slug),
  ]);

  const copy = getDetailCopy(experience);
  const recommendedFor = chooseStringList(managedDetail.recommendedFor, copy.recommendedFor);
  const excluded = chooseStringList(managedDetail.excluded, copy.excluded);
  const scheduleSteps = chooseScheduleSteps(managedDetail.scheduleSteps, copy.scheduleSteps);
  const reviews = chooseReviews(managedReviews, copy.reviews);
  const displayExperience = applyDetailCopy(experience, copy, recommendedFor, excluded, scheduleSteps);
  const galleryImages = buildGalleryImages(displayExperience.image);
  const related = experiences.filter((item) => item.slug !== experience.slug).slice(0, 6);
  const firstSchedule = displayExperience.schedules[0];
  const reservationType =
    firstSchedule?.reservationType === "instant" && !firstSchedule.approvalRequired ? "즉시확정" : "승인 후 확정";
  const factItems = [
    { label: reservationType, value: "예약 요청 후 상태를 바로 확인할 수 있어요.", icon: RiCalendarCheckLine },
    { label: "추가 혜택", value: "기관 견적과 단체 할인 상담 가능", icon: RiGiftLine },
    { label: displayExperience.duration, value: "전체 진행 시간", icon: RiTimeLine },
    { label: `${displayExperience.category}, ${copy.language}`, value: "진행 언어와 카테고리", icon: RiRouteLine },
  ];
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayExperience.title,
    description: displayExperience.summary,
    image: galleryImages,
    brand: { "@type": "Brand", name: "이더라운드" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: displayExperience.rating,
      reviewCount: displayExperience.reviewCount,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "KRW",
      price: displayExperience.price,
      availability: "https://schema.org/InStock",
      url: `https://eataround.co.kr${userRoutes.experiences}/${displayExperience.slug}`,
    },
  };

  return (
    <section className="page-section experience-detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <header className="experience-detail-header">
        <nav className="experience-detail-breadcrumb" aria-label="현재 위치">
          <Link href="/">홈</Link>
          <RiArrowRightSLine size={16} aria-hidden />
          <Link href={userRoutes.experiences}>로컬체험</Link>
          <RiArrowRightSLine size={16} aria-hidden />
          <span>{displayExperience.region}</span>
        </nav>

        <div className="experience-detail-title-row">
          <div>
            <span className="eyebrow">{displayExperience.eyebrow}</span>
            <h1>{displayExperience.title}</h1>
            <div className="experience-detail-rating">
              <span className="experience-detail-stars" aria-label={`평점 ${displayExperience.rating.toFixed(1)}`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <RiStarFill size={16} key={index} />
                ))}
              </span>
              <strong>{displayExperience.rating.toFixed(1)}</strong>
              <a href="#review">후기 {displayExperience.reviewCount}개</a>
              <span>{displayExperience.place.name}</span>
            </div>
          </div>

          <div className="experience-detail-actions" id="share">
            <button type="button">
              <RiHeart3Line size={18} />
              저장
            </button>
            <button type="button">
              <RiQuestionAnswerLine size={18} />
              문의
            </button>
            <button type="button">
              <RiShareForwardLine size={18} />
              공유
            </button>
          </div>
        </div>
      </header>

  

      <DetailHeroSlider images={galleryImages} title={displayExperience.title} />

      <section className="experience-fact-strip" aria-label="상품 핵심 정보">
        {factItems.map((item) => {
          const Icon = item.icon;
          return (
            <article key={`${item.label}-${item.value}`}>
              <Icon size={22} />
              <strong>{item.label}</strong>
              <span>{item.value}</span>
            </article>
          );
        })}
      </section>

      <div className="experience-detail-layout">
        <main className="experience-detail-main">
          <ExperienceAnchor items={anchorItems} />

          <section className="experience-seller-card" id="seller">
            <div className="experience-seller-avatar">
              <RiUserStarLine size={24} />
            </div>
            <div>
              <span className="eyebrow">판매자 정보</span>
              <h2>{displayExperience.host.name}</h2>
              <p>{displayExperience.host.description}</p>
              <div className="experience-seller-badges">
                <span>응답 빠름</span>
                <span>서비스 검증</span>
                <span>예약 운영 가능</span>
              </div>
            </div>
            <a href="#reserve">문의하기</a>
          </section>

          <section className="experience-trust-card">
            <div>
              <RiShieldStarLine size={22} />
              <strong>이 판매자, 안심하고 예약하세요</strong>
            </div>
            <p>여행자 만족도, 응답률, 서비스 품질을 꼼꼼히 확인한 로컬 파트너입니다.</p>
            <a href="#notice">운영 안내 보기</a>
          </section>

          <section className="experience-notice-cards" aria-label="예약 공지">
            <article>
              <RiAlarmWarningLine size={20} />
              <div>
                <strong>예약 전 확인</strong>
                <p>일정별 좌석과 팀 단위 재고가 다를 수 있습니다. 예약 요청 후 최종 가능 여부를 안내합니다.</p>
              </div>
            </article>
            <article>
              <RiInformationLine size={20} />
              <div>
                <strong>현장 운영 안내</strong>
                <p>재료 수급, 날씨, 호스트 일정에 따라 세부 코스가 일부 조정될 수 있습니다.</p>
              </div>
            </article>
          </section>

          <section className="experience-confirm-card">
            <RiCalendarCheckLine size={22} />
            <div>
              <strong>{reservationType} 예약</strong>
              <p>{reservationType === "즉시확정" ? "결제 후 바로 예약이 확정되는 상품이에요." : "호스트 확인 후 예약이 확정되는 상품이에요."}</p>
            </div>
          </section>

          <section className="experience-benefit-section">
            <h2>결제 혜택</h2>
            <div className="experience-benefit-list">
              <article>
                <RiCoupon3Line size={20} />
                <strong>단체 할인</strong>
                <span>기관·기업 예약은 인원에 따라 별도 견적을 받을 수 있어요.</span>
              </article>
              <article>
                <RiBankCardLine size={20} />
                <strong>무이자 할부</strong>
                <span>결제 수단별 무이자 조건은 결제 단계에서 확인할 수 있어요.</span>
              </article>
            </div>
          </section>

          <section className="experience-detail-section" id="intro">
            <ExperienceIntroMedia images={galleryImages} title={displayExperience.title} />
          </section>

          <section className="experience-detail-section">
            <h2>이런 분께 추천해요</h2>
            <div className="experience-info-grid">
              {recommendedFor.map((item) => (
                <article key={item}>
                  <strong>{item}</strong>
                  <span>일정, 포함사항, 예약 조건을 함께 확인해주세요.</span>
                </article>
              ))}
            </div>
          </section>

          <section className="experience-detail-section" id="course">
            <h2>코스</h2>
            <div className="experience-timeline">
              {scheduleSteps.map((step) => (
                <div key={`${step.time}-${step.title}`}>
                  <span>{step.time}</span>
                  <strong>{step.title}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="experience-detail-section" id="included">
            <h2>포함·불포함 사항</h2>
            <div className="experience-include-grid">
              <article className="experience-include-card" data-tone="included">
                <header>
                  <span>
                    <RiCheckboxCircleLine size={22} />
                  </span>
                  <div>
                    <small>Included</small>
                    <strong>포함되어 있어요</strong>
                  </div>
                </header>
                <ul>
                  {displayExperience.included.map((item) => (
                    <li key={item}>
                      <RiCheckboxCircleLine size={18} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="experience-include-card" data-tone="excluded">
                <header>
                  <span>
                    <RiCloseCircleLine size={22} />
                  </span>
                  <div>
                    <small>Excluded</small>
                    <strong>불포함되어 있어요</strong>
                  </div>
                </header>
                <ul>
                  {excluded.map((item) => (
                    <li key={item}>
                      <RiCloseCircleLine size={18} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </section>

          <section className="experience-detail-section" id="guide">
            <h2>이용안내</h2>
            <div className="experience-guide-grid">
              <article>
                <RiTimeLine size={22} />
                <span>만나는 시간</span>
                <strong>
                  {displayExperience.schedules[0]?.date} · {displayExperience.schedules[0]?.label}
                </strong>
                <p>시작 10분 전까지 도착을 권장합니다.</p>
              </article>
              <article>
                <RiMapPin2Line size={22} />
                <span>만나는 장소</span>
                <strong>{displayExperience.place.name}</strong>
                <p>{displayExperience.place.address}</p>
              </article>
            </div>
            <div className="experience-map-placeholder" aria-label="장소 지도">
              <span>{displayExperience.region}</span>
              <strong>{displayExperience.place.name}</strong>
              <small>상세 주소와 주차 안내는 예약 확정 후 다시 안내합니다.</small>
            </div>
          </section>

          <section className="experience-detail-section" id="notice">
            <h2>필수확인사항</h2>
            <ul className="check-list">
              {displayExperience.notices.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="experience-detail-section" id="refund">
            <h2>취소·환불 규정</h2>
            <ul className="notice-list">
              {copy.refundRules.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="experience-detail-section" id="review">
            <DetailReviewSliders images={galleryImages} rating={displayExperience.rating} reviewCount={displayExperience.reviewCount} reviews={reviews} />
          </section>

          <section className="experience-related-section" aria-label="관련 상품">
            <div>
              <span className="eyebrow">인기 상품</span>
              <h2>함께 보면 좋은 로컬체험</h2>
            </div>
            <DetailRelatedExperiences items={related} />
          </section>
        </main>

      </div>

      <DetailOptionSelector experience={displayExperience} />
    </section>
  );
}

function getDetailCopy(experience: Experience) {
  return DETAIL_COPY[experience.slug] ?? makeFallbackCopy(experience);
}

function applyDetailCopy(
  experience: Experience,
  copy: DetailCopy,
  recommendedFor: string[],
  excluded: string[],
  scheduleSteps: { time: string; title: string }[],
): Experience {
  return {
    ...experience,
    title: copy.title,
    eyebrow: copy.eyebrow,
    region: copy.region,
    category: copy.category,
    duration: copy.duration,
    summary: copy.summary,
    description: copy.description,
    tags: copy.tags,
    highlights: copy.highlights,
    recommendedFor,
    excluded,
    scheduleSteps,
    included: copy.included,
    notices: copy.notices,
    host: copy.host,
    place: copy.place,
    schedules: experience.schedules.map((schedule, index) => ({
      ...schedule,
      label: copy.scheduleLabels[index] ?? schedule.label,
    })),
  };
}

function makeFallbackCopy(experience: Experience): DetailCopy {
  return {
    title: experience.title,
    eyebrow: experience.eyebrow || "로컬체험",
    region: experience.region || "제주",
    category: experience.category || "체험",
    duration: experience.duration || "120분",
    language: "한국어",
    summary: experience.summary || "제주 로컬 호스트와 함께하는 체험입니다.",
    description: experience.description || "호스트가 준비한 프로그램을 따라 지역의 맛과 이야기를 경험합니다.",
    tags: experience.tags.length ? experience.tags : ["로컬", "체험", "제주"],
    highlights: experience.highlights.length ? experience.highlights : ["호스트 안내", "소규모 운영", "예약 확정 안내"],
    recommendedFor: experience.recommendedFor?.length ? experience.recommendedFor : ["제주 로컬 체험을 찾는 분", "소규모 일정을 원하는 분", "현장 안내가 필요한 분"],
    included: experience.included.length ? experience.included : ["프로그램 진행", "예약 관리", "현장 안내"],
    excluded: experience.excluded?.length ? experience.excluded : ["왕복 교통", "개인 경비"],
    notices: experience.notices.length ? experience.notices : ["예약 전 일정과 인원을 확인해주세요."],
    refundRules: ["체험 3일 전까지 100% 환불", "체험 1일 전까지 50% 환불", "당일 취소 및 노쇼는 환불이 어렵습니다."],
    scheduleSteps: experience.scheduleSteps?.length ? experience.scheduleSteps : [{ time: "0:00", title: "체크인" }, { time: "0:10", title: "호스트 안내" }, { time: "0:30", title: "메인 체험" }],
    host: experience.host,
    place: experience.place,
    scheduleLabels: experience.schedules.map((schedule) => schedule.label),
    reviews: [{ name: "이더라운드 회원", rating: 5, text: "로컬 호스트와 함께해서 더 깊이 있게 경험할 수 있었습니다." }],
  };
}

function chooseStringList(managed: string[] | undefined, fallback: string[]) {
  if (!managed?.length || managed.some(isBrokenText)) return fallback;
  return managed;
}

function chooseScheduleSteps(managed: { time: string; title: string }[] | undefined, fallback: { time: string; title: string }[]) {
  if (!managed?.length || managed.some((item) => isBrokenText(`${item.time} ${item.title}`))) return fallback;
  return managed;
}

function chooseReviews(managed: ExperienceReview[], fallback: ExperienceReview[]) {
  if (!managed.length || managed.some((item) => isBrokenText(`${item.name} ${item.text}`))) return fallback;
  return managed;
}

function buildGalleryImages(primaryImage: string) {
  return [primaryImage, ...extraGalleryImages].filter((image, index, images) => image && images.indexOf(image) === index).slice(0, 5);
}

function isBrokenText(text: string) {
  return /[\uFFFD\uF900-\uFAFF]/.test(text);
}
