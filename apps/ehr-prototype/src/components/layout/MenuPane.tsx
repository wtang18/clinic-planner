/**
 * MenuPane Component
 *
 * Main navigation menu with hubs, To-Do categories, and patient workspaces.
 * Supports nested To-Do filters with expand/collapse behavior.
 */

import React from 'react';
import {
  Home,
  Calendar,
  Users,
  Search,
  AlertTriangle,
  Activity,
  Clock,
  Brain,
  History,
} from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions, LAYOUT } from '../../styles/foundations';
import { MenuSection } from './MenuSection';
import { MenuNavItem } from './MenuNavItem';
import { PatientWorkspaceItem, PatientTask, type VisitSubItemConfig } from './PatientWorkspaceItem';
import type { RecordingStatus as BottomBarRecordingStatus } from '../../state/bottomBar/types';
import { ToDoCategoryItem, ToDoFilter } from './ToDoCategoryItem';
import { TODO_CATEGORIES, getCategoryBadgeCount } from '../../scenarios/todoData';
import type { WorkspaceTab } from '../../context/WorkspaceContext';

// ============================================================================
// Types
// ============================================================================

export interface PatientWorkspace {
  id: string;
  name: string;
  initials?: string;
  avatarColor?: string;
  /** Legacy: simple task list */
  tasks?: PatientTask[];
  /** New: workspace tabs from WorkspaceContext */
  workspaceTabs?: WorkspaceTab[];
  /** Active tab ID */
  activeTabId?: string;
  currentVisit?: string;
  /** Recording statuses by tab ID (encounter-level indicators) */
  tabRecordingStatuses?: Record<string, BottomBarRecordingStatus>;
  /** Visit sub-items (Workflow/Chart toggle under visit tabs) */
  visitSubItems?: VisitSubItemConfig[];
}

/** Registry view identifiers for population health navigation */
export type RegistryViewId = 'all-patients' | 'high-risk' | 'chronic-care' | 'overdue-care' | 'mental-health' | 'recent';

export interface MenuPaneProps {
  /** List of patient workspaces */
  patientWorkspaces?: PatientWorkspace[];
  /** Currently selected nav item ID */
  selectedItemId?: string;
  /** Currently selected To-Do filter (format: "categoryId/filterId") */
  selectedToDoFilter?: string;
  /** Called when a nav item is selected */
  onNavItemSelect?: (itemId: string) => void;
  /** Called when a To-Do filter is selected */
  onToDoFilterSelect?: (categoryId: string, filterId: string) => void;
  /** Called when a registry view is selected (population health views under My Patients) */
  onRegistryViewSelect?: (viewId: RegistryViewId) => void;
  /** Called when a patient workspace is selected */
  onPatientSelect?: (patientId: string) => void;
  /** Called when a task is selected (legacy) */
  onTaskSelect?: (patientId: string, taskId: string) => void;
  /** Called when a workspace tab is clicked */
  onTabClick?: (patientId: string, tabId: string) => void;
  /** Called when a workspace tab close button is clicked */
  onTabClose?: (patientId: string, tabId: string) => void;
  /** Called when an entire workspace is closed */
  onWorkspaceClose?: (patientId: string) => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const MenuPane: React.FC<MenuPaneProps> = ({
  patientWorkspaces = [],
  selectedItemId,
  selectedToDoFilter,
  onNavItemSelect,
  onToDoFilterSelect,
  onRegistryViewSelect,
  onPatientSelect,
  onTaskSelect,
  onTabClick,
  onTabClose,
  onWorkspaceClose,
  style,
  testID,
}) => {
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  // Parse selected To-Do filter
  const [selectedCategoryId, selectedFilterId] = selectedToDoFilter?.split('/') ?? [null, null];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'transparent', // Glassmorphic background applied by container
    overflow: 'hidden',
    ...style,
  };

