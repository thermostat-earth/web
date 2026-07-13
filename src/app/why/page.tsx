import { redirect } from "next/navigation";

// The old "Why?" page is now consolidated into /about.
export default function WhyPage() {
  redirect("/about");
}
