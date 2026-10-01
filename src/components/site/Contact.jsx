'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { profile } from '@/lib/data';
import { emit, scrollToId } from '@/lib/scroll';
import Magnetic from './Magnetic';
import { EmailForm } from './AskAI';
import LocalTime from './LocalTime';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.contact__line > span', {
        yPercent: 110,
        stagger: 0.1,
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.contact__title', start: 'top 80%' },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      emit('toast', 'Email copied — say hi');
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const links = [
    { label: 'Résumé', sub: 'PDF', url: profile.resume },
    ...profile.socials.slice(0, 2).map((s) => ({ label: s.label, sub: s.handle, url: s.url })),
    { label: 'Phone', sub: profile.phone, url: `tel:${profile.phone.replace(/\s/g, '')}` },
  ];

  return (
    <section id="contact" ref={root} className="contact" aria-labelledby="contact-title">
      <div className="label mono">
        <span>(06)</span>
        <span>Contact</span>
      </div>

      <h2 id="contact-title" className="contact__title">
        <span className="contact__line">
          <span>Let&apos;s build</span>
        </span>
        <span className="contact__line">
          <span>
            something <em className="serif">rare.</em>
          </span>
        </span>
      </h2>

      <div className="contact__actions">
        <Magnetic strength={0.25}>
          <button type="button" className="contact__email" onClick={copy} data-cursor="Copy">
            <span className="contact__email-text">{profile.email}</span>
            <span className="contact__email-hint mono">Click to copy</span>
          </button>
        </Magnetic>
        <a href={`mailto:${profile.email}`} className="link-underline mono">
          or open your mail app ↗
        </a>
      </div>

      <div className="contact__form-wrap">
        <EmailForm className="contact__form" title="Or leave a note — it lands straight in my inbox" onDone={(t) => emit('toast', t)} />
      </div>

      <ul className="contact__links">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.url} target={l.url.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="contact__link">
              <span className="contact__link-label">{l.label}</span>
              <span className="contact__link-sub mono">{l.sub}</span>
              <span className="contact__link-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>

      <footer className="footer mono">
        <span>© 2026 {profile.name}</span>
        <span>
          {profile.location} — <LocalTime />
        </span>
        <span>Next.js · R3F · GLSL · GSAP</span>
        <button type="button" onClick={() => scrollToId('top')} className="link-underline">
          Back to top ↑
        </button>
      </footer>
      <div className="footer__giant" aria-hidden="true">
        Anshveer
      </div>
    </section>
  );
}
