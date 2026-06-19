/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fiori: {
          blue: {
            DEFAULT: '#0a6ed1',
            light: '#e1f0fc',
            dark: '#0854a0',
          },
          shell: '#182c4c',
          bg: '#f4f6f9',
          border: '#d9d9d9',
          text: {
            DEFAULT: '#32363a',
            muted: '#6a6d70',
            white: '#ffffff',
          },
          success: '#107e3e',
          warning: '#e9730c',
          error: '#bb0000',
          card: '#ffffff'
        }
      },
      fontFamily: {
        fiori: ['"72"', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
