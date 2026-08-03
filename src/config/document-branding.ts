const SHOPIFY_FILES =
  "https://cdn.shopify.com/s/files/1/0594/9839/7887/files";
const BANNER_FILE = "banner1_jpg.jpg?v=1772750312";

/** Receipt hero — same asset as legacy receipts.carpetshop.co.il `/img/banner1.jpg`. */
export const DOCUMENT_PAGE_RUG_IMAGE_URL = "/images/banner1.jpg";

/**
 * Hero slides (survey / optional carousel). Receipt one-pager uses the static banner above.
 */
export const DOCUMENT_HERO_SLIDE_URLS: readonly [string, string, string] = [
  DOCUMENT_PAGE_RUG_IMAGE_URL,
  `${SHOPIFY_FILES}/${BANNER_FILE}&width=1400&height=735&crop=center`,
  `${SHOPIFY_FILES}/${BANNER_FILE}&width=1400&height=735&crop=entropy`,
];

/** Tall showroom shot for the survey full-page moving background (vertical emphasis). */
export const SURVEY_AMBIENT_BG_URL = `${SHOPIFY_FILES}/${BANNER_FILE}&width=1080&height=2200&crop=entropy`;