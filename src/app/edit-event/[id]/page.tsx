'use client';

import { useState, useEffect, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, OutreachAngle, EventIdea, OutreachAngleSelection } from '@/lib/supabase';
import { initializeFormFromEvent } from '@/lib/eventHelpers';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { Textarea } from '@/design-system/components/Textarea';
import { Toggle } from '@/design-system/components/Toggle';
import { TogglePill } from '@/design-system/components/TogglePill';
import { useToast } from '@/contexts/ToastContext';

interface EditEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

function EditEventForm({ params }: EditEventPageProps) {
  const router = useRouter();
  const { id: eventId } = use(params);
  const { toast } = useToast();
  const [outreachAngles, setOutreachAngles] = useState<OutreachAngle[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [event, setEvent] = useState<EventIdea | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get search params
  const searchParams = useSearchParams();
  const returnView = searchParams?.get('return') || 'annual';
  const defaultMonth = searchParams?.get('month');
  const defaultYear = searchParams?.get('year');
  const defaultQuarter = searchParams?.get('quarter');
  const fromDetail = searchParams?.get('fromDetail') === 'true';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_month: new Date().getMonth() + 1,
    start_year: new Date().getFullYear(),
    end_month: new Date().getMonth() + 1,
    end_year: new Date().getFullYear(),
    is_multi_month: false,
    selected_angles: {} as Record<string, boolean>,
    angle_notes: {} as Record<string, string>,
    created_by: 'clinic_admin',
    prep_months_needed: 0,
    prep_start_date: '',
    is_recurring: false,
  });

  const [prepType, setPrepType] = useState<'months' | 'date' | 'none'>('none');

  useEffect(() => {
    loadEventAndCategories();
  }, [eventId]);

  const loadEventAndCategories = async () => {
    try {
      setInitialLoading(true);

      // Load outreach angles
      const anglesPromise = supabase
        .from('outreach_angles')
        .select('*')
        .order('name');

      // Load event
      const eventPromise = supabase
        .from('events_ideas')
        .select('*')
        .eq('id', eventId)
        .single();

      const [anglesResponse, eventResponse] = await Promise.all([anglesPromise, eventPromise]);

      if (anglesResponse.error) {
        console.error('Error loading outreach angles:', anglesResponse.error);
      } else {
        setOutreachAngles(anglesResponse.data || []);
      }

      if (eventResponse.error) {
        console.error('Error loading event:', eventResponse.error);
        // Error state UI handles this
        handleCancel();
      } else {
        setEvent(eventResponse.data);

        // Initialize form from event
        const initializedForm = initializeFormFromEvent(eventResponse.data);
        if (initializedForm) {
          setFormData(initializedForm);
        }

        // Set prep type based on event data
        if (eventResponse.data.prep_start_date) {
          setPrepType('date');
        } else if (eventResponse.data.prep_months_needed && eventResponse.data.prep_months_needed > 0) {
          setPrepType('months');
        } else {
          setPrepType('none');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      // Error state UI handles this
      handleCancel();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedAngles = Object.entries(formData.selected_angles)
      .filter(([_, isSelected]) => isSelected)
      .map(([angle]) => angle);

    if (!formData.title.trim()) {
      toast.attention('Please fill in the event title');
      return;
    }

    if (selectedAngles.length === 0) {
      toast.attention('Please select at least one outreach angle');
      return;
    }

    setLoading(true);
    try {
      const outreach_angles: OutreachAngleSelection[] = selectedAngles.map((angle) => ({
        angle,
        notes: formData.angle_notes[angle] || '',
      }));

      let calculatedEndYear = formData.is_recurring ? formData.start_year : formData.end_year;

      if (formData.is_multi_month && formData.end_month < formData.start_month) {
        calculatedEndYear = formData.start_year + 1;
      }

      const eventData: Partial<EventIdea> = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        start_month: formData.start_month,
        start_year: formData.start_year,
        end_month: formData.is_multi_month ? formData.end_month : undefined,
        end_year: formData.is_multi_month ? calculatedEndYear : undefined,
        outreach_angles,
        is_recurring: formData.is_recurring,
        month: formData.start_month,
        year: formData.start_year,
        prep_months_needed: undefined,
        prep_start_date: undefined,
      };

      if (prepType === 'months' && formData.prep_months_needed > 0) {
        eventData.prep_months_needed = formData.prep_months_needed;
      } else if (prepType === 'date' && formData.prep_start_date) {
        eventData.prep_start_date = formData.prep_start_date;
      }

      const { error } = await supabase
        .from('events_ideas')
        .update(eventData)
        .eq('id', eventId);

      if (error) {
        console.error('Error updating event:', error);
        toast.alert('Failed to update event', { showSubtext: true, subtext: 'Please try again' });
        setLoading(false);
      } else {
        // Navigate with success message in URL params
        if (fromDetail) {
          // Go back to detail page with return params
          const params = new URLSearchParams({ return: returnView, success: 'event-saved' });
          if (defaultMonth) params.set('month', defaultMonth);
          if (defaultYear) params.set('year', defaultYear);
          if (defaultQuarter) params.set('quarter', defaultQuarter);
          router.push(`/event/${eventId}?${params.toString()}`);
        } else {
          // Go back to calendar view
          let targetUrl = '';
          if (returnView === 'timeline' && defaultMonth && defaultYear) {
            targetUrl = `/?view=timeline&month=${defaultMonth}&year=${defaultYear}&success=event-saved`;
          } else if (returnView === 'quarter') {
            targetUrl = `/quarter?success=event-saved`;
          } else if (returnView === 'month') {
            targetUrl = `/month?success=event-saved`;
          } else if (returnView === 'annual') {
            targetUrl = `/annual?success=event-saved`;
          } else {
            targetUrl = `/?view=${returnView}&success=event-saved`;
          }
          router.push(targetUrl);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.alert('Failed to update event', { showSubtext: true, subtext: 'Please try again' });
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('events_ideas')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event:', error);
        toast.alert('Failed to delete event', { showSubtext: true, subtext: 'Please try again' });
        setLoading(false);
      } else {
        // Navigate with success message in URL params
        let targetUrl = '';
        if (returnView === 'timeline' && defaultMonth && defaultYear) {
          targetUrl = `/?view=timeline&month=${defaultMonth}&year=${defaultYear}&success=event-deleted`;
        } else if (returnView === 'quarter') {
          targetUrl = `/quarter?success=event-deleted`;
        } else if (returnView === 'month') {
          targetUrl = `/month?success=event-deleted`;
        } else if (returnView === 'annual') {
          targetUrl = `/annual?success=event-deleted`;
        } else {
          targetUrl = `/?view=${returnView}&success=event-deleted`;
        }
        router.push(targetUrl);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.alert('Failed to delete event', { showSubtext: true, subtext: 'Please try again' });
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setHasUnsavedChanges(true);
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'start_month' ||
        name === 'start_year' ||
        name === 'end_month' ||
        name === 'end_year' ||
        name === 'prep_months_needed'
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleAngleToggle = (angle: string) => {
    setHasUnsavedChanges(true);
    setFormData((prev) => ({
      ...prev,
      selected_angles: {
        ...prev.selected_angles,
        [angle]: !prev.selected_angles[angle],
      },
    }));
  };

  const handleAngleNotesChange = (angle: string, notes: string) => {
    setHasUnsavedChanges(true);
    setFormData((prev) => ({
      ...prev,
      angle_notes: {
        ...prev.angle_notes,
        [angle]: notes,
      },
    }));
  };

  const handleMultiMonthToggle = () => {
    setHasUnsavedChanges(true);
    setFormData((prev) => ({
      ...prev,
      is_multi_month: !prev.is_multi_month,
      end_month: !prev.is_multi_month ? prev.start_month : prev.end_month,
      end_year: !prev.is_multi_month ? prev.start_year : prev.end_year,
    }));
  };

  const handleRecurringToggle = () => {
    setHasUnsavedChanges(true);
    setFormData((prev) => ({
      ...prev,
      is_recurring: !prev.is_recurring,
    }));
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('Discard changes? Your edits will be lost.')) {
        return;
      }
    }

    // Navigate based on where user came from
    if (fromDetail) {
      // Go back to detail page with return params
      const params = new URLSearchParams({ return: returnView });
      if (defaultMonth) params.set('month', defaultMonth);
      if (defaultYear) params.set('year', defaultYear);
      if (defaultQuarter) params.set('quarter', defaultQuarter);
      router.push(`/event/${eventId}?${params.toString()}`);
    } else {
      // Go back to calendar view
      if (returnView === 'timeline' && defaultMonth && defaultYear) {
        router.push(`/?view=timeline&month=${defaultMonth}&year=${defaultYear}`);
      } else if (returnView === 'quarter') {
        router.push(`/quarter`);
      } else if (returnView === 'month') {
        router.push(`/month`);
      } else if (returnView === 'annual') {
        router.push(`/annual`);
      } else {
        router.push(`/?view=${returnView}`);
      }
    }
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

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  if (initialLoading) {
    return <LoadingFallback />;
  }

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
          <div className="flex flex-col gap-6 w-full max-w-[600px] pb-32">
            {/* Page Title */}
            <div>
              <h1 className="text-[24px] leading-[32px] sm:text-[32px] sm:leading-[40px] font-semibold tracking-[-0.5px] text-fg-neutral-primary">
                Edit Event
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="bg-white rounded-2xl p-4 space-y-4">
                <Input
                  label="Event Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  type="filled"
                  required
                />
                <Textarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  type="filled"
                />
              </div>

              {/* Event Date Range Section */}
              <div className="space-y-2">
                <h2 className="text-base font-semibold leading-6 text-fg-neutral-primary">
                  Event Date Range
                </h2>
                <div className="bg-white rounded-2xl p-4 space-y-4">
                  {/* Multi-Month Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-fg-neutral-primary">
                      Multi-Month Event
                    </span>
                    <Toggle checked={formData.is_multi_month} onChange={handleMultiMonthToggle} />
                  </div>

                  {/* Recurring Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-fg-neutral-primary">
                      Annually Recurring Event
                    </span>
                    <Toggle checked={formData.is_recurring} onChange={handleRecurringToggle} />
                  </div>

                  {/* Start Date Row */}
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-body-sm-medium !text-[var(--color-fg-neutral-tertiary)] mb-1">
                        {formData.is_multi_month ? 'Start Month' : formData.is_recurring ? 'Month' : 'Start Date'}
                      </label>
                      <div className="relative">
                        <select
                          name="start_month"
                          value={formData.start_month}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 py-2.5 bg-[var(--color-bg-transparent-subtle)] hover:bg-[var(--color-bg-neutral-low)] rounded-lg text-body-sm-regular !text-[var(--color-fg-neutral-primary)] appearance-none pr-10 transition-all duration-200 border-0 outline-none focus:bg-[var(--color-bg-input-low)] focus:shadow-[0_0_0_2px_var(--color-bg-input-high)]"
                        >
                          {monthNames.map((month, index) => (
                            <option key={month} value={index + 1}>
                              {month}
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
                    {!formData.is_recurring && (
                      <div className="w-[120px]">
                        <div className="relative">
                          <select
                            name="start_year"
                            value={formData.start_year}
                            onChange={handleInputChange}
                            className="w-full h-10 px-3 py-2.5 bg-[var(--color-bg-transparent-subtle)] hover:bg-[var(--color-bg-neutral-low)] rounded-lg text-body-sm-regular !text-[var(--color-fg-neutral-primary)] appearance-none pr-10 transition-all duration-200 border-0 outline-none focus:bg-[var(--color-bg-input-low)] focus:shadow-[0_0_0_2px_var(--color-bg-input-high)]"
                          >
                            {years.map((year) => (
                              <option key={year} value={year}>
                                {year}
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
                    )}
                  </div>

                  {/* End Date Row - Only shown for multi-month events */}
                  {formData.is_multi_month && (
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-body-sm-medium !text-[var(--color-fg-neutral-tertiary)] mb-1">
                          End Month
                        </label>
                        <div className="relative">
                          <select
                            name="end_month"
                            value={formData.end_month}
                            onChange={handleInputChange}
                            className="w-full h-10 px-3 py-2.5 bg-[var(--color-bg-transparent-subtle)] hover:bg-[var(--color-bg-neutral-low)] rounded-lg text-body-sm-regular !text-[var(--color-fg-neutral-primary)] appearance-none pr-10 transition-all duration-200 border-0 outline-none focus:bg-[var(--color-bg-input-low)] focus:shadow-[0_0_0_2px_var(--color-bg-input-high)]"
                          >
                            {monthNames.map((month, index) => (
                              <option key={month} value={index + 1}>
                                {month}
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
                      {!formData.is_recurring && (
                        <div className="w-[120px]">
                          <div className="relative">
                            <select
                              name="end_year"
                              value={formData.end_year}
                              onChange={handleInputChange}
                              className="w-full h-10 px-3 py-2.5 bg-[var(--color-bg-transparent-subtle)] hover:bg-[var(--color-bg-neutral-low)] rounded-lg text-body-sm-regular !text-[var(--color-fg-neutral-primary)] appearance-none pr-10 transition-all duration-200 border-0 outline-none focus:bg-[var(--color-bg-input-low)] focus:shadow-[0_0_0_2px_var(--color-bg-input-high)]"
                            >
                              {years.map((year) => (
                                <option key={year} value={year}>
                                  {year}
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
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Outreach Perspectives Section */}
              <div className="space-y-2">
                <h2 className="text-base font-semibold leading-6 text-fg-neutral-primary">
                  Outreach Perspectives
                </h2>

                {outreachAngles.map((angle) => (
                  <div key={angle.id} className="bg-white rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-fg-neutral-primary">
                        {angle.name}
                      </span>
                      <Toggle
                        checked={formData.selected_angles[angle.name] || false}
                        onChange={() => handleAngleToggle(angle.name)}
                      />
                    </div>
                    {formData.selected_angles[angle.name] && (
                      <Textarea
                        label="Notes"
                        value={formData.angle_notes[angle.name] || ''}
                        onChange={(e) => handleAngleNotesChange(angle.name, e.target.value)}
                        type="filled"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Preparation Planning Section */}
              <div className="space-y-2">
                <h2 className="text-base font-semibold leading-6 text-fg-neutral-primary">
                  Preparation Planning
                </h2>
                <div className="bg-white rounded-2xl p-4 space-y-4">
                  {/* Prep Type Selection */}
                  <div className="flex gap-2 flex-wrap">
                    <TogglePill
                      label="None"
                      size="large"
                      selected={prepType === 'none'}
                      onChange={() => setPrepType('none')}
                    />
                    <TogglePill
                      label="On Specific Date"
                      size="large"
                      selected={prepType === 'date'}
                      onChange={() => setPrepType('date')}
                    />
                    <TogglePill
                      label="Months Before Event"
                      size="large"
                      selected={prepType === 'months'}
                      onChange={() => setPrepType('months')}
                    />
                  </div>

                  {/* Conditional Input Fields */}
                  {prepType === 'date' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-body-sm-medium !text-[var(--color-fg-neutral-tertiary)]">
                        Preparation Start Date
                      </label>
                      <input
                        type="date"
                        name="prep_start_date"
                        value={formData.prep_start_date}
                        onChange={handleInputChange}
                        className="h-10 px-3 py-2.5 bg-[var(--color-bg-neutral-subtle)] rounded-lg text-sm text-fg-neutral-primary focus:bg-[#c9e6f0] outline-none transition-colors"
                      />
                    </div>
                  )}
                  {prepType === 'months' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-body-sm-medium !text-[var(--color-fg-neutral-tertiary)]">
                        Months Before Event
                      </label>
                      <input
                        type="number"
                        name="prep_months_needed"
                        value={formData.prep_months_needed}
                        onChange={handleInputChange}
                        min="1"
                        max="12"
                        className="h-10 px-3 py-2.5 bg-[var(--color-bg-neutral-subtle)] rounded-lg text-sm text-fg-neutral-primary focus:bg-[#c9e6f0] outline-none transition-colors"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 items-center py-6">
                <Button
                  type="transparent"
                  size="large"
                  label="Cancel"
                  onClick={handleCancel}
                  className="flex-1"
                />
                <Button
                  type="primary"
                  size="large"
                  label="Save Changes"
                  className="flex-1"
                  disabled={loading}
                  onClick={handleSubmit}
                />
              </div>
            </form>
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
        <div className="text-body-lg-medium !text-[var(--color-fg-neutral-primary)]">Loading event...</div>
      </div>
    </div>
  );
}

export default function EditEventPage({ params }: EditEventPageProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EditEventForm params={params} />
    </Suspense>
  );
}
