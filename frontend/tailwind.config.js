import tailwindcss from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-white": "#fcfcfc",
        "custom-green": "#f3fff4",
        "custom-pink": "#ffeded",
      },
    },
  },
  plugins: [],
};
