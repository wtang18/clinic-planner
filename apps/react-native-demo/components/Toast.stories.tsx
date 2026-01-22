import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Toast } from './Toast';
import { Button } from './Button';

const meta: Meta<typeof Toast> = {
  title: 'Design System/Components/Toast',
  component: Toast,
  argTypes: {
    type: {
      control: 'select',
      options: ['positive', 'alert', 'attention', 'info', 'icon', 'no-icon'],
      description: 'Toast variant type',
    },
    title: {
      control: 'text',
      description: 'Main notification title',
    },
    showSubtext: {
      control: 'boolean',
      description: 'Whether to show subtext',
    },
    subtext: {
      control: 'text',
      description: 'Subtext content',
    },
    showCta: {
      control: 'boolean',
      description: 'Whether to show CTA button',
    },
    ctaLabel: {
      control: 'text',
      description: 'CTA button label',
    },
    showClose: {
      control: 'boolean',
      description: 'Whether to show close button',
    },
    autoDismiss: {
      control: 'boolean',
      description: 'Auto-dismiss after timeout',
    },
    customIcon: {
      control: 'text',
      description: 'Custom icon name (for type="icon")',
    },
  },
  args: {
    type: 'positive',
    title: 'Notification Title',
    showSubtext: false,
    showCta: false,
    ctaLabel: 'Label',
    showClose: true,
    autoDismiss: true,
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>Toast</Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Notification component for displaying alerts, confirmations, and informational messages with optional actions.
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Quick Reference</Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 8 }}>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Types:</Text> positive, alert, attention, info, icon, no-icon
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Width:</Text> 480px (max-width: 100%)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Min Height:</Text> 72px
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Border Radius:</Text> 16px
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Shadow:</Text> elevation-lg
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Icon:</Text> 32x32px BicolorIcon
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Features</Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Six types: positive, alert, attention, info, icon, no-icon</Text>
          <Text style={{ fontSize: 14 }}>✅ Bicolor icons for semantic types</Text>
          <Text style={{ fontSize: 14 }}>✅ Optional subtext for additional context</Text>
          <Text style={{ fontSize: 14 }}>✅ Optional CTA button for actions</Text>
          <Text style={{ fontSize: 14 }}>✅ Optional close button</Text>
          <Text style={{ fontSize: 14 }}>✅ Auto-dismiss support (handled by parent)</Text>
          <Text style={{ fontSize: 14 }}>✅ Custom icon support</Text>
          <Text style={{ fontSize: 14 }}>✅ Accessibility with live regions</Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Usage Examples</Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 16 }}>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`<Toast\n  type="positive"\n  title="Success!"\n  showSubtext\n  subtext="Changes saved."\n  onClose={() => {}}\n/>`}
            </Text>
            <Toast
              type="positive"
              title="Success!"
              showSubtext
              subtext="Your changes have been saved."
              onClose={() => {}}
            />
          </View>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Accessibility</Text>
        <Text style={{ fontSize: 14, marginBottom: 8 }}>
          Follows WCAG 2.1 Level AA guidelines
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>✅ Live region announcements (polite/assertive)</Text>
          <Text style={{ fontSize: 14 }}>✅ Clear close button labels</Text>
          <Text style={{ fontSize: 14 }}>✅ Semantic icon meanings</Text>
          <Text style={{ fontSize: 14 }}>✅ Touch targets: 44x44 minimum</Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Best Practices</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>✅ Do</Text>
        <View style={{ gap: 6, marginBottom: 12 }}>
          <Text style={{ fontSize: 14 }}>• Use appropriate type for the message context</Text>
          <Text style={{ fontSize: 14 }}>• Keep title concise (1-2 lines)</Text>
          <Text style={{ fontSize: 14 }}>• Use subtext for additional context</Text>
          <Text style={{ fontSize: 14 }}>• Provide close button if autoDismiss is false</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>❌ Don't</Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>• Don't use for critical system errors (use modal)</Text>
          <Text style={{ fontSize: 14 }}>• Don't show multiple toasts simultaneously</Text>
          <Text style={{ fontSize: 14 }}>• Don't use long text in CTA buttons</Text>
          <Text style={{ fontSize: 14 }}>• Don't set autoDismiss=false without showClose=true</Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Platform Differences</Text>
        <Text style={{ fontSize: 14 }}>
          • RN uses TouchableOpacity instead of button{'\n'}
          • RN uses onPress instead of onClick{'\n'}
          • RN uses accessibilityLiveRegion{'\n'}
          • No ToastProvider needed (use state management){'\n'}
          • Position managed by parent component
        </Text>
      </View>
    </ScrollView>
  ),
};

export const Playground: Story = {
  render: (args) => {
    const [show, setShow] = useState(true);

    return (
      <View style={{ padding: 16, gap: 16 }}>
        <Button
          type="primary"
          size="medium"
          label={show ? 'Hide Toast' : 'Show Toast'}
          onPress={() => setShow(!show)}
        />
        {show && (
          <Toast
            {...args}
            onClose={() => setShow(false)}
          />
        )}
      </View>
    );
  },
  args: {
    type: 'positive',
    title: 'Notification Title',
    showSubtext: true,
    subtext: 'Additional context goes here',
    showCta: false,
    ctaLabel: 'View',
    showClose: true,
    autoDismiss: true,
  },
};

