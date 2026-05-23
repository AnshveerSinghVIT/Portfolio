'use client';

import dynamic from 'next/dynamic';

const SmartAIChat = dynamic(() => import('./SmartAIChat'), { ssr: false });

export default function SmartAIChatWrapper() {
  return <SmartAIChat />;
}
