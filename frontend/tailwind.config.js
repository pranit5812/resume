/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Inverting 'dark' to represent our beautiful warm light cream surfaces
        dark: {
          900: '#FAF7F2', // Main page background: beautiful warm linen / light cream
          800: '#F2EDE4', // Cards & sidebars: soft parchment cream
          700: '#E4DACB', // Borders & dividers: warm subtle mocha border
        },
        // Primary is rich, premium coffee / saddle brown
        primary: {
          300: '#B8860B', // golden brown accent
          400: '#A0522D', // sienna
          500: '#8B4513', // saddle brown
          600: '#5C3A21', // rich espresso brown
        },
        // Accent is warm gold / caramel / amber
        accent: {
          300: '#F4A460',
          400: '#D2691E',
          500: '#B87333', // copper / warm caramel
          600: '#99582A',
        },
        // Inverting gray so all text classes automatically render in gorgeous warm espresso/charcoal
        gray: {
          100: '#1C130E', // main title text (deep roasted espresso)
          200: '#2E221B',
          300: '#42332A',
          400: '#614D42', // subtitle text
          500: '#857165', // muted text
          600: '#AFA096',
          700: '#D1C6BD',
          800: '#E8E2DC',
          900: '#F8F6F4',
        },
        white: '#1C130E', // explicit text-white maps to espresso so headers/loading screens are perfectly legible
        cream: '#FAF7F2', // explicit light cream for button text
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.03)' },
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
