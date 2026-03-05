/**
 * ScopeRouters
 *
 * Thin switch components that route AdaptiveLayout slots based on viewMode.
 * Each returns the appropriate scope-specific component for its slot.
 */

import React, { useMemo } from 'react';
import { Home, Calendar, LayoutGrid, Users } from 'lucide-react';
import { CohortContextPane, CohortIdentityHeader } from '../../components/population-health/CohortContextPane';
import { Dashboard } from '../../components/population-health/Dashboard';
import type { Cohort, DashboardMetric } from '../../types/population-health';
import { COHORT_GROUPS, COHORTS, getPathwaysByCohort } from '../../data/mock-population-health';
import { colors, typography, spaceAround, spaceBetween, borderRadius, LAYOUT } from '../../styles/foundations';
import {
  EncounterWorkspace,
  EncounterCanvasHeader,
  EncounterOverviewHeader,
  EncounterCollapsedIdentity,
  EncounterOverview,
  EncounterAIBar,
} from '../EncounterWorkspace/EncounterWorkspace';
import type { ViewMode, ToDoViewState } from '../EncounterWorkspace/EncounterWorkspace';
import { CohortWorkspace, CohortCanvasHeader, CohortAIBar } from '../CohortWorkspace/CohortWorkspace';
import { BottomBarContainer } from '../../components/bottom-bar/BottomBarContainer';
import type { ToDoItem } from '../../scenarios/todoData';

// ============================================================================
// ScopeOverview
// ============================================================================

export const ScopeOverview: React.FC<{
  viewMode: ViewMode;
  selectedCohortId: string | null;
  selectedPatient: any;
  selectedPatientOverviewData: any;
}> = ({ viewMode, selectedCohortId, selectedPatient, selectedPatientOverviewData }) => {
  if (viewMode === 'cohort' && selectedCohortId === 'all-patients') {
    return <AllPatientsOverviewPane />;
  }
  if (viewMode === 'cohort' && selectedCohortId?.endsWith(':overview')) {
    return <CohortGroupOverviewPane groupId={selectedCohortId.split(':')[0]} />;
  }
  if (viewMode === 'cohort' && selectedCohortId) {
    return <CohortContextPane cohortId={selectedCohortId} hideHeader />;
  }
  if (viewMode === 'patient' && selectedPatient) {
    return (
      <EncounterOverview selectedPatient={selectedPatient} />
    );
  }
  // Hub views (home, visits) + todo — no overview pane
  return null;
};

ScopeOverview.displayName = 'ScopeOverview';

// ============================================================================
// ScopeOverviewHeader
// ============================================================================

export const ScopeOverviewHeader: React.FC<{
  viewMode: ViewMode;
  selectedCohort: Cohort | null;
  selectedCohortId?: string | null;
  selectedPatient: any;
  selectedPatientOverviewData: any;
}> = ({ viewMode, selectedCohort, selectedCohortId, selectedPatient, selectedPatientOverviewData }) => {
  // All patients — aggregate header
  if (viewMode === 'cohort' && selectedCohortId === 'all-patients') {
    const totalPatients = COHORTS.filter(c => c.category !== 'overview').reduce((sum, c) => sum + c.patientCount, 0);
    return (
      <CohortIdentityHeader
        name="All Patients"
        patientCount={totalPatients}
        category="overview"
        variant="stacked"
        showIcon={false}
      />
    );
  }
  // Category overview — show group identity header
  if (viewMode === 'cohort' && selectedCohortId?.endsWith(':overview')) {
    const groupId = selectedCohortId.split(':')[0];
    const group = COHORT_GROUPS.find(g => g.id === groupId);
    if (group) {
      const cohorts = group.cohortIds.map(id => COHORTS.find(c => c.id === id)).filter(Boolean);
      const totalPatients = cohorts.reduce((sum, c) => sum + (c?.patientCount ?? 0), 0);
      return (
        <CohortIdentityHeader
          name={group.label}
          patientCount={totalPatients}
          category={group.category}
          variant="stacked"
          showIcon={false}
        />
      );
    }
  }
  if (viewMode === 'cohort' && selectedCohort) {
    return (
      <CohortIdentityHeader
        name={selectedCohort.name}
        patientCount={selectedCohort.patientCount}
        category={selectedCohort.category}
        variant="stacked"
        showIcon={false}
      />
    );
  }
  if (viewMode === 'patient' && selectedPatient) {
    return <EncounterOverviewHeader selectedPatient={selectedPatient} />;
  }
  // Hub views + todo — no overview header
  return null;
};

