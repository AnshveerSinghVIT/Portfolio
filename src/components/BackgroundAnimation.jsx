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
      // Initialize the array
      for (let i = 0; i < frameCount; i++) {
        images.current.push(null);
      }

      // Load first frame immediately so the background isn't blank
      const img0 = new Image();
      img0.src = `/frames/frame_001.webp`;
      img0.onload = () => renderFrame(0);
      images.current[0] = img0;

      // Lazy load the rest after a delay to unblock the browser network queue
      // This allows the critical 3D profile textures to download first!
      setTimeout(() => {
        for (let i = 1; i < frameCount; i++) {
          const img = new Image();
          img.src = `/frames/frame_${(i + 1).toString().padStart(3, '0')}.webp`;
          images.current[i] = img;
        }
      }, 1500);
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