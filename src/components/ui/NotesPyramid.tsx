'use client';
import React from 'react';
import Image from 'next/image';

interface Note {
  name: string;
}

interface NotesPyramidProps {
  topNotes: Note[];
  middleNotes: Note[];
  baseNotes: Note[];
}

const NotesPyramid: React.FC<NotesPyramidProps> = ({ topNotes, middleNotes, baseNotes }) => {
  
  // Dynamic color generator based on note name
  const generateNoteColor = (noteName: string, noteType: 'top' | 'middle' | 'base') => {
    const hash = noteName.toLowerCase().split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const baseColors = {
      top: [
        'from-amber-400 to-orange-500',
        'from-yellow-400 to-amber-500', 
        'from-lime-400 to-green-500',
        'from-emerald-400 to-teal-500',
        'from-cyan-400 to-blue-500',
        'from-orange-400 to-red-500'
      ],
      middle: [
        'from-pink-400 to-rose-500',
        'from-purple-400 to-pink-500',
        'from-fuchsia-400 to-purple-500',
        'from-violet-400 to-purple-500',
        'from-indigo-400 to-blue-500',
        'from-rose-400 to-pink-500'
      ],
      base: [
        'from-purple-500 to-indigo-600',
        'from-indigo-500 to-purple-600',
        'from-violet-500 to-purple-600',
        'from-blue-500 to-indigo-600',
        'from-slate-500 to-gray-600',
        'from-gray-500 to-slate-600'
      ]
    };
    
    const colorIndex = Math.abs(hash) % baseColors[noteType].length;
    return baseColors[noteType][colorIndex];
  };

  // Generate note image path
  const getNoteImagePath = (noteName: string) => {
    const cleanName = noteName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `/images/notes/${cleanName}.jpg`;
  };

  // Fallback image handler
  const handleImageError = (e: any) => {
    e.target.src = '/images/notes/default-note.jpg'; // Create a default note image
  };

  const renderNoteSection = (notes: Note[], title: string, noteType: 'top' | 'middle' | 'base', bgGradient: string) => (
    <div className="mb-4">
      <div className="flex items-center mb-3">
        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${bgGradient} mr-3`}></div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-300">
          {title}
        </h4>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {notes.map((note, index) => {
          const noteGradient = generateNoteColor(note.name, noteType);
          return (
            <div
              key={index}
              className={`bg-gradient-to-r ${noteGradient} rounded-lg p-3 text-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105`}
            >
              <div className="flex items-center space-x-3">
                {/* Note Image */}
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
                  <Image
                    src={getNoteImagePath(note.name)}
                    alt={note.name}
                    width={32}
                    height={32}
                    className="object-cover"
                    onError={handleImageError}
                  />
                </div>
                
                {/* Note Name */}
                <span className="text-sm font-medium truncate flex-1">
                  {note.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
        Notes Breakdown
      </h3>
      
      <div className="space-y-3">
        {renderNoteSection(topNotes, 'Top Notes', 'top', 'from-amber-400 to-orange-500')}
        {renderNoteSection(middleNotes, 'Middle Notes', 'middle', 'from-pink-400 to-rose-500')}
        {renderNoteSection(baseNotes, 'Base Notes', 'base', 'from-purple-500 to-indigo-600')}
      </div>
    </div>
  );
};

export default NotesPyramid;