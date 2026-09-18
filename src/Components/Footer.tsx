import '../CSS/Footer.css';
import Wordmark from './Wordmark.tsx';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="cf-footer">
      <div className="cf-footer-inner">
        <Wordmark />

        <p className="cf-footer-text">
          Your scheduling made easier.
        </p>

        <p className="cf-footer-copy">© {year} N8 Owls</p>
      </div>
    </footer>
  );
}
