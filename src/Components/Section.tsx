import type { ReactNode } from 'react';
import '../CSS/Section.css';
import SectionHeader from './SectionHeader.tsx';

interface SectionProps {
  num: string;
  title: string;
  hint?: ReactNode;
  children: ReactNode;
}

export default function Section({ num, title, hint, children }: SectionProps) {
  return (
    <section className="cf-section">
      <SectionHeader num={num} title={title} />

      {hint && <p className="cf-section-hint">{hint}</p>}

      {children}
    </section>
  );
}
