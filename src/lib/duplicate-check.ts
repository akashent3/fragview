import { connectMongoDB } from './mongodb';

/**
 * Check if perfume already exists in MongoDB
 */
export async function checkPerfumeExists(name: string, brandName: string) {
  try {
    const { db } = await connectMongoDB();
    
    // Normalize strings for comparison (lowercase, trim)
    const normalizedName = name.toLowerCase().trim();
    const normalizedBrand = brandName.toLowerCase().trim();

    // Search with exact match (case-insensitive)
    const existing = await db. collection('perfumes').findOne({
      $and: [
        { 
          name: { 
            $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, 'i')
          } 
        },
        { 
          brand_name: { 
            $regex: new RegExp(`^${escapeRegex(normalizedBrand)}$`, 'i')
          } 
        }
      ]
    });

    if (existing) {
      return {
        exists: true,
        perfume: {
          _id: existing._id. toString(),
          name: existing. name,
          brand_name: existing.brand_name,
          image: existing.image,
        },
      };
    }

    // Also check for similar names (fuzzy match)
    const similar = await db.collection('perfumes').find({
      $and: [
        { 
          name: { 
            $regex: new RegExp(normalizedName. split(' ').map(escapeRegex).join('.*'), 'i')
          } 
        },
        { 
          brand_name: { 
            $regex: new RegExp(`^${escapeRegex(normalizedBrand)}$`, 'i')
          } 
        }
      ]
    }).limit(5). toArray();

    return {
      exists: false,
      similar: similar.map(p => ({
        _id: p._id.toString(),
        name: p.name,
        brand_name: p. brand_name,
        image: p.image,
      })),
    };
  } catch (error) {
    console.error('Error checking perfume duplicate:', error);
    return { exists: false, similar: [] };
  }
}

/**
 * Check if brand already exists in MongoDB
 */
export async function checkBrandExists(brandName: string) {
  try {
    const { db } = await connectMongoDB();
    
    const normalizedName = brandName.toLowerCase().trim();

    // Exact match
    const existing = await db.collection('brands').findOne({
      name: { 
        $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, 'i')
      }
    });

    if (existing) {
      return {
        exists: true,
        brand: {
          _id: existing._id.toString(),
          name: existing.name,
          logo: existing.logo,
          country: existing.country,
        },
      };
    }

    // Similar names
    const similar = await db.collection('brands').find({
      name: { 
        $regex: new RegExp(normalizedName. split(' ').map(escapeRegex).join('.*'), 'i')
      }
    }).limit(5).toArray();

    return {
      exists: false,
      similar: similar. map(b => ({
        _id: b._id.toString(),
        name: b.name,
        logo: b.logo,
        country: b.country,
      })),
    };
  } catch (error) {
    console. error('Error checking brand duplicate:', error);
    return { exists: false, similar: [] };
  }
}

/**
 * Helper: Escape special regex characters
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}