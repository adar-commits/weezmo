"use client";

import Image from "next/image";
import { TrackingLoadingDots } from "@/components/tracking/TrackingLoadingDots";

const HOM_GROUP_LOGO = "/images/hom-group-logo.png";
const LOGO_WIDTH = 561;
const LOGO_HEIGHT = 243;

export function TrackingLoadingSplash() {
  return (
    <div className="track-splash" role="status" aria-live="polite" aria-busy="true">
      <div className="track-splash__card">
        <div className="track-splash__logo-wrap">
          <Image
            src={HOM_GROUP_LOGO}
            alt="HōM GROUP — השטיח האדום"
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
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
