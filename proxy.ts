import { NextResponse } from "next/server";
import { auth } from "./auth";

export const proxy = auth((request) => {
  const user = request.auth?.user;
  const pathname = request.nextUrl.pathname;
  if (!user) {
    const signInUrl = new URL("/", request.url);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const role = user.role;
  const sponsorSlug = user.sponsorSlug;
  if (role === "sponsor-viewer") {
    const ownSponsorPath = `/p/hkdw-2027/sponsors/${sponsorSlug}`;
    if (sponsorSlug && pathname !== ownSponsorPath) {
      return NextResponse.redirect(new URL(ownSponsorPath, request.url));
    }
    if (!sponsorSlug) return NextResponse.redirect(new URL("/", request.url));
  } else if (role === "viewer" && pathname.startsWith("/p/hkdw-2027/sponsors")) {
    return NextResponse.redirect(new URL("/p/hkdw-2027", request.url));
  } else if (!["admin", "editor", "viewer"].includes(role ?? "")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
});

export const config = { matcher: ["/p/:path*"] };
