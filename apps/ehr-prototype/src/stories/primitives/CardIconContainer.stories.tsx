import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Heart, AlertTriangle, Clock, Star, Stethoscope, Pill as PillIcon } from 'lucide-react';
import { CardIconContainer } from '../../components/primitives/CardIconContainer';
import { colors } from '../../styles/foundations';

const meta: Meta<typeof CardIconContainer> = {
  title: 'Primitives/CardIconContainer',
  component: CardIconContainer,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['default', 'alert', 'attention', 'success', 'accent'],
      description: 'Semantic color class',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size preset: sm=28px, md=32px, lg=40px',
    },
    filled: {
      control: 'boolean',
      description: 'Show background color (false = icon color only)',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Reusable icon container for the upper-left corner of cards. Provides consistent sizing, border radius, and semantic color across all card types.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    color: 'default',
    size: 'lg',
    filled: true,
    children: <Stethoscope size={20} />,
  },
};

export const AllColors: Story = {
  name: 'Color Variants',
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
      {(['default', 'alert', 'attention', 'success', 'accent'] as const).map((color) => (
        <div key={color} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <CardIconContainer color={color}>
            {color === 'alert' ? <AlertTriangle size={20} /> :
             color === 'attention' ? <Clock size={20} /> :
             color === 'success' ? <Heart size={20} /> :
             color === 'accent' ? <Star size={20} /> :
             <Stethoscope size={20} />}
          </CardIconContainer>
          <span style={{ fontSize: 12, color: colors.fg.neutral.spotReadable }}>{color}</span>
        </div>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  name: 'Size Variants',
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <CardIconContainer size={size}>
            <Stethoscope size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} />
          </CardIconContainer>
          <span style={{ fontSize: 12, color: colors.fg.neutral.spotReadable }}>
            {size} ({size === 'sm' ? '28px' : size === 'md' ? '32px' : '40px'})
          </span>
        </div>
      ))}
    </div>
  ),
};

export const FilledVsUnfilled: Story = {
  name: 'Filled vs Unfilled',
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: colors.fg.neutral.secondary }}>Filled (default)</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <CardIconContainer color="alert" filled={true}><AlertTriangle size={20} /></CardIconContainer>
          <CardIconContainer color="success" filled={true}><Heart size={20} /></CardIconContainer>
          <CardIconContainer color="accent" filled={true}><Star size={20} /></CardIconContainer>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: colors.fg.neutral.secondary }}>Unfilled (icon color only)</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <CardIconContainer color="alert" filled={false}><AlertTriangle size={20} /></CardIconContainer>
          <CardIconContainer color="success" filled={false}><Heart size={20} /></CardIconContainer>
          <CardIconContainer color="accent" filled={false}><Star size={20} /></CardIconContainer>
        </div>
      </div>
    </div>
  ),
};

export const OnCard: Story = {
  name: 'On Card (Context)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
      {/* Default card */}
      <div style={{
        display: 'flex', gap: '12px', alignItems: 'flex-start',
        padding: '16px', backgroundColor: colors.bg.neutral.base,
        borderRadius: '8px', border: `1px solid ${colors.border.neutral.low}`,
      }}>
        <CardIconContainer color="default"><PillIcon size={20} /></CardIconContainer>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, color: colors.fg.neutral.primary }}>Amoxicillin 500mg</div>
          <div style={{ fontSize: 14, color: colors.fg.neutral.secondary }}>Take 3x daily for 10 days</div>
        </div>
      </div>
      {/* Alert card */}
      <div style={{
        display: 'flex', gap: '12px', alignItems: 'flex-start',
        padding: '16px', backgroundColor: colors.bg.alert.subtle,
        borderRadius: '8px', border: `1px solid ${colors.border.neutral.low}`,
      }}>
        <CardIconContainer color="alert"><AlertTriangle size={20} /></CardIconContainer>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, color: colors.fg.neutral.primary }}>Critical Lab Result</div>
          <div style={{ fontSize: 14, color: colors.fg.neutral.secondary }}>Potassium: 6.2 mEq/L (high)</div>
        </div>
      </div>
    </div>
  ),
};
