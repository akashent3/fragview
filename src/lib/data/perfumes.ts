import clientPromise from '../mongodb';
import { perfumeSlug } from '../slug';

const DB_NAME = process.env.MONGO_DB_NAME || 'fragview';
const PERFUMES_COLLECTION = 'perfumes';

export type PerfumeDoc = {
  _id: any;
  brand_name: string;
  variant_name: string;
  slug?: string;
  gender?: string;
  rating?: number;
  perfume_image?: string; // legacy CDN field
  image?: string;         // new blob-based URL
  accords?: { name: string; width: number }[];
  pyramids?: { top?: string[]; middle?: string[]; base?: string[] };
  scraped_at?: string;
  date_added?: string;
  // ADD THIS to satisfy usages in /perfumes/[slug]/page.tsx and PerfumeInfo
  description?: string;
};

export async function getPerfumeBySlug(slug: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const col = db.collection<PerfumeDoc>(PERFUMES_COLLECTION);

  const bySlug = await col.findOne({ slug });
  if (bySlug) return bySlug;

  // Try case-insensitive variant_name + brand_name match if slug not found
  const [brandPart, ...variantParts] = slug.split('-');
  const variantGuess = variantParts.join(' ');
  const alt = await col.findOne({
    $or: [
      { variant_name: new RegExp(`^${escapeRegex(slug)}$`, 'i') },
      { variant_name: new RegExp(`^${escapeRegex(variantGuess)}$`, 'i') },
    ],
  });

  return alt;
}

export async function listPerfumes(opts: {
  page?: number;
  pageSize?: number;
  search?: string;
  brand?: string;
  gender?: string;
  sort?: 'new' | 'rating' | 'az' | 'za';
} = {}) {
  const {
    page = 1,
    pageSize = 25,
    search,
    brand,
    gender,
    sort = 'az',
  } = opts;

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const col = db.collection<PerfumeDoc>(PERFUMES_COLLECTION);

  const filter: any = {};
  if (search) {
    filter.$or = [
      { variant_name: { $regex: search, $options: 'i' } },
      { brand_name: { $regex: search, $options: 'i' } },
    ];
  }
  if (brand) filter.brand_name = brand;
  if (gender) filter.gender = gender;

  const sortSpec: any = {};
  switch (sort) {
    case 'rating':
      sortSpec.rating = -1;
      sortSpec.variant_name = 1;
      break;
    case 'new':
      sortSpec._id = -1;
      break;
    case 'za':
      sortSpec.variant_name = -1;
      break;
    case 'az':
    default:
      sortSpec.variant_name = 1;
  }

  const skip = Math.max(0, (page - 1) * pageSize);

  const cursor = col.find(filter).sort(sortSpec).skip(skip).limit(pageSize);
  const items = await cursor.toArray();
  const total = await col.countDocuments(filter);

  return { items, total };
}

export async function countPerfumes() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection(PERFUMES_COLLECTION).countDocuments({});
}

export async function generatePerfumeSlug(doc: PerfumeDoc): Promise<string> {
  // Minimal fix: pass required arguments; preserve existing behavior
  return doc.slug || perfumeSlug(doc.brand_name, doc.variant_name);
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}