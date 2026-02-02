/**
 * Navigation Module Exports
 */

// Routes
export * from './routes';

// Navigation Context
export {
  NavigationProvider,
  useNavigation,
  useCurrentScreen,
  useEncounterId,
  useCurrentMode,
} from './NavigationContext';
export type {
  Screen,
  NavigationState,
  NavigationContextValue,
  NavigationProviderProps,
} from './NavigationContext';

// Components
export { AppRouter } from './AppRouter';
export { EncounterLoader } from './EncounterLoader';
export type { EncounterLoaderProps } from './EncounterLoader';
export { DemoLauncher } from './DemoLauncher';
