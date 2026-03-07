/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Fundrise Design System ──────────────────────────────
        "fr-rust": "#AA4528",  // Brand accent — primary CTAs, highlights
        "fr-rust-dark": "#8C3720", // Hover state for rust
        "fr-navy": "#151513",  // Dark surfaces, footer, secondary CTAs
        "fr-navy-light": "#1E1E1B", // Slightly lighter dark for hover
        "fr-cream": "#faf9f6",  // Page background, section alternates
        "fr-cream-dark": "#EEE9E0", // Subtle card fills on cream bg
        "fr-white": "#FFFFFF",  // Cards, nav background
        "fr-gray-100": "#F2F0EB", // Subtle borders, dividers
        "fr-gray-300": "#C4BFB5", // Muted borders
        "fr-gray-500": "#8C8479", // Secondary text
        "fr-gray-700": "#4A4540", // Body text
        "fr-text": "#151513",  // Primary text (same as navy)

        // ── Legacy iOS tokens (kept for compatibility with Onboarding) ──
        "hushh-blue": "#0066CC",
        "ios-green": "#34C759",
        "ios-yellow": "#FFD60A",
        "ios-red": "#FF3B30",
        "ios-pink": "#FF2D55",
        "ios-gray-bg": "#F5F5F7",
        "ios-dark": "#1D1D1F",
        "hushh-text-muted": "#6B7280",
      },
      fontFamily: {
        // ── Fundrise Typography ──────────────────────────────
        display: ['"Ivar Headline"', '"Source Sans Pro"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'], // Headings
        serif: ['"Ivar Headline"', '"Source Sans Pro"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'], // Headings alt
        sans: ['"Source Sans Pro"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'], // Body
        // Legacy
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      maxWidth: {
        'container': '1200px',
      },
      spacing: {
        'section': '96px',
        'section-sm': '64px',
      },
      boxShadow: {
        'soft': '0 8px 30px -4px rgba(0, 0, 0, 0.04)',
        'card': '0 2px 12px rgba(21, 21, 19, 0.08)',
        'nav': '0 1px 0 0 rgba(21, 21, 19, 0.08)',
      },
      letterSpacing: {
        'widest-xl': '0.2em',
        'caps': '0.06em',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fadeIn': 'fadeIn 0.3s ease-out',
        'scaleIn': 'scaleIn 0.4s ease-out',
        'slideDown': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
