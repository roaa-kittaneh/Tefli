/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7B9669',
          light: '#BAC8B1', // Soft Sage
          dark: '#404E3B',  // Dark Accent/Text
        },
        secondary: {
          DEFAULT: '#6C8480', // Secondary/Muted Green
        },
        sage: '#BAC8B1',
        darkAccent: '#404E3B',
        lightBg: '#E6E6E6',
      },
      fontFamily: {
        sans: ['Cairo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

