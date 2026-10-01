'use client';

import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/LoadingScreen';

const Experience = dynamic(() => import('@/components/Experience'), {
  ssr: false,
  loading: () => <LoadingScreen />
});

const BackgroundAnimation = dynamic(() => import('@/components/BackgroundAnimation'), {
  ssr: false
});

export default function DynamicCanvasLayer() {
  return (
    <>
      <BackgroundAnimation />
      <section className="relative z-10">
        <Experience />
      </section>
    </>
  );
}
