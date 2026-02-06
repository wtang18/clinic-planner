/**
 * ShortcutHelpModal Component
 *
 * Displays a modal with all available keyboard shortcuts grouped by category.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, Pressable } from 'react-native';
import { X } from 'lucide-react';
import { shortcutManager, Shortcut } from './ShortcutManager';
import { formatKeyCombo } from './defaultShortcuts';
import {
  colors,
  spaceAround,
  spaceBetween,
  borderRadius,
  typography,
} from '../styles/foundations';

// ============================================================================
// Types
// ============================================================================

interface ShortcutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const CATEGORIES = [
  { id: 'navigation', label: 'Navigation' },
  { id: 'editing', label: 'Editing' },
  { id: 'actions', label: 'Actions' },
  { id: 'ai', label: 'AI Features' },
] as const;

// ============================================================================
// Component
// ============================================================================

export const ShortcutHelpModal: React.FC<ShortcutHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = shortcutManager.getAll();
  const isMac =
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.modal} testID="shortcut-help-modal">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Keyboard Shortcuts</Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && styles.closeBtnPressed,
            ]}
            testID="shortcut-help-close"
          >
            <X size={20} color={colors.fg.neutral.secondary} />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {CATEGORIES.map((category) => {
            const categoryShortcuts = shortcuts.filter(
              (s) => s.category === category.id
            );
            if (categoryShortcuts.length === 0) return null;

            return (
              <View key={category.id} style={styles.category}>
                <Text style={styles.categoryLabel}>{category.label}</Text>
                {categoryShortcuts.map((shortcut) => (
                  <View key={shortcut.id} style={styles.shortcutRow}>
                    <Text style={styles.description}>{shortcut.description}</Text>
                    <View style={styles.keyBadge}>
                      <Text style={styles.keyText}>
                        {formatKeyCombo(shortcut.key, isMac)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}

          <Text style={styles.footer}>Press ? anytime to show this help</Text>
        </ScrollView>
      </View>
    </View>
  );
};

ShortcutHelpModal.displayName = 'ShortcutHelpModal';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modal: {
    backgroundColor: colors.bg.neutral.base,
    borderRadius: borderRadius.lg,
    width: '90%',
    maxWidth: 480,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spaceAround.default,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.neutral.subtle,
  },
  title: {
    fontSize: 18,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.fg.neutral.primary,
  },
  closeBtn: {
    padding: spaceAround.nudge4,
    borderRadius: borderRadius.sm,
  },
  closeBtnPressed: {
    backgroundColor: colors.bg.neutral.subtle,
  },
  content: {
    padding: spaceAround.default,
  },
  category: {
    marginBottom: spaceAround.default,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.fg.neutral.spotReadable,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spaceAround.compact,
  },
  shortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spaceAround.tight,
  },
  description: {
    fontSize: 14,
    color: colors.fg.neutral.primary,
    flex: 1,
  },
  keyBadge: {
    backgroundColor: colors.bg.neutral.subtle,
    paddingVertical: 2,
    paddingHorizontal: spaceAround.tight,
    borderRadius: borderRadius.xs,
    marginLeft: spaceAround.compact,
  },
  keyText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
    color: colors.fg.neutral.secondary,
    fontWeight: typography.fontWeight.medium as '500',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    marginTop: spaceAround.default,
    paddingTop: spaceAround.compact,
    borderTopWidth: 1,
    borderTopColor: colors.border.neutral.subtle,
  },
});
