import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getPerfumeBySlug } from '@/lib/data/perfumes';
import { streamAskFragview } from '@/lib/ai/gemini';

// Simple in-memory rate limiter keyed by userId (5 requests per hour)
const aiRateLimit = new Map<string, { count: number; resetTime: number }>();
const AI_MAX_REQUESTS = 5;
const AI_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkAiRateLimit(userId: string): boolean {
  const now = Date.now();
  const record = aiRateLimit.get(userId);

  if (!record || now > record.resetTime) {
    aiRateLimit.set(userId, { count: 1, resetTime: now + AI_WINDOW_MS });
    return true;
  }

  if (record.count >= AI_MAX_REQUESTS) return false;
  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }

    const userId = session.user.id;

    // 2. Rate limit
    if (!checkAiRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Too many AI requests. Please wait before asking again.' },
        { status: 429 },
      );
    }

    // 3. Parse and validate body
    const { reviewId, question, perfumeSlug } = await request.json();

    if (!reviewId || !question?.trim() || !perfumeSlug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const trimmedQuestion = (question as string).trim();
    if (trimmedQuestion.length > 500) {
      return NextResponse.json({ error: 'Question too long (max 500 chars)' }, { status: 400 });
    }

    // 4. Verify the review exists and belongs to the current user
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true },
    });

    if (!review || review.userId !== userId) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // 5. Prevent duplicate AI replies on the same review
    const botUserId = process.env.ASKFRAGVIEW_BOT_USER_ID;
    if (botUserId) {
      const existing = await prisma.review.findFirst({
        where: { parentId: reviewId, userId: botUserId },
        select: { id: true },
      });
      if (existing) {
        return NextResponse.json({ error: 'Already answered' }, { status: 409 });
      }
    }

    // 6. Fetch perfume context from MongoDB
    const perfume = await getPerfumeBySlug(perfumeSlug);
    if (!perfume) {
      return NextResponse.json({ error: 'Perfume not found' }, { status: 404 });
    }

    // 7. Start Gemini stream
    const geminiStream = await streamAskFragview(trimmedQuestion, perfume as any);

    let fullText = '';

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of geminiStream) {
            const text = chunk.text;
            if (text) {
              fullText += text;
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
        } catch (err) {
          controller.error(err);
          return;
        }

        controller.close();

        // Silently save the complete answer to DB as a reply after stream finishes
        if (fullText.trim() && botUserId) {
          prisma.review
            .create({
              data: {
                userId: botUserId,
                parentId: reviewId,
                perfumeId: perfumeSlug,
                rating: 0,
                text: fullText.trim(),
              },
            })
            .catch((err) =>
              console.error('[askfragview] Failed to save AI reply to DB:', err),
            );
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[askfragview] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
