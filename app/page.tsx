'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    router.push(token ? '/tasks' : '/login');
  }, [router]);

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-brand-400 text-xl">در حال بارگذاری...</div>
      </div>
  );
}