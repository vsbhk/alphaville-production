import { NextResponse } from "next/server";
import { auth } from "./auth";
import { getProjectAccess } from "./lib/project-access";

export const proxy = auth((request) => {
  const user = request.auth?.user;
  const pathname = request.nextUrl.pathname;
  if (!user) {
    const signInUrl = new URL("/", request.url);
    signInUrl.searchParams.set("next", pathname);
    const response = NextResponse.redirect(signInUrl);
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    return response;
  }

  const access = getProjectAccess(user.email);
  if (!access) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    return response;
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  return response;
});

export const config = { matcher: ["/p/:path*"] };
