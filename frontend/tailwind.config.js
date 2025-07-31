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
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out infinite 3s",
        shine: "shine 2s linear infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shine: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff" },
          "100%": { boxShadow: "0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff" },
        },
      },
    },
  },
  plugins: [],
};
