import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "디자인 시스템",
};

function Section({ title, children }: { title: string; children: import("react").ReactNode }) {
  return (
    <section className="ds-section">
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
  { name: "--radius-xs", px: "3px", label: "xs" },
  { name: "--radius-sm", px: "4px", label: "sm" },
  { name: "--radius-md", px: "5px", label: "md" },
  { name: "--radius-lg", px: "7px", label: "lg" },
  { name: "--radius-xl", px: "10px", label: "xl" },
  { name: "--radius-2xl", px: "12px", label: "2xl" },
  { name: "--radius-3xl", px: "16px", label: "3xl" },
  { name: "--radius-4xl", px: "18px", label: "4xl" },
  { name: "--radius-5xl", px: "20px", label: "5xl" },
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
              <div className="ds-shadow-item">
                <div className="ds-shadow-box" style={{ boxShadow: "0 18px 44px rgba(35, 60, 48, 0.12)" }} />
                <code className="ds-token-name">--shadow-soft</code>
                <span className="ds-token-value">0 18px 44px rgba(35,60,48,0.12)</span>
              </div>
              <div className="ds-shadow-item">
                <div className="ds-shadow-box" style={{ boxShadow: "0 10px 28px rgba(36, 54, 45, 0.06)" }} />
                <code className="ds-token-name">Card shadow</code>
                <span className="ds-token-value">0 10px 28px rgba(36,54,45,0.06)</span>
              </div>
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
  );
}
