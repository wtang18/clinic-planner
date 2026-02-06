/**
 * AI Drawer Components
 *
 * Full AI interaction surface for the left pane drawer view.
 */

export { AIDrawerView } from './AIDrawerView';
export type { AIDrawerViewProps } from './AIDrawerView';

export { AIContextHeader } from './AIContextHeader';
export type { AIContextHeaderProps, ContextScope } from './AIContextHeader';

export { SuggestionsSection } from './SuggestionsSection';
export type { SuggestionsSectionProps } from './SuggestionsSection';

export { ConversationHistory } from './ConversationHistory';
export type {
  ConversationHistoryProps,
  ConversationMessage,
  MessageType,
} from './ConversationHistory';
