'use client';
import React from 'react';

interface Note {
  name: string;
}

interface NotesPyramidProps {
  topNotes: Note[];
  middleNotes: Note[];
  baseNotes: Note[];
}

const NotesPyramid: React.FC<NotesPyramidProps> = ({ topNotes, middleNotes, baseNotes }) => {
  return (
    <div className="relative py-2 lg:py-4">
      <div className="space-y-2 lg:space-y-3">
        {/* Top Notes - 40% width */}
        {topNotes.length > 0 && (
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="w-16 lg:w-24 text-right flex-shrink-0">
              <span className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-green-700">
                Top Notes
              </span>
            </div>
            <div className="flex-1 flex justify-center">
              <div 
                className="bg-green-100/80 rounded-md lg:rounded-lg py-2 lg:py-2.5 px-2 lg:px-4 text-center shadow-sm border border-green-200/50"
                style={{ width: '40%' }}
              >
                <span className="text-[11px] lg:text-sm font-medium text-gray-700 leading-tight">
                  {topNotes.map(n => n.name).join(', ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Heart Notes - 65% width */}
        {middleNotes.length > 0 && (
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="w-16 lg:w-24 text-right flex-shrink-0">
              <span className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-green-700">
                Heart Notes
              </span>
            </div>
            <div className="flex-1 flex justify-center">
              <div 
                className="bg-green-200/70 rounded-md lg:rounded-lg py-2 lg:py-2.5 px-2 lg:px-4 text-center shadow-sm border border-green-200/50"
                style={{ width: '65%' }}
              >
                <span className="text-[11px] lg:text-sm font-medium text-gray-700 leading-tight">
                  {middleNotes.map(n => n.name).join(', ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Base Notes - 95% width */}
        {baseNotes.length > 0 && (
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="w-16 lg:w-24 text-right flex-shrink-0">
              <span className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-green-700">
                Base Notes
              </span>
            </div>
            <div className="flex-1 flex justify-center">
              <div 
                className="bg-green-300/60 rounded-md lg:rounded-lg py-2 lg:py-2.5 px-2 lg:px-4 text-center shadow-sm border border-green-200/50"
                style={{ width: '95%' }}
              >
                <span className="text-[11px] lg:text-sm font-medium text-gray-700 leading-tight">
                  {baseNotes.map(n => n.name).join(', ')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPyramid;