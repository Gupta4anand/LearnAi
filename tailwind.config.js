/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        learnAI: {
          background: '#0F172A',
          inputBg: '#1E293B',
          placeholder: '#94A3B8',
          text: '#FFFFFF',
          primary: '#4A6EDB',
          secondary: '#6C8DF5',
          accent: '#6C8DF5',
          error: '#EF4444',
        }
      }
    },
  },
  plugins: [],
};
