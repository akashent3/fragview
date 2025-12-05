import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

interface MiddlewareOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  rateLimit?: { interval: number; uniqueTokenPerInterval: number };
}

export function withMiddleware(
  handler: (req: NextRequest, session?: any) => Promise<NextResponse>,
  options: MiddlewareOptions = {}
) {
  return async (req: NextRequest) => {
    try {
      // ✅ Apply rate limiting if specified
      if (options.rateLimit) {
        const limiter = rateLimit(options.rateLimit);
        const rateLimitResult = await limiter(req);
        if (rateLimitResult) return rateLimitResult;
      }

      // ✅ Check authentication if required
      if (options.requireAuth || options.requireAdmin) {
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ✅ Check admin role if required
        if (options.requireAdmin && session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return handler(req, session);
      }

      return handler(req);
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}