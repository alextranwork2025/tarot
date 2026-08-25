type SacredGeometryProps = {
  variant?: "sun" | "moon" | "seal";
  className?: string;
};

export function SacredGeometry({
  variant = "seal",
  className = "",
}: SacredGeometryProps) {
  if (variant === "moon") {
    return (
      <svg className={className} viewBox="0 0 220 220" aria-hidden="true">
        <circle cx="110" cy="110" r="82" fill="none" stroke="currentColor" strokeWidth="1" />
        <path
          d="M130 34a82 82 0 1 0 0 152 62 82 0 1 1 0-152Z"
          fill="currentColor"
          opacity=".18"
        />
        <circle cx="110" cy="110" r="48" fill="none" stroke="currentColor" strokeWidth=".8" />
      </svg>
    );
  }

  if (variant === "sun") {
    return (
      <svg className={className} viewBox="0 0 220 220" aria-hidden="true">
        <circle cx="110" cy="110" r="38" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="110" cy="110" r="70" fill="none" stroke="currentColor" strokeWidth=".8" />
        {Array.from({ length: 12 }).map((_, index) => (
          <line
            key={index}
            x1="110"
            y1="20"
            x2="110"
            y2="43"
            stroke="currentColor"
            strokeWidth=".9"
            transform={`rotate(${index * 30} 110 110)`}
          />
        ))}
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 260 420" aria-hidden="true">
      <rect x="23" y="23" width="214" height="374" rx="112" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="130" cy="156" r="72" fill="none" stroke="currentColor" strokeWidth=".9" />
      <circle cx="130" cy="206" r="72" fill="none" stroke="currentColor" strokeWidth=".9" />
      <path d="M130 66 202 210 130 354 58 210Z" fill="none" stroke="currentColor" strokeWidth=".9" />
      <path d="M77 210h106M130 84v252" stroke="currentColor" strokeWidth=".9" />
      <circle cx="130" cy="210" r="18" fill="currentColor" opacity=".18" />
    </svg>
  );
}
