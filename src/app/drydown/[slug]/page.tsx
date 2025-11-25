import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, ChevronLeft, Star, Share2, Leaf, Sparkles } from 'lucide-react';
import { getArticleBySlug } from '@/app/actions/drydown';
import ShareButtons from '@/components/drydown/ShareButtons';

// --- DUMMY DATA FOR PREVIEW ---
const DUMMY_ARTICLE = {
  id: 'preview-id',
  title: 'The Art of Olfactory Storytelling: A Deep Dive into Niche Perfumery',
  excerpt: 'Explore how modern perfumers are breaking the rules of traditional scent composition to create narrative-driven fragrances that evoke powerful memories.',
  content: `
    <p>Perfume is more than just a pleasant scent; it is a form of liquid literature. In recent years, the rise of niche perfumery has shifted the focus from mass-market appeal to artistic expression.</p>
    <h2>The Shift to Narrative</h2>
    <p>Unlike traditional designer fragrances that often aim for broad appeal, niche houses are telling specific, sometimes challenging stories. Think of <em>Imaginary Authors</em> or <em>Zoologist</em>, brands that build entire worlds around their scents.</p>
    <blockquote>"A great perfume must have a beginning, a middle, and an end. It should take you on a journey." - Jean-Claude Ellena</blockquote>
    <p>This approach allows for the use of unconventional materials—burning asphalt, old books, or sea salt—to evoke specific times and places.</p>
    <h2>Key Ingredients</h2>
    <p>We are seeing a resurgence of raw, animalic notes balanced with hyper-realistic gourmands. The modern nose is sophisticated and craves authenticity over polish.</p>
  `,
  coverImage: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=1200&auto=format&fit=crop',
  category: 'Deep Dive',
  readTime: '6 min',
  publishedAt: new Date().toISOString(),
  author: {
    name: 'Elena Vosnaki',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    bio: 'Senior Editor and Fragrance Historian exploring the cultural impact of scent.',
    badges: ['Master', 'Editor']
  }
};

const DUMMY_PERFUMES = [
  {
    slug: 'baccarat-rouge-540',
    variant_name: 'Baccarat Rouge 540',
    brand_name: 'Maison Francis Kurkdjian',
    image: 'https://fimgs.net/mdimg/perfume/375x500.33519.jpg',
    rating: 4.2,
    gender: 'Unisex'
  },
  {
    slug: 'aventus',
    variant_name: 'Aventus',
    brand_name: 'Creed',
    image: 'https://fimgs.net/mdimg/perfume/375x500.9828.jpg',
    rating: 4.5,
    gender: 'Male'
  }
];

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getArticleBySlug(params.slug);
  // Fallback metadata for preview
  if (!data) return { title: 'Preview Article • The Drydown' };
  return {
    title: `${data.article.title} • The Drydown`,
    description: data.article.excerpt,
    openGraph: {
      images: [data.article.coverImage || ''],
    }
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const data = await getArticleBySlug(params.slug);
  
  // USE DUMMY DATA IF NOT FOUND (FOR DESIGN PREVIEW)
  const article = data?.article || DUMMY_ARTICLE;
  const mentionedPerfumes = data?.mentionedPerfumes || DUMMY_PERFUMES;

  // If you want strictly 404 in production, uncomment this:
  // if (!data) return notFound();

  return (
    <div className="min-h-screen bg-[#FAFFF5] pb-20">
      {/* Hero Header */}
      <div className="relative h-[60vh] min-h-[400px] w-full">
        <div className="absolute inset-0">
          {article.coverImage && (
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAFFF5] via-black/40 to-black/30" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 h-full flex flex-col justify-end pb-12 text-center text-white">
          <Link href="/drydown" className="inline-flex items-center text-white/80 hover:text-white mb-6 mx-auto transition-colors">
            <ChevronLeft size={16} className="mr-1" /> Back to The Drydown
          </Link>
          
          <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold uppercase tracking-widest rounded-md mb-4 mx-auto">
            {article.category}
          </span>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight text-shadow-lg">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-center gap-6 text-sm text-white/90 font-medium">
            <div className="flex items-center gap-2">
              {article.author.image ? (
                <img src={article.author.image} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center border-2 border-white">
                  {article.author.name.charAt(0)}
                </div>
              )}
              <div className="text-left">
                <div className="leading-none">{article.author.name}</div>
                <div className="text-[10px] opacity-70 uppercase tracking-wide">Author</div>
              </div>
            </div>
            <div className="h-8 w-px bg-white/30" />
            <div className="text-left">
              <div className="leading-none">{new Date(article.publishedAt || new Date().toISOString()).toLocaleDateString()}</div>
              <div className="text-[10px] opacity-70 uppercase tracking-wide">Published</div>
            </div>
            <div className="h-8 w-px bg-white/30" />
            <div className="flex items-center gap-2">
              <Clock size={18} />
              {article.readTime} read
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="prose prose-lg prose-green max-w-none font-serif leading-loose text-gray-700">
              <p className="lead text-2xl text-gray-500 italic mb-8 border-l-4 border-orange-400 pl-4">
                {article.excerpt}
              </p>
              {/* Dangerous HTML rendering since content is from Trusted Editors */}
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            <div className="mt-12 pt-8 border-t border-green-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Tagged in <span className="font-bold text-green-700">{article.category}</span>
              </div>
              <ShareButtons title={article.title} />
            </div>
          </div>

          {/* Sidebar: Mentioned Perfumes */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              
              {/* Author Box */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">About the Author</h3>
                <div className="flex items-center gap-4 mb-3">
                  {article.author.image ? (
                    <img src={article.author.image} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold">
                      {article.author.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-gray-900">{article.author.name}</div>
                    {article.author.badges && article.author.badges.includes('Master') && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Master</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">
                  {article.author.bio || "A fragrance enthusiast contributing to The Drydown."}
                </p>
              </div>

              {/* Mentioned Fragrances */}
              {mentionedPerfumes.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 opacity-10">
                    <Leaf size={100} />
                  </div>
                  <h3 className="text-sm font-bold text-green-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Sparkles size={16} /> Featured Scents
                  </h3>
                  
                  <div className="space-y-4 relative z-10">
                    {mentionedPerfumes.map((perfume: any) => (
                      <Link key={perfume.slug} href={`/perfumes/${perfume.slug}`} className="flex gap-3 items-center group bg-white p-2 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 shrink-0 bg-white rounded-lg p-1 border border-gray-100">
                          {perfume.image ? (
                            <img src={perfume.image} alt={perfume.variant_name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded">
                              <Leaf size={12} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                            {perfume.variant_name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{perfume.brand_name}</div>
                        </div>
                        {perfume.rating > 0 && (
                          <div className="flex flex-col items-center px-2 border-l border-gray-100">
                            <Star size={12} className="fill-orange-400 text-orange-400 mb-0.5" />
                            <span className="text-xs font-bold text-gray-700">{perfume.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}