import type { Config } from "tailwindcss";

const { fontFamily } = require('tailwindcss/defaultTheme')

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        
        // Additional color extensions for our components
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#4aa8ff',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        green: {
          100: '#dcfce7',
          600: '#16a34a',
        },
        purple: {
          100: '#f3e8ff',
          600: '#9333ea',
        },
        amber: {
          100: '#fef3c7',
          600: '#d97706',
        },
        red: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config;