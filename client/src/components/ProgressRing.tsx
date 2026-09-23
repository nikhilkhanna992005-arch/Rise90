type ProgressRingProps = { value: number; label?: string; size?: number };

export function ProgressRing({ value, label = "Completion", size = 136 }: ProgressRingProps) {
  const safeValue = Math.max(0, Math.min(100, value));
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-label={`${safeValue.toFixed(1)}% ${label}`}>
      <svg width={size} height={size} className="-rotate-90" role="img">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,.08)" strokeWidth={stroke} fill="transparent" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="url(#ring-gradient)" strokeWidth={stroke} fill="transparent" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-500" />
        <defs><linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d9ff3e" /><stop offset="1" stopColor="#8ea4ff" /></linearGradient></defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center"><div><p className="font-display text-2xl font-bold text-white">{safeValue.toFixed(1)}%</p><p className="mt-0.5 text-[10px] uppercase tracking-[.16em] text-white/45">{label}</p></div></div>
    </div>
  );
}
