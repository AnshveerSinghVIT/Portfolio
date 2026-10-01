import { ImageResponse } from 'next/og';

export const alt = 'Anshveer Singh — Software engineer, AI/ML & full-stack';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: '#efece6',
          color: '#121212',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: -60,
            width: 640,
            height: 640,
            borderRadius: 9999,
            background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #d9d2ff 30%, #ffb48a 62%, #ff5a1f 100%)',
            opacity: 0.9,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, letterSpacing: 3, color: '#57544e' }}>
          <span>PORTFOLIO — EDITION 2026</span>
          <span>BENGALURU, IN</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 150, fontWeight: 700, letterSpacing: -8, lineHeight: 0.9 }}>Anshveer</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: 150, fontStyle: 'italic', letterSpacing: -4, lineHeight: 0.95 }}>
            Singh<span style={{ color: '#ff5a1f' }}>.</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 28 }}>
          <span>Software engineer — AI/ML &amp; full-stack</span>
          <span style={{ fontSize: 22, color: '#57544e' }}>VIT Vellore ’27 · ex-Dell intern</span>
        </div>
      </div>
    ),
    size
  );
}
