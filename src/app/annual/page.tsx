'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';
import { Container } from '@/design-system/components/Container';
import { Pill } from '@/design-system/components/Pill';
import { SegmentedControl } from '@/design-system/components/SegmentedControl';
import { Sidebar } from '@/design-system/components/Sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { Icon } from '@/design-system/icons';
import { supabase, EventIdea, OutreachAngle } from '@/lib/supabase';
import { eventDataProcessor } from '@/lib/eventHelpers';

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

// Menu items for sidebar - will add onClick handlers in component
const baseMenuItems = [
  { id: 'calendar', label: 'Calendar', icon: 'calendar', active: true },
  { id: 'materials', label: 'Marketing Materials', icon: 'file-stack' },
  // { id: 'settings', label: 'Settings', icon: 'gear' },
  // { id: 'account', label: 'Account', icon: 'person-upper-body' },
];

function AnnualViewContent() {
  const router = useRouter();
  const { isOpen, toggle } = useSidebar();
  const [view, setView] = React.useState('year');
  const [events, setEvents] = React.useState<EventIdea[]>([]);
  const [outreachAngles, setOutreachAngles] = React.useState<OutreachAngle[]>([]);
  const [loading, setLoading] = React.useState(true);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const [selectedYear, setSelectedYear] = React.useState(currentYear);

  React.useEffect(() => {
    loadEvents();
  }, [selectedYear]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const [eventsResponse, anglesResponse] = await Promise.all([
        supabase
          .from('events_ideas')
          .select('*')
          .or(`start_year.eq.${selectedYear},year.eq.${selectedYear},is_recurring.eq.true`)
          .order('start_year', { ascending: true })
          .order('start_month', { ascending: true }),
        supabase.from('outreach_angles').select('*')
      ]);

      if (eventsResponse.error) throw eventsResponse.error;
      if (anglesResponse.error) throw anglesResponse.error;

      setEvents(eventsResponse.data || []);
      setOutreachAngles(anglesResponse.data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
      setOutreachAngles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (newView: string) => {
    setView(newView);
    if (newView === 'month') {
      router.push('/month');
    } else if (newView === 'quarter') {
      router.push('/quarter');
    }
    // Stay on annual for 'year'
  };

  const handleAddEvent = () => {
    const params = new URLSearchParams({
      return: 'annual',
      year: selectedYear.toString(),
    });
    router.push(`/add-event?${params.toString()}`);
  };

  const handleAddEventForMonth = (monthNumber: number) => {
    const params = new URLSearchParams({
      return: 'annual',
      year: selectedYear.toString(),
      month: monthNumber.toString(),
    });
    router.push(`/add-event?${params.toString()}`);
  };

  const handlePreviousYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(prev => prev + 1);
  };

  const handleMenuItemClick = (id: string) => {
    if (id === 'materials') {
      router.push('/materials');
    } else if (id === 'calendar') {
      // Already on calendar
    }
  };

  // Add onClick handlers to menu items
  const menuItems = baseMenuItems.map(item => ({
    ...item,
    onClick: () => handleMenuItemClick(item.id),
  }));

  const handleToday = () => {
    setSelectedYear(currentYear);
  };

  const getEventsForMonth = (month: number) => {
    return events.filter(event => {
      const eventStartMonth = event.start_month || event.month;
      const eventStartYear = event.start_year || event.year;

      // Handle recurring events
      if (event.is_recurring) {
        // Only show recurring events in years >= their start year
        if (selectedYear < eventStartYear) {
          return false;
        }

        // For recurring events, check if this month falls within the event span
        if (event.end_month && event.end_year) {
          // Multi-month recurring event
          let startMonth = eventStartMonth;
          let endMonth = event.end_month;

          // Handle year wrapping (e.g. Nov-Feb)
          if (endMonth < startMonth) {
            // Event wraps across year boundary
            return month >= startMonth || month <= endMonth;
          } else {
            // Event within same year
            return month >= startMonth && month <= endMonth;
          }
        } else {
          // Single month recurring event
          return eventStartMonth === month;
        }
      }

      // Handle non-recurring events
      // Multi-month event spanning this month
      if (event.end_month && event.end_year) {
        const startDate = new Date(eventStartYear, eventStartMonth - 1);
        const endDate = new Date(event.end_year, event.end_month - 1);
        const checkDate = new Date(selectedYear, month - 1);
        return checkDate >= startDate && checkDate <= endDate;
      }

      // Direct match for single month events
      if (eventStartYear === selectedYear && eventStartMonth === month) {
        return true;
      }

      return false;
    });
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            'linear-gradient(233.809deg, rgb(221, 207, 235) 11.432%, rgb(240, 206, 183) 84.149%), linear-gradient(90deg, rgb(241, 241, 241) 0%, rgb(241, 241, 241) 100%)',
        }}
      >
        <div className="text-center">
          <div className="text-lg font-medium text-[#181818]">Loading events...</div>
        </div>
      </div>
    );
  }

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
          'hidden md:block overflow-hidden h-screen sticky top-0 flex-shrink-0 py-2 transition-[width] duration-200',
          isOpen ? 'w-[296px] px-2' : 'w-0 px-0'
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
          <div className="flex flex-1 sm:flex-1 gap-4 items-center min-w-0">
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
            {/* Page Title - Mobile only, next to menu button */}
            <h1 className="sm:hidden text-2xl font-semibold leading-tight text-[#181818] truncate">{selectedYear}</h1>
          </div>

          {/* Center - Segmented Control (Tablet+) */}
          <div className="hidden sm:block sm:w-[240px] lg:w-[320px] order-2 sm:order-2">
            <SegmentedControl
              options={[
                { value: 'month', label: 'Month' },
                { value: 'quarter', label: 'Quarter' },
                { value: 'year', label: 'Year' },
              ]}
              value={view}
              onChange={handleViewChange}
              aria-label="Select view"
            />
          </div>

          {/* Right */}
          <div className="flex flex-none sm:flex-1 gap-2 items-center justify-end order-3 sm:order-3 min-w-0">
            <div className="flex gap-2 items-center">
              <Button
                type="transparent"
                size="medium"
                iconOnly
                iconL="arrow-left"
                aria-label="Previous year"
                onClick={handlePreviousYear}
              />
              <Button
                type="transparent"
                size="medium"
                iconOnly
                iconL="arrow-right"
                aria-label="Next year"
                onClick={handleNextYear}
              />
              <Button
                type="transparent"
                size="medium"
                label="Today"
                className="hidden md:flex"
                onClick={handleToday}
              />
            </div>
            <Button
              type="primary"
              size="medium"
              iconOnly
              iconL="plus"
              aria-label="Add Event"
              className="lg:hidden"
              onClick={handleAddEvent}
            />
            <Button
              type="primary"
              size="medium"
              iconL="plus"
              label="Add Event"
              className="hidden lg:flex"
              onClick={handleAddEvent}
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
              onChange={handleViewChange}
              aria-label="Select view"
            />
          </div>
        </div>

        {/* Year Header - Desktop only */}
        <div className="hidden sm:flex gap-2 items-start">
          <h1 className="text-2xl sm:text-3xl font-semibold leading-tight text-[#181818]">{selectedYear}</h1>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-3">
          {months.map((month, index) => {
            const monthNumber = index + 1;
            const isCurrentMonth = monthNumber === currentMonth && selectedYear === currentYear;
            const monthEvents = getEventsForMonth(monthNumber);

            return (
              <Container
                key={month.key}
                variant="interactive"
                className={cn(
                  'flex flex-col h-full w-full',
                  isCurrentMonth && 'shadow-[inset_0_0_0_2px_#765c8b]'
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
                    onClick={() => handleAddEventForMonth(monthNumber)}
                  />
                </div>

                {/* Events List */}
                <div className="flex flex-col gap-2 w-full flex-1 overflow-y-auto">
                  {monthEvents.length === 0 ? (
                    <p className="text-sm font-normal leading-5 text-[#424242]">
                      No Events Planned
                    </p>
                  ) : (
                    monthEvents.map((event) => {
                      const processedEvent = eventDataProcessor.formatEventForDisplay(
                        event,
                        outreachAngles,
                        selectedYear
                      );

                      return (
                        <Card
                          key={event.id}
                          size="small"
                          variant="interactive"
                          onClick={() => {
                            const params = new URLSearchParams({
                              return: 'annual',
                              year: selectedYear.toString(),
                            });
                            router.push(`/event/${event.id}?${params.toString()}`);
                          }}
                        >
                          {/* Header Block - title and date with no gap */}
                          <div className="flex flex-col w-full">
                            <h3 className="text-sm font-medium leading-5 text-[#181818]">
                              {event.title}
                            </h3>
                            {/* Display date for multi-month events */}
                            {processedEvent.displayDate.isMultiMonth && (
                              <p className="text-xs font-normal leading-5 text-[#424242]">
                                {processedEvent.displayDate.start}
                                {processedEvent.displayDate.end && ` – ${processedEvent.displayDate.end}`}
                              </p>
                            )}
                          </div>

                          {/* Pills: Outreach Angles + Yearly indicator */}
                          <div className="flex flex-wrap gap-1.5 w-full">
                            {processedEvent.processedOutreachAngles.map((angleSelection, idx) => (
                              <Pill
                                key={idx}
                                type="transparent"
                                size="small"
                                label={angleSelection.angle}
                              />
                            ))}
                            {event.is_recurring && (
                              <Pill
                                type="transparent"
                                size="small"
                                label="Yearly"
                              />
                            )}
                          </div>
                        </Card>
                      );
                    })
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
