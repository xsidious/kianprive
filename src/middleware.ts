import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const authOnlyPaths = ["/athletes"];

export async function middleware(req: Request & { nextUrl: URL }) {
  const { pathname } = req.nextUrl;
  const isAuthOnlyRoute = authOnlyPaths.some((path) => pathname.startsWith(path));
  if (!isAuthOnlyRoute) return NextResponse.next();

  const token = await getToken({
    req: req as never,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.sub) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/athletes/:path*"],
};
