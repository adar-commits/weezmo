"use client";

import { useEffect, useState } from "react";
import { DOCUMENT_HERO_SLIDE_URLS } from "@/config/document-branding";

const INTERVAL_MS = 1500;

export function DocumentHeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % DOCUMENT_HERO_SLIDE_URLS.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="doc-hero-carousel"
      aria-roledescription="carousel"
      aria-label="תמונות מסך"
    >
      {DOCUMENT_HERO_SLIDE_URLS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          width={1600}
          height={840}
          decoding="async"
          fetchPriority={i === 0 ? "high" : "low"}
          className={`doc-hero-slide ${i === index ? "doc-hero-slide--active" : ""}`}
          aria-hidden={i !== index}
        />
      ))}
    </div>
  );
}
