/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          DEFAULT: '#000000',
          black: '#000000',
          dark: '#111111',
          offwhite: '#F9F9F9',
          cream: '#FAF8F5',
          border: '#E5E5E5',
          subtle: '#F3F4F6',
          muted: '#666666',
          accent: '#111111',
          red: '#D32F2F',
          gold: '#C5A059',
        },
        obsidian: {
          DEFAULT: '#0A0A0A',
          card: '#121214',
          border: '#262626',
        },
        cyber: {
          lime: '#CCFF00',
          purple: '#A855F7',
          deepPurple: '#7E22CE',
          orange: '#FF5722',
          cyan: '#00F0FF',
        }
      },
      fontFamily: {
        prompt: ['var(--font-prompt)', 'sans-serif'],
        kanit: ['var(--font-kanit)', 'sans-serif'],
      },
      boxShadow: {
        'studio-card': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'studio-float': '0 12px 30px rgba(0, 0, 0, 0.08)',
        'studio-subtle': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'brutal-lime': '4px 4px 0px 0px #CCFF00',
        'brutal-purple': '4px 4px 0px 0px #A855F7',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
};
