/**
 * Root Navigator
 * Adapts between Drawer (iPad) and Stack+Tabs (iPhone) navigation
 *
 * PERSISTENT LAYOUT OPTIMIZATION:
 * - Background gradient renders once at navigator level (stays alive)
 * - Bottom navigation renders once at navigator level (stays alive)
 * - Only screen content swaps on navigation
 * - Uses React.memo to skip unnecessary re-renders
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import MonthScreen from '../screens/MonthScreen';
import QuarterScreen from '../screens/QuarterScreen';
import YearScreen from '../screens/YearScreen';

// Import persistent components
import { GradientBackground } from '../components/GradientBackground';
import { FloatingBottomNav } from '../components/FloatingBottomNav';
import { FloatingHeader } from '../components/FloatingHeader';

// Import context
import { NavigationProvider } from '../contexts/NavigationContext';

// Import responsive utilities
import { useAdaptiveLayout } from '../utils/responsive';

// Import design tokens
import {
  colorBgNeutralBase,
  colorFgNeutralPrimary,
  colorFgNeutralSecondary,
  colorBgBrandPrimary,
} from '../../../src/design-system/tokens/build/react-native/tokens';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

/**
 * iPhone Navigation: Stack Navigator with persistent layout
 *
 * PERSISTENT ELEMENTS (render once, never unmount):
 * - Gradient background
 * - Bottom navigation (FloatingBottomNav)
 *
 * TRANSIENT ELEMENTS (swap on navigation):
 * - Screen content (Month/Quarter/Year)
 *
 * PERFORMANCE:
 * - Animation disabled to keep nav anchored
 * - Screen listener tracks current route for bottom nav
 * - React.memo prevents unnecessary re-renders
 */
function PhoneNavigation() {
  const [currentRoute, setCurrentRoute] = useState<'month' | 'quarter' | 'year'>('month');
  const layout = useAdaptiveLayout();

  return (
    <>
      {/* TRANSIENT: Screen content area */}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'none', // Disable slide animations to keep nav elements anchored
          contentStyle: { backgroundColor: 'transparent' }, // Allow gradient to show through
        }}
        screenListeners={{
          state: (e) => {
            // Track current route for bottom nav highlighting
            const state = e.data.state;
            if (state) {
              const route = state.routes[state.index];
              setCurrentRoute(route.name.toLowerCase() as 'month' | 'quarter' | 'year');
            }
          },
        }}
      >
        <Stack.Screen name="Month" component={MonthScreen} />
        <Stack.Screen name="Quarter" component={QuarterScreen} />
        <Stack.Screen name="Year" component={YearScreen} />
      </Stack.Navigator>

      {/* PERSISTENT: Top navigation - stays mounted, handlers change via context */}
      <FloatingHeader currentView={currentRoute} useDrawerNav={layout.useDrawerNav} />

      {/* PERSISTENT: Bottom navigation - only re-renders when currentRoute changes */}
      <FloatingBottomNav currentView={currentRoute} />
    </>
  );
}

/**
 * iPad Navigation: Drawer with persistent layout
 *
 * PERSISTENT ELEMENTS (render once, never unmount):
 * - Gradient background
 * - Top navigation (FloatingHeader with segmented control)
 *
 * TRANSIENT ELEMENTS (swap on navigation):
 * - Screen content (Month/Quarter/Year)
 */
function TabletNavigation() {
  const [currentRoute, setCurrentRoute] = useState<'month' | 'quarter' | 'year'>('month');
  const layout = useAdaptiveLayout();

  return (
    <>
      {/* TRANSIENT: Screen content area */}
      <Drawer.Navigator
        screenOptions={{
          headerShown: false, // Hide header - using persistent FloatingHeader
          drawerActiveTintColor: colorBgBrandPrimary,
          drawerInactiveTintColor: colorFgNeutralSecondary,
          drawerStyle: {
            backgroundColor: colorBgNeutralBase,
            width: 280,
          },
          drawerContentContainerStyle: { backgroundColor: 'transparent' },
          sceneContainerStyle: { backgroundColor: 'transparent' }, // Allow gradient to show through
          overlayColor: 'transparent', // Make drawer overlay transparent
          drawerType: 'front', // Ensure drawer slides over content
        }}
        screenListeners={{
          state: (e) => {
            // Track current route for top nav
            const state = e.data.state;
            if (state) {
              const route = state.routes[state.index];
              setCurrentRoute(route.name.toLowerCase() as 'month' | 'quarter' | 'year');
            }
          },
        }}
      >
        <Drawer.Screen
          name="Month"
          component={MonthScreen}
          options={{
            drawerLabel: 'Month View',
          }}
        />
        <Drawer.Screen
          name="Quarter"
          component={QuarterScreen}
          options={{
            drawerLabel: 'Quarter View',
          }}
        />
        <Drawer.Screen
          name="Year"
          component={YearScreen}
          options={{
            drawerLabel: 'Year View',
          }}
        />
      </Drawer.Navigator>

      {/* PERSISTENT: Top navigation - stays mounted, handlers change via context */}
      <FloatingHeader currentView={currentRoute} useDrawerNav={layout.useDrawerNav} />
    </>
  );
}

/**
 * Root Navigator
 * Automatically switches between phone and tablet navigation
 */
export default function RootNavigator() {
  const layout = useAdaptiveLayout();

  // Custom theme with transparent background
  const theme = {
    dark: false,
    colors: {
      primary: colorBgBrandPrimary,
      background: 'transparent', // Key: Make NavigationContainer background transparent
      card: 'transparent',
      text: colorFgNeutralPrimary,
      border: colorFgNeutralSecondary,
      notification: colorBgBrandPrimary,
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700' as const,
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '900' as const,
      },
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationProvider>
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <GradientBackground />
          <NavigationContainer theme={theme}>
            {layout.useDrawerNav ? <TabletNavigation /> : <PhoneNavigation />}
          </NavigationContainer>
        </View>
      </NavigationProvider>
    </SafeAreaProvider>
  );
}
