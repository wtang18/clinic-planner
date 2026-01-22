'use client';

interface Prototype {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'wip' | 'archived' | 'scaffold';
  port: number;
  path: string;
  figmaUrl: string | null;
  supabaseProject: string | null;
  lastModified: string;
}

function StatusBadge({ status }: { status: Prototype['status'] }) {
  const colors = {
    active: {
      bg: 'var(--color-bg-positive-subtle)',
      fg: 'var(--color-fg-positive-primary)',
    },
    wip: {
      bg: 'var(--color-bg-attention-subtle)',
      fg: 'var(--color-fg-attention-primary)',
    },
    archived: {
      bg: 'var(--color-bg-neutral-subtle)',
      fg: 'var(--color-fg-neutral-secondary)',
    },
    scaffold: {
      bg: 'var(--color-bg-information-subtle)',
      fg: 'var(--color-fg-information-primary)',
    },
  };

  const style = colors[status];

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 500,
        textTransform: 'uppercase',
        backgroundColor: style.bg,
        color: style.fg,
      }}
    >
      {status}
    </span>
  );
}

export function PrototypeCard({ prototype }: { prototype: Prototype }) {
  const url = `http://localhost:${prototype.port}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        padding: '24px',
        backgroundColor: 'var(--color-bg-neutral-min)',
        borderRadius: '8px',
        border: '1px solid var(--color-bg-neutral-low)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-bg-neutral-medium)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-bg-neutral-low)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
          {prototype.name}
        </h2>
        <StatusBadge status={prototype.status} />
      </div>

      <p style={{
        color: 'var(--color-fg-neutral-secondary)',
        fontSize: '14px',
        marginBottom: '16px',
        lineHeight: 1.5,
      }}>
        {prototype.description}
      </p>

      <div style={{
        display: 'flex',
        gap: '16px',
        fontSize: '12px',
        color: 'var(--color-fg-neutral-softest)',
      }}>
        <span>Port: {prototype.port}</span>
        <span>Modified: {prototype.lastModified}</span>
        {prototype.figmaUrl && (
          <a
            href={prototype.figmaUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-fg-accent-primary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            Figma
          </a>
        )}
      </div>
    </a>
  );
}
