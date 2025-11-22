import React, { useState, useRef } from 'react';
import { PredictionResult, UserProfile, CompatibilityAnalysis, RelationshipStatusType, PartnerPrediction } from '../types';
import { Heart, RefreshCw, Dna, ChevronDown, ChevronUp, Search, Sparkles, Share2, CheckCircle, Triangle, Link2, BrainCircuit, Scale, AlertTriangle, Star, Quote, MessageCircle, Info, Moon, Download, Camera, Activity, Brain } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ThreeDCard from './ThreeDCard';
import html2canvas from 'html2canvas';

interface ResultsViewProps {
  prediction: PredictionResult;
  onReset: () => void;
  user: UserProfile;
}

interface ExpandableCardProps {
  title: string;
  icon: React.ReactNode;
  content: string;
  defaultOpen?: boolean;
  theme?: 'pink' | 'purple' | 'red' | 'gray';
}

const TESTIMONIALS = [
    { id: 1, name: "Sarah J.", role: "Aries Sun", quote: "The archetype was scary accurate. I met a 'Julian' two weeks later.", stars: 5, color: "bg-pink-500" },
    { id: 2, name: "Marcus L.", role: "INTJ", quote: "Finally, a tool that uses actual psychology, not just random guesses.", stars: 5, color: "bg-indigo-500" },
    { id: 3, name: "Elena R.", role: "Seeker", quote: "The visualization helped me manifest the exact dynamic I needed.", stars: 4, color: "bg-purple-500" }
];

const STATUS_DESCRIPTIONS = {
  [RelationshipStatusType.MARRIAGE]: "High long-term potential, shared values, stability.",
  [RelationshipStatusType.CASUAL]: "High passion, low commitment, fun but fleeting.",
  [RelationshipStatusType.SITUATIONAL]: "Ambiguous, undefined, emotional but lacks structure.",
  [RelationshipStatusType.NEED_BASED]: "Based on filling a void rather than genuine synergy.",
  [RelationshipStatusType.KARMIC]: "Intense, volatile, meant for growth but likely to end."
};

