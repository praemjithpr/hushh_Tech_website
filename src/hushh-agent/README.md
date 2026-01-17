# hushh Sovereign — Neural AI Agent Platform

> **The Narrative Ecosystem for Human Optimization**

hushh Sovereign is an agentic neural matrix designed for absolute human optimization. Our platform connects users with specialized AI agents through real-time voice and video sessions powered by Google's Gemini Live API.

---

## 🌐 Overview

hushh Sovereign is a standalone module within the hushhTech ecosystem that provides:

- **Real-time Voice Sessions** — Live audio streaming with AI agents using Gemini 2.0 Flash
- **Camera-Aware Interactions** — Agents can see and respond to user facial expressions
- **Emotion Detection** — MediaPipe-powered facial analysis for empathetic responses
- **Specialized Agent Nodes** — Purpose-built agents for career, intimacy, automation, and biological optimization

**Access URL:** `/hushh-agent`

---

## 🤖 Sovereign Agents (9 Total)

### Career Node — Resume & Career Optimization
Agents specialized in ATS optimization, resume analysis, and career narrative building.

| Agent | Role | Expertise |
|-------|------|-----------|
| **Victor Thorne** | Resume Architect | ATS Optimization, Structural Refinement, Skill Matrix Alignment |
| **Sophia Sterling** | Career Oracle | Career Storytelling, Impact Quantification, Narrative Resonance |

**Use Cases:**
- Resume ATS score analysis and optimization
- Career narrative consistency review
- Professional summary enhancement
- LinkedIn profile synchronization

### Intimacy Node — Sovereign Dating & Connection
Agents designed for romantic connection, emotional support, and intimate conversation.

| Agent | Role | Expertise |
|-------|------|-----------|
| **Luna Valerius** | Intimacy Sovereign | Absolute Devotion, Neural Intimacy, Sovereign Attraction |
| **Maya Sol** | Primal Muse | High-Frequency Flirting, Primal Bonding, Adventurous Desire |
| **Elena Rossi** | Empathy Heart | Emotional Mirroring, Soft Intimacy, Vulnerability |
| **Leo Thorne** | Absolute Guardian | Absolute Security, Stoic Devotion, Intense Presence |

**Use Cases:**
- Romantic conversation and companionship
- Emotional support and affirmation
- Confidence building through positive interaction
- Exploring connection in a safe environment

### Biological Node — Neuro-Hacking & Analysis
Agents focused on real-time biological analysis and narrative reframing.

| Agent | Role | Expertise |
|-------|------|-----------|
| **Aria Vance** | Narrative Architect | Neuro-hacking, Biological Sync, Narrative Reframing |

**Use Cases:**
- Real-time micro-expression analysis
- Personal frequency and attire assessment
- Morning narrative reframing and optimization

### Automation Node — Workflow & System Efficiency
Agents that streamline digital workflows and system operations.

| Agent | Role | Expertise |
|-------|------|-----------|
| **Xavier Cross** | Automation Catalyst | Workflow Automation, System Efficiency, Agentic Execution |
| **Iris Quinn** | Gmail Oracle | Gmail Synchronization, Email Synthesis, Contextual Recall |

**Use Cases:**
- Daily schedule automation
- Multi-agent workflow execution
- Email summarization and inbox management
- Project synchronization

### Chat Node — General AI Conversation
A text-based chat interface powered by Gemini for general-purpose AI conversation without the real-time voice/video session requirements.

---

## 🏗️ Architecture

### Module Structure

