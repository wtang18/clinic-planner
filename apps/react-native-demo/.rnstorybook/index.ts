import { Platform } from 'react-native';
import { view } from './storybook.requires';

// For web, use localStorage. For native, use AsyncStorage
let storage;
if (Platform.OS === 'web') {
  storage = {
    getItem: async (key: string) => {
      return localStorage.getItem(key);
    },
    setItem: async (key: string, value: string) => {
      localStorage.setItem(key, value);
    },
  };
} else {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storage = {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  };
}

const StorybookUIRoot = view.getStorybookUI({
  storage,
});

export default StorybookUIRoot;
