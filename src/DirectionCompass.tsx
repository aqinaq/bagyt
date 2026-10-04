import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { programmes, formatName, priceText, type Lang } from './data';
import { translations } from './i18n';

const copy = {
  kk: { label: 'МҮМКІНДІКТЕР КОМПАСЫ', hint: 'Компасты ұстап бұр', controls: 'Бағытты таңдау', help: 'Тінтуірмен не саусақпен сүйреп бұрыңыз немесе пернетақтадағы бағыттау пернелерін қолданыңыз.', yours: 'СЕНІҢ БАҒЫТЫҢ', weeks: 'апта', names: ['Ағылшын тілі', 'IELTS', 'Қазақ тілі', 'Дизайн'] },
  ru: { label: 'КОМПАС ВОЗМОЖНОСТЕЙ', hint: 'Потяни и поверни компас', controls: 'Выбор направления', help: 'Вращайте мышью или пальцем либо используйте клавиши со стрелками.', yours: 'ТВОЁ НАПРАВЛЕНИЕ', weeks: 'недель', names: ['Английский', 'IELTS', 'Казахский', 'Дизайн'] },
};

export function DirectionCompass({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(0);
  const [rotation, setRotation] = useState(45);
  const [dragging, setDragging] = useState(false);
  const rotationRef = useRef(45);
  const drag = useRef<{ pointerId: number; angle: number | null } | null>(null);
  const text = copy[lang];
  const course = programmes[active];
  const t = translations[lang];
  const rotate = (angle: number) => {
    rotationRef.current = angle;
    setRotation(angle);
    setActive(((Math.round((angle - 45) / 90) % 4) + 4) % 4);
  };
  const selectDirection = (index: number) => {
    const target = 45 + index * 90;
    rotate(target + Math.round((rotationRef.current - target) / 360) * 360);
  };
  const pointerAngle = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    // The angle is unstable right at the axle. Resume when the pointer leaves it.
    return Math.hypot(x, y) < 12 ? null : Math.atan2(x, -y) * 180 / Math.PI;
  };
  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0 || drag.current) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerId: event.pointerId, angle: pointerAngle(event) };
    setDragging(true);
  };
  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    const angle = pointerAngle(event);
    const previous = drag.current.angle;
    drag.current.angle = angle;
    if (angle === null || previous === null) return;
    // Unwrap the north crossing so the needle never jumps a full turn.
    rotate(rotationRef.current + ((angle - previous + 540) % 360) - 180);
  };
  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    if (event.type === 'pointerup') moveDrag(event);
    drag.current = null;
    setDragging(false);
    rotate(45 + Math.round((rotationRef.current - 45) / 90) * 90);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (drag.current) return;
    const steps: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (event.key in steps) { event.preventDefault(); rotate(rotationRef.current + steps[event.key] * 90); }
    else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); selectDirection(event.key === 'Home' ? 0 : 3); }
  };
  return <section className={`direction-compass${dragging ? ' is-dragging' : ''}`} aria-label={text.label} style={{ '--direction': `${rotation}deg` } as CSSProperties}>
    <div className="compass-header"><span><i /> BAGYT / LAB</span><span>{text.label}</span></div>
    <div className="compass-dial">
      <div className="compass-grid" aria-hidden="true" />
      <div className="compass-orbit compass-orbit-outer" aria-hidden="true" />
      <div className="compass-orbit compass-orbit-inner" aria-hidden="true" />
      <span className="compass-axis compass-axis-n" aria-hidden="true">N</span>
      <span className="compass-axis compass-axis-s" aria-hidden="true">S</span>
      <div className="compass-sun" role="slider" tabIndex={0} aria-label={text.controls} aria-describedby="compass-help" aria-controls="compass-result" aria-valuemin={1} aria-valuemax={4} aria-valuenow={active + 1} aria-valuetext={text.names[active]} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag} onKeyDown={handleKey}><div className="compass-needle" aria-hidden="true"><svg viewBox="0 0 120 120"><path d="M60 99V23M27 56l33-33 33 33" /></svg></div><span className="compass-center" aria-hidden="true" /></div>
      <span id="compass-help" className="sr-only">{text.help}</span>
      <div className="compass-options" role="group" aria-label={text.controls}>
        {programmes.map((p, index) => <button key={p.id} className={`compass-option compass-option-${index} ${active === index ? 'is-active' : ''}`} aria-pressed={active === index} aria-controls="compass-result" onClick={() => selectDirection(index)}><span className="compass-option-number">{p.number}</span><span>{text.names[index]}</span></button>)}
      </div>
      <span className="compass-coordinate" aria-hidden="true">43°14′ N / 76°53′ E</span>
      <span className="compass-instruction">{text.hint} <span aria-hidden="true">↗</span></span>
    </div>
    <div className="compass-result-region" id="compass-result" aria-live="polite" aria-atomic="true">
      <Link to={`/programmes/${course.id}`} className="compass-result compass-course-card" aria-labelledby="compass-course-title">
        <div className="compass-result-top"><span>{text.yours} / {course.number}</span><ArrowUpRight size={22} aria-hidden="true" /></div>
        <h2 id="compass-course-title">{course.title[lang]}</h2>
        <p className="compass-course-description">{course.description[lang]}</p>
        <dl className="compass-course-facts">
          <div><dt>{t.duration}</dt><dd>{course.weeks} {text.weeks}</dd></div>
          <div><dt>{t.starting}</dt><dd>{course.level === '0' ? t.fromZero : course.level}</dd></div>
          <div><dt>{t.format}</dt><dd>{course.formats.map(format => formatName(format, lang)).join(' / ')}</dd></div>
          <div><dt>{t.price}</dt><dd>{priceText(course.price)} <small>{t.perMonth}</small></dd></div>
        </dl>
      </Link>
    </div>
  </section>;
}
