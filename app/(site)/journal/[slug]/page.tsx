import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RiArrowLeftLine, RiArrowRightLine, RiBookOpenLine, RiCalendarLine, RiTimeLine } from "@remixicon/react";
import { getJournal, getJournals } from "@/lib/content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type JournalArticleContent = {
  lead: string;
  sections: {
    heading: string;
    paragraphs: string[];
  }[];
  quote?: string;
  tags: string[];
};

const articleContentBySlug: Record<string, JournalArticleContent> = {
  "how-to-meet-jeju-hosts": {
    lead:
      "좋은 로컬 경험은 프로그램보다 사람을 먼저 만나는 일에서 시작합니다. 호스트의 일상, 공간의 분위기, 예약 전 확인하면 좋은 기준을 정리했습니다.",
    sections: [
      {
        heading: "호스트의 이야기가 경험의 밀도를 만듭니다",
        paragraphs: [
          "이더라운드의 로컬 체험은 단순히 정해진 순서를 따라가는 상품이 아니라, 제주에서 살아가는 사람의 방식과 감각을 직접 만나는 시간에 가깝습니다.",
          "같은 음식을 만들고 같은 장소를 걷더라도 호스트가 어떤 배경을 가지고 있는지, 어떤 태도로 참여자를 맞이하는지에 따라 체험의 인상은 크게 달라집니다.",
        ],
      },
      {
        heading: "예약 전 확인하면 좋은 것들",
        paragraphs: [
          "참여 인원, 이동 동선, 날씨에 따른 대체 운영 여부, 아이 동반 가능 여부는 예약 전에 확인해두면 좋습니다. 특히 소규모 클래스는 준비 수량이 한정되어 있어 일정 변경 가능 범위도 함께 보는 것이 안전합니다.",
          "기업이나 기관 단체라면 목적에 맞는 진행 방식도 중요합니다. 워크숍인지, 교육인지, 팀 빌딩인지에 따라 같은 프로그램도 구성과 난이도를 다르게 설계할 수 있습니다.",
        ],
      },
    ],
    quote: "좋은 호스트는 장소를 설명하는 사람이 아니라, 그 장소를 이해하는 방식을 열어주는 사람입니다.",
    tags: ["#로컬호스트", "#제주여행", "#체험예약"],
  },
  "jeju-fermentation-notes": {
    lead:
      "제주의 발효 음식은 오래 보관하기 위한 지혜이면서, 계절과 바람, 사람의 손맛이 쌓인 미식 문화입니다. 클래스에서 자주 묻는 질문을 중심으로 정리했습니다.",
    sections: [
      {
        heading: "제주 발효가 특별한 이유",
        paragraphs: [
          "제주는 해풍과 습도, 계절의 변화가 뚜렷해 재료가 숙성되는 방식에도 지역성이 드러납니다. 장, 젓갈, 식초처럼 익숙한 재료도 제주 식재료와 만나면 다른 향과 질감을 냅니다.",
          "체험에서는 완성된 음식을 맛보는 것뿐 아니라 재료가 바뀌는 과정을 이해하는 것이 중요합니다. 그래서 발효 클래스는 천천히 관찰하고 묻는 시간이 자연스럽게 많아집니다.",
        ],
      },
      {
        heading: "처음 참여하는 분들을 위한 팁",
        paragraphs: [
          "향이 강한 재료가 걱정된다면 시식 범위나 대체 재료를 미리 문의해보세요. 대부분의 호스트는 참여자의 취향과 알레르기 정보를 바탕으로 가능한 선택지를 안내합니다.",
          "완성품을 가져가는 클래스라면 보관 방법도 함께 확인하는 것이 좋습니다. 이동 시간이 길거나 숙소 냉장 보관이 어려운 일정이라면 포장 방식이 체험 만족도에 영향을 줄 수 있습니다.",
        ],
      },
    ],
    quote: "발효는 기다림의 기술이고, 로컬 미식은 그 기다림을 함께 나누는 방식입니다.",
    tags: ["#제주미식", "#발효클래스", "#베이킹"],
  },
  "team-workshop-checklist": {
    lead:
      "기관과 기업 워크숍은 참여 인원, 목적, 예산, 이동 조건을 함께 맞춰야 합니다. 견적 요청 전에 정리하면 좋은 체크리스트를 준비했습니다.",
    sections: [
      {
        heading: "프로그램보다 목적을 먼저 정리하세요",
        paragraphs: [
          "단체 프로그램은 체험 자체의 재미만큼이나 참여 후 어떤 분위기를 만들고 싶은지가 중요합니다. 신규 조직의 아이스브레이킹, 구성원 리프레시, 지역 교육, 고객 초청 행사처럼 목적이 다르면 운영 방식도 달라집니다.",
          "목적이 명확하면 난이도, 진행 시간, 식사 포함 여부, 강의와 체험의 비율을 더 빠르게 결정할 수 있습니다.",
        ],
      },
      {
        heading: "견적 요청 시 필요한 정보",
        paragraphs: [
          "희망 일정, 예상 인원, 예산 범위, 이동 수단, 식사 여부, 실내외 선호도를 먼저 정리해주세요. 인원이 10명, 20명, 30명 단위로 달라질 때 할인율이나 운영 방식이 달라질 수 있습니다.",
          "참여자 연령대와 담당자가 우려하는 지점도 함께 알려주면 더 현실적인 제안이 가능합니다. 우천 대체안이나 장소 접근성도 단체 행사에서는 반드시 확인해야 합니다.",
        ],
      },
    ],
    quote: "좋은 단체 프로그램은 많은 사람을 한 번에 움직이는 것이 아니라, 모두가 편하게 참여할 수 있는 조건을 먼저 설계하는 일입니다.",
    tags: ["#기업워크숍", "#기관패키지", "#견적요청"],
  },
};

