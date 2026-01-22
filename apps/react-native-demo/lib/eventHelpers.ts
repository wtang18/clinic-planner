/**
 * Event Helper Functions
 *
 * Shared logic for filtering and formatting events.
 * Matches web app implementation for consistency.
 */

import { EventIdea } from './supabase';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Get events for a specific month range
 * Handles recurring events and multi-month events
 */
export function getEventsForMonthRange(
  events: EventIdea[],
  startMonth: number,
  startYear: number,
  endMonth: number,
  endYear: number
): EventIdea[] {
  return events.filter(event => {
    const eventStartMonth = event.start_month || event.month;
    const eventStartYear = event.start_year || event.year;

    // Handle recurring events
    if (event.is_recurring) {
      // Only show recurring events in years >= their start year
      if (startYear < eventStartYear && endYear < eventStartYear) {
        return false;
      }

      // For recurring events, check if the event month falls within the range
      if (event.end_month && event.end_year) {
        // Multi-month recurring event - check if any month in range overlaps with event
        const rangeStart = new Date(startYear, startMonth - 1);
        const rangeEnd = new Date(endYear, endMonth - 1);

        let eventStart = eventStartMonth;
        let eventEnd = event.end_month;

        // Handle year wrapping for recurring events
        if (eventEnd < eventStart) {
          // Event wraps across year - check both parts
          for (let y = startYear; y <= endYear; y++) {
            const checkStart = new Date(y, eventStart - 1);
            const checkEnd1 = new Date(y, 11); // End of year
            const checkEnd2 = new Date(y + 1, eventEnd - 1); // Beginning of next year

            if ((checkStart >= rangeStart && checkStart <= rangeEnd) ||
                (checkEnd1 >= rangeStart && checkEnd1 <= rangeEnd) ||
                (checkEnd2 >= rangeStart && checkEnd2 <= rangeEnd)) {
              return true;
            }
          }
          return false;
        } else {
          // Event within same year - check if any occurrence overlaps with range
          for (let y = startYear; y <= endYear; y++) {
            if (y < eventStartYear) continue;

            const eventStartDate = new Date(y, eventStart - 1);
            const eventEndDate = new Date(y, eventEnd - 1);

            if ((eventStartDate >= rangeStart && eventStartDate <= rangeEnd) ||
                (eventEndDate >= rangeStart && eventEndDate <= rangeEnd) ||
                (eventStartDate <= rangeStart && eventEndDate >= rangeEnd)) {
              return true;
            }
          }
          return false;
        }
      } else {
        // Single month recurring event
        for (let y = startYear; y <= endYear; y++) {
          if (y < eventStartYear) continue;

          const eventDate = new Date(y, eventStartMonth - 1);
          const rangeStart = new Date(startYear, startMonth - 1);
          const rangeEnd = new Date(endYear, endMonth - 1);

          if (eventDate >= rangeStart && eventDate <= rangeEnd) {
            return true;
          }
        }
        return false;
      }
    }

    // Handle non-recurring events
    // Multi-month event spanning the range
    if (event.end_month && event.end_year) {
      const eventStartDate = new Date(eventStartYear, eventStartMonth - 1);
      const eventEndDate = new Date(event.end_year, event.end_month - 1);
      const rangeStart = new Date(startYear, startMonth - 1);
      const rangeEnd = new Date(endYear, endMonth - 1);

      // Check if event overlaps with the range
      return (eventStartDate >= rangeStart && eventStartDate <= rangeEnd) ||
             (eventEndDate >= rangeStart && eventEndDate <= rangeEnd) ||
             (eventStartDate <= rangeStart && eventEndDate >= rangeEnd);
    }

    // Single month event
    const eventDate = new Date(eventStartYear, eventStartMonth - 1);
    const rangeStart = new Date(startYear, startMonth - 1);
    const rangeEnd = new Date(endYear, endMonth - 1);

    return eventDate >= rangeStart && eventDate <= rangeEnd;
  });
}

