"use client";

import { useEffect, useState } from "react";
import { RiCloseLine, RiExternalLinkLine, RiFileTextLine, RiShieldCheckLine } from "@remixicon/react";

type LegalType = "terms" | "privacy";

const legalContent: Record<LegalType, { title: string; icon: typeof RiFileTextLine; sections: { heading: string; body: string }[] }> = {
  terms: {
    title: "이용약관",
    icon: RiFileTextLine,
    sections: [
      {
        heading: "서비스 이용",
        body: "이더라운드는 제주 로컬체험, 행사, 기업·기관 패키지 예약과 문의를 연결하는 서비스를 제공합니다.",
      },
      {
        heading: "예약과 결제",
        body: "이용자는 상품 상세의 일정, 포함사항, 장소, 유의사항, 환불규정을 확인한 뒤 예약을 진행합니다.",
      },
      {
        heading: "취소와 환불",
        body: "취소 및 환불은 각 상품 상세에 고지된 환불규정을 기준으로 처리되며, 현장 사정에 따라 일정 변경 안내가 진행될 수 있습니다.",
      },
      {
        heading: "중개 책임",
        body: "이더라운드는 통신판매중개자이며, 개별 상품과 거래 정보는 호스트 및 판매자가 제공한 내용을 기준으로 안내됩니다.",
      },
    ],
  },
  privacy: {
    title: "개인정보처리방침",
    icon: RiShieldCheckLine,
    sections: [
      {
        heading: "수집 항목",
        body: "회원가입, 예약, 견적 문의 과정에서 이름, 연락처, 이메일, 예약 정보, 기업·기관 정보를 수집할 수 있습니다.",
      },
      {
        heading: "이용 목적",
        body: "수집한 정보는 회원 관리, 체험 예약 확인, 문의 응대, 견적 안내, 고객센터 운영을 위해 사용됩니다.",
      },
      {
        heading: "보유 기간",
        body: "개인정보는 이용 목적 달성 후 지체 없이 파기하며, 관계 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.",
      },
      {
        heading: "개인정보보호 책임자",
        body: "책임자: 김선재 / 비즈니스 문의: hello@eataround.co.kr / 고객센터: 070-8825-0227",
      },
    ],
  },
};

export function FooterLegalLinks() {
  const [activeModal, setActiveModal] = useState<LegalType | null>(null);
  const content = activeModal ? legalContent[activeModal] : null;
  const Icon = content?.icon;

  useEffect(() => {
    if (!activeModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveModal(null);
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeModal]);

  return (
    <>
      <div className="footer-links" aria-label="푸터 법적 메뉴">
        <button className="footer-legal-button" onClick={() => setActiveModal("terms")} type="button">
          이용약관
        </button>
        <button className="footer-legal-button strong" onClick={() => setActiveModal("privacy")} type="button">
          개인정보처리방침
        </button>
        <a
          className="footer-legal-button external"
          href="http://www.ftc.go.kr/bizCommPop.do?wrkr_no=8672301167"
          target="_blank"
          rel="noopener noreferrer"
        >
          사업자정보조회
          <RiExternalLinkLine size={15} />
        </a>
      </div>

      {content ? (
        <div className="legal-modal-layer" role="presentation">
          <button className="legal-modal-backdrop" aria-label={`${content.title} 닫기`} onClick={() => setActiveModal(null)} type="button" />
          <section className="legal-modal-panel" aria-modal="true" role="dialog" aria-labelledby="legal-modal-title">
            <header className="legal-modal-header">
              <span>{Icon ? <Icon size={20} /> : null}</span>
              <h2 id="legal-modal-title">{content.title}</h2>
              <button className="legal-modal-close" aria-label={`${content.title} 닫기`} onClick={() => setActiveModal(null)} type="button">
                <RiCloseLine size={24} />
              </button>
            </header>

            <div className="legal-modal-body">
              {content.sections.map((section) => (
                <article className="legal-modal-section" key={section.heading}>
                  <h3>{section.heading}</h3>
                  <p>{section.body}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
