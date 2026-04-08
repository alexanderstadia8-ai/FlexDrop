/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#D85A30',
        dark: '#1a1a1a',
        gold: '#FFD700',
      },
    },
  },
  plugins: [],
}
