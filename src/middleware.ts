// Temporarily disabled middleware to test authentication
export function middleware() {
  console.log("Middleware disabled for testing");
}

export const config = {
  matcher: ["/dashboard/:path*"],
}; 