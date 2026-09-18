import '../CSS/SectionHeader.css';

interface SectionHeaderProps {
  num: string;
  title: string;
}

export default function SectionHeader({ num, title }: SectionHeaderProps) {
  return (
    <div className="cf-section-head">
      <span className="cf-section-num">{num}</span>
      <h2 className="cf-section-title">{title}</h2>
    </div>
  );
}
