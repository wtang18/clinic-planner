import { readFileSync, statSync } from 'fs';
import { join } from 'path';
import { PrototypeCard } from './PrototypeCard';

interface Prototype {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'wip' | 'archived';
  port: number;
  path: string;
  figmaUrl: string | null;
  supabaseProject: string | null;
}

interface PrototypesManifest {
  prototypes: Prototype[];
}

function getPrototypes(): PrototypesManifest {
  const manifestPath = join(process.cwd(), '../../prototypes.json');
  const content = readFileSync(manifestPath, 'utf-8');
  return JSON.parse(content);
}

function getLastModified(prototypePath: string): string {
  try {
    const fullPath = join(process.cwd(), '../..', prototypePath);
    const stats = statSync(fullPath);
    return stats.mtime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
}

export default function HomePage() {
  const { prototypes } = getPrototypes();

  // Add lastModified to each prototype
  const prototypesWithDates = prototypes.map((p) => ({
    ...p,
    lastModified: getLastModified(p.path),
  }));

  return (
    <main style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '48px 24px',
    }}>
      <header style={{ marginBottom: '48px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '8px',
        }}>
          Carbon Prototypes
        </h1>
        <p style={{
          color: 'var(--color-fg-neutral-secondary)',
          fontSize: '16px',
        }}>
          Design explorations and prototypes for Carbon Health
        </p>
      </header>

      <section>
        <div style={{
          display: 'grid',
          gap: '16px',
        }}>
          {prototypesWithDates.map((prototype) => (
            <PrototypeCard key={prototype.id} prototype={prototype} />
          ))}
        </div>
      </section>

      <footer style={{
        marginTop: '64px',
        paddingTop: '24px',
        borderTop: '1px solid var(--color-bg-neutral-low)',
        fontSize: '12px',
        color: 'var(--color-fg-neutral-softest)',
      }}>
        <p>
          Run <code style={{
            backgroundColor: 'var(--color-bg-neutral-subtle)',
            padding: '2px 6px',
            borderRadius: '4px',
          }}>npm run dev</code> from the workspace root to start clinic-planner on port 3000.
        </p>
      </footer>
    </main>
  );
}
