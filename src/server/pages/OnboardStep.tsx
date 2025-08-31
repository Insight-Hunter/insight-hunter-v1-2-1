import type { FC } from "react";

export const OnboardStep: FC<{
  slug: string;
  title: string;
  bodyHtml: string;
  ctaLabel: string;
  nextSlug: string | null;
  index: number;
  total: number;
  allowSkip?: boolean;
}> = ({ slug, title, bodyHtml, ctaLabel, nextSlug, index, total, allowSkip }) => {
  const pct = Math.round(((index + 1) / total) * 100);
  return (
    <main>
      <div className="progress" aria-label={`Progress ${pct}%`}>
        <i style={{ width: `${pct}%` }} />
      </div>

      <header style={{marginBottom: 8}}>
        <h1 style={{ fontSize: 28, margin: 0 }}>{title}</h1>
        <p className="sub" style={{ margin: "6px 0 0" }}>Step {index + 1} of {total} — {slug}</p>
      </header>

      <section dangerouslySetInnerHTML={{ __html: bodyHtml }} />

      <div className="row">
        {allowSkip && nextSlug && (
          <a className="btn-outline" href={`/onboard/${nextSlug}`} data-step={slug} data-skip="1">
            Skip
          </a>
        )}
        <a
          className="cta"
          href={nextSlug ? `/onboard/${nextSlug}` : "/dashboard"}
          data-step={slug}
          data-next={nextSlug || ""}
        >
          {nextSlug ? ctaLabel : "Finish"}
        </a>
      </div>
    </main>
  );
};
