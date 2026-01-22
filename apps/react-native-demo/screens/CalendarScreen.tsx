/**
 * Calendar Screen
 * Demonstrates adaptive calendar layout for iPhone vs iPad
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import design tokens
import {
  colorBgNeutralSubtle,
  colorBgNeutralBase,
  colorFgNeutralPrimary,
  colorFgNeutralSecondary,
  colorBgBrandPrimary,
  colorFgBrandPrimary,
  dimensionSpaceAroundMd,
  dimensionSpaceAroundLg,
  dimensionSpaceBetweenRelatedSm,
  dimensionRadiusMd,
} from '../../../src/design-system/tokens/build/react-native/tokens';
import { elevation } from '../../../src/design-system/tokens/build/react-native/elevation';

// Import components
import { Card } from '../components/Card';
import { Button } from '../components/Button';

// Import responsive utilities
import { useAdaptiveLayout } from '../utils/responsive';

// Mock calendar events
interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  patient: string;
  type: 'consultation' | 'follow-up' | 'procedure';
}

const MOCK_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Annual Checkup', time: '9:00 AM', duration: '30 min', patient: 'John Smith', type: 'consultation' },
  { id: '2', title: 'Follow-up Visit', time: '10:00 AM', duration: '15 min', patient: 'Sarah Johnson', type: 'follow-up' },
  { id: '3', title: 'Physical Exam', time: '11:30 AM', duration: '45 min', patient: 'Mike Davis', type: 'consultation' },
  { id: '4', title: 'Vaccination', time: '1:00 PM', duration: '15 min', patient: 'Emma Wilson', type: 'procedure' },
  { id: '5', title: 'Consultation', time: '2:00 PM', duration: '30 min', patient: 'Alex Brown', type: 'consultation' },
  { id: '6', title: 'Follow-up', time: '3:00 PM', duration: '15 min', patient: 'Lisa Anderson', type: 'follow-up' },
];

export default function CalendarScreen() {
  const layout = useAdaptiveLayout();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Render event card
  const renderEventCard = ({ item }: { item: CalendarEvent }) => {
    const typeColors = {
      consultation: '#3b82f6',
      'follow-up': '#10b981',
      procedure: '#f59e0b',
    };

    return (
      <Card
        variant="interactive"
        size="small"
        style={styles.eventCard}
        onPress={() => console.log('Event pressed:', item.id)}
      >
        <View style={styles.eventHeader}>
          <View style={[styles.eventBadge, { backgroundColor: typeColors[item.type] }]} />
          <Text style={styles.eventTime}>{item.time}</Text>
          <Text style={styles.eventDuration}>• {item.duration}</Text>
        </View>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventPatient}>Patient: {item.patient}</Text>
      </Card>
    );
  };

  // iPhone Layout: Single column, vertical list
  if (layout.useSingleColumn) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Today's Schedule</Text>
          <Text style={styles.subtitle}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card size="small" style={styles.statCard}>
            <Text style={styles.statValue}>6</Text>
            <Text style={styles.statLabel}>Appointments</Text>
          </Card>
          <Card size="small" style={styles.statCard}>
            <Text style={styles.statValue}>2.5h</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </Card>
        </View>

        {/* Events List */}
        <FlatList
          data={MOCK_EVENTS}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }

  // iPad Layout: Multi-column with sidebar
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.tabletContainer}>
        {/* Left Sidebar - Calendar & Stats */}
        <View style={styles.sidebar}>
          <View style={styles.header}>
            <Text style={styles.title}>Calendar</Text>
            <Text style={styles.subtitle}>
              {selectedDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </Text>
          </View>

          {/* Mini Calendar Placeholder */}
          <Card style={styles.miniCalendar}>
            <Text style={styles.calendarMonth}>December 2025</Text>
            <View style={styles.calendarGrid}>
              {[...Array(31)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.calendarDay,
                    i === 13 && styles.calendarDaySelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      i === 13 && styles.calendarDayTextSelected,
                    ]}
                  >
                    {i + 1}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Stats */}
          <View style={styles.sidebarStats}>
            <Card size="small" style={styles.sidebarStatCard}>
              <Text style={styles.statValue}>6</Text>
              <Text style={styles.statLabel}>Today</Text>
            </Card>
            <Card size="small" style={styles.sidebarStatCard}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </Card>
          </View>
        </View>

        {/* Right Content - Event List */}
        <View style={styles.mainContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Today's Schedule</Text>
            <Text style={styles.subtitle}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {MOCK_EVENTS.map((event) => (
              <View key={event.id}>
                {renderEventCard({ item: event })}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorBgNeutralSubtle,
  },
  header: {
    padding: dimensionSpaceAroundMd.number,
    paddingBottom: dimensionSpaceBetweenRelatedSm.number,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colorFgNeutralPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colorFgNeutralSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: dimensionSpaceBetweenRelatedSm.number,
    paddingHorizontal: dimensionSpaceAroundMd.number,
    marginBottom: dimensionSpaceBetweenRelatedSm.number,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colorBgBrandPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colorFgNeutralSecondary,
    marginTop: 4,
  },
  listContent: {
    padding: dimensionSpaceAroundMd.number,
    gap: dimensionSpaceBetweenRelatedSm.number,
  },
  eventCard: {
    marginBottom: dimensionSpaceBetweenRelatedSm.number,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colorFgNeutralPrimary,
  },
  eventDuration: {
    fontSize: 12,
    color: colorFgNeutralSecondary,
    marginLeft: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colorFgNeutralPrimary,
    marginBottom: 4,
  },
  eventPatient: {
    fontSize: 14,
    color: colorFgNeutralSecondary,
  },

  // iPad Layout
  tabletContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 320,
    backgroundColor: colorBgNeutralBase,
    borderRightWidth: 1,
    borderRightColor: colorBgNeutralSubtle,
  },
  mainContent: {
    flex: 1,
  },
  miniCalendar: {
    margin: dimensionSpaceAroundMd.number,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: colorFgNeutralPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  calendarDay: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  calendarDaySelected: {
    backgroundColor: colorBgBrandPrimary,
  },
  calendarDayText: {
    fontSize: 14,
    color: colorFgNeutralPrimary,
  },
  calendarDayTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  sidebarStats: {
    flexDirection: 'row',
    gap: dimensionSpaceBetweenRelatedSm.number,
    padding: dimensionSpaceAroundMd.number,
  },
  sidebarStatCard: {
    flex: 1,
    alignItems: 'center',
  },
});
