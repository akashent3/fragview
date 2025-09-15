'use client';
import React from 'react';
import { getAccordColor, getTextColor } from '@/utils/colors';

interface Accord {
  name: string;
  strength?: number;
}

interface AccordTagsProps {
  accords: Accord[];
  className?: string;
}

const AccordTags: React.FC<AccordTagsProps> = ({ accords, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {accords.map((accord, index) => {
        const backgroundColor = getAccordColor(accord.name);
        const textColor = getTextColor(backgroundColor);
        
        return (
          <div
            key={index}
            className="relative px-4 py-2 rounded-full text-sm font-medium shadow-sm border-2 border-white/30 dark:border-gray-600/30 transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer backdrop-blur-sm"
            style={{
              backgroundColor,
              color: textColor,
              borderColor: backgroundColor
            }}
          >
            <span>{accord.name}</span>
            {accord.strength && (
              <div 
                className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white/30 dark:bg-gray-800/30"
                title={`Strength: ${accord.strength}/5`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AccordTags;