/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Quicksand", "sans-serif"],
      },
      colors: {
        crema: "#FDF6F0",
        rosaSuave: "#FDE8E0",
        terracota: "#E8B4A0",
        terracotaIntenso: "#D48C7A",
        marron: "#8B6B5A",
        marronClaro: "#B5957A",
        blancoRoto: "#FFFAF7",
        dorado: "#E8C9A0",
        menta: "#B5D6C6",
      },
    },
  },
  plugins: [],
};
