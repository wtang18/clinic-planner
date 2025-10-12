# Component Documentation Guidelines

**Version:** 1.0
**Last Updated:** 2025-01-11
**Purpose:** Standardized documentation template and principles for all design system components

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Documentation Voice & Tone](#documentation-voice--tone)
3. [Universal Documentation Template](#universal-documentation-template)
4. [Documentation Content Template](#documentation-content-template)
5. [Story Organization Template](#story-organization-template)
6. [AccessibilityDemo Template](#accessibilitydemo-template)
7. [ClaudeCodeExamples Template](#claudecodeexamples-template)
8. [Adaptation Rules by Component Type](#adaptation-rules-by-component-type)
9. [Component-Specific Sections Guide](#component-specific-sections-guide)
10. [Examples](#examples)

---

## Core Principles

1. **Consistency** - All components follow the same structure and voice
2. **Clarity** - Information is easy to scan and understand
3. **Completeness** - Cover functionality, accessibility, and best practices
4. **Practicality** - Include real-world examples and use cases
5. **AI-Friendly** - Documentation helps Claude Code understand component usage
6. **Progressive Disclosure** - Start simple, add complexity gradually

---

## Documentation Voice & Tone

- **Professional but approachable** - Not overly formal
- **Action-oriented** - Use active voice ("Use this for..." not "This can be used for...")
- **Concise** - Respect reader's time, get to the point
- **Educational** - Explain the "why" not just the "what"
- **Consistent terminology** - Use same terms across all docs (e.g., "variant" vs "type")
- **No redundancy** - Don't repeat information that's elsewhere

---

## Universal Documentation Template

### ⚠️ CRITICAL REQUIREMENT: Enable Docs Page

**ALWAYS include `tags: ['autodocs']` in your meta configuration.**

This creates the **Docs page** (gold file icon 📄) in Storybook sidebar, which is the primary way users access component documentation.

**Without this tag, the comprehensive documentation you write will NOT be visible as a dedicated Docs page.**

---

### Meta Configuration Structure

```typescript
const meta: Meta<typeof Component> = {
  title: 'Design System/Components/ComponentName',
  component: Component,
  tags: ['autodocs'],  // ⚠️ REQUIRED - Creates the Docs page (gold icon)

  argTypes: {
    // 1. CORE PROPS (required or primary)
    // 2. CONTENT PROPS (text, labels)
    // 3. VISUAL PROPS (icons, images)
    // 4. LAYOUT PROPS (size, spacing)
    // 5. INTERACTION PROPS (onChange, onClick)
    // 6. STATE PROPS (disabled, loading, error)
    // 7. ACCESSIBILITY PROPS (aria-*, categorized)
  },

  parameters: {
    controls: {
      exclude: ['children', 'className', 'style', 'ref', 'key', /* component-specific exclusions */]
    },
    docs: {
      description: {
        component: `
          [DOCUMENTATION CONTENT - See template below]
        `
      }
    }
  }
}
```

---

## Documentation Content Template

```markdown
# [Component Name]

[One-sentence description starting with "Production-ready..." describing what it is and key value prop]

## Quick Reference

**[Key Attribute 1]**: Value (e.g., "Types: 9 variants")
**[Key Attribute 2]**: Value (e.g., "Sizes: 5 sizes")
**[Key Attribute 3]**: Value (e.g., "Tokens: Uses semantic X tokens")

---

## Features

- ✅ **[Feature 1]**: Description
- ✅ **[Feature 2]**: Description
- ✅ **[Feature 3]**: Description
- ✅ **[Feature 4]**: Description
- ✅ **[Feature 5]**: Description

---

## [Component-Specific Section 1] (e.g., "Types" or "Variants")

[If component has multiple variants/types, show in table]

| Type/Variant | Token/Value | Use Case |
|--------------|-------------|----------|
| `name` | `token-name` | When to use |

[OR if simple, use bullet list]

---

## [Component-Specific Section 2] (e.g., "Sizes")

[Always use table for sizes if component has multiple]

| Size | Dimensions | [Relevant Property] | Use Case |
|------|------------|---------------------|----------|
| `x-small` | 24px | value | Context |

**Note:** [Any important sizing details]

---

## [Component-Specific Section 3] (e.g., "Icon System", "Options Format")

[Only include if component has this feature]

[Explanation of the feature]

**Examples:**
\`\`\`tsx
// Example 1
<Component prop="value" />

// Example 2
<Component prop="value2" />
\`\`\`

---

## Token Usage

[Component name] uses semantic tokens that adapt to themes:

\`\`\`tsx
// [Primary use case]
<Component variant="example">
  // Uses: [token-name-1], [token-name-2]
</Component>

// [Secondary use case]
<Component variant="example2">
  // Uses: [token-name-3]
  // Hover: [token-name-4]
</Component>
\`\`\`

[OR CSS examples if more appropriate]

\`\`\`css
.component-variant {
  property: var(--token-name);
}
\`\`\`

---

## Accessibility

All [Component] components follow WCAG 2.1 Level AA guidelines and include comprehensive keyboard and screen reader support.

### Keyboard Navigation

- **[Key 1]**: Action description
- **[Key 2]**: Action description
- **[Key 3]**: Action description

### Screen Reader Support

[Component name] automatically includes proper ARIA attributes:
- **[aria-attribute-1]**: Purpose/behavior
- **[aria-attribute-2]**: Purpose/behavior
- **[aria-attribute-3]**: Purpose/behavior

### Focus Management

[Describe focus indicator behavior]
- **Focus ring**: Description
- **High contrast**: Behavior
- **Keyboard only**: Behavior (if applicable)

### [Component-Specific A11y Feature] (if applicable)

[Special accessibility considerations]

\`\`\`tsx
// ✅ Correct
<Component aria-label="Descriptive text" />

// ❌ Wrong
<Component />
\`\`\`

### Disabled State (if applicable)

[Describe how disabled state affects accessibility]

### Color Contrast (if visual component)

All [component] variants meet WCAG AA contrast requirements:
- **[Variant 1]**: Contrast ratio
- **[Variant 2]**: Contrast ratio

### Best Practices for Accessibility

✅ **Do**:
- [Specific accessibility guideline]
- [Specific accessibility guideline]
- [Specific accessibility guideline]

❌ **Don't**:
- [Specific anti-pattern]
- [Specific anti-pattern]
- [Specific anti-pattern]

---

## Best Practices

### ✅ When to Use [Component]

- [Use case 1]
- [Use case 2]
- [Use case 3]

### ✅ Do

- [Best practice 1]
- [Best practice 2]
- [Best practice 3]

### ❌ Don't

- [Anti-pattern 1]
- [Anti-pattern 2]
- [Anti-pattern 3]
```

---

## Story Organization Template

### Required Stories (All Components)

#### 1. Playground
Interactive controls for testing all props.

```typescript
export const Playground: Story = {
  args: {
    // Most common default values
  }
}
```

#### 2. Overview Story
Shows all variants at once.
- **Name:** `AllTypes`, `AllVariants`, or `Overview`
- Shows every variant/type side by side
- Grouped logically if many variants

#### 3. Sizes Story (if component has sizes)
- **Name:** `AllSizes`
- Shows all size options
- Aligned for comparison

#### 4. States Story (if component has interactive states)
- **Name:** `States`, `AllStates`, or `InteractiveStates`
- Shows default, hover, disabled, error, etc.
- Both static and interactive examples

### Conditional Stories (Based on Features)

#### 5. Icon/Visual Content Story (if applicable)
- **Name:** `WithIcons`, `IconVariations`, `WithImages`
- Show examples of visual content integration
- Multiple categories if extensive

#### 6. Complex Content Story (if applicable)
- **Name:** `WithSubtext`, `WithComplexContent`, `NestedContent`
- Shows component with additional content features

#### 7. Real World Examples (recommended for all)
- **Name:** `RealWorldExamples`, `UsageExamples`
- Practical, realistic scenarios
- Multiple contexts

#### 8. Tester/Sandbox (optional, useful for icon/customization)
- **Name:** `IconTester`, `Sandbox`, `CustomizationTester`
- Editable props for experimentation

#### 9. AccessibilityDemo (required for all)
- Interactive accessibility demonstrations
- Keyboard navigation examples
- ARIA attribute examples
- Color contrast comparisons
- Do/Don't examples with visual indicators

#### 10. ClaudeCodeExamples (required for all)
- Natural language prompts for AI
- Expected outcomes
- Pro tips section
- 4-6 examples covering common tasks

---

## Story Structure Pattern

```typescript
export const StoryName: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      {/* If single section */}
      <div>
        <h3 className="text-lg font-bold mb-4">[Section Title]</h3>
        <p className="text-sm text-gray-600 mb-4">[Optional description]</p>
        <div className="flex [layout classes]">
          {/* Component examples */}
        </div>
      </div>

      {/* If multiple sections */}
      <div>
        <h3 className="text-lg font-bold mb-4">[Section 1 Title]</h3>
        {/* Content */}
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">[Section 2 Title]</h3>
        {/* Content */}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '[Optional story-specific description]'
      }
    }
  }
};
```

---

## AccessibilityDemo Template

```typescript
export const AccessibilityDemo: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Accessibility Features</h3>
        <p className="text-sm text-gray-700 mb-4">
          [Component] follows WCAG 2.1 Level AA guidelines.
        </p>
        <ul className="text-sm space-y-2 mb-6 text-gray-700">
          <li>✓ [Feature 1]</li>
          <li>✓ [Feature 2]</li>
          <li>✓ [Feature 3]</li>
        </ul>

        <div className="space-y-6">
          {/* Keyboard Navigation Demo */}
          <div>
            <h4 className="text-base font-semibold mb-3">Keyboard Navigation</h4>
            <p className="text-sm text-gray-600 mb-3">
              [Instructions to try keyboard navigation]
            </p>
            {/* Interactive examples */}
          </div>

          {/* ARIA Attributes Demo */}
          <div>
            <h4 className="text-base font-semibold mb-3">[ARIA Feature]</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {/* Example */}
                <code className="text-sm bg-white px-2 py-1 rounded">[Code]</code>
                <span className="text-sm text-green-600">✓ Correct</span>
              </div>
            </div>
          </div>

          {/* Additional sections as needed */}
        </div>
      </div>
    </div>
  )
};
```

---

## ClaudeCodeExamples Template

```typescript
export const ClaudeCodeExamples: Story = {
  render: () => (
    <div className="p-8 max-w-4xl bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6">Working with Claude Code (AI Assistant)</h2>
      <p className="text-gray-600 mb-8">
        Use these natural language prompts when working with [Component].
      </p>

      <div className="space-y-8">
        {/* Example 1 */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-[color]">[Emoji]</span>
            [Task Title]
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "[Natural language prompt]"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will [describe outcome with inline <code>]
          </p>
        </div>

        {/* Repeat for 4-6 examples */}
      </div>

      {/* Pro Tips */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• [Tip 1]</li>
          <li>• [Tip 2]</li>
          <li>• [Tip 3]</li>
        </ul>
      </div>
    </div>
  )
};
```

### ClaudeCodeExamples Emoji Guide

Use consistent emojis for task categories:

- 🎨 **Update/Change Variant or Type**
- 📏 **Adjust Size**
- ✨ **Add Feature** (icon, content, etc.)
- 🔄 **Migrate/Refactor** (to semantic tokens, etc.)
- ⚠️ **Destructive Actions** (delete, high-impact)
- ♿ **Accessibility** (add aria-label, improve a11y)
- 🏷️ **Labels/Text** (add descriptive labels)
- ⚡ **Immediate Actions/Effects** (toggle, show/hide)
- 🚫 **Disable/Conditional Logic**
- 📋 **Create/Build** (layouts, lists, etc.)

---

## Adaptation Rules by Component Type

### Form Components (Input, Toggle, Textarea, etc.)
- **Include:** Validation states, label requirements, helper text
- **Emphasize:** Accessibility (required fields, error messages)
- **Show:** Form context examples

### Layout Components (Card, Container, etc.)
- **Include:** Spacing options, semantic HTML variants
- **Emphasize:** When to nest vs not nest
- **Show:** Page layout examples

### Navigation Components (SegmentedControl, Pill, etc.)
- **Include:** Selection patterns (single vs multi)
- **Emphasize:** Keyboard navigation
- **Show:** Filter/navigation scenarios

### Display Components (Toast, etc.)
- **Include:** Timing, positioning, auto-dismiss
- **Emphasize:** When to use vs other notification methods
- **Show:** Different message types

---

## Component-Specific Sections Guide

Include **ONLY IF** the component has these features:

- **Icon System** - If component supports icons
- **Subtext/Secondary Content** - If component has additional text
- **Options Format** - If component takes structured data (like SegmentedControl)
- **Truncation** - If component handles overflow
- **Resize Behavior** - If component is resizable
- **Animation** - If component has transitions/animations
- **Auto-dismiss** - If component disappears automatically
- **Keyboard Shortcuts** - If component has special key bindings

---

## Examples

### Example: Gold Standard Components

See these components for reference implementations:

1. **Button.stories.tsx** - Complete example with all sections
   - Comprehensive Accessibility section
   - AccessibilityDemo story with interactive examples
   - ClaudeCodeExamples with 6 scenarios
   - IconTester sandbox

2. **Pill.stories.tsx** - Excellent example of complex component
   - Detailed icon system documentation
   - Text truncation examples
   - Comprehensive ClaudeCodeExamples

### Example: Minimal Component Template

For simple components, you can omit some sections but ALWAYS include:
- Quick Reference
- Features
- Token Usage
- Accessibility (minimum: keyboard nav + ARIA)
- Best Practices
- AccessibilityDemo story
- ClaudeCodeExamples story

---

## Checklist for New Component Documentation

Before finalizing component documentation, verify:

### Meta Configuration
- [ ] **⚠️ CRITICAL: `tags: ['autodocs']` is present** (enables Docs page with gold icon)
- [ ] Component title uses `# [Name]` format
- [ ] Opening line starts with "Production-ready..."

### Documentation Content
- [ ] Quick Reference has 3+ key attributes
- [ ] Features list has 5+ items with ✅
- [ ] All tables use proper markdown format
- [ ] Code examples use proper syntax highlighting
- [ ] Accessibility section covers keyboard, screen reader, focus
- [ ] Best Practices has both Do and Don't sections

### Stories
- [ ] Playground story exists with sensible defaults
- [ ] Overview story shows all variants
- [ ] **AccessibilityDemo story exists**
- [ ] **ClaudeCodeExamples story exists with 4-6 examples**
- [ ] All stories follow naming conventions

### Quality
- [ ] No redundant information between sections
- [ ] Voice and tone is consistent with other components
- [ ] **Verify Docs page appears in Storybook sidebar (gold file icon 📄)**

---

## Maintenance

- **Review:** Quarterly review of all component documentation
- **Updates:** When component API changes, update docs immediately
- **Feedback:** Collect developer feedback on clarity and completeness
- **Consistency:** Regular audits to ensure all components follow guidelines

---

**Reference Components:**
- Button (complete gold standard)
- Pill (complex component example)

**Questions?** Refer to existing gold standard components or update this document with new patterns as they emerge.