export const AllTypes: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ gap: 16 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Positive</Text>
          <Toast
            type="positive"
            title="Success!"
            showSubtext
            subtext="Your changes have been saved successfully."
            onClose={() => {}}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Alert</Text>
          <Toast
            type="alert"
            title="Error occurred"
            showSubtext
            subtext="Unable to save changes. Please try again."
            onClose={() => {}}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Attention</Text>
          <Toast
            type="attention"
            title="Action required"
            showSubtext
            subtext="Please verify your email address."
            onClose={() => {}}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Info</Text>
          <Toast
            type="info"
            title="New update available"
            showSubtext
            subtext="Version 2.0 is now available for download."
            onClose={() => {}}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Custom Icon</Text>
          <Toast
            type="icon"
            customIcon="star"
            title="Featured content"
            showSubtext
            subtext="This item has been marked as featured."
            onClose={() => {}}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>No Icon</Text>
          <Toast
            type="no-icon"
            title="Simple notification"
            showSubtext
            subtext="This is a notification without an icon."
            onClose={() => {}}
          />
        </View>
      </View>
    </ScrollView>
  ),
};

export const WithCTA: Story = {
  render: () => {
    const [result, setResult] = useState('');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ gap: 16 }}>
          <Toast
            type="positive"
            title="Upload complete"
            showSubtext
            subtext="Your file has been uploaded successfully."
            showCta
            ctaLabel="View"
            onCtaPress={() => setResult('View clicked')}
            onClose={() => setResult('Closed')}
          />

          <Toast
            type="info"
            title="New message"
            showSubtext
            subtext="You have a new message from John."
            showCta
            ctaLabel="Read"
            onCtaPress={() => setResult('Read clicked')}
            onClose={() => setResult('Closed')}
          />

          {result && (
            <Text style={{ fontSize: 14, color: '#666' }}>
              Last action: {result}
            </Text>
          )}
        </View>
      </ScrollView>
    );
  },
};

export const States: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ gap: 16 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Title Only</Text>
          <Toast
            type="positive"
            title="Changes saved"
            onClose={() => {}}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>With Subtext</Text>
          <Toast
            type="positive"
            title="Changes saved"
            showSubtext
            subtext="All your changes have been saved successfully."
            onClose={() => {}}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>With CTA</Text>
          <Toast
            type="info"
            title="Update available"
            showSubtext
            subtext="A new version is ready to install."
            showCta
            ctaLabel="Update"
            onCtaPress={() => {}}
            onClose={() => {}}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Without Close Button</Text>
          <Toast
            type="positive"
            title="Auto-dismiss notification"
            showSubtext
            subtext="This will disappear automatically."
            showClose={false}
            onClose={() => {}}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Full (Title + Subtext + CTA + Close)</Text>
          <Toast
            type="attention"
            title="Verify your email"
            showSubtext
            subtext="Please check your inbox and click the verification link."
            showCta
            ctaLabel="Resend"
            onCtaPress={() => {}}
            onClose={() => {}}
          />
        </View>
      </View>
    </ScrollView>
  ),
};

export const RealWorldExamples: Story = {
  render: () => {
    const [toasts, setToasts] = useState({
      success: true,
      error: false,
      warning: false,
    });

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ gap: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
            Form Submission Success
          </Text>
          {toasts.success && (
            <Toast
              type="positive"
              title="Form submitted"
              showSubtext
              subtext="Your application has been submitted successfully."
              showCta
              ctaLabel="View"
              onCtaPress={() => console.log('View application')}
              onClose={() => setToasts({ ...toasts, success: false })}
            />
          )}
          {!toasts.success && (
            <Button
              type="secondary"
              size="medium"
              label="Show Again"
              onPress={() => setToasts({ ...toasts, success: true })}
            />
          )}

          <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 }}>
            Network Error
          </Text>
          <Toast
            type="alert"
            title="Connection lost"
            showSubtext
            subtext="Please check your internet connection and try again."
            showCta
            ctaLabel="Retry"
            onCtaPress={() => console.log('Retrying...')}
            onClose={() => {}}
          />

          <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 }}>
            Pending Action
          </Text>
          <Toast
            type="attention"
            title="Payment pending"
            showSubtext
            subtext="Your payment is being processed. This may take a few moments."
            showClose={false}
            autoDismiss={false}
            onClose={() => {}}
          />

          <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 }}>
            Feature Announcement
          </Text>
          <Toast
            type="info"
            title="New feature available"
            showSubtext
            subtext="Try out our new dark mode in settings."
            showCta
            ctaLabel="Learn more"
            onCtaPress={() => console.log('Opening settings')}
            onClose={() => {}}
          />
        </View>
      </ScrollView>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ backgroundColor: '#e3f2fd', padding: 16, borderRadius: 8, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Accessibility Features</Text>
        <Text style={{ fontSize: 14 }}>✓ accessibilityRole="alert"</Text>
        <Text style={{ fontSize: 14 }}>✓ accessibilityLiveRegion for announcements</Text>
        <Text style={{ fontSize: 14 }}>✓ Clear close button labels</Text>
        <Text style={{ fontSize: 14 }}>✓ Touch targets: 44x44 minimum</Text>

        <View style={{ gap: 12, marginTop: 12 }}>
          <Text style={{ fontSize: 14, color: '#555' }}>✓ Good: Polite announcement</Text>
          <Toast
            type="positive"
            title="Item saved"
            showSubtext
            subtext="Your item has been added to favorites."
            accessibilityLive="polite"
            accessibilityLabel="Success notification: Item saved to favorites"
            onClose={() => {}}
          />

          <Text style={{ fontSize: 14, color: '#555', marginTop: 8 }}>
            ✓ Good: Assertive announcement (for errors)
          </Text>
          <Toast
            type="alert"
            title="Action failed"
            showSubtext
            subtext="Unable to complete the action. Please try again."
            accessibilityLive="assertive"
            accessibilityLabel="Error notification: Action failed, please try again"
            onClose={() => {}}
          />
        </View>
      </View>
    </ScrollView>
  ),
};
