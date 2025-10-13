'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { MonthNote } from '@/components/MonthNote';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Menu items for sidebar - will add onClick handlers in component
const baseMenuItems = [
  { id: 'calendar', label: 'Calendar', icon: 'calendar', active: true },
  { id: 'materials', label: 'Marketing Materials', icon: 'file-stack' },
  // { id: 'settings', label: 'Settings', icon: 'gear' },
  // { id: 'account', label: 'Account', icon: 'person-upper-body' },
];

function MonthViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOpen, toggle } = useSidebar();
  const [view, setView] = React.useState('month');
  const [events, setEvents] = React.useState<EventIdea[]>([]);
  const [outreachAngles, setOutreachAngles] = React.useState<OutreachAngle[]>([]);
  const [materialsCounts, setMaterialsCounts] = React.useState<Record<number, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  // Read month and year from URL params, fallback to current date
  const urlMonth = searchParams?.get('month');
  const urlYear = searchParams?.get('year');
  const [selectedMonth, setSelectedMonth] = React.useState(
    urlMonth ? parseInt(urlMonth) : currentMonth
  );
  const [selectedYear, setSelectedYear] = React.useState(
    urlYear ? parseInt(urlYear) : currentYear
  );

  React.useEffect(() => {
    loadEvents();
  }, [selectedYear]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors

      const [eventsResponse, anglesResponse] = await Promise.all([
        supabase
          .from('events_ideas')
          .select('*')
          .or(`start_year.eq.${selectedYear},year.eq.${selectedYear},start_year.eq.${selectedYear + 1},year.eq.${selectedYear + 1},is_recurring.eq.true`)
          .order('start_year', { ascending: true })
          .order('start_month', { ascending: true }),
        supabase.from('outreach_angles').select('*')
      ]);

      if (eventsResponse.error) throw eventsResponse.error;
      if (anglesResponse.error) throw anglesResponse.error;

      setEvents(eventsResponse.data || []);
      setOutreachAngles(anglesResponse.data || []);

      // Load materials counts for all events
      const eventIds = eventsResponse.data?.map(e => e.id) || [];
      if (eventIds.length > 0) {
        await loadMaterialsCounts(eventIds);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Unable to load events. Please check your connection and try again.');
      setEvents([]); // Clear stale data
      setOutreachAngles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadEvents();
  };

  const loadMaterialsCounts = async (eventIds: number[]) => {
    try {
      const { data, error } = await supabase
        .from('marketing_materials')
        .select('event_id')
        .in('event_id', eventIds);

      if (error) throw error;

      // Count materials per event
      const counts: Record<number, number> = {};
      data?.forEach(material => {
        counts[material.event_id] = (counts[material.event_id] || 0) + 1;
      });

      setMaterialsCounts(counts);
    } catch (error) {
      console.error('Error loading materials counts:', error);
    }
  };

  const handleAddEvent = () => {
    const params = new URLSearchParams({
      return: 'month',
      year: selectedYear.toString(),
      month: selectedMonth.toString(),
    });
    router.push(`/add-event?${params.toString()}`);
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

  const getEventsForMonthRange = (startMonth: number, startYear: number, endMonth: number, endYear: number) => {
    return events.filter(event => {
      const eventStartMonth = event.start_month || event.month;
      const eventStartYear = event.start_year || event.year;

      // Handle recurring events
      if (event.is_recurring) {
        // Only show recurring events in years >= their start year
        if (startYear < eventStartYear && endYear < eventStartYear) {
          return false;
        }

        // For recurring events, check if the event month falls within the range
        if (event.end_month && event.end_year) {
          // Multi-month recurring event - check if any month in range overlaps with event
          const rangeStart = new Date(startYear, startMonth - 1);
          const rangeEnd = new Date(endYear, endMonth - 1);

          let eventStart = eventStartMonth;
          let eventEnd = event.end_month;

          // Handle year wrapping for recurring events
          if (eventEnd < eventStart) {
            // Event wraps across year - check both parts
            for (let y = startYear; y <= endYear; y++) {
              const checkStart = new Date(y, eventStart - 1);
              const checkEnd1 = new Date(y, 11); // End of year
              const checkEnd2 = new Date(y + 1, eventEnd - 1); // Beginning of next year

              if ((checkStart >= rangeStart && checkStart <= rangeEnd) ||
                  (checkEnd1 >= rangeStart && checkEnd1 <= rangeEnd) ||
                  (checkEnd2 >= rangeStart && checkEnd2 <= rangeEnd)) {
                return true;
              }
            }
            return false;
          } else {
            // Event within same year - check if any occurrence overlaps with range
            for (let y = startYear; y <= endYear; y++) {
              if (y < eventStartYear) continue;

              const eventStartDate = new Date(y, eventStart - 1);
              const eventEndDate = new Date(y, eventEnd - 1);

              if ((eventStartDate >= rangeStart && eventStartDate <= rangeEnd) ||
                  (eventEndDate >= rangeStart && eventEndDate <= rangeEnd) ||
                  (eventStartDate <= rangeStart && eventEndDate >= rangeEnd)) {
                return true;
              }
            }
            return false;
          }
        } else {
          // Single month recurring event
          for (let y = startYear; y <= endYear; y++) {
            if (y < eventStartYear) continue;

            const eventDate = new Date(y, eventStartMonth - 1);
            const rangeStart = new Date(startYear, startMonth - 1);
            const rangeEnd = new Date(endYear, endMonth - 1);

            if (eventDate >= rangeStart && eventDate <= rangeEnd) {
              return true;
            }
          }
          return false;
        }
      }

      // Handle non-recurring events
      // Multi-month event spanning the range
      if (event.end_month && event.end_year) {
        const eventStartDate = new Date(eventStartYear, eventStartMonth - 1);
        const eventEndDate = new Date(event.end_year, event.end_month - 1);
        const rangeStart = new Date(startYear, startMonth - 1);
        const rangeEnd = new Date(endYear, endMonth - 1);

        // Check if event overlaps with the range
        return (eventStartDate >= rangeStart && eventStartDate <= rangeEnd) ||
               (eventEndDate >= rangeStart && eventEndDate <= rangeEnd) ||
               (eventStartDate <= rangeStart && eventEndDate >= rangeEnd);
      }

      // Single month event
      const eventDate = new Date(eventStartYear, eventStartMonth - 1);
      const rangeStart = new Date(startYear, startMonth - 1);
      const rangeEnd = new Date(endYear, endMonth - 1);

      return eventDate >= rangeStart && eventDate <= rangeEnd;
    });
  };

  const formatPrepPill = (event: EventIdea): string => {
    if (event.prep_start_date) {
      const date = new Date(event.prep_start_date);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } else if (event.prep_months_needed > 0) {
      return `${event.prep_months_needed}mo`;
    }
    return '';
  };

  const formatEventDate = (event: EventIdea): string => {
    const eventStartMonth = event.start_month || event.month;
    const eventStartYear = event.start_year || event.year;

    if (event.end_month && event.end_year) {
      const startMonthName = monthNames[eventStartMonth - 1];
      const endMonthName = monthNames[event.end_month - 1];

      if (eventStartYear === event.end_year) {
        return `${startMonthName} – ${endMonthName} ${eventStartYear}`;
      } else {
        return `${startMonthName} ${eventStartYear} – ${endMonthName} ${event.end_year}`;
      }
    } else {
      return `${monthNames[eventStartMonth - 1]} ${eventStartYear}`;
    }
  };

  // Format date for "This Month" events - hide single-month dates (implied from page header)
  const formatThisMonthEventDate = (event: EventIdea): string | null => {
    const eventStartMonth = event.start_month || event.month;
    const eventStartYear = event.start_year || event.year;

    // Only show date for multi-month events
    if (event.end_month && event.end_year) {
      const startMonthName = monthNames[eventStartMonth - 1];
      const endMonthName = monthNames[event.end_month - 1];

      if (eventStartYear === event.end_year) {
        return `${startMonthName} – ${endMonthName} ${eventStartYear}`;
      } else {
        return `${startMonthName} ${eventStartYear} – ${endMonthName} ${event.end_year}`;
      }
    }

    // Return null for single-month events (date is implied from page header)
    return null;
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Get events whose preparation window falls in the selected month
  const getPrepEventsForMonth = () => {
    return events.filter(event => {
      const eventStartMonth = event.start_month || event.month;
      const eventStartYear = event.start_year || event.year;
      const eventDate = new Date(eventStartYear, eventStartMonth - 1);
      const checkDate = new Date(selectedYear, selectedMonth - 1);

      // For multi-month events, check if this month is within the event span
      if (event.end_month && event.end_year) {
        const endDate = new Date(event.end_year, event.end_month - 1);
        if (checkDate >= eventDate && checkDate <= endDate) {
          return false; // Event is occurring, don't show in prep section
        }
      } else {
        // Single month event
        if (eventStartYear === selectedYear && eventStartMonth === selectedMonth) {
          return false; // Event is occurring, don't show in prep section
        }
      }

      // For events with specific prep start date
      if (event.prep_start_date) {
        const prepDate = new Date(event.prep_start_date);
        const prepStartMonth = prepDate.getMonth() + 1; // 1-12
        const prepStartYear = prepDate.getFullYear();

        // Check if this month falls within prep window (from prep start to event start)
        const prepStartDate = new Date(prepStartYear, prepStartMonth - 1);

        // Check if current month is between prep start and event start (exclusive of event month)
        return checkDate >= prepStartDate && checkDate < eventDate;
      }

      // For events with prep months needed
      if (event.prep_months_needed > 0) {
        // Calculate prep start month by subtracting prep months from event start
        const prepStartDate = new Date(eventDate);
        prepStartDate.setMonth(prepStartDate.getMonth() - event.prep_months_needed);

        // Check if current month falls within prep window (from prep start to event start)
        return checkDate >= prepStartDate && checkDate < eventDate;
      }

      return false;
    });
  };

  // Check if prep starts in the current selected month
  const isPrepStartingThisMonth = (event: EventIdea): boolean => {
    const eventStartMonth = event.start_month || event.month;
    const eventStartYear = event.start_year || event.year;
    const eventDate = new Date(eventStartYear, eventStartMonth - 1);

    if (event.prep_start_date) {
      const prepDate = new Date(event.prep_start_date);
      const prepStartMonth = prepDate.getMonth() + 1;
      const prepStartYear = prepDate.getFullYear();
      return prepStartMonth === selectedMonth && prepStartYear === selectedYear;
    }

    if (event.prep_months_needed > 0) {
      const prepStartDate = new Date(eventDate);
      prepStartDate.setMonth(prepStartDate.getMonth() - event.prep_months_needed);
      return prepStartDate.getMonth() + 1 === selectedMonth &&
             prepStartDate.getFullYear() === selectedYear;
    }

    return false;
  };

  const handleViewChange = (newView: string) => {
    setView(newView);
    if (newView === 'quarter') {
      router.push('/quarter');
    } else if (newView === 'year') {
      router.push('/annual');
    }
    // Stay on month for 'month'
  };

  const handleToday = () => {
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
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
          <div className="text-body-lg-medium !text-[var(--color-fg-neutral-primary)]">Loading events...</div>
        </div>
      </div>
    );
  }

  // Calculate month ranges for each column
  // This Month: selected month
  const thisMonthEvents = getEventsForMonthRange(selectedMonth, selectedYear, selectedMonth, selectedYear);
  const prepEvents = getPrepEventsForMonth();

  // Upcoming Events: next 3 months
  const upcomingStart = { month: selectedMonth, year: selectedYear };
  const upcomingEnd = { month: selectedMonth, year: selectedYear };

  // Add 3 months
  upcomingEnd.month += 3;
  while (upcomingEnd.month > 12) {
    upcomingEnd.month -= 12;
    upcomingEnd.year += 1;
  }

  // Start from next month
  upcomingStart.month += 1;
  if (upcomingStart.month > 12) {
    upcomingStart.month = 1;
    upcomingStart.year += 1;
  }

  const upcomingEvents = getEventsForMonthRange(upcomingStart.month, upcomingStart.year, upcomingEnd.month, upcomingEnd.year);


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
                      isActive && 'bg-[var(--color-bg-transparent-low)]',
                      !isActive && 'hover:bg-[var(--color-bg-neutral-subtle)]'
                    )}
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
            <h1 className="sm:hidden text-[24px] leading-[32px] font-semibold tracking-[-0.5px] !text-[var(--color-fg-neutral-primary)] truncate">{monthNames[selectedMonth - 1]} {selectedYear}</h1>
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
                aria-label="Previous month"
                onClick={handlePreviousMonth}
              />
              <Button
                type="transparent"
                size="medium"
                iconOnly
                iconL="arrow-right"
                aria-label="Next month"
                onClick={handleNextMonth}
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

        {/* Month Header - Desktop only */}
        <div className="hidden sm:flex gap-2 items-start">
          <h1 className="text-[24px] leading-[32px] sm:text-[32px] sm:leading-[40px] font-semibold tracking-[-0.5px] !text-[var(--color-fg-neutral-primary)]">{monthNames[selectedMonth - 1]} {selectedYear}</h1>
        </div>

        {/* Error State or Month Planning Grid */}
        {error ? (
          <Container className="flex flex-col items-center justify-center p-12">
            <p className="text-body-lg-semibold !text-[var(--color-fg-neutral-primary)] mb-2">Oops! Something went wrong</p>
            <p className="text-body-sm-regular !text-[var(--color-fg-neutral-secondary)] mb-6 text-center max-w-md">{error}</p>
            <Button type="primary" size="medium" label="Try Again" onClick={handleRetry} />
          </Container>
        ) : (
          /* Month Planning Grid - 3 columns */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Column 1: This Month */}
          <Container className={cn(
            "flex flex-col gap-4 h-full w-full",
            selectedMonth === currentMonth && selectedYear === currentYear && 'border-2 border-solid border-[var(--color-bg-accent-high)]'
          )}>
            <div className="flex items-center justify-between w-full">
              <h2 className={cn(
                "flex-1 text-base font-semibold leading-6",
                selectedMonth === currentMonth && selectedYear === currentYear ? '!text-[var(--color-fg-accent-high)]' : '!text-[var(--color-fg-neutral-primary)]'
              )}>
                This Month
              </h2>
              <Button
                type="no-fill"
                size="x-small"
                iconOnly
                iconL="plus"
                aria-label="Add event to this month"
                onClick={handleAddEvent}
              />
            </div>

            {/* Month Note */}
            <MonthNote month={selectedMonth} />

            <div className="flex flex-col gap-2 w-full">
              {thisMonthEvents.length === 0 ? (
                <p className="text-body-sm-regular !text-[var(--color-fg-neutral-secondary)]">
                  No Events Planned
                </p>
              ) : (
                thisMonthEvents.map((event) => {
                  const processedEvent = eventDataProcessor.formatEventForDisplay(
                    event,
                    outreachAngles,
                    selectedYear
                  );
                  const materialsCount = materialsCounts[event.id] || 0;
                  const prepLabel = formatPrepPill(event);

                  return (
                    <Card
                      key={event.id}
                      size="small"
                      variant="interactive"
                      onClick={() => {
                        const params = new URLSearchParams({
                          return: 'month',
                          year: selectedYear.toString(),
                          month: selectedMonth.toString(),
                        });
                        router.push(`/event/${event.id}?${params.toString()}`);
                      }}
                    >
                      {/* Header Block */}
                      <div className="flex flex-col w-full">
                        <h3 className="text-body-sm-medium !text-[var(--color-fg-neutral-primary)]">
                          {event.title}
                        </h3>
                        {formatThisMonthEventDate(event) && (
                          <p className="text-body-xs-regular !text-[var(--color-fg-neutral-secondary)]">
                            {formatThisMonthEventDate(event)}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      {event.description && (
                        <p className="text-body-sm-regular !text-[var(--color-fg-neutral-primary)] w-full">
                          {event.description}
                        </p>
                      )}

                      {/* Outreach Angle Perspectives */}
                      {processedEvent.processedOutreachAngles.map((angleSelection, idx) => {
                        if (!angleSelection.notes) return null;

                        return (
                          <div key={idx} className="flex flex-col w-full">
                            <p className="text-body-xs-medium !text-[var(--color-fg-neutral-secondary)]">
                              {angleSelection.angle} Perspective
                            </p>
                            <p className="text-sm font-normal leading-5 text-[#181818]">
                              {angleSelection.notes}
                            </p>
                          </div>
                        );
                      })}

                      {/* Pills Row */}
                      <div className="flex flex-wrap gap-1.5 w-full">
                        {prepLabel && (
                          <Pill
                            type="info"
                            size="small"
                            label="Prep"
                            subtextR={prepLabel}
                          />
                        )}
                        {event.is_recurring && (
                          <Pill
                            type="accent"
                            size="small"
                            label="Yearly"
                          />
                        )}
                        {materialsCount > 0 && (
                          <Pill
                            type="transparent"
                            size="small"
                            label="Materials"
                            subtextR={materialsCount.toString()}
                          />
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

          </Container>

          {/* Column 2: Preparation Needed */}
          <Container className="flex flex-col gap-4 h-full w-full">
            <div className="flex items-center justify-between w-full">
              <h2 className="flex-1 text-body-md-bold !text-[var(--color-fg-neutral-primary)]">
                Preparation Needed
              </h2>
            </div>

            <div className="flex flex-col gap-2 w-full">
              {prepEvents.length === 0 ? (
                <p className="text-body-sm-regular !text-[var(--color-fg-neutral-secondary)]">
                  No Preparation Needed
                </p>
              ) : (
                prepEvents.map((event) => {
                  const processedEvent = eventDataProcessor.formatEventForDisplay(
                    event,
                    outreachAngles,
                    selectedYear
                  );
                  const materialsCount = materialsCounts[event.id] || 0;
                  const prepLabel = formatPrepPill(event);
                  const isPrepStarting = isPrepStartingThisMonth(event);

                  return (
                    <Card
                      key={event.id}
                      size="small"
                      variant="interactive"
                      onClick={() => {
                        const params = new URLSearchParams({
                          return: 'month',
                          year: selectedYear.toString(),
                          month: selectedMonth.toString(),
                        });
                        router.push(`/event/${event.id}?${params.toString()}`);
                      }}
                    >
                      {/* Header Block */}
                      <div className="flex flex-col w-full">
                        <h3 className="text-body-sm-medium !text-[var(--color-fg-neutral-primary)]">
                          {event.title}
                        </h3>
                        {formatEventDate(event) && (
                          <p className="text-body-xs-regular !text-[var(--color-fg-neutral-secondary)]">
                            {formatEventDate(event)}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      {event.description && (
                        <p className="text-body-sm-regular !text-[var(--color-fg-neutral-primary)] w-full">
                          {event.description}
                        </p>
                      )}

                      {/* Outreach Angle Perspectives */}
                      {processedEvent.processedOutreachAngles.map((angleSelection, idx) => {
                        if (!angleSelection.notes) return null;

                        return (
                          <div key={idx} className="flex flex-col w-full">
                            <p className="text-body-xs-medium !text-[var(--color-fg-neutral-secondary)]">
                              {angleSelection.angle} Perspective
                            </p>
                            <p className="text-sm font-normal leading-5 text-[#181818]">
                              {angleSelection.notes}
                            </p>
                          </div>
                        );
                      })}

                      {/* Pills Row */}
                      <div className="flex flex-wrap gap-1.5 w-full">
                        {prepLabel && (
                          <Pill
                            type={isPrepStarting ? "important-info" : "info"}
                            size="small"
                            label={isPrepStarting ? "Prep Start" : "Prep"}
                            subtextR={prepLabel}
                          />
                        )}
                        {event.is_recurring && (
                          <Pill
                            type="accent"
                            size="small"
                            label="Yearly"
                          />
                        )}
                        {materialsCount > 0 && (
                          <Pill
                            type="transparent"
                            size="small"
                            label="Materials"
                            subtextR={materialsCount.toString()}
                          />
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </Container>

          {/* Column 3: Upcoming Events (next 3 months) */}
          <Container className="flex flex-col gap-4 h-full w-full">
            <div className="flex items-center justify-between w-full">
              <h2 className="flex-1 text-body-md-bold !text-[var(--color-fg-neutral-primary)]">
                Next 3 Months
              </h2>
            </div>

            <div className="flex flex-col gap-2 w-full">
              {upcomingEvents.length === 0 ? (
                <p className="text-body-sm-regular !text-[var(--color-fg-neutral-secondary)]">
                  No Upcoming Events
                </p>
              ) : (
                upcomingEvents.map((event) => {
                  const processedEvent = eventDataProcessor.formatEventForDisplay(
                    event,
                    outreachAngles,
                    selectedYear
                  );
                  const materialsCount = materialsCounts[event.id] || 0;
                  const prepLabel = formatPrepPill(event);

                  return (
                    <Card
                      key={event.id}
                      size="small"
                      variant="interactive"
                      onClick={() => {
                        const params = new URLSearchParams({
                          return: 'month',
                          year: selectedYear.toString(),
                          month: selectedMonth.toString(),
                        });
                        router.push(`/event/${event.id}?${params.toString()}`);
                      }}
                    >
                      {/* Header Block */}
                      <div className="flex flex-col w-full">
                        <h3 className="text-body-sm-medium !text-[var(--color-fg-neutral-primary)]">
                          {event.title}
                        </h3>
                        {formatEventDate(event) && (
                          <p className="text-body-xs-regular !text-[var(--color-fg-neutral-secondary)]">
                            {formatEventDate(event)}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      {event.description && (
                        <p className="text-body-sm-regular !text-[var(--color-fg-neutral-primary)] w-full">
                          {event.description}
                        </p>
                      )}

                      {/* Outreach Angle Perspectives */}
                      {processedEvent.processedOutreachAngles.map((angleSelection, idx) => {
                        if (!angleSelection.notes) return null;

                        return (
                          <div key={idx} className="flex flex-col w-full">
                            <p className="text-body-xs-medium !text-[var(--color-fg-neutral-secondary)]">
                              {angleSelection.angle} Perspective
                            </p>
                            <p className="text-sm font-normal leading-5 text-[#181818]">
                              {angleSelection.notes}
                            </p>
                          </div>
                        );
                      })}

                      {/* Pills Row */}
                      <div className="flex flex-wrap gap-1.5 w-full">
                        {prepLabel && (
                          <Pill
                            type="info"
                            size="small"
                            label="Prep"
                            subtextR={prepLabel}
                          />
                        )}
                        {event.is_recurring && (
                          <Pill
                            type="accent"
                            size="small"
                            label="Yearly"
                          />
                        )}
                        {materialsCount > 0 && (
                          <Pill
                            type="transparent"
                            size="small"
                            label="Materials"
                            subtextR={materialsCount.toString()}
                          />
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </Container>
        </div>
        )}
      </div>
    </div>
  );
}

export default function MonthViewPage() {
  return (
    <SidebarProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <MonthViewContent />
      </Suspense>
    </SidebarProvider>
  );
}
