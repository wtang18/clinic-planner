# Native Pickers Implementation Guide

## Overview

This document outlines the approach for implementing native date and select pickers for React Native components while maintaining API compatibility with the web design system.

## DateInput Component - Native Date Picker Integration

### Current Implementation
- Text-based entry with calendar icon
- Format: YYYY-MM-DD
- Manual validation required
- Cross-platform compatible but poor UX

### Recommended Native Implementation

#### Library: @react-native-community/datetimepicker

```bash
npm install @react-native-community/datetimepicker
```

#### Implementation Pattern

```typescript
import DateTimePicker from '@react-native-community/datetimepicker';

export const DateInput = React.forwardRef<TextInput, DateInputProps>(
  ({ value, onChangeText, ... }, ref) => {
    const [showPicker, setShowPicker] = useState(false);
    const [dateValue, setDateValue] = useState<Date | undefined>(
      value ? new Date(value) : undefined
    );

    // Trigger native picker on input press
    const handlePress = () => {
      if (!editable) return;
      setShowPicker(true);
    };

    // Handle date selection from native picker
    const handleDateChange = (event: any, selectedDate?: Date) => {
      setShowPicker(false); // iOS only shows picker once

      if (selectedDate) {
        setDateValue(selectedDate);
        // Convert to YYYY-MM-DD format for consistency with web
        const formatted = selectedDate.toISOString().split('T')[0];
        onChangeText?.(formatted);
      }
    };

    return (
      <View>
        {label && <Text>{label}</Text>}

        {/* Touchable wrapper to trigger picker */}
        <TouchableOpacity
          onPress={handlePress}
          disabled={!editable}
          activeOpacity={0.7}
        >
          <View pointerEvents="none">
            <TextInput
              ref={ref}
              value={value}
              editable={false} // Prevent keyboard, use picker only
              placeholder={placeholder}
              // ... styling props
            />
            <Icon name="calendar" /> {/* Calendar icon */}
          </View>
        </TouchableOpacity>

        {/* Native picker modal (iOS) or inline picker (Android) */}
        {showPicker && (
          <DateTimePicker
            value={dateValue || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}

        {helperText && <Text>{helperText}</Text>}
      </View>
    );
  }
);
```

### Platform-Specific Behaviors

#### iOS
- **Display**: Modal wheel picker (spinner)
- **User Experience**:
  - Tap input → picker slides up from bottom
  - User spins wheels to select year, month, day
  - Tap outside or "Done" to confirm
- **Props**: `display="spinner"` or `display="inline"`

#### Android
- **Display**: Native calendar dropdown
- **User Experience**:
  - Tap input → calendar dialog appears
  - User taps date on calendar
  - Selection immediately closes dialog
- **Props**: `display="default"` (calendar) or `display="spinner"` (wheel)

#### Web (Compatibility)
- Uses native HTML5 `<input type="date">`
- No DateTimePicker needed
- Same API: value + onChangeText/onChange

### API Compatibility Matrix

| Prop | Web | RN (Text) | RN (Native) | Notes |
|------|-----|-----------|-------------|-------|
| `value` | string (YYYY-MM-DD) | string | string | ✅ Fully compatible |
| `onChangeText` | ✅ | ✅ | ✅ | RN uses onChangeText |
| `onChange` | ✅ | N/A | N/A | Web uses onChange event |
| `placeholder` | ✅ | ✅ | ✅ | Same |
| `disabled/editable` | disabled | editable={false} | editable={false} | ✅ Inverse bool |
| `label` | ✅ | ✅ | ✅ | Same |
| `helperText` | ✅ | ✅ | ✅ | Same |
| `error` | ✅ | ✅ | ✅ | Same |
| `required` | ✅ | ✅ | ✅ | Same |

### Migration Strategy

**Option 1: Replace current DateInput.tsx entirely**
- Remove text-based entry
- Implement native picker approach
- Best UX but breaks text entry fallback

**Option 2: Add `useNativePicker` prop**
```typescript
export interface DateInputProps {
  // ...existing props
  /** Use native date picker instead of text input (default: true) */
  useNativePicker?: boolean;
}
```
- `useNativePicker={true}`: Uses @react-native-community/datetimepicker (default)
- `useNativePicker={false}`: Falls back to text-based entry
- Allows gradual migration and testing

**Recommendation**: Option 1 (full replacement) for better UX

---

## Select Component - Native Picker Integration

### Current Implementation
- **Does not exist yet in RN**
- Web uses native HTML `<select>` dropdown

