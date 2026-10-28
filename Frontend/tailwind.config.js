/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Instrument Serif'", "serif"],
        body: ["'Barlow'", "sans-serif"],
      },
      colors: {
        background: "hsl(213 45% 7%)",
        foreground: "#ffffff",
        primary: "#ffffff",
        "primary-foreground": "hsl(213 45% 67%)",
        border: "rgba(255,255,255,0.2)",
      },
      borderRadius: {
        full: "9999px",
      },
      backdropBlur: {
        glass: "4px",
        "glass-strong": "50px",
      },
    },
  },
  plugins: [],
};

