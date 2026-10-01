'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { experience } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

export default function ExperienceSection() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.exp__item').forEach((item) => {
        gsap.fromTo(
          item.querySelector('.exp__rule'),
          { scaleX: 0 },
          { scaleX: 1, ease: 'none', scrollTrigger: { trigger: item, start: 'top 85%', end: 'top 45%', scrub: true } }
        );
        const media = item.querySelector('.exp__media');
        if (media) {
          gsap.fromTo(media, { clipPath: 'inset(0 0 100% 0 round 14px)' }, { clipPath: 'inset(0 0 0% 0 round 14px)', duration: 1.4, ease: 'power4.inOut', scrollTrigger: { trigger: media, start: 'top 85%' } });
        }
        gsap.from(item.querySelectorAll('.exp__fade:not(.exp__media)'), {
          y: 40,
          opacity: 0,
          stagger: 0.08,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 75%' },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="experience" ref={root} className="exp" aria-labelledby="exp-title">
      <div className="section-head">
        <div className="label mono">
          <span>(04)</span>
          <span>Experience</span>
        </div>
        <h2 id="exp-title" className="display">
          Where I&apos;ve <em className="serif">been</em>
        </h2>
      </div>

      <ol className="exp__list">
        {experience.map((e) => (
          <li key={e.company} className="exp__item">
            <span className="exp__rule" aria-hidden="true" />
            <div className="exp__left">
              <span className="exp__period mono exp__fade">
                {e.period} · {e.place}
              </span>
              <h3 className="exp__company exp__fade">{e.company}</h3>
              {e.image && (
                <div className="exp__media exp__fade">
                  <Image src={e.image} alt={`${e.company} office`} fill sizes="(max-width: 760px) 100vw, 40vw" />
                </div>
              )}
            </div>
            <div className="exp__right">
              <p className="exp__role exp__fade">{e.role}</p>
              <p className="exp__body exp__fade">{e.body}</p>
              {e.links.length > 0 && (
                <ul className="exp__links exp__fade">
                  {e.links.map((l) => (
                    <li key={l.url}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="link-underline">
                        {l.label} <span aria-hidden="true">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
