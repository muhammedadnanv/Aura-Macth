export enum GenderPreference {
  MALE = 'Male',
  FEMALE = 'Female'
}

export enum ZodiacSign {
  ARIES = 'Aries',
  TAURUS = 'Taurus',
  GEMINI = 'Gemini',
  CANCER = 'Cancer',
  LEO = 'Leo',
  VIRGO = 'Virgo',
  LIBRA = 'Libra',
  SCORPIO = 'Scorpio',
  SAGITTARIUS = 'Sagittarius',
  CAPRICORN = 'Capricorn',
  AQUARIUS = 'Aquarius',
  PISCES = 'Pisces'
}

export enum RelationshipStatusType {
  MARRIAGE = 'Marriage Material',
  CASUAL = 'Casual Connection',
  SITUATIONAL = 'Situationship',
  NEED_BASED = 'Need-Based / Transactional',
  KARMIC = 'Karmic Lesson'
}

export interface UserProfile {
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  zodiac: ZodiacSign;
  eyeColor: string; // Physiological factor
  introvertExtrovert: number; // 0-100 Scale
  logicEmotion: number; // 0-100 Scale
  adventureRoutine: number; // 0-100 Scale
  genderPreference: GenderPreference; // Restricted to binary enum
  favoriteColor: string;
  stressReaction: string; // Psychological factor
  partnerTraitsPreference: string; // Desired traits
  additionalDetails: string; // User interests and explanations
}

export interface SpecificPartnerDetails {
  name: string;
  age: number;
  gender: string;
  religion: string;
}

export interface TraitScore {
  trait: string;
  score: number; // 0-100
  description: string;
}

export interface LoveFramework {
  intimacyLevel: number; // Sternberg's Triangular Theory
  passionLevel: number; // Sternberg's Triangular Theory
  commitmentLevel: number; // Sternberg's Triangular Theory
  attachmentDynamic: string; // e.g., "Secure - Anxious Pairing"
  synastryReport: string; // Explanation of the dataset correlation
}

export interface ShadowProfile {
  archetype: string; // e.g., "The Chaotic Artist"
  triggerTrait: string; // The user trait that attracts this (e.g., "Repressed anger")
  description: string; // Description of this shadow partner
  lesson: string; // What this relationship teaches
}

// Base prediction for Archetype (Mode A)
export interface PartnerPrediction {
  mode: 'archetype';
  name: string;
  gender: string; // Explicit gender for image generation consistency
  estimatedAge: number;
  occupation: string;
  compatibilityScore: number;
  reasoning: string;
  physiologicalMatch: string;
  psychologicalMatch: string;
  dominantTraits: TraitScore[];
  loveFramework: LoveFramework;
  shadowProfile?: ShadowProfile; // New Jungian Shadow Analysis
  imageUrl?: string; // Base64 Data URL
}

// Prediction for Specific Partner (Mode B)
export interface CompatibilityAnalysis {
  mode: 'measure';
  partnerName: string;
  relationshipStatus: RelationshipStatusType;
  successProbability: number; // 0-100
  dynamicAnalysis: string; // Detailed psychological analysis of the dynamic
  potentialChallenges: string;
  loveFramework: LoveFramework; // Reusing the framework for consistent data viz
}

export type PredictionResult = PartnerPrediction | CompatibilityAnalysis;