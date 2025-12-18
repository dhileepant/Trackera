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
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#3b82f6', // Updated to match Option A Primary Accent
          700: '#2563eb', // Updated to match Option A Hover
          800: '#1e40af',
          900: '#1e3a8a',
        },
        dark: {
          bg: {
            primary: '#0B0F14',
            secondary: '#111827',
          },
          text: {
            primary: '#E5E7EB',
            secondary: '#9CA3AF',
          },
        },
        accent: {
          blue: '#3B82F6',
          cyan: '#06B6D4',
        },
      },
    },
  },
  plugins: [],
}
