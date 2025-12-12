/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: '#14BFFB', // Cyan
        'primary-light': '#7CDFFF',
        'primary-dark': '#0090C0',

        secondary: '#D300E5', // Magenta
        'secondary-light': '#F26EFF',
        'secondary-dark': '#9A00A8',

        // Neutral / Surface Colors (Dark Theme)
        background: '#0F172A', // Slate 900 (Deep Blue/Black)
        surface: '#1E293B',    // Slate 800
        'surface-highlight': '#334155', // Slate 700

        // Text Colors
        text: '#F8FAFC',       // Slate 50
        'text-muted': '#94A3B8', // Slate 400

        // Status
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #14BFFB 0%, #0090C0 100%)',
        'gradient-brand': 'linear-gradient(135deg, #14BFFB 0%, #D300E5 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
      },
      fontFamily: {
        sans: ['Cambay', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
