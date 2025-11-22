import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PartnerPrediction, UserProfile, CompatibilityAnalysis, SpecificPartnerDetails, RelationshipStatusType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Shared Love Framework Schema Part
const loveFrameworkSchema = {
  type: Type.OBJECT,
  properties: {
    intimacyLevel: { type: Type.INTEGER, description: "Score 0-100 based on Sternberg's Triangular Theory." },
    passionLevel: { type: Type.INTEGER, description: "Score 0-100 based on Sternberg's Triangular Theory." },
    commitmentLevel: { type: Type.INTEGER, description: "Score 0-100 based on Sternberg's Triangular Theory." },
    attachmentDynamic: { type: Type.STRING, description: "The psychosocial attachment pairing (e.g. Secure-Anxious)." },
    synastryReport: { type: Type.STRING, description: "Analysis of the dataset correlation." }
  },
  required: ["intimacyLevel", "passionLevel", "commitmentLevel", "attachmentDynamic", "synastryReport"]
};

const shadowProfileSchema = {
  type: Type.OBJECT,
  properties: {
    archetype: { type: Type.STRING, description: "The Shadow Archetype name (e.g., 'The Volatile Muse')" },
    triggerTrait: { type: Type.STRING, description: "The specific trait in the user that attracts this shadow." },
    description: { type: Type.STRING, description: "Description of this dark-mirror relationship." },
    lesson: { type: Type.STRING, description: "The Jungian lesson this shadow partner teaches." }
  },
  required: ["archetype", "triggerTrait", "description", "lesson"]
};

export const predictPartner = async (userProfile: UserProfile): Promise<PartnerPrediction> => {
  
  // 1. Text Generation Schema
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      mode: { type: Type.STRING, enum: ["archetype"] },
      name: { type: Type.STRING },
      gender: { type: Type.STRING, description: "The gender of the predicted partner." },
      estimatedAge: { type: Type.INTEGER },
      occupation: { type: Type.STRING },
      compatibilityScore: { type: Type.INTEGER },
      reasoning: { type: Type.STRING },
      physiologicalMatch: { type: Type.STRING, description: "Detailed physical description of the partner (hair, eyes, style)." },
      psychologicalMatch: { type: Type.STRING },
      dominantTraits: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            trait: { type: Type.STRING },
            score: { type: Type.NUMBER },
            description: { type: Type.STRING }
          }
        }
      },
      loveFramework: loveFrameworkSchema,
      shadowProfile: shadowProfileSchema
    },
    required: ["mode", "name", "gender", "estimatedAge", "occupation", "compatibilityScore", "reasoning", "physiologicalMatch", "psychologicalMatch", "dominantTraits", "loveFramework", "shadowProfile"]
  };

  // Explicit binary gender context
  const genderContext = `The user is seeking a ${userProfile.genderPreference} partner.`;

  const textPrompt = `
    You are AuraMatch, an advanced AI psychologist and mystic. Analyze the user profile to predict their ideal archetypal partner.
    User Profile: ${JSON.stringify(userProfile)}
    ${genderContext}
    
    **Psychological Frameworks to Apply:**
    1. **The Barnum Effect:** Ensure the 'Psychological Match' and 'Reasoning' feel intensely personal to the user's specific data points (Zodiac: ${userProfile.zodiac}, Stress: ${userProfile.stressReaction}), yet universally resonant with the human condition.
    2. **The Halo Effect:** In the 'Physiological Match', describe physical traits that psychologically signal health, intelligence, and kindness to maximize the user's perceived attraction to the archetype.
    3. **Sternberg's Triangular Theory:** Balance Intimacy, Passion, and Commitment in the 'Love Framework'.
    4. **Cognitive Fluency:** Use clear, evocative language that is easy to visualize, reducing cognitive load for the user.
    
    **Task 1: The Ideal Match (Light)**
    Ground the discovery in the user's unique concepts (${userProfile.partnerTraitsPreference}) and specific traits.
    
    **Task 2: The Shadow Match (Dark)**
    Analyze the user's 'Stress Reaction', 'Logic/Emotion' balance, and 'Introvert/Extrovert' scale.
    Identify their 'Shadow Self' based on Jungian Psychology—what they repress, they attract.
    Predict the 'Shadow Partner': the type of person they are subconsciously drawn to due to unhealed trauma or projection.

    Output JSON matching the schema. Set 'mode' to 'archetype'.
  `;

  try {
    // Step 1: Generate the Text Profile with Thinking Mode
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: textPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 32768 } // Max thinking budget for deep psychological analysis
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response received.");
    const prediction = JSON.parse(text) as PartnerPrediction;

    // Step 2: Generate the Image based on the profile
    try {
        const imagePrompt = `
            A hyper-realistic, cinematic portrait of a ${prediction.gender} ${prediction.occupation}.
            Physical appearance: ${prediction.physiologicalMatch}.
            Age: approx ${prediction.estimatedAge}.
            Style: Mystical, ethereal, high fashion, soft lighting, 8k resolution, highly detailed face.
            Mood: Dreamy, romantic, destined.
            Background: Abstract nebula or soft focus aura.
            Focus on the face (Face-ism effect) to evoke intellect and personality.
        `;

        const imageResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [{ text: imagePrompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                }
            }
        });

        // Extract base64 image
        // Added safety checks for candidates and content
        const parts = imageResponse.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    prediction.imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                    break;
                }
            }
        }
    } catch (imageError) {
        console.warn("Image generation failed, proceeding with text only:", imageError);
        // We silently fail image gen and return text only
    }

    return prediction;
  } catch (error) {
    console.error("Archetype prediction failed:", error);
    throw error;
  }
};

