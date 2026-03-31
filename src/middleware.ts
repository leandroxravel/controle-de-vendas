import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Allow everyone to view the login page
      // Everything else requires auth
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sales/:path*",
    "/stores/:path*",
    "/users/:path*",
    "/reports/:path*",
  ],
};
