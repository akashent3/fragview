import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fragview.com';

export const metadata: Metadata = {
  title: 'Contact FragView — Get in Touch | FragView',
  description:
    "Get in touch with the FragView team. Have questions about fragrances, want to submit a brand, or report an issue? We'd love to hear from you.",
  alternates: { canonical: `${BASE_URL}/contact` },
  openGraph: {
    title: 'Contact FragView | FragView',
    description: 'Get in touch with the FragView team — questions, brand submissions, or feedback.',
    url: `${BASE_URL}/contact`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact FragView',
    description: 'Get in touch with the FragView team.',
  },
};

// ── FAQ JSON-LD Schema ─────────────────────────────────────────────────────────
// Google shows these as expandable FAQs directly in search results (rich snippet)
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What exactly is FragView?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FragView is a place to explore perfumes at your own pace. You can browse scents, understand how they feel, and keep track of the fragrances that catch your attention—without being pushed to buy anything.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I submit a perfume or brand suggestion?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. If you think we\'re missing something, you can submit a perfume and we\'ll review it before adding it to the collection.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are the perfumes on FragView for sale?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. FragView doesn\'t sell perfumes. We help you discover and learn about them, so you can decide where and how you want to buy.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I find perfumes that suit me?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can explore by brand, notes, mood, season, or personal preference. There\'s no right path—just start with what feels familiar or interesting.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is FragView beginner-friendly?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. You don't need to know perfume terms or categories. Everything is written to be simple, human, and easy to understand—even if you're just starting out.",
      },
    },
    {
      '@type': 'Question',
      name: 'What is "My Wardrobe" on FragView?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "It's your personal space to save perfumes you like, want to try, or want to remember. Think of it as a quiet shelf for your scent ideas.",
      },
    },
    {
      '@type': 'Question',
      name: 'How often is the perfume information updated?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FragView regularly adds new perfumes and updates existing details so the catalog stays fresh, relevant, and useful.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is FragView free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. FragView is completely free. There are no hidden charges.',
      },
    },
  ],
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* FAQ Rich Snippet — Google shows these as expandable results in SERP */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
