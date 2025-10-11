'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/design-system/icons';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarProps {
  /**
   * Whether the sidebar is open
   */
  isOpen: boolean;

  /**
   * Menu items to display
   */
  menuItems: MenuItem[];

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Sidebar component based on Figma design system
 *
 * FIGMA SPECIFICATIONS:
 * - Container: 280px width, 16px padding, rounded-[24px]
 * - Background: rgba(255,255,255,0.68) with shadow-[0px_4px_16px_0px_rgba(0,0,0,0.16)]
 * - Menu items: 40px height, 12px horizontal padding, 8px vertical padding
 * - Active state: bg-[rgba(0,0,0,0.12)], rounded-full
 * - Hover state: (implicit in design)
 * - Typography: Inter Medium 16px/24px (#181818)
 * - Icons: 24x24px medium size
 * - Gap between items: 12px
 *
 * @example
 * <Sidebar
 *   isOpen={isOpen}
 *   menuItems={[
 *     { id: 'calendar', label: 'Calendar', icon: 'calendar', active: true },
 *     { id: 'materials', label: 'Marketing Materials', icon: 'file-stack' },
 *   ]}
 * />
 */
export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ isOpen, menuItems, className }, ref) => {
    const [hoveredId, setHoveredId] = React.useState<string | null>(null);

    return (
      <div
        ref={ref}
        className={cn(
          'bg-[var(--color-bg-transparent-inverse-low)] elevation-lg',
          'w-[280px] h-full',
          'flex flex-col',
          className
        )}
        style={{
          borderRadius: 'var(--dimension-radius-lg)',
          padding: 'var(--dimension-space-around-md)',
          gap: 'var(--dimension-space-between-separated-md)',
        }}
      >
        {/* Menu Section */}
        <div className="flex flex-col" style={{ gap: 'var(--dimension-space-around-sm)' }}>
          {menuItems.map((item) => {
            const isActive = item.active;
            const isHovered = hoveredId === item.id && !isActive;

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  'flex items-center h-10 px-3 py-2 rounded-full',
                  'transition-colors duration-200',
                  'cursor-pointer select-none',
                  'w-full',
                  isActive && 'bg-[var(--color-bg-transparent-low)]',
                  isHovered && 'bg-[var(--color-bg-transparent-subtle)]'
                )}
                style={{ gap: 'var(--dimension-space-around-sm)' }}
              >
                {/* Icon */}
                <div className="flex items-center justify-center shrink-0">
                  <Icon name={item.icon as any} size="medium" className="!text-[var(--color-fg-neutral-primary)]" />
                </div>

                {/* Label */}
                <span className="flex-1 text-left text-body-md-medium !text-[var(--color-fg-neutral-primary)]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

Sidebar.displayName = 'Sidebar';
