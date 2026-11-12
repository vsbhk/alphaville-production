import { NextResponse } from "next/server";
import { auth } from "./auth";
import { getProjectAccess } from "./lib/project-access";

export const proxy = auth((request) => {
  const user = request.auth?.user;
  const pathname = request.nextUrl.pathname;
  if (!user) {
    const signInUrl = new URL("/", request.url);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const access = getProjectAccess(user.email);
  if (!access) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
});

export const config = { matcher: ["/p/:path*"] };
