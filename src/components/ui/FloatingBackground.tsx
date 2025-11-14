'use client';

import { useEffect, useState } from 'react';
import { Leaf, Flower2, Trees, Wind } from 'lucide-react';

export default function FloatingBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Gradient Blobs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      
      {/* Floating Leaves Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
        <pattern id="leaves" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          <path d="M50 30 Q 30 50 50 70 Q 70 50 50 30" fill="#D4E4BC" />
          <path d="M150 80 Q 130 100 150 120 Q 170 100 150 80" fill="#E8F3E8" />
          <circle cx="100" cy="50" r="3" fill="#F2C6A0" />
          <circle cx="30" cy="150" r="2" fill="#D4E4BC" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#leaves)" />
      </svg>

      {/* Animated Floating Icons */}
      <div className="absolute top-10 left-20 animate-float">
        <Leaf size={30} className="text-green-300/50" style={{ transform: `translateX(${mousePosition.x}px)` }} />
      </div>
      <div className="absolute top-40 right-32 animate-float" style={{ animationDelay: '2s' }}>
        <Flower2 size={25} className="text-orange-300/40" style={{ transform: `translateX(${-mousePosition.x}px)` }} />
      </div>
      <div className="absolute bottom-32 left-40 animate-float" style={{ animationDelay: '3s' }}>
        <Trees size={35} className="text-green-400/30" style={{ transform: `translateY(${mousePosition.y}px)` }} />
      </div>
      <div className="absolute top-60 left-1/2 animate-float" style={{ animationDelay: '1s' }}>
        <Wind size={28} className="text-teal-300/40" style={{ transform: `translateX(${mousePosition.x}px)` }} />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}