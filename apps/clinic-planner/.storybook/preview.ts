import type { Preview } from "@storybook/react";
import '../app/globals.css'; // Import your Tailwind CSS

// Load Inter font for Storybook
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: [],
        locales: 'en-US',
      },
    },
    backgrounds: {
      default: 'light-gray',
      values: [
        {
          name: 'light-gray',
          value: '#f5f5f5',
        },
        {
          name: 'white',
          value: '#ffffff',
        },
        {
          name: 'dark-gray',
          value: '#424242',
        },
      ],
    },
  },
};

export default preview;
