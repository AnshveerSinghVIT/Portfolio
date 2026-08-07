"use client";

import { useEffect, useRef } from "react";

const ORIGINAL_TITLE = "Anshveer Singh | Portfolio";
const AWAY_TITLE = "Hey, come back! 👋";

const FAVICON_ID = "dynamic-favicon";
const SIZE = 64;
const RADIUS = 14;
// Redraw at ~18fps. Plenty smooth for an icon rendered at 16-32px, far cheaper than 60fps.
const FRAME_INTERVAL = 55;

function getFaviconLink() {
  let link = document.getElementById(FAVICON_ID);
  if (!link) {
    link = document.createElement("link");
    link.id = FAVICON_ID;
    link.rel = "icon";
    document.head.appendChild(link);
  }
  return link;
}

function tracePill(ctx) {
  ctx.beginPath();
  ctx.moveTo(RADIUS, 0);
  ctx.arcTo(SIZE, 0, SIZE, SIZE, RADIUS);
  ctx.arcTo(SIZE, SIZE, 0, SIZE, RADIUS);
  ctx.arcTo(0, SIZE, 0, 0, RADIUS);
  ctx.arcTo(0, 0, SIZE, 0, RADIUS);
  ctx.closePath();
}

// Renders the "AS" mark onto an offscreen canvas and returns a data URL.
// `t` is elapsed ms driving every animated layer; pass `reducedMotion` to freeze them at a
// pleasant resting frame for users who've asked the OS for less motion.
function drawFocusedIcon(t, reducedMotion) {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");

  tracePill(ctx);
  ctx.fillStyle = "#09090b";
  ctx.fill();

  ctx.save();
  tracePill(ctx);
  ctx.clip();

  // Ambient violet/indigo aura slowly orbiting behind the letters
  const auraAngle = reducedMotion ? 0.6 : (t / 4200) * Math.PI * 2;
  const auraX = SIZE / 2 + Math.cos(auraAngle) * 10;
  const auraY = SIZE / 2 + Math.sin(auraAngle) * 10;
  const aura = ctx.createRadialGradient(auraX, auraY, 0, auraX, auraY, 36);
  aura.addColorStop(0, "rgba(139, 92, 246, 0.55)");
  aura.addColorStop(0.55, "rgba(99, 102, 241, 0.22)");
  aura.addColorStop(1, "rgba(99, 102, 241, 0)");
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Faint top-down sheen for depth
  const vignette = ctx.createLinearGradient(0, 0, 0, SIZE);
  vignette.addColorStop(0, "rgba(255,255,255,0.06)");
  vignette.addColorStop(0.45, "rgba(255,255,255,0)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // "AS" initials with a tiny breathing scale
  const breath = reducedMotion ? 1 : 1 + Math.sin((t / 1300) * Math.PI * 2) * 0.025;
  ctx.save();
  ctx.translate(SIZE / 2, SIZE / 2 + 1);
  ctx.scale(breath, breath);
  ctx.translate(-SIZE / 2, -(SIZE / 2 + 1));

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 28px 'Segoe UI', system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("AS", SIZE / 2, SIZE / 2 + 1);

  // Diagonal shimmer sweep across the letters — paints only over existing text pixels
  if (!reducedMotion) {
    const cycle = 2800;
    const phase = t % cycle;
    if (phase < cycle * 0.5) {
      const progress = phase / (cycle * 0.5);
      const sweepX = -SIZE * 0.6 + progress * SIZE * 2.2;
      ctx.save();
      ctx.globalCompositeOperation = "source-atop";
      const shimmer = ctx.createLinearGradient(sweepX - 14, 0, sweepX + 14, SIZE);
      shimmer.addColorStop(0, "rgba(255,255,255,0)");
      shimmer.addColorStop(0.5, "rgba(255,255,255,0.9)");
      shimmer.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = shimmer;
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.restore();
    }
  }
  ctx.restore(); // breathing scale
  ctx.restore(); // pill clip

  // "Available for work" status dot — breathing glow + a periodic ping ring
  const dotX = SIZE - 12;
  const dotY = SIZE - 12;
  const dotRadius = 7;
  const glowPulse = reducedMotion ? 0.5 : (Math.sin((t / 1300) * Math.PI * 2) + 1) / 2;

  if (!reducedMotion) {
    const pingCycle = 3000;
    const pingPhase = t % pingCycle;
    if (pingPhase < 1200) {
      const p = pingPhase / 1200;
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotRadius + p * 10, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(34, 197, 94, ${0.5 * (1 - p)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  const glow = ctx.createRadialGradient(dotX, dotY, dotRadius * 0.4, dotX, dotY, dotRadius + 7);
  glow.addColorStop(0, `rgba(34, 197, 94, ${0.5 + glowPulse * 0.3})`);
  glow.addColorStop(1, "rgba(34, 197, 94, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(dotX, dotY, dotRadius + 7, 0, Math.PI * 2);
  ctx.fill();

  // Dark ring so the dot reads clearly against the aura behind it
  ctx.fillStyle = "#09090b";
  ctx.beginPath();
  ctx.arc(dotX, dotY, dotRadius + 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL("image/png");
}

function waveSvg(tiltDeg) {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#09090b"/>
  <text x="32" y="40" font-size="34" text-anchor="middle" transform="rotate(${tiltDeg} 32 32)">👋</text>
</svg>
`.trim()
    )
  );
}

// Two tilted frames swapped on an interval simulate a waving hand — the classic
// animated-favicon trick of cycling still frames, since a static <link> icon can't run CSS.
const WAVE_FRAMES = [waveSvg(-14), waveSvg(14)];
const WAVE_FRAME_INTERVAL = 450;

export default function DynamicFavicon() {
  const rafRef = useRef(null);
  const waveIntervalRef = useRef(null);

  useEffect(() => {
    const link = getFaviconLink();
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let start = null;
    let lastDraw = -Infinity;

    const animateFocused = (timestamp) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      if (timestamp - lastDraw >= FRAME_INTERVAL) {
        link.href = drawFocusedIcon(elapsed, false);
        lastDraw = timestamp;
      }
      rafRef.current = requestAnimationFrame(animateFocused);
    };

    const stopFocusedAnimation = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const stopWaveAnimation = () => {
      if (waveIntervalRef.current !== null) {
        clearInterval(waveIntervalRef.current);
        waveIntervalRef.current = null;
      }
    };

    const applyAwayState = () => {
      stopFocusedAnimation();
      document.title = AWAY_TITLE;

      let frame = 0;
      link.href = WAVE_FRAMES[frame];
      waveIntervalRef.current = setInterval(() => {
        frame = (frame + 1) % WAVE_FRAMES.length;
        link.href = WAVE_FRAMES[frame];
      }, WAVE_FRAME_INTERVAL);
    };

    const applyFocusedState = () => {
      stopWaveAnimation();
      document.title = ORIGINAL_TITLE;

      if (reducedMotionQuery.matches) {
        link.href = drawFocusedIcon(0, true);
        return;
      }
      start = null;
      lastDraw = -Infinity;
      rafRef.current = requestAnimationFrame(animateFocused);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        applyAwayState();
      } else {
        applyFocusedState();
      }
    };

    if (document.hidden) {
      applyAwayState();
    } else {
      applyFocusedState();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopFocusedAnimation();
      stopWaveAnimation();
      document.title = ORIGINAL_TITLE;
    };
  }, []);

  return null;
}
