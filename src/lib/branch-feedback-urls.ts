import { normalizeBranchId } from "@/lib/allowed-branches";

/** Google Place IDs → writereview links per physical branch. */
const BRANCH_GOOGLE_PLACE_IDS: Record<string, string> = {
  "1000": "ChIJD-4TY4SzAhURoWab1AruIns", // ראשון לציון
  "5000": "ChIJLR4Pa0RBHRURpNac98IoHPA", // נתניה
  "7000": "ChIJIbM8IDRJHRURlxkljytHZ9c", // בני ברק
  "9000": "ChIJlXtPB7OxHRURFdAfkl2vClQ", // קרית אתא
  "10000": "ChIJr8kdbuI1HRUR6n2SHCQMqMQ", // איירפורט סיטי
  "12000": "ChIJ6Xt7lYs3HRUR_N7G1sBu6Zk", // סגולה (פתח תקווה)
};

export function googleWriteReviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}

/** Resolve Google review URL from branch id when API did not send BranchFeedbackUrl. */
export function getBranchFeedbackUrl(branchId: string | undefined | null): string | undefined {
  if (branchId == null || String(branchId).trim() === "") return undefined;
  const id = normalizeBranchId(String(branchId));
  const placeId = BRANCH_GOOGLE_PLACE_IDS[id];
  return placeId ? googleWriteReviewUrl(placeId) : undefined;
}
