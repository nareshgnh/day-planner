// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Make sure this covers your project structure
  ],
  darkMode: "class", // <-- Ensure this line is present and set to 'class'
  theme: {
    extend: {},
  },
  plugins: [],
};
