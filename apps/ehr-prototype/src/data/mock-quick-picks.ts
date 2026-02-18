/**
 * Mock quick-pick data for OmniAdd
 *
 * Context-aware quick picks for a cough encounter scenario.
 * Each category has ranked picks based on visit context (CC: cough x 5 days).
 * Items include enough detail for smart defaults in the detail form.
 */

import type { ItemCategory } from '../types/chart-items';

export interface QuickPickItem {
  id: string;
  label: string;
  /** Short display for the chip */
  chipLabel: string;
  category: ItemCategory;
  /** Pre-filled data for the detail form */
  data: Record<string, unknown>;
}

// ============================================================================
// Medications
// ============================================================================

const MEDICATION_PICKS: QuickPickItem[] = [
  {
    id: 'rx-benzonatate',
    label: 'Benzonatate 100mg',
    chipLabel: 'Benzonatate',
    category: 'medication',
    data: {
      drugName: 'Benzonatate',
      genericName: 'Benzonatate',
      dosage: '100mg',
      route: 'PO',
      frequency: 'TID PRN',
      duration: '7 days',
      quantity: 21,
      refills: 0,
      isControlled: false,
      prescriptionType: 'new',
    },
  },
  {
    id: 'rx-dextromethorphan',
    label: 'Dextromethorphan 30mg',
    chipLabel: 'Dextromethor.',
    category: 'medication',
    data: {
      drugName: 'Dextromethorphan',
      genericName: 'Dextromethorphan HBr',
      dosage: '30mg',
      route: 'PO',
      frequency: 'Q6-8H PRN',
      duration: '7 days',
      quantity: 28,
      refills: 0,
      isControlled: false,
      prescriptionType: 'new',
    },
  },
  {
    id: 'rx-guaifenesin',
    label: 'Guaifenesin 400mg',
    chipLabel: 'Guaifenesin',
    category: 'medication',
    data: {
      drugName: 'Guaifenesin',
      genericName: 'Guaifenesin',
      dosage: '400mg',
      route: 'PO',
      frequency: 'Q4H PRN',
      duration: '7 days',
      quantity: 42,
      refills: 0,
      isControlled: false,
      prescriptionType: 'new',
    },
  },
  {
    id: 'rx-codeine-guaifenesin',
    label: 'Codeine/Guaifenesin 10-100mg/5mL',
    chipLabel: 'Codeine/Guaif.',
    category: 'medication',
    data: {
      drugName: 'Codeine/Guaifenesin',
      genericName: 'Codeine Phosphate/Guaifenesin',
      dosage: '10-100mg/5mL',
      route: 'PO',
      frequency: 'Q4-6H PRN',
      duration: '5 days',
      quantity: 150,
      refills: 0,
      isControlled: true,
      controlSchedule: 'V',
      prescriptionType: 'new',
    },
  },
  {
    id: 'rx-amoxicillin',
    label: 'Amoxicillin 500mg',
    chipLabel: 'Amoxicillin',
    category: 'medication',
    data: {
      drugName: 'Amoxicillin',
      genericName: 'Amoxicillin',
      dosage: '500mg',
      route: 'PO',
      frequency: 'TID',
      duration: '10 days',
      quantity: 30,
      refills: 0,
      isControlled: false,
      prescriptionType: 'new',
    },
  },
  {
    id: 'rx-azithromycin',
    label: 'Azithromycin 250mg (Z-Pack)',
    chipLabel: 'Azithromycin',
    category: 'medication',
    data: {
      drugName: 'Azithromycin',
      genericName: 'Azithromycin',
      dosage: '250mg',
      route: 'PO',
      frequency: 'See Sig',
      duration: '5 days',
      quantity: 6,
      refills: 0,
      isControlled: false,
      prescriptionType: 'new',
    },
  },
  {
    id: 'rx-albuterol-inhaler',
    label: 'Albuterol HFA 90mcg',
    chipLabel: 'Albuterol',
    category: 'medication',
    data: {
      drugName: 'Albuterol HFA',
      genericName: 'Albuterol Sulfate',
      dosage: '90mcg/actuation',
      route: 'Inhalation',
      frequency: 'Q4-6H PRN',
      duration: '30 days',
      quantity: 1,
      refills: 1,
      isControlled: false,
      prescriptionType: 'new',
    },
  },
  {
    id: 'rx-prednisone',
    label: 'Prednisone 20mg',
    chipLabel: 'Prednisone',
    category: 'medication',
    data: {
      drugName: 'Prednisone',
      genericName: 'Prednisone',
      dosage: '20mg',
      route: 'PO',
      frequency: 'daily',
      duration: '5 days',
      quantity: 5,
      refills: 0,
      isControlled: false,
      prescriptionType: 'new',
    },
  },
  {
    id: 'rx-ibuprofen',
    label: 'Ibuprofen 400mg',
    chipLabel: 'Ibuprofen',
    category: 'medication',
    data: {
      drugName: 'Ibuprofen',
      genericName: 'Ibuprofen',
      dosage: '400mg',
      route: 'PO',
      frequency: 'TID PRN',
      duration: '7 days',
      quantity: 21,
      refills: 0,
      isControlled: false,
      prescriptionType: 'new',
    },
  },
  {
    id: 'rx-acetaminophen',
    label: 'Acetaminophen 500mg',
    chipLabel: 'Acetaminophen',
    category: 'medication',
    data: {
      drugName: 'Acetaminophen',
      genericName: 'Acetaminophen',
      dosage: '500mg',
      route: 'PO',
      frequency: 'Q4-6H PRN',
      duration: '7 days',
      quantity: 35,
      refills: 0,
      isControlled: false,
      prescriptionType: 'new',
    },
  },
  {
    id: 'rx-pseudoephedrine',
    label: 'Pseudoephedrine 30mg',
    chipLabel: 'Pseudoephed.',
    category: 'medication',
    data: {
      drugName: 'Pseudoephedrine',
      genericName: 'Pseudoephedrine HCl',
      dosage: '30mg',
      route: 'PO',
      frequency: 'Q4-6H PRN',
      duration: '7 days',
      quantity: 35,
      refills: 0,
      isControlled: false,
      prescriptionType: 'new',
    },
  },
  {
    id: 'rx-omeprazole',
    label: 'Omeprazole 20mg',
    chipLabel: 'Omeprazole',
    category: 'medication',
    data: {
      drugName: 'Omeprazole',
      genericName: 'Omeprazole',
      dosage: '20mg',
      route: 'PO',
      frequency: 'daily',
      duration: '30 days',
      quantity: 30,
      refills: 3,
      isControlled: false,
      prescriptionType: 'new',
    },
  },
  {
    id: 'rx-ondansetron',
    label: 'Ondansetron 4mg ODT',
    chipLabel: 'Ondansetron',
    category: 'medication',
    data: {
      drugName: 'Ondansetron ODT',
      genericName: 'Ondansetron',
      dosage: '4mg',
      route: 'PO',
      frequency: 'Q8H PRN',
      duration: '5 days',
      quantity: 15,
      refills: 0,
      isControlled: false,
      prescriptionType: 'new',
    },
  },
  {
    id: 'rx-loratadine',
    label: 'Loratadine 10mg',
    chipLabel: 'Loratadine',
    category: 'medication',
    data: {
      drugName: 'Loratadine',
      genericName: 'Loratadine',
      dosage: '10mg',
      route: 'PO',
      frequency: 'daily',
      duration: '30 days',
      quantity: 30,
      refills: 3,
      isControlled: false,
      prescriptionType: 'new',
    },
  },
  {
    id: 'rx-diphenhydramine',
    label: 'Diphenhydramine 25mg',
    chipLabel: 'Benadryl',
    category: 'medication',
    data: {
      drugName: 'Diphenhydramine',
      genericName: 'Diphenhydramine HCl',
      dosage: '25mg',
      route: 'PO',
      frequency: 'Q6H PRN',
      duration: '7 days',
      quantity: 28,
      refills: 0,
      isControlled: false,
      prescriptionType: 'new',
    },
  },
];

