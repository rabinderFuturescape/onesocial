'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';

export default function OnessoCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    if (code) {
      // Redirect to the auth page with the provider and code
      router.push(`/auth?provider=ONESSO&code=${code}`);
    } else {
      // If no code is present, redirect to the login page
      router.push('/auth/login');
    }
  }, [code, router]);

  return <LoadingComponent />;
}
