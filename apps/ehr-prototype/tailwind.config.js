/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic background colors
        'bg-neutral-base': 'var(--color-bg-neutral-base)',
        'bg-neutral-min': 'var(--color-bg-neutral-min)',
        'bg-neutral-subtle': 'var(--color-bg-neutral-subtle)',
        'bg-neutral-low': 'var(--color-bg-neutral-low)',
        'bg-neutral-medium': 'var(--color-bg-neutral-medium)',

        // Semantic foreground colors
        'fg-neutral-primary': 'var(--color-fg-neutral-primary)',
        'fg-neutral-secondary': 'var(--color-fg-neutral-secondary)',
        'fg-neutral-softest': 'var(--color-fg-neutral-softest)',

        // Positive (success) colors
        'bg-positive-subtle': 'var(--color-bg-positive-subtle)',
        'bg-positive-low': 'var(--color-bg-positive-low)',
        'bg-positive-medium': 'var(--color-bg-positive-medium)',
        'fg-positive-primary': 'var(--color-fg-positive-primary)',

        // Alert (error) colors
        'bg-alert-subtle': 'var(--color-bg-alert-subtle)',
        'bg-alert-low': 'var(--color-bg-alert-low)',
        'bg-alert-medium': 'var(--color-bg-alert-medium)',
        'fg-alert-primary': 'var(--color-fg-alert-primary)',

        // Attention (warning) colors
        'bg-attention-subtle': 'var(--color-bg-attention-subtle)',
        'bg-attention-low': 'var(--color-bg-attention-low)',
        'fg-attention-primary': 'var(--color-fg-attention-primary)',

        // Information colors
        'bg-information-subtle': 'var(--color-bg-information-subtle)',
        'bg-information-low': 'var(--color-bg-information-low)',
        'fg-information-primary': 'var(--color-fg-information-primary)',

        // Accent colors
        'bg-accent-subtle': 'var(--color-bg-accent-subtle)',
        'bg-accent-low': 'var(--color-bg-accent-low)',
        'fg-accent-primary': 'var(--color-fg-accent-primary)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
