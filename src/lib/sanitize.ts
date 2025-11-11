// Convert Mongo/BSON documents into plain serializable objects for Server → Client props.

type AnyRec = Record<string, any>;

function serializeValue(v: any): any {
  if (v == null) return v;
  const t = typeof v;
  if (t === 'string' || t === 'number' || t === 'boolean') return v;

  // Dates → ISO
  if (v instanceof Date) return v.toISOString();

  // Common BSON markers
  if (v && typeof v === 'object' && typeof v._bsontype === 'string') {
    switch (v._bsontype) {
      case 'ObjectID':
      case 'ObjectId':
        return typeof v.toHexString === 'function' ? v.toHexString() : String(v);
      case 'Decimal128':
      case 'Long':
      case 'Timestamp':
      case 'UUID':
      case 'Double':
      case 'Int32':
        return typeof v.toString === 'function' ? v.toString() : String(v);
      case 'Binary':
        // Best effort: convert to base64 string
        try {
          // Some drivers expose v.buffer or v.value()
          const buf = v.buffer ?? v.value?.();
          return buf ? Buffer.from(buf).toString('base64') : String(v);
        } catch {
          return String(v);
        }
      default:
        return typeof v.toString === 'function' ? v.toString() : String(v);
    }
  }

  // Avoid passing objects that define toJSON (Next warns); convert manually
  if (typeof v.toJSON === 'function') {
    // Try to decode without invoking toJSON to avoid Next warning
    // We’ll still traverse properties below to get primitives.
  }

  if (Array.isArray(v)) return v.map(serializeValue);

  if (t === 'object') {
    const out: AnyRec = {};
    for (const k of Object.keys(v)) {
      out[k] = serializeValue(v[k]);
    }
    return out;
  }

  return String(v);
}

export function sanitizeSingleDoc<T extends AnyRec | null>(doc: T): T {
  if (!doc) return doc;
  const out: AnyRec = serializeValue(doc);
  if ('_id' in out) out._id = serializeValue((doc as AnyRec)._id);
  return out as T;
}

export function sanitizeDocs<T extends AnyRec[]>(docs: T): T {
  return docs.map((d) => sanitizeSingleDoc(d)) as T;
}

// More specific helpers if you want to trim fields:
export function sanitizeBrandDocs(docs: AnyRec[]) {
  const items = sanitizeDocs(docs);
  return items.map((b) => {
    // Optionally collapse huge nested arrays to essentials
    if (Array.isArray(b.perfumes)) {
      b.perfumes = b.perfumes.map((p: any) => ({
        name: p?.name,
        gender: p?.gender,
        release_year: p?.release_year,
      }));
    }
    return b;
  });
}

export const sanitizePerfumeDocs = sanitizeDocs;