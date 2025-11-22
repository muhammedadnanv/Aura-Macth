import React, { useEffect, useRef, useState } from 'react';

interface CosmicArtifactProps {
  mode?: 'idle' | 'processing' | 'result';
  scrollProgress?: number;
}

const CosmicArtifact: React.FC<CosmicArtifactProps> = ({ mode = 'idle' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
         const isTouch = window.matchMedia('(pointer: coarse)').matches;
         setIsMobile(isTouch);
    };
    checkMobile();

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: (e.clientX / innerWidth - 0.5) * 20, // Tilt range -10 to 10 deg
        y: (e.clientY / innerHeight - 0.5) * 20
      });
    };

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    if (!isMobile) {
        window.addEventListener('mousemove', handleMouseMove);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  // Dynamic styles based on state
  const isProcessing = mode === 'processing';
  const isResult = mode === 'result';

  const coreColor = isResult ? 'bg-yellow-400' : isProcessing ? 'bg-pink-500' : 'bg-mystic-accent';
  const glowColor = isResult ? 'shadow-yellow-400/50' : isProcessing ? 'shadow-pink-500/50' : 'shadow-mystic-accent/50';

  return (
    <div className="relative w-64 h-64 perspective-1000 mx-auto mb-12" ref={ref}>
      {/* Main Container - Reacts to Mouse Tilt (Desktop Only) */}
      <div 
        className="w-full h-full relative transform-style-3d transition-transform duration-200 ease-out"
        style={{
          transform: !isMobile ? `rotateX(${-mousePos.y}deg) rotateY(${mousePos.x}deg)` : 'none'
        }}
      >
        {/* Outer Ring - Gyroscope 1 - Reacts to Scroll */}
        <div 
          className="absolute inset-0 border-2 border-white/10 rounded-full transform-style-3d"
          style={{
            transform: `rotateX(${scrollY * 0.2}deg) rotateY(${scrollY * 0.1}deg) rotateZ(${scrollY * 0.05}deg)`
          }}
        >
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/50 rounded-full shadow-[0_0_10px_white]"></div>
        </div>

        {/* Middle Ring - Gyroscope 2 - Auto Spin + Scroll */}
        <div 
          className="absolute inset-4 border border-mystic-accent/30 rounded-full transform-style-3d animate-spin-slow"
          style={{
             animationDuration: isProcessing ? '2s' : '15s',
             transform: `rotateX(60deg) rotateY(${scrollY * 0.3}deg)`
          }}
        >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-mystic-accent rounded-full"></div>
        </div>

        {/* Inner Cube - The Container of the Soul */}
        <div 
          className="absolute top-1/2 left-1/2 w-24 h-24 -ml-12 -mt-12 transform-style-3d animate-spin-reverse-slow"
          style={{
            animationDuration: isProcessing ? '4s' : '20s'
          }}
        >
           {/* Cube Faces - Simplified rendering possible here if needed */}
           <div className="absolute inset-0 bg-white/5 border border-white/10 translate-z-10 backdrop-blur-sm"></div>
           <div className="absolute inset-0 bg-white/5 border border-white/10 translate-z-10" style={{ transform: 'rotateY(90deg) translateZ(48px)' }}></div>
           <div className="absolute inset-0 bg-white/5 border border-white/10 translate-z-10" style={{ transform: 'rotateY(180deg) translateZ(48px)' }}></div>
           <div className="absolute inset-0 bg-white/5 border border-white/10 translate-z-10" style={{ transform: 'rotateY(-90deg) translateZ(48px)' }}></div>
           <div className="absolute inset-0 bg-white/5 border border-white/10 translate-z-10" style={{ transform: 'rotateX(90deg) translateZ(48px)' }}></div>
           <div className="absolute inset-0 bg-white/5 border border-white/10 translate-z-10" style={{ transform: 'rotateX(-90deg) translateZ(48px)' }}></div>
           
           {/* The Core */}
           <div className="absolute inset-0 flex items-center justify-center transform-style-3d">
               <div 
                 className={`w-12 h-12 rounded-full ${coreColor} blur-md transition-all duration-1000 animate-pulse-slow`}
                 style={{
                    transform: `scale(${1 + (scrollY * 0.001)})`
                 }}
               ></div>
               <div className={`absolute w-8 h-8 rounded-full bg-white mix-blend-overlay ${glowColor} shadow-[0_0_30px_currentColor]`}></div>
           </div>
        </div>

        {/* Floating Particles - Reduced count for lower end devices */}
        <div className="absolute inset-0 pointer-events-none transform-style-3d">
             {[...Array(isMobile ? 3 : 6)].map((_, i) => (
                 <div 
                    key={i}
                    className={`absolute w-1 h-1 bg-white rounded-full animate-float`}
                    style={{
                        left: `${50 + Math.cos(i) * 40}%`,
                        top: `${50 + Math.sin(i) * 40}%`,
                        animationDelay: `${i * 0.5}s`,
                        transform: `translateZ(${Math.random() * 100}px)`
                    }}
                 ></div>
             ))}
        </div>
      </div>
      
      {/* Floor Reflection/Shadow */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-40 h-10 bg-black/50 blur-xl rounded-[100%] transform rotateX(60deg)"></div>
    </div>
  );
};

export default CosmicArtifact;