ScopeOverviewHeader.displayName = 'ScopeOverviewHeader';

// ============================================================================
// ScopeCanvasHeader
// ============================================================================

export const ScopeCanvasHeader: React.FC<{
  viewMode: ViewMode;
  isViewingEncounterPatient: boolean;
  selectedCohortId?: string | null;
}> = ({ viewMode, isViewingEncounterPatient, selectedCohortId }) => {
  // CohortCanvasHeader for actual cohorts (not overviews or all-patients)
  if (viewMode === 'cohort' && selectedCohortId && !selectedCohortId.endsWith(':overview') && selectedCohortId !== 'all-patients') {
    return <CohortCanvasHeader />;
  }
  if (viewMode === 'patient' && isViewingEncounterPatient) {
    return <EncounterCanvasHeader />;
  }
  // Hub views + todo — no canvas header controls
  return null;
};

ScopeCanvasHeader.displayName = 'ScopeCanvasHeader';

// ============================================================================
// ScopeCanvasPane
// ============================================================================

export const ScopeCanvasPane: React.FC<{
  viewMode: ViewMode;
  selectedCohortId: string | null;
  todoViewState: ToDoViewState | null;
  selectedNavItem: string;
  todoSearchQuery: string;
  onSetViewMode: (mode: ViewMode) => void;
  onSetTodoViewState: (state: ToDoViewState | null) => void;
  onSetSelectedNavItem: (id: string) => void;
  onOpenPatientFromToDo: (item: ToDoItem) => void;
  onCanvasScrolledChange: (scrolled: boolean) => void;
}> = (props) => {
  if (props.viewMode === 'cohort' && props.selectedCohortId === 'all-patients') {
    return <AllPatientsPlaceholder />;
  }
  if (props.viewMode === 'cohort' && props.selectedCohortId?.endsWith(':overview')) {
    return <CohortOverviewPlaceholder groupId={props.selectedCohortId.split(':')[0]} />;
  }
  if (props.viewMode === 'cohort' && props.selectedCohortId) {
    return <CohortWorkspace cohortId={props.selectedCohortId} />;
  }
  if (props.viewMode === 'home' || props.viewMode === 'visits') {
    return <HubPlaceholder viewMode={props.viewMode} />;
  }
  return (
    <EncounterWorkspace
      viewMode={props.viewMode}
      todoViewState={props.todoViewState}
      selectedNavItem={props.selectedNavItem}
      todoSearchQuery={props.todoSearchQuery}
      onSetViewMode={props.onSetViewMode}
      onSetTodoViewState={props.onSetTodoViewState}
      onSetSelectedNavItem={props.onSetSelectedNavItem}
      onOpenPatientFromToDo={props.onOpenPatientFromToDo}
      onCanvasScrolledChange={props.onCanvasScrolledChange}
    />
  );
};

ScopeCanvasPane.displayName = 'ScopeCanvasPane';

// ============================================================================
// ScopeCollapsedIdentity
// ============================================================================

export const ScopeCollapsedIdentity: React.FC<{
  viewMode: ViewMode;
  selectedCohort: Cohort | null;
  selectedCohortId?: string | null;
  selectedPatient: any;
}> = ({ viewMode, selectedCohort, selectedCohortId, selectedPatient }) => {
  // All patients — aggregate identity
  if (viewMode === 'cohort' && selectedCohortId === 'all-patients') {
    const totalPatients = COHORTS.filter(c => c.category !== 'overview').reduce((sum, c) => sum + c.patientCount, 0);
    return (
      <CohortIdentityHeader
        name="All Patients"
        patientCount={totalPatients}
        category="overview"
        variant="stacked"
        showIcon={false}
      />
    );
  }
  // Category overview — show group identity
  if (viewMode === 'cohort' && selectedCohortId?.endsWith(':overview')) {
    const groupId = selectedCohortId.split(':')[0];
    const group = COHORT_GROUPS.find(g => g.id === groupId);
    if (group) {
      const cohorts = group.cohortIds.map(id => COHORTS.find(c => c.id === id)).filter(Boolean);
      const totalPatients = cohorts.reduce((sum, c) => sum + (c?.patientCount ?? 0), 0);
      return (
        <CohortIdentityHeader
          name={group.label}
          patientCount={totalPatients}
          category={group.category}
          variant="stacked"
          showIcon={false}
        />
      );
    }
  }
  if (viewMode === 'cohort' && selectedCohort) {
    return (
      <CohortIdentityHeader
        name={selectedCohort.name}
        patientCount={selectedCohort.patientCount}
        category={selectedCohort.category}
        variant="stacked"
        showIcon={false}
      />
    );
  }
  if (viewMode === 'patient' && selectedPatient) {
    return <EncounterCollapsedIdentity selectedPatient={selectedPatient} />;
  }
  return null;
};

