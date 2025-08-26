/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#14BFFB',
        'primary-light': '#7CDFFF',
        'primary-dark': '#0e9bd9',
        secondary: '#D300E5',
        'secondary-light': '#F26EFF',
        'secondary-dark': '#a900b8',
        accent: '#f5f5f5',
        border: '#e5e5e5',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7CDFFF, #14BFFB, #0e9bd9)',
        'gradient-secondary': 'linear-gradient(135deg, #F26EFF, #D300E5, #a900b8)',
        'gradient-brand': 'linear-gradient(135deg, #14BFFB, #D300E5)',
      }
    },
  },
  plugins: [],
};
