/**
 * PatientWorkspaceItem Component
 *
 * Expandable patient workspace tree in the menu pane.
 * Shows patient with their open workspace tabs.
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, X, FileText, Mail, Inbox, Heart, Stethoscope, LayoutGrid } from 'lucide-react';
import { colors, borderRadius, spaceAround, spaceBetween, typography, transitions } from '../../styles/foundations';
import type { WorkspaceTab, WorkspaceTabType } from '../../context/WorkspaceContext';
import { TranscriptionIndicator, recordingStatusToIndicator } from '../sidebar/TranscriptionIndicator';
import type { RecordingStatus as BottomBarRecordingStatus } from '../../state/bottomBar/types';

// ============================================================================
// Types
// ============================================================================

export interface PatientTask {
  id: string;
  title: string;
  type: 'urgent' | 'routine' | 'signoff';
}

/** Recording status for a patient workspace (simplified for patient-level display) */
export type RecordingStatus = 'recording' | 'paused' | 'processing' | 'complete' | 'none';

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
  /** Recording status for this patient's encounter (patient-level summary) */
  recordingStatus?: RecordingStatus;
  /**
   * Recording status by tab ID (for encounter-level indicators).
   * Map of tabId -> RecordingStatus from bottomBar state.
   * Used to show indicators on visit tabs.
   */
  tabRecordingStatuses?: Record<string, BottomBarRecordingStatus>;
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
  recordingStatus = 'none',
  tabRecordingStatuses = {},
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
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);

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
    backgroundColor: isSelected
      ? colors.bg.accent.subtle
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
    backgroundColor: colors.bg.neutral.medium,
    borderRadius: borderRadius.full,
    opacity: showCloseOnAvatar ? 1 : 0,
    transition: `opacity 150ms ease`,
    cursor: 'pointer',
  };

  const nameStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: isSelected ? typography.fontWeight.medium : typography.fontWeight.regular,
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
    padding: `${spaceAround.nudge6}px ${spaceAround.compact}px`,
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

  const getTabIcon = (type: WorkspaceTabType, isActive: boolean) => {
    const color = isActive ? colors.fg.accent.primary : colors.fg.neutral.secondary;
    switch (type) {
      case 'overview':
        return <LayoutGrid size={14} color={color} />;
      case 'visit':
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

  const tabItemStyle = (tabId: string): React.CSSProperties => {
    const isActive = tabId === activeTabId;
    const isTabHovered = tabId === hoveredTabId;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: spaceBetween.relatedCompact,
      padding: `${spaceAround.nudge6}px ${spaceAround.compact}px`,
      paddingLeft: spaceAround.compact + 32,
      cursor: 'pointer',
      borderRadius: borderRadius.sm,
      backgroundColor: isActive
        ? colors.bg.accent.subtle
        : isTabHovered
        ? colors.bg.neutral.subtle
        : 'transparent',
      transition: `background-color ${transitions.fast}`,
    };
  };

  // Styles for tab icon / close crossfade
  const tabIconWrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: 14,
    height: 14,
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
          >
            <X size={12} color={colors.fg.neutral.secondary} />
          </span>
        </span>
        <span style={nameStyle}>{name}</span>
        {/* Recording status indicator */}
        {recordingStatus !== 'none' && (
          <TranscriptionIndicator
            status={recordingStatus === 'complete' ? 'complete' : recordingStatus}
            size="sm"
          />
        )}
        <span style={expandButtonStyle}>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </div>

      <div style={childrenContainerStyle}>
        {/* Workspace Tabs (new) */}
        {hasWorkspaceTabs && workspaceTabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isTabHovered = tab.id === hoveredTabId;
          const canClose = tab.type !== 'overview';
          const showTabClose = canClose && isTabHovered;
          return (
            <div
              key={tab.id}
              style={tabItemStyle(tab.id)}
              onClick={(e) => {
                e.stopPropagation();
                onTabClick?.(tab.id);
              }}
              onMouseEnter={() => setHoveredTabId(tab.id)}
              onMouseLeave={() => setHoveredTabId(null)}
              role="button"
              tabIndex={0}
            >
              {/* Icon / close crossfade — both in the same 14px slot */}
              <span style={tabIconWrapperStyle}>
                <span style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: showTabClose ? 0 : 1,
                  transition: 'opacity 150ms ease',
                }}>
                  {getTabIcon(tab.type, isActive)}
                </span>
                {canClose && (
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: showTabClose ? 1 : 0,
                      transition: 'opacity 150ms ease',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabClose?.(tab.id);
                    }}
                  >
                    <X size={12} color={colors.fg.neutral.secondary} />
                  </span>
                )}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontFamily: typography.fontFamily.sans,
                  fontWeight: isActive ? typography.fontWeight.medium : typography.fontWeight.regular,
                  color: isActive ? colors.fg.accent.primary : colors.fg.neutral.primary,
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </span>
              {/* Recording indicator for visit tabs */}
              {tab.type === 'visit' && tabRecordingStatuses[tab.id] && (
                <TranscriptionIndicator
                  status={recordingStatusToIndicator(tabRecordingStatuses[tab.id])}
                  size="sm"
                />
              )}
            </div>
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
