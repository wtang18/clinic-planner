import { mockPatient } from './mock-patient'
import { Phone, Mail, CreditCard, MapPin, Stethoscope, Video, Calendar } from 'lucide-react'

export function PatientHeader() {
  return (
    <header className="px-6 pt-4 pb-3 bg-white">
      {/* Row 1: Name + actions */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-xl font-semibold text-fg-neutral-primary">{mockPatient.name}</h1>
          <p className="text-sm text-fg-neutral-secondary">
            {mockPatient.age} year old {mockPatient.sex.toLowerCase()}, <span className="text-fg-neutral-secondary">{mockPatient.dob}</span>
          </p>
          <p className="text-sm text-fg-neutral-secondary">
            Insured name: {mockPatient.insuredName}
          </p>
        </div>
        <div className="flex items-center gap-2 text-fg-neutral-secondary cursor-default">
          <span>🏷</span>
          <span>📄</span>
          <span>•••</span>
        </div>
      </div>

      {/* Row 2: Metadata badges */}
      <div className="flex items-center gap-1 text-xs text-fg-neutral-secondary mb-2 flex-wrap">
        <span>Patient ID: {mockPatient.patientId}</span>
        <span className="mx-1">|</span>
        <span className="flex items-center gap-1">✓ {mockPatient.accountStatus}</span>
        <span className="mx-1">|</span>
        <span className="flex items-center gap-1">● {mockPatient.devices}</span>
        <span className="mx-1">|</span>
        <span className="flex items-center gap-1">✓ Privacy notice signed</span>
      </div>

      {/* Row 3: Contact info */}
      <div className="flex items-center gap-4 text-xs flex-wrap">
        <span className="flex items-center gap-1 text-fg-accent-primary">
          <Phone size={12} /> {mockPatient.phone}
        </span>
        <span className="flex items-center gap-1 text-fg-accent-primary">
          <Mail size={12} /> {mockPatient.email}
        </span>
        <span className="flex items-center gap-1 text-fg-alert-primary">
          <CreditCard size={12} /> {mockPatient.insurance}
        </span>
        <span className="flex items-center gap-1 text-fg-accent-primary">
          <Calendar size={12} /> Schedule appointment
        </span>
        <span className="flex items-center gap-1 text-fg-alert-primary">
          <MapPin size={12} /> {mockPatient.address}
        </span>
        <span className="flex items-center gap-1 text-fg-neutral-secondary">
          <Stethoscope size={12} /> {mockPatient.pcp || 'No PCP'}
        </span>
        <span className="flex items-center gap-1 text-fg-accent-primary">
          <Video size={12} /> Video call
        </span>
      </div>
    </header>
  )
}