const ExpandableCard: React.FC<ExpandableCardProps> = ({ title, icon, content, defaultOpen = false, theme = 'purple' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const getHoverStyles = () => {
    switch(theme) {
        case 'pink': return "hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:border-pink-500/40";
        case 'red': return "hover:shadow-[0_0_30px_rgba(248,113,113,0.3)] hover:border-red-500/40";
        case 'gray': return "hover:shadow-[0_0_30px_rgba(107,114,128,0.3)] hover:border-gray-500/40";
        case 'purple':
        default: return "hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:border-purple-500/40";
    }
  };

  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl overflow-hidden transition-all duration-500 ease-out hover:bg-white/10 hover:scale-[1.02] ${getHoverStyles()} group`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left focus:outline-none"
      >
        <h3 className="text-lg font-bold text-white flex items-center gap-2 group-hover:text-mystic-accent transition-colors">
            <span className="bg-white/10 p-2 rounded-full group-hover:scale-110 transition-transform">{icon}</span>
            {title}
        </h3>
        {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>
      
      <div className={`transition-all duration-700 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
         <div className={`px-6 pb-6 transition-all duration-700 ease-in-out transform ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
             <p className="text-sm text-gray-300 leading-relaxed pt-4 border-t border-white/10">
                {content}
             </p>
         </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-mystic-900/90 backdrop-blur-md border border-mystic-accent/30 p-3 rounded-xl shadow-[0_0_15px_rgba(0,210,255,0.2)] transform scale-105">
          <p className="text-mystic-accent font-bold text-xs uppercase tracking-wider mb-1">{payload[0].payload.trait}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
            <p className="text-white text-sm font-bold">Intensity: {payload[0].value}%</p>
          </div>
          <p className="text-gray-400 text-[10px] mt-1 max-w-[150px] italic leading-tight">
            {payload[0].payload.description && payload[0].payload.description.substring(0, 50)}...
          </p>
        </div>
      );
    }
    return null;
};

const ResultsView: React.FC<ResultsViewProps> = ({ prediction, onReset, user }) => {
  const [copied, setCopied] = useState(false);
  const [showShadow, setShowShadow] = useState(false); // Toggle for Shadow Match
  const [isExporting, setIsExporting] = useState(false); // Loading state for image export
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Determine generic props based on mode
  const isArchetype = prediction.mode === 'archetype';
  const name = isArchetype ? prediction.name : prediction.partnerName;
  const score = isArchetype ? prediction.compatibilityScore : prediction.successProbability;
  const occupation = isArchetype ? prediction.occupation : null;
  const reasoning = isArchetype ? prediction.reasoning : prediction.dynamicAnalysis;
  const imageUrl = isArchetype ? (prediction as PartnerPrediction).imageUrl : undefined;
  const shadowProfile = isArchetype ? (prediction as PartnerPrediction).shadowProfile : undefined;

  const handleShare = async () => {
    const text = isArchetype 
        ? `✨ AuraMatch Archetype Revealed ✨\n\nDestined connection: ${name}, a ${occupation}.\nCompatibility: ${score}%\n\nDiscover yours at AuraMatch.ai`
        : `✨ AuraMatch Love Calculator ✨\n\nCalculating synergy with ${name}: ${score}%\nStatus: ${(prediction as CompatibilityAnalysis).relationshipStatus}\n\nCheck yours at AuraMatch.ai`;
    try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    } catch (err) {
        console.error("Failed to copy", err);
    }
  };

  const handleDownloadSoulCard = async () => {
      if (!cardRef.current) return;
      setIsExporting(true);
      
      try {
          // Temporary visual adjustments for capture (remove 3D transform perspective for flat image)
          const cardElement = cardRef.current;
          
          // Use html2canvas to capture the element
          const canvas = await html2canvas(cardElement, {
              backgroundColor: null, // transparent
              scale: 2, // Higher resolution
              useCORS: true, // Allow cross-origin images
              logging: false,
              ignoreElements: (element) => {
                  // Ignore buttons during capture
                  return element.classList.contains('no-capture');
              }
          });

          // Trigger download
          const link = document.createElement('a');
          link.download = `AuraMatch-SoulCard-${name.replace(/\s+/g, '-')}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
      } catch (error) {
          console.error("Export failed", error);
      } finally {
          setIsExporting(false);
      }
  };

  const calculateLifePath = (age: number, name: string): number => {
    const nameValue = name.length;
    const raw = age + nameValue;
    let sum = 0;
    String(raw).split('').forEach(char => sum += parseInt(char));
    while (sum > 9 && sum !== 11 && sum !== 22) {
        let tempSum = 0;
        String(sum).split('').forEach(char => tempSum += parseInt(char));
        sum = tempSum;
    }
    return sum;
  };

  const lifePath = calculateLifePath(user.age, user.name);
  const loveFramework = prediction.loveFramework;

  // Color mapping for relationship status
  const getStatusColor = (status: string) => {
      switch(status) {
          case RelationshipStatusType.MARRIAGE: return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]';
          case RelationshipStatusType.CASUAL: return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]';
          case RelationshipStatusType.SITUATIONAL: return 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]';
          case RelationshipStatusType.NEED_BASED: return 'text-gray-400';
          case RelationshipStatusType.KARMIC: return 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]';
          default: return 'text-white';
      }
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 max-w-4xl mx-auto flex flex-col items-center perspective-1000">
      <header className="text-center mb-12 relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-2 animate-pulse-slow drop-shadow-sm">
          {isArchetype ? "Archetype Visualized" : "Love Calculator Result"}
        </h1>
        <p className="text-mystic-glow tracking-wide uppercase text-sm font-bold">Discovery grounded in human behavior and psychology.</p>
      </header>

      <div className="w-full flex flex-col gap-8">
           {/* Main Result Card */}
           <ThreeDCard intensity={10} className="w-full">
           <div 
                ref={cardRef}
                className={`bg-white/5 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 shadow-[0_0_40px_rgba(139,92,246,0.15)] relative overflow-hidden text-center group transform-style-3d transition-all duration-1000 ${showShadow ? 'shadow-karmic border-red-500/30' : ''}`}
           >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10 duration-700 pointer-events-none rotate-12 translate-z-10">
                <Heart size={150} />
              </div>
              
              {/* Shadow Mode Overlay */}
              {showShadow && (
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-red-900/50 to-black/90 z-0 pointer-events-none animate-appear"></div>
              )}
              
              <div className="mb-8 relative z-10 translate-z-20">
                  <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-6">
                      <div className="text-left">
                          <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${showShadow ? 'text-red-500' : 'text-mystic-accent'}`}>Your Life Path</div>
                          <div className="text-3xl font-serif text-white">{lifePath}</div>
                      </div>
                      <div className="text-right">
                          <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${showShadow ? 'text-red-500' : 'text-mystic-accent'}`}>
                              {isArchetype ? (showShadow ? "Shadow Archetype" : "Ideal Archetype") : "Target Profile"}
                          </div>
                          {/* Shadow Toggle (Only for Archetype) */}
                          {isArchetype && shadowProfile && (
                              <button 
                                onClick={() => setShowShadow(!showShadow)}
                                className={`no-capture mt-1 flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded-full border transition-all ${showShadow ? 'bg-red-500/20 border-red-500 text-red-300 hover:bg-red-500/40' : 'bg-white/10 border-white/20 text-gray-400 hover:bg-white/20'}`}
                              >
                                  <Moon size={10} /> {showShadow ? "Return to Light" : "Reveal Shadow"}
                              </button>
                          )}
                      </div>
                  </div>
                  
                  {/* Image or Name Display Area */}
                  <div className="flex flex-col items-center justify-center mt-8 mb-4 perspective-1000">
                      {showShadow ? (
                          // Shadow Icon
                          <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-red-900 rounded-full flex items-center justify-center border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.3)] mb-6 translate-z-20 relative animate-appear">
                              <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl animate-pulse-slow"></div>
                              <Moon size={64} className="text-red-400 opacity-80" />
                          </div>
                      ) : imageUrl ? (
                          <div className="relative w-48 h-48 md:w-64 md:h-64 mb-6 group-hover:scale-105 transition-transform duration-700 ease-out translate-z-50">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-500 animate-pulse-slow"></div>
                                <img 
                                    src={imageUrl} 
                                    alt="Generated Partner" 
                                    className="relative w-full h-full object-cover rounded-full border-4 border-white/20 shadow-2xl animate-appear hover:border-white/40 transition-colors"
                                />
                                <div className="absolute inset-0 rounded-full border border-white/10 mix-blend-overlay"></div>
                          </div>
                      ) : (
                         <div className="w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(236,72,153,0.3)] mb-6 translate-z-20 relative">
                            <div className="absolute inset-0 bg-pink-500/10 rounded-full blur-xl animate-pulse-slow"></div>
                            <Heart size={64} className="text-pink-400 opacity-80" />
                         </div>
                      )}

                      <h2 className={`text-5xl md:text-7xl font-serif font-bold text-white mb-2 md:mb-0 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] tracking-tight translate-z-30 ${showShadow ? 'text-red-100' : ''}`}>
                          {showShadow && shadowProfile ? shadowProfile.archetype : name}
                      </h2>
                  </div>

                  {isArchetype && occupation && !showShadow && (
                    <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-2 rounded-full text-sm text-gray-200 border border-white/20 mt-2 shadow-lg translate-z-20 backdrop-blur-md">
                        <span className="font-bold text-pink-300">{occupation}</span>
                        <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                        <span>Age {prediction.estimatedAge}</span>
                    </div>
                  )}

                   {showShadow && shadowProfile && (
                    <div className="inline-flex items-center gap-3 bg-red-900/30 px-6 py-2 rounded-full text-sm text-red-200 border border-red-500/20 mt-2 shadow-lg translate-z-20 backdrop-blur-md">
                        <span className="font-bold">Trigger: {shadowProfile.triggerTrait}</span>
                    </div>
                  )}
              </div>

              <div className="flex flex-col items-center justify-center mb-8 relative z-10 translate-z-20">
                  {!showShadow && (
                      <>
                        {/* Framing Effect: Emphasize Potential */}
                        <div className="text-xs text-gray-400 uppercase mb-2 font-bold tracking-wider">
                            {isArchetype ? "Resonance Score" : "Synergy Potential"}
                        </div>
                        <div className="flex items-end gap-2 relative">
                            <span className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow-lg filter brightness-110">
                                {score}%
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 opacity-80">
                            {score > 80 ? "High Alignment" : score > 50 ? "Growth Opportunity" : "Complex Dynamic"}
                        </p>
                        <div className="w-64 h-2 bg-gray-800 rounded-full mt-4 overflow-hidden shadow-inner border border-white/5">
                                <div 
                                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-pulse-slow shadow-[0_0_10px_rgba(236,72,153,0.5)]" 
                                    style={{ width: `${score}%` }} 
                                />
                        </div>
                        
                        {/* Love Calculator: Relationship Status */}
                        {!isArchetype && (
                            <div className="mt-6 flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg border border-white/5 backdrop-blur-md group/tooltip relative cursor-help">
                                <div className={`font-bold uppercase text-xs tracking-wide ${getStatusColor((prediction as CompatibilityAnalysis).relationshipStatus)}`}>
                                    {(prediction as CompatibilityAnalysis).relationshipStatus}
                                </div>
                                <Info size={14} className="text-gray-500 group-hover/tooltip:text-white transition-colors" />
                                
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-mystic-900 text-white text-[10px] rounded-xl shadow-xl border border-white/10 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                    {STATUS_DESCRIPTIONS[(prediction as CompatibilityAnalysis).relationshipStatus]}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-mystic-900 border-b border-r border-white/10 rotate-45"></div>
                                </div>
                            </div>
                        )}
                      </>
                  )}
                  
                  {showShadow && (
                      <div className="mt-4 max-w-md text-center">
                          <p className="text-red-200 italic text-sm leading-relaxed">
                              "{shadowProfile?.lesson}"
                          </p>
                      </div>
                  )}
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10 translate-z-10">
                  <button 
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white no-capture"
                  >
                      {copied ? <CheckCircle size={16} className="text-green-400" /> : <Share2 size={16} />}
                      {copied ? "Copied" : "Share Archetype"}
                  </button>
                  <button 
                    onClick={handleDownloadSoulCard}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 border border-pink-500/30 rounded-xl transition-all text-xs font-bold uppercase tracking-widest text-pink-300 hover:text-pink-200 no-capture"
                  >
                      {isExporting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Download size={16} />}
                      {isExporting ? "Generating..." : "Soul Card"}
                  </button>
              </div>
           </div>
           </ThreeDCard>
           
           {/* Psychometric Radar Chart */}
           {!showShadow && (
               <div className="animate-appear" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-center text-mystic-accent text-xs font-bold uppercase tracking-widest mb-6 flex items-center justify-center gap-2">
                        <BrainCircuit size={14} /> Psychometric Configuration
                    </h3>
                    <div className="h-64 w-full max-w-md mx-auto relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={isArchetype ? prediction.dominantTraits : []}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="trait" tick={{ fill: '#928dab', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Intensity"
                                dataKey="score"
                                stroke="#ec4899"
                                strokeWidth={2}
                                fill="#ec4899"
                                fillOpacity={0.4}
                                animationDuration={1000}
                                animationEasing="ease-out"
                                cursor="pointer"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
               </div>
           )}

           {/* Detailed Breakdown */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-appear" style={{ animationDelay: '0.4s' }}>
               {showShadow ? (
                   <div className="md:col-span-2">
                        <ExpandableCard 
                            title="The Shadow Dynamic" 
                            icon={<AlertTriangle size={18} className="text-red-400" />}
                            content={shadowProfile?.description || ""}
                            defaultOpen={true}
                            theme="red"
                        />
                   </div>
               ) : (
                   <>
                    <ExpandableCard 
                        title={isArchetype ? "Physiological Synergy" : "Dynamic Analysis"}
                        icon={isArchetype ? <Dna size={18} className="text-pink-400" /> : <Activity size={18} className="text-pink-400" />}
                        content={isArchetype ? prediction.physiologicalMatch : (prediction as CompatibilityAnalysis).dynamicAnalysis}
                        defaultOpen={true}
                        theme="pink"
                    />
                    <ExpandableCard 
                        title={isArchetype ? "Psychological Harmony" : "Potential Friction"}
                        icon={isArchetype ? <Brain size={18} className="text-purple-400" /> : <AlertTriangle size={18} className="text-yellow-400" />}
                        content={reasoning || (prediction as CompatibilityAnalysis).potentialChallenges}
                        theme={isArchetype ? "purple" : "gray"}
                    />
                   </>
               )}
           </div>

           {/* Psychosocial Framework Analysis */}
           {!showShadow && (
             <div className="mt-8 animate-appear" style={{ animationDelay: '0.6s' }}>
                <h3 className="text-center text-mystic-accent text-xs font-bold uppercase tracking-widest mb-6 flex items-center justify-center gap-2">
                    <Triangle size={14} /> Triangular Theory of Love
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row justify-around items-center gap-8 text-center mb-8">
                        <div className="space-y-2">
                            <div className="text-xs text-gray-400 uppercase">Intimacy</div>
                            <div className="text-2xl font-bold text-pink-400">{loveFramework.intimacyLevel}%</div>
                            <div className="w-20 h-1 bg-gray-700 rounded-full mx-auto overflow-hidden"><div style={{width: `${loveFramework.intimacyLevel}%`}} className="h-full bg-pink-500"></div></div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-xs text-gray-400 uppercase">Passion</div>
                            <div className="text-2xl font-bold text-red-400">{loveFramework.passionLevel}%</div>
                            <div className="w-20 h-1 bg-gray-700 rounded-full mx-auto overflow-hidden"><div style={{width: `${loveFramework.passionLevel}%`}} className="h-full bg-red-500"></div></div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-xs text-gray-400 uppercase">Commitment</div>
                            <div className="text-2xl font-bold text-blue-400">{loveFramework.commitmentLevel}%</div>
                            <div className="w-20 h-1 bg-gray-700 rounded-full mx-auto overflow-hidden"><div style={{width: `${loveFramework.commitmentLevel}%`}} className="h-full bg-blue-500"></div></div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-6 text-center">
                        <div className="inline-block bg-mystic-900 px-4 py-1 rounded-full border border-white/10 text-xs font-bold text-mystic-accent mb-3">
                            {loveFramework.attachmentDynamic}
                        </div>
                        <p className="text-sm text-gray-300 italic max-w-2xl mx-auto">
                            "{loveFramework.synastryReport}"
                        </p>
                    </div>
                </div>
             </div>
           )}

           {/* Social Proof / Testimonials */}
           <div className="mt-16 mb-8 animate-appear" style={{ animationDelay: '0.8s' }}>
               <div className="flex items-center justify-center gap-2 mb-8 opacity-60">
                   <div className="h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent w-24"></div>
                   <span className="text-[10px] uppercase tracking-widest text-gray-400">What Others Are Saying</span>
                   <div className="h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent w-24"></div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {TESTIMONIALS.map((t, i) => (
                       <ThreeDCard key={t.id} intensity={5} className="h-full">
                           <div className="bg-white/5 border border-white/5 p-6 rounded-full h-64 w-64 mx-auto flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors relative">
                               <div className={`absolute top-4 right-10 w-2 h-2 rounded-full ${t.color} animate-pulse`}></div>
                               <div className="mb-3 text-mystic-accent opacity-50"><Quote size={20} /></div>
                               <p className="text-xs text-gray-300 italic mb-4 px-4 leading-relaxed">"{t.quote}"</p>
                               <div className="font-bold text-white text-sm">{t.name}</div>
                               <div className="text-[10px] text-pink-400 uppercase tracking-wider mb-2">{t.role}</div>
                               <div className="flex gap-0.5 text-yellow-400">
                                   {[...Array(t.stars)].map((_,si) => <Star key={si} size={10} fill="currentColor" />)}
                               </div>
                           </div>
                       </ThreeDCard>
                   ))}
               </div>
           </div>
           
           <button 
             onClick={onReset}
             className="mx-auto mt-8 mb-16 flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold no-capture"
           >
             <RefreshCw size={14} /> Reset & Start Over
           </button>
      </div>
    </div>
  );
};

export default ResultsView;