function getArticleContent(slug: string, excerpt: string): JournalArticleContent {
  return (
    articleContentBySlug[slug] ?? {
      lead: excerpt,
      sections: [
        {
          heading: "로컬 경험을 고르는 기준",
          paragraphs: [
            excerpt,
            "일정, 장소, 참여 인원, 운영 방식까지 함께 살펴보면 나에게 맞는 로컬 경험을 더 쉽게 찾을 수 있습니다.",
          ],
        },
      ],
      tags: ["#이더라운드", "#로컬체험"],
    }
  );
}

function estimateReadingMinutes(content: JournalArticleContent) {
  const text = [content.lead, content.quote, ...content.sections.flatMap((section) => [section.heading, ...section.paragraphs])].join("");
  return Math.max(3, Math.ceil(text.length / 520));
}

export async function generateStaticParams() {
  const journals = await getJournals();
  return journals.map((journal) => ({ slug: journal.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const journal = await getJournal(slug);
  if (!journal) return {};
  return {
    title: journal.title,
    description: journal.excerpt,
    openGraph: {
      title: journal.title,
      description: journal.excerpt,
      images: [journal.image],
      type: "article",
    },
  };
}

export default async function JournalDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [journal, journals] = await Promise.all([getJournal(slug), getJournals()]);
  if (!journal) notFound();

  const content = getArticleContent(journal.slug, journal.excerpt);
  const readingMinutes = estimateReadingMinutes(content);
  const relatedJournals = journals.filter((item) => item.slug !== journal.slug).slice(0, 2);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eataround.co.kr";
  const journalUrl = `${siteUrl}/journal/${journal.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: journal.title,
    description: journal.excerpt,
    image: journal.image,
    datePublished: journal.date.replaceAll(".", "-"),
    author: { "@type": "Organization", name: "이더라운드" },
    publisher: { "@type": "Organization", name: "이더라운드" },
    mainEntityOfPage: journalUrl,
    url: journalUrl,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "저널", item: `${siteUrl}/journal` },
      { "@type": "ListItem", position: 3, name: journal.title, item: journalUrl },
    ],
  };

  return (
    <article className="page-section journal-detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <nav className="journal-detail-back" aria-label="저널 탐색">
        <Link href="/journal">
          <RiArrowLeftLine size={18} />
          저널 목록
        </Link>
      </nav>

      <header className="journal-detail-header">
        <span className="journal-detail-category">{journal.category}</span>
        <h1>{journal.title}</h1>
        <p>{content.lead}</p>
        <div className="journal-detail-meta" aria-label="글 정보">
          <span>
            <RiCalendarLine size={17} />
            {journal.date}
          </span>
          <span>
            <RiTimeLine size={17} />
            {readingMinutes}분 읽기
          </span>
          <span>
            <RiBookOpenLine size={17} />
            eat.around Journal
          </span>
        </div>
      </header>

      <figure className="journal-detail-hero">
        <img src={journal.image} alt={journal.title} />
      </figure>

      <div className="journal-detail-prose">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}

        {content.quote ? <blockquote>{content.quote}</blockquote> : null}

        <div className="journal-detail-tags" aria-label="태그">
          {content.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>

      <footer className="journal-detail-footer">
        <Link className="journal-detail-list-button" href="/journal">
          모든 저널 보기
          <RiArrowRightLine size={18} />
        </Link>

        {relatedJournals.length ? (
          <section className="journal-detail-related" aria-labelledby="related-journals">
            <div className="journal-detail-related-head">
              <span>Related</span>
              <h2 id="related-journals">함께 읽으면 좋은 글</h2>
            </div>
            <div className="journal-detail-related-grid">
              {relatedJournals.map((item) => (
                <Link className="journal-related-card" href={`/journal/${item.slug}`} key={item.slug}>
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <span>
                    <small>
                      {item.category} · {item.date}
                    </small>
                    <strong>{item.title}</strong>
                    <p>{item.excerpt}</p>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </footer>
    </article>
  );
}
