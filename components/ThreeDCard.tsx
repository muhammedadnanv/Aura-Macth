
import React, { useRef, useState, useEffect } from 'react';

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number; // How much it rotates
  glowColor?: string;
}

const ThreeDCard: React.FC<ThreeDCardProps> = ({ children, className = "", intensity = 15, glowColor = "rgba(255,255,255,0.1)" }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // Check if device is mobile/touch OR prefers reduced motion
  useEffect(() => {
      const checkCapabilities = () => {
          const isTouch = window.matchMedia('(pointer: coarse)').matches;
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          setIsDisabled(isTouch || prefersReducedMotion);
      };
      checkCapabilities();
      window.addEventListener('resize', checkCapabilities);
      return () => window.removeEventListener('resize', checkCapabilities);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isDisabled) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate mouse position relative to center of card
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    // Rotate X based on Y position (tilt up/down), Rotate Y based on X position (tilt left/right)
    const xRotation = yPct * -intensity * 2; 
    const yRotation = xPct * intensity * 2;

    setRotation({ x: xRotation, y: yRotation });
  };

  const handleMouseEnter = () => {
      if (!isDisabled) setIsHovering(true);
  };
  
  const handleMouseLeave = () => {
    if (!isDisabled) {
        setIsHovering(false);
        setRotation({ x: 0, y: 0 });
    }
  };

  return (
    <div className={`perspective-1000 ${className}`}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative transition-transform duration-200 ease-out preserve-3d w-full h-full"
        style={{
          transform: !isDisabled ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovering ? 1.02 : 1})` : 'none',
        }}
      >
        {/* Dynamic Lighting Reflection - Hidden if disabled */}
        {!isDisabled && (
            <div 
                className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-500 z-50 mix-blend-overlay"
                style={{
                    background: `linear-gradient(${135 - rotation.y * 2}deg, rgba(255,255,255,0.2) 0%, transparent 50%)`,
                    opacity: isHovering ? 0.8 : 0
                }}
            ></div>
        )}

        {/* Glow Effect behind the card - Simplified on mobile/disabled */}
        <div 
            className="absolute inset-4 blur-2xl -z-10 transition-all duration-500 rounded-full"
            style={{
                background: glowColor,
                opacity: isHovering || isDisabled ? 0.6 : 0, // Always show faint glow on mobile
                transform: !isDisabled ? `translateZ(-50px) scale(${isHovering ? 1.1 : 0.9})` : 'none'
            }}
        ></div>

        {children}
      </div>
    </div>
  );
};

export default ThreeDCard;
