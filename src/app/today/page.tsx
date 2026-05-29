'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function TodayRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(query ? `/?${query}` : '/');
  }, [router, searchParams]);

  return null;
}

export default function TodayPage() {
  return (
    <Suspense fallback={null}>
      <TodayRedirect />
    </Suspense>
  );
}
