import React, { useState, Suspense, useEffect } from 'react';
import { UserProfile, ZodiacSign, GenderPreference, PredictionResult, SpecificPartnerDetails } from './types';
import { predictPartner, analyzeCompatibility } from './services/geminiService';
import LoadingView from './components/LoadingView';
import InputSlider from './components/InputSlider';
import ThreeDCard from './components/ThreeDCard';
import CosmicArtifact from './components/CosmicArtifact';
import { User, Eye, Palette, Activity, Sparkles, Heart, FileText, ChevronLeft, ChevronRight, Fingerprint, Brain, Compass, AlertCircle, X, ShieldCheck, Users, Zap, BarChart3, Scale, CheckCircle2 } from 'lucide-react';

// Lazy load the heavy ResultsView (contains Recharts)
const ResultsView = React.lazy(() => import('./components/ResultsView'));

const INITIAL_USER: UserProfile = {
  name: '',
  age: 25,
  gender: 'Female',
  zodiac: ZodiacSign.ARIES,
  eyeColor: 'Brown',
  introvertExtrovert: 50,
  logicEmotion: 50,
  adventureRoutine: 50,
  genderPreference: GenderPreference.MALE, // Default to Male for binary setup
  favoriteColor: 'Blue',
  stressReaction: 'I analyze the situation',
  partnerTraitsPreference: '',
  additionalDetails: ''
};

const INITIAL_PARTNER: SpecificPartnerDetails = {
  name: '',
  age: 25,
  gender: 'Male',
  religion: ''
};

const EYE_COLORS = ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber'];

const STANDARD_GENDER_PREFS = [
  GenderPreference.MALE,
  GenderPreference.FEMALE
];

const MAX_TAGS = 5;

// Reusable Form Label Component
const FormLabel = ({ icon: Icon, label, required }: { icon: any, label: string, required?: boolean }) => (
  <label className="flex items-center gap-2 text-mystic-accent font-bold text-xs uppercase tracking-widest group-focus-within:text-white transition-colors mb-2 shadow-black drop-shadow-md">
    <Icon size={12} /> 
    {label}
    {required && <span className="text-pink-500 ml-0.5 drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]">*</span>}
  </label>
);

