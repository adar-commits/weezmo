import Image from "next/image";

const HOM_GROUP_LOGO = "/images/hom-group-logo.png";
const LOGO_WIDTH = 561;
const LOGO_HEIGHT = 243;

export function TrackingBrandLogo() {
  return (
    <div className="track-brand-block">
      <Image
        src={HOM_GROUP_LOGO}
        alt="HōM GROUP — השטיח האדום"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className="track-logo"
        priority
      />
    </div>
  );
}
