'use client';

import { ChevronLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/') return null;

  return (
    <button
      onClick={() => router.push('/')}
      className="absolute top-4 left-4 p-2 hover:bg-accent rounded-lg transition-colors flex items-center gap-2 text-sm"
    >
      <ChevronLeft className="w-4 h-4" />
      Back to Home
    </button>
  );
} 