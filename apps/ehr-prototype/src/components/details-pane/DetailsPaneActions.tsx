/**
 * DetailsPaneActions Component
 *
 * Context-sensitive action buttons based on item category and status.
 * "Remove from Chart" is fully functional; other actions are stubs for future phases.
 */

import React from 'react';
import { Trash2, Link, Send } from 'lucide-react';
import type { ChartItem } from '../../types/chart-items';
import { colors, spaceAround, spaceBetween, typography } from '../../styles/foundations';
import { Button } from '../primitives/Button';

// ============================================================================
// Types
// ============================================================================

export interface DetailsPaneActionsProps {
  item: ChartItem;
  onRemove: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const DetailsPaneActions: React.FC<DetailsPaneActionsProps> = ({ item, onRemove }) => {
  const [confirmRemove, setConfirmRemove] = React.useState(false);

  const handleRemoveClick = () => {
    if (confirmRemove) {
      onRemove();
    } else {
      setConfirmRemove(true);
    }
  };

  // Reset confirmation when item changes
  React.useEffect(() => {
    setConfirmRemove(false);
  }, [item.id]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: spaceBetween.repeating,
    }}>
      <h4 style={{
        fontSize: 12,
        fontWeight: typography.fontWeight.semibold,
        color: colors.fg.neutral.secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        margin: 0,
      }}>
        Actions
      </h4>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spaceBetween.coupled,
      }}>
        {/* Category-specific stub actions */}
        {getCategoryActions(item.category).map(action => (
          <Button
            key={action.label}
            variant="secondary"
            size="sm"
            leftIcon={action.icon}
            disabled
            style={{ justifyContent: 'flex-start', opacity: 0.5 }}
          >
            {action.label}
          </Button>
        ))}

        {/* Remove from Chart — always available, functional */}
        <Button
          variant={confirmRemove ? 'danger' : 'secondary'}
          size="sm"
          leftIcon={<Trash2 size={14} />}
          onClick={handleRemoveClick}
          style={{ justifyContent: 'flex-start' }}
        >
          {confirmRemove ? 'Confirm Remove' : 'Remove from Chart'}
        </Button>
      </div>
    </div>
  );
};

DetailsPaneActions.displayName = 'DetailsPaneActions';

// ============================================================================
// Category Actions (stubs for future phases)
// ============================================================================

interface ActionDef {
  label: string;
  icon: React.ReactNode;
}

function getCategoryActions(category: ChartItem['category']): ActionDef[] {
  switch (category) {
    case 'medication':
      return [
        { label: 'Associate Diagnosis', icon: <Link size={14} /> },
        { label: 'Send to Pharmacy', icon: <Send size={14} /> },
      ];
    case 'lab':
      return [
        { label: 'Associate Diagnosis', icon: <Link size={14} /> },
        { label: 'Send Requisition', icon: <Send size={14} /> },
      ];
    case 'diagnosis':
      return [
        { label: 'Associate Orders', icon: <Link size={14} /> },
      ];
    case 'imaging':
    case 'procedure':
      return [
        { label: 'Associate Diagnosis', icon: <Link size={14} /> },
        { label: 'Send Order', icon: <Send size={14} /> },
      ];
    default:
      return [];
  }
}
