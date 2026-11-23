/* SERVER ONLY, AND THE BUILD ENFORCES IT.
   Felix, 2026-11-23: every company page on the live site was replaced by "This page could not
   load its data" as soon as the browser ran its JavaScript. The server HTML was correct, curl
   reported 200, and the deploy was green — the only way to see it was to open a real browser.

   The cause was that CompanyDetail, a client component, imported one constant from lib/company.ts,
   which imports this file, which calls createClient at the top level and throws by design when
   the environment variable is missing. The browser does not have that variable, so the throw ran
   on every page load and the error boundary ate the page.

   The fault is not that the variable is missing from the browser. It is that a database client
   had any business being in the browser bundle at all. "server-only" makes that a BUILD failure
   naming the offending file, instead of a site that fails silently in front of a reader. The
   pure constants and shapes a client component legitimately needs live in lib/public-shapes.ts,
   which imports nothing. */
import "server-only";
import { createClient } from "@supabase/supabase-js";

// Public read-only client. The publishable key is safe in the browser:
// RLS is enabled and only allows SELECT for the public roles.
//
// THE ENVIRONMENT IS CHECKED BY NAME, and that is not defensive clutter. On 2026-09-14 every
// database-backed page on the deployed site returned a bare HTTP 500 while the static pages were
// fine, the same build served 20 out of 20 on the VPS, and the Supabase REST API answered 15 out of
// 15 from here — every reading pointed at the deployment's own configuration, and the deployment's
// environment variables are the one thing this project cannot read, because the stored Vercel
// credential is a deployment-protection bypass and not an API token.
//
// createClient throws "supabaseUrl is required" when handed undefined, which names neither the
// variable nor the place it was meant to come from. Naming it turns an afternoon of elimination
// into a sentence on the page.
function required(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `${name} is not set in this deployment. The site cannot read any published scores without it. `
        + `It is set on the VPS in ~/thermostat/.env.local; on Vercel it lives in the project's `
        + `Environment Variables and has to be present for the Production environment specifically.`,
    );
  }
  return v;
}

export const supabase = createClient(
  required("NEXT_PUBLIC_SUPABASE_URL"),
  required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
);
