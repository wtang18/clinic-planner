/**
 * Diagnosis Association Service
 *
 * Exports all diagnosis association components.
 */

// Types
export type {
  DxAssociationConfig,
  DxAssociationResult,
  DxSuggestion,
  DxMappingRule,
  DxAssociationContext,
} from './types';

export { DEFAULT_DX_ASSOCIATION_CONFIG } from './types';

// Mapper
export {
  suggestDxAssociation,
  applyMappingRules,
  rankByPatientContext,
  DX_MAPPING_RULES,
} from './dx-mapper';

// AI Service
export { dxAssociationService } from './dx-association-service';
