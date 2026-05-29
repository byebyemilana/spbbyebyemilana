/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        milk: "#f7f1e7",
        cream: "#fffaf0",
        oat: "#eadfce",
        ink: "#2d2721",
        clay: "#b46b4a",
        moss: "#6e7d4e",
        harbor: "#426a72",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "Arial", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 60px rgba(55, 45, 33, 0.12)",
      },
    },
  },
  plugins: [],
};
