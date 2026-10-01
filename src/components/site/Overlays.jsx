'use client';

import dynamic from 'next/dynamic';

const CommandPalette = dynamic(() => import('./CommandPalette'), { ssr: false });
const CaseDrawer = dynamic(() => import('./CaseDrawer'), { ssr: false });
const AskAI = dynamic(() => import('./AskAI'), { ssr: false });
const EasterEggs = dynamic(() => import('./EasterEggs'), { ssr: false });

export default function Overlays() {
  return (
    <>
      <CommandPalette />
      <CaseDrawer />
      <AskAI />
      <EasterEggs />
    </>
  );
}
