/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0A',
        gold: '#C9A84C',
      },
      fontFamily: {
        cormorant: ['Cormorant Garamond', 'serif'],
        bebas: ['Bebas Neue', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
