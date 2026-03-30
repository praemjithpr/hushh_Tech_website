// Shadow Investigator Service - Client-side API calls
// Calls the Shadow Investigator Supabase Edge Function for deep profile enrichment

import resources from '../../resources/resources';

// ============ Types ============

export interface ShadowInvestigatorParams {
  name: string;
  email: string;
  contact: string; // Phone number with country code (e.g., "+91 9876543210")
  country?: string;
  age?: number; // Calculated from DOB - improves confidence score
  dateOfBirth?: string; // YYYY-MM-DD format
}

export interface Associate {
  name: string;
  relation: string;
  strength: number;
  category: 'INNER' | 'ORBIT' | 'MEDIA' | 'RIVAL';
}

export interface NewsItem {
  date: string;
  source: string;
  title: string;
  summary: string;
}

export interface ShadowProfile {
  // Core Identity
  age: string;
  ageContext: string;
  gender: string;
  dob: string;
  occupation: string;
  nationality: string;
  address: string;
  contact: string;
  maritalStatus: string;
  children: string[];
  knownFor: string[];
  
  // Confidence & Wealth
  confidence: number;
  netWorthScore: number;
  netWorthContext: string;
  
  // Preferences (15-Point Matrix)
  diet: string;
  foods: string[];
  hobbies: string[];
  brands: string[];
  colors: string[];
  likes: string[];
  dislikes: string[];
  allergies: string[];
  hotelPreferences: string[];
  coffeePreferences: string[];
  drinkPreferences: string[];
  smokePreferences: string;
  chaiPreferences: string[];
  spiciness: string;
  healthInsurance: string[];
  agentPreferences: string[];
  aiPreferences: string[];
  
  // Social Graph
  associates: Associate[];
  socialMedia: { platform: string; url: string }[];
  
  // News & Media
  news: NewsItem[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ShadowInvestigatorResult {
  success: boolean;
  data?: {
    structured: ShadowProfile;
    biography: string;
    sources: GroundingSource[];
  };
  error?: string;
  timestamp?: string;
}

// ============ API Client ============

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

/**
 * Calls the Shadow Investigator API to perform deep profile enrichment
 * Uses Gemini 3 Pro Preview with Google Search grounding
 * 
 * @param params - Name, email, phone (with country code), and optional country
 * @returns ShadowInvestigatorResult with structured profile data
 */
export const invokeShadowInvestigator = async (
  params: ShadowInvestigatorParams
): Promise<ShadowInvestigatorResult> => {
  try {
    if (!SUPABASE_URL) {
      throw new Error('VITE_SUPABASE_URL is not configured');
    }

    console.log('[ShadowInvestigator] Starting deep profile search for:', params.name);
    
    // Get Supabase client for auth token
    const supabase = resources.config.supabaseClient;
    let authToken = '';
    
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      authToken = session?.access_token || '';
    }
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/shadow-investigator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : '',
      },
      body: JSON.stringify({
        name: params.name,
        email: params.email,
        contact: params.contact,
        country: params.country || 'Global',
        age: params.age,
        dateOfBirth: params.dateOfBirth,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ShadowInvestigator] API Error:', errorText);
      return {
        success: false,
        error: `API Error: ${response.status} - ${errorText}`,
      };
    }
    
    const result = await response.json();
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Unknown error from Shadow Investigator',
      };
    }
    
    console.log('[ShadowInvestigator] Profile enrichment complete. Confidence:', result.data?.structured?.confidence);
    
    return {
      success: true,
      data: result.data,
      timestamp: result.timestamp,
    };
    
  } catch (error) {
    console.error('[ShadowInvestigator] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

/**
 * Converts phone country code and number to full contact string
 */
export const formatPhoneContact = (countryCode: string, phoneNumber: string): string => {
  const cleanCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  return `${cleanCode} ${cleanNumber}`;
};

/**
 * Field labels for displaying Shadow Investigator results
 */
export const SHADOW_FIELD_LABELS: Record<string, string> = {
  age: 'Age',
  ageContext: 'Age Analysis',
  gender: 'Gender',
  dob: 'Date of Birth',
  occupation: 'Occupation',
  nationality: 'Nationality',
  address: 'Address',
  maritalStatus: 'Marital Status',
  children: 'Children',
  knownFor: 'Known For',
  confidence: 'Data Confidence',
  netWorthScore: 'Net Worth Score',
  netWorthContext: 'Wealth Analysis',
  diet: 'Dietary Preference',
  foods: 'Favorite Foods',
  hobbies: 'Hobbies & Interests',
  brands: 'Preferred Brands',
  colors: 'Color Preferences',
  likes: 'Likes',
  dislikes: 'Dislikes',
  allergies: 'Allergies',
  hotelPreferences: 'Hotel Preferences',
  coffeePreferences: 'Coffee Order',
  drinkPreferences: 'Drink Preferences',
  smokePreferences: 'Smoking Status',
  chaiPreferences: 'Tea/Chai Preference',
  spiciness: 'Spice Tolerance',
  healthInsurance: 'Health Insurance',
  agentPreferences: 'Agent Preferences',
  aiPreferences: 'AI Sentiment',
  associates: 'Key Associates',
  socialMedia: 'Social Media Profiles',
  news: 'Recent News',
};

/**
 * Categories for organizing Shadow Profile fields
 */
export const SHADOW_FIELD_CATEGORIES = {
  identity: ['age', 'ageContext', 'gender', 'dob', 'occupation', 'nationality', 'address', 'maritalStatus', 'children', 'knownFor'],
  confidence: ['confidence', 'netWorthScore', 'netWorthContext'],
  lifestyle: ['diet', 'foods', 'hobbies', 'brands', 'colors', 'smokePreferences', 'spiciness'],
  preferences: ['likes', 'dislikes', 'allergies', 'hotelPreferences', 'coffeePreferences', 'drinkPreferences', 'chaiPreferences'],
  professional: ['healthInsurance', 'agentPreferences', 'aiPreferences'],
  social: ['associates', 'socialMedia', 'news'],
};

export default invokeShadowInvestigator;
