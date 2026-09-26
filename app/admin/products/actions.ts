"use server";

import { revalidatePath } from "next/cache";

/**
 * Call this right after a product is created, updated, or deleted, so
 * the homepage (Featured Collection, and anything else reading from
 * `products`) reflects the change immediately instead of waiting for
 * the next scheduled ISR refresh (see `revalidate` in app/page.tsx).
 *
 * This file is a Server Action ("use server" at the top) — even though
 * it's imported into a "use client" page, calling it there works fine:
 * Next.js turns the call into a request that actually runs on the
 * server, where `revalidatePath` is allowed to run.
 */
export async function revalidateHomepage() {
  revalidatePath("/");
}