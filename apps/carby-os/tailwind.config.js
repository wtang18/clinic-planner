/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic background tokens
        'bg-neutral-base': 'var(--color-bg-neutral-base)',
        'bg-neutral-min': 'var(--color-bg-neutral-min)',
        'bg-neutral-subtle': 'var(--color-bg-neutral-subtle)',
        'bg-neutral-low': 'var(--color-bg-neutral-low)',
        'bg-neutral-medium': 'var(--color-bg-neutral-medium)',

        'fg-neutral-primary': 'var(--color-fg-neutral-primary)',
        'fg-neutral-secondary': 'var(--color-fg-neutral-secondary)',
        'fg-neutral-softest': 'var(--color-fg-neutral-softest)',

        'bg-positive-subtle': 'var(--color-bg-positive-subtle)',
        'bg-positive-low': 'var(--color-bg-positive-low)',
        'bg-positive-medium': 'var(--color-bg-positive-medium)',
        'bg-positive-high': 'var(--color-bg-positive-high)',

        'fg-positive-primary': 'var(--color-fg-positive-primary)',
        'fg-positive-secondary': 'var(--color-fg-positive-secondary)',

        'bg-alert-subtle': 'var(--color-bg-alert-subtle)',
        'bg-alert-low': 'var(--color-bg-alert-low)',
        'bg-alert-medium': 'var(--color-bg-alert-medium)',
        'bg-alert-high': 'var(--color-bg-alert-high)',

        'fg-alert-primary': 'var(--color-fg-alert-primary)',
        'fg-alert-secondary': 'var(--color-fg-alert-secondary)',

        'bg-attention-subtle': 'var(--color-bg-attention-subtle)',
        'bg-attention-low': 'var(--color-bg-attention-low)',
        'bg-attention-medium': 'var(--color-bg-attention-medium)',

        'fg-attention-primary': 'var(--color-fg-attention-primary)',
        'fg-attention-secondary': 'var(--color-fg-attention-secondary)',

        'bg-information-subtle': 'var(--color-bg-information-subtle)',
        'bg-information-low': 'var(--color-bg-information-low)',
        'bg-information-medium': 'var(--color-bg-information-medium)',

        'fg-information-primary': 'var(--color-fg-information-primary)',
        'fg-information-secondary': 'var(--color-fg-information-secondary)',

        'bg-accent-subtle': 'var(--color-bg-accent-subtle)',
        'bg-accent-low': 'var(--color-bg-accent-low)',
        'bg-accent-medium': 'var(--color-bg-accent-medium)',

        'fg-accent-primary': 'var(--color-fg-accent-primary)',
        'fg-accent-secondary': 'var(--color-fg-accent-secondary)',

        // Transparent tokens (used for glass/overlay effects)
        'bg-transparent-low': 'var(--color-bg-transparent-low)',
        'bg-transparent-medium': 'var(--color-bg-transparent-medium)',
        'bg-transparent-high': 'var(--color-bg-transparent-high)',
        'bg-transparent-subtle': 'var(--color-bg-transparent-subtle)',

        // Input tokens (used for filter pills)
        'bg-input-low': 'var(--color-bg-input-low)',
        'bg-input-medium': 'var(--color-bg-input-medium)',
        'fg-input-primary': 'var(--color-fg-input-primary)',
        'fg-input-secondary': 'var(--color-fg-input-secondary)',

        // Primitives
        gray: {
          25: 'var(--color-gray-25)',
          50: 'var(--color-gray-50)',
          100: 'var(--color-gray-100)',
          200: 'var(--color-gray-200)',
          300: 'var(--color-gray-300)',
          400: 'var(--color-gray-400)',
          500: 'var(--color-gray-500)',
          600: 'var(--color-gray-600)',
          700: 'var(--color-gray-700)',
          800: 'var(--color-gray-800)',
          900: 'var(--color-gray-900)',
          1000: 'var(--color-gray-1000)',
        },
        white: 'var(--color-white-solid)',
        black: 'var(--color-black-solid)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        11: '44px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
        32: '128px',
        40: '160px',
        48: '192px',
        56: '224px',
        64: '256px',
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        xs: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        DEFAULT: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
        md: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
        lg: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
        xl: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '2xl': '0px 35px 60px -15px rgba(0, 0, 0, 0.3)',
        inner: 'inset 0px 2px 4px rgba(0, 0, 0, 0.06)',
        none: 'none',
      },
    },
  },
  plugins: [],
}
