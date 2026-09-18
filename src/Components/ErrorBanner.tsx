import '../CSS/ErrorBanner.css';

interface ErrorBannerProps {
  title: string;
  message: string;
}

export default function ErrorBanner({ title, message }: ErrorBannerProps) {
  return (
    <div className="cf-banner cf-banner--error">
      <strong>{title}</strong>
      {message}
    </div>
  );
}
