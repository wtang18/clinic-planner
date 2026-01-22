export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl font-bold mb-2">EHR Prototype</h1>
          <p className="text-fg-neutral-secondary">
            Scaffold ready. Design tokens imported and Tailwind configured.
          </p>
        </header>

        {/* Token Demo Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Design Tokens Demo</h2>

          {/* Color Swatches */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-bg-neutral-min border border-bg-neutral-low"></div>
              <p className="text-sm text-fg-neutral-secondary">neutral-min</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-bg-neutral-subtle"></div>
              <p className="text-sm text-fg-neutral-secondary">neutral-subtle</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-bg-neutral-low"></div>
              <p className="text-sm text-fg-neutral-secondary">neutral-low</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-bg-neutral-medium"></div>
              <p className="text-sm text-fg-neutral-secondary">neutral-medium</p>
            </div>
          </div>

          {/* Semantic Colors */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-bg-positive-subtle flex items-center justify-center">
                <span className="text-fg-positive-primary font-medium">Positive</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-bg-alert-subtle flex items-center justify-center">
                <span className="text-fg-alert-primary font-medium">Alert</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-bg-attention-subtle flex items-center justify-center">
                <span className="text-fg-attention-primary font-medium">Attention</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-bg-information-subtle flex items-center justify-center">
                <span className="text-fg-information-primary font-medium">Info</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Components */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Sample Elements</h2>

          <div className="space-y-4">
            {/* Card */}
            <div className="p-6 bg-bg-neutral-min rounded-xl border border-bg-neutral-low">
              <h3 className="font-semibold mb-2">Patient Card Example</h3>
              <p className="text-fg-neutral-secondary text-sm mb-4">
                This is a placeholder card component using design tokens via Tailwind classes.
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-bg-positive-subtle text-fg-positive-primary">
                  Active
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-bg-information-subtle text-fg-information-primary">
                  Scheduled
                </span>
              </div>
            </div>

            {/* Alert */}
            <div className="p-4 bg-bg-attention-subtle rounded-lg border border-bg-attention-low">
              <p className="text-fg-attention-primary text-sm font-medium">
                This is a sample attention/warning message using semantic tokens.
              </p>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="p-6 bg-bg-neutral-subtle rounded-xl">
          <h2 className="text-lg font-semibold mb-3">Next Steps</h2>
          <ul className="space-y-2 text-fg-neutral-secondary text-sm">
            <li>• Define EHR-specific Supabase schema</li>
            <li>• Create patient list view</li>
            <li>• Build encounter/visit components</li>
            <li>• Add navigation structure</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
