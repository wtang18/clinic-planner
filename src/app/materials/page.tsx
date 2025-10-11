'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';
import { Container } from '@/design-system/components/Container';
import { SearchInput } from '@/design-system/components/SearchInput';
import { Pill } from '@/design-system/components/Pill';
import { Sidebar } from '@/design-system/components/Sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { Icon } from '@/design-system/icons';
import { MarketingMaterialsService } from '@/lib/marketingMaterials';
import { MarketingMaterial, EventIdea, supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';

// Menu items for sidebar
const menuItems = [
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'materials', label: 'Marketing Materials', icon: 'file-stack', active: true },
  // { id: 'settings', label: 'Settings', icon: 'gear' },
  // { id: 'account', label: 'Account', icon: 'person-upper-body' },
];

type SortBy = 'name' | 'event' | 'created' | 'updated';

interface MaterialCardProps {
  material: MarketingMaterial;
  eventName: string;
  onCardClick: () => void;
  onEventClick: (eventId: number) => void;
  enableEventPillNavigation?: boolean;
}

/**
 * MaterialCard component matching Figma design
 * Displays individual marketing material with label, URL, event association, and notes
 */
function MaterialCard({ material, eventName, onCardClick, onEventClick, enableEventPillNavigation = true }: MaterialCardProps) {
  const isAnyTime = material.event_id === null;

  return (
    <Card
      size="small"
      variant="interactive"
      className="w-full"
      onClick={onCardClick}
    >
      <div className="flex flex-col gap-3 w-full">
        {/* Header Row - Title and URL */}
        <div className="flex flex-col gap-0 w-full">
          <p className="text-body-sm-medium !text-[var(--color-fg-neutral-primary)] truncate overflow-ellipsis overflow-hidden whitespace-nowrap">
            {material.label}
          </p>
          <p className="text-body-xs-regular !text-[var(--color-fg-neutral-secondary)] truncate overflow-ellipsis overflow-hidden whitespace-nowrap">
            {material.url}
          </p>
        </div>

        {/* Notes */}
        <div className="flex gap-2 items-start w-full h-[20px]">
          <p className="text-body-sm-regular !text-[var(--color-fg-neutral-primary)] truncate overflow-ellipsis overflow-hidden whitespace-nowrap flex-1">
            {material.notes || ''}
          </p>
        </div>

        {/* Footer Row - Event Pill and Go to URL Button */}
        <div className="flex items-start justify-between w-full">
          {isAnyTime ? (
            <Pill
              type="transparent"
              size="small"
              label={eventName}
            />
          ) : (
            <Pill
              type="transparent"
              size="small"
              label={eventName}
              interactive={enableEventPillNavigation}
              onClick={enableEventPillNavigation ? () => {
                if (material.event_id) {
                  onEventClick(material.event_id);
                }
              } : undefined}
            />
          )}
          <div className="flex gap-2 items-center">
            <Button
              type="no-fill"
              size="x-small"
              label="Go to URL"
              iconR="arrow-right"
              onClick={(e) => {
                e.stopPropagation();
                window.open(material.url, '_blank', 'noopener,noreferrer');
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

function MarketingMaterialsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isOpen, toggle } = useSidebar();
  const successHandledRef = React.useRef<string | null>(null);

  // State management
  const [materials, setMaterials] = React.useState<MarketingMaterial[]>([]);
  const [events, setEvents] = React.useState<EventIdea[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterAnyTime, setFilterAnyTime] = React.useState<boolean | null>(null); // null = all, true = any time only, false = event-specific only
  const [sortBy, setSortBy] = React.useState<SortBy>('name');
  const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);
  const [showSortDropdown, setShowSortDropdown] = React.useState(false);

  // Check for success message in URL params and show toast
  React.useEffect(() => {
    const success = searchParams?.get('success');

    if (success && success !== successHandledRef.current) {
      successHandledRef.current = success;

      if (success === 'material-created') {
        toast.positive('Material created successfully');
      } else if (success === 'material-deleted') {
        toast.positive('Material deleted successfully');
      }

      // Clean up URL by removing the success param after toast is shown
      setTimeout(() => {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        successHandledRef.current = null; // Reset for next time
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.get('success')]);

  // Load data on mount
  React.useEffect(() => {
    loadData();
  }, []);

  // Load materials and events
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [materialsData, eventsResponse] = await Promise.all([
        MarketingMaterialsService.getAllMaterials(),
        supabase.from('events_ideas').select('*').order('title')
      ]);

      if (eventsResponse.error) {
        throw eventsResponse.error;
      }

      setMaterials(materialsData);
      setEvents(eventsResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Unable to load materials. Please check your connection and try again.');
      setMaterials([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Get event name by ID
  const getEventName = (eventId: number | null): string => {
    if (eventId === null) return 'Any Time';
    const event = events.find(e => e.id === eventId);
    return event?.title || 'Unknown Event';
  };

  // Search handler
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      if (query.trim()) {
        const results = await MarketingMaterialsService.searchMaterials(query);
        setMaterials(results);
        setError(null);
      } else {
        loadData();
      }
    } catch (error) {
      console.error('Error searching:', error);
      setError('Search failed. Please try again.');
    }
  };

  // Retry handler
  const handleRetry = () => {
    setError(null);
    loadData();
  };

  // Sort materials
  const sortMaterials = (materialsToSort: MarketingMaterial[]): MarketingMaterial[] => {
    const sorted = [...materialsToSort];

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.label.localeCompare(b.label));
      case 'event':
        return sorted.sort((a, b) => {
          const eventA = getEventName(a.event_id);
          const eventB = getEventName(b.event_id);
          return eventA.localeCompare(eventB);
        });
      case 'created':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'updated':
        return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      default:
        return sorted;
    }
  };

  // Apply filters and search
  const filteredMaterials = React.useMemo(() => {
    let filtered = materials;

    // Apply event filter
    if (filterAnyTime === true) {
      filtered = filtered.filter(m => m.event_id === null);
    } else if (filterAnyTime === false) {
      filtered = filtered.filter(m => m.event_id !== null);
    }

    // Sort
    return sortMaterials(filtered);
  }, [materials, filterAnyTime, sortBy, events]);

  // Handlers
  const handleMenuItemClick = (id: string) => {
    if (id === 'calendar') {
      router.push('/annual');
    } else if (id === 'materials') {
      // Already on materials page
    }
  };

  const handleMaterialCardClick = (materialId: number) => {
    router.push(`/materials/${materialId}?returnUrl=/materials`);
  };

  const handleEventPillClick = (eventId: number) => {
    router.push(`/event/${eventId}?returnUrl=/materials`);
  };

  const handleAddMaterial = () => {
    router.push('/materials/add?returnUrl=/materials');
  };

  const handleFilterSelect = (filter: boolean | null) => {
    setFilterAnyTime(filter);
    setFilterChanged(true);
    setShowFilterDropdown(false);
  };

  const handleSortSelect = (sort: SortBy) => {
    setSortBy(sort);
    setSortChanged(true);
    setShowSortDropdown(false);
  };

  // Track if filter/sort have been changed
  const [filterChanged, setFilterChanged] = React.useState(false);
  const [sortChanged, setSortChanged] = React.useState(false);

  // Get filter button label
  const getFilterLabel = () => {
    if (!filterChanged) return 'Filter';
    if (filterAnyTime === null) return 'All Materials';
    if (filterAnyTime === true) return 'Any Time';
    return 'Event-Specific';
  };

  // Get sort button label (concise)
  const getSortLabel = () => {
    if (!sortChanged) return 'Sort';
    switch (sortBy) {
      case 'name': return 'Name';
      case 'event': return 'Event';
      case 'created': return 'Created';
      case 'updated': return 'Updated';
      default: return 'Name';
    }
  };

  // Update menu items with click handlers
  const menuItemsWithHandlers = menuItems.map(item => ({
    ...item,
    onClick: () => handleMenuItemClick(item.id),
  }));

  return (
    <div
      className="min-h-screen w-full flex items-start"
      style={{
        background: 'linear-gradient(233.809deg, rgb(221, 207, 235) 11.432%, rgb(201, 230, 240) 84.149%)',
      }}
    >
      {/* Desktop Sidebar - Hidden on mobile (<768px), visible on desktop (>=768px) */}
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
          <Sidebar isOpen={isOpen} menuItems={menuItemsWithHandlers} />
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
              {menuItemsWithHandlers.map((item) => {
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
          {/* Left - Sidebar Toggle */}
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
            <h1 className="sm:hidden text-[24px] leading-[32px] font-semibold tracking-[-0.5px] !text-[var(--color-fg-neutral-primary)] truncate">Materials</h1>
          </div>

          {/* Center - Search (Tablet+ centered, Mobile full-width second row) */}
          <div className="w-full sm:w-[240px] lg:w-[320px] order-last sm:order-2">
            <SearchInput
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search"
              size="medium"
            />
          </div>

          {/* Right - Filter, Sort, and Add Material */}
          <div className="flex flex-none sm:flex-1 gap-2 items-center justify-end order-3 sm:order-3 min-w-0">
            {/* Filter & Sort - icon-only on mobile/tablet, with label on desktop */}
            <div className="flex gap-2 items-center">
              {/* Filter Dropdown */}
              <div className="relative">
                <Button
                  type="transparent"
                  size="medium"
                  iconOnly
                  iconL="filter"
                  aria-label="Filter materials"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="lg:hidden"
                />
                <Button
                  type="transparent"
                  size="medium"
                  iconL="filter"
                  label={getFilterLabel()}
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="hidden lg:flex"
                />
                {showFilterDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowFilterDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 py-1 backdrop-blur-xl border border-[rgba(0,0,0,0.08)]">
                      <button
                        onClick={() => handleFilterSelect(null)}
                        className={cn(
                          'w-full text-left px-4 py-2 text-[14px] hover:bg-[rgba(0,0,0,0.06)] transition-colors',
                          filterAnyTime === null && 'bg-[rgba(0,0,0,0.08)] font-medium'
                        )}
                      >
                        All Materials
                      </button>
                      <button
                        onClick={() => handleFilterSelect(false)}
                        className={cn(
                          'w-full text-left px-4 py-2 text-[14px] hover:bg-[rgba(0,0,0,0.06)] transition-colors',
                          filterAnyTime === false && 'bg-[rgba(0,0,0,0.08)] font-medium'
                        )}
                      >
                        Event-Specific
                      </button>
                      <button
                        onClick={() => handleFilterSelect(true)}
                        className={cn(
                          'w-full text-left px-4 py-2 text-[14px] hover:bg-[rgba(0,0,0,0.06)] transition-colors',
                          filterAnyTime === true && 'bg-[rgba(0,0,0,0.08)] font-medium'
                        )}
                      >
                        Any Time
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <Button
                  type="transparent"
                  size="medium"
                  iconOnly
                  iconL="arrows-up-down"
                  aria-label="Sort materials"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="lg:hidden"
                />
                <Button
                  type="transparent"
                  size="medium"
                  iconL="arrows-up-down"
                  label={getSortLabel()}
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="hidden lg:flex"
                />
                {showSortDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowSortDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 py-1 backdrop-blur-xl border border-[rgba(0,0,0,0.08)]">
                      <button
                        onClick={() => handleSortSelect('name')}
                        className={cn(
                          'w-full text-left px-4 py-2 text-[14px] hover:bg-[rgba(0,0,0,0.06)] transition-colors',
                          sortBy === 'name' && 'bg-[rgba(0,0,0,0.08)] font-medium'
                        )}
                      >
                        Name
                      </button>
                      <button
                        onClick={() => handleSortSelect('event')}
                        className={cn(
                          'w-full text-left px-4 py-2 text-[14px] hover:bg-[rgba(0,0,0,0.06)] transition-colors',
                          sortBy === 'event' && 'bg-[rgba(0,0,0,0.08)] font-medium'
                        )}
                      >
                        Event
                      </button>
                      <button
                        onClick={() => handleSortSelect('created')}
                        className={cn(
                          'w-full text-left px-4 py-2 text-[14px] hover:bg-[rgba(0,0,0,0.06)] transition-colors',
                          sortBy === 'created' && 'bg-[rgba(0,0,0,0.08)] font-medium'
                        )}
                      >
                        Created
                      </button>
                      <button
                        onClick={() => handleSortSelect('updated')}
                        className={cn(
                          'w-full text-left px-4 py-2 text-[14px] hover:bg-[rgba(0,0,0,0.06)] transition-colors',
                          sortBy === 'updated' && 'bg-[rgba(0,0,0,0.08)] font-medium'
                        )}
                      >
                        Updated
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Add Material - icon-only on mobile/tablet, with label on desktop */}
            <Button
              type="primary"
              size="medium"
              iconL="plus"
              label="Add Material"
              onClick={handleAddMaterial}
              className="hidden lg:flex"
            />
            <Button
              type="primary"
              size="medium"
              iconOnly
              iconL="plus"
              aria-label="Add material"
              onClick={handleAddMaterial}
              className="lg:hidden"
            />
          </div>
        </div>

        {/* Details Frame */}
        <div className="flex flex-col gap-6 items-start w-full">
          {/* Header Section - Hidden on mobile, title is in navbar */}
          <div className="hidden sm:flex flex-col gap-2 items-start w-full">
            <h1 className="text-[24px] leading-[32px] sm:text-[32px] sm:leading-[40px] font-semibold tracking-[-0.5px] !text-[var(--color-fg-neutral-primary)]">
              Marketing Materials
            </h1>
          </div>

          {/* Error State */}
          {error && !loading && (
            <Container className="flex flex-col items-center justify-center p-12 w-full">
              <p className="text-body-lg-semibold !text-[var(--color-fg-neutral-primary)] mb-2">Oops! Something went wrong</p>
              <p className="text-body-sm-regular !text-[var(--color-fg-neutral-secondary)] mb-6 text-center max-w-md">{error}</p>
              <Button type="primary" size="medium" label="Try Again" onClick={handleRetry} />
            </Container>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center w-full py-12">
              <p className="text-body-md-regular !text-[var(--color-fg-neutral-secondary)]">Loading materials...</p>
            </div>
          )}

          {/* Empty State - No materials at all */}
          {!loading && !error && materials.length === 0 && (
            <div className="flex flex-col items-center justify-center w-full py-12 gap-3">
              <Icon name="file-stack" size="medium" className="!text-[var(--color-fg-neutral-secondary)] opacity-50" />
              <p className="text-body-md-regular !text-[var(--color-fg-neutral-secondary)]">No materials yet</p>
              <Button
                type="primary"
                size="medium"
                iconL="plus"
                label="Add your first material"
                onClick={handleAddMaterial}
              />
            </div>
          )}

          {/* Empty State - No search/filter results */}
          {!loading && !error && materials.length > 0 && filteredMaterials.length === 0 && (
            <div className="flex flex-col items-center justify-center w-full py-12 gap-3">
              <Icon name="magnifying-glass" size="medium" className="!text-[var(--color-fg-neutral-secondary)] opacity-50" />
              <p className="text-body-md-regular !text-[var(--color-fg-neutral-secondary)]">
                {searchQuery ? 'No materials match your search' : 'No materials match your filter'}
              </p>
              <Button
                type="transparent"
                size="medium"
                label="Clear filters"
                onClick={() => {
                  setSearchQuery('');
                  setFilterAnyTime(null);
                  loadData();
                }}
              />
            </div>
          )}

          {/* Materials Grid - Responsive: 4 cols desktop, 2 cols tablet, 1 col mobile */}
          {!loading && !error && filteredMaterials.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
              {filteredMaterials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  eventName={getEventName(material.event_id)}
                  onCardClick={() => handleMaterialCardClick(material.id)}
                  onEventClick={handleEventPillClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MarketingMaterialsPage() {
  return (
    <SidebarProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <MarketingMaterialsContent />
      </Suspense>
    </SidebarProvider>
  );
}
