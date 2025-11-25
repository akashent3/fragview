'use client';
import React, { useState, useTransition, useRef, useCallback } from 'react';
import { Star, Plus, LogIn, Leaf, Flower2, Droplets, Wind, Sparkles, Camera } from 'lucide-react';
import NotesPyramid from '@/components/ui/NotesPyramid';
import AccordTags from '@/components/ui/AccordTags';
import SimilarFragrances from '@/components/ui/SimilarFragrances';
import ReviewsSummary from '@/components/ui/ReviewsSummary';
import { useAuthModal } from '@/components/auth/AuthModal';
import { submitReview } from './actions';
import { debounce } from '@/lib/utils'; 

// INLINE DEBOUNCE HELPER
function debounceFunc<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface PerfumeDoc {
  _id: string;
  brand_name: string;
  variant_name: string;
  slug?: string;
  gender?: string;
  rating?: number;
  image?: string;
  accords?: { name: string; width?: number; strength?: number }[];
  pyramids?: { top?: string[]; middle?: string[]; base?: string[] };
  perfumers?: string[];
  perfume_overview?: string;
  longevity?: number;
  sillage?: number;
  reminds_me?: string[];
}

interface ReviewLite {
  rating: number;
  text?: string | null;
  createdAt: string;
}

interface Props {
  perfume: PerfumeDoc;
  rating: number;
  isSignedIn: boolean;
  canRate: boolean;
  reviews: ReviewLite[];
  reviewCount: number;
  slug: string;
}

// Accord color mapping function
const getAccordColor = (accordName: string): string => {
  const colors: { [key: string]: string } = {
    rose: '#ec4899', jasmine: '#f472b6', violet: '#a855f7', iris: '#c084fc',
    ylang: '#e879f9', tuberose: '#f0abfc', neroli: '#fbbf24', lavender: '#a78bfa',
    citrus: '#fbbf24', lemon: '#fde047', bergamot: '#fcd34d', orange: '#fb923c',
    grapefruit: '#fdba74', mandarin: '#fbbf24',
    woody: '#92400e', sandalwood: '#b45309', cedar: '#78350f', oud: '#451a03',
    patchouli: '#7c2d12', vetiver: '#65a30d',
    spicy: '#dc2626', cinnamon: '#b91c1c', pepper: '#991b1b', ginger: '#ea580c',
    cardamom: '#c2410c',
    fresh: '#10b981', 'fresh spicy': '#10b981', aquatic: '#06b6d4', marine: '#0891b2',
    mint: '#34d399', green: '#22c55e',
    vanilla: '#fef3c7', caramel: '#fcd34d', chocolate: '#78350f', coffee: '#451a03',
    honey: '#fbbf24', almond: '#fed7aa',
    musk: '#9ca3af', musky: '#9ca3af', amber: '#f59e0b', leather: '#92400e',
    animalic: '#6b7280',
    aromatic: '#8b5cf6', herbal: '#84cc16', medicinal: '#22d3ee',
    fruity: '#f472b6', apple: '#86efac', peach: '#fdba74', berry: '#f87171',
    tropical: '#fbbf24',
    powdery: '#d4d4d8', talc: '#e4e4e7',
    earthy: '#78350f', mossy: '#65a30d',
    sweet: '#fda4af',
    smoky: '#52525b', incense: '#71717a',
    'warm spicy': '#dc2626', warm: '#f59e0b',
    floral: '#ec4899',
  };

  const lowerName = accordName.toLowerCase().trim();
  if (colors[lowerName]) return colors[lowerName];
  
  for (const [key, color] of Object.entries(colors)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return color;
    }
  }
  
  const hash = accordName.charCodeAt(0) % 10;
  const defaultColors = [
    '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', 
    '#06b6d4', '#f97316', '#22c55e', '#a855f7',
    '#fb923c', '#14b8a6'
  ];
  
  return defaultColors[hash];
};

function getSillageLabel(value: number): string {
  if (value <= 1.5) return 'Intimate';
  if (value <= 3.5) return 'Moderate';
  return 'Strong';
}

