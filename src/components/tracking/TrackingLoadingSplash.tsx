"use client";

import Image from "next/image";
import { TrackingLoadingDots } from "@/components/tracking/TrackingLoadingDots";

const RED_CARPET_LOGO = "/images/red-carpet-logo.png";

export function TrackingLoadingSplash() {
  return (
    <div className="track-splash" role="status" aria-live="polite" aria-busy="true">
      <div className="track-splash__card">
        <div className="track-splash__logo-wrap">
          <Image
            src={RED_CARPET_LOGO}
            alt="השטיח האדום"
            width={348}
            height={223}
            className="track-splash__logo"
            priority
          />
        </div>
        <div className="track-splash__spinner" aria-hidden />
        <p className="track-splash__message">
          <TrackingLoadingDots />
          <span className="sr-only">טוען נתונים</span>
        </p>
      </div>
    </div>
  );
}
