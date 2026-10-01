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

      // Phase 1: Load ONLY the very first frame immediately so the background has a starting state
      const img = new Image();
      img.src = `/frames/frame_001.webp`;
      img.onload = () => renderFrame(0);
      images.current[0] = img;

      const startLazyLoading = () => {
        // Detect connection speed
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlow = connection && (
            connection.saveData ||
            connection.effectiveType === 'slow-2g' ||
            connection.effectiveType === '2g' ||
            connection.effectiveType === '3g'
        );

        // Phase 3: Determine loading strategy based on connection
        // Slow networks: load every 8th frame (stops at 1 pass). Fast networks: start with every 4th frame, then 2nd, then 1st.
        let currentPassStep = isSlow ? 8 : 4; 
        let currentIndex = currentPassStep;
        
        const loadNextFrame = () => {
            // Done loading all passes
            if (currentPassStep < 1) return;
            if (isSlow && currentIndex >= frameCount) return;

            if (currentIndex >= frameCount) {
                // If we're on a fast connection, we start a new pass to backfill
                currentPassStep = Math.floor(currentPassStep / 2);
                currentIndex = currentPassStep;
                if (currentPassStep < 1) return;
            }

            // Skip if already loaded (e.g., from a previous sparse pass)
            if (!images.current[currentIndex]) {
                const img = new Image();
                img.src = `/frames/frame_${(currentIndex + 1).toString().padStart(3, '0')}.webp`;
                images.current[currentIndex] = img;
            }

            currentIndex += currentPassStep;

            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(loadNextFrame);
            } else {
                setTimeout(loadNextFrame, 50);
            }
        };

        // Start the loading sequence
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(loadNextFrame);
        } else {
            setTimeout(loadNextFrame, 50);
        }
      };

      // Phase 2: Wait for 3D Experience to be fully loaded before hogging the network
      if (window.isExperienceLoaded) {
          startLazyLoading();
      } else {
          window.addEventListener('experience-loaded', startLazyLoading, { once: true });
      }
    };

    // 3. The Drawing Logic
    const renderFrame = (index) => {
      // Find the closest loaded frame if the exact one isn't ready
      let foundIndex = -1;
      for (let offset = 0; offset < frameCount; offset++) {
          let checkUp = index + offset;
          if (checkUp < frameCount && images.current[checkUp] && images.current[checkUp].complete && images.current[checkUp].naturalWidth !== 0) {
              foundIndex = checkUp;
              break;
          }
          let checkDown = index - offset;
          if (checkDown >= 0 && images.current[checkDown] && images.current[checkDown].complete && images.current[checkDown].naturalWidth !== 0) {
              foundIndex = checkDown;
              break;
          }
      }
      
      if (foundIndex === -1) return;
      const img = images.current[foundIndex];
      
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // --- ZOOM SETTINGS ---
      const zoom = 1.3; 
      
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height) * zoom;
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale -100;

      context.drawImage(img, x, y, img.width * scale, img.height * scale);
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