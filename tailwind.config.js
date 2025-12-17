/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1100px"
      }
    },
    extend: {
      colors: {
        surface: "rgb(12 18 33)",
        "surface-alt": "rgb(15 23 42)",
        foreground: "rgb(226 232 240)",
        muted: "rgb(148 163 184)",
        border: "rgb(51 65 85)",
        primary: "rgb(99 102 241)",
        "primary-strong": "rgb(79 70 229)"
      }
    }
  },
  plugins: []
};
