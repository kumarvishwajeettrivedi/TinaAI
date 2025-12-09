// Clerk middleware disabled - using dummy authentication
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// const isPublicRoute = createRouteMatcher([
//   "/",
//   "/sign-in(.*)",
//   "/sign-up(.*)",
//   "/interview(.*)",
//   "/call(.*)",
//   "/api/register-call(.*)",
//   "/api/get-call(.*)",
//   "/api/generate-interview-questions(.*)",
//   "/api/create-interviewer(.*)",
//   "/api/analyze-communication(.*)",
// ]);

// const isProtectedRoute = createRouteMatcher([
//   "/dashboard(.*)",
//   "/interview(.*)",
// ]);

// export default clerkMiddleware((auth, req) => {
//   if (!isPublicRoute(req)) {
//     auth().protect();
//   }

//   if (!auth().userId && isProtectedRoute(req)) {
//     return auth().redirectToSignIn();
//   }
// });

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow all requests - authentication handled client-side
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
