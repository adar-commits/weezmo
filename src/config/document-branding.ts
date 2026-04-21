const SHOPIFY_FILES =
  "https://cdn.shopify.com/s/files/1/0594/9839/7887/files";
const BANNER_FILE = "banner1_jpg.jpg?v=1772750312";

/** Legacy single hero asset (same as first carousel slide). */
export const DOCUMENT_PAGE_RUG_IMAGE_URL = `${SHOPIFY_FILES}/${BANNER_FILE}`;

/**
 * Three hero slides for the receipt one-pager (same source image, different CDN crops).
 * Replace entries with distinct files when available.
 */
export const DOCUMENT_HERO_SLIDE_URLS: readonly [string, string, string] = [
  DOCUMENT_PAGE_RUG_IMAGE_URL,
  `${SHOPIFY_FILES}/${BANNER_FILE}&width=1400&height=735&crop=center`,
  `${SHOPIFY_FILES}/${BANNER_FILE}&width=1400&height=735&crop=entropy`,
];
