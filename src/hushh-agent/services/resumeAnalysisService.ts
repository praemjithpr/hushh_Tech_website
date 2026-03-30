/**
 * Resume Analysis Service
 * 
 * Frontend service to trigger resume analysis after upload.
 * Calls the Supabase Edge Function which:
 * 1. Uses Gemini 2.0 Flash to analyze the resume
 * 2. Saves results to Supabase
 * 3. Sends email report to user
 * 
 * Created: Jan 17, 2026
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const RESUME_ANALYSIS_ENDPOINT = `${SUPABASE_URL}/functions/v1/resume-analysis-agent`;

export interface ResumeAnalysisScores {
  overall: number;
  ats: number;
  content: number;
  format: number;
  impact: number;
}

export interface KeywordAnalysis {
  found: string[];
  missing: string[];
  industryRelevance: number;
}

export interface ResumeAnalysisResult {
  scores: ResumeAnalysisScores;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywordAnalysis: KeywordAnalysis;
  executiveSummary: string;
  careerLevel: string;
  industryFit: string[];
}

export interface ResumeAnalysisResponse {
  success: boolean;
  analysisId?: string;
  analysis?: ResumeAnalysisResult;
  emailSent?: boolean;
  message?: string;
  error?: string;
}

export interface TriggerAnalysisParams {
  resumeBase64: string;
  mimeType: string;
  userEmail: string;
  userId: string;
  coachId?: string;
  fileName?: string;
}

/**
 * Trigger resume analysis agent
 * 
 * This is called AFTER the resume is successfully uploaded to the Live session.
 * The analysis runs in the background and sends an email when complete.
 */
export async function triggerResumeAnalysis(
  params: TriggerAnalysisParams
): Promise<ResumeAnalysisResponse> {
  try {
    if (!SUPABASE_URL) {
      throw new Error('VITE_SUPABASE_URL is not configured');
    }

    console.log('[ResumeAnalysis] Triggering analysis for:', params.userEmail);
    
    const response = await fetch(RESUME_ANALYSIS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeBase64: params.resumeBase64,
        mimeType: params.mimeType,
        userEmail: params.userEmail,
        userId: params.userId,
        coachId: params.coachId,
        fileName: params.fileName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('[ResumeAnalysis] API error:', errorData);
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}`,
      };
    }

    const data: ResumeAnalysisResponse = await response.json();
    console.log('[ResumeAnalysis] Analysis complete:', {
      analysisId: data.analysisId,
      overallScore: data.analysis?.scores?.overall,
      emailSent: data.emailSent,
    });

    return data;
  } catch (error) {
    console.error('[ResumeAnalysis] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fire and forget - trigger analysis without waiting for result
 * 
 * Use this when you want to trigger analysis in the background
 * without blocking the main UI flow.
 */
export function triggerResumeAnalysisAsync(params: TriggerAnalysisParams): void {
  // Don't await - let it run in background
  triggerResumeAnalysis(params)
    .then((result) => {
      if (result.success) {
        console.log('[ResumeAnalysis] Background analysis completed successfully');
      } else {
        console.error('[ResumeAnalysis] Background analysis failed:', result.error);
      }
    })
    .catch((error) => {
      console.error('[ResumeAnalysis] Background analysis error:', error);
    });
}

/**
 * Get score color for UI display
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'; // Green
  if (score >= 60) return '#eab308'; // Yellow
  if (score >= 40) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

/**
 * Get score label for UI display
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Needs Work';
  return 'Needs Improvement';
}
