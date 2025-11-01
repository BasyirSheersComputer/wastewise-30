/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Color - Teal (Professional, trustworthy)
        primary: {
          50: '#E6F7F7',
          100: '#CCF0F0',
          200: '#99E0E0',
          300: '#66D1D1',
          400: '#33C1C1',
          500: '#00A7A7', // Main
          600: '#008686',
          700: '#007878', // Dark/Hover
          800: '#005959',
          900: '#003B3B',
        },
        // CTA Orange (High-converting action color)
        cta: {
          400: '#FF8557',
          500: '#FF6B35', // Main
          600: '#E55A2B', // Hover
          700: '#CC4F24', // Active
          800: '#B34420',
        },
        // Success Green (Positive metrics, savings)
        success: {
          400: '#3DAF5C',
          500: '#2D9F4B', // Main
          600: '#258F42',
          700: '#1E7F39',
        },
        // Neutral Grays (Clean, modern)
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373', // Tertiary text
          600: '#525252', // Secondary text
          700: '#404040',
          800: '#262626',
          900: '#171717', // Primary text
        },
        // Semantic colors
        background: '#FFFFFF',
        'text-primary': '#171717',
        'text-secondary': '#525252',
        'text-tertiary': '#737373',
        border: '#E5E5E5',
        error: '#DC2626',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1.1', fontWeight: '700' }], // 72px
        'headline': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],    // 48px
        'title': ['2rem', { lineHeight: '1.25', fontWeight: '700' }],      // 32px
        'subtitle': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],  // 24px
        'body-lg': ['1.125rem', { lineHeight: '1.5', fontWeight: '400' }], // 18px
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],        // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }], // 14px
      },
      spacing: {
        'section': '5rem',     // 80px - Standard section padding
        'hero-top': '3rem',    // 48px - Hero top padding
        'hero-bottom': '6rem', // 96px - Hero bottom padding
        'faq-top': '3rem',     // 48px - FAQ top padding
        'faq-bottom': '1rem',  // 16px - FAQ bottom padding
      },
      borderRadius: {
        'button': '0.5rem',  // 8px
        'card': '0.75rem',   // 12px
        'card-lg': '1rem',   // 16px
        'modal': '1.5rem',   // 24px
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'elevated': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'cta': '0 4px 12px rgba(255, 107, 53, 0.3)',
      },
      maxWidth: {
        'content': '1200px',
      },
    },
  },
  plugins: [],
}