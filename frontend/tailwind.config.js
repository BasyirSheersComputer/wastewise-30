/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './components/**/*.{js,ts,jsx,tsx}', './services/**/*.{js,ts,jsx,tsx}', './*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        primary: '#3A6DF0',
        'primary-hover': '#2F57C7',
        secondary: '#F5F7FB',
        background: '#F9FAFC',
        surface: 'rgba(255, 255, 255, 0.6)',
        'text-primary': '#1A1A1A',
        'text-secondary': '#6B7280',
        border: 'rgba(0, 0, 0, 0.05)',
        accent: '#5A8DEE',
        success: '#28C76F',
        warning: '#FF9F43',
        error: '#EA5455',
        info: '#00CFE8',
        disabled: '#E5E7EB',
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'md': '16px',
        'lg': '20px',
        'xl': '24px',
        'xxl': '32px',
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '20px',
        'full': '9999px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '40px',
      },
      boxShadow: {
        'card': '0 8px 24px rgba(0, 0, 0, 0.05)',
        'focus': '0 0 0 3px rgba(58, 109, 240, 0.4)',
        'button': '0 2px 6px rgba(58, 109, 240, 0.15)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      transitionProperty: {
        'default': 'all',
      },
      transitionDuration: {
        'default': '300ms',
        'fast': '200ms',
      },
      transitionTimingFunction: {
        'default': 'ease',
      },
    },
  },
  plugins: [],
};