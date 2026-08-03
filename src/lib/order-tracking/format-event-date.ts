/** API dates arrive as MM/DD/YYYY HH:mm — display DD/MM/YYYY for Hebrew customers. */
export function formatEventDate(eventTime: string): string {
  const trimmed = eventTime.trim();
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const [, month, day, year] = match;
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  }
  return trimmed.split(/\s+/)[0] ?? trimmed;
}
