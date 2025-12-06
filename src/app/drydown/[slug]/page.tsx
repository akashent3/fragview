import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, ChevronLeft, Star, Leaf, Sparkles } from 'lucide-react';
import { getArticleBySlug } from '@/app/actions/drydown';
import { getArticleComments } from '@/app/actions/drydown-comments';
import ShareButtons from '@/components/drydown/ShareButtons';
import ArticleComments from '@/components/drydown/ArticleComments';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getArticleBySlug(slug);
  if (!data) return { title: 'Article Not Found • The Drydown' };
  
  return {
    title: `${data.article.title} • The Drydown`,
    description: data. article.excerpt,
    openGraph: {
      images: [data.article.coverImage || ''],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getArticleBySlug(slug);
  
  if (!data) {
    return notFound();
  }

  const { article, mentionedPerfumes } = data;

  // Fetch comments
  const comments = await getArticleComments(article.id);

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
            {article. category}
          </span>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight text-shadow-lg">
            {article. title}
          </h1>
          
          <div className="flex items-center justify-center gap-6 text-sm text-white/90 font-medium">
            <div className="flex items-center gap-2">
              {article.author.image ?  (
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
              <div className="leading-none">{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</div>
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
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            <div className="mt-12 pt-8 border-t border-green-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Tagged in <span className="font-bold text-green-700">{article.category}</span>
              </div>
              <ShareButtons title={article.title} />
            </div>

            {/* Comments Section */}
            <ArticleComments articleId={article. id} initialComments={comments} />
          </div>

          {/* Sidebar: Mentioned Perfumes & Author */}
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
                    {article.author.badges?.includes('Master') && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Master</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">
                  {article.author. bio || "A fragrance enthusiast contributing to The Drydown. "}
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
                            <span className="text-xs font-bold text-gray-700">{perfume.rating. toFixed(1)}</span>
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