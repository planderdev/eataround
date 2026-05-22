import type { ReactNode } from "react";
import Link from "next/link";
import { RiCheckboxCircleLine } from "@remixicon/react";

type CompletionAction = {
  href: string;
  label: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
};

type CompletionItem = {
  label: string;
  value: string;
};

type CompletionStep = {
  title: string;
  description: string;
};

type CompletionPageProps = {
  actions: CompletionAction[];
  description: string;
  eyebrow: string;
  icon?: ReactNode;
  note?: ReactNode;
  steps?: CompletionStep[];
  summary?: CompletionItem[];
  title: string;
};

export function CompletionPage({ actions, description, eyebrow, icon, note, steps = [], summary = [], title }: CompletionPageProps) {
  return (
    <section className="page-section complete-page">
      <div className="completion-shell">
        <main className="complete-card">
          <span className="complete-icon" aria-hidden="true">
            {icon ?? <RiCheckboxCircleLine size={32} />}
          </span>
          <div className="complete-copy">
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          {summary.length ? (
            <dl className="completion-summary">
              {summary.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="complete-actions">
            {actions.map((action) => (
              <Link className={action.variant === "secondary" ? "secondary-button" : "primary-button"} href={action.href} key={action.href}>
                {action.icon}
                {action.label}
              </Link>
            ))}
          </div>
        </main>

        {steps.length || note ? (
          <aside className="completion-side-card" aria-label="다음 안내">
            {steps.length ? (
              <>
                <span className="eyebrow">Next</span>
                <h2>다음 진행 안내</h2>
                <ol className="completion-next-steps">
                  {steps.map((step, index) => (
                    <li key={step.title}>
                      <span>{index + 1}</span>
                      <div>
                        <strong>{step.title}</strong>
                        <p>{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            ) : null}
            {note ? <div className="completion-note">{note}</div> : null}
          </aside>
        ) : null}
      </div>
    </section>
  );
}
