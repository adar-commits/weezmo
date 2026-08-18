import { PUBLIC_PAGE_TITLES, publicPageMetadata } from "@/config/brand";

export const metadata = publicPageMetadata(PUBLIC_PAGE_TITLES.deliveryAddress);

export default function SampleDeliveryAddressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
