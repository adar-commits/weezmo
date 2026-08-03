"use client";

import { useCallback, useEffect, useState } from "react";
import { BRAND_LINKS } from "@/config/links";
import { OrderProgressStepper } from "@/components/tracking/OrderProgressStepper";
import { TrackingBrandLogo } from "@/components/tracking/TrackingBrandLogo";
import { TrackingLoadingSplash } from "@/components/tracking/TrackingLoadingSplash";
import type { OrderTrackingPayload } from "@/types/order-tracking";

const GENERIC_ERROR = "לא ניתן לטעון את פרטי ההזמנה. נא לנסות שוב מאוחר יותר.";
const MISSING_ORDER_MESSAGE =
  "לא נמצא מספר הזמנה בקישור. נא להשתמש בקישור שקיבלתם עם הקבלה.";

type Props = {
  orderId?: string;
  previewData?: OrderTrackingPayload;
};

export function TrackingPortalView({ orderId, previewData }: Props) {
  const [data, setData] = useState<OrderTrackingPayload | null>(previewData ?? null);
  const [loading, setLoading] = useState(Boolean(orderId && !previewData));
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/order-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: id }),
      });
      const json = (await res.json().catch(() => ({}))) as
        | OrderTrackingPayload
        | { message?: string };
      if (!res.ok) {
        setError(
          typeof (json as { message?: string }).message === "string"
            ? (json as { message?: string }).message!
            : GENERIC_ERROR
        );
        setData(null);
        return;
      }
      setData(json as OrderTrackingPayload);
    } catch {
      setError(GENERIC_ERROR);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (previewData) return;
    if (!orderId?.trim()) {
      setLoading(false);
      setError(MISSING_ORDER_MESSAGE);
      return;
    }
    void fetchOrder(orderId.trim());
  }, [orderId, previewData, fetchOrder]);

  if (loading) {
    return <TrackingLoadingSplash />;
  }

  return (
    <div className="track-content">
      <header className="track-header">
        <TrackingBrandLogo />
        <h1 className="track-title">מעקב סטטוס הזמנה</h1>
      </header>

      {error ? (
        <div className="track-state track-state--error" role="alert">
          <p>{error}</p>
        </div>
      ) : null}

      {data ? (
        <>
          <section className="track-meta" aria-label="פרטי הזמנה">
            <p className="track-meta__line track-meta__line--desktop">
              <span className="track-meta__part">
                <span className="track-meta__label">שם הלקוח:</span>{" "}
                <span className="track-meta__value">{data.customerName}</span>
              </span>
              <span className="track-meta__sep" aria-hidden>
                |
              </span>
              <span className="track-meta__part">
                <span className="track-meta__label">מס הזמנה</span>{" "}
                <span className="track-meta__value">{data.orderNumber}</span>
              </span>
              <span className="track-meta__sep" aria-hidden>
                |
              </span>
              <span className="track-meta__part">
                <span className="track-meta__label">סניף:</span>{" "}
                <span className="track-meta__value">{data.branchDesc}</span>
              </span>
            </p>

            <div className="track-meta__stack track-meta__stack--mobile">
              <p className="track-meta__row">
                <span className="track-meta__label">מס הזמנה</span>{" "}
                <span className="track-meta__value">{data.orderNumber}</span>
              </p>
              <p className="track-meta__row">
                <span className="track-meta__label">שם הלקוח:</span>{" "}
                <span className="track-meta__value">{data.customerName}</span>
                <span className="track-meta__sep" aria-hidden>
                  {" | "}
                </span>
                <span className="track-meta__label">סניף:</span>{" "}
                <span className="track-meta__value">{data.branchDesc}</span>
              </p>
            </div>

            {data.customerAddress ? (
              <p className="track-meta__detail">
                <strong className="track-meta__label">כתובת לקוח:</strong>{" "}
                {data.customerAddress}
              </p>
            ) : null}
            {data.Notes ? (
              <div className="track-notes" role="note">
                <p>{data.Notes}</p>
              </div>
            ) : null}
          </section>

          <hr className="track-divider" />

          <section className="track-products" aria-labelledby="track-products-heading">
            <h2 id="track-products-heading" className="track-section-title">
              מוצרים
            </h2>
            <ul className="track-products__list">
              {data.products.map((product, index) => (
                <li key={`${product.prdDesc}-${index}`}>
                  {product.prdDesc} (כמות: {product.Quantity})
                </li>
              ))}
            </ul>
          </section>

          <OrderProgressStepper events={data.Events} />

          <hr className="track-divider" />

          <p className="track-support">
            מצאת טעות בהזמנה?{" "}
            <a
              href={BRAND_LINKS.trackingSupportWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              לחץ כאן
            </a>
          </p>
        </>
      ) : null}
    </div>
  );
}
