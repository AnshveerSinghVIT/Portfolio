import Experience from '@/components/Experience';
import BackgroundAnimation from '@/components/BackgroundAnimation';

export default function Home() {
  return (
    // CHANGE: Removed 'bg-white', added 'relative'
    <main className="relative w-full">
      <BackgroundAnimation />
      
      {/* Experience handles its own height via ScrollControls, so we just wrap it */}
      <section className="relative z-10">
        <Experience />
      </section>
    </main>
  );
}