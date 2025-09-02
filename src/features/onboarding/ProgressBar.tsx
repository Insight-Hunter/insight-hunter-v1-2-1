import { useOnboarding, ONBOARDING_ORDER } from "./OnboardingContext";

export default function ProgressBar() {
  const { currentIndex, total } = useOnboarding();
  const pct = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div
      style={{ padding: "12px 16px" }}
      aria-label={`Onboarding progress ${pct}%`}
    >
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "rgba(255,255,255,.12)",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: 6,
            borderRadius: 999,
            background: "#1fd1b5",
            transition: "width .25s ease",
          }}
        />
      </div>
      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
        {ONBOARDING_ORDER[currentIndex].replace("-", " ")} · {pct}%
      </div>
    </div>
  );
}
