import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#F5F5F5',
          muted: '#B3B3B3',
          faint: '#8A8A8A',
          subtle: '#3A3A3A',
        },
        canvas: {
          DEFAULT: '#000000',
          dark: '#000000',
        },
        surface: {
          DEFAULT: '#0A0A0A',
          raised: '#161616',
          elevated: '#1F1F1F',
        },
        border: {
          DEFAULT: '#333333',
          strong: '#F5F5F5',
        },
        hero: '#000000',
        accent: {
          DEFAULT: '#F5F5F5',
          foreground: 'rgb(10 10 10 / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        mobile: '390px',
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.4)',
        card: '0 2px 8px rgba(0, 0, 0, 0.5)',
        elevated: '0 8px 32px rgba(0, 0, 0, 0.6)',
      },
      letterSpacing: {
        tightest: '-0.04em',
        widest: '0.12em',
      },
    },
  },
  plugins: [],
}
export default config
