'use client';

import React, { useState, useEffect, useRef, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';
import { Container } from '@/design-system/components/Container';
import { supabase, MarketingMaterial, EventIdea } from '@/lib/supabase';
import { MarketingMaterialsService } from '@/lib/marketingMaterials';
import { useToast } from '@/contexts/ToastContext';

interface MaterialDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function MaterialDetailContent({ params }: MaterialDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: materialId } = use(params);
  const { toast } = useToast();

  // Get return navigation parameters
  const returnUrl = searchParams.get('returnUrl') || '/materials';
  const successHandledRef = useRef<string | null>(null);

  // State
  const [material, setMaterial] = useState<MarketingMaterial | null>(null);
  const [event, setEvent] = useState<EventIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Check for success message in URL params and show toast
  useEffect(() => {
    const success = searchParams?.get('success');

    if (success && success !== successHandledRef.current) {
      successHandledRef.current = success;

      if (success === 'material-saved') {
        toast.positive('Material saved successfully');
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

  useEffect(() => {
    const loadMaterialDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);

        console.log('Loading material with ID:', materialId);
        const { data, error } = await supabase
          .from('marketing_materials')
          .select('*')
          .eq('id', materialId)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          if (error.code === 'PGRST116') {
            setNotFound(true);
          } else {
            throw error;
          }
        } else {
          console.log('Material loaded:', data);
          setMaterial(data);

          // Load associated event if exists
          if (data.event_id) {
            loadEventDetails(data.event_id);
          }
        }
      } catch (error: any) {
        console.error('Error loading material:', error);
        setError('Unable to load material details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadMaterialDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId]);

  const loadEventDetails = async (eventId: number) => {
    try {
      const { data, error } = await supabase
        .from('events_ideas')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
    }
  };

  const handleBack = () => {
    router.push(returnUrl);
  };

  const handleEdit = () => {
    // Return to this material detail page after editing
    const detailPageUrl = `/materials/${materialId}?returnUrl=${encodeURIComponent(returnUrl)}`;
    router.push(`/materials/edit/${materialId}?returnUrl=${encodeURIComponent(detailPageUrl)}`);
  };


  const handleCopyUrl = async () => {
    if (!material?.url) return;

    try {
      await navigator.clipboard.writeText(material.url);
      toast.positive('URL copied successfully');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.alert('Failed to copy URL', { showSubtext: true, subtext: 'Please try again' });
    }
  };

  const handleUrlClick = () => {
    if (material?.url) {
      window.open(material.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleGoToEvent = () => {
    if (event) {
      router.push(`/event/${event.id}?returnUrl=${encodeURIComponent(`/materials/${materialId}`)}`);
    }
  };

  // Format dates for display
  const formatDate = (date: string) => {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  // Format event display with date
  const getEventDisplay = () => {
    if (!event) return 'Any Time';

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const startMonth = months[event.start_month - 1];
    const endMonth = event.end_month ? months[event.end_month - 1] : null;

    if (endMonth && endMonth !== startMonth) {
      return `${event.title}, ${startMonth} – ${endMonth} ${event.start_year}`;
    } else {
      return `${event.title}, ${startMonth} ${event.start_year}`;
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            'linear-gradient(233.809deg, rgb(221, 207, 235) 11.432%, rgb(201, 230, 240) 84.149%)',
        }}
      >
        <div className="text-center">
          <div className="text-body-lg-medium !text-[var(--color-fg-neutral-primary)]">Loading material...</div>
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
            'linear-gradient(233.809deg, rgb(221, 207, 235) 11.432%, rgb(201, 230, 240) 84.149%)',
        }}
      >
        <div className="flex flex-col items-center justify-center p-12">
          <p className="text-body-lg-semibold !text-[var(--color-fg-neutral-primary)] mb-2">Material Not Found</p>
          <p className="text-body-sm-regular !text-[var(--color-fg-neutral-secondary)] mb-6">This material may have been deleted.</p>
          <Button
            type="primary"
            size="medium"
            label="Back to Materials"
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
            'linear-gradient(233.809deg, rgb(221, 207, 235) 11.432%, rgb(201, 230, 240) 84.149%)',
        }}
      >
        <div className="flex flex-col items-center justify-center p-12">
          <p className="text-body-lg-semibold !text-[var(--color-fg-neutral-primary)] mb-2">Oops! Something went wrong</p>
          <p className="text-sm text-gray-600 mb-6 text-center max-w-md">{error}</p>
          <Button
            type="primary"
            size="medium"
            label="Try Again"
            onClick={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            'linear-gradient(233.809deg, rgb(221, 207, 235) 11.432%, rgb(201, 230, 240) 84.149%)',
        }}
      >
        <div className="flex flex-col items-center justify-center p-12">
          <p className="text-body-lg-semibold !text-[var(--color-fg-neutral-primary)] mb-2">Material Not Found</p>
          <p className="text-body-sm-regular !text-[var(--color-fg-neutral-secondary)] mb-6">This material may have been deleted.</p>
          <Button
            type="primary"
            size="medium"
            label="Back to Materials"
            onClick={handleBack}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          'linear-gradient(233.809deg, rgb(221, 207, 235) 11.432%, rgb(201, 230, 240) 84.149%)',
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
              aria-label="Back"
              onClick={handleBack}
            />
          </div>

          {/* Center - Empty */}
          <div className="w-auto" />

          {/* Right - Edit Material Button */}
          <div className="flex-1 flex gap-2 items-center justify-end">
            <Button
              type="transparent"
              size="medium"
              iconL="pencil"
              label="Edit Material"
              onClick={handleEdit}
            />
          </div>
        </div>

        {/* Material Details Content - Centered */}
        <div className="flex justify-center w-full">
          <div className="flex flex-col gap-6 w-full max-w-[800px]">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
              {/* Material Title */}
              <h1 className="text-[24px] leading-[32px] sm:text-[32px] sm:leading-[40px] font-semibold tracking-[-0.5px] !text-[var(--color-fg-neutral-primary)]">
                {material.label}
              </h1>

              {/* URL and Copy Button */}
              <div className="flex items-start gap-2 w-full">
                <p
                  className="text-body-md-medium !text-[var(--color-fg-neutral-secondary)] cursor-pointer hover:underline break-words flex-1 min-w-0"
                  onClick={handleUrlClick}
                >
                  {material.url}
                </p>
                <Button
                  type="transparent"
                  size="x-small"
                  label="Copy URL"
                  onClick={handleCopyUrl}
                  className="shrink-0 whitespace-nowrap"
                />
              </div>
            </div>

            {/* Details Section */}
            <div className="flex flex-col gap-3">
              {/* Details Container */}
              <Container className="flex flex-col gap-4">
                {/* Container Header */}
                <div className="flex items-center justify-between w-full">
                  <h2 className="text-body-md-bold !text-[var(--color-fg-neutral-primary)]">
                    Details
                  </h2>
                </div>

                {/* Cards List */}
                <div className="flex flex-col gap-2 w-full">
                  {/* Notes Card */}
                  {material.notes && (
                    <Card size="small" className="w-full">
                      <p className="text-body-sm-medium !text-[var(--color-fg-neutral-secondary)]">
                        Notes
                      </p>
                      <p className="text-body-md-regular !text-[var(--color-fg-neutral-primary)] whitespace-pre-wrap">
                        {material.notes}
                      </p>
                    </Card>
                  )}

                  {/* Associated Event Card */}
                  <Card size="small" className="w-full">
                    <p className="text-sm font-medium leading-5 text-[#424242]">
                      Associated Event
                    </p>
                    <div className="flex items-start justify-between gap-2 w-full">
                      <p className="flex-1 text-body-md-regular !text-[var(--color-fg-neutral-primary)]">
                        {getEventDisplay()}
                      </p>
                      {event && (
                        <Button
                          type="transparent"
                          size="x-small"
                          label="Go to Event"
                          onClick={handleGoToEvent}
                        />
                      )}
                    </div>
                  </Card>
                </div>

                {/* Created and Updated Dates */}
                <div className="flex items-center justify-between w-full gap-4">
                  <div className="flex-1">
                    <p className="text-body-sm-regular !text-[var(--color-fg-neutral-secondary)]">
                      Created {formatDate(material.created_at)}
                    </p>
                  </div>
                  {material.created_at !== material.updated_at && (
                    <div className="flex-1">
                      <p className="text-sm font-normal leading-5 text-[#424242] text-right">
                        Updated {formatDate(material.updated_at)}
                      </p>
                    </div>
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
          'linear-gradient(233.809deg, rgb(221, 207, 235) 11.432%, rgb(201, 230, 240) 84.149%)',
      }}
    >
      <div className="text-center">
        <div className="text-lg font-medium text-[#181818]">Loading...</div>
      </div>
    </div>
  );
}

export default function MaterialDetailPage({ params }: MaterialDetailPageProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MaterialDetailContent params={params} />
    </Suspense>
  );
}
