import { Button, Pill, TogglePill } from '@/design-system'

export default function App() {
  return (
    <div className="h-screen w-screen bg-bg-neutral-subtle p-8 flex flex-col gap-4">
      <Button type="transparent" size="x-small" label="Confirm" />
      <Pill type="attention" size="small" label="Unconfirmed" />
      <TogglePill label="Active" selected={true} rightSubtext="2" onChange={() => {}} />
    </div>
  )
}
