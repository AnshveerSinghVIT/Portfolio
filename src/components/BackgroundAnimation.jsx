'use client';
import { useEffect, useRef } from 'react';

export default function BackgroundAnimation() {
  const canvasRef = useRef(null);
  const images = useRef([]);
  const frameCount = 192;

  useEffect(() => {
    // 1. Setup Canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    canvas.width = 1920;
    canvas.height = 1080;

    // 2. Load Images
    const loadImages = () => {
      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = `/frames/frame_${(i + 1).toString().padStart(3, '0')}.webp`;
        images.current.push(img);
        // Render first frame immediately when loaded
        if (i === 0) {
            img.onload = () => renderFrame(0);
        }
      }
    };

    // 3. The Drawing Logic
    const renderFrame = (index) => {
      const img = images.current[index];
      if (img && img.complete && img.naturalWidth !== 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // --- ZOOM SETTINGS ---
        const zoom = 1.3; 
        
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height) * zoom;
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale -100;

        context.drawImage(img, x, y, img.width * scale, img.height * scale);
      }
    };

    // 4. THE BRIDGE: Expose this function to the window so Experience.jsx can call it
    window.updateHandScroll = (progress) => {
      // progress is 0.0 to 1.0
      const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(progress * (frameCount - 1))
      );
      renderFrame(frameIndex);
    };

    loadImages();

    // Cleanup
    return () => {
      delete window.updateHandScroll;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: -1, 
        opacity: 0.15,
        filter: 'invert(0) contrast(2.0) brightness(1.2)',
        mixBlendMode: 'luminosity',
      }}
    />
  );
}