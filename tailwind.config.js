/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        "tamu-maroon": {
          DEFAULT: "var(--tamu-maroon)",
          dark: "var(--tamu-maroon-dark)",
          light: "var(--tamu-maroon-light)",
        },
        "panda-red": {
          DEFAULT: "var(--panda-red)",
          dark: "var(--panda-dark-red)",
          light: "var(--panda-light-red)",
        },
        crimson: {
          DEFAULT: "var(--crimson)",
          dark: "var(--crimson-dark)",
          light: "var(--crimson-light)",
        },
        maroon: {
          DEFAULT: "var(--maroon)",
          light: "var(--maroon-light)",
          50: "var(--maroon-50)",
        },
        "glass-bg": "var(--glass-bg)",
        "glass-bg-light": "var(--glass-bg-light)",
        "glass-border": "var(--glass-border)",
        neutral: {
          50: "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          600: "var(--neutral-600)",
          900: "var(--neutral-900)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Geist", "Geist Fallback"],
        mono: ["var(--font-mono)", "Geist Mono", "Geist Mono Fallback"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