function App() {
  const [appMode, setAppMode] = useState<'archetype' | 'measure'>('archetype');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [specificPartner, setSpecificPartner] = useState<SpecificPartnerDetails>(INITIAL_PARTNER);
  
  const [step, setStep] = useState<'landing' | 'form' | 'loading' | 'result'>('landing');
  const [formStep, setFormStep] = useState(1); // 1: Basics, 2: Psychology, 3: Preferences, 4: Partner Details (Measure Mode only)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFocused, setIsFocused] = useState(false); // Focus Mode State
  const [tagInputError, setTagInputError] = useState(false);

  // Reset focus when step changes
  useEffect(() => {
      setIsFocused(false);
  }, [step, formStep]);

  const handlePredict = async () => {
    // Validate final step fields before submitting
    let isValid = true;
    const fieldsToTouch: Record<string, boolean> = {};

    if (appMode === 'archetype') {
        // Binary check: genderPreference is enum now, so trim check not really needed but safe to keep for string compat
        if (!user.genderPreference) { 
            fieldsToTouch.genderPreference = true; 
            isValid = false; 
        }
    } else {
        // Validate Partner details
        if (!specificPartner.name.trim()) { fieldsToTouch.partnerName = true; isValid = false; }
        if (!specificPartner.religion.trim()) { fieldsToTouch.partnerReligion = true; isValid = false; }
    }

    if (!isValid) {
      setTouched(prev => ({ ...prev, ...fieldsToTouch }));
      return;
    }

    setStep('loading');
    setError(null);
    try {
      let result: PredictionResult;
      if (appMode === 'archetype') {
          result = await predictPartner(user);
      } else {
          result = await analyzeCompatibility(user, specificPartner);
      }
      setPrediction(result);
      setStep('result');
    } catch (err: any) {
      console.error("Prediction Error Details:", err);
      let errorMessage = "The cosmic signals were interrupted. Please try again.";
      if (err) {
        const msg = (typeof err === 'string' ? err : err.message || JSON.stringify(err)).toLowerCase();
        if (msg.includes("quota")) errorMessage = "Cosmic Energy Depleted: API quota exceeded.";
        else if (msg.includes("429")) errorMessage = "The stars are aligning too quickly. Please pause.";
        else if (msg.includes("safety")) errorMessage = "The oracle withheld the vision due to safety guidelines.";
        else errorMessage = `Cosmic disturbance: ${err.message || "Unknown Error"}`;
      }
      setError(errorMessage);
      setStep('form');
    }
  };

  const resetApp = () => {
    setPrediction(null);
    setStep('landing');
    setFormStep(1);
    setUser(INITIAL_USER);
    setSpecificPartner(INITIAL_PARTNER);
    setTouched({});
    setError(null);
    setIsFocused(false);
    setTagInputError(false);
  };

  // Validation Helpers
  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const hasError = (field: string) => {
    if (!touched[field]) return false;
    
    if (field === 'partnerName') return !specificPartner.name.trim();
    if (field === 'partnerReligion') return !specificPartner.religion.trim();

    // User fields
    const val = user[field as keyof UserProfile];
    if (field === 'age') return (val as number) <= 0;
    if (typeof val === 'string') return !val.trim();
    return false;
  };

  // Check if a field is valid (filled and no error)
  const isValidField = (field: string) => {
      if (field === 'partnerName') return !!specificPartner.name.trim();
      if (field === 'partnerReligion') return !!specificPartner.religion.trim();
      
      const val = user[field as keyof UserProfile];
      if (field === 'age') return (val as number) > 0;
      if (typeof val === 'string') return !!val.trim();
      
      return false;
  };

  const getInputClass = (field: string) => {
    const baseClass = "w-full rounded-xl px-4 py-4 text-white focus:outline-none transition-all placeholder-gray-600 backdrop-blur-sm";
    if (hasError(field)) {
      return `${baseClass} bg-red-500/10 border border-red-500 focus:border-red-500 focus:bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]`;
    }
    // Operant Conditioning: Subtle green glow for success
    if (isValidField(field) && (touched[field] || user[field as keyof UserProfile])) {
        return `${baseClass} bg-green-500/5 border border-green-500/30 focus:border-green-400 focus:bg-green-500/10 shadow-[0_0_10px_rgba(74,222,128,0.1)]`;
    }
    return `${baseClass} bg-black/20 border border-white/10 focus:border-mystic-accent focus:bg-black/40 hover:bg-black/30 focus:shadow-[0_0_15px_rgba(0,210,255,0.1)]`;
  };

  const getSelectClass = (field: string) => {
    const baseClass = "w-full bg-black/20 border rounded-xl px-4 py-4 text-white focus:outline-none transition-all appearance-none cursor-pointer backdrop-blur-sm";
    if (hasError(field)) {
      return `${baseClass} border-red-500 bg-red-500/10 focus:border-red-500`;
    }
    if (isValidField(field) || (field === 'gender' || field === 'zodiac')) {
         // Gender and Zodiac are always valid as they have defaults, so allow green state
        return `${baseClass} border-green-500/30 bg-green-500/5 focus:border-green-400`;
    }
    return `${baseClass} border-white/10 focus:border-mystic-accent focus:bg-black/40 hover:bg-black/30`;
  };

  const SuccessIcon = ({ field, className = "absolute right-4 top-1/2 -translate-y-1/2" }: { field: string, className?: string }) => {
      // Logic: if valid and (touched or has value), show success
      const hasValue = field === 'additionalDetails' ? !!user.additionalDetails.trim() : true;
      
      if (isValidField(field) && hasValue) {
          return <CheckCircle2 size={16} className={`text-green-400 animate-appear ${className}`} />;
      }
      // Special case for selects that have defaults
      if ((field === 'gender' || field === 'zodiac') && user[field]) {
          return <CheckCircle2 size={16} className={`text-green-400 animate-appear ${className}`} />;
      }
      return null;
  };

  const nextFormStep = () => {
    let isValid = true;
    const fieldsToTouch: Record<string, boolean> = {};

    if (formStep === 1) {
      if (!user.name.trim()) { fieldsToTouch.name = true; isValid = false; }
      if (user.age <= 0) { fieldsToTouch.age = true; isValid = false; }
      if (!user.eyeColor.trim()) { fieldsToTouch.eyeColor = true; isValid = false; }
    } else if (formStep === 2) {
      if (!user.favoriteColor.trim()) { fieldsToTouch.favoriteColor = true; isValid = false; }
      if (!user.stressReaction.trim()) { fieldsToTouch.stressReaction = true; isValid = false; }
    } else if (formStep === 3) {
      // Validate Step 3 (Gender Pref) for both modes before moving forward or to predict
      if (!user.genderPreference) { fieldsToTouch.genderPreference = true; isValid = false; }
    }

    if (!isValid) {
      setTouched(prev => ({ ...prev, ...fieldsToTouch }));
      return;
    }

    setFormStep(s => s + 1);
    window.scrollTo(0,0);
  }

  const prevFormStep = () => {
    setFormStep(s => s - 1);
    window.scrollTo(0,0);
  }

  // Tag Handlers
  const currentTags = user.partnerTraitsPreference 
    ? user.partnerTraitsPreference.split(',').map(s => s.trim()).filter(Boolean) 
    : [];

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = e.currentTarget.value.trim();
        
        if (!val) return;

        if (currentTags.length >= MAX_TAGS) {
            setTagInputError(true);
            setTimeout(() => setTagInputError(false), 2000);
            return;
        }

        if (!currentTags.includes(val)) {
            const newTags = [...currentTags, val];
            setUser({ ...user, partnerTraitsPreference: newTags.join(', ') });
            e.currentTarget.value = '';
            setTagInputError(false);
        }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
      const newTags = currentTags.filter(tag => tag !== tagToRemove);
      setUser({ ...user, partnerTraitsPreference: newTags.join(', ') });
  };

  // Background Layer with Nebula Orbs - Optimized & Purpose-Driven (Dims on Focus)
  const BackgroundOrbs = () => (
    <div 
        className={`fixed inset-0 overflow-hidden pointer-events-none -z-10 perspective-1000 transition-all duration-1000 ease-in-out ${isFocused ? 'opacity-40 scale-105 blur-sm' : 'opacity-100 scale-100'}`}
    >
        {/* Deep Space Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-mystic-900 via-mystic-800 to-[#1a1638]"></div>
        
        {/* Floating Nebula Orbs - Using will-change for hardware acceleration */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[80px] md:blur-[120px] animate-nebula mix-blend-screen will-change-transform motion-safe-only"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[100px] md:blur-[150px] animate-nebula mix-blend-screen will-change-transform motion-safe-only" style={{ animationDelay: '-5s' }}></div>
        <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] bg-pink-500/10 rounded-full blur-[60px] md:blur-[100px] animate-nebula mix-blend-screen will-change-transform motion-safe-only" style={{ animationDelay: '-10s' }}></div>
    
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
    </div>
  );

  const renderLanding = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative">
      
      <div className="z-10 mb-8 max-w-3xl mx-auto">
          <CosmicArtifact mode="idle" />
          <h1 className="text-5xl md:text-7xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-mystic-accent via-purple-300 to-pink-400 tracking-tight drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] transform preserve-3d mb-4">
            Decode Your Love Geometry
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
            Stop guessing. Use <span className="text-mystic-accent font-bold">Jungian Psychology</span> and <span className="text-pink-400 font-bold">AI</span> to visualize your ideal partner or measure true compatibility.
          </p>
      </div>
      
      {/* Methodology Strip / Value Proposition */}
      <div className="z-10 perspective-1000 mb-12 w-full max-w-4xl">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs md:text-sm text-gray-400 uppercase tracking-widest">
          <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
             <Brain className="text-mystic-accent" size={16} />
             <span>Psychological Profiling</span>
          </div>
          <div className="hidden md:block w-1 h-1 bg-gray-600 rounded-full"></div>
          <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
             <Zap className="text-yellow-400" size={16} />
             <span>AI Visualization</span>
          </div>
          <div className="hidden md:block w-1 h-1 bg-gray-600 rounded-full"></div>
           <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
             <BarChart3 className="text-pink-400" size={16} />
             <span>Relationship Science</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto mb-12 z-10 perspective-1000">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Purpose: Archetype (Internal/Self) */}
            <ThreeDCard intensity={15} glowColor="rgba(236, 72, 153, 0.3)">
                <button
                    onClick={() => { setAppMode('archetype'); setStep('form'); }}
                    className="w-full h-full px-8 py-10 bg-white/5 backdrop-blur-md border border-pink-500/20 hover:border-pink-500/50 text-white rounded-[2rem] shadow-glass transition-all duration-300 flex flex-col items-center justify-center gap-4 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="bg-pink-500/10 p-4 rounded-full group-hover:scale-110 transition-transform duration-500 translate-z-20 border border-pink-500/30">
                        <Sparkles className="w-8 h-8 text-pink-400 drop-shadow-neon" />
                    </div>
                    <div className="translate-z-10">
                        <h2 className="text-2xl font-bold font-serif mb-2">Reveal Your Archetype</h2>
                        <p className="text-sm text-gray-300 leading-relaxed px-4">
                            Analyze your psyche to visualize the face and personality of your destined partner.
                        </p>
                    </div>
                </button>
            </ThreeDCard>

            {/* Purpose: Measure (External/Other) */}
            <ThreeDCard intensity={15} glowColor="rgba(99, 102, 241, 0.3)">
                <button
                    onClick={() => { setAppMode('measure'); setStep('form'); }}
                    className="w-full h-full px-8 py-10 bg-white/5 backdrop-blur-md border border-indigo-500/20 hover:border-indigo-500/50 text-white rounded-[2rem] shadow-glass transition-all duration-300 flex flex-col items-center justify-center gap-4 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="bg-indigo-500/10 p-4 rounded-full group-hover:scale-110 transition-transform duration-500 translate-z-20 border border-indigo-500/30">
                        <Scale className="w-8 h-8 text-indigo-400 drop-shadow-neon" />
                    </div>
                    <div className="translate-z-10">
                        <h2 className="text-2xl font-bold font-serif mb-2">Calculate True Synergy</h2>
                        <p className="text-sm text-gray-300 leading-relaxed px-4">
                            Input a specific person's details to measure your friction, flow, and long-term potential.
                        </p>
                    </div>
                </button>
            </ThreeDCard>
        </div>
      </div>
      
      <footer className="absolute bottom-4 w-full text-center px-4">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest opacity-60">
            Grounded in Sternberg's Triangular Theory of Love & Big Five Personality Traits.
        </p>
      </footer>
    </div>
  );

  const renderForm = () => (
    <div className="min-h-screen py-8 px-4 flex items-center justify-center perspective-2000">
      <ThreeDCard className="max-w-2xl w-full" intensity={5}>
      <div 
        className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden transform-style-3d"
        // Focus Mode: Enable when interacting with the card
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
                setIsFocused(false);
            }
        }}
      >
        
        {/* Background Elements inside card */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none will-change-transform"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none will-change-transform"></div>

        <div className="mb-8 relative z-10 translate-z-20">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-6 relative max-w-xs mx-auto">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -z-10 rounded-full"></div>
                <div 
                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-pink-500 -z-10 transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                    style={{ width: `${((formStep - 1) / (appMode === 'measure' ? 3 : 2)) * 100}%` }}
                ></div>

                {[1, 2, 3, ...(appMode === 'measure' ? [4] : [])].map((s) => (
                    <div 
                        key={s} 
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border-2 relative ${
                            s <= formStep 
                                ? 'bg-mystic-900 border-pink-500 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.5)] scale-110' 
                                : 'bg-mystic-900/80 border-white/10 text-gray-600 scale-90'
                        }`}
                    >
                        {s === 1 && <Fingerprint size={16} />}
                        {s === 2 && <Brain size={16} />}
                        {s === 3 && <Compass size={16} />}
                        {s === 4 && <Users size={16} />}
                    </div>
                ))}
            </div>
            
            <div className="text-center translate-z-10">
                 <h2 className="text-3xl font-bold font-serif text-white mb-2 tracking-wide drop-shadow-md">
                    {formStep === 1 && "Essence & Identity"}
                    {formStep === 2 && "Inner Landscape"}
                    {formStep === 3 && "Concepts & Resonance"}
                    {formStep === 4 && "Love Calculator Inputs"}
                 </h2>
                 <p className="text-mystic-glow text-xs font-medium tracking-wide uppercase opacity-80">
                    {formStep === 1 && "Calibrating Astral Baseline"}
                    {formStep === 2 && "Mapping Psychological Terrain"}
                    {formStep === 3 && "Defining Unique Energy Concepts"}
                    {formStep === 4 && "Inputting Target Variables"}
                 </p>
            </div>
        </div>

        <div className="min-h-[300px] relative z-10 translate-z-10">
        {formStep === 1 && (
          <div className="space-y-6 animate-appear">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 group relative">
                <FormLabel icon={User} label="Your Name" required />
                <div className="relative">
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      onBlur={() => markTouched('name')}
                      className={getInputClass('name')}
                      placeholder="Enter your name"
                      autoFocus
                    />
                    <SuccessIcon field="name" />
                </div>
                {hasError('name') && <span className="text-red-400 text-xs ml-1 font-bold">Name is required</span>}
              </div>
              <div className="space-y-2 group relative">
                <FormLabel icon={Activity} label="Age" required />
                <div className="relative">
                    <input
                      type="number"
                      value={user.age}
                      onChange={(e) => setUser({ ...user, age: parseInt(e.target.value) || 0 })}
                      onBlur={() => markTouched('age')}
                      className={getInputClass('age')}
                    />
                    <SuccessIcon field="age" />
                </div>
                 {hasError('age') && <span className="text-red-400 text-xs ml-1 font-bold">Valid age is required</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="space-y-2 group">
                <FormLabel icon={User} label="Gender" />
                <div className="relative">
                    <select
                    value={user.gender}
                    onChange={(e) => setUser({ ...user, gender: e.target.value as 'Male' | 'Female' })}
                    className={getSelectClass('gender')}
                    >
                    <option value="Female" className="bg-mystic-800">Female</option>
                    <option value="Male" className="bg-mystic-800">Male</option>
                    </select>
                    <SuccessIcon field="gender" className="absolute right-10 top-1/2 -translate-y-1/2" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                </div>
              </div>
              <div className="space-y-2 group">
                <FormLabel icon={Sparkles} label="Zodiac Sign" />
                <div className="relative">
                    <select
                    value={user.zodiac}
                    onChange={(e) => setUser({ ...user, zodiac: e.target.value as ZodiacSign })}
                    className={getSelectClass('zodiac')}
                    >
                    {Object.values(ZodiacSign).map((sign) => (
                        <option key={sign} value={sign} className="bg-mystic-800">{sign}</option>
                    ))}
                    </select>
                    <SuccessIcon field="zodiac" className="absolute right-10 top-1/2 -translate-y-1/2" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 group relative">
              <FormLabel icon={Eye} label="Eye Color" required />
              <div className="relative">
                <select
                    value={EYE_COLORS.includes(user.eyeColor) ? user.eyeColor : 'Other'}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Other') {
                            setUser({ ...user, eyeColor: '' });
                        } else {
                            setUser({ ...user, eyeColor: val });
                        }
                    }}
                    onBlur={() => markTouched('eyeColor')}
                    className={getSelectClass('eyeColor')}
                >
                    {EYE_COLORS.map(color => (
                        <option key={color} value={color} className="bg-mystic-800">{color}</option>
                    ))}
                    <option value="Other" className="bg-mystic-800">Other (Specify)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
              </div>

              {(!EYE_COLORS.includes(user.eyeColor) && user.eyeColor !== '') || (user.eyeColor === '' && touched['eyeColor']) ? (
                  <div className="relative">
                      <input
                        type="text"
                        value={user.eyeColor}
                        onChange={(e) => setUser({ ...user, eyeColor: e.target.value })}
                        onBlur={() => markTouched('eyeColor')}
                        className={getInputClass('eyeColor') + " mt-2 animate-appear"}
                        placeholder="Please specify your eye color..."
                      />
                      <SuccessIcon field="eyeColor" />
                  </div>
              ) : null}
            </div>
          </div>
        )}

        {formStep === 2 && (
          <div className="space-y-6 animate-appear">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="space-y-2 group relative">
                <FormLabel icon={Palette} label="Favorite Color" required />
                <div className="relative">
                    <input
                      type="text"
                      value={user.favoriteColor}
                      onChange={(e) => setUser({ ...user, favoriteColor: e.target.value })}
                      onBlur={() => markTouched('favoriteColor')}
                      className={getInputClass('favoriteColor')}
                      autoFocus
                    />
                    <SuccessIcon field="favoriteColor" />
                </div>
                {hasError('favoriteColor') && <span className="text-red-400 text-xs ml-1 font-bold">Required</span>}
              </div>
              <div className="space-y-2 group relative">
                <FormLabel icon={Activity} label="Reaction to Stress" required />
                <div className="relative">
                    <input
                      type="text"
                      value={user.stressReaction}
                      onChange={(e) => setUser({ ...user, stressReaction: e.target.value })}
                      onBlur={() => markTouched('stressReaction')}
                      className={getInputClass('stressReaction')}
                      placeholder="e.g. I withdraw, I get angry..."
                    />
                     <SuccessIcon field="stressReaction" />
                </div>
                {hasError('stressReaction') && <span className="text-red-400 text-xs ml-1 font-bold">Required</span>}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 space-y-1">
                <InputSlider
                  label="Social Battery"
                  leftLabel="Solitary"
                  rightLabel="Social"
                  value={user.introvertExtrovert}
                  onChange={(val) => setUser({ ...user, introvertExtrovert: val })}
                />
                <InputSlider
                  label="Decision Making"
                  leftLabel="Heart"
                  rightLabel="Head"
                  value={user.logicEmotion}
                  onChange={(val) => setUser({ ...user, logicEmotion: val })}
                />
                <InputSlider
                  label="Lifestyle Rhythm"
                  leftLabel="Structured"
                  rightLabel="Spontaneous"
                  value={user.adventureRoutine}
                  onChange={(val) => setUser({ ...user, adventureRoutine: val })}
                />
            </div>
          </div>
        )}

        {formStep === 3 && (
          <div className="space-y-6 animate-appear">
             <div className="space-y-2 group">
              <FormLabel icon={Heart} label="Interested In" required={true} />
              <div className="relative">
                <select
                    value={user.genderPreference}
                    onChange={(e) => setUser({ ...user, genderPreference: e.target.value as GenderPreference })}
                    onBlur={() => markTouched('genderPreference')}
                    className={getSelectClass('genderPreference')}
                >
                    <option value={GenderPreference.FEMALE} className="bg-mystic-800">Female</option>
                    <option value={GenderPreference.MALE} className="bg-mystic-800">Male</option>
                </select>
                <SuccessIcon field="genderPreference" className="absolute right-10 top-1/2 -translate-y-1/2" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
              </div>
            </div>
            
            <div className="space-y-2 group">
                <div className="flex justify-between items-end">
                    <FormLabel icon={Sparkles} label="Key Concepts & Traits" />
                    <span className={`text-[10px] uppercase font-bold tracking-widest transition-colors ${currentTags.length >= MAX_TAGS ? 'text-pink-500' : 'text-gray-600'}`}>
                        {currentTags.length}/{MAX_TAGS}
                    </span>
                </div>
                <div className={`w-full bg-black/20 border rounded-xl px-4 py-4 transition-all flex flex-wrap gap-2 backdrop-blur-sm ${tagInputError ? 'border-red-500/50 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/10 focus-within:border-mystic-accent focus-within:bg-black/40'}`}>
                    {currentTags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 bg-mystic-accent/10 text-mystic-accent text-sm font-bold px-3 py-1 rounded-full animate-appear border border-mystic-accent/20 shadow-[0_0_10px_rgba(0,210,255,0.1)] hover:bg-mystic-accent/20 transition-colors cursor-default">
                            {tag}
                            <button onClick={() => handleRemoveTag(tag)} className="hover:text-white hover:bg-mystic-accent/20 rounded-full p-0.5 transition-all ml-1">
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                    <input
                      type="text"
                      onKeyDown={handleAddTag}
                      disabled={currentTags.length >= MAX_TAGS}
                      className={`flex-grow bg-transparent text-white focus:outline-none placeholder-gray-600 min-w-[120px] transition-opacity ${currentTags.length >= MAX_TAGS ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder={currentTags.length >= MAX_TAGS ? "Max traits reached" : "Add concept..."}
                    />
                </div>
                {tagInputError && (
                    <div className="flex items-center gap-1 text-red-400 text-xs animate-appear font-bold">
                        <AlertCircle size={12} />
                        <span>Maximum limit of {MAX_TAGS} traits reached.</span>
                    </div>
                )}
            </div>

            <div className="space-y-2 group relative">
                <FormLabel icon={FileText} label="Bio & Specific Interests" />
                <div className="relative">
                    <textarea
                      value={user.additionalDetails}
                      onChange={(e) => setUser({ ...user, additionalDetails: e.target.value })}
                      className={getInputClass('additionalDetails') + " min-h-[100px] resize-y"}
                      placeholder="Share your hobbies, quirks, or what you truly long for..."
                    />
                     <SuccessIcon field="additionalDetails" className="absolute right-4 top-4" />
                </div>
            </div>
          </div>
        )}

        {formStep === 4 && appMode === 'measure' && (
             <div className="space-y-6 animate-appear">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 group relative">
                        <FormLabel icon={User} label="Partner's Name" required />
                        <div className="relative">
                            <input
                              type="text"
                              value={specificPartner.name}
                              onChange={(e) => setSpecificPartner({ ...specificPartner, name: e.target.value })}
                              onBlur={() => markTouched('partnerName')}
                              className={getInputClass('partnerName')}
                              autoFocus
                            />
                            <SuccessIcon field="partnerName" />
                        </div>
                        {hasError('partnerName') && <span className="text-red-400 text-xs ml-1 font-bold">Required</span>}
                    </div>
                    <div className="space-y-2 group relative">
                        <FormLabel icon={Activity} label="Partner's Age" />
                        <div className="relative">
                            <input
                              type="number"
                              value={specificPartner.age}
                              onChange={(e) => setSpecificPartner({ ...specificPartner, age: parseInt(e.target.value) || 0 })}
                              className={getInputClass('partnerAge')} // Generic input class as not strictly required valid/error logic here yet
                            />
                        </div>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 group">
                        <FormLabel icon={User} label="Partner's Gender" />
                        <div className="relative">
                             <select
                                value={specificPartner.gender}
                                onChange={(e) => setSpecificPartner({ ...specificPartner, gender: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-mystic-accent focus:bg-black/40 focus:outline-none transition-all appearance-none cursor-pointer backdrop-blur-sm hover:bg-black/30"
                            >
                                <option value="Female" className="bg-mystic-800">Female</option>
                                <option value="Male" className="bg-mystic-800">Male</option>
                            </select>
                             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                        </div>
                    </div>
                    <div className="space-y-2 group relative">
                        <FormLabel icon={ShieldCheck} label="Religion / Beliefs" required />
                        <div className="relative">
                            <input
                              type="text"
                              value={specificPartner.religion}
                              onChange={(e) => setSpecificPartner({ ...specificPartner, religion: e.target.value })}
                              onBlur={() => markTouched('partnerReligion')}
                              className={getInputClass('partnerReligion')}
                              placeholder="e.g. Agnostic, Spiritual..."
                            />
                            <SuccessIcon field="partnerReligion" />
                        </div>
                         {hasError('partnerReligion') && <span className="text-red-400 text-xs ml-1 font-bold">Required</span>}
                    </div>
                </div>
             </div>
        )}

        </div>

        <div className="mt-10 flex justify-between gap-4 relative z-10 translate-z-20">
          {formStep > 1 ? (
            <button
              onClick={prevFormStep}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all flex items-center gap-2 border border-white/10 hover:border-white/20 font-bold tracking-wide uppercase text-xs"
            >
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <button
                onClick={() => { setStep('landing'); resetApp(); }}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-2 border border-transparent hover:border-white/10 font-bold tracking-wide uppercase text-xs"
            >
                Cancel
            </button>
          )}

          {(formStep < 3 && appMode === 'archetype') || (formStep < 4 && appMode === 'measure') ? (
            <button
              onClick={nextFormStep}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-wide text-xs"
            >
              Next Step <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handlePredict}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-mystic-accent to-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-wide text-xs relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              <span className="relative flex items-center gap-2">
                 {appMode === 'archetype' ? <Sparkles size={16} /> : <Scale size={16} />}
                 {appMode === 'archetype' ? "Reveal Archetype" : "Calculate Synergy"}
              </span>
            </button>
          )}
        </div>
      </div>
      </ThreeDCard>
    </div>
  );

  return (
    <>
        <BackgroundOrbs />
        
        {/* Main Content Switcher */}
        {step === 'landing' && renderLanding()}
        {step === 'form' && renderForm()}
        {step === 'loading' && <LoadingView />}
        {step === 'result' && prediction && (
            <Suspense fallback={<LoadingView />}>
                <ResultsView prediction={prediction} onReset={resetApp} user={user} />
            </Suspense>
        )}

        {/* Error Toast */}
        {error && (
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-red-400 animate-appear z-50 backdrop-blur-md max-w-md w-full">
                <AlertCircle className="flex-shrink-0" />
                <span className="font-medium text-sm">{error}</span>
                <button onClick={() => setError(null)} className="ml-auto hover:bg-white/20 rounded-full p-1 transition-colors"><X size={16} /></button>
            </div>
        )}
    </>
  );
}

export default App;