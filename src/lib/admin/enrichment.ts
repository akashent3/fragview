import { connectMongoDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { logAdminAction } from './stats';

/**
 * Get items that need enrichment
 */
export async function getNeedsEnrichment() {
  try {
    const { db } = await connectMongoDB();

    const [perfumes, brands] = await Promise. all([
      db.collection('perfumes')
        .find({ needs_enrichment: true })
        .sort({ created_at: -1 })
        .limit(100)
        .toArray(),
      
      db.collection('brands')
        .find({ needs_enrichment: true })
        .sort({ created_at: -1 })
        .limit(100)
        .toArray(),
    ]);

    return {
      perfumes: perfumes.map(p => ({
        _id: p._id. toString(),
        name: p. name,
        brand: p.brand_name,
        image: p.image,
        missingFields: p.missing_fields || [],
        enrichmentStatus: p.enrichment_status || 'pending',
        addedBy: p.added_by,
        createdAt: p.created_at,
      })),
      brands: brands. map(b => ({
        _id: b._id.toString(),
        name: b.name,
        logo: b.logo,
        missingFields: b.missing_fields || [],
        enrichmentStatus: b.enrichment_status || 'pending',
        addedBy: b.added_by,
        createdAt: b.created_at,
      })),
    };
  } catch (error) {
    console.error('Error fetching enrichment data:', error);
    return { perfumes: [], brands: [] };
  }
}

/**
 * Get single perfume for enrichment
 */
export async function getPerfumeForEnrichment(perfumeId: string) {
  try {
    const { db } = await connectMongoDB();
    
    const perfume = await db.collection('perfumes').findOne({
      _id: new ObjectId(perfumeId),
    });

    if (!perfume) return null;

    return {
      _id: perfume._id. toString(),
      name: perfume.name,
      brand_name: perfume.brand_name,
      gender: perfume.gender,
      concentration: perfume.concentration,
      description: perfume. description,
      launch_year: perfume.launch_year,
      perfumer: perfume.perfumer,
      notes: perfume.notes,
      accords: perfume. accords,
      image: perfume.image,
      missing_fields: perfume.missing_fields || [],
      enrichment_status: perfume.enrichment_status || 'pending',
    };
  } catch (error) {
    console.error('Error fetching perfume:', error);
    return null;
  }
}

/**
 * Get single brand for enrichment
 */
export async function getBrandForEnrichment(brandId: string) {
  try {
    const { db } = await connectMongoDB();
    
    const brand = await db.collection('brands').findOne({
      _id: new ObjectId(brandId),
    });

    if (!brand) return null;

    return {
      _id: brand._id.toString(),
      name: brand.name,
      country: brand.country,
      description: brand.description,
      founded_year: brand.founded_year,
      website: brand.website,
      logo: brand.logo,
      missing_fields: brand.missing_fields || [],
      enrichment_status: brand.enrichment_status || 'pending',
    };
  } catch (error) {
    console.error('Error fetching brand:', error);
    return null;
  }
}

/**
 * Update perfume enrichment data
 */
export async function updatePerfumeEnrichment(
  perfumeId: string,
  data: any,
  adminId: string
) {
  try {
    const { db } = await connectMongoDB();

    // Calculate new missing fields
    const newMissingFields = calculatePerfumeMissingFields(data);
    const isComplete = newMissingFields.length === 0;

    await db.collection('perfumes').updateOne(
      { _id: new ObjectId(perfumeId) },
      {
        $set: {
          ...data,
          updated_at: new Date(),
          needs_enrichment: ! isComplete,
          enrichment_status: isComplete ? 'completed' : 'in_progress',
          missing_fields: newMissingFields,
          enriched_by_admin_id: adminId,
          enriched_at: new Date(),
        },
      }
    );

    // Log admin action
    await logAdminAction(
      adminId,
      'ENRICH_PERFUME',
      'PERFUME',
      perfumeId,
      { fieldsUpdated: Object.keys(data), isComplete }
    );

    return { success: true };
  } catch (error) {
    console.error('Error updating perfume enrichment:', error);
    return { success: false, error: 'Failed to update perfume' };
  }
}

/**
 * Update brand enrichment data
 */
export async function updateBrandEnrichment(
  brandId: string,
  data: any,
  adminId: string
) {
  try {
    const { db } = await connectMongoDB();

    // Calculate new missing fields
    const newMissingFields = calculateBrandMissingFields(data);
    const isComplete = newMissingFields.length === 0;

    await db.collection('brands').updateOne(
      { _id: new ObjectId(brandId) },
      {
        $set: {
          ...data,
          updated_at: new Date(),
          needs_enrichment: !isComplete,
          enrichment_status: isComplete ? 'completed' : 'in_progress',
          missing_fields: newMissingFields,
          enriched_by_admin_id: adminId,
          enriched_at: new Date(),
        },
      }
    );

    // Log admin action
    await logAdminAction(
      adminId,
      'ENRICH_BRAND',
      'BRAND',
      brandId,
      { fieldsUpdated: Object. keys(data), isComplete }
    );

    return { success: true };
  } catch (error) {
    console.error('Error updating brand enrichment:', error);
    return { success: false, error: 'Failed to update brand' };
  }
}

/**
 * Mark item as complete (skip enrichment)
 */
export async function markAsComplete(
  itemId: string,
  itemType: 'perfume' | 'brand',
  adminId: string
) {
  try {
    const { db } = await connectMongoDB();
    const collection = itemType === 'perfume' ? 'perfumes' : 'brands';

    await db.collection(collection).updateOne(
      { _id: new ObjectId(itemId) },
      {
        $set: {
          needs_enrichment: false,
          enrichment_status: 'completed',
          marked_complete_by_admin_id: adminId,
          marked_complete_at: new Date(),
        },
      }
    );

    // Log admin action
    await logAdminAction(
      adminId,
      'MARK_COMPLETE',
      itemType. toUpperCase(),
      itemId,
      {}
    );

    return { success: true };
  } catch (error) {
    console.error('Error marking as complete:', error);
    return { success: false, error: 'Failed to mark as complete' };
  }
}

/**
 * Helper: Calculate missing fields for perfume
 */
function calculatePerfumeMissingFields(data: any): string[] {
  const missing: string[] = [];
  
  if (!data.image) missing.push('image');
  if (!data.description || data.description === '') missing.push('description');
  if (!data. notes?.top || data.notes. top.length === 0) missing.push('top_notes');
  if (!data.notes?.middle || data.notes.middle.length === 0) missing.push('middle_notes');
  if (! data.notes?.base || data. notes.base.length === 0) missing.push('base_notes');
  if (!data.accords || data.accords.length === 0) missing.push('accords');
  if (!data.perfumer) missing.push('perfumer');
  
  return missing;
}

/**
 * Helper: Calculate missing fields for brand
 */
function calculateBrandMissingFields(data: any): string[] {
  const missing: string[] = [];
  
  if (!data.logo) missing.push('logo');
  if (!data.description || data.description === '') missing.push('description');
  if (!data.founded_year) missing.push('founded_year');
  
  return missing;
}