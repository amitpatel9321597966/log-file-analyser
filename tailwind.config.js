/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',
        heading: '#0F172A',
        body: '#475569',
        muted: '#94A3B8',
        cardBorder: '#E2E8F0',
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          tint: '#EEF2FF',
          dark: '#3730A3',
        },
        sky: {
          DEFAULT: '#0EA5E9',
          tint: '#F0F9FF',
        },
        success: {
          DEFAULT: '#16A34A',
          tint: '#F0FDF4',
        },
        warning: {
          DEFAULT: '#F59E0B',
          tint: '#FFFBEB',
        },
        error: {
          DEFAULT: '#DC2626',
          tint: '#FEF2F2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)',
        'soft-lg': '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 10px 24px -3px rgba(15, 23, 42, 0.08)',
        subtle: '0 1px 3px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}