/**
 * Get events whose preparation window falls in the selected month
 */
export function getPrepEventsForMonth(
  events: EventIdea[],
  selectedMonth: number,
  selectedYear: number
): EventIdea[] {
  return events.filter(event => {
    const eventStartMonth = event.start_month || event.month;
    const eventStartYear = event.start_year || event.year;
    const eventDate = new Date(eventStartYear, eventStartMonth - 1);
    const checkDate = new Date(selectedYear, selectedMonth - 1);

    // For multi-month events, check if this month is within the event span
    if (event.end_month && event.end_year) {
      const endDate = new Date(event.end_year, event.end_month - 1);
      if (checkDate >= eventDate && checkDate <= endDate) {
        return false; // Event is occurring, don't show in prep section
      }
    } else {
      // Single month event
      if (eventStartYear === selectedYear && eventStartMonth === selectedMonth) {
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
}

/**
 * Check if prep starts in the current selected month
 */
export function isPrepStartingThisMonth(event: EventIdea, selectedMonth: number, selectedYear: number): boolean {
  const eventStartMonth = event.start_month || event.month;
  const eventStartYear = event.start_year || event.year;
  const eventDate = new Date(eventStartYear, eventStartMonth - 1);

  if (event.prep_start_date) {
    const prepDate = new Date(event.prep_start_date);
    const prepStartMonth = prepDate.getMonth() + 1;
    const prepStartYear = prepDate.getFullYear();
    return prepStartMonth === selectedMonth && prepStartYear === selectedYear;
  }

  if (event.prep_months_needed > 0) {
    const prepStartDate = new Date(eventDate);
    prepStartDate.setMonth(prepStartDate.getMonth() - event.prep_months_needed);
    return prepStartDate.getMonth() + 1 === selectedMonth &&
           prepStartDate.getFullYear() === selectedYear;
  }

  return false;
}

/**
 * Format prep pill text
 */
export function formatPrepPill(event: EventIdea): string {
  if (event.prep_start_date) {
    const date = new Date(event.prep_start_date);
    return `${monthNamesShort[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  } else if (event.prep_months_needed > 0) {
    return `${event.prep_months_needed}mo`;
  }
  return '';
}

/**
 * Format event date range
 */
export function formatEventDate(event: EventIdea): string {
  const eventStartMonth = event.start_month || event.month;
  const eventStartYear = event.start_year || event.year;

  if (event.end_month && event.end_year) {
    const startMonthName = monthNames[eventStartMonth - 1];
    const endMonthName = monthNames[event.end_month - 1];

    if (eventStartYear === event.end_year) {
      return `${startMonthName} – ${endMonthName} ${eventStartYear}`;
    } else {
      return `${startMonthName} ${eventStartYear} – ${endMonthName} ${event.end_year}`;
    }
  } else {
    return `${monthNames[eventStartMonth - 1]} ${eventStartYear}`;
  }
}

/**
 * Format date for "This Month" events - hide single-month dates (implied from page header)
 */
export function formatThisMonthEventDate(event: EventIdea): string | null {
  const eventStartMonth = event.start_month || event.month;
  const eventStartYear = event.start_year || event.year;

  // Only show date for multi-month events
  if (event.end_month && event.end_year) {
    const startMonthName = monthNames[eventStartMonth - 1];
    const endMonthName = monthNames[event.end_month - 1];

    if (eventStartYear === event.end_year) {
      return `${startMonthName} – ${endMonthName} ${eventStartYear}`;
    } else {
      return `${startMonthName} ${eventStartYear} – ${endMonthName} ${event.end_year}`;
    }
  }

  // Return null for single-month events (date is implied from page header)
  return null;
}

/**
 * Get month name from number (1-12)
 */
export function getMonthName(month: number): string {
  return monthNames[month - 1] || '';
}
