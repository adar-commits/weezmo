import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: "34rem",
        margin: "2rem auto",
        padding: "0 1rem",
        lineHeight: 1.55,
      }}
    >
      <h1 style={{ fontSize: "1.35rem" }}>Weezmo</h1>
      <p>
        This site is mainly an API plus public document pages. The home page is intentionally
        minimal.
      </p>
      <p>
        <strong>Survey design (instant, no database):</strong>{" "}
        <Link href="/sample-survey">Open sample survey preview</Link> — full UI; submit completes
        locally only.
      </p>
      <p>
        <strong>Real shareable link:</strong> create a document with{" "}
        <code>POST /api/documents</code> (see README). You need <code>.env.local</code> with{" "}
        <code>DOCUMENTS_API_KEY</code> and Supabase vars, then:
      </p>
      <pre
        style={{
          background: "#f4f4f4",
          padding: "0.75rem",
          overflow: "auto",
          fontSize: "0.85rem",
        }}
      >
        {`node --env-file=.env.local scripts/create-sample-survey.mjs`}
      </pre>
      <p style={{ fontSize: "0.9rem", color: "#555" }}>
        If you use Vercel: <code>vercel link</code> then <code>vercel env pull .env.local</code> to
        fetch keys, set <code>NEXT_PUBLIC_APP_URL=http://localhost:3000</code> for local links,
        restart <code>npm run dev</code>, then run the script again.
      </p>
      <p style={{ fontSize: "0.9rem", color: "#555" }}>
        Receipts and surveys live at{" "}
        <code>
          /documents/&lt;id&gt;
        </code>{" "}
        after creation.
      </p>
    </main>
  );
}
