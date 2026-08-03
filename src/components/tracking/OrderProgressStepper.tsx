import type { CSSProperties } from "react";
import { formatEventDate } from "@/lib/order-tracking/format-event-date";
import type { OrderTrackingEvent } from "@/types/order-tracking";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="track-step__check">
      <path
        d="M5 12.5 9.5 17 19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function isCompleted(event: OrderTrackingEvent): boolean {
  return event.eventTime != null && event.eventTime.trim() !== "";
}

export function OrderProgressStepper({ events }: { events: OrderTrackingEvent[] }) {
  if (events.length === 0) return null;

  return (
    <section className="track-timeline" aria-label="סטטוס הזמנה">
      <div
        className="track-stepper"
        style={{ ["--track-count" as string]: String(events.length) } as CSSProperties}
      >
        <div className="track-stepper__rail" aria-hidden />
        <ol className="track-stepper__steps">
          {events.map((event, index) => {
            const completed = isCompleted(event);
            return (
              <li
                key={`${event.eventDesc}-${index}`}
                className={`track-step${completed ? " track-step--done" : " track-step--pending"}`}
              >
                <span className="track-step__node">
                  <CheckIcon />
                </span>
                {completed ? (
                  <time className="track-step__date" dateTime={event.eventTime ?? undefined}>
                    {formatEventDate(event.eventTime!)}
                  </time>
                ) : null}
                <p className="track-step__label">{event.eventDesc}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
