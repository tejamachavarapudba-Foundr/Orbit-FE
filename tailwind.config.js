/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope_400Regular"],
        "sans-medium": ["Manrope_500Medium"],
        "sans-semibold": ["Manrope_600SemiBold"],
        "sans-bold": ["Manrope_700Bold"],
        display: ["Sora_400Regular"],
        "display-semibold": ["Sora_600SemiBold"],
        "display-bold": ["Sora_700Bold"]
      },
      fontSize: {
        xs: ["12px", { lineHeight: "18px" }],
        sm: ["14px", { lineHeight: "22px" }],
        base: ["16px", { lineHeight: "26px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "30px" }],
        "2xl": ["24px", { lineHeight: "34px" }],
        "3xl": ["30px", { lineHeight: "40px" }]
      },
      borderRadius: {
        sm: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px"
      },
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        onPrimary: "rgb(var(--color-on-primary) / <alpha-value>)",
        "primary-muted": "rgb(var(--color-primary-muted) / <alpha-value>)",
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--color-card) / <alpha-value>)",
          foreground: "rgb(var(--color-card-foreground) / <alpha-value>)"
        },
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          elevated: "rgb(var(--color-surface-elevated) / <alpha-value>)"
        },
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          foreground: "rgb(var(--color-secondary-foreground) / <alpha-value>)"
        },
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        "muted-bg": "rgb(var(--color-muted-bg) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          foreground: "rgb(var(--color-accent-foreground) / <alpha-value>)"
        },
        border: "rgb(var(--color-border) / <alpha-value>)",
        input: "rgb(var(--color-input) / <alpha-value>)",
        ring: "rgb(var(--color-ring) / <alpha-value>)",
        danger: {
          DEFAULT: "rgb(var(--color-danger) / <alpha-value>)",
          foreground: "rgb(var(--color-danger-foreground) / <alpha-value>)"
        },
        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          foreground: "rgb(var(--color-success-foreground) / <alpha-value>)"
        }
      }
    }
  },
  plugins: []
};
