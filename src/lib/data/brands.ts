import clientPromise from '@/lib/mongodb';

export interface ListBrandsParams {
  page: number;
  pageSize: number;
  search?: string;
  sort?: 'az' | 'za' | 'perfumes' | 'new';
  letter?: string; // single A-Z or 'All'
}

export async function listBrands(params: ListBrandsParams) {
  const { page, pageSize, search, sort = 'az', letter } = params;

  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || 'fragview');
  const col = db.collection('brands');

  const filter: any = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { country: { $regex: search, $options: 'i' } },
    ];
  }

  if (letter && letter !== 'All') {
    // Starts with (case-insensitive)
    filter.name = { $regex: `^${escapeRegex(letter)}`, $options: 'i' };
  }

  const sortSpec: any = {};
  switch (sort) {
    case 'az':
      sortSpec.name = 1;
      break;
    case 'za':
      sortSpec.name = -1;
      break;
    case 'perfumes':
      // If perfumes_count present sort descending; fallback then name asc
      sortSpec.perfumes_count = -1;
      sortSpec.name = 1;
      break;
    case 'new':
      // created_at or _id (ObjectId roughly chronological)
      sortSpec._id = -1;
      break;
    default:
      sortSpec.name = 1;
  }

  const skip = Math.max(0, (page - 1) * pageSize);

  const cursor = col
    .find(filter)
    .sort(sortSpec)
    .skip(skip)
    .limit(pageSize);

  const items = await cursor.toArray();
  const total = await col.countDocuments(filter);

  return { items, total };
}

export async function getBrandBySlug(slug: string) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || 'fragview');
  return db.collection('brands').findOne({ slug });
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}