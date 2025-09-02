import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

type StepId =
  | "signin"
  | "connect-data"
  | "business-setup"
  | "settings-setup"
  | "dashboard-preview"
  | "analytics-trends"
  | "profiles"
  | "reports"
  | "forecasting"
  | "alerts"
  | "assistant";

export const ONBOARDING_ORDER: StepId[] = [
  "signin",
  "connect-data",
  "business-setup",
  "settings-setup",
  "dashboard-preview",
  "analytics-trends",
  "profiles",
  "reports",
  "forecasting",
  "alerts",
  "assistant",
];

type OnboardingState = {
  currentIndex: number;
  complete: Record<StepId, boolean>;
  markComplete: (id: StepId) => void;
  next: () => void;
  prev: () => void;
  goto: (id: StepId) => void;
  stepId: StepId;
  total: number;
};

const OnboardingCtx = createContext<OnboardingState | null>(null);

const STORAGE_KEY = "ih_onboarding_v1";

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const loc = useLocation();

  const [complete, setComplete] = useState<Record<StepId, boolean>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw
        ? JSON.parse(raw)
        : ({ signin: false } as Record<StepId, boolean>);
    } catch {
      return { signin: false } as Record<StepId, boolean>;
    }
  });

  const stepId = useMemo<StepId>(() => {
    const path = loc.pathname.replace(/^\//, "");
    const match = (path || "signin") as StepId;
    return ONBOARDING_ORDER.includes(match) ? match : "signin";
  }, [loc.pathname]);

  const currentIndex = useMemo(
    () => Math.max(0, ONBOARDING_ORDER.indexOf(stepId)),
    [stepId],
  );

  const total = ONBOARDING_ORDER.length;

  function persist(next: Record<StepId, boolean>) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  const markComplete = (id: StepId) => {
    setComplete((prev) => {
      const next = { ...prev, [id]: true };
      persist(next);
      return next;
    });
  };

  const goto = (id: StepId) => nav(`/${id}`);

  const next = () => {
    const nextId = ONBOARDING_ORDER[currentIndex + 1];
    if (nextId) nav(`/${nextId}`);
  };

  const prev = () => {
    const prevId = ONBOARDING_ORDER[currentIndex - 1];
    if (prevId) nav(`/${prevId}`);
  };

  // Guard: prevent skipping ahead of first incomplete step
  useEffect(() => {
    // find first incomplete after signin is complete or not
    let firstIncomplete: StepId | null = null;
    for (const id of ONBOARDING_ORDER) {
      if (!complete[id]) {
        firstIncomplete = id;
        break;
      }
    }
    // Users can always visit current or back; block jumping ahead
    const allowedIndex = firstIncomplete
      ? ONBOARDING_ORDER.indexOf(firstIncomplete)
      : total - 1;
    if (currentIndex > allowedIndex) {
      nav(`/${firstIncomplete!}`, { replace: true });
    }
    // Special rule: require signin before any other step
    if (stepId !== "signin" && !complete["signin"]) {
      nav("/signin", { replace: true });
    }
  }, [complete, currentIndex, nav, stepId, total]);

  const value: OnboardingState = {
    currentIndex,
    complete,
    markComplete,
    next,
    prev,
    goto,
    stepId,
    total,
  };

  return (
    <OnboardingCtx.Provider value={value}>{children}</OnboardingCtx.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingCtx);
  if (!ctx)
    throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
