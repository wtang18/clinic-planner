/**
 * Placeholder Workflow Sections
 *
 * Skeleton form layouts for each workflow section.
 * No data binding — visual structure only for the prototype.
 *
 * 8 Check-in + 5 Triage + 3 Checkout = 16 sections total.
 */

import React from 'react';
import { colors, spaceAround, spaceBetween, typography, borderRadius, body, label, transitions } from '../../../styles/foundations';
import { Button } from '../../../components/primitives/Button';

// ============================================================================
// Shared Styles
// ============================================================================

export const formGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: spaceBetween.coupled,
  marginBottom: spaceAround.default,
};

export const fieldLabel: React.CSSProperties = {
  fontSize: label.xs.medium.fontSize,
  fontWeight: label.xs.medium.fontWeight,
  fontFamily: label.xs.medium.fontFamily,
  lineHeight: `${label.xs.medium.lineHeight}px`,
  color: colors.fg.neutral.secondary,
};

export const textInput: React.CSSProperties = {
  padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
  fontSize: body.sm.regular.fontSize,
  fontFamily: body.sm.regular.fontFamily,
  border: `1px solid ${colors.border.neutral.medium}`,
  borderRadius: borderRadius.sm,
  backgroundColor: colors.bg.neutral.base,
  color: colors.fg.neutral.primary,
  width: '100%',
  boxSizing: 'border-box',
};

export const selectInput: React.CSSProperties = {
  ...textInput,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: 32,
};

