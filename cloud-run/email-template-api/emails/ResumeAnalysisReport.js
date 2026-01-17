// cloud-run/email-template-api/emails/ResumeAnalysisReport.js
// Gmail-safe: NO Tailwind, NO JS. Table-based + inline styles.
// Professional Resume Analysis Report Email Template

const escapeHtml = (val = "") =>
  String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripHtml = (val = "") =>
  String(val)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Get score color based on value
 */
function getScoreColor(score) {
  if (score >= 80) return "#22c55e"; // Green
  if (score >= 60) return "#eab308"; // Yellow
  if (score >= 40) return "#f97316"; // Orange
  return "#ef4444"; // Red
}

/**
 * Get score label based on value
 */
function getScoreLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 50) return "Needs Work";
  return "Needs Improvement";
}

/**
 * Generate score bar HTML
 */
function scoreBar(label, score, description = "") {
  const color = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  
  return `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #f3f4f6;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="font-family:'Google Sans','Roboto','Trebuchet MS',Arial,sans-serif;font-size:14px;font-weight:600;color:#1f2937;">
              ${escapeHtml(label)}
            </td>
            <td align="right" style="font-family:'Google Sans','Roboto','Trebuchet MS',Arial,sans-serif;font-size:16px;font-weight:700;color:${color};">
              ${score}/100
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top:8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="background-color:#f3f4f6;border-radius:4px;height:8px;">
                    <div style="background-color:${color};width:${score}%;height:8px;border-radius:4px;"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${description ? `
          <tr>
            <td colspan="2" style="padding-top:4px;font-family:'Google Sans','Roboto','Trebuchet MS',Arial,sans-serif;font-size:12px;color:#6b7280;">
              ${escapeHtml(description)}
            </td>
          </tr>
          ` : ''}
        </table>
      </td>
    </tr>
  `;
}

/**
 * Generate list items HTML
 */
function listItems(items, icon = "•", color = "#6b7280") {
  if (!Array.isArray(items) || items.length === 0) return "";
  
  return items.map(item => `
    <tr>
      <td valign="top" width="24" style="padding:6px 10px 0 0;font-family:'Google Sans','Roboto','Trebuchet MS',Arial,sans-serif;font-size:16px;line-height:18px;color:${color};">
        ${icon}
      </td>
      <td style="padding:0 0 12px 0;font-family:'Google Sans','Roboto','Trebuchet MS',Arial,sans-serif;font-size:14px;line-height:22px;color:#4b5563;">
        ${escapeHtml(item)}
      </td>
    </tr>
  `).join("");
}

/**
 * Generate keyword badges HTML
 */
function keywordBadges(keywords, bgColor = "#e0f2fe", textColor = "#0369a1") {
  if (!Array.isArray(keywords) || keywords.length === 0) return "";
  
  return keywords.map(keyword => `
    <span style="display:inline-block;padding:4px 10px;margin:3px;background-color:${bgColor};color:${textColor};font-family:'Google Sans','Roboto','Trebuchet MS',Arial,sans-serif;font-size:11px;font-weight:600;border-radius:12px;text-transform:uppercase;letter-spacing:0.5px;">
      ${escapeHtml(keyword)}
    </span>
  `).join("");
}

