import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        black: {
          "100": "#f8f9fa",
          "200": "#e9ecef",
          "300": "#dee2e6",
          "400": "#ced4da",
          "500": "#adb5bd",
          "600": "#6c757d",
          "700": "#495057",
          "800": "#343a40",
          "900": "#212529",
        },
        // Design Token Colors (matching our sketch system)
        token: {
          primary: {
            light: '#3B82F6',
            DEFAULT: '#2563EB',
            dark: '#1D4ED8',
          },
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
      },
      cursor: {
        'crosshair': 'crosshair',
        'grab': 'grab',
        'grabbing': 'grabbing',
      },
      boxShadow: {
        'token': '0 0 0 2px rgba(59, 130, 246, 0.2)',
      },
      keyframes: {
        'pulse-border': {
          '0%, 100%': { borderColor: 'rgba(59, 130, 246, 0.5)' },
          '50%': { borderColor: 'rgba(59, 130, 246, 1)' },
        },
      },
      animation: {
        'pulse-border': 'pulse-border 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
