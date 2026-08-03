import Image from "next/image";

const RED_CARPET_LOGO = "/images/red-carpet-logo.png";

export function TrackingBrandLogo() {
  return (
    <div className="track-brand-block">
      <Image
        src={RED_CARPET_LOGO}
        alt="השטיח האדום — כל השטיחים שבעולם"
        width={348}
        height={223}
        className="track-logo"
        priority
      />
    </div>
  );
}