// ============================================================================
// Labs
// ============================================================================

const LAB_PICKS: QuickPickItem[] = [
  {
    id: 'lab-covid',
    label: 'Rapid COVID-19 Antigen',
    chipLabel: 'COVID-19',
    category: 'lab',
    data: {
      testName: 'SARS-CoV-2 Antigen',
      testCode: '94558-4',
      priority: 'stat',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  },
  {
    id: 'lab-flu',
    label: 'Rapid Influenza A/B',
    chipLabel: 'Flu A/B',
    category: 'lab',
    data: {
      testName: 'Rapid Influenza A/B',
      testCode: '80382-5',
      priority: 'stat',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  },
  {
    id: 'lab-strep',
    label: 'Rapid Strep (Group A)',
    chipLabel: 'Strep',
    category: 'lab',
    data: {
      testName: 'Rapid Strep Group A',
      testCode: '78012-2',
      priority: 'stat',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  },
  {
    id: 'lab-cbc',
    label: 'CBC with Differential',
    chipLabel: 'CBC',
    category: 'lab',
    data: {
      testName: 'Complete Blood Count with Differential',
      testCode: '58410-2',
      panelName: 'CBC',
      priority: 'routine',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  },
  {
    id: 'lab-cmp',
    label: 'Comprehensive Metabolic Panel',
    chipLabel: 'CMP',
    category: 'lab',
    data: {
      testName: 'Comprehensive Metabolic Panel',
      testCode: '24323-8',
      panelName: 'CMP',
      priority: 'routine',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  },
  {
    id: 'lab-chest-xray-followup',
    label: 'Procalcitonin',
    chipLabel: 'Procalcitonin',
    category: 'lab',
    data: {
      testName: 'Procalcitonin',
      testCode: '75241-0',
      priority: 'routine',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  },
  {
    id: 'lab-crp',
    label: 'C-Reactive Protein',
    chipLabel: 'CRP',
    category: 'lab',
    data: {
      testName: 'C-Reactive Protein',
      testCode: '1988-5',
      priority: 'routine',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  },
  {
    id: 'lab-bnp',
    label: 'BNP (B-type Natriuretic Peptide)',
    chipLabel: 'BNP',
    category: 'lab',
    data: {
      testName: 'B-type Natriuretic Peptide',
      testCode: '42637-9',
      priority: 'urgent',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  },
  {
    id: 'lab-troponin',
    label: 'Troponin I, High Sensitivity',
    chipLabel: 'Troponin',
    category: 'lab',
    data: {
      testName: 'Troponin I, High Sensitivity',
      testCode: '89579-7',
      priority: 'stat',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  },
  {
    id: 'lab-d-dimer',
    label: 'D-Dimer, Quantitative',
    chipLabel: 'D-Dimer',
    category: 'lab',
    data: {
      testName: 'D-Dimer, Quantitative',
      testCode: '48066-5',
      priority: 'urgent',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  },
  {
    id: 'lab-urinalysis',
    label: 'Urinalysis with Microscopy',
    chipLabel: 'UA',
    category: 'lab',
    data: {
      testName: 'Urinalysis with Microscopy',
      testCode: '24356-8',
      priority: 'routine',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  },
  {
    id: 'lab-lipid',
    label: 'Lipid Panel',
    chipLabel: 'Lipid Panel',
    category: 'lab',
    data: {
      testName: 'Lipid Panel',
      testCode: '24331-1',
      panelName: 'Lipid',
      priority: 'routine',
      collectionType: 'in-house',
      fastingRequired: true,
      orderStatus: 'draft',
    },
  },
  {
    id: 'lab-tsh',
    label: 'TSH (Thyroid Stimulating Hormone)',
    chipLabel: 'TSH',
    category: 'lab',
    data: {
      testName: 'Thyroid Stimulating Hormone',
      testCode: '11580-8',
      priority: 'routine',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  },
  {
    id: 'lab-blood-culture',
    label: 'Blood Culture (Aerobic/Anaerobic)',
    chipLabel: 'Blood Cx',
    category: 'lab',
    data: {
      testName: 'Blood Culture, Aerobic and Anaerobic',
      testCode: '600-7',
      priority: 'stat',
      collectionType: 'in-house',
      specialInstructions: 'Collect 2 sets from 2 separate sites',
      orderStatus: 'draft',
    },
  },
  {
    id: 'lab-mono',
    label: 'Mono Spot (Heterophile Ab)',
    chipLabel: 'Mono Spot',
    category: 'lab',
    data: {
      testName: 'Monospot (Heterophile Antibody)',
      testCode: '31418-7',
      priority: 'routine',
      collectionType: 'in-house',
      orderStatus: 'draft',
    },
  },
];

// ============================================================================
// Diagnoses
// ============================================================================

const DIAGNOSIS_PICKS: QuickPickItem[] = [
  {
    id: 'dx-acute-bronchitis',
    label: 'Acute bronchitis (J20.9)',
    chipLabel: 'Acute bronchitis',
    category: 'diagnosis',
    data: {
      description: 'Acute bronchitis, unspecified',
      icdCode: 'J20.9',
      type: 'encounter',
      ranking: 'primary',
      clinicalStatus: 'active',
    },
  },
  {
    id: 'dx-uri',
    label: 'Upper respiratory infection (J06.9)',
    chipLabel: 'URI',
    category: 'diagnosis',
    data: {
      description: 'Acute upper respiratory infection, unspecified',
      icdCode: 'J06.9',
      type: 'encounter',
      clinicalStatus: 'active',
    },
  },
  {
    id: 'dx-cough',
    label: 'Cough, unspecified (R05.9)',
    chipLabel: 'Cough',
    category: 'diagnosis',
    data: {
      description: 'Cough, unspecified',
      icdCode: 'R05.9',
      type: 'encounter',
      clinicalStatus: 'active',
    },
  },
  {
    id: 'dx-pneumonia',
    label: 'Pneumonia, unspecified (J18.9)',
    chipLabel: 'Pneumonia',
    category: 'diagnosis',
    data: {
      description: 'Pneumonia, unspecified organism',
      icdCode: 'J18.9',
      type: 'encounter',
      clinicalStatus: 'active',
    },
  },
  {
    id: 'dx-sinusitis',
    label: 'Acute sinusitis (J01.90)',
    chipLabel: 'Sinusitis',
    category: 'diagnosis',
    data: {
      description: 'Acute sinusitis, unspecified',
      icdCode: 'J01.90',
      type: 'encounter',
      clinicalStatus: 'active',
    },
  },
  {
    id: 'dx-pharyngitis',
    label: 'Acute pharyngitis (J02.9)',
    chipLabel: 'Pharyngitis',
    category: 'diagnosis',
    data: {
      description: 'Acute pharyngitis, unspecified',
      icdCode: 'J02.9',
      type: 'encounter',
      clinicalStatus: 'active',
    },
  },
  {
    id: 'dx-asthma-exacerbation',
    label: 'Asthma exacerbation (J45.901)',
    chipLabel: 'Asthma exac.',
    category: 'diagnosis',
    data: {
      description: 'Unspecified asthma with (acute) exacerbation',
      icdCode: 'J45.901',
      type: 'encounter',
      clinicalStatus: 'active',
    },
  },
  {
    id: 'dx-pertussis',
    label: 'Whooping cough, unspecified (A37.90)',
    chipLabel: 'Pertussis',
    category: 'diagnosis',
    data: {
      description: 'Whooping cough, unspecified species without pneumonia',
      icdCode: 'A37.90',
      type: 'encounter',
      clinicalStatus: 'active',
    },
  },
  {
    id: 'dx-gerd',
    label: 'GERD (K21.0)',
    chipLabel: 'GERD',
    category: 'diagnosis',
    data: {
      description: 'Gastro-esophageal reflux disease with esophagitis',
      icdCode: 'K21.0',
      type: 'chronic',
      clinicalStatus: 'active',
    },
  },
  {
    id: 'dx-postnasal-drip',
    label: 'Postnasal drip (R09.82)',
    chipLabel: 'Post-nasal drip',
    category: 'diagnosis',
    data: {
      description: 'Postnasal drip',
      icdCode: 'R09.82',
      type: 'encounter',
      clinicalStatus: 'active',
    },
  },
  {
    id: 'dx-laryngitis',
    label: 'Acute laryngitis (J04.0)',
    chipLabel: 'Laryngitis',
    category: 'diagnosis',
    data: {
      description: 'Acute laryngitis',
      icdCode: 'J04.0',
      type: 'encounter',
      clinicalStatus: 'active',
    },
  },
  {
    id: 'dx-tracheobronchitis',
    label: 'Acute tracheobronchitis (J06.9)',
    chipLabel: 'Tracheobronch.',
    category: 'diagnosis',
    data: {
      description: 'Acute upper respiratory infection, unspecified',
      icdCode: 'J06.9',
      type: 'encounter',
      clinicalStatus: 'active',
    },
  },
  {
    id: 'dx-allergic-rhinitis',
    label: 'Allergic rhinitis, unspecified (J30.9)',
    chipLabel: 'Allergic rhinitis',
    category: 'diagnosis',
    data: {
      description: 'Allergic rhinitis, unspecified',
      icdCode: 'J30.9',
      type: 'chronic',
      clinicalStatus: 'active',
    },
  },
  {
    id: 'dx-pleurisy',
    label: 'Pleurisy (R09.1)',
    chipLabel: 'Pleurisy',
    category: 'diagnosis',
    data: {
      description: 'Pleurisy',
      icdCode: 'R09.1',
      type: 'encounter',
      clinicalStatus: 'active',
    },
  },
  {
    id: 'dx-viral-pneumonia',
    label: 'Viral pneumonia, unspecified (J12.9)',
    chipLabel: 'Viral pneumonia',
    category: 'diagnosis',
    data: {
      description: 'Viral pneumonia, unspecified',
      icdCode: 'J12.9',
      type: 'encounter',
      clinicalStatus: 'active',
    },
  },
];

// ============================================================================
// Imaging
// ============================================================================

const IMAGING_PICKS: QuickPickItem[] = [
  {
    id: 'img-chest-xray',
    label: 'Chest X-ray PA/Lateral',
    chipLabel: 'Chest X-ray',
    category: 'imaging',
    data: {
      studyType: 'X-ray',
      bodyPart: 'Chest',
      indication: 'Cough, rule out pneumonia',
      priority: 'routine',
      requiresAuth: false,
      orderStatus: 'draft',
    },
  },
  {
    id: 'img-chest-ct',
    label: 'CT Chest without contrast',
    chipLabel: 'Chest CT',
    category: 'imaging',
    data: {
      studyType: 'CT',
      bodyPart: 'Chest',
      indication: 'Persistent cough, evaluate for pulmonary pathology',
      priority: 'routine',
      requiresAuth: true,
      orderStatus: 'draft',
    },
  },
  {
    id: 'img-chest-ct-contrast',
    label: 'CT Chest with contrast',
    chipLabel: 'Chest CT (c)',
    category: 'imaging',
    data: {
      studyType: 'CT',
      bodyPart: 'Chest',
      indication: 'Cough with hemoptysis, evaluate for mass or PE',
      priority: 'urgent',
      requiresAuth: true,
      orderStatus: 'draft',
    },
  },
  {
    id: 'img-sinus-ct',
    label: 'CT Sinuses without contrast',
    chipLabel: 'Sinus CT',
    category: 'imaging',
    data: {
      studyType: 'CT',
      bodyPart: 'Sinuses',
      indication: 'Chronic cough, evaluate for sinusitis',
      priority: 'routine',
      requiresAuth: true,
      orderStatus: 'draft',
    },
  },
  {
    id: 'img-portable-cxr',
    label: 'Portable Chest X-ray AP',
    chipLabel: 'Portable CXR',
    category: 'imaging',
    data: {
      studyType: 'X-ray',
      bodyPart: 'Chest',
      indication: 'Acute respiratory distress, bedside evaluation',
      priority: 'stat',
      requiresAuth: false,
      orderStatus: 'draft',
    },
  },
  {
    id: 'img-chest-us',
    label: 'Chest Ultrasound',
    chipLabel: 'Chest US',
    category: 'imaging',
    data: {
      studyType: 'Ultrasound',
      bodyPart: 'Chest',
      indication: 'Evaluate for pleural effusion',
      priority: 'routine',
      requiresAuth: false,
      orderStatus: 'draft',
    },
  },
];

// ============================================================================
// Procedures
// ============================================================================

const PROCEDURE_PICKS: QuickPickItem[] = [
  {
    id: 'proc-rapid-strep',
    label: 'Rapid Strep Test',
    chipLabel: 'Rapid Strep',
    category: 'procedure',
    data: {
      procedureName: 'Rapid Strep Test',
      cptCode: '87880',
      indication: 'Sore throat, rule out streptococcal pharyngitis',
      procedureStatus: 'planned',
    },
  },
  {
    id: 'proc-nebulizer',
    label: 'Nebulizer Treatment',
    chipLabel: 'Nebulizer',
    category: 'procedure',
    data: {
      procedureName: 'Nebulizer Treatment',
      cptCode: '94640',
      indication: 'Wheezing, acute bronchospasm',
      procedureStatus: 'planned',
    },
  },
  {
    id: 'proc-pulse-ox',
    label: 'Pulse Oximetry',
    chipLabel: 'Pulse Ox',
    category: 'procedure',
    data: {
      procedureName: 'Pulse Oximetry',
      cptCode: '94760',
      indication: 'Respiratory assessment',
      procedureStatus: 'planned',
    },
  },
  {
    id: 'proc-spirometry',
    label: 'Spirometry',
    chipLabel: 'Spirometry',
    category: 'procedure',
    data: {
      procedureName: 'Spirometry',
      cptCode: '94010',
      indication: 'Chronic cough, evaluate for obstructive vs restrictive disease',
      procedureStatus: 'planned',
    },
  },
  {
    id: 'proc-peak-flow',
    label: 'Peak Flow Measurement',
    chipLabel: 'Peak Flow',
    category: 'procedure',
    data: {
      procedureName: 'Peak Flow Measurement',
      cptCode: '94150',
      indication: 'Asthma assessment, monitor airway function',
      procedureStatus: 'planned',
    },
  },
  {
    id: 'proc-throat-culture',
    label: 'Throat Culture Collection',
    chipLabel: 'Throat Cx',
    category: 'procedure',
    data: {
      procedureName: 'Throat Culture Collection',
      cptCode: '87070',
      indication: 'Pharyngitis, confirm Group A strep',
      procedureStatus: 'planned',
    },
  },
];

// ============================================================================
// Allergy (common quick-picks)
// ============================================================================

const ALLERGY_PICKS: QuickPickItem[] = [
  {
    id: 'allergy-nkda',
    label: 'NKDA (No Known Drug Allergies)',
    chipLabel: 'NKDA',
    category: 'allergy',
    data: {
      allergen: 'No Known Drug Allergies',
      allergenType: 'drug',
      severity: 'unknown',
      reportedBy: 'patient',
      verificationStatus: 'confirmed',
    },
  },
  {
    id: 'allergy-penicillin',
    label: 'Penicillin',
    chipLabel: 'Penicillin',
    category: 'allergy',
    data: {
      allergen: 'Penicillin',
      allergenType: 'drug',
      severity: 'moderate',
      reportedBy: 'patient',
      verificationStatus: 'unverified',
    },
  },
  {
    id: 'allergy-sulfa',
    label: 'Sulfonamides',
    chipLabel: 'Sulfa',
    category: 'allergy',
    data: {
      allergen: 'Sulfonamides',
      allergenType: 'drug',
      severity: 'moderate',
      reportedBy: 'patient',
      verificationStatus: 'unverified',
    },
  },
  {
    id: 'allergy-aspirin',
    label: 'Aspirin / NSAIDs',
    chipLabel: 'Aspirin',
    category: 'allergy',
    data: {
      allergen: 'Aspirin / NSAIDs',
      allergenType: 'drug',
      reaction: 'GI upset, bronchospasm',
      severity: 'moderate',
      reportedBy: 'patient',
      verificationStatus: 'unverified',
    },
  },
  {
    id: 'allergy-codeine',
    label: 'Codeine',
    chipLabel: 'Codeine',
    category: 'allergy',
    data: {
      allergen: 'Codeine',
      allergenType: 'drug',
      reaction: 'Nausea, rash',
      severity: 'mild',
      reportedBy: 'patient',
      verificationStatus: 'unverified',
    },
  },
  {
    id: 'allergy-latex',
    label: 'Latex',
    chipLabel: 'Latex',
    category: 'allergy',
    data: {
      allergen: 'Latex',
      allergenType: 'environmental',
      reaction: 'Hives, swelling',
      severity: 'severe',
      reportedBy: 'patient',
      verificationStatus: 'confirmed',
    },
  },
  {
    id: 'allergy-peanuts',
    label: 'Peanuts',
    chipLabel: 'Peanuts',
    category: 'allergy',
    data: {
      allergen: 'Peanuts',
      allergenType: 'food',
      reaction: 'Anaphylaxis',
      severity: 'severe',
      reportedBy: 'patient',
      verificationStatus: 'confirmed',
    },
  },
  {
    id: 'allergy-shellfish',
    label: 'Shellfish',
    chipLabel: 'Shellfish',
    category: 'allergy',
    data: {
      allergen: 'Shellfish',
      allergenType: 'food',
      reaction: 'Hives, GI upset',
      severity: 'moderate',
      reportedBy: 'patient',
      verificationStatus: 'unverified',
    },
  },
];

// ============================================================================
// Referral quick-picks
// ============================================================================

const REFERRAL_PICKS: QuickPickItem[] = [
  {
    id: 'ref-pulmonology',
    label: 'Pulmonology',
    chipLabel: 'Pulmonology',
    category: 'referral',
    data: {
      specialty: 'Pulmonology',
      reason: 'Persistent cough, evaluate for underlying pulmonary pathology',
      urgency: 'routine',
      referralStatus: 'draft',
      requiresAuth: false,
    },
  },
  {
    id: 'ref-ent',
    label: 'ENT (Otolaryngology)',
    chipLabel: 'ENT',
    category: 'referral',
    data: {
      specialty: 'Otolaryngology',
      reason: 'Chronic cough, post-nasal drip',
      urgency: 'routine',
      referralStatus: 'draft',
      requiresAuth: false,
    },
  },
  {
    id: 'ref-allergist',
    label: 'Allergy/Immunology',
    chipLabel: 'Allergist',
    category: 'referral',
    data: {
      specialty: 'Allergy/Immunology',
      reason: 'Recurrent respiratory symptoms, evaluate for allergic etiology',
      urgency: 'routine',
      referralStatus: 'draft',
      requiresAuth: false,
    },
  },
  {
    id: 'ref-gi',
    label: 'Gastroenterology',
    chipLabel: 'GI',
    category: 'referral',
    data: {
      specialty: 'Gastroenterology',
      reason: 'Chronic cough possibly GERD-related, evaluate for reflux disease',
      urgency: 'routine',
      referralStatus: 'draft',
      requiresAuth: true,
    },
  },
  {
    id: 'ref-cardiology',
    label: 'Cardiology',
    chipLabel: 'Cardiology',
    category: 'referral',
    data: {
      specialty: 'Cardiology',
      reason: 'Cough with exertional dyspnea, evaluate for cardiac etiology',
      urgency: 'urgent',
      referralStatus: 'draft',
      requiresAuth: true,
    },
  },
  {
    id: 'ref-sleep',
    label: 'Sleep Medicine',
    chipLabel: 'Sleep',
    category: 'referral',
    data: {
      specialty: 'Sleep Medicine',
      reason: 'Nocturnal cough, evaluate for sleep-disordered breathing',
      urgency: 'routine',
      referralStatus: 'draft',
      requiresAuth: true,
    },
  },
];

// ============================================================================
// Export: get quick picks by category
// ============================================================================

const QUICK_PICKS: Partial<Record<ItemCategory, QuickPickItem[]>> = {
  'medication': MEDICATION_PICKS,
  'lab': LAB_PICKS,
  'diagnosis': DIAGNOSIS_PICKS,
  'imaging': IMAGING_PICKS,
  'procedure': PROCEDURE_PICKS,
  'allergy': ALLERGY_PICKS,
  'referral': REFERRAL_PICKS,
};

export function getQuickPicks(category: ItemCategory): QuickPickItem[] {
  return QUICK_PICKS[category] ?? [];
}

/**
 * Search across all categories (for keyboard root-level search).
 * Returns items matching the query across all categories.
 */
export function searchAllCategories(query: string): QuickPickItem[] {
  if (!query || query.length < 2) return [];
  const lower = query.toLowerCase();
  const results: QuickPickItem[] = [];
  for (const items of Object.values(QUICK_PICKS)) {
    if (!items) continue;
    for (const item of items) {
      if (item.label.toLowerCase().includes(lower) || item.chipLabel.toLowerCase().includes(lower)) {
        results.push(item);
      }
    }
  }
  return results;
}

/**
 * Search within a specific category.
 */
export function searchCategory(category: ItemCategory, query: string): QuickPickItem[] {
  const items = getQuickPicks(category);
  if (!query) return items;
  const lower = query.toLowerCase();
  return items.filter(item =>
    item.label.toLowerCase().includes(lower) || item.chipLabel.toLowerCase().includes(lower)
  );
}
