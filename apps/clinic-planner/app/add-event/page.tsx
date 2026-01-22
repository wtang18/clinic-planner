'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, OutreachAngle, NewEventIdea, OutreachAngleSelection } from '@/lib/supabase';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';
import { Textarea } from '@/design-system/components/Textarea';
import { Select } from '@/design-system/components/Select';
import { DateInput } from '@/design-system/components/DateInput';
import { Toggle } from '@/design-system/components/Toggle';
import { TogglePill } from '@/design-system/components/TogglePill';
import { useToast } from '@/contexts/ToastContext';

function AddEventForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [outreachAngles, setOutreachAngles] = useState<OutreachAngle[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get search params
  const searchParams = useSearchParams();
  const returnView = searchParams?.get('return') || 'annual';
  const defaultMonth = searchParams?.get('month');
  const defaultYear = searchParams?.get('year');
  const defaultQuarter = searchParams?.get('quarter');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_month: defaultMonth ? parseInt(defaultMonth) : new Date().getMonth() + 1,
    start_year: defaultYear ? parseInt(defaultYear) : new Date().getFullYear(),
    end_month: defaultMonth ? parseInt(defaultMonth) : new Date().getMonth() + 1,
    end_year: defaultYear ? parseInt(defaultYear) : new Date().getFullYear(),
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
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('outreach_angles')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading outreach angles:', error);
      } else {
        setOutreachAngles(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
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

      const eventData: NewEventIdea = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        start_month: formData.start_month,
        start_year: formData.start_year,
        end_month: formData.is_multi_month ? formData.end_month : undefined,
        end_year: formData.is_multi_month ? calculatedEndYear : undefined,
        outreach_angles,
        is_recurring: formData.is_recurring,
        created_by: formData.created_by,
        month: formData.start_month,
        year: formData.start_year,
      };

      if (prepType === 'months' && formData.prep_months_needed > 0) {
        eventData.prep_months_needed = formData.prep_months_needed;
      } else if (prepType === 'date' && formData.prep_start_date) {
        eventData.prep_start_date = formData.prep_start_date;
      }

      const { error } = await supabase.from('events_ideas').insert([eventData]).select().single();

      if (error) {
        console.error('Error adding event - FULL:', error);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        toast.alert('Failed to create event', { showSubtext: true, subtext: 'Please try again' });
        setLoading(false);
      } else {
        // Navigate with success message in URL params
        let targetUrl = '';
        if (returnView === 'timeline' && defaultMonth && defaultYear) {
          targetUrl = `/?view=timeline&month=${defaultMonth}&year=${defaultYear}&success=event-created`;
        } else if (returnView === 'quarter') {
          targetUrl = `/quarter?success=event-created`;
        } else if (returnView === 'month') {
          targetUrl = `/month?success=event-created`;
        } else if (returnView === 'annual') {
          targetUrl = `/annual?success=event-created`;
        } else {
          targetUrl = `/?view=${returnView}&success=event-created`;
        }
        router.push(targetUrl);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.alert('Failed to create event', { showSubtext: true, subtext: 'Please try again' });
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

          {/* Right - Empty */}
          <div className="flex-1 flex gap-2 items-center justify-end" />
        </div>

        {/* Form Content - Centered */}
        <div className="flex justify-center w-full">
          <div className="flex flex-col gap-6 w-full max-w-[600px] pb-32">
            {/* Page Title */}
            <div>
              <h1 className="text-[24px] leading-[32px] sm:text-[32px] sm:leading-[40px] font-semibold tracking-[-0.5px] text-fg-neutral-primary">
                Add New Event
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
                  autoResize
                  rows={3}
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
                      <Select
                        type="filled"
                        label={formData.is_multi_month ? 'Start Month' : formData.is_recurring ? 'Month' : 'Start Date'}
                        name="start_month"
                        value={formData.start_month.toString()}
                        onChange={handleInputChange}
                      >
                        {monthNames.map((month, index) => (
                          <option key={month} value={index + 1}>
                            {month}
                          </option>
                        ))}
                      </Select>
                    </div>
                    {!formData.is_recurring && (
                      <div className="w-[120px]">
                        <Select
                          type="filled"
                          name="start_year"
                          value={formData.start_year.toString()}
                          onChange={handleInputChange}
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* End Date Row - Only shown for multi-month events */}
                  {formData.is_multi_month && (
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Select
                          type="filled"
                          label="End Month"
                          name="end_month"
                          value={formData.end_month.toString()}
                          onChange={handleInputChange}
                        >
                          {monthNames.map((month, index) => (
                            <option key={month} value={index + 1}>
                              {month}
                            </option>
                          ))}
                        </Select>
                      </div>
                      {!formData.is_recurring && (
                        <div className="w-[120px]">
                          <Select
                            type="filled"
                            name="end_year"
                            value={formData.end_year.toString()}
                            onChange={handleInputChange}
                          >
                            {years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </Select>
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
                        autoResize
                        rows={3}
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
                    <DateInput
                      type="filled"
                      label="Preparation Start Date"
                      name="prep_start_date"
                      value={formData.prep_start_date}
                      onChange={handleInputChange}
                    />
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
                  label="Create Event"
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
        <div className="text-body-lg-medium !text-[var(--color-fg-neutral-primary)]">Loading...</div>
      </div>
    </div>
  );
}

export default function AddEventPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AddEventForm />
    </Suspense>
  );
}