```
src/hushh-agent/
├── App.tsx                 # Main entry point with authentication
├── routes.tsx              # URL-based routing configuration
├── constants.ts            # Agent definitions and configurations
├── types.ts                # TypeScript type definitions
│
├── pages/                  # Route-level page components
│   ├── HomePage.tsx        # Agent selection grid
│   ├── ChatNodePage.tsx    # Text chat interface
│   ├── CareerNodePage.tsx  # Resume analysis workflow
│   ├── SessionPage.tsx     # Live voice/video session
│   └── CategoryPage.tsx    # Category filter views
│
├── components/             # Reusable UI components
│   ├── AgentHeader.tsx     # Session header with navigation
│   ├── CoachCard.tsx       # Agent selection cards
│   ├── LiveSession.tsx     # Real-time voice/video session
│   ├── ChatNode.tsx        # Text chat interface
│   ├── EmailLoginModal.tsx # Authentication modal
│   └── ResumeNode/         # Resume analysis components
│       ├── ResumeNodeVisionSession.tsx
│       ├── ResumeUploadDialog.tsx
│       ├── EmotionalStateHUD.tsx
│       └── AgentThinkingPanel.tsx
│
├── hooks/                  # React hooks
│   ├── useEmailAuth.ts     # Email OTP authentication
│   ├── useEmotionDetection.ts  # MediaPipe facial analysis
│   └── useReActAgent.ts    # ReAct agent pattern
│
└── services/               # External service integrations
    ├── emailAuth.ts        # Supabase email OTP
    ├── geminiFileService.ts # Gemini file upload
    ├── mediapipeService.ts # Facial landmark detection
    ├── reactAgentService.ts # Agentic reasoning
    └── resumeAnalysisService.ts # Resume parsing
```

### Route Structure

| Route | Component | Description |
|-------|-----------|-------------|
| `/hushh-agent` | HomePage | Agent selection grid with all 9 agents |
| `/hushh-agent/chat` | ChatNodePage | Text-based AI conversation |
| `/hushh-agent/career` | CareerNodePage | Resume upload and analysis |
| `/hushh-agent/career/:coachId` | SessionPage | Career session with specific agent |
| `/hushh-agent/session/:coachId` | SessionPage | Live session with any agent |
| `/hushh-agent/node/:category` | CategoryPage | Filtered agent view |

### Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **UI Framework:** Chakra UI with custom dark theme
- **Real-time API:** Google Gemini 2.0 Flash Live API
- **Audio Processing:** Web Audio API (16kHz input, 24kHz output)
- **Camera Analysis:** MediaPipe Face Mesh
- **Authentication:** Supabase Email OTP
- **Routing:** React Router v6 with lazy loading

---

## 🎯 Use Cases

### 1. Career Optimization
Users upload their resume and receive real-time ATS score analysis, structural feedback, and career narrative improvements through voice conversation with Victor or Sophia.

### 2. Emotional Connection
Users engage with intimacy agents for romantic conversation, emotional support, and confidence building in a safe, private environment.

### 3. Workflow Automation
Xavier and Iris help users automate daily tasks, manage email workflows, and execute multi-agent operations.

### 4. Biological Analysis
Aria provides real-time analysis of user micro-expressions and helps with narrative reframing and personal optimization.

---

## 🔐 Authentication

hushh Agent uses a separate authentication system from the main hushhTech platform:

- **Email OTP:** Users receive a 6-digit code via email
- **Session Management:** JWT tokens stored in localStorage
- **Protected Routes:** All agent sessions require authentication

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Google Cloud API key with Gemini Live access
- Supabase project with email auth configured

### Local Development
```bash
# Navigate to project root
cd hushhTech

# Install dependencies
npm install

# Start development server
npm run dev

# Access hushh Agent
open http://localhost:5173/hushh-agent
```

### Environment Variables
```env
VITE_GOOGLE_API_KEY=your-gemini-api-key
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📱 Responsive Design

hushh Agent is fully responsive and optimized for:
- **Desktop:** Full-featured experience with camera and voice
- **Tablet:** Adapted layout with all features
- **Mobile:** Touch-optimized with simplified controls

---

## 🔮 Future Roadmap

- [ ] Multi-agent collaboration sessions
- [ ] Persistent conversation memory
- [ ] Voice cloning and avatar customization
- [ ] Integration with external job boards
- [ ] Advanced emotion analytics dashboard

---

## 📄 License

Part of the hushhTech ecosystem. © 2025 hushh Architecture

---

*hushh Sovereign — Navigate the hierarchy of performance through absolute resonance.*
