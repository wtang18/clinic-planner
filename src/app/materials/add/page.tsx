'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, EventIdea, NewMarketingMaterial } from '@/lib/supabase';
import { MarketingMaterialsService } from '@/lib/marketingMaterials';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { Textarea } from '@/design-system/components/Textarea';
import { useToast } from '@/contexts/ToastContext';

function AddMaterialForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [events, setEvents] = useState<EventIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get search params
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get('returnUrl') || '/materials';
  const preselectedEventId = searchParams?.get('eventId');

  const [formData, setFormData] = useState<{
    label: string;
    url: string;
    event_id: string; // string for form, will convert to number | null
    notes: string;
  }>({
    label: '',
    url: '',
    event_id: preselectedEventId || '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events_ideas')
        .select('*')
        .order('title');

      if (error) {
        console.error('Error loading events:', error);
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Material name is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      // Basic URL validation
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Convert event_id: empty string -> null, otherwise to number
      const materialData: NewMarketingMaterial = {
        label: formData.label.trim(),
        url: formData.url.trim(),
        event_id: formData.event_id ? parseInt(formData.event_id) : null,
        notes: formData.notes.trim() || null,
      };

      const result = await MarketingMaterialsService.createMaterial(materialData);

      if (result) {
        // Navigate with success message in URL params
        const separator = returnUrl.includes('?') ? '&' : '?';
        router.push(`${returnUrl}${separator}success=material-created`);
      } else {
        toast.alert('Failed to create material', { showSubtext: true, subtext: 'Please try again' });
      }
    } catch (error) {
      console.error('Error creating material:', error);
      toast.alert('Failed to create material', { showSubtext: true, subtext: 'Please try again' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('Discard changes? Your edits will be lost.')) {
        return;
      }
    }
    router.push(returnUrl);
  };

  // Browser navigation protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

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
              onClick={handleCancel}
            />
          </div>

          {/* Center - Empty */}
          <div className="w-auto" />

          {/* Right - Empty */}
          <div className="flex-1 flex gap-2 items-center justify-end" />
        </div>

        {/* Form Content - Centered */}
        <div className="flex justify-center w-full">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 w-full max-w-[600px] pb-[120px]"
          >
            {/* Header */}
            <div className="flex flex-col gap-2">
              <h1 className="text-[24px] leading-[32px] sm:text-[32px] sm:leading-[40px] font-semibold tracking-[-0.5px] !text-[var(--color-fg-neutral-primary)]">
                Add Marketing Material
              </h1>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-4">
              {/* Material Name */}
              <Input
                label="Material Name"
                value={formData.label}
                onChange={(e) => {
                  setHasUnsavedChanges(true);
                  setFormData({ ...formData, label: e.target.value });
                }}
                placeholder="e.g., Spring Newsletter, FAQ Sheet, Holiday Flyer"
                type="filled"
                required
                error={!!errors.label}
                errorMessage={errors.label}
              />

              {/* URL */}
              <Input
                label="URL"
                value={formData.url}
                onChange={(e) => {
                  setHasUnsavedChanges(true);
                  setFormData({ ...formData, url: e.target.value });
                }}
                placeholder="https://..."
                type="filled"
                required
                error={!!errors.url}
                errorMessage={errors.url}
              />

              {/* Event Association */}
              <div className="flex flex-col gap-1">
                <label className="text-body-sm-medium !text-[var(--color-fg-neutral-tertiary)]">
                  Associated Event
                </label>
                <div className="relative">
                  <select
                    value={formData.event_id}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setFormData({ ...formData, event_id: e.target.value });
                    }}
                    className="w-full h-10 px-3 py-2.5 bg-[var(--color-bg-transparent-subtle)] hover:bg-[var(--color-bg-neutral-low)] rounded-lg text-body-sm-regular !text-[var(--color-fg-neutral-primary)] appearance-none pr-10 transition-all duration-200 border-0 outline-none focus:bg-[var(--color-bg-input-low)] focus:shadow-[0_0_0_2px_var(--color-bg-input-high)]"
                  >
                    <option value="">Any Time (Not Event Specific)</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M5.5 7.75L10 12.25L14.5 7.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <Textarea
                label="Notes"
                value={formData.notes}
                onChange={(e) => {
                  setHasUnsavedChanges(true);
                  setFormData({ ...formData, notes: e.target.value });
                }}
                placeholder=""
                type="filled"
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 items-center py-6">
              <Button
                type="transparent"
                size="large"
                label="Cancel"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1"
              />
              <Button
                type="primary"
                size="large"
                label="Create Material"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1"
              />
            </div>
          </form>
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
        <div className="text-body-lg-medium !text-[var(--color-fg-neutral-primary)]">Loading...</div>
      </div>
    </div>
  );
}

export default function AddMaterialPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AddMaterialForm />
    </Suspense>
  );
}
