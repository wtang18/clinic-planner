/**
 * NetworkStatusBanner Component
 *
 * Displays a banner when the network connection changes.
 * Shows offline status and reconnection notifications.
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { WifiOff, Wifi } from 'lucide-react';
import { colors, spaceAround, spaceBetween, typography } from '../styles/foundations';

// ============================================================================
// Types
// ============================================================================

interface NetworkStatusBannerProps {
  children: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Only add listeners on web
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const handleOnline = () => {
      setIsConnected(true);
      // Show "reconnected" banner briefly
      setShowBanner(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowBanner(false);
        });
      }, 3000);
    };

    const handleOffline = () => {
      setIsConnected(false);
      setShowBanner(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    // Check initial state
    if (!navigator.onLine) {
      setIsConnected(false);
      setShowBanner(true);
      opacity.setValue(1);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [opacity]);

  return (
    <View style={styles.container}>
      {showBanner && (
        <Animated.View
          style={[
            styles.banner,
            { opacity },
            !isConnected ? styles.offline : styles.online,
          ]}
          testID="network-status-banner"
        >
          {isConnected ? (
            <View style={styles.row}>
              <Wifi size={14} color={colors.fg.neutral.inversePrimary} />
              <Text style={styles.text}>Connection restored</Text>
            </View>
          ) : (
            <View style={styles.row}>
              <WifiOff size={14} color={colors.fg.neutral.inversePrimary} />
              <Text style={styles.text}>
                Offline. Changes will sync when reconnected.
              </Text>
            </View>
          )}
        </Animated.View>
      )}
      {children}
    </View>
  );
};

NetworkStatusBanner.displayName = 'NetworkStatusBanner';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    paddingVertical: spaceAround.tight,
    paddingHorizontal: spaceAround.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offline: {
    backgroundColor: colors.bg.alert.high,
  },
  online: {
    backgroundColor: colors.bg.positive.high,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  },
  text: {
    fontSize: 13,
    color: colors.fg.neutral.inversePrimary,
    fontWeight: typography.fontWeight.medium as '500',
  },
});
