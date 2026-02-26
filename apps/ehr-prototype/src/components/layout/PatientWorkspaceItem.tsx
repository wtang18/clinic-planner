/**
 * PatientWorkspaceItem Component
 *
 * Expandable patient workspace tree in the menu pane.
 * Shows patient with their open workspace tabs.
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, X, FileText, Mail, Inbox, Heart, Stethoscope, LayoutGrid, CornerDownRight } from 'lucide-react';
import { colors, borderRadius, spaceAround, spaceBetween, typography, body, transitions } from '../../styles/foundations';
import type { WorkspaceTab, WorkspaceTabType } from '../../context/WorkspaceContext';
import type { ViewContext } from '../../screens/IntakeView/intakeChecklist';
import { TranscriptionIndicator, recordingStatusToIndicator } from '../sidebar/TranscriptionIndicator';
import type { RecordingStatus as BottomBarRecordingStatus } from '../../state/bottomBar/types';
import { SpecialtyBadge } from '../primitives/SpecialtyBadge';

// ============================================================================
// Types
// ============================================================================

export interface PatientTask {
  id: string;
  title: string;
  type: 'urgent' | 'routine' | 'signoff';
}

/** Visit sub-item config for Workflow/Chart toggle. */
export interface VisitSubItemConfig {
  /** Tab ID of the visit tab that has sub-items */
  visitTabId: string;
  /** Currently active sub-item ('workflow' or 'chart') */
  activeSubItem: ViewContext;
  /** Workflow phase badge (e.g., "Triage", "Check-in") */
  workflowBadge?: { text: string; colorScheme: 'attention' | 'accent' | 'positive' };
  /** Called when a sub-item is clicked */
  onSubItemClick: (view: ViewContext) => void;
}

export interface PatientWorkspaceItemProps {
  /** Patient name */
  name: string;
  /** Patient initials (for avatar) */
  initials?: string;
  /** Avatar color */
  avatarColor?: string;
  /** Legacy: Active tasks for this patient (for backwards compatibility) */
  tasks?: PatientTask[];
  /** Workspace tabs (new) */
  workspaceTabs?: WorkspaceTab[];
  /** Active tab ID */
  activeTabId?: string;
  /** Current visit type (if any) */
  currentVisit?: string;
  /** Whether this patient is currently selected */
  isSelected?: boolean;
  /** Initial expanded state */
  defaultExpanded?: boolean;
  /**
   * Recording status by tab ID (for encounter-level indicators).
   * Map of tabId -> RecordingStatus from bottomBar state.
   * Used to show indicators on visit tabs.
   */
  tabRecordingStatuses?: Record<string, BottomBarRecordingStatus>;
  /** Visit sub-items (Workflow/Chart toggle under visit tabs) */
  visitSubItems?: VisitSubItemConfig[];
  /** Called when patient header is clicked */
  onPatientClick?: () => void;
  /** Called when a task is clicked (legacy) */
  onTaskClick?: (taskId: string) => void;
  /** Called when a tab is clicked */
  onTabClick?: (tabId: string) => void;
  /** Called when a tab close button is clicked */
  onTabClose?: (tabId: string) => void;
  /** Called when the entire workspace is closed */
  onWorkspaceClose?: () => void;
  /** Called when visit is clicked */
  onVisitClick?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const PatientWorkspaceItem: React.FC<PatientWorkspaceItemProps> = ({
  name,
  initials,
  avatarColor = colors.fg.accent.primary,
  tasks = [],
  workspaceTabs = [],
  activeTabId,
  currentVisit,
  isSelected = false,
  defaultExpanded = false,
  tabRecordingStatuses = {},
  visitSubItems = [],
  onPatientClick,
  onTaskClick,
  onTabClick,
  onTabClose,
  onWorkspaceClose,
  onVisitClick,
  style,
  testID,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isHovered, setIsHovered] = useState(false);
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);
  const [hoveredCloseTabId, setHoveredCloseTabId] = useState<string | null>(null);

