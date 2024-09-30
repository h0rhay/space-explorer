import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
          'custom-blue': 'var(--custom-blue)',
          'custom-red': 'var(--custom-red)',
          'custom-cyan': 'var(--custom-cyan)',
          'custom-yellow': 'var(--custom-yellow)',
          'custom-black': 'var(--custom-black)',
      },
      fontFamily: {
        sans: [
          '"Inter"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        dosis: ['Dosis', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