export const analyzeCompatibility = async (userProfile: UserProfile, partnerDetails: SpecificPartnerDetails): Promise<CompatibilityAnalysis> => {
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      mode: { type: Type.STRING, enum: ["measure"] },
      partnerName: { type: Type.STRING },
      relationshipStatus: { 
        type: Type.STRING, 
        enum: [
          RelationshipStatusType.MARRIAGE,
          RelationshipStatusType.CASUAL,
          RelationshipStatusType.SITUATIONAL,
          RelationshipStatusType.NEED_BASED,
          RelationshipStatusType.KARMIC
        ],
        description: "The predicted category of the relationship based on the inputs."
      },
      successProbability: { type: Type.INTEGER, description: "0-100 chance of long-term success." },
      dynamicAnalysis: { type: Type.STRING, description: "Detailed psychological analysis of the dynamic." },
      potentialChallenges: { type: Type.STRING, description: "Key friction points." },
      loveFramework: loveFrameworkSchema
    },
    required: ["mode", "partnerName", "relationshipStatus", "successProbability", "dynamicAnalysis", "potentialChallenges", "loveFramework"]
  };

  const textPrompt = `
    You are AuraMatch. Perform a specific compatibility measure (Love Calculator) between the User and a Potential Partner.
    
    User Profile: ${JSON.stringify(userProfile)}
    
    Potential Partner Details:
    Name: ${partnerDetails.name}
    Age: ${partnerDetails.age}
    Gender: ${partnerDetails.gender}
    Religion/Belief System: ${partnerDetails.religion}

    **Task:**
    1. Act as a high-precision Love Calculator algorithm using **Thinking Mode**.
    2. **Psychological Principle - Confirmation Bias vs. Reality:** Users often overestimate compatibility. Your job is to provide an objective, data-driven reality check.
    3. Analyze the Name Vibrations (Name compatibility), Age Gap Dynamics, and Belief System Alignment.
    4. **Psychological Principle - Reciprocity:** The user has invested effort to provide details. Ensure the 'Dynamic Analysis' and 'Potential Challenges' provide high-value, actionable wisdom that feels like a tailored gift, rewarding their investment.
    5. **CRITICAL STEP**: Cross-reference the Partner's details against the User's specific desires:
       - **User's Desired Traits:** "${userProfile.partnerTraitsPreference}"
       - **User's Personal Bio/Interests:** "${userProfile.additionalDetails}"
       
       *Evaluation Rule*: If the partner's profile contradicts the user's stated desires or bio (e.g., user wants "Ambition" but partner details suggest passivity, or user is "Spiritual" and partner is incompatible), significantly lower the Success Probability and reflect this in the analysis. If they align, boost the score.

    6. Cross-reference with psychological compatibility (User's Stress Reaction: ${userProfile.stressReaction} vs Partner's inferred traits).
    7. Categorize the relationship into exactly one of these statuses based on the calculated synergy:
       - **Marriage Material**: High long-term potential, shared values (religion/age aligned), stability.
       - **Casual Connection**: High passion, low commitment, fun but fleeting.
       - **Situationship**: Ambiguous, undefined, emotional but lacks structure.
       - **Need-Based / Transactional**: Based on filling a void (emotional/financial) rather than genuine synergy.
       - **Karmic Lesson**: Intense, volatile, meant for growth but likely to end.
    
    8. Calculate Sternberg's Love components based on the inferred dynamic.

    Output JSON matching the schema. Set 'mode' to 'measure'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: textPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 32768 } // Max thinking budget
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response received.");
    return JSON.parse(text) as CompatibilityAnalysis;
  } catch (error) {
    console.error("Compatibility analysis failed:", error);
    throw error;
  }
};