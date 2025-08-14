/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            lineHeight: '1.75',
            '[class~="lead"]': {
              fontSize: '1.25rem',
              lineHeight: '1.6',
            },
            a: {
              color: '#2563eb',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            'h1, h2, h3, h4': {
              color: '#111827',
              fontWeight: '700',
            },
            code: {
              backgroundColor: '#f3f4f6',
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
            },
            blockquote: {
              borderLeftColor: '#e5e7eb',
              borderLeftWidth: '4px',
              paddingLeft: '1rem',
              fontStyle: 'italic',
            },
          },
        },
        dark: {
          css: {
            color: '#d1d5db',
            'h1, h2, h3, h4': {
              color: '#f9fafb',
            },
            a: {
              color: '#60a5fa',
            },
            code: {
              backgroundColor: '#374151',
              color: '#f9fafb',
            },
            blockquote: {
              borderLeftColor: '#4b5563',
              color: '#d1d5db',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}