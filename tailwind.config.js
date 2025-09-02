// tailwind.config.js
const lineClamp = require('@tailwindcss/line-clamp');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    lineClamp,
  ],
}