/**
 * Resume Analysis Agent - Supabase Edge Function
 * 
 * This agent analyzes resumes using Gemini 2.0 Flash and:
 * 1. Generates professional scores (ATS, content, format, impact)
 * 2. Provides detailed feedback (strengths, weaknesses, suggestions)
 * 3. Saves analysis to Supabase for future context
 * 4. Sends professional email report to user's Gmail
 * 
 * Created: Jan 17, 2026
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

// Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Gemini API
const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";

// Cloud Run Email Template API
const EMAIL_TEMPLATE_API = "https://email-template-api-53407187172.us-central1.run.app/resume-analysis";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Types
interface ResumeAnalysisRequest {
  resumeBase64: string;
  mimeType: string;
  userEmail: string;
  userId: string;
  coachId?: string;
  fileName?: string;
}

interface ScoreBreakdown {
  overall: number;
  ats: number;
  content: number;
  format: number;
  impact: number;
}

interface KeywordAnalysis {
  found: string[];
  missing: string[];
  industryRelevance: number;
}

interface ResumeAnalysisResult {
  scores: ScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywordAnalysis: KeywordAnalysis;
  executiveSummary: string;
  careerLevel: string;
  industryFit: string[];
}

// Gmail API Helper (reusing from sales-mailer pattern)
function base64urlEncode(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  let base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createSignedJWT(
  serviceAccountEmail: string,
  privateKey: string,
  userToImpersonate: string,
  scopes: string[]
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccountEmail,
    sub: userToImpersonate,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: exp,
    scope: scopes.join(" "),
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const privateKeyPem = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");

  const privateKeyBuffer = Uint8Array.from(atob(privateKeyPem), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = base64urlEncode(new Uint8Array(signature));
  return `${signatureInput}.${encodedSignature}`;
}

async function getAccessToken(
  serviceAccountEmail: string,
  privateKey: string,
  userToImpersonate: string
): Promise<string> {
  const scopes = ["https://www.googleapis.com/auth/gmail.send"];
  const signedJwt = await createSignedJWT(serviceAccountEmail, privateKey, userToImpersonate, scopes);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

function encodeBase64WithLineBreaks(content: string): string {
  const base64 = btoa(unescape(encodeURIComponent(content)));
  const lines: string[] = [];
  for (let i = 0; i < base64.length; i += 76) {
    lines.push(base64.slice(i, i + 76));
  }
  return lines.join("\r\n");
}

function createEmailMessage(from: string, recipient: string, subject: string, htmlContent: string): string {
  const boundary = `boundary_${Date.now()}`;
  const encodedHtml = encodeBase64WithLineBreaks(htmlContent);
  
  const emailLines = [
    `From: Hushh Career AI <${from}>`,
    `To: ${recipient}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    `Your resume analysis report is ready. Please view in an HTML-capable email client.`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    encodedHtml,
    ``,
    `--${boundary}--`,
  ];

  return emailLines.join("\r\n");
}

async function sendEmailReport(
  recipientEmail: string,
  analysis: ResumeAnalysisResult,
  userName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const serviceAccountEmail = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
    const privateKey = Deno.env.get("GOOGLE_PRIVATE_KEY");
    const senderEmail = Deno.env.get("GMAIL_SENDER_EMAIL") || "ankit@hushh.ai";

    if (!serviceAccountEmail || !privateKey) {
      console.error("Missing Google Service Account credentials");
      return { success: false, error: "Missing email credentials" };
    }

    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

    // Fetch email template from Cloud Run
    console.log(`Fetching resume analysis email template...`);
    
    const templateResponse = await fetch(EMAIL_TEMPLATE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientName: userName,
        analysis: analysis,
      }),
    });

    if (!templateResponse.ok) {
      const errorText = await templateResponse.text();
      console.error(`Failed to fetch email template: ${templateResponse.status} - ${errorText}`);
      return { success: false, error: "Failed to generate email template" };
    }

    const templateData = await templateResponse.json();
    
    if (!templateData.success || !templateData.html) {
      console.error("Invalid template response:", templateData);
      return { success: false, error: "Invalid email template" };
    }

    // Get access token and send email
    const accessToken = await getAccessToken(serviceAccountEmail, formattedPrivateKey, senderEmail);

    const rawMessage = createEmailMessage(
      senderEmail,
      recipientEmail,
      templateData.subject || `🎯 Your Resume Analysis Report is Ready!`,
      templateData.html
    );

    const encodedMessage = base64urlEncode(rawMessage);

    const gmailResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: encodedMessage }),
      }
    );

    if (!gmailResponse.ok) {
      const error = await gmailResponse.text();
      console.error("Gmail API error:", error);
      return { success: false, error: `Gmail API error: ${error}` };
    }

    const result = await gmailResponse.json();
    console.log(`Resume analysis email sent to ${recipientEmail}, message ID:`, result.id);

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Analyze resume using Gemini 2.0 Flash
 */
