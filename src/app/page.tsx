'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to annual view
    router.replace('/annual');
  }, [router]);

  return (
    <main className="min-h-screen bg-[var(--color-bg-neutral-subtle)] flex items-center justify-center">
      <div className="text-center">
        <div className="text-body-lg-regular !text-[var(--color-fg-neutral-secondary)]">Loading...</div>
      </div>
    </main>
  );
}
