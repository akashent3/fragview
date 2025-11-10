export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/profile/:path*',
    '/wardrobe/:path*',
    '/settings/:path*',
    '/admin/:path*',
  ],
};