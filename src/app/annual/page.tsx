'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';
import { Container } from '@/design-system/components/Container';
import { Pill } from '@/design-system/components/Pill';
import { SegmentedControl } from '@/design-system/components/SegmentedControl';
import { Sidebar } from '@/design-system/components/Sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { Icon } from '@/design-system/icons';

// Mock event data
const mockEvents = {
  january: [],
  february: [{ id: 1, title: 'Flu Shot Campaign', type: 'Annual' }],
  march: [{ id: 2, title: 'Flu Shot Campaign', type: 'Annual' }],
  april: [{ id: 3, title: 'Flu Shot Campaign', type: 'Annual' }],
  may: [{ id: 4, title: 'Flu Shot Campaign', type: 'Annual' }],
  june: [{ id: 5, title: 'Flu Shot Campaign', type: 'Annual' }],
  july: [{ id: 6, title: 'Flu Shot Campaign', type: 'Annual' }],
  august: [{ id: 7, title: 'Flu Shot Campaign', type: 'Annual' }],
  september: [{ id: 8, title: 'Flu Shot Campaign', type: 'Annual' }],
  october: [
    { id: 9, title: 'Flu Shot Campaign', type: 'Annual' },
    { id: 10, title: 'Seasonal Fall Event', type: 'Aug 2-25 – Nov 2025', type2: 'Annual' },
    { id: 11, title: 'Halloween', type: 'Annual' },
  ],
  november: [{ id: 12, title: 'Flu Shot Campaign', type: 'Annual' }],
  december: [{ id: 13, title: 'Flu Shot Campaign', type: 'Annual' }],
};

const months = [
  { name: 'January', key: 'january' },
  { name: 'February', key: 'february' },
  { name: 'March', key: 'march' },
  { name: 'April', key: 'april' },
  { name: 'May', key: 'may' },
  { name: 'June', key: 'june' },
  { name: 'July', key: 'july' },
  { name: 'August', key: 'august' },
  { name: 'September', key: 'september' },
  { name: 'October', key: 'october' },
  { name: 'November', key: 'november' },
  { name: 'December', key: 'december' },
];

