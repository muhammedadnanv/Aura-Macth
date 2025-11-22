
import React, { useEffect, useState } from 'react';
import { Sparkles, Activity, Brain, Heart, User, Zap } from 'lucide-react';

const LoadingView: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const messages = [
    'Mapping physiological markers...',
    'Aligning zodiac constellations...',
    'Analyzing emotional frequencies...',
    'Calibrating gender dynamics...',
    'Synthesizing psychological profile...',
    'Scanning temporal possibilities...',
    'Destiny computed.'
  ];

  // Derive current message index based on progress (0-100)
  const progressIndex = Math.min(
    Math.floor((progress / 100) * messages.length),
    messages.length - 1
  );

  const [stars] = useState(() => 
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      size: Math.random() > 0.7 ? 'w-1.5 h-1.5' : 'w-1 h-1',
      opacity: 0.2 + Math.random() * 0.5,
      parallaxSpeed: (Math.random() - 0.5) * 30 // Random speed and direction for depth
    }))
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalize coordinates from -1 to 1 for center-based parallax
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Total loading time in ms
    const duration = 8000; 
    const intervalTime = 50;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Determine the active phase for animations
  const getPhase = () => {
      // Map progress index to phase
      // 0: Physio, 1: Zodiac, 2: Emotion, 3: Gender, 4: Psych, 5: Temporal, 6: Destiny
      switch(progressIndex) {
          case 0: return 'physio';
          case 1: return 'zodiac';
          case 2: return 'emotion';
          case 3: return 'gender';
          case 4: return 'psych';
          case 5: return 'temporal';
          case 6: return 'destiny';
          default: return 'neutral';
      }
  };

  const phase = getPhase();

  // Dynamic Core styling
  const getCoreColor = () => {
      if (phase === 'physio') return 'bg-pink-500/20 shadow-pink-500/50';
      if (phase === 'zodiac') return 'bg-indigo-500/20 shadow-indigo-500/50';
      if (phase === 'emotion') return 'bg-red-500/20 shadow-red-500/50';
      if (phase === 'gender') return 'bg-blue-500/20 shadow-blue-500/50';
      if (phase === 'psych') return 'bg-purple-500/20 shadow-purple-500/50';
      if (phase === 'temporal') return 'bg-cyan-500/20 shadow-cyan-500/50';
      if (phase === 'destiny') return 'bg-yellow-400/20 shadow-yellow-400/50';
      return 'bg-mystic-accent/20 shadow-mystic-accent/50';
  };

  const getCoreBorder = () => {
      if (phase === 'destiny') return 'from-yellow-100 to-yellow-300';
      if (phase === 'physio' || phase === 'emotion') return 'from-pink-100 to-pink-300';
      if (phase === 'psych') return 'from-purple-100 to-purple-300';
      return 'from-white to-gray-300';
  }

  // Highlight helpers
  const isPhysioActive = phase === 'physio' || phase === 'emotion';
  const isPsychActive = phase === 'psych' || phase === 'emotion';
  const isCosmosActive = phase === 'zodiac' || phase === 'temporal';
  const isCoreActive = phase === 'gender' || phase === 'destiny';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center relative overflow-hidden bg-mystic-900 transition-colors duration-1000">
      
      {/* Dynamic Background Overlay based on Phase */}
      <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
          phase === 'physio' ? 'bg-pink-900/20' :
          phase === 'zodiac' ? 'bg-indigo-900/20' :
          phase === 'psych' ? 'bg-purple-900/20' :
          phase === 'destiny' ? 'bg-yellow-900/10' :
          'bg-transparent'
      }`}></div>

      {/* Starry Background with Parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div 
            key={star.id}
            className="absolute transition-transform duration-100 ease-linear"
            style={{ 
              left: `${star.left}%`, 
              top: `${star.top}%`, 
              transform: `translate(${mousePos.x * star.parallaxSpeed}px, ${mousePos.y * star.parallaxSpeed}px)`
            }}
          >
             <div 
               className={`bg-white rounded-full animate-twinkle ${star.size} transition-all duration-500`}
               style={{ 
                 animationDelay: `${star.delay}s`,
                 opacity: isCosmosActive ? star.opacity * 2 : star.opacity, // Stars brighter during cosmos phases
                 boxShadow: isCosmosActive ? '0 0 4px white' : 'none'
               }} 
             />
          </div>
        ))}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-mystic-900/50 to-mystic-900"></div>
      </div>

      {/* Main Orbital Animation with Parallax Layers */}
      <div className="relative z-10 mb-16 scale-90 md:scale-100 perspective-[1000px]">
        
        {/* Center Core: The Soul */}
        <div 
            className="absolute top-1/2 left-1/2 z-20 transition-all duration-300 ease-out"
            style={{ transform: `translate(calc(-50% + ${mousePos.x * 10}px), calc(-50% + ${mousePos.y * 10}px))` }}
        >
            {/* Pulsing Glow that changes color */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-3xl animate-pulse-slow transition-colors duration-1000 ${getCoreColor()}`}></div>
            
            {/* Physical Core */}
            <div className={`relative w-20 h-20 bg-gradient-to-br ${getCoreBorder()} rounded-full shadow-[0_0_50px_rgba(255,255,255,0.4)] flex items-center justify-center z-20 transition-all duration-500 ${isCoreActive ? 'scale-110 ring-4 ring-white/30' : ''}`}>
                <User className={`text-mystic-900 w-8 h-8 transition-transform duration-500 ${progress === 100 ? 'scale-125' : ''}`} />
            </div>
        </div>

        {/* Orbit 1: Psychology (Brain) - Medium Parallax */}
        <div 
            className="absolute top-1/2 left-1/2 z-10 transition-all duration-300 ease-out"
            style={{ transform: `translate(calc(-50% + ${mousePos.x * 20}px), calc(-50% + ${mousePos.y * 20}px))` }}
        >
             <div className={`w-48 h-48 -translate-x-1/2 -translate-y-1/2 border border-purple-500/30 rounded-full animate-spin-slow transition-all duration-700 ${isPsychActive ? 'border-purple-400/80 shadow-[0_0_30px_rgba(168,85,247,0.3)] scale-105' : 'opacity-40'}`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-mystic-900 p-2 rounded-full border border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    <Brain className={`w-4 h-4 text-purple-400 transition-all duration-500 ${isPsychActive ? 'scale-125 text-purple-300' : ''}`} />
                </div>
                <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-purple-500/50 rounded-full"></div>
                <div className="absolute top-12 right-4 w-1.5 h-1.5 bg-purple-500/50 rounded-full"></div>
             </div>
        </div>

        {/* Orbit 2: Physiology (Activity/Heart) - High Parallax */}
        <div 
            className="absolute top-1/2 left-1/2 z-0 transition-all duration-300 ease-out"
            style={{ transform: `translate(calc(-50% + ${mousePos.x * 30}px), calc(-50% + ${mousePos.y * 30}px))` }}
        >
            <div className={`w-72 h-72 -translate-x-1/2 -translate-y-1/2 border border-pink-500/30 rounded-full animate-spin-reverse transition-all duration-700 ${isPhysioActive ? 'border-pink-400/80 shadow-[0_0_30px_rgba(236,72,153,0.3)] scale-105' : 'opacity-40'}`}>
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 bg-mystic-900 p-2 rounded-full border border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                    <Activity className={`w-5 h-5 text-pink-400 transition-all duration-500 ${isPhysioActive ? 'scale-125 text-pink-300' : ''}`} />
                </div>
                <div className="absolute top-1/2 -left-4 -translate-y-1/2 bg-mystic-900 p-2 rounded-full border border-pink-500/50 shadow-[0_0_10px_rgba(236,72,153,0.3)]">
                    <Heart className={`w-3 h-3 text-pink-400 transition-all duration-500 ${isPhysioActive ? 'scale-125 text-pink-300' : ''}`} />
                </div>
            </div>
        </div>

        {/* Orbit 3: Destiny/Cosmos (Sparkles) - Highest Parallax */}
        <div 
            className="absolute top-1/2 left-1/2 z-0 transition-all duration-300 ease-out"
            style={{ transform: `translate(calc(-50% + ${mousePos.x * 40}px), calc(-50% + ${mousePos.y * 40}px))` }}
        >
            <div className={`w-96 h-96 -translate-x-1/2 -translate-y-1/2 border border-yellow-400/20 rounded-full border-dashed transition-all duration-700 ${isCosmosActive ? 'animate-spin shadow-[0_0_30px_rgba(250,204,21,0.2)] border-yellow-400/50 scale-105' : 'animate-spin-slower opacity-40'}`}>
                <div className="absolute bottom-10 right-10 bg-mystic-900 p-2 rounded-full border border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                    <Sparkles className={`w-5 h-5 text-yellow-400 transition-all duration-500 ${isCosmosActive ? 'scale-125 text-yellow-200' : ''}`} />
                </div>
                <div className="absolute top-4 left-16 bg-mystic-900 p-1.5 rounded-full border border-yellow-400/60">
                    <Zap className={`w-3 h-3 text-yellow-400 transition-all duration-500 ${isCosmosActive ? 'scale-125 text-yellow-200' : ''}`} />
                </div>
            </div>
        </div>

      </div>

      {/* Text Status - Reactive Parallax */}
      <div 
        className="relative z-10 max-w-md w-full backdrop-blur-sm bg-black/20 p-6 rounded-2xl border border-white/5 transition-transform duration-300 ease-out"
        style={{ transform: `translate(${mousePos.x * 5}px, ${mousePos.y * 5}px)` }}
      >
        <h2 className="text-xl md:text-2xl font-light tracking-[0.15em] text-white uppercase mb-4 min-h-[2rem] transition-all duration-300">
          {messages[progressIndex]}
        </h2>
        
        {/* Progress Bar Container */}
        <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            {/* Filled Bar */}
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-mystic-accent to-pink-500 transition-all duration-100 ease-linear" 
              style={{ width: `${progress}%` }}
            >
              {/* Glowing Leading Edge */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-full bg-white blur-[2px] opacity-70"></div>
            </div>
        </div>

        {/* Numeric and Text Footer */}
        <div className="mt-3 flex justify-between items-center text-xs text-gray-400 font-mono uppercase">
            <span className="animate-pulse text-mystic-accent">Processing Data</span>
            <span className="font-bold text-white">{Math.floor(progress)}%</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingView;
