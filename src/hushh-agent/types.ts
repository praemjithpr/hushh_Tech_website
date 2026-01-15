
export type VoiceName = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export interface FacePoints {
  eyes: { x: number; y: number }[];
  mouth: { x: number; y: number };
}

export interface Coach {
  id: string;
  name: string;
  role: string;
  description: string;
  gender: 'female' | 'male';
  avatarUrl: string;
  voiceName: VoiceName;
  color: string;
  expertise: string[];
  systemInstruction: string;
  facePoints: FacePoints;
  suggestions: string[];
  category: 'biological' | 'automation' | 'dating' | 'career';
}

export interface ResumeAnalysis {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  missingKeywords: string[];
}

export interface SessionState {
  isActive: boolean;
  isConnecting: boolean;
  error: string | null;
  inputTranscription: string;
  outputTranscription: string;
  isModelSpeaking: boolean;
  resumeAnalysis?: ResumeAnalysis;
}

export interface TranscriptionEntry {
  role: 'user' | 'coach';
  text: string;
  timestamp: number;
}
