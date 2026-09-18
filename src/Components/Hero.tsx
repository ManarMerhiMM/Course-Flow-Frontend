import type { ReactNode } from 'react';
import '../CSS/Hero.css';
import Wordmark from './Wordmark.tsx';

interface HeroProps {
  title: ReactNode;
  description: ReactNode;
}

export default function Hero({ title, description }: HeroProps) {
  return (
    <div className="cf-hero">
      <div className="cf-hero-inner">
        <Wordmark />
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}
