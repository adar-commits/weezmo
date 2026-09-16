/** API dates may be MM/DD/YYYY HH:mm or YYYY-MM-DD — display DD/MM/YYYY for Hebrew customers. */
export function formatEventDate(eventTime: string): string {
  const trimmed = eventTime.trim();

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  }

  return trimmed.split(/\s+/)[0] ?? trimmed;
}