### Recommended Native Implementation

#### Library: @react-native-picker/picker

```bash
npm install @react-native-picker/picker
```

#### Implementation Pattern

```typescript
import { Picker } from '@react-native-picker/picker';

export const Select = React.forwardRef<Picker<string | number>, SelectProps>(
  ({ options, value, onValueChange, label, ... }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View>
        {label && <Text>{label}</Text>}

        {/* Container with Input-like styling */}
        <View style={[containerStyle /* matches Input component */]}>
          <Picker
            ref={ref}
            selectedValue={value}
            onValueChange={onValueChange}
            enabled={editable}
            style={pickerStyle}
            // iOS specific
            itemStyle={Platform.OS === 'ios' ? { height: 120 } : undefined}
          >
            {options?.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>

          {/* Dropdown icon (styled to match web) */}
          <Icon name="chevron-compact-down" />
        </View>

        {helperText && <Text>{helperText}</Text>}
      </View>
    );
  }
);
```

### Platform-Specific Behaviors

#### iOS
- **Display**: Wheel picker (spinner)
- **Integration**:
  - Inline: Shows picker inline in the layout (tall ~120px per item)
  - Modal: Triggered via TouchableOpacity, slides up from bottom
- **User Experience**:
  - Tap input → picker modal slides up
  - Spin to select option
  - Tap "Done" or outside to confirm
- **Styling**: Limited styling options, native iOS appearance

#### Android
- **Display**: Native dropdown menu
- **Integration**: Picker integrated directly into View
- **User Experience**:
  - Tap input → dropdown menu appears below
  - Tap option to select
  - Selection immediately applied
- **Styling**: Follows Material Design, respects theme

#### Web (Compatibility)
- Uses native HTML `<select>` element
- Dropdown menu (browser-specific styling)
- Same API: value + onChange

### Two Approach Options for RN Select

#### **Approach A: Inline Picker (Android-style)**

```typescript
// Picker always visible in layout
<View style={containerStyle}>
  <Picker {...props}>
    {options.map(...)}
  </Picker>
</View>
```

**Pros:**
- Simple implementation
- Works well on Android (native dropdown)
- No modal management

**Cons:**
- iOS inline picker is very tall (120px per visible item)
- Doesn't match web's compact dropdown UX
- Poor iOS UX

#### **Approach B: Modal Picker (iOS-style)** ⭐ RECOMMENDED

```typescript
export const Select = ({ ... }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);

  const handlePress = () => {
    if (!editable) return;
    setShowPicker(true);
  };

  const handleValueChange = (itemValue: any) => {
    setSelectedValue(itemValue);
    if (Platform.OS === 'android') {
      // Android: immediate selection
      onValueChange?.(itemValue);
    }
  };

  const handleConfirm = () => {
    setShowPicker(false);
    if (Platform.OS === 'ios') {
      // iOS: confirm on modal close
      onValueChange?.(selectedValue);
    }
  };

  return (
    <View>
      {label && <Text>{label}</Text>}

      {/* Touchable input (triggers picker) */}
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <View pointerEvents="none" style={containerStyle}>
          <Text>{selectedLabel}</Text>
          <Icon name="chevron-compact-down" />
        </View>
      </TouchableOpacity>

      {/* Modal picker (iOS) */}
      {Platform.OS === 'ios' && showPicker && (
        <Modal transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <View style={styles.toolbar}>
                <Button title="Done" onPress={handleConfirm} />
              </View>
              <Picker
                selectedValue={selectedValue}
                onValueChange={handleValueChange}
              >
                {options.map(...)}
              </Picker>
            </View>
          </View>
        </Modal>
      )}

      {/* Inline picker (Android) */}
      {Platform.OS === 'android' && showPicker && (
        <Picker
          selectedValue={selectedValue}
          onValueChange={handleValueChange}
          style={{ position: 'absolute' }}
        >
          {options.map(...)}
        </Picker>
      )}
    </View>
  );
};
```

**Pros:**
- Matches web UX (compact input, picker on interaction)
- Native platform behaviors (wheel on iOS, dropdown on Android)
- Better visual match to Input component design
- User-friendly on both platforms

**Cons:**
- More complex implementation
- Requires Modal management for iOS
- More code to maintain

**Recommendation**: Use Approach B (Modal Picker) for consistency with web UX and better cross-platform experience.

### API Compatibility Matrix

