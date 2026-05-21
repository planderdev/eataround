import type { Metadata } from "next";
import { DsSidebar } from "@/components/DsSidebar";

export const metadata: Metadata = {
  title: "디자인 시스템",
};

function slug(title: string) {
  return title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function Section({ title, children }: { title: string; children: import("react").ReactNode }) {
  return (
    <section className="ds-section" id={slug(title)}>
      <h2 className="ds-section-title">{title}</h2>
      {children}
    </section>
  );
}

function TokenRow({ name, value, preview }: { name: string; value: string; preview?: import("react").ReactNode }) {
  return (
    <div className="ds-token-row">
      {preview && <div className="ds-token-preview">{preview}</div>}
      <div className="ds-token-info">
        <code className="ds-token-name">{name}</code>
        <span className="ds-token-value">{value}</span>
      </div>
    </div>
  );
}

const colors = {
  semantic: [
    { name: "--color-ink", hex: "#1d2522", label: "Ink" },
    { name: "--color-muted", hex: "#66736d", label: "Muted" },
    { name: "--color-line", hex: "#dfe7e2", label: "Line" },
    { name: "--color-surface", hex: "#ffffff", label: "Surface" },
    { name: "--color-soft", hex: "#f7f7f9", label: "Soft" },
  ],
  primary: [
    { name: "--color-primary-50", hex: "#F2FAF7" },
    { name: "--color-primary-100", hex: "#DFF3EA" },
    { name: "--color-primary-200", hex: "#BFE7D5" },
    { name: "--color-primary-300", hex: "#91D2B8" },
    { name: "--color-primary-400", hex: "#58AF8B" },
    { name: "--color-primary-500", hex: "#236F55" },
    { name: "--color-primary-600", hex: "#1F634C" },
    { name: "--color-primary-700", hex: "#1A533F" },
    { name: "--color-primary-800", hex: "#164534" },
    { name: "--color-primary-900", hex: "#103428" },
  ],
  accent: [
    { name: "--color-coral", hex: "#e8634d", label: "Coral" },
    { name: "--color-blue", hex: "#3868b2", label: "Blue" },
    { name: "--color-yellow", hex: "#f1b940", label: "Yellow" },
    { name: "--color-red", hex: "#cf4d45", label: "Red" },
  ],
  badge: [
    { name: "--color-badge-sale", hex: "#236f55", label: "Sale" },
    { name: "--color-badge-urgent", hex: "#bb62f2", label: "Urgent" },
    { name: "--color-badge-stock", hex: "#cf4d45", label: "Stock" },
    { name: "--color-badge-ongoing", hex: "#169b76", label: "Ongoing" },
    { name: "--color-badge-booking", hex: "#e8634d", label: "Booking" },
    { name: "--color-badge-neutral", hex: "#4c5a54", label: "Neutral" },
  ],
};

const fontSizes = [
  { name: "--font-size-xs", label: "xs", value: "13px" },
  { name: "--font-size-sm", label: "sm", value: "14px" },
  { name: "--font-size-md", label: "md", value: "15px" },
  { name: "--font-size-base", label: "base", value: "16px" },
  { name: "--font-size-base-lg", label: "base-lg", value: "17px" },
  { name: "--font-size-lg", label: "lg", value: "18px" },
  { name: "--font-size-xl", label: "xl", value: "19px" },
  { name: "--font-size-2xl", label: "2xl", value: "20px" },
  { name: "--font-size-3xl", label: "3xl", value: "22px" },
  { name: "--font-size-4xl", label: "4xl", value: "24px" },
  { name: "--font-size-5xl", label: "5xl", value: "25px" },
  { name: "--font-size-6xl", label: "6xl", value: "26px" },
  { name: "--font-size-7xl", label: "7xl", value: "28px" },
  { name: "--font-size-section-sm", label: "section-sm", value: "34px" },
  { name: "--font-size-section", label: "section", value: "36px" },
  { name: "--font-size-page", label: "page", value: "40px" },
  { name: "--font-size-display-sm", label: "display-sm", value: "50px" },
  { name: "--font-size-display-md", label: "display-md", value: "48px" },
  { name: "--font-size-display-lg", label: "display-lg", value: "54px" },
];

const spacings = [
  { name: "--space-8", px: "8px" },
  { name: "--space-16", px: "16px" },
  { name: "--space-24", px: "24px" },
  { name: "--space-32", px: "32px" },
  { name: "--space-40", px: "40px" },
  { name: "--space-48", px: "48px" },
  { name: "--space-56", px: "56px" },
  { name: "--space-64", px: "64px" },
  { name: "--space-72", px: "72px" },
  { name: "--space-80", px: "80px" },
  { name: "--space-88", px: "88px" },
  { name: "--space-96", px: "96px" },
  { name: "--space-112", px: "112px" },
  { name: "--space-128", px: "128px" },
  { name: "--space-144", px: "144px" },
];

const radii = [
  { name: "--radius-sm", px: "8px", label: "sm" },
  { name: "--radius-md", px: "16px", label: "md" },
  { name: "--radius-lg", px: "24px", label: "lg" },
  { name: "--radius-xl", px: "32px", label: "xl" },
  { name: "--radius-pill", px: "999px", label: "pill" },
];

const badgeTones = [
  { tone: "sale", label: "특가" },
  { tone: "urgent", label: "마감임박" },
  { tone: "stock", label: "잔여1" },
  { tone: "ongoing", label: "진행중" },
  { tone: "booking", label: "예약오픈" },
  { tone: "neutral", label: "일반" },
];

export default function DesignSystemPage() {
  return (
    <div className="ds-page">
      <div className="ds-header">
        <div className="container">
          <p className="ds-header-eyebrow">Eataround</p>
          <h1 className="ds-header-title">디자인 시스템</h1>
          <p className="ds-header-desc">색상, 타이포그래피, 간격, 컴포넌트 등 UI 토큰과 패턴을 한 곳에서 확인할 수 있습니다.</p>
        </div>
      </div>

      <div className="container">
        <div className="ds-layout">
          <DsSidebar />
          <div className="ds-body">

          {/* Colors */}
          <Section title="Color">

            <h3 className="ds-subsection-title">Semantic</h3>
            <div className="ds-color-grid">
              {colors.semantic.map((c) => (
                <div key={c.name} className="ds-color-swatch">
                  <div className="ds-color-chip" style={{ background: c.hex, border: c.hex === "#ffffff" ? "1px solid var(--color-line)" : undefined }} />
                  <p className="ds-color-label">{c.label}</p>
                  <code className="ds-color-token">{c.name}</code>
                  <span className="ds-color-hex">{c.hex}</span>
                </div>
              ))}
            </div>

            <h3 className="ds-subsection-title">Primary Scale</h3>
            <div className="ds-primary-scale">
              {colors.primary.map((c) => (
                <div key={c.name} className="ds-primary-chip" style={{ background: c.hex }}>
                  <span className="ds-primary-chip-name" style={{ color: c.hex === "#F2FAF7" || c.hex === "#DFF3EA" ? "#236f55" : "#fff" }}>
                    {c.name.replace("--color-primary-", "")}
                  </span>
                  <span className="ds-primary-chip-hex" style={{ color: c.hex === "#F2FAF7" || c.hex === "#DFF3EA" ? "#236f55" : "rgba(255,255,255,0.75)" }}>
                    {c.hex}
                  </span>
                </div>
              ))}
            </div>

            <h3 className="ds-subsection-title">Accent</h3>
            <div className="ds-color-grid">
              {colors.accent.map((c) => (
                <div key={c.name} className="ds-color-swatch">
                  <div className="ds-color-chip" style={{ background: c.hex }} />
                  <p className="ds-color-label">{c.label}</p>
                  <code className="ds-color-token">{c.name}</code>
                  <span className="ds-color-hex">{c.hex}</span>
                </div>
              ))}
            </div>

            <h3 className="ds-subsection-title">Badge</h3>
            <div className="ds-color-grid">
              {colors.badge.map((c) => (
                <div key={c.name} className="ds-color-swatch">
                  <div className="ds-color-chip" style={{ background: c.hex }} />
                  <p className="ds-color-label">{c.label}</p>
                  <code className="ds-color-token">{c.name}</code>
                  <span className="ds-color-hex">{c.hex}</span>
                </div>
              ))}
            </div>

            <h3 className="ds-subsection-title">Semantic Feedback</h3>
            <div className="ds-color-grid">
              <div className="ds-color-swatch">
                <div className="ds-color-chip" style={{ background: "#236F55" }} />
                <p className="ds-color-label">Success</p>
                <code className="ds-color-token">--color-success</code>
                <span className="ds-color-hex">→ --color-primary</span>
              </div>
              <div className="ds-color-swatch">
                <div className="ds-color-chip" style={{ background: "#cf4d45" }} />
                <p className="ds-color-label">Error</p>
                <code className="ds-color-token">--color-error</code>
                <span className="ds-color-hex">→ --color-red</span>
              </div>
              <div className="ds-color-swatch">
                <div className="ds-color-chip" style={{ background: "#f1b940" }} />
                <p className="ds-color-label">Warning</p>
                <code className="ds-color-token">--color-warning</code>
                <span className="ds-color-hex">→ --color-yellow</span>
              </div>
            </div>
          </Section>

          {/* Typography */}
          <Section title="Typography">
            <h3 className="ds-subsection-title">Font Family</h3>
            <div className="ds-font-family-demo">
              <p className="ds-font-sample">가나다라마바사 Pretendard ABCDEFG 0123456789</p>
              <code className="ds-token-name">Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif</code>
            </div>

            <h3 className="ds-subsection-title">Font Weight</h3>
            <div className="ds-weight-row">
              <span style={{ fontWeight: 400 }}>Regular 400 — 로컬체험의 진짜 이야기</span>
              <span style={{ fontWeight: 500 }}>Medium 500 — 로컬체험의 진짜 이야기</span>
              <span style={{ fontWeight: 600 }}>Semibold 600 — 로컬체험의 진짜 이야기</span>
              <span style={{ fontWeight: 700 }}>Bold 700 — 로컬체험의 진짜 이야기</span>
            </div>

            <h3 className="ds-subsection-title">Font Size Scale</h3>
            <div className="ds-type-scale">
              {fontSizes.map((fs) => (
                <div key={fs.name} className="ds-type-row">
                  <div className="ds-type-meta">
                    <code className="ds-token-name">{fs.name}</code>
                    <span className="ds-token-value">{fs.value}</span>
                  </div>
                  <p className="ds-type-sample" style={{ fontSize: `var(${fs.name})` }}>
                    로컬체험의 진짜 이야기를 담다
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* Spacing */}
          <Section title="Spacing">
            <div className="ds-spacing-list">
              {spacings.map((s) => (
                <TokenRow
                  key={s.name}
                  name={s.name}
                  value={s.px}
                  preview={
                    <div className="ds-spacing-bar-wrap">
                      <div className="ds-spacing-bar" style={{ width: `min(${s.px}, 100%)` }} />
                    </div>
                  }
                />
              ))}
            </div>
          </Section>

          {/* Border Radius */}
          <Section title="Border Radius">
            <div className="ds-radius-grid">
              {radii.map((r) => (
                <div key={r.name} className="ds-radius-item">
                  <div className="ds-radius-box" style={{ borderRadius: `var(${r.name})` }} />
                  <code className="ds-token-name">{r.label}</code>
                  <span className="ds-token-value">{r.px}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Shadow */}
          <Section title="Shadow">
            <div className="ds-shadow-grid">
              {[
                { name: "--shadow-xs", value: "0 6px 18px rgba(35,60,48,0.08)", shadow: "0 6px 18px rgba(35,60,48,0.08)" },
                { name: "--shadow-sm", value: "0 10px 28px rgba(36,54,45,0.06)", shadow: "0 10px 28px rgba(36,54,45,0.06)" },
                { name: "--shadow-soft", value: "0 18px 44px rgba(35,60,48,0.12)", shadow: "0 18px 44px rgba(35,60,48,0.12)" },
                { name: "--shadow-lg", value: "0 24px 52px rgba(18,30,24,0.12)", shadow: "0 24px 52px rgba(18,30,24,0.12)" },
                { name: "--shadow-xl", value: "0 26px 70px rgba(16,24,20,0.24)", shadow: "0 26px 70px rgba(16,24,20,0.24)" },
                { name: "--shadow-focus", value: "0 0 0 3px rgba(35,111,85,0.08)", shadow: "0 0 0 3px rgba(35,111,85,0.08), 0 0 0 1px var(--color-primary)" },
              ].map((s) => (
                <div key={s.name} className="ds-shadow-item">
                  <div className="ds-shadow-box" style={{ boxShadow: s.shadow }} />
                  <code className="ds-token-name">{s.name}</code>
                  <span className="ds-token-value">{s.value}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Transitions */}
          <Section title="Transition">
            <div className="ds-token-list">
              {[
                { name: "--transition-fast", value: "0.18s ease", label: "빠름 — hover 즉각 반응" },
                { name: "--transition-base", value: "0.2s ease", label: "기본 — 대부분의 인터랙션" },
                { name: "--transition-moderate", value: "0.24s ease", label: "중간 — 패널·드롭다운" },
                { name: "--transition-slow", value: "0.35s ease", label: "느림 — 진행 바·펼침" },
              ].map((t) => (
                <div key={t.name} className="ds-transition-row">
                  <div className="ds-transition-demo" style={{ transitionDuration: t.value.split("s")[0] + "s" }}>
                    <div className="ds-transition-dot" />
                  </div>
                  <div className="ds-token-info">
                    <code className="ds-token-name">{t.name}</code>
                    <span className="ds-token-value">{t.value}</span>
                    <span className="ds-token-desc">{t.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Z-index */}
          <Section title="Z-index">
            <div className="ds-token-list">
              {[
                { name: "--z-dropdown", value: "20", desc: "드롭다운 · 플로팅 메뉴" },
                { name: "--z-floating", value: "25", desc: "플로팅 CTA · 고정 패널" },
                { name: "--z-header", value: "40", desc: "사이트 헤더" },
                { name: "--z-mega-menu", value: "45", desc: "메가 네비게이션" },
                { name: "--z-overlay", value: "50", desc: "부킹 패널 오버레이" },
                { name: "--z-date-picker", value: "60", desc: "캘린더 피커" },
                { name: "--z-tooltip", value: "80", desc: "툴팁" },
                { name: "--z-nav-mobile", value: "90", desc: "모바일 네비게이션" },
                { name: "--z-modal", value: "120", desc: "모달 · 필터 시트" },
                { name: "--z-modal-top", value: "130", desc: "최상위 모달(약관·알림)" },
              ].map((z) => (
                <div key={z.name} className="ds-token-row">
                  <div className="ds-token-preview">
                    <div className="ds-z-bar" style={{ width: `${(parseInt(z.value) / 130) * 100}%` }}>
                      <span>{z.value}</span>
                    </div>
                  </div>
                  <div className="ds-token-info">
                    <code className="ds-token-name">{z.name}</code>
                    <span className="ds-token-desc">{z.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Line Height */}
          <Section title="Line Height">
            <div className="ds-type-scale">
              {[
                { name: "--leading-tight", value: "1.2", sample: "제목처럼 촘촘하게 / 짧은 헤드라인에 적합합니다" },
                { name: "--leading-snug", value: "1.35", sample: "카드 제목이나 섹션 헤더처럼 / 적당히 숨쉬는 행간입니다" },
                { name: "--leading-body", value: "1.6", sample: "본문 텍스트의 기본값입니다 / 눈이 편하게 읽히는 행간으로 / 긴 문장에 사용합니다" },
                { name: "--leading-relaxed", value: "1.8", sample: "긴 글 본문이나 안내 문구처럼 / 넉넉한 행간이 필요할 때 / 사용하는 값입니다" },
              ].map((lh) => (
                <div key={lh.name} className="ds-type-row">
                  <div className="ds-type-meta">
                    <code className="ds-token-name">{lh.name}</code>
                    <span className="ds-token-value">{lh.value}</span>
                  </div>
                  <p className="ds-type-sample" style={{ lineHeight: lh.value, fontSize: "var(--font-size-base)" }}>
                    {lh.sample}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* Focus */}
          <Section title="Focus">
            <p className="ds-section-desc">키보드 탐색 시 <code>:focus-visible</code>로만 포커스 링을 표시합니다. 마우스 클릭에는 나타나지 않습니다.</p>
            <h3 className="ds-subsection-title">Outline — 버튼 · 링크 (Tab으로 탐색)</h3>
            <div className="ds-button-row">
              <button className="primary-button">Primary</button>
              <button className="secondary-button">Secondary</button>
              <button className="text-button">Text</button>
              <a className="link-button" href="#focus" onClick={(e) => e.preventDefault()}>Link</a>
            </div>
            <h3 className="ds-subsection-title">Box Shadow — 입력 필드</h3>
            <div className="ds-form-row">
              <input className="ds-input ds-input--focus-demo" type="text" placeholder="클릭하거나 Tab으로 포커스" />
            </div>
            <h3 className="ds-subsection-title">Tokens</h3>
            <div className="ds-token-list">
              <TokenRow name="--shadow-focus" value="0 0 0 3px rgba(35,111,85,0.08)" />
              <TokenRow name=":focus-visible outline" value="2px solid --color-primary · offset 2px" />
              <TokenRow name=".focus-ring" value="border-color + --shadow-focus (input 스타일 포커스)" />
            </div>
          </Section>

          {/* Motion */}
          <Section title="Motion">
            <p className="ds-section-desc"><code>prefers-reduced-motion: reduce</code> 환경에서 모든 애니메이션과 트랜지션이 자동 비활성화됩니다.</p>
            <h3 className="ds-subsection-title">Keyframes</h3>
            <div className="ds-token-list">
              <TokenRow name="fade-in" value="opacity 0 → 1" />
              <TokenRow name="slide-up" value="opacity+translateY(8px) → 1+0" />
              <TokenRow name="skeleton-pulse" value="opacity 1 → 0.4 → 1 · 1.6s · infinite" />
            </div>
            <h3 className="ds-subsection-title">Skeleton</h3>
            <div className="ds-skeleton-demo">
              <div className="ds-skeleton-card">
                <div className="skeleton ds-sk-img" />
                <div className="ds-sk-body">
                  <div className="skeleton ds-sk-title" />
                  <div className="skeleton ds-sk-text" />
                  <div className="skeleton ds-sk-text ds-sk-short" />
                </div>
              </div>
            </div>
            <h3 className="ds-subsection-title">Utility class</h3>
            <div className="ds-token-list">
              <TokenRow name=".skeleton" value="background: --color-line · skeleton-pulse 1.6s infinite" />
            </div>
          </Section>

          {/* Buttons */}
          <Section title="Buttons">
            <h3 className="ds-subsection-title">Variants</h3>
            <div className="ds-button-row">
              <button className="primary-button">Primary</button>
              <button className="secondary-button">Secondary</button>
              <button className="text-button">Text</button>
              <button className="link-button">Link</button>
              <button className="ghost-button" style={{ background: "var(--color-primary)", borderColor: "transparent" }}>Ghost</button>
            </div>

            <h3 className="ds-subsection-title">States</h3>
            <div className="ds-button-row">
              <button className="primary-button">Default</button>
              <button className="primary-button" style={{ background: "var(--color-primary-900)", borderColor: "var(--color-primary-900)" }}>Hover</button>
              <button className="primary-button" disabled>Disabled</button>
            </div>

            <h3 className="ds-subsection-title">Full Width</h3>
            <div className="ds-button-full-wrap">
              <button className="primary-button full">전체 너비 버튼</button>
            </div>
          </Section>

          {/* Badges */}
          <Section title="Badges">
            <div className="ds-badge-row">
              {badgeTones.map((b) => (
                <span key={b.tone} className="last-seat-badge" data-tone={b.tone}>
                  {b.label}
                </span>
              ))}
            </div>
          </Section>

          {/* Toast */}
          <Section title="Toast">
            <p className="ds-section-desc">화면 우하단에 고정 표시됩니다. <code>addToast(message, tone)</code>를 호출해 전역으로 사용합니다.</p>
            <div className="ds-toast-preview">
              <div className="toast" data-tone="info"><span>일반 알림 메시지입니다</span></div>
              <div className="toast" data-tone="success"><span>저장이 완료되었습니다</span></div>
              <div className="toast" data-tone="error"><span>오류가 발생했습니다. 다시 시도해 주세요.</span></div>
            </div>
            <div className="ds-token-list">
              <TokenRow name="addToast(message, tone?, duration?)" value="import { addToast } from '@/lib/toast'" />
              <TokenRow name="tone" value='"info" | "success" | "error"' />
              <TokenRow name="duration" value="기본값 4000ms" />
              <TokenRow name="<Toaster />" value="app/(site)/layout.tsx 에 등록됨" />
            </div>
          </Section>

          {/* Empty State */}
          <Section title="Empty State">
            <p className="ds-section-desc">검색 결과 없음, 리스트 비어있음 등 데이터가 없을 때 사용합니다.</p>
            <div className="ds-empty-demo">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </div>
                <strong className="empty-state-title">검색 결과가 없습니다</strong>
                <p className="empty-state-desc">다른 키워드로 다시 검색하거나 필터를 초기화해 보세요.</p>
                <div className="empty-state-action">
                  <button className="secondary-button">필터 초기화</button>
                </div>
              </div>
            </div>
            <div className="ds-token-list">
              <TokenRow name=".empty-state" value="grid · place-items-center · padding 64px 32px" />
              <TokenRow name=".empty-state-icon" value="color-muted · opacity 0.45" />
              <TokenRow name=".empty-state-title" value="font-size-lg · semibold" />
              <TokenRow name=".empty-state-desc" value="max-width 320px · color-muted · leading-body" />
            </div>
          </Section>

          {/* Avatar */}
          <Section title="Avatar">
            <p className="ds-section-desc">이미지가 있으면 img, 없으면 이니셜 placeholder를 렌더링합니다.</p>
            <h3 className="ds-subsection-title">Sizes</h3>
            <div className="ds-avatar-row">
              <div className="ds-avatar-item">
                <span className="avatar avatar-placeholder avatar-sm">김</span>
                <code className="ds-token-name">sm · 32px</code>
              </div>
              <div className="ds-avatar-item">
                <span className="avatar avatar-placeholder avatar-md">이</span>
                <code className="ds-token-name">md · 40px</code>
              </div>
              <div className="ds-avatar-item">
                <span className="avatar avatar-placeholder avatar-lg">박</span>
                <code className="ds-token-name">lg · 56px</code>
              </div>
              <div className="ds-avatar-item">
                <span className="avatar avatar-placeholder avatar-xl">최</span>
                <code className="ds-token-name">xl · 72px</code>
              </div>
            </div>
            <h3 className="ds-subsection-title">With image</h3>
            <div className="ds-avatar-row">
              <div className="ds-avatar-item">
                <div className="avatar avatar-md" style={{ background: "linear-gradient(135deg, var(--color-primary-300), var(--color-primary-500))" }} />
                <code className="ds-token-name">md</code>
              </div>
              <div className="ds-avatar-item">
                <div className="avatar avatar-lg" style={{ background: "linear-gradient(135deg, var(--color-coral), #f5a887)" }} />
                <code className="ds-token-name">lg</code>
              </div>
            </div>
          </Section>

          {/* Divider */}
          <Section title="Divider">
            <h3 className="ds-subsection-title">Default</h3>
            <hr className="divider" />
            <h3 className="ds-subsection-title">With label</h3>
            <div className="divider--label">또는</div>
            <div className="divider--label">소셜 로그인으로 계속하기</div>
            <div className="ds-token-list">
              <TokenRow name=".divider" value="height 1px · background --color-line" />
              <TokenRow name=".divider--label" value="flex · ::before/after lines · color-muted" />
            </div>
          </Section>

          {/* Tooltip */}
          <Section title="Tooltip">
            <p className="ds-section-desc"><code>data-tooltip="..."</code> 속성만 추가하면 호버·포커스 시 말풍선이 표시됩니다. React 컴포넌트 불필요.</p>
            <h3 className="ds-subsection-title">Default (위쪽)</h3>
            <div className="ds-button-row">
              <button className="primary-button" data-tooltip="저장됨">저장하기</button>
              <button className="secondary-button" data-tooltip="변경사항이 취소됩니다">취소</button>
              <button className="icon-button" data-tooltip="설정 열기">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.1 4.9C17.7 3.5 15.9 2.6 14 2.2V2h-4v.2c-1.9.4-3.7 1.3-5.1 2.7L3.5 3.5l-2.8 2.8 1.4 1.4C1.4 9.1.5 10.9.2 13H0v4h.2c.3 2.1 1.2 3.9 2.5 5.3L1.3 23.7l2.8 2.8 1.4-1.4c1.4 1.3 3.2 2.2 5.1 2.5V28h4v-.2c1.9-.3 3.7-1.2 5.1-2.5l1.4 1.4 2.8-2.8-1.4-1.4c1.3-1.4 2.2-3.2 2.5-5.1H24v-4h-.2c-.3-1.9-1.2-3.7-2.5-5.1l1.4-1.4z"/></svg>
              </button>
            </div>
            <div className="ds-token-list">
              <TokenRow name="data-tooltip" value="HTML 속성 · ::after pseudo-element 렌더링" />
              <TokenRow name="trigger" value=":hover · :focus-visible" />
              <TokenRow name="position" value="bottom: 100% + 8px · left: 50% (중앙 정렬)" />
              <TokenRow name="z-index" value="var(--z-tooltip) = 80" />
            </div>
          </Section>

          {/* Form Controls */}
          <Section title="Form Controls">
            <h3 className="ds-subsection-title">Select</h3>
            <div className="ds-form-row">
              <label className="select-control">
                <span className="sr-only">정렬</span>
                <select defaultValue="recommended">
                  <option value="recommended">추천순</option>
                  <option value="popular">예약 많은순</option>
                  <option value="price-low">낮은 가격순</option>
                </select>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
              </label>
            </div>

            <h3 className="ds-subsection-title">Text Input</h3>
            <div className="ds-form-row">
              <input className="ds-input" type="text" placeholder="입력하세요" />
            </div>
          </Section>

          {/* Filter Chip */}
          <Section title="Filter Chip">
            <h3 className="ds-subsection-title">Default · Active</h3>
            <div className="filter-chip-row">
              <button className="filter-chip">전체 지역</button>
              <button className="filter-chip" data-active="true">제주시</button>
              <button className="filter-chip">서귀포</button>
              <button className="filter-chip" data-active="true">쿠킹·베이킹</button>
              <button className="filter-chip">웰니스</button>
              <button className="filter-chip">아이와함께</button>
            </div>
          </Section>

          {/* Segmented Control */}
          <Section title="Segmented Control">
            <h3 className="ds-subsection-title">Label variant (input)</h3>
            <div className="ds-narrow">
              <div className="segmented">
                <label>
                  <input type="radio" name="ds-seg-1" defaultChecked />
                  즉시예약
                </label>
                <label>
                  <input type="radio" name="ds-seg-1" />
                  승인예약
                </label>
              </div>
            </div>
            <h3 className="ds-subsection-title">Button variant</h3>
            <div className="ds-narrow">
              <div className="segmented">
                <button data-active="true">개인</button>
                <button>기업·기관</button>
              </div>
            </div>
          </Section>

          {/* Tabs */}
          <Section title="Tabs">
            <div className="tabs">
              <button className="tab" data-active="true">전체</button>
              <button className="tab">로컬체험</button>
              <button className="tab">이벤트</button>
              <button className="tab">큐레이션</button>
            </div>
          </Section>

          {/* Form Message */}
          <Section title="Form Message">
            <div className="ds-form-message-list">
              <p className="form-message" data-tone="success">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
                저장되었습니다
              </p>
              <p className="form-message" data-tone="error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                이메일 형식이 올바르지 않습니다
              </p>
            </div>
          </Section>

          {/* Schedule Option */}
          <Section title="Schedule Option">
            <div className="ds-narrow">
              <div className="ds-schedule-list">
                <button className="schedule-option" data-active="true">
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <b>5월 24일 (토) 오전 10:00</b>
                    <span className="schedule-seat-status">잔여 3</span>
                  </span>
                  <span className="stock-line"><i style={{ width: "60%" }} /></span>
                  <small>성인 1인 · 65,000원</small>
                </button>
                <button className="schedule-option">
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <b>5월 25일 (일) 오후 2:00</b>
                    <span className="schedule-seat-status">잔여 1</span>
                  </span>
                  <span className="stock-line"><i style={{ width: "10%" }} /></span>
                  <small>성인 1인 · 65,000원</small>
                </button>
                <button className="schedule-option" disabled>
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <b>5월 31일 (토) 오전 10:00</b>
                    <span className="schedule-seat-status">마감</span>
                  </span>
                  <span className="stock-line"><i style={{ width: "100%" }} /></span>
                  <small>예약 마감</small>
                </button>
              </div>
            </div>
          </Section>

          {/* Cards */}
          <Section title="Card">
            <div className="ds-card-demo">
              <div className="ds-demo-card">
                <div className="ds-demo-card-img" />
                <div className="ds-demo-card-body">
                  <small>JEJU · 로컬체험</small>
                  <strong>제주 전통 막걸리 양조 체험</strong>
                  <p>현지 장인과 함께 제주 청정 재료로 막걸리를 빚어보세요.</p>
                </div>
              </div>
            </div>
          </Section>

          {/* Layout */}
          <Section title="Layout">
            <div className="ds-token-list">
              <TokenRow name="--container" value="1180px" />
              <TokenRow name="--header-height" value="72px" />
              <TokenRow name="--field-height" value="46px (desktop) / 44px (mobile)" />
              <TokenRow name="--button-height-sm" value="36px" />
              <TokenRow name="--button-height-md" value="44px" />
              <TokenRow name="--button-height-lg" value="50px" />
              <TokenRow name="--icon-button-size" value="44px" />
              <TokenRow name="--radius-card" value="8px" />
              <TokenRow name="--radius-control" value="8px" />
            </div>
          </Section>

          </div>
        </div>
      </div>
    </div>
  );
}
