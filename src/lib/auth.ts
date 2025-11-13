import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          emailVerified: new Date(),
          username: profile.email?.split('@')[0] + Math.random().toString(36).slice(2, 6),
          image: profile.picture,
          role: 'USER', // ✅ FIXED - Uppercase to match Prisma enum
        } as any;
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error('Invalid credentials');
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) throw new Error('Invalid credentials');
        if (!user.emailVerified) throw new Error('Please verify your email before signing in');
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) throw new Error('Invalid credentials');
        return { id: user.id, email: user.email, username: user.username, image: user.image, role: user.role } as any;
      },
    }),
  ],

  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60, updateAge: 24 * 60 * 60 },

  pages: { signIn: '/signin', signOut: '/', error: '/signin', verifyRequest: '/verify-email', newUser: '/' },

  callbacks: {
    // 🔧 NEW: Allow linking Google to existing email accounts
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Check if user with this email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true },
        });

        if (existingUser) {
          // User exists - check if Google account is already linked
          const googleAccount = existingUser.accounts.find(
            (acc) => acc.provider === 'google'
          );

          if (!googleAccount) {
            // Link Google account to existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            });
          }
          return true; // Allow sign in
        }
      }
      return true; // Allow sign in for new users
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id;
        token.username = (user as any).username ?? token.username ?? token.email?.split('@')[0];
        token.role = (user as any).role ?? 'USER';
        token.image = (user as any).image;
      }
      if (trigger === 'update' && session) token = { ...token, ...session };
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        session.user.username = token.username as string;
        (session.user as any).role = token.role as string;
        session.user.image = token.image as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};