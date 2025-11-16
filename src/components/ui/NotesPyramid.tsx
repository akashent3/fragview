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
    <div className="relative py-4">
      {/* Container with proper spacing */}
      <div className="space-y-3">
        {/* Top Notes - 40% width */}
        {topNotes.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="w-24 text-right flex-shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                Top Notes
              </span>
            </div>
            <div className="flex-1 flex justify-center">
              <div 
                className="bg-green-100/80 rounded-lg py-2.5 px-4 text-center shadow-sm border border-green-200/50"
                style={{ width: '40%' }}
              >
                <span className="text-sm font-medium text-gray-700">
                  {topNotes.map(n => n.name).join(', ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Heart Notes - 65% width */}
        {middleNotes.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="w-24 text-right flex-shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                Heart Notes
              </span>
            </div>
            <div className="flex-1 flex justify-center">
              <div 
                className="bg-green-200/70 rounded-lg py-2.5 px-4 text-center shadow-sm border border-green-200/50"
                style={{ width: '65%' }}
              >
                <span className="text-sm font-medium text-gray-700">
                  {middleNotes.map(n => n.name).join(', ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Base Notes - 95% width */}
        {baseNotes.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="w-24 text-right flex-shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                Base Notes
              </span>
            </div>
            <div className="flex-1 flex justify-center">
              <div 
                className="bg-green-300/60 rounded-lg py-2.5 px-4 text-center shadow-sm border border-green-200/50"
                style={{ width: '95%' }}
              >
                <span className="text-sm font-medium text-gray-700">
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