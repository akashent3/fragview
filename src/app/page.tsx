import React from 'react';
import Link from 'next/link';
import { Star, Sparkles } from 'lucide-react';
import AccordTags from '@/components/ui/AccordTags';
import { getMongoDb } from '@/lib/mongodb';

// Server Component - fetch data at build time
async function getHomePageData() {
  try {
    const db = await getMongoDb();
    
    // Get total counts
    const [perfumesCount, brandsCount] = await Promise.all([
      db.collection('perfumes').countDocuments(),
      db.collection('brands').countDocuments(),
    ]);

    // Get 3 RANDOM featured perfumes
    const featuredQuery = { 
      $or: [
        { featured: true },
        { rating: { $gte: 4.0 } }
      ]
    };

    const featuredPerfumes = await db
      .collection('perfumes')
      .aggregate([
        { $match: featuredQuery },
        { $sample: { size: 3 } },
      ])
      .toArray();

    // Get 4 RANDOM trending brands
    const trendingBrands = await db
      .collection('brands')
      .aggregate([
        {
          $addFields: {
            perfumes_count: { $ifNull: ['$perfumes_count', { $size: { $ifNull: ['$perfumes', []] } }] }
          }
        },
        { 
          $match: { 
            $or: [
              { trending: true },
              { perfumes_count: { $gte: 10 } }
            ]
          } 
        },
        { $sample: { size: 4 } },
      ])
      .toArray();

    return {
      perfumesCount: perfumesCount || 10000,
      brandsCount: brandsCount || 500,
      featuredPerfumes: featuredPerfumes.map((p: any) => ({
        _id: p._id.toString(),
        name: p.variant_name || p.name,
        brand: p.brand_name || p.brand,
        slug: p.slug || p._id.toString(),
        image: p.image || p.perfume_image,
        rating: p.rating || 0,
        accords: (p.accords || []).slice(0, 3).map((a: any) => ({ name: a.name || a })),
      })),
      trendingBrands: trendingBrands.map((b: any) => ({
        _id: b._id.toString(),
        name: b.name,
        slug: b.slug || b._id.toString(),
        perfumesCount: b.perfumes_count || b.perfumes?.length || 0,
      })),
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      perfumesCount: 10000,
      brandsCount: 500,
      featuredPerfumes: [],
      trendingBrands: [],
    };
  }
}

export const revalidate = 300; // 5 minutes

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 py-20 px-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-3 rounded-2xl font-bold text-3xl flex items-center shadow-xl">
              <Sparkles className="w-8 h-8 mr-3" />
              FragView
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            Discover Your
            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Perfect Scent
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto transition-colors duration-300">
            Explore thousands of fragrances, read authentic reviews, and build your personal scent wardrobe with FragView
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* CHANGED: /discover → /search */}
            <Link href="/search" className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow">
              Start Exploring
            </Link>
            <Link href="/brands" className="border-2 border-primary-500 text-primary-600 dark:text-primary-400 dark:border-primary-400 px-8 py-3 rounded-full font-semibold hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors">
              Browse Brands
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-16 md:gap-32">
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary-600 dark:text-primary-400">
                {data.perfumesCount.toLocaleString()}+
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-lg">Fragrances</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 dark:text-purple-400">
                {data.brandsCount.toLocaleString()}+
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-lg">Brands</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fragrances */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-primary-50/20 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Featured Fragrances</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
              Discover the most loved and highly rated fragrances by our community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.featuredPerfumes.length > 0 ? (
              data.featuredPerfumes.map((perfume: any) => (
                <div key={perfume._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700">
                  <div className="aspect-w-3 aspect-h-4 bg-gray-100 dark:bg-gray-700 relative h-64 overflow-hidden flex items-center justify-center">
                    {perfume.image ? (
                      <img
                        src={perfume.image}
                        alt={perfume.name}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pastel-blue to-pastel-purple opacity-20"></div>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {perfume.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">{perfume.brand}</p>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">
                          {perfume.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 min-h-[40px]">
                      {perfume.accords.length > 0 && (
                        <AccordTags accords={perfume.accords} />
                      )}
                    </div>
                    
                    <Link 
                      href={`/perfumes/${perfume.slug}`} 
                      className="block w-full bg-gradient-to-r from-primary-500 to-purple-500 text-white text-center py-2 rounded-lg font-medium hover:shadow-lg transition-shadow mt-auto"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500 dark:text-gray-400 py-12">
                No featured perfumes available at the moment
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trending Brands */}
      <section className="py-16 px-4 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Trending Brands</h2>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Explore the most popular fragrance houses</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.trendingBrands.length > 0 ? (
              data.trendingBrands.map((brand: any) => (
                <Link key={brand._id} href={`/brands/${brand.slug}`}>
                  <div className="text-center p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group border border-gray-100 dark:border-gray-700">
                    <div className="w-20 h-20 bg-gradient-to-br from-pastel-blue to-pastel-purple rounded-full mx-auto mb-4 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {brand.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {brand.perfumesCount} fragrances
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-4 text-center text-gray-500 dark:text-gray-400 py-12">
                No trending brands available at the moment
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section - CHANGED: /discover → /search */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Signature Scent?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of fragrance enthusiasts on FragView and start building your scent wardrobe today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow">
              Sign Up Free
            </button>
            {/* CHANGED: /discover → /search */}
            <Link href="/search" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors">
              Explore Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}