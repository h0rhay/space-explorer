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
      textShadow: {
        'space-heading': `-2px 2px 0 var(--custom-red), -4px 4px 0 var(--custom-orange), -6px 6px 0 var(--custom-red), -8px 8px 0 var(--custom-orange)`,
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
        MachineStd: ['MachineStd', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tailwindcss-textshadow')
  ],
} satisfies Config;
