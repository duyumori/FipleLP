/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#100f0f",
        ink2: "#2a2a2f",
        muted: "#6e6c67",
        faint: "#a19f97",
        line: "#ebe9e1",
        line2: "#f2f1ec",
        base: "#f9f9f6",
        base2: "#f0eee6",
        surface: "#ffffff",
        blue: "#100f0f",
        blueDark: "#2a2a2f",
        blueSoft: "#f0eee6",
        green: "#100f0f",
        greenSoft: "#ebe9e1",
      },
      fontFamily: {
        sans: ['"Geist"', "system-ui", "-apple-system", '"Segoe UI"', "Roboto", "sans-serif"],
        display: ['"Instrument Serif"', "Georgia", '"Times New Roman"', "serif"],
        body: ['"Geist"', "system-ui", "-apple-system", '"Segoe UI"', "Roboto", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "SFMono-Regular", '"SF Mono"', "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,15,15,0.03), 0 6px 20px rgba(16,15,15,0.05)",
        lift: "0 1px 3px rgba(16,15,15,0.04), 0 14px 40px -8px rgba(16,15,15,0.12)",
        device: "0 2px 6px rgba(16,15,15,0.05), 0 40px 80px -20px rgba(16,15,15,0.28)",
        glow: "0 30px 90px -30px rgba(16,15,15,0.30)",
        focus: "0 0 0 4px rgba(16,15,15,0.14)",
      },
      borderRadius: {
        xl2: "20px",
        xl3: "28px",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        rise: "rise 720ms cubic-bezier(0.22,1,0.36,1) both",
        ping2: "ping2 2.4s cubic-bezier(0,0,0.2,1) infinite",
        trace: "trace 2.6s cubic-bezier(0.65,0,0.35,1) infinite",
      },
      keyframes: {
        trace: {
          "0%": { left: "0%", opacity: "0" },
          "14%": { opacity: "1" },
          "82%": { opacity: "1" },
          "100%": { left: "100%", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        ping2: {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "70%, 100%": { transform: "scale(2.4)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
