import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Lang } from './data';
import './scroll-journey.css';

const labels = {
  kk: { navigation: 'Бет бөлімдері', stages: ['Бастау', 'Бағдарламалар', 'Оқу тәсілі', 'Сұрақтар'], journey: 'ӘР ҚАДАМ — ЖАҢА МҮМКІНДІК', words: ['Үйрен.', 'Қолдан.', 'Алға жылжы.'] },
  ru: { navigation: 'Разделы страницы', stages: ['Начало', 'Программы', 'Как мы учимся', 'Вопросы'], journey: 'КАЖДЫЙ ШАГ — НОВАЯ ВОЗМОЖНОСТЬ', words: ['Учись.', 'Применяй.', 'Двигайся вперёд.'] },
};
const sectionIds = ['start', 'programmes', 'approach', 'faq'];

export function ScrollJourney({ lang }: { lang: Lang }) {
  const text = labels[lang];
  const root = useRef<HTMLDivElement>(null);
  const ribbon = useRef<HTMLDivElement>(null);
  const percentage = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const element = root.current!;
    const band = ribbon.current!;
    const track = band.querySelector<HTMLElement>('.scroll-ribbon-track')!;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let disposed = false;
    let lastPercent = -1;
    const animations = new Set<Animation>();
    const sections = sectionIds.map(id => document.getElementById(id));
    const update = () => {
      frame = 0;
      if (disposed || !element.isConnected || !percentage.current) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
      element.style.setProperty('--page-progress', String(progress));
      element.dataset.started = String(window.scrollY > 120);
      const percent = Math.round(progress * 100);
      if (percent !== lastPercent) {
        percentage.current.textContent = `${String(percent).padStart(2, '0')}%`;
        lastPercent = percent;
      }
      let current = 0;
      sections.forEach((section, index) => {
        if (section && section.getBoundingClientRect().top <= window.innerHeight * .32) current = index;
      });
      setActive(previous => previous === current ? previous : current);
      const bounds = band.getBoundingClientRect();
      const passage = Math.max(0, Math.min(1, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)));
      const travel = Math.max(170, track.scrollWidth - window.innerWidth + 100);
      band.style.setProperty('--ribbon-shift', preference.matches ? '0px' : `${55 - passage * travel}px`);
      band.style.setProperty('--ribbon-turn', preference.matches ? '0deg' : `${passage * 90 - 45}deg`);
    };
    const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(update); };
    const reveal = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal.unobserve(entry.target);
        if (preference.matches) continue;
        // Content stays visible without JS and in full-page captures. Only its entrance animates.
        const animation = entry.target.animate([
          { opacity: .35, transform: 'translateY(26px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 650, easing: 'cubic-bezier(.2,.75,.25,1)' });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { threshold: .12, rootMargin: '0px 0px -25px 0px' });
    document.querySelectorAll('.section-heading, .programme-row, .finder-banner, .learning-step, .faq-list .accordion, .consult-banner, .footer-signature').forEach(node => reveal.observe(node));
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    const motionChanged = () => { if (preference.matches) { animations.forEach(animation => animation.cancel()); animations.clear(); } schedule(); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    preference.addEventListener('change', motionChanged);
    document.fonts.ready.then(schedule);
    update();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      preference.removeEventListener('change', motionChanged);
      resize.disconnect();
      reveal.disconnect();
      animations.forEach(animation => animation.cancel());
    };
  }, []);

  return <>
    <div ref={root} className="scroll-experience" data-started="false">
      <div className="scroll-progress" aria-hidden="true"><span /></div>
      <nav className="scroll-journey" aria-label={text.navigation}>
        <span className="scroll-current" aria-hidden="true"><ArrowUpRight size={17}/><span>{text.stages[active]}</span></span>
        <div className="scroll-stops">
          {sectionIds.map((id, index) => <a key={id} href={`#${id}`} aria-label={text.stages[index]} aria-current={active === index ? 'location' : undefined} className={`scroll-stop${active === index ? ' is-current' : ''}${active > index ? ' is-past' : ''}`}><span className="scroll-stop-dot" aria-hidden="true">{String(index).padStart(2, '0')}</span><span className="scroll-stop-label" aria-hidden="true">{text.stages[index]}</span></a>)}
        </div>
        <span ref={percentage} className="scroll-percentage" aria-hidden="true">00%</span>
      </nav>
    </div>
    <div ref={ribbon} className="scroll-ribbon" aria-label={text.words.join(' ')}>
      <div className="container scroll-ribbon-caption"><span className="orange-dot"/>{text.journey}<span aria-hidden="true">↓</span></div>
      <div className="scroll-ribbon-window" aria-hidden="true"><div className="scroll-ribbon-track">{text.words.map((word, index) => <span key={word} className={index === 1 ? 'ribbon-outline' : ''}>{word}<ArrowUpRight /></span>)}</div></div>
    </div>
  </>;
}
