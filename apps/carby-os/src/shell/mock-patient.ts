export const mockPatient = {
  name: 'Maria Santos',
  age: 52,
  sex: 'Female',
  dob: '06/14/1973',
  insurance: 'Blue Cross PPO',
  insuredName: 'Maria Santos',
  pcp: 'Dr. Sarah Chen, MD',
  patientId: '2847391',
  phone: '(415) 555-0142',
  email: 'm.santos@email.com',
  address: '1847 Mission St, San Francisco, CA',
  accountStatus: 'User Account',
  devices: 'No Active Devices',
  privacyNotice: true,
  selfPay: false,
  flags: [] as string[],
}

export const mockAppointment = {
  time: '10:30 AM PDT',
  date: 'March 9, 2026',
  provider: 'Albert Chong, PA-C',
  clinic: 'Carbon Health — SoMa',
  reason: 'Follow-up, Type 2 Diabetes',
  appointmentId: '19284756',
  checkinTime: '3/9/2026 10:22:08 AM PDT',
  triageTime: '3/9/2026 10:28:11 AM PDT',
}
