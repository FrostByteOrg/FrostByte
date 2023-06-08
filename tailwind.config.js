/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      mobile: { max: '940px' },
    },
    spacing: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '24px',
      6: '32px',
      7: '48px',
      8: '64px',
      9: '96px',
      10: '128px',
      11: '192px',
      12: '256px',
      13: '384px',
      14: '512px',
      15: '640px',
      16: '768px',
    },
    extend: {
      colors: {
        frost: {
          50: '#f1fafe',
          100: '#e3f2fb',
          200: '#c0e7f7',
          300: '#88d4f1',
          400: '#4abfe8',
          500: '#21a7d6',
          600: '#1387b6',
          700: '#106b94',
          800: '#125b7a',
          900: '#144c66',
        },
        grey: {
          50: '#f6f8f9',
          100: '#edeff1',
          200: '#d6dde1',
          300: '#b2c1c7',
          400: '#8aa0a8',
          500: '#6a838d',
          600: '#556a74',
          700: '#46575e',
          800: '#3c4a50',
          900: '#354045',
          925: '#2f3b40',
          950: '#21282b',
        },
      },
    },
  },
  plugins: [],
};
