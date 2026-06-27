export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#fbf8f4', 100: '#f4ebd8', 400: '#d4ad6a', 500: '#b8860b', 600: '#996e08', 700: '#755405', 900: '#3d2b00' },
        ink: { 50: '#f9fafb', 100: '#f3f4f6', 800: '#1f2937', 900: '#111827', 950: '#030712' }
      },
      fontFamily: { 
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Outfit', 'Inter', 'ui-sans-serif']
      }
    }
  },
  plugins: []
};
