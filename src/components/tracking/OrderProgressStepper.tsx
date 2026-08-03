import { formatEventDate } from "@/lib/order-tracking/format-event-date";
import type { OrderTrackingEvent } from "@/types/order-tracking";

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="track-step__check">
      <path
        d="M3.5 8.2 6.4 11 12.5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StepNode({ event, index }: { event: OrderTrackingEvent; index: number }) {
  const completed = event.eventTime != null && event.eventTime.trim() !== "";

  return (
    <li
      className={`track-step${completed ? " track-step--done" : " track-step--pending"}`}
      data-step={index + 1}
    >
      <div className="track-step__node-wrap">
        {completed ? (
          <time className="track-step__date" dateTime={event.eventTime ?? undefined}>
            {formatEventDate(event.eventTime!)}
          </time>
        ) : (
          <span className="track-step__date track-step__date--empty" aria-hidden />
        )}
        <span className="track-step__node">
          <CheckIcon />
        </span>
        <p className="track-step__label">{event.eventDesc}</p>
      </div>
    </li>
  );
}

export function OrderProgressStepper({ events }: { events: OrderTrackingEvent[] }) {
  if (events.length === 0) return null;

  const lastCompletedIndex = events.reduce(
    (acc, event, index) =>
      event.eventTime != null && event.eventTime.trim() !== "" ? index : acc,
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
      <ol
        className="track-stepper"
        style={{ ["--track-progress" as string]: `${progressPct}%` }}
      >
        {events.map((event, index) => (
          <StepNode key={`${event.eventDesc}-${index}`} event={event} index={index} />
        ))}
      </ol>
    </section>
  );
}
