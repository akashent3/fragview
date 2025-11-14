import React from 'react';
import Link from 'next/link';
import { Star, Sparkles, Leaf, Flower2, Trees, Wind, Droplets } from 'lucide-react';
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
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#FAFFF5' }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient Blobs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-pulse animate-delay-2" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-200/10 rounded-full blur-3xl animate-pulse animate-delay-4" />
        
        {/* Floating Leaves Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <pattern id="leaves" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M50 30 Q 30 50 50 70 Q 70 50 50 30" fill="#D4E4BC" />
            <path d="M150 80 Q 130 100 150 120 Q 170 100 150 80" fill="#E8F3E8" />
            <circle cx="100" cy="50" r="3" fill="#F2C6A0" />
            <circle cx="30" cy="150" r="2" fill="#D4E4BC" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#leaves)" />
        </svg>

        {/* Animated Floating Icons */}
        <div className="absolute top-10 left-20 animate-float">
          <Leaf size={24} className="text-green-300/30" />
        </div>
        <div className="absolute top-40 right-32 animate-float animate-delay-2">
          <Flower2 size={20} className="text-orange-300/25" />
        </div>
        <div className="absolute bottom-32 left-40 animate-float animate-delay-3">
          <Trees size={28} className="text-green-400/20" />
        </div>
      </div>

      {/* Hero Section - Reduced padding, removed FragView button */}
      <section className="relative py-12 px-4">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div 
            className="rounded-2xl p-10 shadow-xl backdrop-blur-sm relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, rgba(232, 243, 232, 0.7) 0%, rgba(242, 198, 160, 0.7) 100%)',
              border: '1px solid rgba(255,255,255,0.5)'
            }}
          >
            {/* Decorative Elements */}
            <div className="absolute top-5 right-5 opacity-10">
              <Flower2 size={60} />
            </div>
            <div className="absolute bottom-5 left-5 opacity-10">
              <Leaf size={80} style={{ transform: 'rotate(-30deg)' }} />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative z-10">
              Discover Your
              <span className="bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
                {' '}Perfect Scent
              </span>
            </h1>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto relative z-10">
              Explore thousands of fragrances, read authentic reviews, and build your personal scent wardrobe with FragView
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
              <Link href="/search" className="glass-button-primary">
                Start Exploring
              </Link>
              <Link href="/brands" className="glass-button-secondary">
                Browse Brands
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Reduced padding */}
      <section className="py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-8 md:gap-16">
            <div className="text-center space-y-2 glass-card p-4 rounded-xl">
              <Droplets className="w-6 h-6 mx-auto mb-1 text-green-600" />
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
                {data.perfumesCount.toLocaleString()}+
              </div>
              <div className="text-gray-700 text-sm">Fragrances</div>
            </div>
            <div className="text-center space-y-2 glass-card p-4 rounded-xl">
              <Sparkles className="w-6 h-6 mx-auto mb-1 text-orange-600" />
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
                {data.brandsCount.toLocaleString()}+
              </div>
              <div className="text-gray-700 text-sm">Brands</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fragrances - Reduced padding */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Flower2 className="text-orange-400" size={24} />
              Featured Fragrances
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm">
              Discover the most loved and highly rated fragrances by our community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.featuredPerfumes.length > 0 ? (
              data.featuredPerfumes.map((perfume: any) => (
                <div key={perfume._id} className="glass-card rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden group hover:scale-[1.02]">
                  <div className="aspect-w-3 aspect-h-4 relative h-56 overflow-hidden flex items-center justify-center bg-gradient-to-br from-green-50/50 to-orange-50/50">
                    {perfume.image ? (
                      <img
                        src={perfume.image}
                        alt={perfume.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <Droplets size={48} className="text-green-300" />
                    )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        {perfume.name}
                      </h3>
                      <p className="text-gray-600 text-sm">{perfume.brand}</p>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-orange-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-700">
                          {perfume.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3 min-h-[32px]">
                      {perfume.accords.length > 0 && (
                        <AccordTags accords={perfume.accords} />
                      )}
                    </div>
                    
                    <Link 
                      href={`/perfumes/${perfume.slug}`} 
                      className="block w-full bg-gradient-to-r from-green-500 to-orange-500 text-white text-center py-2 rounded-lg font-medium hover:shadow-md transition-all mt-auto text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500 py-8">
                No featured perfumes available at the moment
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trending Brands - Reduced padding */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Trees className="text-green-600" size={24} />
              Trending Brands
            </h2>
            <p className="text-gray-600 text-sm">Explore the most popular fragrance houses</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.trendingBrands.length > 0 ? (
              data.trendingBrands.map((brand: any) => (
                <Link key={brand._id} href={`/brands/${brand.slug}`}>
                  <div className="text-center p-5 rounded-xl glass-card hover:scale-105 transition-all group">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-orange-400 rounded-full mx-auto mb-3 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <span className="text-white font-bold text-xl">{brand.name[0]}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors text-sm">
                      {brand.name}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {brand.perfumesCount} fragrances
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-4 text-center text-gray-500 py-8">
                No trending brands available at the moment
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section - UPDATED WITH BOTANICAL BACKGROUND */}
      <section className="py-12 px-4 relative z-10 bg-gradient-to-br from-green-50/50 to-orange-50/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-10 relative overflow-hidden shadow-lg border border-green-100/50">
            <div className="absolute top-0 right-0 opacity-10">
              <Wind size={120} />
            </div>
            <h2 className="text-3xl font-bold mb-4 relative z-10 text-gray-900">Ready to Find Your Signature Scent?</h2>
            <p className="text-lg mb-6 text-gray-700 relative z-10">
              Join thousands of fragrance enthusiasts on FragView and start building your scent wardrobe today
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
              <button className="px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-green-500 to-orange-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Sign Up Free
              </button>
              <Link href="/search" className="px-8 py-3 rounded-full font-semibold border-2 border-green-600/50 text-gray-800 hover:bg-green-50/50 transition-all duration-300 transform hover:scale-105">
                Explore Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}