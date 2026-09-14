"use client";

/**
 * The boundary of last resort — it catches what app/error.tsx cannot, which is anything thrown in
 * the root layout or while a module is being evaluated.
 *
 * Added 2026-09-14 because error.tsx was deployed and the deployed site STILL returned a bare 500
 * with no rendered page. That is itself the finding: a route-level boundary only runs once the
 * segment is rendering, so a failure that happens earlier — a module throwing as it loads — leaves
 * nothing to show. This one runs for those too, and brings its own <html> because at that point the
 * layout may never have rendered.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en">
      <body style={{ background: "#0b0d0e", color: "#e6e6e6", fontFamily: "ui-monospace, monospace", padding: "3rem 1.5rem" }}>
        <h1 style={{ fontSize: "1rem", fontWeight: 600 }}>This page could not load its data.</h1>
        <pre style={{ marginTop: "1.5rem", whiteSpace: "pre-wrap", fontSize: "0.75rem", opacity: 0.85 }}>
          {error.message || "no message"}
          {error.digest ? `\n\ndigest: ${error.digest}` : ""}
        </pre>
      </body>
    </html>
  );
}
