/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#02060E',
        'bg-darker': '#000000',
        'grid-blue': '#022E5A',
        'accent-1': '#0077DD',
        'accent-2': '#0064BE',
        'cyan-glow': '#3096E1',
        'muted-white': '#E5E5E5',
        'card-bg': 'rgba(2,6,13,0.65)',
        'neon-green': '#00B45C',
      },
      boxShadow: {
        'hero-glow': '0 6px 30px rgba(0,119,221,0.16)',
        'card-shadow': '0 8px 30px rgba(2,6,13,0.6)',
        'btn-primary': '0 8px 30px rgba(0,119,221,0.16)',
        'btn-primary-hover': '0 14px 46px rgba(0,119,221,0.20)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};
