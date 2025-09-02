// src/pages/onboarding/_Template.tsx
import { useOnboarding } from "../../features/onboarding/OnboardingContext";

export default function TemplateScreen() {
  const { markComplete, next, prev } = useOnboarding();
  return (
    <main style={{ padding: "20px 16px", color: "#e8f1ef" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Screen Title</h1>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>Short description.</p>

      {/* Replace with real content */}

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button onClick={prev} style={btnSecondary}>
          Back
        </button>
        <button
          onClick={() => {
            markComplete("connect-data" as any);
            next();
          }}
          style={btnPrimary}
        >
          Continue
        </button>
      </div>
    </main>
  );
}
const btnPrimary: React.CSSProperties = {
  flex: 1,
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid #2b3b3a",
  background: "#0f1a1a",
  color: "#e8f1ef",
  fontWeight: 600,
};
const btnSecondary: React.CSSProperties = {
  flex: 0.7,
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid #2b3b3a",
  background: "transparent",
  color: "#e8f1ef",
  fontWeight: 600,
};
