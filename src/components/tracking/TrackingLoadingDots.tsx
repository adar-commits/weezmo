"use client";

import { useEffect, useState } from "react";

const BASE_TEXT = "טוען נתונים";
const DOT_INTERVAL_MS = 600;
const MAX_DOTS = 2;

export function TrackingLoadingDots() {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDotCount((count) => (count >= MAX_DOTS ? 0 : count + 1));
    }, DOT_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="track-splash__text" aria-hidden>
      {BASE_TEXT}
      <span className="track-splash__dots">{".".repeat(dotCount)}</span>
    </span>
  );
}