ScopeCollapsedIdentity.displayName = 'ScopeCollapsedIdentity';

// ============================================================================
// ScopeAIBar
// ============================================================================

export const ScopeAIBar: React.FC<{
  viewMode: ViewMode;
  selectedCohortId?: string | null;
}> = ({ viewMode, selectedCohortId }) => {
  // CohortAIBar for actual cohorts (not overviews or all-patients)
  if (viewMode === 'cohort' && selectedCohortId && !selectedCohortId.endsWith(':overview') && selectedCohortId !== 'all-patients') {
    return <CohortAIBar />;
  }
  // All patients — minimal AI bar
  if (viewMode === 'cohort' && selectedCohortId === 'all-patients') {
    return (
      <BottomBarContainer
        patientName=""
        contextTarget={{ type: 'encounter', label: 'All Patients' }}
        availableContextLevels={['encounter']}
        suggestions={[]}
        cannedQueries={[]}
        transcriptionEnabled={false}
      />
    );
  }
  // Category overview — minimal AI bar with group context label
  if (viewMode === 'cohort' && selectedCohortId?.endsWith(':overview')) {
    const groupId = selectedCohortId.split(':')[0];
    const group = COHORT_GROUPS.find(g => g.id === groupId);
    return (
      <BottomBarContainer
        patientName=""
        contextTarget={{ type: 'encounter', label: group?.label ?? 'Overview' }}
        availableContextLevels={['encounter']}
        suggestions={[]}
        cannedQueries={[]}
        transcriptionEnabled={false}
      />
    );
  }
  if (viewMode === 'todo-list' || viewMode === 'todo-detail') {
    return <EncounterAIBar transcriptionEnabled={false} />;
  }
  if (viewMode === 'patient') {
    return <EncounterAIBar />;
  }
  // Hub views — minimal AI bar with no transcription
  return (
    <BottomBarContainer
      patientName=""
      contextTarget={{ type: 'encounter', label: viewMode === 'visits' ? 'Schedule' : 'Home' }}
      availableContextLevels={['encounter']}
      suggestions={[]}
      cannedQueries={[]}
      transcriptionEnabled={false}
    />
  );
};

ScopeAIBar.displayName = 'ScopeAIBar';

// ============================================================================
// HubPlaceholder — placeholder canvas for hub views (home, visits)
// ============================================================================

const HUB_CONFIG: Record<string, { icon: React.ReactNode; title: string; subtitle: string }> = {
  home: {
    icon: <Home size={32} />,
    title: 'Home',
    subtitle: 'Dashboard and quick actions',
  },
  visits: {
    icon: <Calendar size={32} />,
    title: 'Visits',
    subtitle: 'Schedule and appointment management',
  },
};

const HubPlaceholder: React.FC<{ viewMode: string }> = ({ viewMode }) => {
  const config = HUB_CONFIG[viewMode] || HUB_CONFIG.home;
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 12,
      color: colors.fg.neutral.spotReadable,
      padding: spaceAround.spacious,
    }}>
      <span style={{ opacity: 0.4 }}>{config.icon}</span>
      <span style={{
        fontSize: 18,
        fontFamily: typography.fontFamily.sans,
        fontWeight: typography.fontWeight.semibold,
        color: colors.fg.neutral.secondary,
      }}>
        {config.title}
      </span>
      <span style={{
        fontSize: 14,
        fontFamily: typography.fontFamily.sans,
        color: colors.fg.neutral.spotReadable,
      }}>
        {config.subtitle}
      </span>
    </div>
  );
};

