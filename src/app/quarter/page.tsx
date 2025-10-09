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
import { supabase, EventIdea, OutreachAngle, MarketingMaterial } from '@/lib/supabase';
import { eventDataProcessor } from '@/lib/eventHelpers';

const quarters = [
  { id: 1, name: 'Q1', months: [1, 2, 3], monthNames: ['January', 'February', 'March'] },
  { id: 2, name: 'Q2', months: [4, 5, 6], monthNames: ['April', 'May', 'June'] },
  { id: 3, name: 'Q3', months: [7, 8, 9], monthNames: ['July', 'August', 'September'] },
  { id: 4, name: 'Q4', months: [10, 11, 12], monthNames: ['October', 'November', 'December'] },
];

// Menu items for sidebar - will add onClick handlers in component
const baseMenuItems = [
  { id: 'calendar', label: 'Calendar', icon: 'calendar', active: true },
  { id: 'materials', label: 'Marketing Materials', icon: 'file-stack' },
  // { id: 'settings', label: 'Settings', icon: 'gear' },
  // { id: 'account', label: 'Account', icon: 'person-upper-body' },
];

function QuarterViewContent() {
  const router = useRouter();
  const { isOpen, toggle } = useSidebar();
  const [view, setView] = React.useState('quarter');
  const [events, setEvents] = React.useState<EventIdea[]>([]);
  const [outreachAngles, setOutreachAngles] = React.useState<OutreachAngle[]>([]);
  const [materialsCounts, setMaterialsCounts] = React.useState<Record<number, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentQuarter = Math.ceil(currentMonth / 3);
  const [selectedQuarter, setSelectedQuarter] = React.useState(currentQuarter);
  const [selectedYear, setSelectedYear] = React.useState(currentYear);

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
          .or(`start_year.eq.${selectedYear},year.eq.${selectedYear},is_recurring.eq.true`)
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
      return: 'quarter',
      year: selectedYear.toString(),
      quarter: selectedQuarter.toString(),
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

  const handleAddEventForMonth = (monthNumber: number) => {
    const params = new URLSearchParams({
      return: 'quarter',
      year: selectedYear.toString(),
      month: monthNumber.toString(),
      quarter: selectedQuarter.toString(),
    });
    router.push(`/add-event?${params.toString()}`);
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

  // Get events whose preparation window falls in this month
  const getPrepEventsForMonth = (month: number) => {
    return events.filter(event => {
      const eventStartMonth = event.start_month || event.month;
      const eventStartYear = event.start_year || event.year;

      // Only consider events with preparation requirements
      if (!event.prep_months_needed && !event.prep_start_date) {
        return false;
      }

      // Skip recurring events for prep calculation
      if (event.is_recurring) {
        return false;
      }

      // Don't show events in prep section if they're actually occurring this month
      // (they'll show in the main section)
      const eventDate = new Date(eventStartYear, eventStartMonth - 1);
      const checkDate = new Date(selectedYear, month - 1);

      // For multi-month events, check if this month is within the event span
      if (event.end_month && event.end_year) {
        const endDate = new Date(event.end_year, event.end_month - 1);
        if (checkDate >= eventDate && checkDate <= endDate) {
          return false; // Event is occurring, don't show in prep section
        }
      } else {
        // Single month event
        if (eventStartYear === selectedYear && eventStartMonth === month) {
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

  const handleViewChange = (newView: string) => {
    setView(newView);
    if (newView === 'month') {
      router.push('/month');
    } else if (newView === 'year') {
      router.push('/annual');
    }
    // Stay on quarter for 'quarter'
  };

  const handlePreviousQuarter = () => {
    if (selectedQuarter === 1) {
      setSelectedQuarter(4);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedQuarter(prev => prev - 1);
    }
  };

  const handleNextQuarter = () => {
    if (selectedQuarter === 4) {
      setSelectedQuarter(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedQuarter(prev => prev + 1);
    }
  };

  const handleToday = () => {
    setSelectedQuarter(currentQuarter);
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
          <div className="text-lg font-medium text-[#181818]">Loading events...</div>
        </div>
      </div>
    );
  }

  const quarter = quarters[selectedQuarter - 1];

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
            <h1 className="sm:hidden text-2xl font-semibold leading-tight text-[#181818] truncate">{quarter.name} {selectedYear}</h1>
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
                aria-label="Previous quarter"
                onClick={handlePreviousQuarter}
              />
              <Button
                type="transparent"
                size="medium"
                iconOnly
                iconL="arrow-right"
                aria-label="Next quarter"
                onClick={handleNextQuarter}
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

        {/* Quarter Header - Desktop only */}
        <div className="hidden sm:flex gap-2 items-start">
          <h1 className="text-2xl sm:text-3xl font-semibold leading-tight text-[#181818]">{quarter.name} {selectedYear}</h1>
        </div>

        {/* Error State */}
        {error ? (
          <Container className="flex flex-col items-center justify-center p-12">
            <p className="text-lg font-semibold text-gray-900 mb-2">Oops! Something went wrong</p>
            <p className="text-sm text-gray-600 mb-6 text-center max-w-md">{error}</p>
            <Button
              type="primary"
              size="medium"
              label="Try Again"
              onClick={handleRetry}
            />
          </Container>
        ) : (
          /* Quarter Grid - 3 columns for the 3 months in this quarter */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quarter.months.map((monthNumber, index) => {
            const monthName = quarter.monthNames[index];
            const isCurrentMonth = monthNumber === currentMonth && selectedYear === currentYear;
            const monthEvents = getEventsForMonth(monthNumber);
            const prepEvents = getPrepEventsForMonth(monthNumber);

            return (
              <Container
                key={monthNumber}
                className={cn(
                  'flex flex-col gap-4 h-full w-full',
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
                    {monthName}
                  </h2>
                  <Button
                    type="no-fill"
                    size="x-small"
                    iconOnly
                    iconL="plus"
                    aria-label={`Add event to ${monthName}`}
                    onClick={() => handleAddEventForMonth(monthNumber)}
                  />
                </div>

                {/* Events Occurring This Month */}
                {monthEvents.length > 0 && (
                  <div className="flex flex-col gap-2 w-full">
                    {monthEvents.map((event) => {
                      const processedEvent = eventDataProcessor.formatEventForDisplay(
                        event,
                        outreachAngles,
                        selectedYear
                      );
                      const materialsCount = materialsCounts[event.id] || 0;

                      return (
                        <Card
                          key={event.id}
                          size="small"
                          variant="interactive"
                          onClick={() => {
                            const params = new URLSearchParams({
                              return: 'quarter',
                              year: selectedYear.toString(),
                              quarter: selectedQuarter.toString(),
                            });
                            router.push(`/event/${event.id}?${params.toString()}`);
                          }}
                        >
                          {/* Header Block */}
                          <div className="flex flex-col w-full">
                            <h3 className="text-sm font-medium leading-5 text-[#181818]">
                              {event.title}
                            </h3>
                            {processedEvent.displayDate.isMultiMonth && (
                              <p className="text-xs font-normal leading-5 text-[#424242]">
                                {processedEvent.displayDate.start}
                                {processedEvent.displayDate.end && ` – ${processedEvent.displayDate.end}`}
                              </p>
                            )}
                          </div>

                          {/* Description */}
                          {event.description && (
                            <p className="text-sm font-normal leading-5 text-[#181818] w-full">
                              {event.description}
                            </p>
                          )}

                          {/* Outreach Angle Perspectives */}
                          {processedEvent.processedOutreachAngles.map((angleSelection, idx) => {
                            if (!angleSelection.notes) return null;

                            return (
                              <div key={idx} className="flex flex-col w-full">
                                <p className="text-xs font-medium leading-5 text-[#424242]">
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
                            {event.is_recurring && (
                              <Pill
                                type="transparent"
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
                    })}
                  </div>
                )}

                {/* Preparation Needed Section - Future events with prep starting this month */}
                {prepEvents.length > 0 && (
                  <div className="flex flex-col gap-2 w-full">
                    <h3 className="text-sm font-medium leading-5 text-[#181818]">
                      Preparation Needed
                    </h3>
                    {prepEvents.map((event) => {
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
                              return: 'quarter',
                              year: selectedYear.toString(),
                              quarter: selectedQuarter.toString(),
                            });
                            router.push(`/event/${event.id}?${params.toString()}`);
                          }}
                        >
                          {/* Header Block */}
                          <div className="flex flex-col w-full">
                            <h3 className="text-sm font-medium leading-5 text-[#181818]">
                              {event.title}
                            </h3>
                            {processedEvent.displayDate.isMultiMonth && (
                              <p className="text-xs font-normal leading-5 text-[#424242]">
                                {processedEvent.displayDate.start}
                                {processedEvent.displayDate.end && ` – ${processedEvent.displayDate.end}`}
                              </p>
                            )}
                          </div>

                          {/* Description */}
                          {event.description && (
                            <p className="text-sm font-normal leading-5 text-[#181818] w-full">
                              {event.description}
                            </p>
                          )}

                          {/* Outreach Angle Perspectives */}
                          {processedEvent.processedOutreachAngles.map((angleSelection, idx) => {
                            if (!angleSelection.notes) return null;

                            return (
                              <div key={idx} className="flex flex-col w-full">
                                <p className="text-xs font-medium leading-5 text-[#424242]">
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
                            {event.is_recurring && (
                              <Pill
                                type="transparent"
                                size="small"
                                label="Yearly"
                              />
                            )}
                            {prepLabel && (
                              <Pill
                                type="transparent"
                                size="small"
                                label="Prep"
                                subtextR={prepLabel}
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
                    })}
                  </div>
                )}

                {/* Empty State */}
                {monthEvents.length === 0 && prepEvents.length === 0 && (
                  <p className="text-sm font-normal leading-5 text-[#424242]">
                    No Events Planned
                  </p>
                )}
              </Container>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuarterViewPage() {
  return (
    <SidebarProvider>
      <QuarterViewContent />
    </SidebarProvider>
  );
}
