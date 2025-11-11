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
};

export async function getPerfumeBySlug(slug: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection<PerfumeDoc>(PERFUMES_COLLECTION).findOne({ slug });
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

  const query: any = {};
  if (search) {
    query.variant_name = { $regex: `^${escapeRegex(search)}`, $options: 'i' };
  }
  if (brand) {
    query.brand_name = { $regex: `^${escapeRegex(brand)}`, $options: 'i' };
  }
  if (gender) {
    query.gender = gender;
  }

  const sortObj: any = {};
  switch (sort) {
    case 'new':
      sortObj._id = -1;
      break;
    case 'rating':
      sortObj.rating = -1;
      break;
    case 'az':
      sortObj.variant_name = 1;
      break;
    case 'za':
      sortObj.variant_name = -1;
      break;
    default:
      sortObj.variant_name = 1;
  }

  const cursor = col
    .find(query)
    .sort(sortObj)
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  const items = await cursor.toArray();
  const total = await col.countDocuments(query);
  return { items, total, page, pageSize };
}

export async function countPerfumes() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection(PERFUMES_COLLECTION).countDocuments();
}

export async function generatePerfumeSlug(doc: PerfumeDoc): Promise<string> {
  return doc.slug || perfumeSlug(doc.brand_name, doc.variant_name);
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}