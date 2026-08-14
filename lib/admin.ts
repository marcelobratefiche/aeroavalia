// Admin allow-list.
//
// Only Google accounts whose e-mail address appears in ADMIN_EMAILS
// (a comma-separated env var) are allowed into /admin and the
// admin-only API routes. Nothing here is exposed to the browser —
// this file only ever runs on the server (API routes / server components).
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
