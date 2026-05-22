import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuotePrintButton } from "@/components/admin/QuotePrintButton";
import { getAdminQuoteRequests } from "@/lib/content";
import { formatWon } from "@/lib/format";
import { withBasePath } from "@/lib/paths";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "견적서 미리보기 | 이더라운드 관리자",
};

export async function generateStaticParams() {
  const quotes = await getAdminQuoteRequests();
  return quotes.map((quote) => ({ id: encodeURIComponent(quote.org) }));
}

export default async function AdminQuotePreviewPage({ params }: PageProps) {
  const { id } = await params;
  const quotes = await getAdminQuoteRequests();
  const quote = quotes.find((item) => encodeURIComponent(item.org) === id || item.org === decodeURIComponent(id));

  if (!quote) {
    notFound();
  }

  const programs = quote.program.split("+").map((program) => program.trim()).filter(Boolean);
  const subtotal = quote.estimatedTotal ?? quote.people * 68000;
  const optionFee = quote.options ? Math.round(subtotal * 0.08) : 0;
  const total = subtotal + optionFee;

  return (
    <main className="admin-quote-preview-page">
      <div className="admin-quote-preview-actions print-hidden">
        <a className="admin-action-button ghost" href="/admin/quotes">
          견적관리로 돌아가기
        </a>
        <QuotePrintButton />
      </div>

      <article className="admin-quote-document" aria-label={`${quote.org} 견적서`}>
        <header className="admin-quote-document-header">
          <img src={withBasePath("/assets/images/logo.png")} alt="eat.around" width={500} height={74} />
          <div>
            <span>ESTIMATE</span>
            <h1>기업·기관 패키지 견적서</h1>
            <p>견적 유효기간: 발행일로부터 14일</p>
          </div>
        </header>

        <section className="admin-quote-document-grid">
          <dl>
            <div>
              <dt>수신</dt>
              <dd>{quote.org}</dd>
            </div>
            <div>
              <dt>담당자</dt>
              <dd>{quote.contact ?? "-"}</dd>
            </div>
            <div>
              <dt>참여 인원</dt>
              <dd>{quote.people.toLocaleString("ko-KR")}명</dd>
            </div>
            <div>
              <dt>예산</dt>
              <dd>{quote.budget}</dd>
            </div>
          </dl>
          <dl>
            <div>
              <dt>공급자</dt>
              <dd>지붕뚫은친구들</dd>
            </div>
            <div>
              <dt>대표</dt>
              <dd>김선재</dd>
            </div>
            <div>
              <dt>연락처</dt>
              <dd>070-8825-0227</dd>
            </div>
            <div>
              <dt>이메일</dt>
              <dd>hello@eataround.co.kr</dd>
            </div>
          </dl>
        </section>

        <table className="admin-quote-document-table">
          <thead>
            <tr>
              <th>항목</th>
              <th>수량</th>
              <th>단가</th>
              <th>금액</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((program, index) => {
              const amount = Math.round(subtotal / programs.length);
              return (
                <tr key={program}>
                  <td>
                    <strong>{program}</strong>
                    <span>현장 운영, 호스트 섭외, 기본 안내 포함</span>
                  </td>
                  <td>{quote.people}명</td>
                  <td>{formatWon(Math.round(amount / quote.people))}</td>
                  <td>{formatWon(amount)}</td>
                </tr>
              );
            })}
            {optionFee ? (
              <tr>
                <td>
                  <strong>선택 옵션</strong>
                  <span>{quote.options}</span>
                </td>
                <td>1식</td>
                <td>{formatWon(optionFee)}</td>
                <td>{formatWon(optionFee)}</td>
              </tr>
            ) : null}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>총 견적 금액</td>
              <td>{formatWon(total)}</td>
            </tr>
          </tfoot>
        </table>

        <section className="admin-quote-document-notes">
          <h2>안내사항</h2>
          <p>상세 일정, 이동 동선, 식사 옵션은 운영팀 검토 후 최종 확정됩니다.</p>
          <p>기관·기업 예약은 인원과 일정에 따라 할인율과 운영 가능 여부가 달라질 수 있습니다.</p>
        </section>
      </article>
    </main>
  );
}