async function analyzeResumeWithGemini(
  resumeBase64: string,
  mimeType: string
): Promise<ResumeAnalysisResult> {
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const analysisPrompt = `You are an expert resume analyst and career coach with 20+ years of experience in HR, recruiting, and career development.

Analyze this resume thoroughly and provide a comprehensive professional assessment.

IMPORTANT: Return your analysis as a valid JSON object with this EXACT structure:
{
  "scores": {
    "overall": <number 0-100>,
    "ats": <number 0-100 - ATS compatibility score>,
    "content": <number 0-100 - quality of content, achievements, metrics>,
    "format": <number 0-100 - layout, readability, visual appeal>,
    "impact": <number 0-100 - how compelling and memorable>
  },
  "strengths": [
    "<strength 1 - be specific and detailed>",
    "<strength 2>",
    "<strength 3>",
    "<up to 5 strengths>"
  ],
  "weaknesses": [
    "<weakness 1 - be specific and actionable>",
    "<weakness 2>",
    "<weakness 3>",
    "<up to 5 weaknesses>"
  ],
  "suggestions": [
    "<specific actionable improvement 1>",
    "<specific actionable improvement 2>",
    "<specific actionable improvement 3>",
    "<up to 7 suggestions>"
  ],
  "keywordAnalysis": {
    "found": ["<keyword1>", "<keyword2>", "...up to 15 found keywords"],
    "missing": ["<important keyword missing 1>", "<keyword2>", "...up to 10 missing keywords"],
    "industryRelevance": <number 0-100>
  },
  "executiveSummary": "<2-3 sentence executive summary of the resume quality and candidate profile>",
  "careerLevel": "<Entry Level | Junior | Mid-Level | Senior | Lead | Manager | Director | VP | C-Level>",
  "industryFit": ["<industry 1>", "<industry 2>", "<up to 5 industries>"]
}

SCORING GUIDELINES:
- ATS Score: Check for proper formatting, standard section headings, no tables/graphics issues, keyword optimization
- Content Score: Evaluate achievements with metrics, action verbs, relevance, completeness
- Format Score: Assess layout, white space, font consistency, readability, length appropriateness
- Impact Score: How memorable and compelling is this resume? Does it tell a story?

Be honest but constructive. Provide specific, actionable feedback.
Return ONLY the JSON object, no additional text.`;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: resumeBase64,
        },
      },
      { text: analysisPrompt },
    ]);

    const responseText = result.response.text();
    
    // Extract JSON from response (handle potential markdown code blocks)
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      // Try to find raw JSON
      const startIdx = responseText.indexOf('{');
      const endIdx = responseText.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        jsonStr = responseText.slice(startIdx, endIdx + 1);
      }
    }

    const analysis: ResumeAnalysisResult = JSON.parse(jsonStr);
    
    // Validate and sanitize scores
    analysis.scores.overall = Math.min(100, Math.max(0, analysis.scores.overall));
    analysis.scores.ats = Math.min(100, Math.max(0, analysis.scores.ats));
    analysis.scores.content = Math.min(100, Math.max(0, analysis.scores.content));
    analysis.scores.format = Math.min(100, Math.max(0, analysis.scores.format));
    analysis.scores.impact = Math.min(100, Math.max(0, analysis.scores.impact));

    return analysis;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw new Error(`Failed to analyze resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract user name from email
 */
function extractNameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  return localPart
    .replace(/[._-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Main handler
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body: ResumeAnalysisRequest = await req.json();
    const { resumeBase64, mimeType, userEmail, userId, coachId, fileName } = body;

    // Validate required fields
    if (!resumeBase64 || !mimeType || !userEmail || !userId) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields: resumeBase64, mimeType, userEmail, userId" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[Resume Analysis] Starting analysis for ${userEmail} (${userId})`);
    console.log(`[Resume Analysis] File: ${fileName || 'unknown'}, MIME: ${mimeType}`);

    // Create initial database record with 'analyzing' status
    const { data: analysisRecord, error: insertError } = await supabase
      .from('resume_analyses')
      .insert({
        user_id: userId,
        email: userEmail,
        file_name: fileName || 'resume.pdf',
        status: 'analyzing',
        coach_id: coachId || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Resume Analysis] Failed to create DB record:", insertError);
      // Continue anyway - analysis is more important than logging
    }

    const analysisId = analysisRecord?.id;

    // Perform AI analysis
    console.log("[Resume Analysis] Calling Gemini 2.0 Flash...");
    const analysis = await analyzeResumeWithGemini(resumeBase64, mimeType);
    console.log("[Resume Analysis] Analysis complete:", {
      overall: analysis.scores.overall,
      ats: analysis.scores.ats,
    });

    // Update database with results
    if (analysisId) {
      const { error: updateError } = await supabase
        .from('resume_analyses')
        .update({
          score_overall: analysis.scores.overall,
          score_ats: analysis.scores.ats,
          score_content: analysis.scores.content,
          score_format: analysis.scores.format,
          score_impact: analysis.scores.impact,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          suggestions: analysis.suggestions,
          keyword_analysis: analysis.keywordAnalysis,
          executive_summary: analysis.executiveSummary,
          career_level: analysis.careerLevel,
          industry_fit: analysis.industryFit,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', analysisId);

      if (updateError) {
        console.error("[Resume Analysis] Failed to update DB record:", updateError);
      }
    }

    // Send email report
    const userName = extractNameFromEmail(userEmail);
    console.log(`[Resume Analysis] Sending email report to ${userEmail}...`);
    
    const emailResult = await sendEmailReport(userEmail, analysis, userName);
    
    if (emailResult.success) {
      console.log(`[Resume Analysis] Email sent successfully, ID: ${emailResult.messageId}`);
      
      // Update DB with email status
      if (analysisId) {
        await supabase
          .from('resume_analyses')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString(),
            email_message_id: emailResult.messageId,
          })
          .eq('id', analysisId);
      }
    } else {
      console.error("[Resume Analysis] Email failed:", emailResult.error);
    }

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      analysisId: analysisId,
      analysis: analysis,
      emailSent: emailResult.success,
      message: "Resume analysis completed successfully",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Resume Analysis] Error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
