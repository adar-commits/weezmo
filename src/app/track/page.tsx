import { TrackingPageShell } from "@/components/tracking/TrackingPageShell";
import { TrackingPortalView } from "@/components/tracking/TrackingPortalView";
import "./tracking-page.css";

type Props = {
  searchParams: Promise<{ orderID?: string }>;
};

export default async function TrackPage({ searchParams }: Props) {
  const sp = await searchParams;
  const orderID = typeof sp.orderID === "string" ? sp.orderID : undefined;

  return (
    <TrackingPageShell>
      <TrackingPortalView orderId={orderID} />
    </TrackingPageShell>
  );
}