  const scrollContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: LAYOUT.menuContentPadding,
  };

  const searchContainerStyle: React.CSSProperties = {
    padding: LAYOUT.menuContentPadding,
    paddingBottom: 0,
  };

  const searchInputStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: colors.bg.neutral.subtle,
    border: `1px solid ${isSearchFocused ? colors.border.accent.low : colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
    cursor: 'text',
    transition: `border-color ${transitions.fast}`,
  };

  const searchIconStyle: React.CSSProperties = {
    color: colors.fg.neutral.spotReadable,
    flexShrink: 0,
  };

  const searchPlaceholderStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    flex: 1,
  };

  const sectionGapStyle: React.CSSProperties = {
    height: spaceBetween.related,
  };

  // Calculate total To-Do badge count for collapsed section header
  const totalToDoBadgeCount = TODO_CATEGORIES.reduce(
    (sum, category) => sum + getCategoryBadgeCount(category.id),
    0
  );

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Search (placeholder - deferred) */}
      <div style={searchContainerStyle}>
        <div
          style={searchInputStyle}
          onClick={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          tabIndex={0}
        >
          <Search size={16} style={searchIconStyle} />
          <span style={searchPlaceholderStyle}>Search...</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={scrollContainerStyle}>
        {/* Navigation items (no section header) */}
        <MenuNavItem
          icon={<Home size={16} />}
          label="Home"
          isSelected={selectedItemId === 'home'}
          onClick={() => onNavItemSelect?.('home')}
        />
        <MenuNavItem
          icon={<Calendar size={16} />}
          label="Visits"
          isSelected={selectedItemId === 'visits'}
          onClick={() => onNavItemSelect?.('visits')}
        />

        <div style={sectionGapStyle} />

        {/* To Do Section */}
        <MenuSection title="To Do" collapsible collapsedBadge={totalToDoBadgeCount}>
          {TODO_CATEGORIES.map((category) => (
            <ToDoCategoryItem
              key={category.id}
              id={category.id}
              label={category.label}
              icon={category.icon}
              badge={getCategoryBadgeCount(category.id)}
              defaultFilterId={category.defaultFilterId}
              filters={category.filters}
              selectedFilterId={
                selectedCategoryId === category.id ? selectedFilterId ?? undefined : undefined
              }
              onCategoryClick={() => {
                // Clear hub selection when clicking To-Do
                onNavItemSelect?.('');
              }}
              onFilterClick={(filterId) => {
                onToDoFilterSelect?.(category.id, filterId);
              }}
              testID={`todo-category-${category.id}`}
            />
          ))}
        </MenuSection>

        <div style={sectionGapStyle} />

        {/* My Patients Section — registry / population health views */}
        <MenuSection title="My Patients">
          <MenuNavItem
            icon={<Users size={16} />}
            label="All Patients"
            isSelected={selectedItemId === 'registry-all-patients'}
            onClick={() => onRegistryViewSelect?.('all-patients')}
          />
          <MenuNavItem
            icon={<AlertTriangle size={16} />}
            label="High Risk"
            isSelected={selectedItemId === 'registry-high-risk'}
            onClick={() => onRegistryViewSelect?.('high-risk')}
          />
          <MenuNavItem
            icon={<Activity size={16} />}
            label="Chronic Care"
            isSelected={selectedItemId === 'registry-chronic-care'}
            onClick={() => onRegistryViewSelect?.('chronic-care')}
          />
          <MenuNavItem
            icon={<Clock size={16} />}
            label="Overdue Care"
            isSelected={selectedItemId === 'registry-overdue-care'}
            onClick={() => onRegistryViewSelect?.('overdue-care')}
          />
          <MenuNavItem
            icon={<Brain size={16} />}
            label="Mental Health"
            isSelected={selectedItemId === 'registry-mental-health'}
            onClick={() => onRegistryViewSelect?.('mental-health')}
          />
          <MenuNavItem
            icon={<History size={16} />}
            label="Recent"
            isSelected={selectedItemId === 'registry-recent'}
            onClick={() => onRegistryViewSelect?.('recent')}
          />
        </MenuSection>

        {/* Patient Workspaces — open patient charts (source-agnostic) */}
        {patientWorkspaces.length > 0 && (
          <>
            <div style={sectionGapStyle} />
            <MenuSection title="Patient Workspaces">
              {patientWorkspaces.map((patient) => (
                <PatientWorkspaceItem
                  key={patient.id}
                  name={patient.name}
                  initials={patient.initials}
                  avatarColor={patient.avatarColor}
                  tasks={patient.tasks}
                  workspaceTabs={patient.workspaceTabs}
                  activeTabId={patient.activeTabId}
                  currentVisit={patient.currentVisit}
                  tabRecordingStatuses={patient.tabRecordingStatuses}
                  visitSubItems={patient.visitSubItems}
                  isSelected={selectedItemId === `patient-${patient.id}`}
                  defaultExpanded={patientWorkspaces.length === 1}
                  onPatientClick={() => onPatientSelect?.(patient.id)}
                  onTaskClick={(taskId) => onTaskSelect?.(patient.id, taskId)}
                  onTabClick={(tabId) => onTabClick?.(patient.id, tabId)}
                  onTabClose={(tabId) => onTabClose?.(patient.id, tabId)}
                  onWorkspaceClose={() => onWorkspaceClose?.(patient.id)}
                  onVisitClick={() => onPatientSelect?.(patient.id)}
                />
              ))}
            </MenuSection>
          </>
        )}
      </div>
    </div>
  );
};

MenuPane.displayName = 'MenuPane';
