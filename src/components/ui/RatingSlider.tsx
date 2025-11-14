'use client';
import React, { useState } from 'react';

interface RatingSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const RatingSlider: React.FC<RatingSliderProps> = ({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
  step = 0.01,
  disabled = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  const getSliderBackground = () => {
    const percentage = ((value - min) / (max - min)) * 100;
    // UPDATED: Green to orange gradient
    return `linear-gradient(to right, #10b981 0%, #f59e0b ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
          {value.toFixed(2)}
        </span>
      </div>
      
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="rating-slider w-full cursor-pointer"
          style={{ background: getSliderBackground() }}
        />
        
        {isHovered && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs">
            {value.toFixed(2)}
          </div>
        )}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default RatingSlider;