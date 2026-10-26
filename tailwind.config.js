/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          pageBg: '#050708',     // Reference page background
          surface: '#0B1014',    // Primary surface card
          surfaceSecondary: '#111820', // Secondary surface card
          lime: '#C8FF00',       // Main neon lime
          limeMuted: '#99CC00',
          limeGlow: 'rgba(200, 255, 0, 0.15)',
          limeHover: '#B8EA00',
          darkBg: '#050708',     // Deep page background
          border: '#24313C',     // Design system borders
          borderHover: '#C8FF00',
          text: '#F5F7FA',       // Main white text
          textMuted: '#94A3B8',  // Secondary slate text
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(204, 255, 0, 0.3)',
        'glow-lg': '0 0 50px -10px rgba(204, 255, 0, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'float-3d': 'float3d 6s ease-in-out infinite',
        'float-3d-slow': 'float3dSlow 8s ease-in-out infinite',
        'float-3d-reverse': 'float3dReverse 7s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s infinite',
      },
      keyframes: {
        float3d: {
          '0%, 100%': { transform: 'translateY(0px) rotateX(6deg) rotateY(-6deg)' },
          '50%': { transform: 'translateY(-14px) rotateX(12deg) rotateY(-2deg)' },
        },
        float3dSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotateX(10deg) rotateY(12deg) rotateZ(-4deg)' },
          '50%': { transform: 'translateY(-18px) rotateX(4deg) rotateY(6deg) rotateZ(2deg)' },
        },
        float3dReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotateX(-8deg) rotateY(-10deg) rotateZ(6deg)' },
          '50%': { transform: 'translateY(-12px) rotateX(-2deg) rotateY(-4deg) rotateZ(-2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
