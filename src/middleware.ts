import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth. token;
    const pathname = req.nextUrl.pathname;

    // Admin route protection
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse. redirect(new URL('/', req.url));
      }
    }

    // Editor routes (for future The Drydown CMS)
    if (pathname. startsWith('/editor')) {
      if (token?.role !== 'ADMIN' && token?.role !== 'EDITOR') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse. next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes
        if (
          pathname === '/' ||
          pathname. startsWith('/api/auth') ||
          pathname.startsWith('/signin') ||
          pathname.startsWith('/signup') ||
          pathname.startsWith('/verify-email') ||
          pathname.startsWith('/forgot-password') ||
          pathname. startsWith('/reset-password') ||
          pathname.startsWith('/search') ||
          pathname.startsWith('/brands') ||
          pathname.startsWith('/perfumes') ||
          pathname.startsWith('/u/') ||
          pathname.startsWith('/drydown') ||
          pathname. startsWith('/_next') ||
          pathname. startsWith('/static')
        ) {
          return true;
        }

        // Protected routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api/public|_next/static|_next/image|favicon.ico|logo|public).*)',
  ],
};