export function ResumeAnalysisReport(input = {}) {
  const d = input || {};

  // Palette
  const C = {
    primary: "#0088cc",
    bg: "#f5f7f8",
    card: "#ffffff",
    border: "#f3f4f6",
    gray900: "#111827",
    gray800: "#1f2937",
    gray700: "#374151",
    gray600: "#4b5563",
    gray500: "#6b7280",
    gray400: "#9ca3af",
    gray300: "#d1d5db",
    green: "#22c55e",
    red: "#ef4444",
    yellow: "#eab308",
  };

  const fontFamily = "'Google Sans','Roboto','Trebuchet MS',Arial,Helvetica,sans-serif";

  // URLs
  const logoUrl = escapeHtml(d.logoUrl ?? "https://www.hushhtech.com/images/hushh-logo-email.png");
  const siteUrl = escapeHtml(d.siteUrl ?? "https://www.hushhtech.com/");
  const agentUrl = escapeHtml(d.agentUrl ?? "https://www.hushhtech.com/hushh-agent");

  // Recipient
  const recipientName = escapeHtml(d.recipientName ?? "Career Seeker");

  // Analysis data
  const analysis = d.analysis || {};
  const scores = analysis.scores || { overall: 0, ats: 0, content: 0, format: 0, impact: 0 };
  const strengths = analysis.strengths || [];
  const weaknesses = analysis.weaknesses || [];
  const suggestions = analysis.suggestions || [];
  const keywordAnalysis = analysis.keywordAnalysis || { found: [], missing: [], industryRelevance: 0 };
  const executiveSummary = analysis.executiveSummary || "Your resume has been analyzed by our AI career coach.";
  const careerLevel = analysis.careerLevel || "Not determined";
  const industryFit = analysis.industryFit || [];

  // Subject
  const subject = `🎯 Your Resume Analysis Report - Overall Score: ${scores.overall}/100`;

  // HTML
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${subject}</title>
    <!--[if mso]>
    <style type="text/css">
      body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
    </style>
    <![endif]-->
  </head>
  <body style="margin:0;padding:0;background-color:${C.bg};font-family:${fontFamily};-webkit-font-smoothing:antialiased;">
    <div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">
      Your professional resume analysis from Hushh Career AI - Score: ${scores.overall}/100
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.bg};">
      <!-- Card -->
      <tr>
        <td align="center" style="padding:40px 12px 20px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600"
            style="width:600px;max-width:600px;background-color:${C.card};border-radius:16px;overflow:hidden;border:1px solid ${C.border};box-shadow:0 4px 12px rgba(0,0,0,0.05);">

            <!-- Header with Logo -->
            <tr>
              <td align="center" style="padding:40px 24px 24px 24px;background:linear-gradient(135deg,#0088cc 0%,#00d4aa 100%);">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center">
                      <a href="${siteUrl}" target="_blank">
                        <img src="${logoUrl}" alt="Hushh" width="56" height="56" style="display:block;width:56px;height:56px;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,0.2);" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top:16px;">
                      <span style="font-family:${fontFamily};font-size:28px;line-height:32px;color:#ffffff;font-weight:800;letter-spacing:-0.5px;">
                        Resume Analysis Report
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top:8px;">
                      <span style="font-family:${fontFamily};font-size:14px;color:rgba(255,255,255,0.85);">
                        Powered by Hushh Career AI
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Overall Score Hero -->
            <tr>
              <td align="center" style="padding:32px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="padding:24px 48px;background-color:${getScoreColor(scores.overall)}20;border-radius:16px;border:2px solid ${getScoreColor(scores.overall)}40;">
                      <div style="font-family:${fontFamily};font-size:64px;font-weight:900;color:${getScoreColor(scores.overall)};line-height:1;">
                        ${scores.overall}
                      </div>
                      <div style="font-family:${fontFamily};font-size:18px;font-weight:600;color:${C.gray700};margin-top:8px;">
                        Overall Score
                      </div>
                      <div style="font-family:${fontFamily};font-size:14px;font-weight:700;color:${getScoreColor(scores.overall)};margin-top:4px;text-transform:uppercase;letter-spacing:1px;">
                        ${getScoreLabel(scores.overall)}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="padding:0 32px 24px 32px;">
                <div style="font-family:${fontFamily};font-size:20px;font-weight:700;color:${C.gray900};margin-bottom:12px;">
                  Hi ${recipientName}! 👋
                </div>
                <div style="font-family:${fontFamily};font-size:15px;line-height:24px;color:${C.gray600};">
                  ${escapeHtml(executiveSummary)}
                </div>
                ${careerLevel && careerLevel !== "Not determined" ? `
                <div style="margin-top:12px;padding:12px 16px;background-color:#f0f9ff;border-radius:8px;border-left:4px solid ${C.primary};">
                  <span style="font-family:${fontFamily};font-size:13px;color:${C.gray700};">
                    <strong>Detected Career Level:</strong> ${escapeHtml(careerLevel)}
                  </span>
                </div>
                ` : ''}
              </td>
            </tr>

            <!-- Score Breakdown -->
            <tr>
              <td style="padding:0 32px 32px 32px;">
                <div style="font-family:${fontFamily};font-size:18px;font-weight:700;color:${C.gray900};margin-bottom:16px;">
                  📊 Score Breakdown
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fafafa;border-radius:12px;padding:16px;">
                  <tr><td style="padding:8px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${scoreBar("ATS Compatibility", scores.ats, "How well your resume works with Applicant Tracking Systems")}
                      ${scoreBar("Content Quality", scores.content, "Achievements, metrics, and relevant information")}
                      ${scoreBar("Format & Layout", scores.format, "Visual appeal, readability, and structure")}
                      ${scoreBar("Impact & Memorability", scores.impact, "How compelling and unique your resume is")}
                    </table>
                  </td></tr>
                </table>
              </td>
            </tr>

            <!-- Strengths -->
            ${strengths.length > 0 ? `
            <tr>
              <td style="padding:0 32px 24px 32px;">
                <div style="font-family:${fontFamily};font-size:18px;font-weight:700;color:${C.green};margin-bottom:12px;">
                  ✅ Strengths
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  ${listItems(strengths, "✓", C.green)}
                </table>
              </td>
            </tr>
            ` : ''}

            <!-- Weaknesses -->
            ${weaknesses.length > 0 ? `
            <tr>
              <td style="padding:0 32px 24px 32px;">
                <div style="font-family:${fontFamily};font-size:18px;font-weight:700;color:${C.red};margin-bottom:12px;">
                  ⚠️ Areas for Improvement
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  ${listItems(weaknesses, "→", C.red)}
                </table>
              </td>
            </tr>
            ` : ''}

            <!-- Suggestions -->
            ${suggestions.length > 0 ? `
            <tr>
              <td style="padding:0 32px 24px 32px;">
                <div style="font-family:${fontFamily};font-size:18px;font-weight:700;color:${C.primary};margin-bottom:12px;">
                  💡 Actionable Suggestions
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  ${suggestions.map((item, idx) => `
                    <tr>
                      <td valign="top" width="28" style="padding:6px 10px 0 0;font-family:${fontFamily};font-size:12px;font-weight:700;color:#ffffff;background-color:${C.primary};border-radius:50%;text-align:center;width:20px;height:20px;line-height:20px;">
                        ${idx + 1}
                      </td>
                      <td style="padding:0 0 12px 8px;font-family:${fontFamily};font-size:14px;line-height:22px;color:${C.gray600};">
                        ${escapeHtml(item)}
                      </td>
                    </tr>
                  `).join("")}
                </table>
              </td>
            </tr>
            ` : ''}

            <!-- Keyword Analysis -->
            <tr>
              <td style="padding:0 32px 24px 32px;">
                <div style="font-family:${fontFamily};font-size:18px;font-weight:700;color:${C.gray900};margin-bottom:12px;">
                  🔑 Keyword Analysis
                </div>
                
                <div style="margin-bottom:16px;padding:12px 16px;background-color:#f0fdf4;border-radius:8px;">
                  <div style="font-family:${fontFamily};font-size:13px;font-weight:600;color:${C.gray700};margin-bottom:8px;">
                    Industry Relevance: <span style="color:${getScoreColor(keywordAnalysis.industryRelevance)};font-weight:700;">${keywordAnalysis.industryRelevance}%</span>
                  </div>
                </div>
                
                ${keywordAnalysis.found && keywordAnalysis.found.length > 0 ? `
                <div style="margin-bottom:16px;">
                  <div style="font-family:${fontFamily};font-size:13px;font-weight:600;color:${C.green};margin-bottom:8px;">
                    Keywords Found (${keywordAnalysis.found.length}):
                  </div>
                  <div>
                    ${keywordBadges(keywordAnalysis.found, "#dcfce7", "#16a34a")}
                  </div>
                </div>
                ` : ''}
                
                ${keywordAnalysis.missing && keywordAnalysis.missing.length > 0 ? `
                <div>
                  <div style="font-family:${fontFamily};font-size:13px;font-weight:600;color:${C.red};margin-bottom:8px;">
                    Consider Adding (${keywordAnalysis.missing.length}):
                  </div>
                  <div>
                    ${keywordBadges(keywordAnalysis.missing, "#fee2e2", "#dc2626")}
                  </div>
                </div>
                ` : ''}
              </td>
            </tr>

            <!-- Industry Fit -->
            ${industryFit.length > 0 ? `
            <tr>
              <td style="padding:0 32px 24px 32px;">
                <div style="font-family:${fontFamily};font-size:18px;font-weight:700;color:${C.gray900};margin-bottom:12px;">
                  🎯 Best Industry Fit
                </div>
                <div>
                  ${keywordBadges(industryFit, "#e0f2fe", "#0369a1")}
                </div>
              </td>
            </tr>
            ` : ''}

            <!-- CTA -->
            <tr>
              <td align="center" style="padding:24px 32px 40px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" bgcolor="${C.primary}" style="background-color:${C.primary};border-radius:12px;box-shadow:0 10px 24px rgba(0,136,204,0.25);">
                      <a href="${agentUrl}" target="_blank"
                        style="display:inline-block;padding:16px 48px;font-family:${fontFamily};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">
                        Continue with AI Coach →
                      </a>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:16px;font-family:${fontFamily};font-size:12px;color:${C.gray500};">
                  Get personalized guidance to improve your resume
                </div>
              </td>
            </tr>

          </table>

          <!-- Footer -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="400"
            style="width:400px;max-width:400px;margin-top:24px;">
            <tr>
              <td align="center" style="font-family:${fontFamily};font-size:11px;line-height:16px;color:${C.gray400};font-weight:600;">
                © 2026 Hushh Technologies LLC
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:8px;font-family:${fontFamily};font-size:11px;line-height:18px;color:${C.gray400};">
                This analysis was generated by Hushh Career AI.<br/>
                Your data remains private and is not stored or shared.
              </td>
            </tr>
          </table>

        </td>
      </tr>

      <tr><td style="height:20px;line-height:20px;font-size:0;">&nbsp;</td></tr>
    </table>
  </body>
