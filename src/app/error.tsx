"use client";

/**
 * What actually went wrong, instead of a digest.
 *
 * WHY THIS EXISTS. On 2026-09-14 the ThermoStat site was returning HTTP 500 on every page that
 * reads the database — /scores and the home page — while /about and /methodology were untouched.
 * The same build running on the VPS against the same database served 20 requests out of 20, and the
 * Supabase REST API answered 15 out of 15 from here, so the fault was somewhere in the deployment
 * and nowhere in the code or the data. Next.js replaces a production error message with a digest
 * ("3782437766@E394") and puts the real one in the function logs, which need a Vercel API token
 * this project does not have — so the one fact that would end the guessing was the one fact nobody
 * could reach.
 *
 * The ops app hit the identical wall on 2026-09-11 and solved it the same way. A boundary that
 * shows the message turns a silent 500 into a diagnosis, and it costs nothing when there is no
 * error. The site is pre-launch; when it is public this should show a neutral page and send the
 * message somewhere only we can read.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-lg font-semibold">This page could not load its data.</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        The site is up; the part of it that reads published scores is not answering.
      </p>
      <pre className="mt-6 overflow-x-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-4 text-xs">
        {error.message || "no message"}
        {error.digest ? `\n\ndigest: ${error.digest}` : ""}
      </pre>
      <button onClick={reset} className="mt-6 rounded-lg border border-border px-4 py-2 text-sm">
        Try again
      </button>
    </main>
  );
}
