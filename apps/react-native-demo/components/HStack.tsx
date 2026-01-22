/**
 * HStack - Horizontal Stack Layout Component
 *
 * Arranges children horizontally with consistent spacing using semantic tokens.
 * Uses margin-based spacing since React Native's gap support varies.
 *
 * @example
 * // Icon with label (tightly coupled)
 * <HStack space="coupled">
 *   <Icon name="check" />
 *   <Text>Completed</Text>
 * </HStack>
 *
 * @example
 * // Button group
 * <HStack space="repeating">
 *   <Button>Cancel</Button>
 *   <Button>Save</Button>
 * </HStack>
 *
 * @example
 * // With alignment and NativeWind className
 * <HStack space="related" align="center" className="p-4 bg-bg-neutral-base">
 *   <Avatar />
 *   <Text>Username</Text>
 * </HStack>
 */

import React, { Children, cloneElement, isValidElement, ReactNode } from 'react';
import { View, ViewStyle, StyleProp, FlexAlignType } from 'react-native';

// Semantic spacing values (in pixels) - matches Tailwind theme
const SPACE_VALUES = {
  none: 0,
  coupled: 4,        // Tightly coupled (icon + text)
  'repeating-sm': 6, // Small repeating items (pills, tags)
  repeating: 8,      // Repeating items (buttons, list items)
  'related-sm': 8,   // Related content (small)
  related: 16,       // Related content (form fields)
  'separated-sm': 24, // Separated sections (small)
  separated: 32,     // Major page sections
} as const;

export type SpaceValue = keyof typeof SPACE_VALUES;

// Alignment mapping for cleaner API
const ALIGN_MAP: Record<string, FlexAlignType> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

export type AlignValue = keyof typeof ALIGN_MAP;

// Justify mapping
const JUSTIFY_MAP = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
} as const;

export type JustifyValue = keyof typeof JUSTIFY_MAP;

export interface HStackProps {
  /** Semantic spacing between children */
  space?: SpaceValue;
  /** Vertical alignment of children */
  align?: AlignValue;
  /** Horizontal distribution of children */
  justify?: JustifyValue;
  /** Whether to wrap children to next line */
  wrap?: boolean;
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
 * HStack - Horizontal stack with semantic spacing
 *
 * Applies marginLeft to all children except the first one.
 * This pattern works reliably across all React Native versions.
 */
export function HStack({
  space = 'related',
  align = 'center',
  justify = 'start',
  wrap = false,
  children,
  className,
  style,
  testID,
}: HStackProps) {
  const spaceValue = SPACE_VALUES[space];
  const childArray = Children.toArray(children).filter(Boolean);

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: ALIGN_MAP[align],
    justifyContent: JUSTIFY_MAP[justify],
    flexWrap: wrap ? 'wrap' : 'nowrap',
  };

  return (
    <View className={className} style={[containerStyle, style]} testID={testID}>
      {childArray.map((child, index) => {
        if (!isValidElement(child)) {
          return child;
        }

        // Apply marginLeft to all children except the first
        const marginStyle: ViewStyle =
          index > 0 ? { marginLeft: spaceValue } : {};

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

export default HStack;
