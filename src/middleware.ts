import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { canAccessAdmin } from "@/lib/rbac";

const adminPaths = ["/admin"];
const publicPaths = [
  "/",
  "/login",
  "/signup",
  "/services",
  "/events-retreats",
  "/shop",
  "/cart",
  "/checkout",
];

export async function middleware(req: Request & { nextUrl: URL }) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = adminPaths.some((path) => pathname.startsWith(path));
  const isPublicRoute =
    publicPaths.some((path) => (path === "/" ? pathname === "/" : pathname.startsWith(path))) ||
    pathname.startsWith("/api/auth");
  if (isPublicRoute) return NextResponse.next();

  const token = await getToken({
    req: req as never,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.sub) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAdminRoute && !canAccessAdmin(token.role as never)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
