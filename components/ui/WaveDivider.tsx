interface WaveDividerProps {
  fill: string;
  height?: number;
  flip?: boolean;
  className?: string;
}

export function WaveDivider({ fill, height = 80, flip = false, className = "" }: WaveDividerProps) {
  return (
    <svg
      className={`w-full ${flip ? "rotate-180" : ""} ${className}`}
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      style={{ height }}
      aria-hidden="true"
    >
      <path d="M0,32 C240,80 480,0 720,24 C960,48 1200,88 1440,40 L1440,80 L0,80 Z" fill={fill} />
    </svg>
  );
}