/**
 * Hushh Agent Mailer Dashboard
 * Professional Mobile-First Design with Sticky Footer like Onboarding
 * 
 * Flow: Dashboard → Supabase Edge Function → Cloud Run → Gmail API
 * Route: /hushh-agent-mailer (protected - requires authentication)
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast, Spinner, Badge } from "@chakra-ui/react";
import config from "../../resources/config/config";
import { useFooterVisibility } from "../../utils/useFooterVisibility";

// Supabase client
const supabase = config.supabaseClient;

// Types
interface SendResult {
  email: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

interface EmailLog {
  id: string;
  sender_email: string;
  sender_name: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  status: string;
  gmail_message_id: string | null;
  error_message: string | null;
  created_at: string;
}

interface SendSummary {
  total: number;
  sent: number;
  failed: number;
}

interface SendResponse {
  success: boolean;
  summary: SendSummary;
  results: SendResult[];
  error?: string;
}

// Supabase Edge Function URL
const SALES_MAILER_URL = `${config.SUPABASE_URL}/functions/v1/sales-mailer`;

// Sender options
const SENDER_OPTIONS = [
  { email: "manish@hushh.ai", name: "Manish Sainani" },
  { email: "ankit@hushh.ai", name: "Ankit Kumar Singh" },
  { email: "neelesh@hushh.ai", name: "Neelesh Meena" },
];

// Back arrow icon
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

// Help icon
const HelpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Material Symbols Component
const MaterialIcon: React.FC<{ name: string; filled?: boolean; className?: string }> = ({ 
  name, 
  filled = false, 
  className = "" 
}) => (
  <span 
    className={`material-symbols-outlined ${className}`}
    style={{ 
      fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500` 
    }}
  >
    {name}
  </span>
);

const HushhAgentMailerPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const isFooterVisible = useFooterVisibility();
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // View state
  const [activeView, setActiveView] = useState<"compose" | "history">("compose");
  
  // Form state
  const [fromEmail, setFromEmail] = useState(SENDER_OPTIONS[0].email);
  const [toEmails, setToEmails] = useState("");
  
  // Template customization
  const [badgeText, setBadgeText] = useState("Hushh Fund A");
  const [subtitle, setSubtitle] = useState("ADFW Follow-up");
  const [introHighlight, setIntroHighlight] = useState("long-duration capital");
  const [ctaText, setCtaText] = useState("Connect");
  const [ctaUrl, setCtaUrl] = useState("https://calendly.com/hushh/office-hours-1-hour-focused-deep-dives");
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<SendResponse | null>(null);
  
  // Logs state
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Parse recipient count
  const recipientCount = toEmails
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.includes("@")).length;

  // Fetch email logs
  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      if (!supabase) {
        throw new Error("Supabase client is not configured");
      }

      const { data, error } = await supabase
        .from('agent_mailer_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching logs:', error);
        return;
      }
      setEmailLogs(data || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Send emails
  const handleSend = async () => {
    if (recipientCount === 0) {
      toast({
        title: "No Recipients",
        description: "Please enter at least one recipient email.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      if (!config.SUPABASE_ANON_KEY) {
        throw new Error("VITE_SUPABASE_ANON_KEY is not configured");
      }

      const response = await fetch(SALES_MAILER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmails,
          salesData: {
            badgeText,
            subtitle,
            introHighlight,
            ctaText,
            ctaUrl,
          },
        }),
      });

      const data: SendResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send emails");
      }

      setResults(data);

      toast({
        title: "Emails Sent",
        description: `${data.summary.sent} of ${data.summary.total} emails sent successfully.`,
        status: data.summary.failed > 0 ? "warning" : "success",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error sending emails:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send emails",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Add Google Material Symbols font */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
      
      <div 
        className="bg-slate-50 min-h-screen"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <div className="relative flex min-h-screen w-full flex-col bg-white max-w-[500px] mx-auto shadow-xl overflow-hidden border-x border-slate-100">
          
          {/* Sticky Header - Like Investor Profile */}
          <header className="flex items-center justify-between px-4 pt-4 pb-3 bg-white sticky top-0 z-10 border-b border-slate-100">
            <button 
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex size-10 shrink-0 items-center justify-center text-slate-900 rounded-full hover:bg-slate-50 transition-colors"
            >
              <BackIcon />
            </button>
            <h1 className="text-base font-semibold text-slate-900">
              Hushh Agent Mailer
            </h1>
            <button 
              className="flex size-10 shrink-0 items-center justify-center text-slate-900 rounded-full hover:bg-slate-50 transition-colors"
              aria-label="Help"
            >
              <HelpIcon />
            </button>
          </header>

          {/* Main Content - with padding for sticky footer */}
          <main className="flex-1 flex flex-col px-6 pb-52">
            {/* Badges & Description */}
            <div className="flex flex-col items-center text-center mt-6 mb-6 space-y-4">
              <div className="flex space-x-2">
                <span className="px-4 py-1.5 rounded-full bg-[#2b8cee] text-white text-[11px] font-bold tracking-wider uppercase shadow-sm">
                  Agentic
                </span>
                <span className="px-4 py-1.5 rounded-full bg-[#2b8cee] text-white text-[11px] font-bold tracking-wider uppercase shadow-sm">
                  Fund A
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[300px]">
                Send personalized bulk emails to investors using AI-powered templates.
              </p>
            </div>

            {/* Compose/History Toggle */}
            <div className="flex gap-3 mb-6">
              <button 
                onClick={() => setActiveView("compose")}
                className={`flex-1 rounded-xl py-3 px-4 flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-sm ${
                  activeView === "compose" 
                    ? "bg-[#2b8cee] text-white" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <MaterialIcon name="edit_square" className="text-[20px]" />
                <span className="text-sm font-bold">Compose</span>
              </button>
              <button 
                onClick={() => {
                  setActiveView("history");
                  fetchLogs();
                }}
                className={`flex-1 rounded-xl py-3 px-4 flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-sm ${
                  activeView === "history" 
                    ? "bg-[#2b8cee] text-white" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <MaterialIcon name="history" className="text-[20px]" />
                <span className="text-sm font-semibold">History</span>
              </button>
            </div>

            {activeView === "compose" ? (
              <div className="flex flex-col gap-5 w-full">
                {/* Sender Account Section */}
                <div>
                  <div className="flex justify-between items-center mb-2 px-0.5">
                    <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">
                      Sender Account
                    </label>
                    <div className="flex items-center space-x-1 text-slate-500">
                      <MaterialIcon name="check_circle" filled className="text-[14px] text-green-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wide">Authenticated</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <MaterialIcon name="account_circle" className="text-slate-400 text-[20px]" />
                    </div>
                    <select 
                      className="w-full appearance-none bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl py-4 pl-11 pr-10 text-sm font-medium outline-none transition-all cursor-pointer border-2 border-transparent focus:border-[#2b8cee]"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                    >
                      {SENDER_OPTIONS.map((sender) => (
                        <option key={sender.email} value={sender.email}>
                          {sender.name} ({sender.email})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                      <MaterialIcon name="expand_more" className="text-[20px]" />
                    </div>
                  </div>
                  <p className="mt-1.5 text-[10px] text-slate-400 px-0.5">Via Gmail Domain-Wide Delegation</p>
                </div>

                {/* Recipients Section */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-2 px-0.5">
                    Recipients
                  </label>
                  <div className="relative bg-slate-100 rounded-2xl hover:bg-slate-50 transition-colors border-2 border-transparent focus-within:border-[#2b8cee]">
                    <textarea 
                      className="w-full h-36 bg-transparent rounded-2xl p-4 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none resize-none border-none"
                      placeholder="investor1@company.com, investor2@fund.com"
                      value={toEmails}
                      onChange={(e) => setToEmails(e.target.value)}
                    />
                    <div className="absolute bottom-3 right-3 z-10">
                      <button className="flex items-center space-x-1.5 bg-[#2b8cee] text-white px-3 py-2 rounded-xl shadow-lg transition-all active:scale-95 hover:bg-blue-600">
                        <MaterialIcon name="auto_awesome" filled className="text-[14px]" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">AI Parse</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Template Customization */}
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full bg-slate-100 hover:bg-slate-200 rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-slate-700 shadow-sm group-hover:scale-105 transition-transform">
                      <MaterialIcon name="tune" className="text-[22px]" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-slate-900">Template Customization</h3>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">Customize email content</p>
                    </div>
                  </div>
                  <MaterialIcon 
                    name="chevron_right" 
                    className={`text-slate-400 group-hover:text-slate-600 transition-all ${showAdvanced ? 'rotate-90' : ''}`} 
                  />
                </button>

                {/* Advanced Options (Collapsible) */}
                {showAdvanced && (
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-4 border border-slate-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Badge Text</label>
                        <input
                          type="text"
                          value={badgeText}
                          onChange={(e) => setBadgeText(e.target.value)}
                          className="w-full bg-white rounded-xl px-3 py-2.5 text-sm border border-slate-200 outline-none focus:border-[#2b8cee]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Subtitle</label>
                        <input
                          type="text"
                          value={subtitle}
                          onChange={(e) => setSubtitle(e.target.value)}
                          className="w-full bg-white rounded-xl px-3 py-2.5 text-sm border border-slate-200 outline-none focus:border-[#2b8cee]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Intro Highlight</label>
                      <input
                        type="text"
                        value={introHighlight}
                        onChange={(e) => setIntroHighlight(e.target.value)}
                        className="w-full bg-white rounded-xl px-3 py-2.5 text-sm border border-slate-200 outline-none focus:border-[#2b8cee]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">CTA Text</label>
                        <input
                          type="text"
                          value={ctaText}
                          onChange={(e) => setCtaText(e.target.value)}
                          className="w-full bg-white rounded-xl px-3 py-2.5 text-sm border border-slate-200 outline-none focus:border-[#2b8cee]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">CTA URL</label>
                        <input
                          type="text"
                          value={ctaUrl}
                          onChange={(e) => setCtaUrl(e.target.value)}
                          className="w-full bg-white rounded-xl px-3 py-2.5 text-sm border border-slate-200 outline-none focus:border-[#2b8cee]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Results */}
                {results && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-slate-900">Results</span>
                      <div className="flex gap-2">
                        <Badge colorScheme="green" px={2} py={0.5}>✓ Sent: {results.summary.sent}</Badge>
                        {results.summary.failed > 0 && (
                          <Badge colorScheme="red" px={2} py={0.5}>✗ Failed: {results.summary.failed}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {results.results.map((result, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 truncate max-w-[60%]">{result.email}</span>
                          <Badge colorScheme={result.success ? "green" : "red"} size="sm">
                            {result.success ? "Sent" : "Failed"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* History View */
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-900">Email Logs</span>
                  <button
                    onClick={fetchLogs}
                    disabled={isLoadingLogs}
                    className="text-sm text-[#2b8cee] font-medium flex items-center gap-1"
                  >
                    <MaterialIcon name="refresh" className="text-[16px]" />
                    Refresh
                  </button>
                </div>
                
                {isLoadingLogs ? (
                  <div className="flex justify-center py-8">
                    <Spinner color="#2b8cee" />
                  </div>
                ) : emailLogs.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    No emails sent yet. Send your first email!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {emailLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="bg-slate-100 rounded-2xl p-4 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {log.recipient_name || log.recipient_email}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {new Date(log.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge colorScheme={log.status === 'SENT' ? 'green' : 'red'}>
                          {log.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Fixed Footer - Like Onboarding - Above MobileBottomNav - Hidden when main footer is visible */}
          {!isFooterVisible && activeView === "compose" && (
            <div className="fixed bottom-20 z-20 w-full max-w-[500px] bg-white border-t border-slate-100 p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" data-mailer-footer>
              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={isLoading || recipientCount === 0}
                className={`
                  w-full flex items-center justify-center h-14 rounded-full font-bold text-base tracking-wide transition-all mb-3
                  ${recipientCount > 0 && !isLoading
                    ? 'bg-[#2b8cee] hover:bg-blue-600 active:scale-[0.98] text-white cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                {isLoading ? (
                  <Spinner size="sm" color="white" />
                ) : (
                  recipientCount === 0 
                    ? "Enter Recipients to Send" 
                    : `Send to ${recipientCount} Recipient${recipientCount !== 1 ? 's' : ''}`
                )}
              </button>
              
              {/* Footer Note */}
              <div className="flex items-center justify-center space-x-2 text-slate-400">
                <MaterialIcon name="lock" className="text-[14px]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Secure Agentic Workflow
                </span>
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-1">© 2025 Hushh.ai</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HushhAgentMailerPage;
