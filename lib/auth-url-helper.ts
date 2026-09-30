/**
 * Returns the current browser origin so Supabase password-reset emails
 * automatically point back to the environment the user is currently using.
 *
 * Local:   http://localhost:3000
 * Preview: https://<vercel-preview>.vercel.app
 * Prod:    https://7bucksnutrition.com
 */
export function getCurrentAppOrigin(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (siteUrl) {
    return siteUrl.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}