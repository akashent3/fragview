import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // 'brands', 'notes', 'accords', 'perfumers', 'yearRange'
  const query = searchParams.get('q') || '';

  try {
    const db = await getMongoDb();
    
    switch (type) {
      case 'brands': {
        const brands = await db
          .collection('brands')
          .find(
            query ? { name: { $regex: query, $options: 'i' } } : {},
            { projection: { name: 1, perfumes: 1 } }
          )
          .limit(10)
          .toArray();
        
        return NextResponse.json(
          brands.map((b: any) => ({
            _id: b._id.toString(),
            name: b.name,
            count: b.perfumes?.length || 0,
          }))
        );
      }
      
      case 'notes': {
        // Extract all unique notes from pyramids
        const perfumes = await db
          .collection('perfumes')
          .find({}, { projection: { pyramids: 1 } })
          .toArray();
        
        const notesSet = new Set<string>();
        perfumes.forEach((p: any) => {
          if (p.pyramids) {
            (p.pyramids.top || []).forEach((n: string) => notesSet.add(n));
            (p.pyramids.middle || []).forEach((n: string) => notesSet.add(n));
            (p.pyramids.base || []).forEach((n: string) => notesSet.add(n));
          }
        });
        
        const notes = Array.from(notesSet)
          .filter(n => !query || n.toLowerCase().includes(query.toLowerCase()))
          .sort()
          .slice(0, 10);
        
        return NextResponse.json(notes.map(n => ({ name: n })));
      }
      
      case 'accords': {
        // Extract all unique accords
        const perfumes = await db
          .collection('perfumes')
          .find({}, { projection: { accords: 1 } })
          .toArray();
        
        const accordsSet = new Set<string>();
        perfumes.forEach((p: any) => {
          (p.accords || []).forEach((a: any) => {
            const name = typeof a === 'string' ? a : a.name;
            if (name) accordsSet.add(name);
          });
        });
        
        const accords = Array.from(accordsSet)
          .filter(a => !query || a.toLowerCase().includes(query.toLowerCase()))
          .sort()
          .slice(0, 10);
        
        return NextResponse.json(accords.map(a => ({ name: a })));
      }
      
      case 'perfumers': {
        // Extract all unique perfumers
        const perfumes = await db
          .collection('perfumes')
          .find({}, { projection: { perfumers: 1 } })
          .toArray();
        
        const perfumersSet = new Set<string>();
        perfumes.forEach((p: any) => {
          (p.perfumers || []).forEach((pf: string) => {
            if (pf) perfumersSet.add(pf);
          });
        });
        
        const perfumers = Array.from(perfumersSet)
          .filter(pf => !query || pf.toLowerCase().includes(query.toLowerCase()))
          .sort()
          .slice(0, 10);
        
        return NextResponse.json(perfumers.map(pf => ({ name: pf })));
      }
      
      case 'yearRange': {
        // Get min and max release_year from all perfumes
        const result = await db
          .collection('perfumes')
          .aggregate([
            {
              $group: {
                _id: null,
                minYear: { $min: '$release_year' },
                maxYear: { $max: '$release_year' }
              }
            }
          ])
          .toArray();
        
        const yearRange = result[0] || { minYear: 1900, maxYear: new Date().getFullYear() };
        
        return NextResponse.json({
          min: yearRange.minYear || 1900,
          max: yearRange.maxYear || new Date().getFullYear(),
        });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Filter options error:', error);
    return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 });
  }
}