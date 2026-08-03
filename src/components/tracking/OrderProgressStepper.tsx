import type { CSSProperties } from "react";
import { formatEventDate } from "@/lib/order-tracking/format-event-date";
import type { OrderTrackingEvent } from "@/types/order-tracking";

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="track-step__check">
      <path
        d="M4.5 10.2 8 13.7 15.5 6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
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

  const lastCompletedIndex = events.reduce(
    (acc, event, index) => (isCompleted(event) ? index : acc),
    -1
  );

  const progressPct =
    events.length <= 1
      ? lastCompletedIndex >= 0
        ? 100
        : 0
      : lastCompletedIndex >= 0
        ? (lastCompletedIndex / (events.length - 1)) * 100
        : 0;

  return (
    <section className="track-timeline" aria-label="סטטוס הזמנה">
      <div
        className="track-stepper"
        style={
          {
            ["--track-count" as string]: events.length,
            ["--track-progress" as string]: `${progressPct}%`,
          } as CSSProperties
        }
      >
        <div className="track-stepper__rail" aria-hidden>
          <div className="track-stepper__rail-fill" />
        </div>
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
                  ) : null}
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
