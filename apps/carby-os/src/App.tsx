import { PatientShell } from '@/shell/PatientShell'
import { ProblemsListView } from '@/features/problems-list/ProblemsListView'

export default function App() {
  return (
    <PatientShell>
      <ProblemsListView />
    </PatientShell>
  )
}
