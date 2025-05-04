
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: '#e5e7eb',
        input: '#e5e7eb',
        ring: '#33C3F0',
        background: '#FFFFFF',
        foreground: '#000000',
        primary: {
          DEFAULT: '#33C3F0',
          foreground: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#f1f5f9',
          foreground: '#000000'
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#FFFFFF'
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b'
        },
        accent: {
          DEFAULT: '#f1f5f9',
          foreground: '#000000'
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#000000'
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#000000'
        },
        focusBlue: {
          DEFAULT: '#33C3F0',
          dark: '#0ea5e9',
          light: '#7dd3fc'
        },
        darkBg: {
          DEFAULT: '#FFFFFF',
          card: '#FFFFFF',
          lighter: '#f8fafc'
        },
        sidebar: {
          DEFAULT: '#FFFFFF',
          foreground: '#000000',
          primary: '#33C3F0',
          'primary-foreground': '#FFFFFF',
          accent: '#f1f5f9',
          'accent-foreground': '#000000',
          border: '#e5e7eb',
          ring: '#33C3F0'
        }
      },
      boxShadow: {
        'button': '0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1)',
        'nav': '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
