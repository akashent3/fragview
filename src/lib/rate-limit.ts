import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // milliseconds
  uniqueTokenPerInterval: number; // max requests
}

// In-memory store (use Redis in production for multi-server setup)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig = { interval: 60000, uniqueTokenPerInterval: 10 }) {
  return async function middleware(req: NextRequest): Promise<NextResponse | null> {
    const ip = req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
    const token = `${ip}:${req.nextUrl.pathname}`;
    
    const now = Date.now();
    const record = rateLimitMap.get(token);
    
    // ✅ Cleanup old entries on each request
    cleanupOldEntries();
    
    if (! record || now > record.resetTime) {
      // New window
      rateLimitMap.set(token, {
        count: 1,
        resetTime: now + config.interval,
      });
      return null; // Allow request
    }
    
    if (record.count >= config.uniqueTokenPerInterval) {
      // Rate limit exceeded
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)),
          }
        }
      );
    }
    
    // Increment count
    record.count++;
    rateLimitMap.set(token, record);
    
    return null; // Allow request
  };
}

// ✅ Cleanup function - Fixed iteration
function cleanupOldEntries() {
  const now = Date.now();
  
  // Only cleanup if map is getting large (performance optimization)
  if (rateLimitMap.size > 1000) {
    const keysToDelete: string[] = [];
    
    // Collect keys to delete
    rateLimitMap.forEach((value, key) => {
      if (now > value.resetTime) {
        keysToDelete.push(key);
      }
    });
    
    // Delete collected keys
    keysToDelete.forEach(key => rateLimitMap.delete(key));
  }
}