HubPlaceholder.displayName = 'HubPlaceholder';

// ============================================================================
// CohortOverviewPlaceholder — placeholder canvas for cohort category overviews
// ============================================================================

const CohortOverviewPlaceholder: React.FC<{ groupId: string }> = ({ groupId }) => {
  const group = COHORT_GROUPS.find((g) => g.id === groupId);
  const title = group ? group.label : 'Category Overview';
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 12,
      color: colors.fg.neutral.spotReadable,
      padding: spaceAround.spacious,
    }}>
      <span style={{ opacity: 0.4 }}><LayoutGrid size={32} /></span>
      <span style={{
        fontSize: 18,
        fontFamily: typography.fontFamily.sans,
        fontWeight: typography.fontWeight.semibold,
        color: colors.fg.neutral.secondary,
      }}>
        {title}
      </span>
      <span style={{
        fontSize: 14,
        fontFamily: typography.fontFamily.sans,
        color: colors.fg.neutral.spotReadable,
      }}>
        Population health overview and metrics
      </span>
    </div>
  );
};

CohortOverviewPlaceholder.displayName = 'CohortOverviewPlaceholder';

// ============================================================================
// AllPatientsPlaceholder — placeholder canvas for All Patients root view
// ============================================================================

const AllPatientsPlaceholder: React.FC = () => {
  const totalPatients = COHORTS.filter(c => c.category !== 'overview').reduce((sum, c) => sum + c.patientCount, 0);
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 12,
      color: colors.fg.neutral.spotReadable,
      padding: spaceAround.spacious,
    }}>
      <span style={{ opacity: 0.4 }}><Users size={32} /></span>
      <span style={{
        fontSize: 18,
        fontFamily: typography.fontFamily.sans,
        fontWeight: typography.fontWeight.semibold,
        color: colors.fg.neutral.secondary,
      }}>
        All Patients
      </span>
      <span style={{
        fontSize: 14,
        fontFamily: typography.fontFamily.sans,
        color: colors.fg.neutral.spotReadable,
      }}>
        {totalPatients} patients across all cohorts
      </span>
    </div>
  );
};

AllPatientsPlaceholder.displayName = 'AllPatientsPlaceholder';

// ============================================================================
// AllPatientsOverviewPane — context pane for All Patients view
// ============================================================================