</html>`;

  // Plain text version
  const text = [
    `RESUME ANALYSIS REPORT`,
    `======================`,
    ``,
    `Hi ${stripHtml(recipientName)}!`,
    ``,
    stripHtml(executiveSummary),
    ``,
    `OVERALL SCORE: ${scores.overall}/100 - ${getScoreLabel(scores.overall)}`,
    ``,
    `SCORE BREAKDOWN:`,
    `- ATS Compatibility: ${scores.ats}/100`,
    `- Content Quality: ${scores.content}/100`,
    `- Format & Layout: ${scores.format}/100`,
    `- Impact: ${scores.impact}/100`,
    ``,
    `STRENGTHS:`,
    ...strengths.map(s => `✓ ${stripHtml(s)}`),
    ``,
    `AREAS FOR IMPROVEMENT:`,
    ...weaknesses.map(w => `→ ${stripHtml(w)}`),
    ``,
    `SUGGESTIONS:`,
    ...suggestions.map((s, i) => `${i + 1}. ${stripHtml(s)}`),
    ``,
    `KEYWORD ANALYSIS:`,
    `Industry Relevance: ${keywordAnalysis.industryRelevance}%`,
    `Keywords Found: ${(keywordAnalysis.found || []).join(", ")}`,
    `Consider Adding: ${(keywordAnalysis.missing || []).join(", ")}`,
    ``,
    careerLevel ? `Career Level: ${stripHtml(careerLevel)}` : '',
    industryFit.length > 0 ? `Best Industry Fit: ${industryFit.join(", ")}` : '',
    ``,
    `Continue with AI Coach: ${agentUrl}`,
    ``,
    `© 2026 Hushh Technologies LLC`,
    `Your data remains private and is not stored or shared.`,
  ].filter(Boolean).join("\n");

  return { subject, html, text };
}
