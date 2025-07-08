import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add debug logging
    console.log("Middleware called for:", req.nextUrl.pathname);
    console.log("Token exists:", !!req.nextauth.token);
    console.log("Token data:", req.nextauth.token);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log("Authorized check for:", req.nextUrl.pathname);
        console.log("Token exists:", !!token);
        console.log("Token data:", token);
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
}; 