const AllPatientsOverviewPane: React.FC = () => {
  const cohortsByCategory = useMemo(() => {
    return COHORT_GROUPS.map(group => ({
      group,
      cohorts: group.cohortIds
        .map(id => COHORTS.find(c => c.id === id))
        .filter((c): c is Cohort => !!c),
    }));
  }, []);

  const totalPatients = COHORTS.filter(c => c.category !== 'overview').reduce((sum, c) => sum + c.patientCount, 0);

  const stats: DashboardMetric[] = useMemo(() => [
    { id: 'all-total', label: 'Total Patients', value: totalPatients },
    { id: 'all-cohorts', label: 'Cohorts', value: COHORTS.filter(c => c.category !== 'overview').length },
    { id: 'all-groups', label: 'Categories', value: COHORT_GROUPS.length },
  ], [totalPatients]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: colors.bg.neutral.min,
      overflow: 'hidden',
      paddingTop: LAYOUT.headerHeight,
    }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Dashboard metrics={stats} alerts={[]} testID="all-patients-stats" />

        {cohortsByCategory.map(({ group, cohorts }) => (
          <div key={group.id} style={{
            padding: `${spaceAround.compact}px ${spaceAround.default}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: spaceBetween.coupled,
          }}>
            <span style={SECTION_LABEL_STYLE}>{group.label}</span>
            {cohorts.map(c => (
              <div key={c.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: `${spaceAround.tight}px 0`,
              }}>
                <span style={{
                  fontSize: 13,
                  fontFamily: typography.fontFamily.sans,
                  color: colors.fg.neutral.primary,
                }}>
                  {c.name}
                </span>
                <span style={{
                  fontSize: 12,
                  fontFamily: typography.fontFamily.sans,
                  color: colors.fg.neutral.spotReadable,
                }}>
                  {c.patientCount}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

AllPatientsOverviewPane.displayName = 'AllPatientsOverviewPane';

// ============================================================================
// CohortGroupOverviewPane — center context pane for category overview pages
// Shows aggregate stats across all cohorts in the group + pathways list.
// ============================================================================

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontFamily: typography.fontFamily.sans,
  fontWeight: typography.fontWeight.semibold,
  color: colors.fg.neutral.spotReadable,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};

const CohortGroupOverviewPane: React.FC<{ groupId: string }> = ({ groupId }) => {
  const group = COHORT_GROUPS.find(g => g.id === groupId);

  // Resolve cohorts and pathways for this group
  const cohorts = useMemo(() => {
    if (!group) return [];
    return group.cohortIds
      .map(id => COHORTS.find(c => c.id === id))
      .filter((c): c is Cohort => !!c);
  }, [group]);

  const totalPatients = useMemo(
    () => cohorts.reduce((sum, c) => sum + c.patientCount, 0),
    [cohorts],
  );

  const allPathways = useMemo(
    () => cohorts.flatMap(c => getPathwaysByCohort(c.id)),
    [cohorts],
  );

  const stats = useMemo((): DashboardMetric[] => [
    { id: 'grp-total', label: 'Total Patients', value: totalPatients },
    { id: 'grp-cohorts', label: 'Cohorts', value: cohorts.length },
    { id: 'grp-pathways', label: 'Active Pathways', value: allPathways.filter(p => p.status === 'active').length },
  ], [totalPatients, cohorts.length, allPathways]);

  if (!group) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: colors.bg.neutral.min,
      overflow: 'hidden',
      paddingTop: LAYOUT.headerHeight,
    }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Stats grid */}
        <Dashboard metrics={stats} alerts={[]} testID="group-overview-stats" />

        {/* Cohorts list */}
        <div style={{
          padding: `${spaceAround.compact}px ${spaceAround.default}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: spaceBetween.coupled,
        }}>
          <span style={SECTION_LABEL_STYLE}>Cohorts</span>
          {cohorts.map(c => (
            <div key={c.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: `${spaceAround.tight}px 0`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.relatedCompact }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  borderRadius: borderRadius.xs,
                  backgroundColor: colors.bg.accent.subtle,
                  color: colors.fg.accent.primary,
                  flexShrink: 0,
                }}>
                  <Users size={10} />
                </span>
                <span style={{
                  fontSize: 13,
                  fontFamily: typography.fontFamily.sans,
                  color: colors.fg.neutral.primary,
                }}>
                  {c.name}
                </span>
              </div>
              <span style={{
                fontSize: 12,
                fontFamily: typography.fontFamily.sans,
                color: colors.fg.neutral.spotReadable,
              }}>
                {c.patientCount}
              </span>
            </div>
          ))}
        </div>

        {/* Pathways list */}
        {allPathways.length > 0 && (
          <div style={{
            padding: `${spaceAround.compact}px ${spaceAround.default}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: spaceBetween.coupled,
          }}>
            <span style={SECTION_LABEL_STYLE}>Pathways</span>
            {allPathways.map(p => {
              const cohort = cohorts.find(c => c.id === p.cohortId);
              return (
                <div key={p.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: `${spaceAround.tight}px 0`,
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
                    <span style={{
                      fontSize: 13,
                      fontFamily: typography.fontFamily.sans,
                      color: colors.fg.neutral.primary,
                    }}>
                      {p.name}
                    </span>
                    {(p.description || cohort) && (
                      <span style={{
                        fontSize: 11,
                        fontFamily: typography.fontFamily.sans,
                        color: colors.fg.neutral.spotReadable,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {cohort ? cohort.name : ''}{cohort && p.description ? ' · ' : ''}{p.description || ''}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontFamily: typography.fontFamily.sans,
                    fontWeight: typography.fontWeight.medium,
                    color: p.status === 'active' ? colors.fg.positive.primary : colors.fg.neutral.spotReadable,
                    textTransform: 'capitalize',
                    flexShrink: 0,
                    marginLeft: spaceBetween.relatedCompact,
                  }}>
                    {p.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

CohortGroupOverviewPane.displayName = 'CohortGroupOverviewPane';