const gridContainer = (cols: number): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${cols}, 1fr)`,
  gap: spaceBetween.repeating,
});

const gridButton = (isSelected: boolean, size: 'sm' | 'md' = 'sm'): React.CSSProperties => ({
  height: size === 'md' ? 32 : undefined,
  padding: size === 'md'
    ? `0 ${spaceAround.compact}px`
    : `${spaceAround.nudge4}px ${spaceAround.tight}px`,
  fontSize: size === 'md' ? body.sm.regular.fontSize : body.xs.regular.fontSize,
  fontFamily: size === 'md' ? body.sm.regular.fontFamily : body.xs.regular.fontFamily,
  fontWeight: isSelected
    ? (size === 'md' ? body.sm.medium.fontWeight : body.xs.medium.fontWeight)
    : (size === 'md' ? body.sm.regular.fontWeight : body.xs.regular.fontWeight),
  textAlign: 'center',
  display: size === 'md' ? 'flex' : undefined,
  alignItems: size === 'md' ? 'center' : undefined,
  justifyContent: size === 'md' ? 'center' : undefined,
  border: `1px solid ${isSelected ? colors.border.accent.medium : colors.border.neutral.low}`,
  borderRadius: borderRadius.full,
  backgroundColor: isSelected ? colors.bg.accent.medium : colors.bg.neutral.subtle,
  color: isSelected ? colors.fg.accent.primary : colors.fg.neutral.secondary,
  cursor: 'pointer',
  transition: `all ${transitions.fast}`,
});

const checkRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: spaceBetween.repeating,
  padding: `${spaceAround.tight}px 0`,
};

const checkbox: React.CSSProperties = {
  width: 16,
  height: 16,
  borderRadius: 3,
  border: `2px solid ${colors.border.neutral.medium}`,
  flexShrink: 0,
};

export const fieldRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: spaceBetween.related,
};

// ============================================================================
// Check-in Sections (9)
// ============================================================================

export const ProvidersSection: React.FC = () => (
  <div>
    <div style={fieldRow}>
      <div style={formGroup}>
        <label style={fieldLabel}>Billing Provider</label>
        <select style={selectInput} defaultValue="dr-patel">
          <option value="dr-patel">Dr. Anita Patel, MD</option>
          <option value="dr-chen">Dr. Sarah Chen, DO</option>
          <option value="dr-martinez">Dr. Carlos Martinez, MD</option>
        </select>
      </div>
      <div style={formGroup}>
        <label style={fieldLabel}>Supervising Physician</label>
        <select style={selectInput} defaultValue="dr-patel">
          <option value="dr-patel">Dr. Anita Patel, MD</option>
          <option value="dr-chen">Dr. Sarah Chen, DO</option>
          <option value="none">None (self-supervising)</option>
        </select>
      </div>
    </div>
  </div>
);

export const PatientInfoSection: React.FC = () => (
  <div>
    <div style={fieldRow}>
      <div style={formGroup}>
        <label style={fieldLabel}>First Name</label>
        <input style={textInput} defaultValue="Sarah" readOnly />
      </div>
      <div style={formGroup}>
        <label style={fieldLabel}>Last Name</label>
        <input style={textInput} defaultValue="Chen" readOnly />
      </div>
    </div>
    <div style={fieldRow}>
      <div style={formGroup}>
        <label style={fieldLabel}>Date of Birth</label>
        <input style={textInput} defaultValue="03/15/1988" readOnly />
      </div>
      <div style={formGroup}>
        <label style={fieldLabel}>Phone</label>
        <input style={textInput} defaultValue="(555) 012-3456" readOnly />
      </div>
    </div>
    <div style={formGroup}>
      <label style={fieldLabel}>Address</label>
      <input style={textInput} defaultValue="123 Main St, San Francisco, CA 94102" readOnly />
    </div>
  </div>
);

export const PatientCardsSection: React.FC = () => (
  <div>
    <div style={gridContainer(2)}>
      <div style={{
        height: 100,
        border: `2px dashed ${colors.border.neutral.medium}`,
        borderRadius: borderRadius.sm,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 4,
        color: colors.fg.neutral.spotReadable,
        fontSize: body.xs.regular.fontSize,
        fontFamily: body.xs.regular.fontFamily,
      }}>
        <span style={{ fontSize: 24 }}>🪪</span>
        <span>Photo ID</span>
      </div>
      <div style={{
        height: 100,
        border: `2px dashed ${colors.border.neutral.medium}`,
        borderRadius: borderRadius.sm,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 4,
        color: colors.fg.neutral.spotReadable,
        fontSize: body.xs.regular.fontSize,
        fontFamily: body.xs.regular.fontFamily,
      }}>
        <span style={{ fontSize: 24 }}>💳</span>
        <span>Insurance Card</span>
      </div>
    </div>
  </div>
);

export const SpecialtySection: React.FC = () => (
  <div>
    <div style={formGroup}>
      <label style={fieldLabel}>Visit Specialty</label>
      <select style={selectInput} defaultValue="primary-care">
        <option value="primary-care">Primary Care</option>
        <option value="urgent-care">Urgent Care</option>
        <option value="mental-health">Mental Health</option>
        <option value="pediatrics">Pediatrics</option>
      </select>
    </div>
  </div>
);

export const ResponsiblePartySection: React.FC = () => (
  <div>
    <div style={formGroup}>
      <label style={fieldLabel}>Responsible Party Type</label>
      <div style={gridContainer(2)}>
        <div style={gridButton(true, 'md')}>Insurance</div>
        <div style={gridButton(false, 'md')}>Worker&apos;s Comp</div>
        <div style={gridButton(false, 'md')}>Org / School</div>
        <div style={gridButton(false, 'md')}>Patient (Self-Pay)</div>
      </div>
    </div>
    <div style={formGroup}>
      <label style={fieldLabel}>Insurance Plan</label>
      <input style={textInput} defaultValue="Blue Cross PPO" readOnly />
    </div>
    <div style={fieldRow}>
      <div style={formGroup}>
        <label style={fieldLabel}>Member ID</label>
        <input style={textInput} defaultValue="XBC-123456789" readOnly />
      </div>
      <div style={formGroup}>
        <label style={fieldLabel}>Group #</label>
        <input style={textInput} defaultValue="GRP-4567" readOnly />
      </div>
    </div>
  </div>
);

export const CreditCardSection: React.FC = () => (
  <div>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: spaceBetween.related,
      padding: `${spaceAround.compact}px`,
      border: `1px solid ${colors.border.neutral.low}`,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.bg.neutral.subtle,
    }}>
      <span style={{ fontSize: 18 }}>💳</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: body.sm.regular.fontSize, fontFamily: body.sm.regular.fontFamily, color: colors.fg.neutral.primary }}>
          •••• •••• •••• 4242
        </div>
        <div style={{ fontSize: body.xs.regular.fontSize, fontFamily: body.xs.regular.fontFamily, color: colors.fg.neutral.secondary }}>
          Visa · Exp 08/27
        </div>
      </div>
    </div>
  </div>
);

export const ConsentFormsSection: React.FC = () => (
  <div>
    {['General Consent to Treatment', 'HIPAA Notice of Privacy Practices', 'Financial Responsibility Agreement', 'Telehealth Consent (if applicable)'].map((item) => (
      <div key={item} style={checkRow}>
        <div style={checkbox} />
        <span style={{ fontSize: body.sm.regular.fontSize, fontFamily: body.sm.regular.fontFamily, color: colors.fg.neutral.primary }}>
          {item}
        </span>
      </div>
    ))}
  </div>
);

export const PaymentCollectionSection: React.FC = () => (
  <div>
    <div style={fieldRow}>
      <div style={formGroup}>
        <label style={fieldLabel}>Copay Due</label>
        <input style={textInput} defaultValue="$30.00" readOnly />
      </div>
      <div style={formGroup}>
        <label style={fieldLabel}>Outstanding Balance</label>
        <input style={textInput} defaultValue="$0.00" readOnly />
      </div>
    </div>
    <div style={formGroup}>
      <label style={fieldLabel}>Payment Method</label>
      <select style={selectInput} defaultValue="card-on-file">
        <option value="card-on-file">Card on File (•••• 4242)</option>
        <option value="new-card">New Card</option>
        <option value="cash">Cash</option>
        <option value="waive">Waive</option>
      </select>
    </div>
  </div>
);

// ============================================================================
// Triage Sections (5)
// ============================================================================

export const AssignRoomSection: React.FC = () => (
  <div>
    <div style={formGroup}>
      <label style={fieldLabel}>Select Room</label>
      <div style={gridContainer(4)}>
        {['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5', 'Room 6', 'Pending Results', 'Virtual'].map((label, i) => (
          <div key={label} style={gridButton(i === 1, 'md')}>{label}</div>
        ))}
      </div>
    </div>
  </div>
);

export const HPISection: React.FC = () => (
  <div>
    <div style={formGroup}>
      <label style={fieldLabel}>Chief Complaint</label>
      <input style={textInput} defaultValue="Persistent cough for 5 days" />
    </div>
    <div style={formGroup}>
      <label style={fieldLabel}>HPI Notes</label>
      <textarea
        style={{ ...textInput, minHeight: 80, resize: 'vertical' }}
        defaultValue="Patient reports dry cough started 5 days ago. No fever. No shortness of breath at rest. Mild chest discomfort with prolonged coughing. OTC cough suppressants have not helped."
      />
    </div>
  </div>
);

export const MedicalHistorySection: React.FC = () => (
  <div>
    {[
      'Allergies reviewed — no changes',
      'Current medications reviewed — no changes',
      'Past medical history reviewed',
      'Family history reviewed',
      'Social history reviewed',
    ].map((item) => (
      <div key={item} style={checkRow}>
        <div style={checkbox} />
        <span style={{ fontSize: body.sm.regular.fontSize, fontFamily: body.sm.regular.fontFamily, color: colors.fg.neutral.primary }}>
          {item}
        </span>
      </div>
    ))}
  </div>
);

export const RxRenewalsSection: React.FC = () => (
  <div>
    {[
      { med: 'Lisinopril 10mg', freq: 'Daily', renewal: true },
      { med: 'Metformin 500mg', freq: 'Twice daily', renewal: false },
      { med: 'Atorvastatin 20mg', freq: 'Daily', renewal: true },
    ].map(({ med, freq, renewal }) => (
      <div key={med} style={{
        ...checkRow,
        padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
        border: `1px solid ${colors.border.neutral.low}`,
        borderRadius: borderRadius.sm,
        marginBottom: spaceBetween.coupled,
      }}>
        <div style={{
          ...checkbox,
          backgroundColor: renewal ? colors.bg.accent.subtle : 'transparent',
          borderColor: renewal ? colors.border.accent.low : colors.border.neutral.medium,
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: body.sm.regular.fontSize, fontFamily: body.sm.regular.fontFamily, color: colors.fg.neutral.primary }}>{med}</div>
          <div style={{ fontSize: body.xs.regular.fontSize, fontFamily: body.xs.regular.fontFamily, color: colors.fg.neutral.secondary }}>{freq}</div>
        </div>
        {renewal && (
          <span style={{
            fontSize: body.xs.medium.fontSize,
            fontFamily: body.xs.medium.fontFamily,
            fontWeight: body.xs.medium.fontWeight,
            color: colors.fg.accent.primary,
          }}>
            Renew
          </span>
        )}
      </div>
    ))}
  </div>
);

// ============================================================================
// Checkout Sections (3)
// ============================================================================

export const ReviewBillSection: React.FC = () => (
  <div>
    <div style={{
      border: `1px solid ${colors.border.neutral.low}`,
      borderRadius: borderRadius.sm,
      overflow: 'hidden',
    }}>
      {[
        { code: '99213', desc: 'Office Visit – Est. Patient, Level 3', amount: '$150.00' },
        { code: '71046', desc: 'Chest X-Ray, 2 views', amount: '$85.00' },
      ].map(({ code, desc, amount }) => (
        <div key={code} style={{
          display: 'flex',
          alignItems: 'center',
          gap: spaceBetween.related,
          padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
          borderBottom: `1px solid ${colors.border.neutral.low}`,
        }}>
          <span style={{ fontSize: 12, fontFamily: 'monospace', color: colors.fg.neutral.secondary, width: 50 }}>{code}</span>
          <span style={{ fontSize: body.sm.regular.fontSize, fontFamily: body.sm.regular.fontFamily, color: colors.fg.neutral.primary, flex: 1 }}>{desc}</span>
          <span style={{ fontSize: body.sm.regular.fontSize, fontFamily: body.sm.regular.fontFamily, color: colors.fg.neutral.primary }}>{amount}</span>
        </div>
      ))}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: spaceBetween.related,
        padding: `${spaceAround.compact}px`,
        backgroundColor: colors.bg.neutral.subtle,
      }}>
        <span style={{ fontSize: body.sm.medium.fontSize, fontFamily: body.sm.medium.fontFamily, fontWeight: body.sm.medium.fontWeight, color: colors.fg.neutral.secondary }}>Total:</span>
        <span style={{ fontSize: body.sm.medium.fontSize, fontFamily: body.sm.medium.fontFamily, fontWeight: typography.fontWeight.semibold, color: colors.fg.neutral.primary }}>$235.00</span>
      </div>
    </div>
  </div>
);

export const AdditionalChargesSection: React.FC = () => (
  <div>
    <div style={formGroup}>
      <label style={fieldLabel}>Add Charge</label>
      <div style={{ display: 'flex', gap: spaceBetween.related }}>
        <input style={{ ...textInput, flex: 1 }} placeholder="CPT code or description" />
        <Button variant="secondary" size="sm">Add</Button>
      </div>
    </div>
    <div style={formGroup}>
      <label style={fieldLabel}>Collect Payment</label>
      <div style={fieldRow}>
        <input style={textInput} placeholder="Amount" />
        <select style={selectInput} defaultValue="card-on-file">
          <option value="card-on-file">Card on File</option>
          <option value="cash">Cash</option>
          <option value="check">Check</option>
        </select>
      </div>
    </div>
  </div>
);

export const BookFollowUpSection: React.FC = () => (
  <div>
    <div style={fieldRow}>
      <div style={formGroup}>
        <label style={fieldLabel}>Follow-Up In</label>
        <div style={{ display: 'flex', gap: spaceBetween.related }}>
          <input style={{ ...textInput, width: 60 }} defaultValue="2" />
          <select style={{ ...selectInput, flex: 1 }} defaultValue="weeks">
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </select>
        </div>
      </div>
      <div style={formGroup}>
        <label style={fieldLabel}>Visit Type</label>
        <select style={selectInput} defaultValue="follow-up">
          <option value="follow-up">Follow-Up</option>
          <option value="recheck">Recheck</option>
          <option value="annual">Annual Wellness</option>
        </select>
      </div>
    </div>
    <div style={formGroup}>
      <label style={fieldLabel}>Provider</label>
      <select style={selectInput} defaultValue="same">
        <option value="same">Same Provider (Dr. Patel)</option>
        <option value="any">Any Available</option>
      </select>
    </div>
  </div>
);
