# Kai - Financial Intelligence Agent

A real-time AI-powered financial intelligence assistant built with Gemini 2.0 Flash Live API, featuring voice/video interaction and multi-agent analysis.

## Hardened Features

- **Real-time Voice/Video AI**: Powered by Gemini 2.0 Flash Live API.
- **Conflict Resolution Protocol**: Advanced **Round 3 debate** logic to resolve deadlocks between Fundamental, Sentiment, and Valuation agents.
- **Performance Caching**: Integrated `CacheService` with TTL support to minimize redundant API calls and improve dashboard responsiveness.
- **Multi-Agent Architecture**: Three specialized AI agents (Fundamental, Sentiment, Valuation) that debate in real-time.
- **User Personas**: Tailored responses for Everyday Investors, Active Traders, and Professional Advisors.
- **Live Market Data**: Google Search integration for up-to-the-minute market intelligence.
- **Decision Cards**: Visual financial recommendations with confidence scores and agent-specific insights.
- **Audio-Reactive Avatar**: 3D animated avatar with optimized, composited animations for zero-jank performance.

## Tech Stack

- **AI**: Gemini 2.0 Flash Live API (`@google/genai`)
- **Audio**: Web Audio API (16kHz input, 24kHz output PCM)
- **Video**: MediaStream API for camera capture
- **UI**: React 18+ + TypeScript + Tailwind CSS
- **Performance**: Lightweight client-side caching + GPU-accelerated animations

## Project Structure

```
src/kai/
├── components/
│   ├── ControlPanel.tsx      # Connection controls UI
│   ├── DecisionCard.tsx      # Financial decision card display
│   ├── KaiAvatar.tsx         # 3D animated avatar
│   └── OnboardingScreen.tsx  # Persona selection screen
├── services/
│   └── geminiService.ts      # Gemini 2.0 Flash Live API integration
├── utils/
│   └── audioUtils.ts         # PCM audio processing utilities
├── types.ts                   # Type definitions
├── App.tsx                    # Main application component
└── README.md                  # This file
```

## Configuration

### Environment Variables

Add these to your `.env.local`:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Usage

Navigate to `/kai` in your browser to access the Financial Intelligence Agent.

### User Flow

1. **Identity Calibration**: Select your investor persona.
2. **Initiate Connection**: Click "INITIATE KAI" to start the session.
3. **Interact**: Speak naturally about stocks, markets, or financial topics.
4. **Decision Cards**: Receive visual recommendations with multi-agent insights.

## Development

```bash
# Start development server
npm run dev

# Run Security Audit (Unix/Bash)
npm run security:audit

# Run Security Audit (Windows/PowerShell)
npm run security:audit:win
```

## Security Considerations

- API key is loaded from `.env.local` (ensure it is git-ignored).
- Camera/microphone access requires user permission.
- **Current Tree Audit**: Mandatory `npm run security:audit:win` before any PR.
- **Historical Cleanup**: The repo requires a history rewrite for historical secret exposures before public release.

## License

Part of the Hushh Technologies platform.
