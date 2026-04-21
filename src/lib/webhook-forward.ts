/**
 * Generic JSON POST helper for outbound webhooks (newsletter, survey submit, etc.).
 */
export async function postJsonWebhook(
  url: string,
  body: unknown
): Promise<{ ok: true } | { ok: false; status: number; body: string }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, status: res.status, body: text };
  }

  return { ok: true };
}
