'use client';
import React from 'react';

interface Accord {
  name: string;
  strength?: number;
  width?: number;
}

interface AccordTagsProps {
  accords: Accord[];
  className?: string;
}

// Dynamic color generator for accords
const getAccordColor = (accordName: string): string => {
  const colors: { [key: string]: string } = {
    // Floral
    rose: '#ec4899',
    jasmine: '#f472b6',
    violet: '#a855f7',
    iris: '#c084fc',
    ylang: '#e879f9',
    tuberose: '#f0abfc',
    neroli: '#fbbf24',
    lavender: '#a78bfa',
    
    // Citrus
    citrus: '#fbbf24',
    lemon: '#fde047',
    bergamot: '#fcd34d',
    orange: '#fb923c',
    grapefruit: '#fdba74',
    mandarin: '#fbbf24',
    
    // Woody
    woody: '#92400e',
    sandalwood: '#b45309',
    cedar: '#78350f',
    oud: '#451a03',
    patchouli: '#7c2d12',
    vetiver: '#65a30d',
    
    // Spicy
    spicy: '#dc2626',
    cinnamon: '#b91c1c',
    pepper: '#991b1b',
    ginger: '#ea580c',
    cardamom: '#c2410c',
    
    // Fresh
    fresh: '#10b981',
    aquatic: '#06b6d4',
    marine: '#0891b2',
    mint: '#34d399',
    green: '#22c55e',
    
    // Gourmand
    vanilla: '#fef3c7',
    caramel: '#fcd34d',
    chocolate: '#78350f',
    coffee: '#451a03',
    honey: '#fbbf24',
    almond: '#fed7aa',
    
    // Musky/Amber
    musk: '#9ca3af',
    amber: '#f59e0b',
    leather: '#92400e',
    animalic: '#6b7280',
    
    // Aromatic
    aromatic: '#8b5cf6',
    herbal: '#84cc16',
    medicinal: '#22d3ee',
    
    // Fruity
    fruity: '#f472b6',
    apple: '#86efac',
    peach: '#fdba74',
    berry: '#f87171',
    tropical: '#fbbf24',
    
    // Powdery
    powdery: '#d4d4d8',
    talc: '#e4e4e7',
    
    // Earthy
    earthy: '#78350f',
    mossy: '#65a30d',
    
    // Sweet
    sweet: '#fda4af',
    
    // Smoky
    smoky: '#52525b',
    incense: '#71717a',
  };

  const lowerName = accordName.toLowerCase();
  
  // Check for exact match
  if (colors[lowerName]) return colors[lowerName];
  
  // Check for partial match
  for (const [key, color] of Object.entries(colors)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return color;
    }
  }
  
  // Default to a gradient color based on first letter
  const hash = accordName.charCodeAt(0) % 10;
  const defaultColors = [
    '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', 
    '#06b6d4', '#f97316', '#22c55e', '#a855f7',
    '#fb923c', '#14b8a6'
  ];
  
  return defaultColors[hash];
};

const AccordTags: React.FC<AccordTagsProps> = ({ accords, className = '' }) => {
  const totalStrength = accords.reduce((sum, accord) => {
    const strength = accord.strength || accord.width || 1;
    return sum + strength;
  }, 0);

  // Find max strength for mobile width calculation
  const maxStrength = Math.max(...accords.map(a => a.strength || a.width || 1));

  return (
    <div className={className}>
      {/* DESKTOP: Horizontal bars */}
      <div className="hidden lg:block">
        <div className="flex gap-0.5 mb-3 rounded-lg overflow-hidden shadow-sm">
          {accords.map((accord, index) => {
            const backgroundColor = getAccordColor(accord.name);
            const strength = accord.strength || accord.width || 1;
            const widthPercentage = (strength / totalStrength) * 100;
            
            return (
              <div
                key={index}
                className="h-10 relative group transition-all duration-300 hover:brightness-110 cursor-default first:rounded-l-lg last:rounded-r-lg"
                style={{
                  backgroundColor,
                  width: `${widthPercentage}%`,
                }}
                title={`${accord.name} - Strength: ${strength}/5`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/10" />
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between items-center px-1">
          {accords.map((accord, index) => (
            <span 
              key={index} 
              className="text-xs font-medium text-gray-700 transition-colors hover:text-green-600"
              style={{ 
                flex: accord.strength || accord.width || 1,
                textAlign: index === 0 ? 'left' : index === accords.length - 1 ? 'right' : 'center'
              }}
            >
              {accord.name}
            </span>
          ))}
        </div>
      </div>

                  {/* MOBILE: Vertical stacked bars - NO HEIGHT LIMIT */}
      <div className="lg:hidden space-y-0.5">
        {accords.map((accord, index) => {
          const backgroundColor = getAccordColor(accord.name);
          const strength = accord.strength || accord.width || 1;
          const widthPercentage = Math.min((strength / maxStrength) * 85, 85);
          
          return (
            <div
              key={index}
              className="flex items-center h-4 rounded-sm transition-all hover:brightness-110 relative overflow-hidden"
              style={{ 
                backgroundColor,
                width: `${widthPercentage}%`,
              }}
              title={`Strength: ${strength}/5`}
            >
              <span className="relative text-[8px] font-semibold text-white px-1.5 drop-shadow-sm z-10 truncate leading-none">
                {accord.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccordTags;