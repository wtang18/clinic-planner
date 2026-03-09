/**
 * Protocol Template Registry
 *
 * Central lookup for protocol templates. Used by protocol activation
 * flows and the ProtocolSearch component.
 */

import type { ProtocolTemplate, ProtocolTrigger } from '../../types/protocol';
import { LOW_BACK_PAIN_TEMPLATE } from './low-back-pain';
import { URI_TEMPLATE } from './uri';

// ============================================================================
// Registry
// ============================================================================

const PROTOCOL_TEMPLATES: Record<string, ProtocolTemplate> = {
  [LOW_BACK_PAIN_TEMPLATE.id]: LOW_BACK_PAIN_TEMPLATE,
  [URI_TEMPLATE.id]: URI_TEMPLATE,
};

/**
 * Get a protocol template by ID.
 */
export function getProtocolTemplate(id: string): ProtocolTemplate | undefined {
  return PROTOCOL_TEMPLATES[id];
}

/**
 * Find protocol templates matching the given trigger context.
 *
 * Returns templates sorted by match confidence (highest first).
 */
export function findMatchingProtocols(context: {
  cc?: string;
  dxCodes?: string[];
  visitType?: string;
}): Array<{ template: ProtocolTemplate; confidence: number }> {
  const results: Array<{ template: ProtocolTemplate; confidence: number }> = [];

  for (const template of Object.values(PROTOCOL_TEMPLATES)) {
    let bestConfidence = 0;

    for (const trigger of template.triggerConditions) {
      const confidence = evaluateTrigger(trigger, context);
      if (confidence > bestConfidence) {
        bestConfidence = confidence;
      }
    }

    if (bestConfidence > 0) {
      results.push({ template, confidence: bestConfidence });
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get all available protocol templates.
 */
export function getAllProtocols(): ProtocolTemplate[] {
  return Object.values(PROTOCOL_TEMPLATES);
}

// ============================================================================
// Trigger Evaluation
// ============================================================================

function evaluateTrigger(
  trigger: ProtocolTrigger,
  context: { cc?: string; dxCodes?: string[]; visitType?: string }
): number {
  switch (trigger.type) {
    case 'cc-match': {
      if (!context.cc) return 0;
      const normalized = context.cc.toLowerCase().trim();
      const target = trigger.value.toLowerCase().trim();
      // Exact match gets full confidence, substring match gets threshold
      if (normalized === target) return trigger.confidenceThreshold;
      if (normalized.includes(target) || target.includes(normalized)) {
        return trigger.confidenceThreshold * 0.8;
      }
      return 0;
    }
    case 'dx-match': {
      if (!context.dxCodes?.length) return 0;
      // Prefix match on ICD-10 codes
      const hasMatch = context.dxCodes.some(
        code => code.startsWith(trigger.value) || trigger.value.startsWith(code)
      );
      return hasMatch ? trigger.confidenceThreshold : 0;
    }
    case 'visit-type-match': {
      if (!context.visitType) return 0;
      return context.visitType.toLowerCase() === trigger.value.toLowerCase()
        ? trigger.confidenceThreshold
        : 0;
    }
    default:
      return 0;
  }
}

// Re-export templates for direct access
export { LOW_BACK_PAIN_TEMPLATE } from './low-back-pain';
export { URI_TEMPLATE } from './uri';
