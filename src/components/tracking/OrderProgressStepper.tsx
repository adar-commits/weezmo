import type { CSSProperties } from "react";
import { formatEventDate } from "@/lib/order-tracking/format-event-date";
import type { OrderTrackingEvent } from "@/types/order-tracking";

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="track-step__check">
      <path
        d="M4.2 10.4 8.1 14.2 15.8 6.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function isCompleted(event: OrderTrackingEvent): boolean {
  return event.eventTime != null && event.eventTime.trim() !== "";
}

/** Original mockup: grey rail; red/grey nodes; date then label under circle (desktop). */
export function OrderProgressStepper({ events }: { events: OrderTrackingEvent[] }) {
  if (events.length === 0) return null;

  return (
    <section className="track-timeline" aria-label="סטטוס הזמנה">
      <div
        className="track-stepper"
        style={{ ["--track-count" as string]: events.length } as CSSProperties}
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
                <div className="track-step__inner">
                  <span className="track-step__node">
                    <CheckIcon />
                  </span>
                  {completed ? (
                    <time className="track-step__date" dateTime={event.eventTime ?? undefined}>
                      {formatEventDate(event.eventTime!)}
                    </time>
                  ) : (
                    <span className="track-step__date track-step__date--empty" aria-hidden />
                  )}
                  <p className="track-step__label">{event.eventDesc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
