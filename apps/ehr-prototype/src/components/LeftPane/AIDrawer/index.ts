/**
 * AI Drawer Components
 *
 * Full AI interaction surface for the left pane drawer view.
 */

export { AIDrawerView } from './AIDrawerView';
export type { AIDrawerViewProps } from './AIDrawerView';

export { AIContextHeader } from './AIContextHeader';
export type { AIContextHeaderProps, ContextScope } from './AIContextHeader';

export { ConversationHistory } from './ConversationHistory';
export type {
  ConversationHistoryProps,
  ConversationMessage,
  MessageType,
} from './ConversationHistory';

// Footer components (8.4)
export { AIDrawerFooter } from './AIDrawerFooter';
export type { AIDrawerFooterProps } from './AIDrawerFooter';

export { QuickActionsRow } from './QuickActionsRow';
export type { QuickActionsRowProps } from './QuickActionsRow';

export { AIDrawerInput } from './AIDrawerInput';
export type { AIDrawerInputProps } from './AIDrawerInput';
