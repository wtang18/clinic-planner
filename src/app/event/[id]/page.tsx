'use client';

import React, { useState, useEffect, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';
import { Container } from '@/design-system/components/Container';
import { Pill } from '@/design-system/components/Pill';
import { supabase, EventIdea, OutreachAngle, MarketingMaterial } from '@/lib/supabase';
import { MarketingMaterialsService } from '@/lib/marketingMaterials';
import { eventDataProcessor } from '@/lib/eventHelpers';

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function EventDetailContent({ params }: EventDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: eventId } = use(params);

  // Get return navigation parameters
  const returnView = searchParams.get('return') || 'annual';
  const returnMonth = searchParams.get('month');
  const returnYear = searchParams.get('year');
  const returnQuarter = searchParams.get('quarter');

  // State
  const [event, setEvent] = useState<EventIdea | null>(null);
  const [outreachAngles, setOutreachAngles] = useState<OutreachAngle[]>([]);
  const [materials, setMaterials] = useState<MarketingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current year for display (from return params or current year)
  const displayYear = returnYear ? parseInt(returnYear) : new Date().getFullYear();

  useEffect(() => {
    loadEventDetails();
    loadOutreachAngles();
    loadEventMaterials();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      console.log('Loading event with ID:', eventId);
      const { data, error } = await supabase
        .from('events_ideas')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        setError(error.message || 'Failed to load event');
        throw error;
      }
      console.log('Event loaded:', data);
      setEvent(data);
    } catch (error: any) {
      console.error('Error loading event:', error);
      setError(error?.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

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

  const handleBack = () => {
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
    const params = new URLSearchParams();
    params.set('return', `event/${eventId}?return=${returnView}`);
    if (returnMonth) params.set('month', returnMonth);
    if (returnYear) params.set('year', returnYear);
    if (returnQuarter) params.set('quarter', returnQuarter);
    params.set('eventId', eventId);
    router.push(`/add-material?${params.toString()}`);
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      const success = await MarketingMaterialsService.deleteMaterial(materialId);
      if (success) {
        setMaterials(prev => prev.filter(m => m.id !== materialId));
      } else {
        alert('Error deleting material. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Error deleting material. Please try again.');
    }
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
          <div className="text-lg font-medium text-[#181818]">Loading event...</div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            'linear-gradient(233.809deg, rgb(221, 207, 235) 11.432%, rgb(240, 206, 183) 84.149%), linear-gradient(90deg, rgb(241, 241, 241) 0%, rgb(241, 241, 241) 100%)',
        }}
      >
        <div className="text-center max-w-md">
          <div className="text-lg font-medium text-[#181818] mb-4">
            {error || 'Event not found'}
          </div>
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
      <div className="flex flex-col gap-6 p-6 flex-1">
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
          <div className="flex flex-col gap-6 w-full max-w-[800px]">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
              {/* Event Title */}
              <h1 className="text-[32px] font-semibold leading-[40px] text-[#181818]">
                {event.title}
              </h1>

              {/* Date and Recurring Badge */}
              <div className="flex items-center gap-2">
                <p className="text-base font-medium leading-6 text-[#424242]">
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
                  <h2 className="text-base font-semibold leading-6 text-[#181818]">
                    Event Details
                  </h2>
                </div>

                {/* Cards List */}
                <div className="flex flex-col gap-2 w-full">
                  {/* Description Card */}
                  {event.description && (
                    <Card size="small" className="w-full">
                      <p className="text-sm font-medium leading-5 text-[#424242]">
                        Description
                      </p>
                      <p className="text-base font-normal leading-6 text-[#181818] whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </Card>
                  )}

                  {/* Preparation Planning Card */}
                  {(event.prep_months_needed > 0 || event.prep_start_date) && (
                    <Card size="small" className="w-full">
                      <p className="text-sm font-medium leading-5 text-[#424242]">
                        Preparation Planning
                      </p>
                      <div className="flex flex-col gap-1">
                        {event.prep_start_date && (
                          <p className="text-base font-normal leading-6 text-[#181818]">
                            Start preparation: {formatDate(event.prep_start_date)}
                          </p>
                        )}
                        {event.prep_months_needed > 0 && (
                          <p className="text-base font-normal leading-6 text-[#181818]">
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
                            <p className="text-sm font-medium leading-5 text-[#424242]">
                              {displayHeader}
                            </p>
                            {angleSelection.description && (
                              <p className="text-base font-normal leading-6 text-[#181818] mt-1">
                                {angleSelection.description}
                              </p>
                            )}
                            {angleSelection.notes && (
                              <p className="text-base font-normal leading-6 text-[#181818] mt-2 whitespace-pre-wrap">
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
                  <h2 className="text-base font-semibold leading-6 text-[#181818]">
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
                    <p className="text-sm font-normal leading-5 text-[#424242]">
                      No materials added
                    </p>
                  ) : (
                    materials.map((material) => (
                      <div
                        key={material.id}
                        className="bg-white rounded-lg shadow-[0px_1.5px_6px_0px_rgba(0,0,0,0.12)] p-4 flex flex-col gap-3 w-full min-w-0"
                      >
                        {/* Card Header: Title + Action Buttons */}
                        <div className="flex items-center justify-between w-full gap-2">
                          <h3 className="text-base font-medium leading-6 text-[#181818] flex-1 min-w-0 truncate">
                            {material.label || 'Untitled Material'}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Button
                              type="no-fill"
                              size="x-small"
                              iconOnly
                              iconL="pencil"
                              aria-label="Edit material"
                              onClick={() => {
                                const params = new URLSearchParams();
                                params.set('return', `event/${eventId}?return=${returnView}`);
                                if (returnMonth) params.set('month', returnMonth);
                                if (returnYear) params.set('year', returnYear);
                                if (returnQuarter) params.set('quarter', returnQuarter);
                                router.push(`/edit-material/${material.id}?${params.toString()}`);
                              }}
                            />
                            <Button
                              type="no-fill"
                              size="x-small"
                              iconOnly
                              iconL="trash"
                              aria-label="Delete material"
                              onClick={() => handleDeleteMaterial(material.id)}
                            />
                          </div>
                        </div>

                        {/* Pills Row: Event + URL */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {material.event_name && material.event_name !== 'Any Time' && (
                            <Pill
                              type="transparent"
                              size="small"
                              label={material.event_name}
                            />
                          )}
                          {material.event_name === 'Any Time' && (
                            <Pill
                              type="transparent"
                              size="small"
                              label="Any Time"
                            />
                          )}
                          {material.url && (
                            <Pill
                              type="transparent"
                              size="small"
                              subtextL="URL"
                              label={material.url}
                              truncate
                              interactive
                              onClick={() => window.open(material.url, '_blank')}
                              className="max-w-[200px]"
                            />
                          )}
                        </div>

                        {/* Notes */}
                        {material.notes && (
                          <p className="text-sm font-normal leading-5 text-[#424242] whitespace-pre-wrap">
                            {material.notes}
                          </p>
                        )}

                        {/* Footer: Created + Updated Dates */}
                        <div className="flex items-center justify-between w-full gap-4 text-xs font-normal leading-4 text-[#a4a4a4]">
                          <span>Created {formatDate(material.created_at)}</span>
                          <span>Updated {formatDate(material.updated_at)}</span>
                        </div>
                      </div>
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
