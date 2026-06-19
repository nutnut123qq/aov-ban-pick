import { heroui } from "@heroui/theme";

/** HeroUI + Tailwind v4 theme — AOV DraftMind primary/secondary palette. */
export default heroui({
  themes: {
    light: {
      colors: {
        primary: {
          DEFAULT: "#1392ec",
          foreground: "#ffffff",
          50: "#eff8ff",
          100: "#dceefc",
          200: "#b9ddf9",
          300: "#7ec2f3",
          400: "#3aa5ea",
          500: "#1392ec",
          600: "#0f74c4",
          700: "#0d5ca0",
          800: "#0f4d84",
          900: "#12406e",
        },
        secondary: {
          DEFAULT: "#0ea5e9",
          foreground: "#ffffff",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },
    },
    dark: {
      colors: {
        primary: {
          DEFAULT: "#1392ec",
          foreground: "#ffffff",
          50: "#12406e",
          100: "#0f4d84",
          200: "#0d5ca0",
          300: "#0f74c4",
          400: "#1392ec",
          500: "#3aa5ea",
          600: "#7ec2f3",
          700: "#b9ddf9",
          800: "#dceefc",
          900: "#eff8ff",
        },
        secondary: {
          DEFAULT: "#0ea5e9",
          foreground: "#ffffff",
          50: "#0c4a6e",
          100: "#075985",
          200: "#0369a1",
          300: "#0284c7",
          400: "#0ea5e9",
          500: "#38bdf8",
          600: "#7dd3fc",
          700: "#bae6fd",
          800: "#e0f2fe",
          900: "#f0f9ff",
        },
      },
    },
  },
});

