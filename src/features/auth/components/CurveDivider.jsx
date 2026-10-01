export default function CurveDivider() {
  return (
    <svg
      className="curveDivider"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(37, 99, 235, 0.1)" />
          <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
        </linearGradient>
      </defs>
      <path
        d="M 0 0 Q 300 500 0 1000 L 1000 1000 L 1000 0 Q 700 500 1000 0 Z"
        fill="url(#curveGradient)"
      />
      <path
        d="M 0 0 Q 250 450 0 900"
        stroke="rgba(37, 99, 235, 0.15)"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
