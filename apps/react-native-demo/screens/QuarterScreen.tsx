/**
 * Quarter View Screen
 * Shows 3 month containers for the selected quarter
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
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
  dimensionSpaceBetweenRelatedSm,
  dimensionSpaceBetweenRelatedMd,
  dimensionSpaceBetweenSeparatedSm,
  textFontSizeDisplayLg,
  textLineHeightDisplayLg,
  textFontWeightDisplayBold,
  textLetterSpacingDisplay,
  textFontSizeHeadingMd,
  textLineHeightHeadingMd,
  textFontWeightHeadingBold,
  textFontSizeHeadingSm,
  textLineHeightHeadingSm,
  textFontWeightHeadingMedium,
  textFontSizeBodySm,
  textLineHeightBodySm,
  textFontWeightBodyMedium,
  textFontWeightBodyRegular,
  textFontSizeBodyXs,
  textLineHeightBodyXs,
  textFontSizeHeadingLg,
  textLineHeightHeadingLg,
} from '../../../src/design-system/tokens/build/react-native/tokens';

// Import design system components
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Container } from '../components/Container';
import { Pill } from '../components/Pill';

// Import contexts
import { useNavigationHandlers } from '../contexts/NavigationContext';

// Import responsive utilities
import { useAdaptiveLayout } from '../utils/responsive';

// Import Supabase
import { supabase, EventIdea, OutreachAngle } from '../lib/supabase';
import {
  getEventsForMonthRange,
  getPrepEventsForMonth,
  isPrepStartingThisMonth,
  formatPrepPill,
  formatThisMonthEventDate,
  getMonthName,
} from '../lib/eventHelpers';

const quarters = [
  { id: 1, name: 'Q1', months: [1, 2, 3], monthNames: ['January', 'February', 'March'] },
  { id: 2, name: 'Q2', months: [4, 5, 6], monthNames: ['April', 'May', 'June'] },
  { id: 3, name: 'Q3', months: [7, 8, 9], monthNames: ['July', 'August', 'September'] },
  { id: 4, name: 'Q4', months: [10, 11, 12], monthNames: ['October', 'November', 'December'] },
];

export default function QuarterScreen() {
  const layout = useAdaptiveLayout();
  const navigation = useNavigation();
  const { setHandlers } = useNavigationHandlers();

  const [view, setView] = useState('quarter');
  const [events, setEvents] = useState<EventIdea[]>([]);
  const [outreachAngles, setOutreachAngles] = useState<OutreachAngle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentQuarter = Math.ceil(currentMonth / 3);

  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Reset view state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setView('quarter');
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
            .or(`start_year.eq.${selectedYear},year.eq.${selectedYear},start_year.eq.${selectedYear + 1},year.eq.${selectedYear + 1},is_recurring.eq.true`)
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

  const handlePreviousQuarter = () => {
    setSelectedQuarter(prev => {
      if (prev === 1) {
        setSelectedYear(y => y - 1);
        return 4;
      }
      return prev - 1;
    });
  };

  const handleNextQuarter = () => {
    setSelectedQuarter(prev => {
      if (prev === 4) {
        setSelectedYear(y => y + 1);
        return 1;
      }
      return prev + 1;
    });
  };

  const handleToday = () => {
    setSelectedQuarter(currentQuarter);
    setSelectedYear(currentYear);
  };

  // Update navigation handlers in context when screen mounts or handlers change
  useEffect(() => {
    setHandlers({
      onPrevious: handlePreviousQuarter,
      onNext: handleNextQuarter,
      onToday: handleToday,
      previousLabel: 'Previous quarter',
      nextLabel: 'Next quarter',
      currentTitle: `Q${selectedQuarter} ${selectedYear}`,
    });
  }, [selectedQuarter, selectedYear, setHandlers]);

  const handleViewChange = (newView: string) => {
    setView(newView);
    if (newView === 'month') {
      navigation.navigate('Month' as never);
    } else if (newView === 'year') {
      navigation.navigate('Year' as never);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Re-trigger useEffect by changing a dependency
    setSelectedYear(prev => prev);
  };

  const quarter = quarters[selectedQuarter - 1];

  // Get events for a specific month
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

  // Get prep events for a specific month
  const getPrepEventsForMonthLocal = (month: number) => {
    return getPrepEventsForMonth(events, month, selectedYear);
  };

  // Check if a month is the current month
  const isCurrentMonth = (month: number) => {
    return month === currentMonth && selectedYear === currentYear;
  };

  // Format event date for month container (hide single-month dates)
  const formatMonthContainerEventDate = (event: EventIdea): string | null => {
    const eventStartMonth = event.start_month || event.month;
    const eventStartYear = event.start_year || event.year;

    // Only show date for multi-month events
    if (event.end_month && event.end_year) {
      const startMonthName = getMonthName(eventStartMonth);
      const endMonthName = getMonthName(event.end_month);

      if (eventStartYear === event.end_year) {
        return `${startMonthName} – ${endMonthName} ${eventStartYear}`;
      } else {
        return `${startMonthName} ${eventStartYear} – ${endMonthName} ${event.end_year}`;
      }
    }

    // Return null for single-month events (date is implied from container header)
    return null;
  };

  // Render event card
  const renderEventCard = (event: EventIdea, isPrepEvent: boolean = false, monthNumber: number) => {
    // Get outreach angle perspectives
    const perspectives: Array<{ angle: string; notes: string }> = [];

    if (event.outreach_angle_id_1) {
      const angle = outreachAngles.find(a => a.id === event.outreach_angle_id_1);
      if (angle && event.outreach_angle_notes_1) {
        perspectives.push({ angle: angle.angle, notes: event.outreach_angle_notes_1 });
      }
    }

    if (event.outreach_angle_id_2) {
      const angle = outreachAngles.find(a => a.id === event.outreach_angle_id_2);
      if (angle && event.outreach_angle_notes_2) {
        perspectives.push({ angle: angle.angle, notes: event.outreach_angle_notes_2 });
      }
    }

    if (event.outreach_angle_id_3) {
      const angle = outreachAngles.find(a => a.id === event.outreach_angle_id_3);
      if (angle && event.outreach_angle_notes_3) {
        perspectives.push({ angle: angle.angle, notes: event.outreach_angle_notes_3 });
      }
    }

    const prepLabel = formatPrepPill(event);
    const isPrepStart = isPrepStartingThisMonth(event, monthNumber, selectedYear);
    const dateStr = isPrepEvent ? formatThisMonthEventDate(event, selectedYear) : formatMonthContainerEventDate(event);

    return (
      <Card key={event.id} size="small" variant="non-interactive">
        {/* Header Block */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{event.title}</Text>
          {dateStr && (
            <Text style={styles.cardDate}>{dateStr}</Text>
          )}
        </View>

        {/* Description */}
        {event.description && (
          <Text style={styles.cardDescription}>{event.description}</Text>
        )}

        {/* Outreach Angle Perspectives */}
        {perspectives.map((perspective, idx) => (
          <View key={idx} style={styles.perspectiveBlock}>
            <Text style={styles.perspectiveLabel}>{perspective.angle} Perspective</Text>
            <Text style={styles.perspectiveNotes}>{perspective.notes}</Text>
          </View>
        ))}

        {/* Pills Row */}
        <View style={styles.pillsRow}>
          {prepLabel && (
            <Pill
              type={isPrepEvent && isPrepStart ? "info-emphasis" : "info"}
              size="small"
              label={isPrepEvent && isPrepStart ? "Start Prep" : "Prep"}
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
    const prepEvents = getPrepEventsForMonthLocal(monthNumber);

    return (
      <Container
        key={monthNumber}
        variant="non-interactive"
        style={[
          styles.monthContainer,
          layout.columns === 1 && styles.monthContainerSingle,
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

        {/* Events Occurring This Month */}
        <View style={styles.eventsSection}>
          {monthEvents.length === 0 ? (
            <Text style={styles.emptyText}>No Events Planned</Text>
          ) : (
            monthEvents.map((event) => renderEventCard(event, false, monthNumber))
          )}
        </View>

        {/* Preparation Needed Section */}
        {prepEvents.length > 0 && (
          <View style={styles.prepSection}>
            <Text style={styles.prepSectionTitle}>Preparation Needed</Text>
            <View style={styles.eventsSection}>
              {prepEvents.map((event) => renderEventCard(event, true, monthNumber))}
            </View>
          </View>
        )}
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
            {quarter.name} {selectedYear}
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
            /* Quarter Grid - 3 columns for the 3 months in this quarter */
            <View style={[
              styles.monthsContainer,
              layout.columns === 1 && styles.monthsContainerSingle,
            ]}>
              {quarter.months.map((monthNumber, index) =>
                renderMonthContainer(monthNumber, quarter.monthNames[index])
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
    fontSize: textFontSizeHeadingLg.number,
    lineHeight: textLineHeightHeadingLg.number,
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

  // Months grid
  monthsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: dimensionSpaceBetweenRelatedMd.number,
  },
  monthsContainerSingle: {
    flexDirection: 'column',
  },
  monthContainer: {
    flex: 1,
    minWidth: 280,
    gap: dimensionSpaceBetweenRelatedSm.number,
  },
  monthContainerSingle: {
    flex: 0, // Disable flex grow/shrink on mobile
    width: '100%', // Force full width on mobile single-column layout
    minWidth: 0, // Override minWidth to prevent constraint conflicts
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

  // Events sections
  eventsSection: {
    gap: dimensionSpaceBetweenRepeatingMd.number,
  },
  emptyText: {
    fontSize: textFontSizeBodySm.number,
    lineHeight: textLineHeightBodySm.number,
    fontWeight: textFontWeightBodyRegular,
    color: colorFgNeutralSecondary,
  },

  // Prep section
  prepSection: {
    marginTop: dimensionSpaceBetweenSeparatedSm.number,
    gap: dimensionSpaceBetweenRepeatingMd.number,
  },
  prepSectionTitle: {
    fontSize: textFontSizeBodySm.number,
    lineHeight: textLineHeightBodySm.number,
    fontWeight: textFontWeightBodyMedium,
    color: colorFgNeutralPrimary,
  },

  // Event cards
  cardHeader: {
    gap: dimensionSpaceBetweenRepeatingSm.number,
  },
  cardTitle: {
    fontSize: textFontSizeBodySm.number,
    lineHeight: textLineHeightBodySm.number,
    fontWeight: textFontWeightBodyMedium,
    color: colorFgNeutralPrimary,
  },
  cardDate: {
    fontSize: textFontSizeBodyXs.number,
    lineHeight: textLineHeightBodyXs.number,
    fontWeight: textFontWeightBodyRegular,
    color: colorFgNeutralSecondary,
  },
  cardDescription: {
    fontSize: textFontSizeBodySm.number,
    lineHeight: textLineHeightBodySm.number,
    fontWeight: textFontWeightBodyRegular,
    color: colorFgNeutralPrimary,
  },
  perspectiveBlock: {
    gap: dimensionSpaceBetweenRepeatingSm.number,
  },
  perspectiveLabel: {
    fontSize: textFontSizeBodyXs.number,
    lineHeight: textLineHeightBodyXs.number,
    fontWeight: textFontWeightBodyMedium,
    color: colorFgNeutralSecondary,
  },
  perspectiveNotes: {
    fontSize: textFontSizeBodySm.number,
    lineHeight: textLineHeightBodySm.number,
    fontWeight: textFontWeightBodyRegular,
    color: colorFgNeutralPrimary,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: dimensionSpaceBetweenRepeatingSm.number,
  },
});
