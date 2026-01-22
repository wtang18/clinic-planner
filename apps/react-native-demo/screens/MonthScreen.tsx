/**
 * Month View Screen
 * 3-column adaptive layout: "This Month", "Preparation Needed", "Next 3 Months"
 *
 * PLATFORM DIFFERENCES FROM WEB:
 * - No Sidebar component (using Tab/Drawer navigation from RootNavigator)
 * - No SegmentedControl for view switching (handled by navigation)
 * - ScrollView instead of CSS grid
 * - TouchableOpacity for card interactions (no hover)
 * - Platform-specific styling (no Tailwind CSS)
 * - AsyncStorage for Supabase auth instead of browser localStorage
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Supabase client and types
import { supabase, EventIdea, OutreachAngle } from '../lib/supabase';

// Event helper functions
import {
  getEventsForMonthRange,
  getPrepEventsForMonth,
  isPrepStartingThisMonth,
  formatPrepPill,
  formatEventDate,
  formatThisMonthEventDate,
  getMonthName,
} from '../lib/eventHelpers';

// Design system tokens
import {
  colorBgNeutralSubtle,
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
  textFontSizeHeading2xl,
  textLineHeightHeading2xl,
} from '../../../src/design-system/tokens/build/react-native/tokens';

// Components
import { Card } from '../components/Card';
import { Container } from '../components/Container';
import { Pill } from '../components/Pill';

// Context
import { useNavigationHandlers } from '../contexts/NavigationContext';

// Responsive utilities
import { useAdaptiveLayout } from '../utils/responsive';

export default function MonthScreen() {
  const layout = useAdaptiveLayout();
  const navigation = useNavigation();
  const { setHandlers } = useNavigationHandlers();

  // State
  const [view, setView] = useState('month');
  const [events, setEvents] = useState<EventIdea[]>([]);
  const [outreachAngles, setOutreachAngles] = useState<OutreachAngle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Current date
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  // Selected month/year (for future: could be controlled by navigation params)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Reset view state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setView('month');
    }, [])
  );

  // Load events from Supabase
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch events and outreach angles in parallel
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

  // Navigate months
  const handlePreviousMonth = () => {
    setSelectedMonth(prev => {
      const newMonth = prev === 1 ? 12 : prev - 1;
      if (newMonth === 12) {
        // Wrapped to December, decrease year
        setSelectedYear(y => y - 1);
      }
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => {
      const newMonth = prev === 12 ? 1 : prev + 1;
      if (newMonth === 1) {
        // Wrapped to January, increase year
        setSelectedYear(y => y + 1);
      }
      return newMonth;
    });
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth() + 1);
    setSelectedYear(today.getFullYear());
  };

  const handleViewChange = (newView: string) => {
    setView(newView);
    if (newView === 'quarter') {
      navigation.navigate('Quarter' as never);
    } else if (newView === 'year') {
      navigation.navigate('Year' as never);
    }
  };

  // Update navigation handlers in context when screen mounts or handlers change
  useEffect(() => {
    setHandlers({
      onPrevious: handlePreviousMonth,
      onNext: handleNextMonth,
      onToday: handleToday,
      previousLabel: 'Previous month',
      nextLabel: 'Next month',
      currentTitle: `${getMonthName(selectedMonth)} ${selectedYear}`,
    });
  }, [selectedMonth, selectedYear, setHandlers]);

  // Calculate events for each column
  const thisMonthEvents = getEventsForMonthRange(events, selectedMonth, selectedYear, selectedMonth, selectedYear);
  const prepEvents = getPrepEventsForMonth(events, selectedMonth, selectedYear);

  // Calculate upcoming events (next 3 months)
  const upcomingStart = { month: selectedMonth + 1, year: selectedYear };
  const upcomingEnd = { month: selectedMonth + 3, year: selectedYear };

  // Adjust for year wrapping
  if (upcomingStart.month > 12) {
    upcomingStart.month -= 12;
    upcomingStart.year += 1;
  }
  while (upcomingEnd.month > 12) {
    upcomingEnd.month -= 12;
    upcomingEnd.year += 1;
  }

  const upcomingEvents = getEventsForMonthRange(events, upcomingStart.month, upcomingStart.year, upcomingEnd.month, upcomingEnd.year);

  // Render loading state
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

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Container style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Button
              type="primary"
              size="medium"
              label="Try Again"
              onPress={() => {
                setLoading(true);
                setError(null);
                // Trigger reload by updating state
                setSelectedYear(selectedYear);
              }}
            />
          </Container>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render main content
  // Background and FloatingBottomNav now rendered at navigator level
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
        {/* Page Title - outside floating header */}
        <Text style={styles.pageTitle}>
          {getMonthName(selectedMonth)} {selectedYear}
        </Text>

        {/* 3-Column Layout - Adapts based on device width */}
        {/* PLATFORM DIFFERENCE: Using flex layout instead of CSS grid */}
        <View style={[
          styles.columnsContainer,
          layout.columns === 1 && styles.columnsContainerSingle,
        ]}>
          {/* Column 1: This Month */}
          <Container
            style={[
              styles.column,
              layout.columns === 1 && styles.columnFull,
              selectedMonth === currentMonth && selectedYear === currentYear && styles.columnHighlighted,
            ]}
          >
            <View style={styles.columnHeader}>
              <Text style={[
                styles.columnTitle,
                selectedMonth === currentMonth && selectedYear === currentYear && styles.columnTitleHighlighted,
              ]}>
                This Month
              </Text>
            </View>

            <View style={styles.eventsContainer}>
              {thisMonthEvents.length === 0 ? (
                <Text style={styles.emptyText}>No Events Planned</Text>
              ) : (
                thisMonthEvents.map((event) => {
                  const prepLabel = formatPrepPill(event);
                  const eventDateStr = formatThisMonthEventDate(event);

                  return (
                    <Card
                      key={event.id}
                      size="small"
                      variant="non-interactive"
                      style={styles.eventCard}
                    >
                      {/* Header */}
                      <View style={styles.eventHeader}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        {eventDateStr && (
                          <Text style={styles.eventDate}>{eventDateStr}</Text>
                        )}
                      </View>

                      {/* Description */}
                      {event.description && (
                        <Text style={styles.eventDescription}>{event.description}</Text>
                      )}

                      {/* Outreach Angle Perspectives */}
                      {event.outreach_angles && event.outreach_angles.map((angleSelection, idx) => {
                        if (!angleSelection.notes) return null;

                        return (
                          <View key={idx} style={styles.perspectiveContainer}>
                            <Text style={styles.perspectiveLabel}>
                              {angleSelection.angle} Perspective
                            </Text>
                            <Text style={styles.perspectiveNotes}>
                              {angleSelection.notes}
                            </Text>
                          </View>
                        );
                      })}

                      {/* Pills */}
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
                })
              )}
            </View>
          </Container>

          {/* Column 2: Preparation Needed */}
          <Container
            style={[
              styles.column,
              layout.columns === 1 && styles.columnFull,
            ]}
          >
            <View style={styles.columnHeader}>
              <Text style={styles.columnTitle}>Preparation Needed</Text>
            </View>

            <View style={styles.eventsContainer}>
              {prepEvents.length === 0 ? (
                <Text style={styles.emptyText}>No Preparation Needed</Text>
              ) : (
                prepEvents.map((event) => {
                  const prepLabel = formatPrepPill(event);
                  const isPrepStarting = isPrepStartingThisMonth(event, selectedMonth, selectedYear);
                  const eventDateStr = formatEventDate(event);

                  return (
                    <Card
                      key={event.id}
                      size="small"
                      variant="non-interactive"
                      style={styles.eventCard}
                    >
                      {/* Header */}
                      <View style={styles.eventHeader}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        {eventDateStr && (
                          <Text style={styles.eventDate}>{eventDateStr}</Text>
                        )}
                      </View>

                      {/* Description */}
                      {event.description && (
                        <Text style={styles.eventDescription}>{event.description}</Text>
                      )}

                      {/* Outreach Angle Perspectives */}
                      {event.outreach_angles && event.outreach_angles.map((angleSelection, idx) => {
                        if (!angleSelection.notes) return null;

                        return (
                          <View key={idx} style={styles.perspectiveContainer}>
                            <Text style={styles.perspectiveLabel}>
                              {angleSelection.angle} Perspective
                            </Text>
                            <Text style={styles.perspectiveNotes}>
                              {angleSelection.notes}
                            </Text>
                          </View>
                        );
                      })}

                      {/* Pills */}
                      <View style={styles.pillsRow}>
                        {prepLabel && (
                          <Pill
                            type={isPrepStarting ? "info-emphasis" : "info"}
                            size="small"
                            label={isPrepStarting ? "Start Prep" : "Prep"}
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
                })
              )}
            </View>
          </Container>

          {/* Column 3: Next 3 Months */}
          <Container
            style={[
              styles.column,
              layout.columns === 1 && styles.columnFull,
            ]}
          >
            <View style={styles.columnHeader}>
              <Text style={styles.columnTitle}>Next 3 Months</Text>
            </View>

            <View style={styles.eventsContainer}>
              {upcomingEvents.length === 0 ? (
                <Text style={styles.emptyText}>No Upcoming Events</Text>
              ) : (
                upcomingEvents.map((event) => {
                  const prepLabel = formatPrepPill(event);
                  const eventDateStr = formatEventDate(event);

                  return (
                    <Card
                      key={event.id}
                      size="small"
                      variant="non-interactive"
                      style={styles.eventCard}
                    >
                      {/* Header */}
                      <View style={styles.eventHeader}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        {eventDateStr && (
                          <Text style={styles.eventDate}>{eventDateStr}</Text>
                        )}
                      </View>

                      {/* Description */}
                      {event.description && (
                        <Text style={styles.eventDescription}>{event.description}</Text>
                      )}

                      {/* Outreach Angle Perspectives */}
                      {event.outreach_angles && event.outreach_angles.map((angleSelection, idx) => {
                        if (!angleSelection.notes) return null;

                        return (
                          <View key={idx} style={styles.perspectiveContainer}>
                            <Text style={styles.perspectiveLabel}>
                              {angleSelection.angle} Perspective
                            </Text>
                            <Text style={styles.perspectiveNotes}>
                              {angleSelection.notes}
                            </Text>
                          </View>
                        );
                      })}

                      {/* Pills */}
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
                })
              )}
            </View>
          </Container>
        </View>
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
    paddingTop: 64, // Floating header height: ~56px header + 8px gap
    paddingBottom: 120, // Floating bottom nav height on mobile
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: dimensionSpaceAroundLg.number,
  },
  loadingText: {
    fontSize: textFontSizeHeadingMd.number,
    lineHeight: textLineHeightHeadingMd.number,
    fontWeight: textFontWeightBodyMedium,
    color: colorFgNeutralPrimary,
    marginTop: 12,
  },
  pageTitle: {
    fontSize: textFontSizeDisplayLg.number,
    lineHeight: textLineHeightDisplayLg.number,
    fontWeight: textFontWeightDisplayBold,
    letterSpacing: textLetterSpacingDisplay.number,
    color: colorFgNeutralPrimary,
    marginBottom: dimensionSpaceAroundLg.number,
  },
  header: {
    marginBottom: dimensionSpaceAroundLg.number,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: textFontSizeHeading2xl.number,
    lineHeight: textLineHeightHeading2xl.number,
    fontWeight: textFontWeightHeadingBold,
    color: colorFgNeutralPrimary,
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  columnsContainer: {
    flexDirection: 'row',
    gap: dimensionSpaceBetweenRelatedMd.number,
    flexWrap: 'wrap',
  },
  columnsContainerSingle: {
    flexDirection: 'column',
  },
  column: {
    flex: 1,
    minWidth: 280,
  },
  columnFull: {
    minWidth: '100%',
  },
  columnHighlighted: {
    borderWidth: 2,
    borderColor: colorBgAccentHigh,
  },
  columnHeader: {
    marginBottom: dimensionSpaceBetweenRelatedSm.number,
  },
  columnTitle: {
    fontSize: textFontSizeHeadingMd.number,
    lineHeight: textLineHeightHeadingMd.number,
    fontWeight: textFontWeightHeadingBold,
    color: colorFgNeutralPrimary,
  },
  columnTitleHighlighted: {
    color: colorFgAccentPrimary,
  },
  eventsContainer: {
    gap: dimensionSpaceBetweenRepeatingMd.number,
  },
  emptyText: {
    fontSize: textFontSizeBodySm.number,
    lineHeight: textLineHeightBodySm.number,
    fontWeight: textFontWeightBodyRegular,
    color: colorFgNeutralSecondary,
  },
  eventCard: {
    // Gap handled by eventsContainer
  },
  eventHeader: {
    marginBottom: dimensionSpaceBetweenRepeatingSm.number,
  },
  eventTitle: {
    fontSize: textFontSizeBodySm.number,
    lineHeight: textLineHeightBodySm.number,
    fontWeight: textFontWeightBodyMedium,
    color: colorFgNeutralPrimary,
    marginBottom: dimensionSpaceBetweenRepeatingSm.number,
  },
  eventDate: {
    fontSize: textFontSizeBodyXs.number,
    lineHeight: textLineHeightBodyXs.number,
    fontWeight: textFontWeightBodyRegular,
    color: colorFgNeutralSecondary,
  },
  eventDescription: {
    fontSize: textFontSizeBodySm.number,
    lineHeight: textLineHeightBodySm.number,
    fontWeight: textFontWeightBodyRegular,
    color: colorFgNeutralPrimary,
    marginBottom: dimensionSpaceBetweenRepeatingSm.number,
  },
  perspectiveContainer: {
    marginBottom: dimensionSpaceBetweenRepeatingSm.number,
  },
  perspectiveLabel: {
    fontSize: textFontSizeBodyXs.number,
    lineHeight: textLineHeightBodyXs.number,
    fontWeight: textFontWeightBodyMedium,
    color: colorFgNeutralSecondary,
    marginBottom: dimensionSpaceBetweenRepeatingSm.number,
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
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: dimensionSpaceAroundLg.number * 2,
  },
  errorTitle: {
    fontSize: textFontSizeHeadingLg.number,
    lineHeight: textLineHeightHeadingLg.number,
    fontWeight: textFontWeightHeadingBold,
    color: colorFgNeutralPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: textFontSizeBodySm.number,
    lineHeight: textLineHeightBodySm.number,
    fontWeight: textFontWeightBodyRegular,
    color: colorFgNeutralSecondary,
    marginBottom: 24,
    textAlign: 'center',
    maxWidth: 400,
  },
  // Floating header styles
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 120, // Fixed height for gradient mask to work properly
  },
  floatingHeaderSafeArea: {
    backgroundColor: 'transparent',
  },
  floatingHeaderContent: {
    paddingHorizontal: dimensionSpaceAroundMd.number,
    paddingVertical: 8,
  },
  floatingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  navButtonsLeft: {
    flex: 1,
  },
  viewSwitcher: {
    width: 320, // Same as web (lg:w-[320px])
  },
  floatingHeaderButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  floatingHeaderButtonsMobileOnly: {
    // On mobile (no segmented control at top), keep buttons right-aligned
    justifyContent: 'flex-end',
  },
});
