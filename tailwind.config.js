/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#32CD32', // Lime Green
        background: '#000', // Black
        yellow: {
          400: '#FFD600', // Bright Yellow
          300: '#FFF176', // Lighter Yellow for highlights
        },
        green: {
          300: '#6EE7B7', // Subdued text
          500: '#32CD32', // Main accent
        },
        brand: {
          lilipad: '#FFD600', // For brand name highlight
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderColor: {
        primary: '#32CD32',
      },
    },
  },
  plugins: [],
}; 