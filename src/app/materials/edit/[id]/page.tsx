'use client';

import { useState, useEffect, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, EventIdea, MarketingMaterial } from '@/lib/supabase';
import { MarketingMaterialsService } from '@/lib/marketingMaterials';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { Textarea } from '@/design-system/components/Textarea';
import { useToast } from '@/contexts/ToastContext';

interface EditMaterialPageProps {
  params: Promise<{
    id: string;
  }>;
}

function EditMaterialForm({ params }: EditMaterialPageProps) {
  const router = useRouter();
  const { id: materialId } = use(params);
  const { toast } = useToast();
  const [events, setEvents] = useState<EventIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [material, setMaterial] = useState<MarketingMaterial | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get search params
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get('returnUrl') || '/materials';

  const [formData, setFormData] = useState<{
    label: string;
    url: string;
    event_id: string; // string for form, will convert to number | null
    notes: string;
  }>({
    label: '',
    url: '',
    event_id: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadMaterialAndEvents = async () => {
      try {
        setInitialLoading(true);

        // Load events
        const eventsPromise = supabase
          .from('events_ideas')
          .select('*')
          .order('title');

        // Load material
        const materialPromise = supabase
          .from('marketing_materials')
          .select('*')
          .eq('id', materialId)
          .single();

        const [eventsResponse, materialResponse] = await Promise.all([
          eventsPromise,
          materialPromise,
        ]);

        if (eventsResponse.error) {
          console.error('Error loading events:', eventsResponse.error);
        } else {
          setEvents(eventsResponse.data || []);
        }

        if (materialResponse.error) {
          console.error('Error loading material:', materialResponse.error);
          // Error state UI handles this
          handleCancel();
        } else {
          setMaterial(materialResponse.data);

          // Initialize form from material
          setFormData({
            label: materialResponse.data.label || '',
            url: materialResponse.data.url || '',
            event_id: materialResponse.data.event_id ? String(materialResponse.data.event_id) : '',
            notes: materialResponse.data.notes || '',
          });
        }
      } catch (error) {
        console.error('Error:', error);
        // Error state UI handles this
        handleCancel();
      } finally {
        setInitialLoading(false);
      }
    };

    loadMaterialAndEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialId]);

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
      const materialData = {
        label: formData.label.trim(),
        url: formData.url.trim(),
        event_id: formData.event_id ? parseInt(formData.event_id) : null,
        notes: formData.notes.trim() || null,
      };

      const result = await MarketingMaterialsService.updateMaterial(
        parseInt(materialId),
        materialData
      );

      if (result) {
        // Navigate back to material detail page with success message
        router.push(`/materials/${materialId}?returnUrl=${encodeURIComponent(returnUrl)}&success=material-saved`);
      } else {
        toast.alert('Failed to update material', { showSubtext: true, subtext: 'Please try again' });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.alert('Failed to update material', { showSubtext: true, subtext: 'Please try again' });
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const success = await MarketingMaterialsService.deleteMaterial(parseInt(materialId));

      if (success) {
        // Parse returnUrl to avoid navigating to the deleted material's detail page
        let targetUrl = returnUrl;

        if (returnUrl.includes('/materials/')) {
          const urlParams = new URLSearchParams(returnUrl.split('?')[1] || '');
          const nestedReturnUrl = urlParams.get('returnUrl');

          if (nestedReturnUrl) {
            // Use the nested returnUrl (e.g., event detail or materials list)
            targetUrl = decodeURIComponent(nestedReturnUrl);
          } else {
            // No nested returnUrl, go to materials list
            targetUrl = '/materials';
          }
        }

        // Navigate with success message in URL params
        const separator = targetUrl.includes('?') ? '&' : '?';
        router.push(`${targetUrl}${separator}success=material-deleted`);
      } else {
        toast.alert('Failed to delete material', { showSubtext: true, subtext: 'Please try again' });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.alert('Failed to delete material', { showSubtext: true, subtext: 'Please try again' });
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

  if (initialLoading) {
    return <LoadingFallback />;
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
              onClick={handleCancel}
            />
          </div>

          {/* Center - Empty */}
          <div className="w-auto" />

          {/* Right - Delete Button */}
          <div className="flex-1 flex gap-2 items-center justify-end">
            <Button
              type="high-impact"
              size="medium"
              iconL="trash"
              label="Delete"
              onClick={handleDelete}
              disabled={loading}
            />
          </div>
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
                Edit Material
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
                    className="w-full h-10 px-3 py-2.5 bg-[var(--color-bg-transparent-subtle)] hover:bg-[var(--color-bg-neutral-low)] rounded-lg text-body-sm-regular !text-[var(--color-fg-neutral-primary)] appearance-none pr-10 transition-all duration-200 border-0 outline-none focus-visible:bg-[var(--color-bg-input-low)] focus-visible:shadow-[0_0_0_2px_var(--color-bg-input-high)]"
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
                autoResize
                rows={3}
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
                label="Save Changes"
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

export default function EditMaterialPage({ params }: EditMaterialPageProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EditMaterialForm params={params} />
    </Suspense>
  );
}
