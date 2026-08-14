import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Coarse first line of defense for /admin: require a signed-in session
// before the page even renders. Fine-grained "is this actually an admin
// e-mail" authorization still happens server-side in app/admin/page.tsx
// and in every /api/submissions admin route — this middleware alone is
// NOT the security boundary, it just avoids flashing admin UI to
// logged-out visitors.
export default async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const session = await auth();
    if (!session?.user) {
      const signInUrl = new URL("/entrar", req.url);
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