// UPDATED LOGIC: Continuous linear mapping
// Slider 0-5 maps to 0-12 Hours
// Formula: Hours = Value * 2.4
// Examples: 2.5 * 2.4 = 6 Hrs (Center). 5 * 2.4 = 12 Hrs (End).
function getLongevityHrsLabel(value: number): string {
    const safeValue = Math.max(0, Math.min(5, value));
    
    if (safeValue >= 4.9) return '12+ hrs'; 
    
    const hours = safeValue * 2.4;
    
    // Use parseFloat to remove trailing decimals like 6.0 -> 6
    return `${parseFloat(hours.toFixed(1))} hrs`;
}

function getPosition(value: number): number {
  return (value / 5) * 100;
}

// --- MAIN COMPONENT ---

export default function PerfumeDetailClient({
  perfume,
  rating,
  isSignedIn,
  canRate,
  reviews,
  reviewCount,
  slug,
}: Props) {
  const { open } = useAuthModal();
  
  const [userRating, setUserRating] = useState<number>(0); 
  const [userLongevity, setUserLongevity] = useState<number>(0);
  const [userSillage, setUserSillage] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const snapshotRef = useRef<HTMLDivElement>(null);

  const transformedAccords =
    perfume.accords?.map((a) => ({
      name: a.name,
      strength:
        typeof a.strength === 'number'
          ? a.strength
          : a.width
          ? Math.round(Math.min(5, Math.max(1, (a.width / 100) * 5)))
          : 3,
      width: a.width,
    })) || [];

  const topNotes = perfume.pyramids?.top?.map((n) => ({ name: n })) || [];
  const middleNotes = perfume.pyramids?.middle?.map((n) => ({ name: n })) || [];
  const baseNotes = perfume.pyramids?.base?.map((n) => ({ name: n })) || [];

  // --- DEBOUNCED SUBMIT HANDLER ---
  const debouncedSubmit = useCallback(
    debounceFunc((field: string, value: number) => {
      const formData = new FormData();
      formData.append(field, String(value));
      submitReview(slug, formData).then((res) => {
        if (!res.ok) console.error("Auto-save failed:", res.error);
      });
    }, 500), 
    [slug]
  );

  const handleSliderChange = (field: 'longevity' | 'sillage', value: number) => {
    if (!isSignedIn) {
        open({ mode: 'signin', reason: `Sign in to rate`, callbackUrl: `/perfumes/${slug}` });
        return;
    }

    if (field === 'longevity') setUserLongevity(value);
    if (field === 'sillage') setUserSillage(value);

    debouncedSubmit(field, value);
  };

  const handleRatingChange = (value: number) => {
    if (!isSignedIn) {
        open({ mode: 'signin', reason: `Sign in to rate`, callbackUrl: `/perfumes/${slug}` });
        return;
    }
    setUserRating(value);
    const formData = new FormData();
    formData.append('rating', String(value));
    startTransition(() => {
        submitReview(slug, formData);
    });
  };

  const handleSnapshot = async () => {
  if (!snapshotRef.current) return;

  try {
    const [{ default: html2canvas }, { default: QRCode }] = await Promise.all([
      import('html2canvas'),
      import('qrcode')
    ]);

    const qrCodeDataUrl = await QRCode.toDataURL(`https://fragview.com/perfumes/${slug}`, {
      width: 100,
      margin: 1,
      color: { dark: '#10b981', light: '#ffffff' }
    });

    let imageDataUrl = '';
    if (perfume.image) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = perfume.image;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          setTimeout(reject, 5000);
        });
        imageDataUrl = perfume.image;
      } catch (err) {
        console.warn('Failed to load image');
        imageDataUrl = '';
      }
    }

    const postcard = document.createElement('div');
    postcard.style.cssText = `
      position: absolute;
      left: -9999px;
      width: 1080px;
      height: 1920px;
      padding: 50px;
      background: linear-gradient(135deg, #FAFFF5 0%, #F0FDF4 100%);
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
    `;

    postcard.innerHTML = `
  <div style="display: flex; flex-direction: column; height: 100%;">
    <!-- Header with FRAGVIEW Logo Text and QR -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
      <img src="/logo.svg" alt="FragView Logo" style="height: 180px; width: auto;" />
      <img src="${qrCodeDataUrl}" style="width: 100px; height: 100px;" alt="QR Code" />
    </div>

    <!-- Perfume Image Container -->
    <div style="background: linear-gradient(135deg, #d1fae5 0%, #fed7aa 100%); border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 30px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; min-height: 550px;">
      ${imageDataUrl 
        ? `<img src="${imageDataUrl}" style="max-width: 100%; max-height: 550px; object-fit: contain; border-radius: 16px;" crossorigin="anonymous" />`
        : `<div style="width: 100%; height: 550px; background: linear-gradient(135deg, #10b981, #f97316); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 80px;">✦</div>`
      }
    </div>

    <!-- Title Section -->
    <div style="background: linear-gradient(to right, #10b981, #f97316); border-radius: 12px; padding: 28px 40px; margin-bottom: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); text-align: center;">
      <h1 style="font-size: 58px; font-weight: 900; color: #1f2937; margin: 0 0 8px 0; line-height: 1.1; letter-spacing: 1px;">
        ${perfume.variant_name}
      </h1>
      <p style="font-size: 38px; color: #374151; font-weight: 700; margin: 0; letter-spacing: 0.5px;">
        ${perfume.brand_name}
      </p>
    </div>

    <!-- Ratings Grid -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 28px;">
      <div style="background: white; border-radius: 18px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <p style="font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 14px 0; font-weight: 700; text-align: center;">RATING</p>
        <div style="display: flex; gap: 5px; margin-bottom: 12px; justify-content: center;">
          ${[1,2,3,4,5].map(star => 
            `<span style="color: ${star <= Math.round(userRating || rating) ? '#fb923c' : '#d1d5db'}; font-size: 26px;">★</span>`
          ).join('')}
        </div>
        <p style="font-size: 36px; font-weight: 900; color: #1f2937; margin: 0; text-align: center;">
          ${(userRating || rating).toFixed(1)}
        </p>
      </div>

      <div style="background: white; border-radius: 18px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <p style="font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 14px 0; font-weight: 700; text-align: center;">SILLAGE</p>
        <div style="height: 14px; background: #e5e7eb; border-radius: 7px; overflow: hidden; margin-bottom: 12px;">
          <div style="height: 100%; width: ${getPosition(userSillage || perfume.sillage || 0)}%; background: linear-gradient(to right, #10b981, #f97316);"></div>
        </div>
        <p style="font-size: 28px; font-weight: 900; color: #1f2937; margin: 0; text-align: center;">
          ${getSillageLabel(userSillage || perfume.sillage || 0)}
        </p>
      </div>

      <div style="background: white; border-radius: 18px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <p style="font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 14px 0; font-weight: 700; text-align: center;">LONGEVITY</p>
        <div style="height: 14px; background: #e5e7eb; border-radius: 7px; overflow: hidden; margin-bottom: 12px;">
          <div style="height: 100%; width: ${getPosition(userLongevity || perfume.longevity || 0)}%; background: linear-gradient(to right, #10b981, #f97316);"></div>
        </div>
        <p style="font-size: 28px; font-weight: 900; color: #1f2937; margin: 0; text-align: center;">
          ${getLongevityHrsLabel(userLongevity || perfume.longevity || 0)}
        </p>
      </div>
    </div>

    <!-- Main Accords -->
    ${transformedAccords.length > 0 ? `
      <div style="background: white; border-radius: 18px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <p style="font-size: 17px; font-weight: 800; color: #1f2937; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">Main Accords</p>
        <div style="display: flex; gap: 4px; border-radius: 12px; overflow: hidden; height: 60px; margin-bottom: 14px;">
          ${transformedAccords.map(accord => {
            const strength = accord.strength || accord.width || 1;
            const widthPercentage = (strength / transformedAccords.reduce((sum, a) => sum + (a.strength || a.width || 1), 0)) * 100;
            return `<div style="background: ${getAccordColor(accord.name)}; width: ${widthPercentage}%; position: relative;">
              <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.2), rgba(255,255,255,0.2));"></div>
            </div>`;
          }).join('')}
        </div>
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          ${transformedAccords.map(accord => 
            `<span style="font-size: 14px; color: #6b7280; font-weight: 600;">${accord.name}</span>`
          ).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Notes Pyramid -->
    ${(topNotes.length > 0 || middleNotes.length > 0 || baseNotes.length > 0) ? `
      <div style="background: white; border-radius: 18px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <p style="font-size: 17px; font-weight: 800; color: #1f2937; margin: 0 0 18px 0; text-transform: uppercase; letter-spacing: 0.5px;">Notes Pyramid</p>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${topNotes.length > 0 ? `
            <div style="display: flex; align-items: center; gap: 18px;">
              <span style="font-size: 13px; font-weight: 800; color: #059669; width: 95px; text-align: right; flex-shrink: 0; text-transform: uppercase; letter-spacing: 0.5px;">TOP NOTES</span>
              <div style="background: linear-gradient(to right, #d1fae5, #a7f3d0); border-radius: 12px; padding: 16px 22px; flex: 1; max-width: 70%; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <span style="font-size: 16px; color: #1f2937; font-weight: 600; line-height: 1.4;">${topNotes.map(n => n.name).join(', ')}</span>
              </div>
            </div>
          ` : ''}
          ${middleNotes.length > 0 ? `
            <div style="display: flex; align-items: center; gap: 18px;">
              <span style="font-size: 13px; font-weight: 800; color: #f97316; width: 95px; text-align: right; flex-shrink: 0; text-transform: uppercase; letter-spacing: 0.5px;">HEART NOTES</span>
              <div style="background: linear-gradient(to right, #fed7aa, #fdba74); border-radius: 12px; padding: 16px 22px; flex: 1; max-width: 85%; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <span style="font-size: 16px; color: #1f2937; font-weight: 600; line-height: 1.4;">${middleNotes.map(n => n.name).join(', ')}</span>
              </div>
            </div>
          ` : ''}
          ${baseNotes.length > 0 ? `
            <div style="display: flex; align-items: center; gap: 18px;">
              <span style="font-size: 13px; font-weight: 800; color: #047857; width: 95px; text-align: right; flex-shrink: 0; text-transform: uppercase; letter-spacing: 0.5px;">BASE NOTES</span>
              <div style="background: linear-gradient(to right, #6ee7b7, #34d399); border-radius: 12px; padding: 16px 22px; flex: 1; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <span style="font-size: 16px; color: #1f2937; font-weight: 600; line-height: 1.4;">${baseNotes.map(n => n.name).join(', ')}</span>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    ` : ''}

    <!-- Footer -->
    <div style="margin-top: auto; padding-top: 24px; border-top: 4px solid #10b981; display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 17px; color: #4b5563; font-weight: 600; line-height: 1.6;">
        <div style="margin-bottom: 8px;"><span style="font-weight: 800; color: #1f2937;">Gender:</span> ${perfume.gender || '—'}</div>
        <div><span style="font-weight: 800; color: #1f2937;">Perfumer:</span> ${perfume.perfumers?.join(', ') || '—'}</div>
      </div>
      <div style="text-align: right; font-size: 15px; color: #9ca3af; font-weight: 600;">
        fragview.com/perfumes/${slug}
      </div>
    </div>
  </div>
`;

    document.body.appendChild(postcard);
    await new Promise(resolve => setTimeout(resolve, 300));

    const canvas = await html2canvas(postcard, {
      backgroundColor: '#FAFFF5',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: 1080,
      height: 1920,
    });

    document.body.removeChild(postcard);

    canvas.toBlob((blob) => {
      if (!blob) {
        alert('Failed to generate image');
        return;
      }
      
      const url = URL.createObjectURL(blob);
      
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;';
      
      const dialog = document.createElement('div');
      dialog.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:24px;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.2);z-index:9999;max-width:400px;width:90%;';
      dialog.innerHTML = `
        <h3 style="margin:0 0 16px 0;font-size:18px;font-weight:600;color:#1f2937;">Share Perfume Card</h3>
        <div style="display:flex;gap:12px;flex-direction:column;">
          <button id="share-whatsapp" style="padding:12px;border-radius:8px;border:1px solid #16a34a;background:#f0fdf4;color:#16a34a;font-weight:600;cursor:pointer;">Share on WhatsApp</button>
          <button id="share-download" style="padding:12px;border-radius:8px;border:1px solid #f97316;background:#fff7ed;color:#f97316;font-weight:600;cursor:pointer;">Download Image</button>
          <button id="share-close" style="padding:12px;border-radius:8px;border:1px solid #d1d5db;background:white;color:#6b7280;font-weight:600;cursor:pointer;">Close</button>
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.appendChild(dialog);

      const cleanup = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(dialog);
        URL.revokeObjectURL(url);
      };

      document.getElementById('share-whatsapp')!.onclick = () => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${perfume.variant_name}-fragview.jpg`;
        link.click();
        setTimeout(() => window.open(`https://wa.me/?text=Check out ${perfume.variant_name} on Fragview! https://fragview.com/perfumes/${slug}`), 500);
        cleanup();
      };

      document.getElementById('share-download')!.onclick = () => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${perfume.variant_name}-fragview.jpg`;
        link.click();
        cleanup();
      };

      document.getElementById('share-close')!.onclick = cleanup;
      overlay.onclick = cleanup;
    }, 'image/jpeg', 0.95);
  } catch (error) {
    console.error('Snapshot error:', error);
    alert(`Failed to generate snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

  async function handleSubmitReview(formData: FormData) {
    setErrorMessage(null);
    setSuccessMessage(null);
    
    if (!isSignedIn) {
        open({ mode: 'signin', reason: 'Sign in to review', callbackUrl: `/perfumes/${slug}` });
        return;
    }

    startTransition(async () => {
      // Include current slider states in the text review if set
      if (userRating > 0) formData.set('rating', String(userRating));
      if (userLongevity > 0) formData.set('longevity', String(userLongevity));
      if (userSillage > 0) formData.set('sillage', String(userSillage));
      
      const result = await submitReview(slug, formData);
      if (!result.ok) setErrorMessage(result.error || 'Failed to submit review.');
      else {
        setSuccessMessage('Review submitted successfully!');
        setReviewText('');
        // Reset local state if you want, or keep it visible
      }
    });
  }

  const reviewsSummary = {
    totalReviews: reviewCount,
    averageRating: rating,
    sentiment: 'mixed' as const,
    keyPoints: [] as string[],
    commonWords: [] as { word: string; frequency: number }[],
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    aiSummary: reviewCount > 0 ? 'User reviews summary.' : 'No reviews yet.',
  };

  const similarPerfumes = React.useMemo(() => {
    if (!perfume.reminds_me || perfume.reminds_me.length === 0) {
      console.log('No similar fragrances in reminds_me');
      return [];
    }
    
    console.log('Similar fragrances:', perfume.reminds_me);
    
    return perfume.reminds_me.map((name, idx) => {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return {
        id: idx + 1000,
        name: name,
        brand: '',
        rating: 0,
        isVerified: false,
        slug: slug,
      };
    });
  }, [perfume.reminds_me]);

  return (
    <div className="py-4 text-gray-900">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-32 right-20 animate-float">
          <Leaf size={20} className="text-green-300/20" />
        </div>
        <div className="absolute bottom-40 left-32 animate-float animate-delay-3">
          <Flower2 size={18} className="text-orange-300/20" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-5 px-4 relative z-10">
                        {/* TOP SECTION - DESKTOP UNCHANGED, MOBILE TWO COLUMNS */}
        <div ref={snapshotRef} className="glass-card rounded-xl p-3 lg:p-5 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-6">
            {/* LEFT - Image, Gender, Perfumer, Buttons */}
            <div className="space-y-2 lg:space-y-3">
              {/* Mobile: Small image in left column, Desktop: 280px centered */}
              <div className="aspect-[3/4] w-full max-w-[150px] mx-auto lg:max-w-[280px] rounded-lg lg:rounded-xl overflow-hidden bg-gradient-to-br from-green-50/50 to-orange-50/50">
                {perfume.image ? (
                  <img src={perfume.image} alt={perfume.variant_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 lg:w-12 lg:h-12 text-green-300" />
                  </div>
                )}
              </div>

              <div className="space-y-1 lg:space-y-2 text-[9px] lg:text-sm max-w-[150px] mx-auto lg:max-w-[280px]">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Gender:</span>
                  <span className="text-gray-800 font-semibold">{perfume.gender || '—'}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 font-medium">Perfumer:</span>
                  <span className="text-gray-800 font-semibold text-right leading-tight">{perfume.perfumers?.join(', ') || '—'}</span>
                </div>
              </div>

              <div className="flex gap-1 lg:gap-2 max-w-[150px] mx-auto lg:max-w-[280px]">
                <button 
                  onClick={() => {
                    if (!isSignedIn) {
                      open({ mode: 'signin', reason: 'Sign in to add to wardrobe', callbackUrl: `/perfumes/${slug}` });
                    }
                  }}
                  className="flex-1 rounded-md lg:rounded-lg bg-gradient-to-r from-green-500 to-orange-500 px-1.5 lg:px-3 py-1.5 lg:py-2 font-semibold text-white text-[9px] lg:text-sm hover:shadow-lg transition-all flex items-center justify-center gap-0.5 lg:gap-1"
                >
                  <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden lg:inline">Add to Wardrobe</span>
                  <span className="lg:hidden">Add</span>
                </button>
                <button onClick={handleSnapshot} className="rounded-md lg:rounded-lg border-2 border-green-200 p-1 lg:p-2 hover:bg-green-50" title="Snapshot">
                  <Camera className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
                </button>
              </div>
            </div>

            {/* RIGHT - Name, Brand, Accords (allow natural height) */}
            <div className="space-y-1.5 lg:space-y-4 flex flex-col">
              <div>
                <h1 className="text-base lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent leading-tight">
                  {perfume.variant_name}
                </h1>
                <p className="text-xs lg:text-xl font-semibold text-gray-700">{perfume.brand_name}</p>
              </div>

              {transformedAccords.length > 0 && (
                <div className="flex-1 min-h-0">
                  <h3 className="text-[9px] lg:text-sm font-semibold text-gray-800 mb-1 lg:mb-2">Main Accords</h3>
                  <AccordTags accords={transformedAccords} />
                </div>
              )}

              {/* Notes Pyramid - DESKTOP ONLY */}
              {(topNotes.length || middleNotes.length || baseNotes.length) > 0 && (
                <div className="hidden lg:block">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Notes Pyramid</h3>
                  <NotesPyramid topNotes={topNotes} middleNotes={middleNotes} baseNotes={baseNotes} />
                </div>
              )}
            </div>
          </div>

          {/* Notes Pyramid - MOBILE ONLY (Full width below) */}
          {(topNotes.length || middleNotes.length || baseNotes.length) > 0 && (
            <div className="lg:hidden mt-4 pt-4 border-t border-green-100">
              <h3 className="text-[10px] font-semibold text-gray-800 mb-2">Notes Pyramid</h3>
              <NotesPyramid topNotes={topNotes} middleNotes={middleNotes} baseNotes={baseNotes} />
            </div>
          )}
        </div>

        {/* RATINGS SECTION */}
        <div className="glass-card rounded-xl p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. STAR RATING */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Overall Rating</h3>
              <div className="flex items-center gap-1 cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingChange(star)}
                    type="button"
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star 
                        className={`w-7 h-7 ${star <= Math.round(userRating || rating) ? 'text-orange-400 fill-orange-400' : 'text-gray-300'}`} 
                    />
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-end">
                 <p className="text-xl font-bold text-gray-800">{(userRating || rating).toFixed(1)}</p>
                 <p className="text-xs text-gray-600">{reviewCount} votes</p>
              </div>
            </div>

            {/* 2. SILLAGE SLIDER */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Wind className="w-4 h-4 text-green-600" />
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Sillage</h3>
                </div>
              </div>
              
              <div className="relative h-6 flex items-center">
                <div className="absolute w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-gradient-to-r from-green-500 to-orange-500" 
                     style={{ width: `${getPosition(userSillage || perfume.sillage || 0)}%` }} 
                   />
                </div>
                {/* Invisible Range Input on top */}
                <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1" // ✅ Continuous movement
                    value={userSillage || perfume.sillage || 0}
                    onChange={(e) => handleSliderChange('sillage', parseFloat(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
                {/* Custom Thumb (visual only) */}
                <div 
                    className="absolute h-4 w-4 bg-white border-2 border-orange-500 rounded-full shadow pointer-events-none transition-none"
                    style={{ left: `calc(${getPosition(userSillage || perfume.sillage || 0)}% - 8px)` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-gray-400 uppercase font-medium">Intimate</span>
                  <span className="text-[10px] text-gray-400 uppercase font-medium">Moderate</span>
                  <span className="text-[10px] text-gray-400 uppercase font-medium">Strong</span>
              </div>
              {/* CURRENT VALUE BELOW LABELS */}
              <div className="mt-1 text-left">
                <span className="text-sm font-bold text-gray-800 uppercase">{getSillageLabel(userSillage || perfume.sillage || 0)}</span>
              </div>
            </div>

            {/* 3. LONGEVITY SLIDER */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Droplets className="w-4 h-4 text-orange-600" />
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Longevity</h3>
                </div>
              </div>

              <div className="relative h-6 flex items-center">
                <div className="absolute w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-gradient-to-r from-green-500 to-orange-500" 
                     style={{ width: `${getPosition(userLongevity || perfume.longevity || 0)}%` }} 
                   />
                </div>
                <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1" // ✅ Continuous movement
                    value={userLongevity || perfume.longevity || 0}
                    onChange={(e) => handleSliderChange('longevity', parseFloat(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                    className="absolute h-4 w-4 bg-white border-2 border-green-500 rounded-full shadow pointer-events-none transition-none"
                    style={{ left: `calc(${getPosition(userLongevity || perfume.longevity || 0)}% - 8px)` }}
                />
              </div>
              
              <div className="flex justify-between text-[10px] text-gray-400 uppercase font-medium mt-1">
                <span>0h</span>
                <span>2h</span>
                <span>4h</span>
                <span>6h</span>
                <span>8h</span>
                <span>10h</span>
                <span>12h+</span>
              </div>
              
              {/* CURRENT VALUE BELOW LABELS */}
              <div className="mt-1 text-left">
                <span className="text-sm font-bold text-gray-800 uppercase">{getLongevityHrsLabel(userLongevity || perfume.longevity || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {perfume.perfume_overview && (
          <div className="glass-card rounded-xl p-5 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-3">About This Fragrance</h3>
            <p className="text-gray-700 leading-relaxed">{perfume.perfume_overview}</p>
          </div>
        )}

        <SimilarFragrances
          fragrances={similarPerfumes}
          currentPerfumeId={Number(perfume._id)}
          userIsVerified={isSignedIn && canRate}
          onAddClick={() => {
            if (!isSignedIn) {
              open({ mode: 'signin', reason: 'Sign in to add similar fragrances', callbackUrl: `/perfumes/${slug}#similar` });
            }
          }}
        />

        <div className="glass-card rounded-xl p-5 shadow-sm">
          <ReviewsSummary summary={reviewsSummary} />
        </div>

        <div id="review-section" className="glass-card rounded-xl p-5 shadow-sm">
          <h3 className="mb-4 text-xl font-bold text-gray-800">Leave Your Review</h3>
          {!isSignedIn ? (
            <div className="rounded-xl border-2 border-dashed border-green-300 bg-green-50/50 p-6 text-center">
              <p className="mb-4 text-gray-700">Please sign in to leave a review</p>
              <button
                onClick={() => open({ mode: 'signin', reason: 'Sign in to leave a review', callbackUrl: `/perfumes/${slug}#review-section` })}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-orange-500 px-6 py-3 font-semibold text-white hover:shadow-lg transition-all"
              >
                <LogIn className="h-5 w-5" />
                Sign in to continue
              </button>
            </div>
          ) : !canRate ? (
            <div className="rounded-xl border border-orange-300 bg-orange-50 p-4 text-sm text-orange-900">
              Your account cannot leave reviews yet.
            </div>
          ) : (
            <form action={(fd) => handleSubmitReview(fd)} className="space-y-4">
              <p className="text-sm text-gray-600">Use the sliders above to rate. Write your review below:</p>
              <textarea
                name="text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience..."
                className="w-full rounded-lg border border-green-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-800"
                rows={4}
              />
              {errorMessage && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errorMessage}</div>}
              {successMessage && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{successMessage}</div>}
              <button
                type="submit"
                disabled={pending || !reviewText.trim()}
                className="rounded-lg bg-gradient-to-r from-green-500 to-orange-500 px-6 py-3 font-semibold text-white disabled:opacity-50 hover:shadow-lg transition-all"
              >
                {pending ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>

        <div className="glass-card rounded-xl p-5 shadow-sm">
          <h3 className="mb-4 text-xl font-bold text-gray-800">Latest Reviews</h3>
          {reviews.length === 0 && <p className="text-gray-600 text-center py-6">No reviews yet.</p>}
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div key={i} className="border-b border-green-100 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 ${star <= r.rating ? 'text-orange-400 fill-orange-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-sm font-semibold text-gray-800 ml-2">{r.rating.toFixed(1)}</span>
                </div>
                {r.text && <p className="text-gray-700">{r.text}</p>}
                <div className="mt-2 text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}