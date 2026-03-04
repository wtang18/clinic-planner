/**
 * MenuPane Component
 *
 * Main navigation menu with hubs, To-Do categories, My Patients cohort tree,
 * and patient workspaces. Supports nested To-Do filters with expand/collapse behavior.
 *
 * "My Patients" renders a dynamic cohort tree in PC scenarios (collapsible category
 * groups with cohort items and patient counts) or a simplified "Recent Patients"
 * link in UC scenarios. Selection dispatches navigateToScope for cohort navigation.
 */

import React, { useState, useEffect } from 'react';
import {
  Home,
  Calendar,
  Users,
  Search,
  Activity,
  Shield,
  Syringe,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  ArrowRightLeft,
  History,
  ChevronRight,
} from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions, LAYOUT } from '../../styles/foundations';
import { MenuSection } from './MenuSection';
import { MenuNavItem } from './MenuNavItem';
import { PatientWorkspaceItem, PatientTask, type VisitSubItemConfig } from './PatientWorkspaceItem';
import type { RecordingStatus as BottomBarRecordingStatus } from '../../state/bottomBar/types';
import { ToDoCategoryItem, ToDoFilter } from './ToDoCategoryItem';
import { TODO_CATEGORIES, getCategoryBadgeCount } from '../../scenarios/todoData';
import type { WorkspaceTab } from '../../context/WorkspaceContext';
import { COHORT_GROUPS, COHORTS } from '../../data/mock-population-health';

// ============================================================================
// Cohort Icon Map (absorbed from CohortNavigator)
// ============================================================================

const COHORT_ICONS: Record<string, React.ReactNode> = {
  'coh-diabetes': <Activity size={16} />,
  'coh-hypertension': <Activity size={16} />,
  'coh-copd': <Activity size={16} />,
  'coh-cancer-screening': <Shield size={16} />,
  'coh-immunization': <Syringe size={16} />,
  'coh-high-risk': <AlertTriangle size={16} />,
  'coh-rising-risk': <TrendingUp size={16} />,
  'coh-stable': <CheckCircle size={16} />,
  'coh-recent-discharge': <ArrowRightLeft size={16} />,
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'grp-chronic': <Activity size={16} />,
  'grp-preventive': <Shield size={16} />,
  'grp-risk': <AlertTriangle size={16} />,
  'grp-transitions': <ArrowRightLeft size={16} />,
};

// ============================================================================
// Types
// ============================================================================

