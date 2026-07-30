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
        'brutal-lime': '4px 4px 0px 0px #CCFF00',
        'brutal-purple': '4px 4px 0px 0px #A855F7',
        'brutal-orange': '4px 4px 0px 0px #FF5722',
        'brutal-white': '4px 4px 0px 0px #FFFFFF',
        'brutal-lg-lime': '8px 8px 0px 0px #CCFF00',
        'glow-purple': '0 0 30px -5px rgba(168, 85, 247, 0.6)',
        'glow-lime': '0 0 30px -5px rgba(204, 255, 0, 0.6)',
        'glow-orange': '0 0 30px -5px rgba(255, 87, 34, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-reverse': 'floatReverse 7s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(2deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(15px) rotate(-2deg)' },
        },
        glowPulse: {
          '0%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.4))' },
          '100%': { opacity: '0.9', filter: 'drop-shadow(0 0 35px rgba(204, 255, 0, 0.8))' },
        }
      }
    },
  },
  plugins: [],
};