// Menu items for sidebar
const menuItems = [
  { id: 'calendar', label: 'Calendar', icon: 'calendar', active: true },
  { id: 'materials', label: 'Marketing Materials', icon: 'file-stack' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
  { id: 'account', label: 'Account', icon: 'person-upper-body' },
];

function AnnualViewContent() {
  const { isOpen, toggle } = useSidebar();
  const [view, setView] = React.useState('year');
  const currentMonth = 'september'; // September is current month (has purple border)

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          'linear-gradient(233.809deg, rgb(221, 207, 235) 11.432%, rgb(240, 206, 183) 84.149%), linear-gradient(90deg, rgb(241, 241, 241) 0%, rgb(241, 241, 241) 100%)',
      }}
    >
      {/* Sidebar - Desktop only (≥768px) */}
      <div
        className={cn(
          'hidden md:block transition-all duration-200 overflow-hidden h-screen sticky top-0',
          isOpen ? 'w-[296px] p-2' : 'w-0 p-0'
        )}
      >
        <div
          className={cn(
            'transition-transform duration-200 w-[280px] h-full',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <Sidebar isOpen={isOpen} menuItems={menuItems} />
        </div>
      </div>

      {/* Mobile Menu Modal - Mobile only (<768px) */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          style={{
            background:
              'linear-gradient(233.809deg, rgb(221, 207, 235) 11.432%, rgb(240, 206, 183) 84.149%), linear-gradient(90deg, rgb(241, 241, 241) 0%, rgb(241, 241, 241) 100%)',
          }}
        >
          <div className="flex flex-col h-full p-6">
            {/* Close button */}
            <div className="flex items-center justify-start mb-6">
              <Button
                type="transparent"
                size="medium"
                iconOnly
                iconL="x"
                aria-label="Close menu"
                onClick={toggle}
              />
            </div>

            {/* Menu items - 24px gap from close button */}
            <div className="flex flex-col gap-3">
              {menuItems.map((item) => {
                const isActive = item.active;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.onClick?.();
                      toggle(); // Close menu after selection
                    }}
                    className={cn(
                      'flex items-center gap-3 h-10 px-3 py-2 rounded-full',
                      'transition-colors duration-200',
                      'cursor-pointer select-none',
                      'w-full',
                      isActive && 'bg-[rgba(0,0,0,0.12)]',
                      !isActive && 'hover:bg-[rgba(0,0,0,0.06)]'
                    )}
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-center shrink-0">
                      <Icon name={item.icon as any} size="medium" className="text-[#181818]" />
                    </div>

                    {/* Label */}
                    <span className="flex-1 text-left font-medium text-[16px] leading-[24px] text-[#181818]">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content Frame */}
      <div className="flex flex-col gap-6 p-6 flex-1 min-w-0">
        {/* Navbar */}
        <div className="flex items-center w-full flex-wrap gap-6 sm:gap-2 sm:flex-nowrap">
          {/* Left */}
          <div className="flex-1 flex gap-2 sm:gap-4 items-center min-w-0">
            <Button
              type="transparent"
              size="medium"
              iconOnly
              iconL={isOpen ? "x" : "navigation-menu"}
              aria-label="Toggle menu"
              onClick={toggle}
              className="md:hidden"
            />
            <Button
              type="transparent"
              size="medium"
              iconOnly
              iconL={isOpen ? "panel-left-open" : "panel-left-closed"}
              aria-label="Toggle menu"
              onClick={toggle}
              className="hidden md:flex"
            />
          </div>

          {/* Center - Page Title (Mobile) or Segmented Control (Desktop) */}
          <div className="w-auto sm:w-auto lg:w-[320px] order-2 sm:order-2">
            <h1 className="sm:hidden text-2xl font-semibold leading-tight text-[#181818]">2025</h1>
            <div className="hidden sm:block">
              <SegmentedControl
                options={[
                  { value: 'month', label: 'Month' },
                  { value: 'quarter', label: 'Quarter' },
                  { value: 'year', label: 'Year' },
                ]}
                value={view}
                onChange={setView}
                aria-label="Select view"
              />
            </div>
          </div>

          {/* Right */}
          <div className="flex-1 flex gap-2 items-center justify-end order-3 sm:order-3 min-w-0">
            <div className="hidden sm:flex gap-2 items-center">
              <Button
                type="transparent"
                size="medium"
                iconOnly
                iconL="arrow-left"
                aria-label="Previous year"
              />
              <Button
                type="transparent"
                size="medium"
                iconOnly
                iconL="arrow-right"
                aria-label="Next year"
              />
              <Button
                type="transparent"
                size="medium"
                label="Today"
                className="hidden md:flex"
              />
            </div>
            <Button
              type="primary"
              size="medium"
              iconOnly
              iconL="plus"
              aria-label="Add Event"
              className="lg:hidden"
            />
            <Button
              type="primary"
              size="medium"
              iconL="plus"
              label="Add Event"
              className="hidden lg:flex"
            />
          </div>

          {/* Segmented Control - Mobile only (second row) */}
          <div className="w-full sm:hidden order-4">
            <SegmentedControl
              options={[
                { value: 'month', label: 'Month' },
                { value: 'quarter', label: 'Quarter' },
                { value: 'year', label: 'Year' },
              ]}
              value={view}
              onChange={setView}
              aria-label="Select view"
            />
          </div>
        </div>

        {/* Year Header - Desktop only */}
        <div className="hidden sm:flex gap-2 items-start">
          <h1 className="text-2xl sm:text-3xl font-semibold leading-tight text-[#181818]">2025</h1>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-3">
          {months.map((month) => {
            const isCurrentMonth = month.key === currentMonth;
            const events = mockEvents[month.key as keyof typeof mockEvents] || [];

            return (
              <Container
                key={month.key}
                variant="interactive"
                className={cn(
                  'flex flex-col h-full w-full',
                  isCurrentMonth && 'border-2 border-solid border-[#765c8b]'
                )}
              >
                {/* Month Header */}
                <div className="flex items-center justify-between w-full">
                  <h2
                    className={`flex-1 text-base font-semibold leading-6 ${
                      isCurrentMonth ? 'text-[#4c3c5a]' : 'text-[#181818]'
                    }`}
                  >
                    {month.name}
                  </h2>
                  <Button
                    type="no-fill"
                    size="x-small"
                    iconOnly
                    iconL="plus"
                    aria-label={`Add event to ${month.name}`}
                  />
                </div>

                {/* Events List */}
                <div className="flex flex-col gap-2 w-full flex-1 overflow-y-auto">
                  {events.length === 0 ? (
                    <p className="text-sm font-normal leading-5 text-[#424242]">
                      No Events Planned
                    </p>
                  ) : (
                    events.map((event: any) => (
                      <Card key={event.id} variant="interactive">
                        <h3 className="text-sm font-medium leading-5 text-[#181818]">
                          {event.title}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          <Pill type="transparent" size="sm" label={event.type} />
                          {event.type2 && (
                            <Pill type="transparent" size="sm" label={event.type2} />
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </Container>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AnnualViewPage() {
  return (
    <SidebarProvider>
      <AnnualViewContent />
    </SidebarProvider>
  );
}
