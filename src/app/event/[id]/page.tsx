'use client';

import React, { useState, useEffect, useRef, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';
import { Container } from '@/design-system/components/Container';
import { Pill } from '@/design-system/components/Pill';
import { supabase, EventIdea, OutreachAngle, MarketingMaterial } from '@/lib/supabase';
import { MarketingMaterialsService } from '@/lib/marketingMaterials';
import { eventDataProcessor } from '@/lib/eventHelpers';
import { useToast } from '@/contexts/ToastContext';

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface MaterialCardProps {
  material: MarketingMaterial;
  eventName: string;
  onCardClick: () => void;
  onEventClick: (eventId: number) => void;
  enableEventPillNavigation?: boolean;
}

/**
 * MaterialCard component matching Figma design
 * Same component used in Marketing Materials page
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
          <p className="font-normal text-[14px] leading-[20px] text-[#181818] truncate overflow-ellipsis overflow-hidden whitespace-nowrap flex-1">
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

function EventDetailContent({ params }: EventDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: eventId } = use(params);
  const { toast } = useToast();

  // Get return navigation parameters
  const returnUrl = searchParams.get('returnUrl');
  const returnView = searchParams.get('return') || 'annual';
  const returnMonth = searchParams.get('month');
  const returnYear = searchParams.get('year');
  const returnQuarter = searchParams.get('quarter');
  const successHandledRef = useRef<string | null>(null);

  // State
  const [event, setEvent] = useState<EventIdea | null>(null);
  const [outreachAngles, setOutreachAngles] = useState<OutreachAngle[]>([]);
  const [materials, setMaterials] = useState<MarketingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Get current year for display (from return params or current year)
  const displayYear = returnYear ? parseInt(returnYear) : new Date().getFullYear();

  // Check for success message in URL params and show toast
  useEffect(() => {
    const success = searchParams?.get('success');

    if (success && success !== successHandledRef.current) {
      successHandledRef.current = success;

      if (success === 'material-created') {
        toast.positive('Material created successfully');
      } else if (success === 'material-deleted') {
        toast.positive('Material deleted successfully');
      } else if (success === 'event-saved') {
        toast.positive('Event saved successfully');
      }

      // Clean up URL by removing the success param after toast is shown
      setTimeout(() => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('success');
        window.history.replaceState({}, '', currentUrl.toString());
        successHandledRef.current = null; // Reset for next time
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.get('success')]);

  const loadEventDetails = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setNotFound(false);

      console.log('Loading event with ID:', eventId);
      const { data, error } = await supabase
        .from('events_ideas')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === 'PGRST116') {
          setNotFound(true);
        } else {
          throw error;
        }
      } else {
        console.log('Event loaded:', data);
        setEvent(data);
      }
    } catch (error: any) {
      console.error('Error loading event:', error);
      setError('Unable to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    const loadOutreachAngles = async () => {
      try {
        const { data, error } = await supabase
          .from('outreach_angles')
          .select('*')
          .order('name');

        if (error) throw error;
        setOutreachAngles(data || []);
      } catch (error) {
        console.error('Error loading outreach angles:', error);
      }
    };

    const loadEventMaterials = async () => {
      try {
        const materials = await MarketingMaterialsService.getEventMaterials(parseInt(eventId));
        setMaterials(materials);
      } catch (error) {
        console.error('Error loading materials:', error);
      }
    };

    loadEventDetails();
    loadOutreachAngles();
    loadEventMaterials();
  }, [eventId, loadEventDetails]);

  const handleBack = () => {
    // If returnUrl is provided (e.g., from material detail), use it
    if (returnUrl) {
      router.push(returnUrl);
      return;
    }

    // Otherwise, use the old return logic for calendar views
    if (returnView === 'materials') {
      router.push('/materials');
    } else if (returnView === 'timeline' && returnMonth && returnYear) {
      router.push(`/?view=timeline&month=${returnMonth}&year=${returnYear}`);
    } else if (returnView === 'quarter') {
      router.push(`/quarter`);
    } else if (returnView === 'month') {
      router.push(`/month`);
    } else if (returnView === 'annual') {
      router.push(`/annual`);
    } else {
      router.push(`/annual`);
    }
  };

  const handleEdit = () => {
    const params = new URLSearchParams({
      return: returnView,
      fromDetail: 'true'
    });
    if (returnMonth) params.set('month', returnMonth);
    if (returnYear) params.set('year', returnYear);
    if (returnQuarter) params.set('quarter', returnQuarter);
    router.push(`/edit-event/${eventId}?${params.toString()}`);
  };

  const handleAddMaterial = () => {
    // Build the return URL to come back to this event detail page
    const eventDetailParams = new URLSearchParams({ return: returnView });
    if (returnMonth) eventDetailParams.set('month', returnMonth);
    if (returnYear) eventDetailParams.set('year', returnYear);
    if (returnQuarter) eventDetailParams.set('quarter', returnQuarter);
    const eventDetailUrl = `/event/${eventId}?${eventDetailParams.toString()}`;

    // Build the add material URL with returnUrl and eventId
    const addMaterialParams = new URLSearchParams();
    addMaterialParams.set('returnUrl', eventDetailUrl);
    addMaterialParams.set('eventId', eventId);

    router.push(`/materials/add?${addMaterialParams.toString()}`);
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      const success = await MarketingMaterialsService.deleteMaterial(materialId);
      if (success) {
        setMaterials(prev => prev.filter(m => m.id !== materialId));
        toast.positive('Material deleted successfully');
      } else {
        toast.alert('Failed to delete material', { showSubtext: true, subtext: 'Please try again' });
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.alert('Failed to delete material', { showSubtext: true, subtext: 'Please try again' });
    }
  };

  const handleMaterialCardClick = (materialId: number) => {
    router.push(`/materials/${materialId}?returnUrl=${encodeURIComponent(`/event/${eventId}?return=${returnView}`)}`);
  };

  const handleEventPillClick = (eventId: number) => {
    router.push(`/event/${eventId}?return=${returnView}`);
  };

  // Get event name by ID (for material cards)
  const getEventName = (eventId: number | null): string => {
    if (eventId === null) return 'Any Time';
    if (event && event.id === eventId) return event.title;
    return 'Unknown Event';
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
          <div className="text-body-lg-medium !text-[var(--color-fg-neutral-primary)]">Loading event...</div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            'linear-gradient(233.809deg, rgb(221, 207, 235) 11.432%, rgb(240, 206, 183) 84.149%), linear-gradient(90deg, rgb(241, 241, 241) 0%, rgb(241, 241, 241) 100%)',
        }}
      >
        <div className="flex flex-col items-center justify-center p-12">
          <p className="text-body-lg-semibold !text-[var(--color-fg-neutral-primary)] mb-2">Event Not Found</p>
          <p className="text-body-sm-regular !text-[var(--color-fg-neutral-secondary)] mb-6">This event may have been deleted.</p>
          <Button
            type="primary"
            size="medium"
            label="Back to Calendar"
            onClick={handleBack}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            'linear-gradient(233.809deg, rgb(221, 207, 235) 11.432%, rgb(240, 206, 183) 84.149%), linear-gradient(90deg, rgb(241, 241, 241) 0%, rgb(241, 241, 241) 100%)',
        }}
      >
        <div className="flex flex-col items-center justify-center p-12">
          <p className="text-body-lg-semibold !text-[var(--color-fg-neutral-primary)] mb-2">Oops! Something went wrong</p>
          <p className="text-sm text-gray-600 mb-6 text-center max-w-md">{error}</p>
          <Button
            type="primary"
            size="medium"
            label="Try Again"
            onClick={loadEventDetails}
          />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            'linear-gradient(233.809deg, rgb(221, 207, 235) 11.432%, rgb(240, 206, 183) 84.149%), linear-gradient(90deg, rgb(241, 241, 241) 0%, rgb(241, 241, 241) 100%)',
        }}
      >
        <div className="flex flex-col items-center justify-center p-12">
          <p className="text-body-lg-semibold !text-[var(--color-fg-neutral-primary)] mb-2">Event Not Found</p>
          <p className="text-body-sm-regular !text-[var(--color-fg-neutral-secondary)] mb-6">This event may have been deleted.</p>
          <Button
            type="primary"
            size="medium"
            label="Back to Calendar"
            onClick={handleBack}
          />
        </div>
      </div>
    );
  }

  // Format event data for display
  const formattedEvent = eventDataProcessor.formatEventForDisplay(event, outreachAngles, displayYear);

  // Format dates for display
  const formatDate = (date: string) => {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          'linear-gradient(233.809deg, rgb(221, 207, 235) 11.432%, rgb(240, 206, 183) 84.149%), linear-gradient(90deg, rgb(241, 241, 241) 0%, rgb(241, 241, 241) 100%)',
      }}
    >
      <div
        className="flex flex-col flex-1"
        style={{
          gap: 'var(--dimension-space-between-separated-sm)',
          padding: 'var(--dimension-space-around-xl)'
        }}
      >
        {/* Navbar */}
        <div className="flex items-center justify-between w-full">
          {/* Left - Back Button */}
          <div className="flex-1 flex gap-4 items-center">
            <Button
              type="transparent"
              size="medium"
              iconOnly
              iconL="arrow-left"
              aria-label="Back to calendar"
              onClick={handleBack}
            />
          </div>

          {/* Center - Empty */}
          <div className="w-auto" />

          {/* Right - Edit Event Button */}
          <div className="flex-1 flex gap-2 items-center justify-end">
            <Button
              type="transparent"
              size="medium"
              iconL="pencil"
              label="Edit Event"
              onClick={handleEdit}
            />
          </div>
        </div>

        {/* Event Details Content - Centered */}
        <div className="flex justify-center w-full">
          <div className="flex flex-col w-full max-w-[800px]" style={{ gap: 'var(--dimension-space-between-separated-sm)' }}>
            {/* Header Section */}
            <div className="flex flex-col gap-2">
              {/* Event Title */}
              <h1 className="text-[24px] leading-[32px] sm:text-[32px] sm:leading-[40px] font-semibold tracking-[-0.5px] !text-[var(--color-fg-neutral-primary)]">
                {event.title}
              </h1>

              {/* Date and Recurring Badge */}
              <div className="flex items-center gap-2">
                <p className="text-body-md-medium !text-[var(--color-fg-neutral-secondary)]">
                  {formattedEvent.displayDate.start}
                  {formattedEvent.displayDate.end && ` – ${formattedEvent.displayDate.end}`}
                </p>
                {event.is_recurring && (
                  <Pill type="transparent" size="small" label="Yearly" />
                )}
              </div>
            </div>

            {/* Details Sections */}
            <div className="flex flex-col gap-3">
              {/* Event Details Container */}
              <Container className="flex flex-col gap-4">
                {/* Container Header */}
                <div className="flex items-center justify-between w-full">
                  <h2 className="text-body-md-bold !text-[var(--color-fg-neutral-primary)]">
                    Event Details
                  </h2>
                </div>

                {/* Cards List */}
                <div className="flex flex-col gap-2 w-full">
                  {/* Description Card */}
                  {event.description && (
                    <Card size="small" className="w-full">
                      <p className="text-body-sm-medium !text-[var(--color-fg-neutral-secondary)]">
                        Description
                      </p>
                      <p className="text-body-md-regular !text-[var(--color-fg-neutral-primary)] whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </Card>
                  )}

                  {/* Preparation Planning Card */}
                  {(event.prep_months_needed > 0 || event.prep_start_date) && (
                    <Card size="small" className="w-full">
                      <p className="text-body-sm-medium !text-[var(--color-fg-neutral-secondary)]">
                        Preparation Planning
                      </p>
                      <div className="flex flex-col gap-1">
                        {event.prep_start_date && (
                          <p className="text-body-md-regular !text-[var(--color-fg-neutral-primary)]">
                            Start preparation: {formatDate(event.prep_start_date)}
                          </p>
                        )}
                        {event.prep_months_needed > 0 && (
                          <p className="text-body-md-regular !text-[var(--color-fg-neutral-primary)]">
                            {event.prep_months_needed} {event.prep_months_needed === 1 ? 'month' : 'months'} of preparation needed
                          </p>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Outreach Angle Cards */}
                  {formattedEvent.processedOutreachAngles.map((angleSelection, idx) => {
                    // Map angle names to display headers
                    const angleHeaders: Record<string, string> = {
                      'Urgent Care': 'Urgent Care Perspective',
                      'Primary Care': 'Primary Care Perspective',
                      'Research': 'Research Perspective',
                      'Workplace Health': 'Workplace Health Perspective',
                    };

                    const displayHeader = angleHeaders[angleSelection.angle] || `${angleSelection.angle} Perspective`;

                    return (
                      <Card key={idx} size="small" className="w-full">
                        <div className="flex items-start gap-3 w-full">
                          {/* Color indicator */}
                          {angleSelection.color && (
                            <span
                              className="w-4 h-4 rounded-full mt-0.5 shrink-0"
                              style={{ backgroundColor: angleSelection.color }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-body-sm-medium !text-[var(--color-fg-neutral-secondary)]">
                              {displayHeader}
                            </p>
                            {angleSelection.description && (
                              <p className="text-body-md-regular !text-[var(--color-fg-neutral-primary)] mt-1">
                                {angleSelection.description}
                              </p>
                            )}
                            {angleSelection.notes && (
                              <p className="text-body-md-regular !text-[var(--color-fg-neutral-primary)] mt-2 whitespace-pre-wrap">
                                {angleSelection.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </Container>

              {/* Marketing Materials Container */}
              <Container className="flex flex-col gap-4">
                {/* Container Header */}
                <div className="flex items-center justify-between w-full">
                  <h2 className="text-body-md-bold !text-[var(--color-fg-neutral-primary)]">
                    Marketing Materials
                  </h2>
                  <Button
                    type="no-fill"
                    size="x-small"
                    iconL="plus"
                    label="Add Material"
                    onClick={handleAddMaterial}
                  />
                </div>

                {/* Materials List or Empty State */}
                <div className={cn(
                  "grid gap-3 w-full",
                  materials.length === 0 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                )}>
                  {materials.length === 0 ? (
                    <p className="text-body-sm-regular !text-[var(--color-fg-neutral-secondary)]">
                      No materials added
                    </p>
                  ) : (
                    materials.map((material) => (
                      <MaterialCard
                        key={material.id}
                        material={material}
                        eventName={getEventName(material.event_id)}
                        onCardClick={() => handleMaterialCardClick(material.id)}
                        onEventClick={handleEventPillClick}
                        enableEventPillNavigation={false}
                      />
                    ))
                  )}
                </div>
              </Container>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          'linear-gradient(233.809deg, rgb(221, 207, 235) 11.432%, rgb(240, 206, 183) 84.149%), linear-gradient(90deg, rgb(241, 241, 241) 0%, rgb(241, 241, 241) 100%)',
      }}
    >
      <div className="text-center">
        <div className="text-lg font-medium text-[#181818]">Loading...</div>
      </div>
    </div>
  );
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EventDetailContent params={params} />
    </Suspense>
  );
}
