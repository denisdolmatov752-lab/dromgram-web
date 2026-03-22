export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2AABEE',
        'primary-dark': '#1A8AC4',
        'bg-light': '#FFFFFF',
        'bg-secondary': '#F0F2F5',
        'chat-bg': '#E3EDF7',
        'bubble-out': '#EFFFDE',
        'bubble-in': '#FFFFFF',
        'bg-dark': '#17212B',
        'bg-dark-secondary': '#232E3C',
        'surface-dark': '#1E2C3A',
        'chat-bg-dark': '#0F1923',
        'bubble-out-dark': '#2B5278',
        'bubble-in-dark': '#1E2C3A',
        'text-secondary': '#8D8D8D',
        'divider': '#E0E0E0',
        'divider-dark': '#2C3E50',
        'online': '#2AABEE',
        'error': '#FF3B30',
        'success': '#4FAB83',
        'time-out': '#4FAB83',
      },
      fontFamily: { inter: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { bubble: '12px' },
    }
  },
  plugins: [require('@tailwindcss/forms')],
};
