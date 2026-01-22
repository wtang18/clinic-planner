/**
 * VStack - Vertical Stack Layout Component
 *
 * Arranges children vertically with consistent spacing using semantic tokens.
 * Uses margin-based spacing since React Native's gap support varies.
 *
 * @example
 * // Form fields with related spacing
 * <VStack space="related">
 *   <Input label="Email" />
 *   <Input label="Password" />
 * </VStack>
 *
 * @example
 * // Card list with repeating spacing
 * <VStack space="repeating">
 *   {cards.map(card => <Card key={card.id} {...card} />)}
 * </VStack>
 *
 * @example
 * // With NativeWind className
 * <VStack space="coupled" className="p-4 bg-bg-neutral-base">
 *   <Icon />
 *   <Text>Label</Text>
 * </VStack>
 */

import React, { Children, cloneElement, isValidElement, ReactNode } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

// Semantic spacing values (in pixels) - matches Tailwind theme
const SPACE_VALUES = {
  none: 0,
  coupled: 4,        // Tightly coupled (icon + text)
  'repeating-sm': 6, // Small repeating items (pills, tags)
  repeating: 8,      // Repeating items (cards, list items)
  'related-sm': 8,   // Related content (small)
  related: 16,       // Related content (form fields)
  'separated-sm': 24, // Separated sections (small)
  separated: 32,     // Major page sections
} as const;

export type SpaceValue = keyof typeof SPACE_VALUES;

export interface VStackProps {
  /** Semantic spacing between children */
  space?: SpaceValue;
  /** Children to render */
  children: ReactNode;
  /** Additional NativeWind className */
  className?: string;
  /** Additional inline styles */
  style?: StyleProp<ViewStyle>;
  /** Test ID for testing */
  testID?: string;
}

/**
 * VStack - Vertical stack with semantic spacing
 *
 * Applies marginTop to all children except the first one.
 * This pattern works reliably across all React Native versions.
 */
export function VStack({
  space = 'related',
  children,
  className,
  style,
  testID,
}: VStackProps) {
  const spaceValue = SPACE_VALUES[space];
  const childArray = Children.toArray(children).filter(Boolean);

  return (
    <View className={className} style={style} testID={testID}>
      {childArray.map((child, index) => {
        if (!isValidElement(child)) {
          return child;
        }

        // Apply marginTop to all children except the first
        const marginStyle: ViewStyle =
          index > 0 ? { marginTop: spaceValue } : {};

        // If child already has style, merge them
        const childProps = child.props as { style?: ViewStyle };
        const existingStyle = childProps.style;
        const mergedStyle = existingStyle
          ? [marginStyle, existingStyle]
          : marginStyle;

        return cloneElement(child, {
          key: child.key ?? index,
          style: mergedStyle,
        } as Record<string, unknown>);
      })}
    </View>
  );
}

export default VStack;
