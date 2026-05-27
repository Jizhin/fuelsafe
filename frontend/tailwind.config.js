/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   '#16A34A',
        'primary-light': '#DCFCE7',
        warning:   '#F59E0B',
        danger:    '#EF4444',
        bg:        '#F8FAFC',
        card:      '#FFFFFF',
        border:    '#E5E7EB',
        'text-primary':   '#111827',
        'text-secondary': '#6B7280',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '20px', btn: '14px', input: '16px' },
      boxShadow: { card: '0 4px 20px rgba(0,0,0,0.06)', float: '0 8px 32px rgba(0,0,0,0.10)' },
    },
  },
  plugins: [],
};
