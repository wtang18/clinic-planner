/**
 * Year View Screen
 * Shows 12 month grid for the entire year with real Supabase data
 *
 * LAYOUT:
 * - Responsive grid:
 *   - Small mobile: 1 column
 *   - Large mobile: 2 columns
 *   - Tablet portrait: 2 columns
 *   - Tablet landscape: 4 columns
 * - Each month shows events as cards with pills
 * - Floating header with view switcher and year navigation
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Import design system tokens
import {
  colorBgNeutralBase,
  colorBgAccentHigh,
  colorFgNeutralPrimary,
  colorFgNeutralSecondary,
  colorFgAccentPrimary,
  dimensionSpaceAroundMd,
  dimensionSpaceAroundLg,
  dimensionSpaceBetweenRepeatingSm,
  dimensionSpaceBetweenRepeatingMd,
  dimensionSpaceBetweenRelatedMd,
  textFontSizeDisplayLg,
  textLineHeightDisplayLg,
  textFontWeightDisplayBold,
  textLetterSpacingDisplay,
  textFontSizeHeadingMd,
  textLineHeightHeadingMd,
  textFontWeightHeadingBold,
  textFontSizeBodySm,
  textLineHeightBodySm,
  textFontWeightBodyMedium,
  textFontWeightBodyRegular,
  textFontSizeBodyXs,
  textLineHeightBodyXs,
} from '../../../src/design-system/tokens/build/react-native/tokens';

// Import design system components
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Container } from '../components/Container';
import { Pill } from '../components/Pill';

// Import context
import { useNavigationHandlers } from '../contexts/NavigationContext';

// Import responsive utilities
import { useAdaptiveLayout } from '../utils/responsive';

// Import Supabase
import { supabase, EventIdea, OutreachAngle } from '../lib/supabase';
import {
  formatPrepPill,
  getMonthName,
} from '../lib/eventHelpers';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function YearScreen() {
  const layout = useAdaptiveLayout();
  const navigation = useNavigation();
  const { width: windowWidth } = useWindowDimensions();
  const { setHandlers } = useNavigationHandlers();

  const [view, setView] = useState('year');
  const [events, setEvents] = useState<EventIdea[]>([]);
  const [outreachAngles, setOutreachAngles] = useState<OutreachAngle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Reset view state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setView('year');
    }, [])
  );

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const [eventsResponse, anglesResponse] = await Promise.all([
          supabase
            .from('events_ideas')
            .select('*')
            .or(`start_year.eq.${selectedYear},year.eq.${selectedYear},is_recurring.eq.true`)
            .order('start_year', { ascending: true })
            .order('start_month', { ascending: true }),
          supabase.from('outreach_angles').select('*')
        ]);

        if (eventsResponse.error) throw eventsResponse.error;
        if (anglesResponse.error) throw anglesResponse.error;

        setEvents(eventsResponse.data || []);
        setOutreachAngles(anglesResponse.data || []);
      } catch (error) {
        console.error('Error loading events:', error);
        setError('Unable to load events. Please check your connection and try again.');
        setEvents([]);
        setOutreachAngles([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [selectedYear]);

  const handlePreviousYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(prev => prev + 1);
  };

  const handleToday = () => {
    setSelectedYear(currentYear);
  };

  useEffect(() => {
    setHandlers({
      onPrevious: handlePreviousYear,
      onNext: handleNextYear,
      onToday: handleToday,
      previousLabel: 'Previous year',
      nextLabel: 'Next year',
      currentTitle: `${selectedYear}`,
    });
  }, [selectedYear, setHandlers]);

  const handleViewChange = (newView: string) => {
    setView(newView);
    if (newView === 'month') {
      navigation.navigate('Month' as never);
    } else if (newView === 'quarter') {
      navigation.navigate('Quarter' as never);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setSelectedYear(prev => prev);
  };

  // Get events for a specific month - same logic as web implementation
  const getEventsForMonth = (month: number) => {
    return events.filter(event => {
      const eventStartMonth = event.start_month || event.month;
      const eventStartYear = event.start_year || event.year;

      // Handle recurring events
      if (event.is_recurring) {
        // Only show recurring events in years >= their start year
        if (selectedYear < eventStartYear) {
          return false;
        }

        // For recurring events, check if this month falls within the event span
        if (event.end_month && event.end_year) {
          // Multi-month recurring event
          const startMonth = eventStartMonth;
          const endMonth = event.end_month;

          // Handle year wrapping (e.g. Nov-Feb)
          if (endMonth < startMonth) {
            // Event wraps across year boundary
            return month >= startMonth || month <= endMonth;
          } else {
            // Event within same year
            return month >= startMonth && month <= endMonth;
          }
        } else {
          // Single month recurring event
          return eventStartMonth === month;
        }
      }

      // Handle non-recurring events
      // Multi-month event spanning this month
      if (event.end_month && event.end_year) {
        const startDate = new Date(eventStartYear, eventStartMonth - 1);
        const endDate = new Date(event.end_year, event.end_month - 1);
        const checkDate = new Date(selectedYear, month - 1);
        return checkDate >= startDate && checkDate <= endDate;
      }

      // Direct match for single month events
      if (eventStartYear === selectedYear && eventStartMonth === month) {
        return true;
      }

      return false;
    });
  };

  // Check if a month is the current month
  const isCurrentMonth = (month: number) => {
    return month === currentMonth && selectedYear === currentYear;
  };

  // Format event date for display (only show for multi-month events)
  const formatEventDate = (event: EventIdea): string | null => {
    const eventStartMonth = event.start_month || event.month;
    const eventStartYear = event.start_year || event.year;

    // Only show date for multi-month events
    if (event.end_month && event.end_year) {
      const startMonthName = getMonthName(eventStartMonth);
      const endMonthName = getMonthName(event.end_month);

      // For recurring events, adjust to viewing year
      if (event.is_recurring) {
        const endMonth = event.end_month;
        const startMonth = eventStartMonth;

        // Handle year wrapping
        if (endMonth < startMonth) {
          return `${startMonthName} ${selectedYear} – ${endMonthName} ${selectedYear + 1}`;
        } else {
          return `${startMonthName} – ${endMonthName} ${selectedYear}`;
        }
      }

      // Non-recurring multi-month events
      if (eventStartYear === event.end_year) {
        return `${startMonthName} – ${endMonthName} ${eventStartYear}`;
      } else {
        return `${startMonthName} ${eventStartYear} – ${endMonthName} ${event.end_year}`;
      }
    }

    // Return null for single-month events (month is implied from container)
    return null;
  };

  // Render event card - minimal version for year view
  const renderEventCard = (event: EventIdea) => {
    const prepLabel = formatPrepPill(event);
    const dateStr = formatEventDate(event);

    return (
      <Card key={event.id} size="small" variant="non-interactive" style={styles.eventCard}>
        {/* Title */}
        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>

        {/* Multi-month date if applicable */}
        {dateStr && (
          <Text style={styles.eventDate}>{dateStr}</Text>
        )}

        {/* Pills Row - minimal: just prep and yearly */}
        <View style={styles.pillsRow}>
          {prepLabel && (
            <Pill
              type="info"
              size="small"
              label="Prep"
              subtextR={prepLabel}
            />
          )}
          {event.is_recurring && (
            <Pill
              type="accent"
              size="small"
              label="Yearly"
            />
          )}
        </View>
      </Card>
    );
  };

  // Render month container
  const renderMonthContainer = (monthNumber: number, monthName: string) => {
    const isCurrent = isCurrentMonth(monthNumber);
    const monthEvents = getEventsForMonth(monthNumber);

    // Calculate width using actual pixel values for precise layout
    // Account for container padding and gaps between items
    const gap = dimensionSpaceBetweenRelatedMd.number; // 16px
    const containerPadding = dimensionSpaceAroundMd.number; // padding on both sides
    const availableWidth = windowWidth - (containerPadding * 2);

    let containerWidth: number;

    if (layout.columns === 4) {
      // 4 columns with 3 gaps: (availableWidth - 3*gap) / 4
      containerWidth = (availableWidth - (3 * gap)) / 4;
    } else if (layout.columns === 2) {
      // 2 columns with 1 gap: (availableWidth - 1*gap) / 2
      containerWidth = (availableWidth - gap) / 2;
    } else {
      // 1 column: full available width
      containerWidth = availableWidth;
    }

    return (
      <Container
        key={monthNumber}
        variant="non-interactive"
        style={[
          styles.monthContainer,
          { width: containerWidth },
          isCurrent && styles.currentMonthContainer,
        ]}
      >
        {/* Month Header */}
        <Text style={[
          styles.monthTitle,
          isCurrent && styles.currentMonthTitle,
        ]}>
          {monthName}
        </Text>

        {/* Events List */}
        <View style={styles.eventsSection}>
          {monthEvents.length === 0 ? (
            <Text style={styles.emptyText}>No Events Planned</Text>
          ) : (
            monthEvents.map((event) => renderEventCard(event))
          )}
        </View>
      </Container>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colorFgNeutralPrimary} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Background and FloatingBottomNav now rendered at navigator level
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Page Title - outside floating header */}
          <Text style={styles.pageTitle}>
            {selectedYear}
          </Text>

          {/* Error State */}
          {error ? (
            <Container style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <Button
                type="primary"
                size="medium"
                label="Try Again"
                onPress={handleRetry}
              />
            </Container>
          ) : (
            /* Year Grid - 12 months in responsive grid */
            <View style={styles.monthsGrid}>
              {MONTHS.map((monthName, index) =>
                renderMonthContainer(index + 1, monthName)
              )}
            </View>
          )}
        </ScrollView>

        {/* FloatingHeader now rendered at navigator level (persistent) */}

      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: dimensionSpaceAroundMd.number,
    paddingTop: 64, // Space for floating header
    paddingBottom: 120, // Floating bottom nav height on mobile
  },
  pageTitle: {
    fontSize: textFontSizeDisplayLg.number,
    lineHeight: textLineHeightDisplayLg.number,
    fontWeight: textFontWeightDisplayBold,
    letterSpacing: textLetterSpacingDisplay.number,
    color: colorFgNeutralPrimary,
    marginBottom: dimensionSpaceAroundLg.number,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: textFontSizeHeadingMd.number,
    lineHeight: textLineHeightHeadingMd.number,
    fontWeight: textFontWeightBodyMedium,
    color: colorFgNeutralPrimary,
  },

  // Error state
  errorContainer: {
    padding: 48,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: textFontSizeHeadingMd.number,
    lineHeight: textLineHeightHeadingMd.number,
    fontWeight: textFontWeightHeadingBold,
    color: colorFgNeutralPrimary,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: textFontSizeBodySm.number,
    lineHeight: textLineHeightBodySm.number,
    fontWeight: textFontWeightBodyRegular,
    color: colorFgNeutralSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },

  // Months grid - responsive layout
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: dimensionSpaceBetweenRelatedMd.number,
  },
  monthContainer: {
    // Width is set dynamically in renderMonthContainer based on layout.columns
    // 1 column: 100%, 2 columns: ~48%, 4 columns: ~23%
    gap: dimensionSpaceBetweenRepeatingMd.number,
  },
  currentMonthContainer: {
    borderWidth: 2,
    borderColor: colorBgAccentHigh,
    borderStyle: 'solid',
  },

  // Month header
  monthTitle: {
    fontSize: textFontSizeHeadingMd.number,
    lineHeight: textLineHeightHeadingMd.number,
    fontWeight: textFontWeightHeadingBold,
    color: colorFgNeutralPrimary,
  },
  currentMonthTitle: {
    color: colorFgAccentPrimary,
  },

  // Events section
  eventsSection: {
    gap: dimensionSpaceBetweenRepeatingMd.number,
  },
  emptyText: {
    fontSize: textFontSizeBodySm.number,
    lineHeight: textLineHeightBodySm.number,
    fontWeight: textFontWeightBodyRegular,
    color: colorFgNeutralSecondary,
  },

  // Event cards - minimal for year view
  eventCard: {
    gap: dimensionSpaceBetweenRepeatingSm.number,
  },
  eventTitle: {
    fontSize: textFontSizeBodySm.number,
    lineHeight: textLineHeightBodySm.number,
    fontWeight: textFontWeightBodyMedium,
    color: colorFgNeutralPrimary,
  },
  eventDate: {
    fontSize: textFontSizeBodyXs.number,
    lineHeight: textLineHeightBodyXs.number,
    fontWeight: textFontWeightBodyRegular,
    color: colorFgNeutralSecondary,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: dimensionSpaceBetweenRepeatingSm.number,
  },
});
