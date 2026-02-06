/**
 * Virtualization Utilities
 *
 * Components and hooks for virtualized list rendering using
 * React Native's FlatList.
 */

import React, { useCallback } from 'react';
import { FlatList, View, StyleSheet, ListRenderItemInfo } from 'react-native';

// ============================================================================
// VirtualizedItemList
// ============================================================================

interface VirtualizedItemListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  estimatedItemHeight?: number;
  header?: React.ReactElement;
  footer?: React.ReactElement;
  emptyComponent?: React.ReactElement;
  onEndReached?: () => void;
  testID?: string;
}

/**
 * Optimized virtualized list component for rendering large item lists.
 */
export function VirtualizedItemList<T>({
  items,
  renderItem,
  keyExtractor,
  estimatedItemHeight = 80,
  header,
  footer,
  emptyComponent,
  onEndReached,
  testID,
}: VirtualizedItemListProps<T>): React.ReactElement {
  const renderFlatListItem = useCallback(
    ({ item, index }: ListRenderItemInfo<T>) => renderItem(item, index),
    [renderItem]
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<T> | null | undefined, index: number) => ({
      length: estimatedItemHeight,
      offset: estimatedItemHeight * index,
      index,
    }),
    [estimatedItemHeight]
  );

  return (
    <FlatList
      testID={testID}
      data={items}
      renderItem={renderFlatListItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={emptyComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={8}
      updateCellsBatchingPeriod={50}
    />
  );
}

// ============================================================================
// useOptimizedList Hook
// ============================================================================

interface OptimizedListOptions<T> {
  keyField: keyof T;
  estimatedItemHeight?: number;
}

/**
 * Hook that provides optimized FlatList props for a given item list.
 */
export function useOptimizedList<T>(
  items: T[],
  options: OptimizedListOptions<T>
) {
  const { keyField, estimatedItemHeight = 80 } = options;

  const keyExtractor = useCallback(
    (item: T) => String(item[keyField]),
    [keyField]
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<T> | null | undefined, index: number) => ({
      length: estimatedItemHeight,
      offset: estimatedItemHeight * index,
      index,
    }),
    [estimatedItemHeight]
  );

  return {
    keyExtractor,
    getItemLayout,
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    windowSize: 5,
    initialNumToRender: 8,
  };
}

// ============================================================================
// VirtualizedSectionList (for grouped items)
// ============================================================================

interface Section<T> {
  title: string;
  data: T[];
}

interface VirtualizedSectionListProps<T> {
  sections: Section<T>[];
  renderItem: (item: T, index: number) => React.ReactElement;
  renderSectionHeader: (title: string) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  estimatedItemHeight?: number;
  testID?: string;
}

/**
 * Flattened virtualized list that simulates sections.
 * More performant than SectionList for large data sets.
 */
export function VirtualizedSectionList<T>({
  sections,
  renderItem,
  renderSectionHeader,
  keyExtractor,
  estimatedItemHeight = 80,
  testID,
}: VirtualizedSectionListProps<T>): React.ReactElement {
  // Flatten sections into a single list with header markers
  type FlatItem = { type: 'header'; title: string } | { type: 'item'; item: T; index: number };

  const flattenedData = React.useMemo((): FlatItem[] => {
    const result: FlatItem[] = [];
    sections.forEach((section) => {
      result.push({ type: 'header', title: section.title });
      section.data.forEach((item, idx) => {
        result.push({ type: 'item', item, index: idx });
      });
    });
    return result;
  }, [sections]);

  const renderFlatItem = useCallback(
    ({ item }: ListRenderItemInfo<FlatItem>) => {
      if (item.type === 'header') {
        return renderSectionHeader(item.title);
      }
      return renderItem(item.item, item.index);
    },
    [renderItem, renderSectionHeader]
  );

  const flatKeyExtractor = useCallback(
    (item: FlatItem, index: number) => {
      if (item.type === 'header') {
        return `header-${item.title}-${index}`;
      }
      return keyExtractor(item.item, item.index);
    },
    [keyExtractor]
  );

  return (
    <FlatList
      testID={testID}
      data={flattenedData}
      renderItem={renderFlatItem}
      keyExtractor={flatKeyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={8}
    />
  );
}
