/**
 * TableView Component
 *
 * Sortable data grid for population health patients.
 * Columns adapt based on active pathway.
 */

import React, { useMemo, useState, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { usePopHealth } from '../../context/PopHealthContext';
import {
  getPatientsByPathway,
  MOCK_POP_HEALTH_PATIENTS,
  PATHWAYS,
} from '../../data/mock-population-health';
import type { PathwayPatient } from '../../types/population-health';
import { FilterBar } from './FilterBar';
import { colors, spaceAround, spaceBetween, typography, borderRadius, transitions, LAYOUT } from '../../styles/foundations';

// ============================================================================
// Column Definitions
// ============================================================================

interface Column {
  key: string;
  label: string;
  width?: number;
  getValue: (patient: PathwayPatient) => string | number;
}

const BASE_COLUMNS: Column[] = [
  { key: 'name', label: 'Patient', width: 160, getValue: (p) => p.name },
  { key: 'age', label: 'Age', width: 50, getValue: (p) => p.age },
  { key: 'riskTier', label: 'Risk', width: 70, getValue: (p) => p.riskTier },
  {
    key: 'currentStage', label: 'Current Stage', width: 160,
    getValue: (p) => {
      const assignment = p.pathways[0];
      if (!assignment) return '—';
      const pathway = PATHWAYS.find((pr) => pr.id === assignment.pathwayId);
      const node = pathway?.nodes.find((n) => n.id === assignment.currentNodeId);
      return node?.label ?? '—';
    },
  },
  {
    key: 'daysInStage', label: 'Days', width: 50,
    getValue: (p) => {
      const assignment = p.pathways[0];
      if (!assignment) return 0;
      return Math.floor((Date.now() - assignment.stageEntryDate.getTime()) / 86400000);
    },
  },
  {
    key: 'status', label: 'Status', width: 80,
    getValue: (p) => p.pathways[0]?.status ?? '—',
  },
];

const PATHWAY_COLUMNS: Record<string, Column[]> = {
  'pw-diabetes-a1c': [
    { key: 'lastA1c', label: 'Last A1c', width: 70, getValue: (p) => String(p.clinicalData.lastA1c ?? '—') },
    { key: 'currentMeds', label: 'Meds', width: 180, getValue: (p) => {
      const meds = p.clinicalData.currentMeds;
      return Array.isArray(meds) ? meds.join(', ') : '—';
    }},
    { key: 'insulinStatus', label: 'Insulin', width: 100, getValue: (p) => String(p.clinicalData.insulinStatus ?? '—') },
  ],
  'pw-colon-screening': [
    { key: 'screeningType', label: 'Type', width: 100, getValue: (p) => String(p.clinicalData.screeningType ?? '—') },
    { key: 'eligibility', label: 'Eligibility', width: 100, getValue: (p) => String(p.clinicalData.eligibility ?? '—') },
    { key: 'declineCount', label: 'Declines', width: 70, getValue: (p) => String(p.clinicalData.declineCount ?? 0) },
  ],
  'pw-post-discharge': [
    { key: 'daysSinceDischarge', label: 'Days Since', width: 80, getValue: (p) => String(p.clinicalData.daysSinceDischarge ?? '—') },
    { key: 'readmissionRisk', label: 'Readmit Risk', width: 90, getValue: (p) => String(p.clinicalData.readmissionRisk ?? '—') },
    { key: 'followUpStatus', label: 'Follow-up', width: 160, getValue: (p) => String(p.clinicalData.followUpStatus ?? '—') },
  ],
};

// ============================================================================
// Types
// ============================================================================

type SortDir = 'asc' | 'desc';

// ============================================================================
// Component
// ============================================================================

export const TableView: React.FC = () => {
  const { state, dispatch } = usePopHealth();
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Get patients
  const patients = useMemo(() => {
    const pathwayId = state.selectedPathwayIds[0];
    if (pathwayId) {
      return getPatientsByPathway(pathwayId);
    }
    return MOCK_POP_HEALTH_PATIENTS;
  }, [state.selectedPathwayIds]);

  // Filter by selected node if applicable
  const filteredPatients = useMemo(() => {
    if (!state.selectedNodeId) return patients;
    return patients.filter((p) =>
      p.pathways.some((a) => a.currentNodeId === state.selectedNodeId)
    );
  }, [patients, state.selectedNodeId]);

  // Get columns
  const pathwayId = state.selectedPathwayIds[0];
  const extraColumns = pathwayId ? (PATHWAY_COLUMNS[pathwayId] ?? []) : [];
  const columns = [...BASE_COLUMNS, ...extraColumns];

  // Sort
  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filteredPatients;

    return [...filteredPatients].sort((a, b) => {
      const va = col.getValue(a);
      const vb = col.getValue(b);
      const cmp = typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredPatients, sortKey, sortDir, columns]);

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  const handleRowClick = useCallback((patientId: string) => {
    dispatch({
      type: 'DRAWER_OPENED',
      view: { type: 'patient-preview', patientId },
    });
  }, [dispatch]);

  // Status color
  const statusColor = (status: string) => {
    switch (status) {
      case 'escalated': return colors.fg.alert.primary;
      case 'stalled': return colors.fg.attention.primary;
      case 'completed': return colors.fg.positive.primary;
      default: return colors.fg.neutral.primary;
    }
  };

  return (
    <div style={tableStyles.outerContainer} data-testid="table-view">
      <FilterBar />

      <div style={tableStyles.scrollContainer}>
        <table style={tableStyles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    ...tableStyles.th,
                    width: col.width,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleSort(col.key)}
                >
                  <div style={tableStyles.thContent}>
                    <span>{col.label}</span>
                    {sortKey === col.key && (
                      sortDir === 'asc'
                        ? <ChevronUp size={12} />
                        : <ChevronDown size={12} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((patient) => (
              <tr
                key={patient.patientId}
                style={tableStyles.tr}
                onClick={() => handleRowClick(patient.patientId)}
              >
                {columns.map((col) => {
                  const value = col.getValue(patient);
                  const isStatus = col.key === 'status';

                  return (
                    <td
                      key={col.key}
                      style={{
                        ...tableStyles.td,
                        ...(col.key === 'name' ? { fontWeight: typography.fontWeight.medium } : {}),
                        ...(isStatus ? { color: statusColor(String(value)), textTransform: 'capitalize' as const } : {}),
                        ...(col.key === 'riskTier' ? { textTransform: 'capitalize' as const } : {}),
                      }}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}

            {sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={tableStyles.emptyCell}>
                  No patients match current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

TableView.displayName = 'TableView';

// ============================================================================
// Styles
// ============================================================================

const tableStyles: Record<string, React.CSSProperties> = {
  outerContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  scrollContainer: {
    flex: 1,
    overflow: 'auto',
    paddingTop: LAYOUT.headerHeight,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: typography.fontFamily.sans,
    fontSize: 13,
  },
  th: {
    position: 'sticky',
    top: 0,
    backgroundColor: colors.bg.neutral.base,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    textAlign: 'left' as const,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  thContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
  tr: {
    cursor: 'pointer',
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  },
  td: {
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    color: colors.fg.neutral.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 200,
  },
  emptyCell: {
    padding: spaceAround.default,
    textAlign: 'center' as const,
    color: colors.fg.neutral.secondary,
  },
};
