'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Textarea } from '@/design-system/components/Textarea';
import { Button } from '@/design-system/components/Button';
import { supabase, MonthNote as MonthNoteType } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';

interface MonthNoteProps {
  month: number; // 1-12
  onSave?: (note: string | null) => void;
}

export function MonthNote({ month, onSave }: MonthNoteProps) {
  const [noteText, setNoteText] = useState<string>('');
  const [savedNoteText, setSavedNoteText] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const { toast } = useToast();

  // Load note from database on mount or when month changes
  useEffect(() => {
    const loadNote = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('month_notes')
          .select('*')
          .eq('month', month)
          .single();

        if (error) {
          // If no note exists yet, that's okay
          if (error.code === 'PGRST116') {
            setNoteText('');
            setSavedNoteText('');
          } else {
            console.error('Error loading month note:', error);
          }
        } else if (data) {
          const text = data.note_text || '';
          setNoteText(text);
          setSavedNoteText(text);
        }
      } catch (error) {
        console.error('Error loading month note:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNote();
  }, [month]);

  // Exit edit mode when navigating away
  useEffect(() => {
    if (isEditing) {
      setNoteText(savedNoteText);
      setIsEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Check if a note already exists for this month
      const { data: existingNote, error: fetchError } = await supabase
        .from('month_notes')
        .select('id')
        .eq('month', month)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingNote) {
        // Update existing note
        const { error } = await supabase
          .from('month_notes')
          .update({ note_text: noteText || null })
          .eq('month', month);

        if (error) throw error;
      } else {
        // Insert new note
        const { error } = await supabase
          .from('month_notes')
          .insert([{ month, note_text: noteText || null }]);

        if (error) throw error;
      }

      setSavedNoteText(noteText);
      setIsEditing(false);
      toast.positive('Note saved successfully');
      onSave?.(noteText || null);
    } catch (error) {
      console.error('Error saving month note:', error);
      toast.alert('Failed to save note', { showSubtext: true, subtext: 'Please try again' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNoteText(savedNoteText);
    setIsEditing(false);
  };

  const handleFocus = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  if (isLoading) {
    return null; // Or a loading skeleton if preferred
  }

  return (
    <div className="flex flex-col w-full" style={{ gap: 'var(--dimension-space-between-related-sm)' }}>
      {/* Textarea */}
      <div onClick={handleFocus} className="w-full">
        <Textarea
          type="filled"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onFocus={handleFocus}
          placeholder="Add a note for this month..."
          autoResize
          rows={3}
          disabled={isSaving}
          className="w-full"
        />
      </div>

      {/* Action Buttons - Only show when editing */}
      {isEditing && (
        <div className="flex w-full" style={{ gap: 'var(--dimension-space-between-repeating-md)' }}>
          <Button
            type="transparent"
            size="medium"
            label="Cancel"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1"
          />
          <Button
            type="primary"
            size="medium"
            label={isSaving ? "Saving..." : "Save"}
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          />
        </div>
      )}
    </div>
  );
}
