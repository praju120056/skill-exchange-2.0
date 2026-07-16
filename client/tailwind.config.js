/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Teach: Rose Quartz (#FB7185)
        indigo: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185', // Hover Teach
          500: '#fb7185', // Accent Teach (Rose Quartz)
          600: '#f43f5e',
          700: '#e11d48',
          800: '#be123c',
          900: '#9f1239',
          950: '#4c0519',
        },
        // Base slate mapped to Northern Lights Aurora Navy (#0B0F14 / #141922)
        slate: {
          50: '#f9fafb',
          100: '#f3f4f6', // Text: #F3F4F6
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af', // Secondary: #9CA3AF
          500: '#6b7280',
          600: '#4b5563',
          700: '#283143', // Borders/Scrollbars
          800: '#1c2330', // Hover surfaces
          900: '#141922', // Cards/Surfaces: #141922
          950: '#0b0f14', // Background: #0B0F14
        },
        // Learn: Aurora Gold/Amber (#F4B942)
        amber: {
          50: '#fffdf5',
          100: '#fef9e1',
          200: '#fdf0bc',
          300: '#fce38b',
          400: '#fad35c', // Hover
          500: '#f4b942', // Learn (Gold/Amber)
          600: '#e09d22',
          700: '#b87914',
          800: '#915c0e',
          900: '#73460b',
          950: '#402302',
        },
        // AI: Sky Blue (#60A5FA)
        cyan: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7dd3fc',
          400: '#60a5fa', // AI Accent
          500: '#60a5fa', // AI Accent
          600: '#3b82f6',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#0f172a',
        },
        // Match: Lavender/Purple (#A78BFA)
        emerald: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a78bfa', // Matches
          600: '#8b5cf6',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#581c87',
          950: '#2e1065',
        },
        glass: {
          light: 'rgba(20, 25, 34, 0.45)',
          border: 'rgba(255, 255, 255, 0.05)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #2dd4bf 0%, #3b82f6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f4b942 0%, #f97316 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0b0f14 0%, #141922 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'neon': '0 0 20px rgba(244, 185, 66, 0.2), 0 0 40px rgba(244, 185, 66, 0.1)',
        'neon-blue': '0 0 20px rgba(251, 113, 133, 0.2), 0 0 40px rgba(251, 113, 133, 0.1)',
        'glow': '0 0 15px rgba(251, 113, 133, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'tilt': 'tilt 10s infinite linear',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(251, 113, 133, 0.15), 0 0 10px rgba(251, 113, 133, 0.08)' },
          '100%': { boxShadow: '0 0 20px rgba(251, 113, 133, 0.35), 0 0 30px rgba(251, 113, 133, 0.2)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        tilt: {
          '0%, 50%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(0.5deg)' },
          '75%': { transform: 'rotate(-0.5deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#f3f4f6',
            a: {
              color: '#fb7185',
              '&:hover': {
                color: '#fda4af',
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
}