/** Scenario type controls which MenuPane sections appear */
export type ScenarioType = 'pc' | 'uc';

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
  /** Currently selected cohort ID (highlights in My Patients tree) */
  selectedCohortId?: string | null;
  /** Scenario type: 'pc' shows full cohort tree, 'uc' shows only Recent Patients */
  scenarioType?: ScenarioType;
  /** Called when a nav item is selected */
  onNavItemSelect?: (itemId: string) => void;
  /** Called when a To-Do filter is selected */
  onToDoFilterSelect?: (categoryId: string, filterId: string) => void;
  /** Called when a cohort is selected in My Patients (dispatches scope navigation) */
  onCohortSelect?: (cohortId: string) => void;
  /** @deprecated Use onCohortSelect instead */
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
  selectedCohortId,
  scenarioType = 'pc',
  onNavItemSelect,
  onToDoFilterSelect,
  onCohortSelect,
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);

  // Auto-expand group when selectedCohortId matches a child
  useEffect(() => {
    if (!selectedCohortId) return;
    for (const group of COHORT_GROUPS) {
      if (group.cohortIds.includes(selectedCohortId)) {
        setExpandedGroups((prev) => {
          if (prev.has(group.id)) return prev;
          const next = new Set(prev);
          next.add(group.id);
          return next;
        });
        break;
      }
    }
  }, [selectedCohortId]);

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

  // Total patient count across non-overview cohorts (for My Patients collapsed badge)
  const totalPatientCount = COHORTS
    .filter((c) => c.category !== 'overview')
    .reduce((sum, c) => sum + c.patientCount, 0);

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

        {/* My Patients Section — cohort tree (PC) or recent-only (UC) */}
        <MenuSection
          title="My Patients"
          collapsible
          collapsedBadge={totalPatientCount}
        >
          {scenarioType === 'pc' ? (
            <>
              {/* All Patients (root) */}
              <MenuNavItem
                icon={<Users size={16} />}
                label="All Patients"
                badge={totalPatientCount}
                isSelected={selectedCohortId === ''}
                onClick={() => onCohortSelect?.('')}
                testID="my-patients-all"
              />
              <MenuNavItem
                icon={<History size={16} />}
                label="Recent Patients"
                isSelected={selectedItemId === 'recent-patients'}
                onClick={() => onCohortSelect?.('recent')}
                testID="my-patients-recent"
              />

              {/* Category groups with cohort items — expandable L1 items */}
              {COHORT_GROUPS.map((group) => {
                const groupCohorts = COHORTS.filter(
                  (c) => group.cohortIds.includes(c.id)
                );
                const groupCount = groupCohorts.reduce(
                  (sum, c) => sum + c.patientCount, 0
                );
                const isGroupExpanded = expandedGroups.has(group.id);
                const isGroupSelected = selectedCohortId === group.id;
                const isGroupHovered = hoveredGroupId === group.id;

                return (
                  <div key={group.id} data-testid={`cohort-group-${group.id}`}>
                    {/* Category row — clickable to expand + navigate to overview */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spaceBetween.relatedCompact,
                        padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
                        borderRadius: borderRadius.sm,
                        cursor: 'pointer',
                        transition: `background-color ${transitions.fast}`,
                        backgroundColor: isGroupSelected
                          ? colors.bg.accent.low
                          : isGroupHovered
                          ? colors.bg.neutral.subtle
                          : 'transparent',
                        userSelect: 'none',
                      }}
                      onClick={() => {
                        // Expand if collapsed, navigate to category overview
                        setExpandedGroups((prev) => {
                          const next = new Set(prev);
                          next.add(group.id);
                          return next;
                        });
                        onCohortSelect?.(group.id);
                      }}
                      onMouseEnter={() => setHoveredGroupId(group.id)}
                      onMouseLeave={() => setHoveredGroupId(null)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setExpandedGroups((prev) => {
                            const next = new Set(prev);
                            next.add(group.id);
                            return next;
                          });
                          onCohortSelect?.(group.id);
                        }
                      }}
                    >
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 16,
                        height: 16,
                        color: isGroupSelected ? colors.fg.accent.primary : colors.fg.neutral.secondary,
                        flexShrink: 0,
                      }}>
                        {CATEGORY_ICONS[group.id] || <Users size={16} />}
                      </span>
                      <span style={{
                        flex: 1,
                        fontSize: 14,
                        fontFamily: typography.fontFamily.sans,
                        fontWeight: typography.fontWeight.regular,
                        color: isGroupSelected ? colors.fg.accent.primary : colors.fg.neutral.primary,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {group.label}
                      </span>
                      {groupCount > 0 && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 20,
                          height: 20,
                          padding: `0 ${spaceAround.nudge6}px`,
                          backgroundColor: colors.bg.attention.subtle,
                          color: colors.fg.attention.primary,
                          borderRadius: borderRadius.full,
                          fontSize: 11,
                          fontFamily: typography.fontFamily.sans,
                          fontWeight: typography.fontWeight.semibold,
                          flexShrink: 0,
                        }}>
                          {groupCount > 99 ? '99+' : groupCount}
                        </span>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 16,
                          height: 16,
                          color: colors.fg.neutral.spotReadable,
                          transform: isGroupExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: `transform ${transitions.fast}`,
                          flexShrink: 0,
                          marginLeft: 'auto',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedGroups((prev) => {
                            const next = new Set(prev);
                            if (next.has(group.id)) {
                              next.delete(group.id);
                            } else {
                              next.add(group.id);
                            }
                            return next;
                          });
                        }}
                      >
                        <ChevronRight size={14} />
                      </div>
                    </div>

                    {/* Children — indented cohort items */}
                    {isGroupExpanded && groupCohorts.map((cohort) => (
                      <MenuNavItem
                        key={cohort.id}
                        icon={COHORT_ICONS[cohort.id] || <Users size={16} />}
                        label={cohort.name}
                        badge={cohort.patientCount}
                        isSelected={selectedCohortId === cohort.id}
                        indented
                        onClick={() => onCohortSelect?.(cohort.id)}
                        testID={`cohort-${cohort.id}`}
                      />
                    ))}
                  </div>
                );
              })}
            </>
          ) : (
            /* UC scenario: simplified — only Recent Patients */
            <MenuNavItem
              icon={<History size={16} />}
              label="Recent Patients"
              isSelected={selectedItemId === 'recent-patients'}
              onClick={() => onCohortSelect?.('recent')}
              testID="my-patients-recent"
            />
          )}
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
