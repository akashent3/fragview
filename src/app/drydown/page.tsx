import React from 'react';
import Link from 'next/link';
import { Newspaper, Clock, User, ArrowRight, Sparkles, Leaf, Edit, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getArticles } from '@/app/actions/drydown';
import { auth } from '@/lib/auth';
import ApplyButton from '@/components/drydown/ApplyButton';

export const metadata = {
  title: 'The Drydown • Editorial | Fragview',
  description: 'Curated fragrance stories, reviews, and industry news from expert editors.',
  openGraph: {
    title: 'The Drydown - FragView Editorial',
    description: 'Deep dives, industry news, and curated stories from the world of fragrance.',
    type: 'website',
  },
};

export const revalidate = 60; // Refresh every minute

const categories = ['All', 'Review', 'Guide', 'News', 'Interview', 'Deep Dive', 'Industry'];

export default async function DrydownPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const session = await auth();
  const selectedCategory = searchParams.category;
  const currentPage = parseInt(searchParams.page || '1');

  // Fetch articles with pagination
  const { articles, total, totalPages } = await getArticles(
    selectedCategory && selectedCategory !== 'All' ?  selectedCategory : undefined,
    currentPage,
    9 // 9 articles per page (1 featured + 8 in grid)
  );

  const featured = articles[0];
  const recent = articles.slice(1);

  // Check if user is ADMIN or EDITOR
  const canManage = session?.user?.role === 'ADMIN' || session?. user?.role === 'EDITOR';

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FAFFF5] text-gray-800">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider mb-4">
            <Newspaper size={14} /> Editorial
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-4 tracking-tight">
            The Drydown
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light mb-6">
            Deep dives, industry news, and curated stories from the world of fragrance. 
          </p>

          {/* Admin/Editor Manage Link */}
          {canManage && (
            <Link
              href="/admin/drydown"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Manage Articles
            </Link>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
          {categories.map((cat) => {
            const params = new URLSearchParams();
            if (cat !== 'All') params.set('category', cat);
            const href = params.toString() ?  `/drydown?${params.toString()}` : '/drydown';

            return (
              <Link
                key={cat}
                href={href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  (! selectedCategory && cat === 'All') || selectedCategory === cat
                    ?  'bg-green-600 text-white shadow-lg'
                    : 'bg-white/60 backdrop-blur-md text-gray-700 hover:bg-white hover:shadow-md'
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {articles. length === 0 ?  (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <Newspaper className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Articles Yet</h2>
            <p className="text-gray-600 mb-6">
              {selectedCategory && selectedCategory !== 'All'
                ? `No articles in "${selectedCategory}" category yet. `
                : 'Our editors are working on exciting content.  Check back soon!'}
            </p>
            {canManage && (
              <Link
                href="/admin/drydown/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="w-5 h-5" />
                Write First Article
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featured && (
              <Link href={`/drydown/${featured. slug}`} className="mb-16 group block cursor-pointer">
                <div className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-xl">
                  {featured.coverImage ?  (
                    <img
                      src={featured.coverImage}
                      alt={featured.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                      <Sparkles className="w-24 h-24 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
                    <span className="px-3 py-1 bg-orange-500 text-xs font-bold uppercase tracking-widest rounded-md mb-4 inline-block">
                      {featured.category}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 font-serif leading-tight">
                      {featured.title}
                    </h2>
                    <p className="text-gray-200 text-lg mb-6 max-w-2xl line-clamp-2">
                      {featured.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        {featured.author. image ?  (
                          <img
                            src={featured.author.image}
                            className="w-8 h-8 rounded-full object-cover"
                            alt={featured.author.name}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-xs font-bold">
                            {featured.author.name.charAt(0)}
                          </div>
                        )}
                        <span>{featured.author.name}</span>
                      </div>
                      <span>•</span>
                      <span>{new Date(featured.publishedAt || featured.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {featured. readTime}
                      </span>
                      {featured.commentCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={14} /> {featured.commentCount}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Recent Articles Grid */}
            {recent.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {recent.map((article) => (
                  <Link href={`/drydown/${article.slug}`} key={article. id} className="group">
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-green-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      <div className="h-48 overflow-hidden relative">
                        {article.coverImage ? (
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-green-50 flex items-center justify-center">
                            <Sparkles className="text-green-200 w-12 h-12" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-white/90 backdrop-blur text-gray-800 text-[10px] font-bold uppercase tracking-wider rounded">
                            {article.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{article.readTime}</span>
                          {article.commentCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MessageCircle size={12} />
                                {article.commentCount}
                              </span>
                            </>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3 font-serif group-hover:text-green-700 transition-colors line-clamp-2">
                          {article.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                          {article.excerpt}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                            <User size={14} />
                            {article.author.name}
                          </div>
                          <span className="text-green-600 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Read <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-16">
                {/* Previous Button */}
                <Link
                  href={
                    currentPage > 1
                      ? `/drydown? ${new URLSearchParams({
                          .. .(selectedCategory && selectedCategory !== 'All' && { category: selectedCategory }),
                          page: (currentPage - 1). toString(),
                        }).toString()}`
                      : '#'
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage > 1
                      ? 'bg-white/60 backdrop-blur-md text-gray-700 hover:bg-white hover:shadow-md'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={(e) => currentPage <= 1 && e.preventDefault()}
                >
                  <ChevronLeft size={16} />
                  Previous
                </Link>

                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Link
                          key={page}
                          href={`/drydown?${new URLSearchParams({
                            ...(selectedCategory && selectedCategory !== 'All' && { category: selectedCategory }),
                            page: page.toString(),
                          }).toString()}`}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-all ${
                            page === currentPage
                              ? 'bg-green-600 text-white shadow-lg'
                              : 'bg-white/60 backdrop-blur-md text-gray-700 hover:bg-white hover:shadow-md'
                          }`}
                        >
                          {page}
                        </Link>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Next Button */}
                <Link
                  href={
                    currentPage < totalPages
                      ? `/drydown?${new URLSearchParams({
                          ...(selectedCategory && selectedCategory !== 'All' && { category: selectedCategory }),
                          page: (currentPage + 1).toString(),
                        }).toString()}`
                      : '#'
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage < totalPages
                      ?  'bg-white/60 backdrop-blur-md text-gray-700 hover:bg-white hover:shadow-md'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={(e) => currentPage >= totalPages && e.preventDefault()}
                >
                  Next
                  <ChevronRight size={16} />
                </Link>
              </div>
            )}

            {/* Page Info */}
            {totalPages > 1 && (
              <div className="text-center text-sm text-gray-600 mb-16">
                Showing {(currentPage - 1) * 9 + 1} - {Math.min(currentPage * 9, total)} of {total} articles
              </div>
            )}
          </>
        )}

        {/* Become Editor CTA */}
        <div className="flex justify-center w-full">
          <div className="max-w-3xl w-full">
            <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-2xl p-12 flex flex-col justify-center items-center text-center text-white relative overflow-hidden shadow-2xl transform hover:scale-[1.01] transition-transform duration-300">
              <div className="absolute inset-0 opacity-20">
                <Leaf size={200} className="-right-10 -bottom-10 absolute" />
              </div>
              <Sparkles size={48} className="mb-6 text-yellow-300 animate-pulse relative z-10" />
              <h3 className="text-3xl md:text-4xl font-bold mb-4 font-serif relative z-10">Write for Us</h3>
              <p className="text-green-100 text-lg mb-8 max-w-lg leading-relaxed relative z-10">
                Are you a Master badge holder? Share your expertise with the FragView community. 
              </p>

              <ApplyButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}