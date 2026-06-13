import { useId } from 'react';

export default function Logo({ className = 'w-10 h-10' }) {
  // Unique per-instance ID prefix — prevents SVG defs conflicts when
  // multiple <Logo /> are mounted on the same page.
  const uid = useId().replace(/:/g, '');
  const goldId    = `logoGold-${uid}`;
  const shadowId  = `logoShadow-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GatherPoint logo"
    >
      <defs>
        <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#FFF2B2" />
          <stop offset="30%"  stopColor="#D4AF37" />
          <stop offset="70%"  stopColor="#AA7C11" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        <filter id={shadowId} x="-15%" y="-15%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* Outer decorative gold ring */}
      <circle
        cx="50" cy="50" r="46"
        stroke={`url(#${goldId})`}
        strokeWidth="2"
        strokeOpacity="0.85"
      />
      <circle
        cx="50" cy="50" r="41"
        stroke={`url(#${goldId})`}
        strokeWidth="0.6"
        strokeOpacity="0.35"
        strokeDasharray="3 3"
      />

      {/* G — anchor left / centre */}
      <text
        x="8"
        y="64"
        fontFamily="'Cinzel', 'Playfair Display', 'Didot', serif"
        fontSize="58"
        fontWeight="800"
        fill={`url(#${goldId})`}
        filter={`url(#${shadowId})`}
        style={{ letterSpacing: '-2px' }}
      >
        G
      </text>

      {/* P — overlapping right, dropped slightly lower */}
      <text
        x="42"
        y="76"
        fontFamily="'Cinzel', 'Playfair Display', 'Didot', serif"
        fontSize="52"
        fontWeight="800"
        fill={`url(#${goldId})`}
        filter={`url(#${shadowId})`}
        style={{ letterSpacing: '-2px' }}
      >
        P
      </text>
    </svg>
  );
}
