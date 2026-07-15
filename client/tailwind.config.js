/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Redefined indigo to point to the new Emerald accent scale
        indigo: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#34d399', // Hover: #34D399
          500: '#10b981', // Accent: #10B981
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Redefined slate to point to the clean dark Zinc/gray scale
        slate: {
          50: '#fafafa',
          100: '#f4f4f5', // Text: #F4F4F5
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa', // Muted: #A1A1AA
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#1b1b1f', // Card: #1B1B1F
          900: '#141414', // Surface: #141414
          950: '#0a0a0a', // Background: #0A0A0A
        },
        amber: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        orange: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0a0a0a 0%, #141414 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'neon': '0 0 20px rgba(52, 211, 153, 0.25), 0 0 40px rgba(52, 211, 153, 0.15)',
        'neon-blue': '0 0 20px rgba(16, 185, 129, 0.25), 0 0 40px rgba(16, 185, 129, 0.15)',
        'glow': '0 0 15px rgba(16, 185, 129, 0.25)',
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
          '0%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.2), 0 0 10px rgba(16, 185, 129, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.45), 0 0 30px rgba(16, 185, 129, 0.25)' },
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
            color: '#f4f4f5',
            a: {
              color: '#10b981',
              '&:hover': {
                color: '#34d399',
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
}

