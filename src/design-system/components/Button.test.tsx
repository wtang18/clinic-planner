import React from 'react';
import { Button } from './Button';

// Test component to showcase all Button variants
export default function ButtonTest() {
  return (
    <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-heading-4xl text-gray-900 mb-8">Button Component Test</h1>

        {/* All Type Variants */}
        <section className="mb-12">
          <h2 className="text-heading-2xl text-gray-900 mb-6">Type Variants</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            <Button type="primary" label="Primary" />
            <Button type="outlined" label="Outlined" />
            <Button type="solid" label="Solid" />
            <Button type="transparent" label="Transparent" />
            <Button type="generative" label="Generative" />
            <Button type="high-impact" label="High Impact" />
            <Button type="no-fill" label="No Fill" />
            <Button type="subtle" label="Subtle" />
            <Button type="carby" label="Carby" />
          </div>
        </section>

        {/* Size Variants */}
        <section className="mb-12">
          <h2 className="text-heading-2xl text-gray-900 mb-6">Size Variants</h2>
          <div className="flex flex-wrap items-end gap-4">
            <Button size="x-small" label="X-Small" />
            <Button size="small" label="Small" />
            <Button size="medium" label="Medium" />
            <Button size="large" label="Large" />
            <Button size="large-floating" label="Large Floating" />
          </div>
        </section>

        {/* States */}
        <section className="mb-12">
          <h2 className="text-heading-2xl text-gray-900 mb-6">Button States</h2>
          <div className="flex flex-wrap gap-4">
            <Button state="default" label="Default" />
            <Button state="hover" label="Hover" />
            <Button state="disabled" label="Disabled" />
            <Button disabled label="Disabled Prop" />
          </div>
        </section>

        {/* Icon Combinations */}
        <section className="mb-12">
          <h2 className="text-heading-2xl text-gray-900 mb-6">Icon Variations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button iconL label="Left Icon" />
            <Button iconR label="Right Icon" />
            <Button iconL iconR label="Both Icons" />
            <Button iconOnly iconL aria-label="Icon Only Button" />
          </div>
        </section>

        {/* Text Variations */}
        <section className="mb-12">
          <h2 className="text-heading-2xl text-gray-900 mb-6">Text Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              size="medium"
              label="Main Label"
              showSubtext
              subtext="With subtext"
            />
            <Button
              size="large"
              label="Large Button"
              showSubtext
              subtext="Larger with subtext"
              iconL
            />
            <Button
              size="large-floating"
              label="Floating Style"
              showSubtext
              subtext="Maximum size"
              iconL
              iconR
            />
          </div>
        </section>

        {/* Custom Icons */}
        <section className="mb-12">
          <h2 className="text-heading-2xl text-gray-900 mb-6">Custom Icons</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              leftIcon={
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12L15 7H5L10 12Z" />
                </svg>
              }
              label="Custom Left"
            />
            <Button
              rightIcon={
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M12 10L7 5V15L12 10Z" />
                </svg>
              }
              label="Custom Right"
            />
            <Button
              leftIcon={
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
                </svg>
              }
              label="Success"
              type="solid"
            />
          </div>
        </section>

        {/* Real-world Examples */}
        <section className="mb-12">
          <h2 className="text-heading-2xl text-gray-900 mb-6">Real-world Examples</h2>
          <div className="space-y-6">

            {/* Form Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-heading-lg text-gray-800 mb-4">Form Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button type="primary" size="medium" label="Save Changes" />
                <Button type="outlined" size="medium" label="Cancel" />
                <Button type="transparent" size="medium" label="Preview" />
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-heading-lg text-gray-800 mb-4">Navigation</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="outlined"
                  size="small"
                  iconL
                  label="Back"
                />
                <Button
                  type="primary"
                  size="small"
                  iconR
                  label="Continue"
                />
                <Button
                  type="no-fill"
                  size="small"
                  label="Skip"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-heading-lg text-gray-800 mb-4">Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="high-impact"
                  size="medium"
                  label="Delete Event"
                />
                <Button
                  type="carby"
                  size="medium"
                  label="Schedule"
                />
                <Button
                  type="generative"
                  size="medium"
                  label="AI Generate"
                />
              </div>
            </div>

            {/* Icon-only toolbar */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-heading-lg text-gray-800 mb-4">Toolbar (Icon Only)</h3>
              <div className="flex gap-2">
                <Button
                  iconOnly
                  iconL
                  type="subtle"
                  size="small"
                  aria-label="Edit"
                />
                <Button
                  iconOnly
                  iconL
                  type="subtle"
                  size="small"
                  aria-label="Copy"
                />
                <Button
                  iconOnly
                  iconL
                  type="subtle"
                  size="small"
                  aria-label="Delete"
                />
                <div className="border-l border-gray-200 mx-2" />
                <Button
                  iconOnly
                  iconL
                  type="outlined"
                  size="small"
                  aria-label="Settings"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility Test */}
        <section className="mb-12">
          <h2 className="text-heading-2xl text-gray-900 mb-6">Accessibility Features</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Test keyboard navigation (Tab to focus, Enter/Space to activate):</p>
              <div className="flex flex-wrap gap-3">
                <Button label="Focusable 1" />
                <Button label="Focusable 2" />
                <Button label="Focusable 3" />
                <Button disabled label="Not Focusable" />
              </div>
              <p className="text-xs text-gray-500 mt-4">
                • Focus ring visible on keyboard navigation<br/>
                • Disabled buttons are not focusable<br/>
                • Icon-only buttons have aria-label for screen readers<br/>
                • Proper semantic button element used
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}