| Prop | Web | RN (Picker) | Notes |
|------|-----|-------------|-------|
| `value` | string/number | string/number | ✅ Same |
| `onChange` | (e) => void | N/A | Web uses event |
| `onValueChange` | N/A | (value) => void | RN uses direct value |
| `options` | Array<{value, label}> | Array<{value, label}> | ✅ Same structure |
| `disabled/editable` | disabled | enabled | ✅ Inverse bool |
| `label` | ✅ | ✅ | Same |
| `helperText` | ✅ | ✅ | Same |
| `error` | ✅ | ✅ | Same |
| `type` | outlined/filled | outlined/filled | ✅ Same styling types |
| `size` | small/medium/large | small/medium/large | ✅ Same sizes |

### Picker Styling Considerations

#### Container Styling (Input-like)
- Match Input component exactly (components/Input.tsx)
- Two types: outlined (border) and filled (background)
- Three sizes: small (32px), medium (40px), large (56px)
- Focus states, error states, disabled states
- Use exact design tokens

#### Picker Element Styling
- **iOS**: Very limited styling (native wheel appearance)
  - Can set `itemStyle` for item height/font
  - Cannot change wheel colors, borders, etc.
- **Android**: Respects some styling
  - `style` prop affects container
  - `dropdownIconColor` for icon color
  - Limited control over dropdown menu appearance

#### Workaround for Styling
- Hide native Picker element
- Show styled TouchableOpacity with selected value text
- Display Picker only when modal/dropdown is active
- This gives full control over input appearance while using native picker for selection

---

## Implementation Checklist

### DateInput with Native Picker
- [ ] Install `@react-native-community/datetimepicker`
- [ ] Update DateInput.tsx to use DateTimePicker
- [ ] Add TouchableOpacity trigger
- [ ] Handle platform-specific display modes
- [ ] Convert Date to/from YYYY-MM-DD string format
- [ ] Maintain all existing props (label, helperText, error, etc.)
- [ ] Update DateInput.stories.tsx with native picker examples
- [ ] Add platform differences callouts to documentation
- [ ] Test on iOS simulator (wheel picker)
- [ ] Test on Android emulator (calendar picker)

### Select with Native Picker
- [ ] Install `@react-native-picker/picker`
- [ ] Create Select.tsx component
- [ ] Implement Modal approach (Approach B)
- [ ] Match Input component styling exactly
- [ ] Add TouchableOpacity trigger with selected value display
- [ ] Implement iOS Modal with Picker + Done button
- [ ] Implement Android inline Picker behavior
- [ ] Support both `options` prop and `children` (Picker.Item)
- [ ] Add all Input-matching props (type, size, label, helperText, error)
- [ ] Create Select.stories.tsx with comprehensive documentation
- [ ] Add platform differences callouts
- [ ] Test on iOS simulator (modal wheel picker)
- [ ] Test on Android emulator (dropdown menu)

---

## Platform Differences Summary

### DateInput

| Feature | Web | iOS | Android |
|---------|-----|-----|---------|
| **Picker Type** | Browser date picker | Wheel spinner | Calendar dialog |
| **Trigger** | Click input | Tap input | Tap input |
| **Display** | Inline/dropdown (browser) | Modal from bottom | Dialog overlay |
| **Selection** | Calendar grid | Spin wheels | Tap date |
| **Confirmation** | Immediate | Tap Done/outside | Immediate |
| **Format** | YYYY-MM-DD | Date object → formatted | Date object → formatted |

### Select

| Feature | Web | iOS | Android |
|---------|-----|-----|---------|
| **Picker Type** | Dropdown menu | Wheel spinner | Dropdown menu |
| **Trigger** | Click select | Tap input | Tap input |
| **Display** | Dropdown (browser) | Modal from bottom | Dropdown below input |
| **Selection** | Click option | Spin + tap Done | Tap option |
| **Confirmation** | Immediate | Tap Done/outside | Immediate |
| **Styling** | Full CSS control | Very limited | Limited (Material) |

---

## Code Examples

See implementation patterns above and refer to:
- `/Users/william.tang/Projects/clinic-planner/sample-apps/react-native-demo/components/DateInput.tsx` (current text-based)
- `/Users/william.tang/Projects/clinic-planner/sample-apps/react-native-demo/components/Input.tsx` (styling reference)
- `/Users/william.tang/Projects/clinic-planner/sample-apps/react-native-demo/docs/RN_COMPONENT_GUIDELINES.md` (component standards)
- `/Users/william.tang/Projects/clinic-planner/src/design-system/components/Select.tsx` (web Select component)