  const displayInitials = initials || name.split(' ').map(n => n[0]).join('').slice(0, 2);

  // Use workspace tabs if available, otherwise fall back to legacy tasks
  const hasWorkspaceTabs = workspaceTabs.length > 0;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: isSelected && !isExpanded
      ? colors.bg.accent.low
      : isHovered
      ? colors.bg.neutral.subtle
      : 'transparent',
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}`,
    userSelect: 'none',
  };

  const expandButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.fg.neutral.spotReadable,
    flexShrink: 0,
    width: 16,
    marginLeft: 'auto', // Push chevron to right
  };

  // Whether to show close icon in place of avatar (on hover when closeable)
  const showCloseOnAvatar = isHovered && !!onWorkspaceClose;

  const avatarWrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: 24,
    height: 24,
    flexShrink: 0,
  };

  const avatarStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    backgroundColor: avatarColor,
    borderRadius: borderRadius.full,
    color: colors.fg.neutral.inversePrimary,
    fontSize: 10,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    opacity: showCloseOnAvatar ? 0 : 1,
    transition: `opacity 150ms ease`,
  };

  const avatarCloseStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    backgroundColor: isCloseHovered
      ? colors.bg.transparent.low
      : colors.bg.transparent.subtle,
    borderRadius: borderRadius.full,
    opacity: showCloseOnAvatar ? 1 : 0,
    transition: `opacity 150ms ease, background-color ${transitions.fast}`,
    cursor: 'pointer',
  };

  const nameStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.regular,
    color: isSelected ? colors.fg.accent.primary : colors.fg.neutral.primary,
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const childrenContainerStyle: React.CSSProperties = {
    display: isExpanded ? 'flex' : 'none',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
    paddingTop: spaceBetween.coupled,
  };

  const childItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    paddingLeft: spaceAround.compact + 32, // Indent for avatar + chevron
    cursor: 'pointer',
    borderRadius: borderRadius.sm,
    transition: `background-color ${transitions.fast}`,
  };

  const handleHeaderClick = () => {
    setIsExpanded(!isExpanded);
    onPatientClick?.();
  };

  const getTaskIcon = (type: PatientTask['type']) => {
    switch (type) {
      case 'urgent':
        return <FileText size={14} color={colors.fg.alert.secondary} />;
      case 'signoff':
        return <FileText size={14} color={colors.fg.attention.secondary} />;
      default:
        return <FileText size={14} color={colors.fg.neutral.secondary} />;
    }
  };

  const getTabIcon = (tab: WorkspaceTab, isActive: boolean) => {
    const color = isActive ? colors.fg.accent.primary : colors.fg.neutral.secondary;
    switch (tab.type) {
      case 'overview':
        return <LayoutGrid size={14} color={color} />;
      case 'visit':
        // Use SpecialtyBadge when specialty is set, otherwise fall back to Stethoscope
        if (tab.specialty) {
          return <SpecialtyBadge specialty={tab.specialty} size="xs" />;
        }
        return <Stethoscope size={14} color={color} />;
      case 'task':
        return <FileText size={14} color={color} />;
      case 'fax':
        return <Inbox size={14} color={color} />;
      case 'message':
        return <Mail size={14} color={color} />;
      case 'care':
        return <Heart size={14} color={color} />;
      default:
        return <FileText size={14} color={color} />;
    }
  };

  const getTabIconWithRecording = (
    tab: WorkspaceTab,
    isActive: boolean,
    recordingStatus?: BottomBarRecordingStatus,
  ): React.ReactNode => {
    if (tab.type !== 'visit' || !recordingStatus) {
      return getTabIcon(tab, isActive);
    }
    const indicatorStatus = recordingStatusToIndicator(recordingStatus);
    if (indicatorStatus === 'none') {
      return getTabIcon(tab, isActive);
    }
    return <TranscriptionIndicator status={indicatorStatus} size="md" />;
  };

  const tabItemStyle = (tabId: string, hasSubItems: boolean): React.CSSProperties => {
    const isActive = isSelected && tabId === activeTabId;
    const isTabHovered = tabId === hoveredTabId;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: spaceBetween.relatedCompact,
      padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
      paddingLeft: spaceAround.compact,
      cursor: 'pointer',
      borderRadius: borderRadius.sm,
      backgroundColor: isActive
        ? (hasSubItems ? 'transparent' : colors.bg.accent.low)
        : isTabHovered
        ? colors.bg.neutral.subtle
        : 'transparent',
      transition: `background-color ${transitions.fast}`,
    };
  };

  // Close column — 24px wide, aligned under avatar
  const tabCloseColStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 16,
    flexShrink: 0,
  };

  // Icon column — 16px, always visible
  const tabIconStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    flexShrink: 0,
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      <div
        style={headerStyle}
        onClick={handleHeaderClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleHeaderClick();
          }
        }}
      >
        {/* Avatar / close crossfade — both occupy the same 24px slot */}
        <span style={avatarWrapperStyle}>
          <span style={avatarStyle}>{displayInitials}</span>
          <span
            style={avatarCloseStyle}
            onClick={(e) => {
              e.stopPropagation();
              onWorkspaceClose?.();
            }}
            onMouseEnter={() => setIsCloseHovered(true)}
            onMouseLeave={() => setIsCloseHovered(false)}
          >
            <X size={12} color={colors.fg.neutral.secondary} />
          </span>
        </span>
        <span style={nameStyle}>{name}</span>
        <span style={expandButtonStyle}>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </div>

      <div style={childrenContainerStyle}>
        {/* Workspace Tabs (new) */}
        {hasWorkspaceTabs && workspaceTabs.map((tab) => {
          const isActive = isSelected && tab.id === activeTabId;
          const isTabHovered = tab.id === hoveredTabId;
          const canClose = tab.type !== 'overview';
          const showTabClose = canClose && isTabHovered;
          const subItemConfig = visitSubItems.find((s) => s.visitTabId === tab.id);
          const hasSubItems = !!subItemConfig;
          return (
            <React.Fragment key={tab.id}>
              <div
                style={tabItemStyle(tab.id, hasSubItems)}
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClick?.(tab.id);
                }}
                onMouseEnter={() => setHoveredTabId(tab.id)}
                onMouseLeave={() => setHoveredTabId(null)}
                role="button"
                tabIndex={0}
              >
                {/* Close column — 24px wide, aligned under avatar */}
                <span style={tabCloseColStyle}>
                  {canClose && isTabHovered && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24,
                        backgroundColor: hoveredCloseTabId === tab.id
                          ? colors.bg.transparent.low
                          : colors.bg.transparent.subtle,
                        borderRadius: borderRadius.full,
                        cursor: 'pointer',
                        transition: `background-color ${transitions.fast}`,
                      }}
                      onClick={(e) => { e.stopPropagation(); onTabClose?.(tab.id); }}
                      onMouseEnter={() => setHoveredCloseTabId(tab.id)}
                      onMouseLeave={() => setHoveredCloseTabId(null)}
                    >
                      <X size={12} color={colors.fg.neutral.secondary} />
                    </span>
                  )}
                </span>
                {/* Icon — always visible */}
                <span style={tabIconStyle}>
                  {getTabIconWithRecording(tab, isActive, tabRecordingStatuses[tab.id])}
                </span>
                <span
                  style={{
                    fontSize: body.sm.regular.fontSize,
                    fontFamily: typography.fontFamily.sans,
                    fontWeight: body.sm.regular.fontWeight,
                    color: isActive ? colors.fg.accent.primary : colors.fg.neutral.primary,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </span>
                {/* Workflow phase badge for visit tabs */}
                {subItemConfig?.workflowBadge && (
                  <span style={{
                    fontSize: 10,
                    fontFamily: typography.fontFamily.sans,
                    fontWeight: typography.fontWeight.medium,
                    padding: '1px 6px',
                    borderRadius: borderRadius.full,
                    backgroundColor: colors.bg.transparent.subtle,
                    color: subItemConfig.workflowBadge.colorScheme === 'positive'
                      ? colors.fg.positive.primary
                      : subItemConfig.workflowBadge.colorScheme === 'accent'
                      ? colors.fg.accent.primary
                      : colors.fg.attention.primary,
                  }}>
                    {subItemConfig.workflowBadge.text}
                  </span>
                )}
              </div>
              {/* Visit sub-items: Workflow / Chart */}
              {subItemConfig && (
                <VisitSubItems config={subItemConfig} isFocused={isSelected && tab.id === activeTabId} />
              )}
            </React.Fragment>
          );
        })}

        {/* Legacy Tasks (fallback when no workspace tabs) */}
        {!hasWorkspaceTabs && tasks.map((task) => (
          <div
            key={task.id}
            style={childItemStyle}
            onClick={(e) => {
              e.stopPropagation();
              onTaskClick?.(task.id);
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = colors.bg.neutral.subtle;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
            role="button"
            tabIndex={0}
          >
            {getTaskIcon(task.type)}
            <span
              style={{
                fontSize: 13,
                fontFamily: typography.fontFamily.sans,
                color: colors.fg.neutral.primary,
              }}
            >
              {task.title}
            </span>
          </div>
        ))}

        {/* Current Visit (shown alongside legacy tasks only) */}
        {!hasWorkspaceTabs && currentVisit && (
          <div
            style={childItemStyle}
            onClick={(e) => {
              e.stopPropagation();
              onVisitClick?.();
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = colors.bg.neutral.subtle;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
            role="button"
            tabIndex={0}
          >
            <Stethoscope size={14} color={colors.fg.positive.secondary} />
            <span
              style={{
                fontSize: 13,
                fontFamily: typography.fontFamily.sans,
                color: colors.fg.neutral.primary,
              }}
            >
              Visit: {currentVisit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

PatientWorkspaceItem.displayName = 'PatientWorkspaceItem';

// ============================================================================
// Visit Sub-Items (Workflow / Chart connectors)
// ============================================================================

const SUB_ITEM_LABELS: { view: ViewContext; label: string }[] = [
  { view: 'workflow', label: 'Workflow' },
  { view: 'charting', label: 'Chart' },
];

interface VisitSubItemsProps {
  config: VisitSubItemConfig;
  /** Whether the parent workspace is the currently focused nav item */
  isFocused?: boolean;
}

const VisitSubItems: React.FC<VisitSubItemsProps> = ({ config, isFocused = true }) => {
  const [hoveredView, setHoveredView] = useState<ViewContext | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spaceBetween.coupled }}>
      {SUB_ITEM_LABELS.map(({ view, label }) => {
        const isActive = isFocused && config.activeSubItem === view;
        const isHovered = hoveredView === view;
        return (
          <div
            key={view}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spaceBetween.relatedCompact,
              padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
              paddingLeft: spaceAround.compact,
              cursor: 'pointer',
              borderRadius: borderRadius.sm,
              backgroundColor: isActive
                ? colors.bg.accent.low
                : isHovered
                ? colors.bg.neutral.subtle
                : 'transparent',
              transition: `background-color ${transitions.fast}`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              config.onSubItemClick(view);
            }}
            onMouseEnter={() => setHoveredView(view)}
            onMouseLeave={() => setHoveredView(null)}
            role="button"
            tabIndex={0}
          >
            {/* Spacer — aligns with close col / avatar */}
            <span style={{ width: 24, height: 16, flexShrink: 0 }} />
            {/* ↳ icon in 16px container */}
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 16, height: 16, flexShrink: 0,
            }}>
              <CornerDownRight size={14} color={colors.fg.neutral.spotReadable} />
            </span>
            <span style={{
              fontSize: body.sm.regular.fontSize,
              fontFamily: typography.fontFamily.sans,
              fontWeight: body.sm.regular.fontWeight,
              color: isActive ? colors.fg.accent.primary : colors.fg.neutral.primary,
            }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
