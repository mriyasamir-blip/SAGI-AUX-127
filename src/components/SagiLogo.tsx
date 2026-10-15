import React from 'react';

interface SagiLogoProps {
  className?: string;
  size?: number;
}

/**
 * SAGI 127 Mascot Logo
 * 3D Tomato-bird character with headset, SAGI badge, and 127 embossed gold lettering.
 */
export const SagiLogo: React.FC<SagiLogoProps> = ({ className = 'w-10 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        {/* Tomato Head Gradients */}
        <radialGradient id="tomatoGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#ff7b54" />
          <stop offset="45%" stopColor="#ff4d36" />
          <stop offset="85%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>
        <radialGradient id="tomatoHighlight" cx="35%" cy="28%" r="35%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* Leaf Gradients */}
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        {/* Headset Gradients */}
        <linearGradient id="headbandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <radialGradient id="earcupGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="35%" stopColor="#38bdf8" />
          <stop offset="85%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>

        {/* Body Gradients */}
        <radialGradient id="bodyGrad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="50%" stopColor="#bae6fd" />
          <stop offset="85%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#38bdf8" />
        </radialGradient>

        {/* Gold Numbers Gradient */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#facc15" />
          <stop offset="70%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>

        {/* Feet Gradient */}
        <linearGradient id="feetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        {/* Cheek Blush */}
        <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fda4af" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Feet */}
      <g id="feet">
        {/* Left Foot */}
        <ellipse cx="80" cy="180" rx="14" ry="7" fill="url(#feetGrad)" />
        <ellipse cx="73" cy="181" rx="5" ry="3" fill="#ea580c" />
        <ellipse cx="87" cy="181" rx="5" ry="3" fill="#ea580c" />
        <rect x="78" y="166" width="5" height="12" rx="2.5" fill="#ea580c" />

        {/* Right Foot */}
        <ellipse cx="120" cy="180" rx="14" ry="7" fill="url(#feetGrad)" />
        <ellipse cx="113" cy="181" rx="5" ry="3" fill="#ea580c" />
        <ellipse cx="127" cy="181" rx="5" ry="3" fill="#ea580c" />
        <rect x="117" y="166" width="5" height="12" rx="2.5" fill="#ea580c" />
      </g>

      {/* Bird Body */}
      <g id="body">
        {/* Main chubby body */}
        <ellipse cx="100" cy="138" rx="46" ry="38" fill="url(#bodyGrad)" />
        
        {/* Left Wing */}
        <path
          d="M 58 122 C 48 132 46 150 56 154 C 64 157 70 144 68 132 Z"
          fill="url(#bodyGrad)"
          stroke="#7dd3fc"
          strokeWidth="1.5"
        />

        {/* Right Wing */}
        <path
          d="M 142 122 C 152 132 154 150 144 154 C 136 157 130 144 132 132 Z"
          fill="url(#bodyGrad)"
          stroke="#7dd3fc"
          strokeWidth="1.5"
        />

        {/* Neck Fluff Collar */}
        <path
          d="M 68 114 Q 78 123 88 116 Q 100 125 112 116 Q 122 123 132 114 C 122 108 78 108 68 114 Z"
          fill="#e0f2fe"
        />

        {/* SAGI Nametag Badge */}
        <g id="nametag" transform="translate(62, 122)">
          <rect
            x="0"
            y="0"
            width="28"
            height="14"
            rx="4"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="1"
          />
          <text
            x="14"
            y="10"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="8"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.5"
          >
            SAGI
          </text>
        </g>

        {/* Embossed Gold '127' */}
        <text
          x="100"
          y="156"
          textAnchor="middle"
          fill="url(#goldGrad)"
          fontSize="24"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          letterSpacing="1"
          style={{ filter: 'drop-shadow(0px 1.5px 1px rgba(113, 63, 18, 0.4))' }}
        >
          127
        </text>
      </g>

      {/* Headset Arc (Behind Head) */}
      <path
        d="M 46 80 C 46 36 154 36 154 80"
        fill="none"
        stroke="url(#headbandGrad)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M 50 78 C 50 40 150 40 150 78"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />

      {/* Tomato Head */}
      <g id="head">
        {/* Main Round Head */}
        <circle cx="100" cy="74" r="48" fill="url(#tomatoGrad)" />
        {/* Head glossy highlight */}
        <ellipse cx="82" cy="52" rx="24" ry="15" fill="url(#tomatoHighlight)" />

        {/* Leaf Sprout on Top */}
        <g id="sprout" transform="translate(100, 26)">
          <path
            d="M 0 6 C -12 2 -18 -8 -12 -12 C -4 -10 -2 0 0 6 Z"
            fill="url(#leafGrad)"
          />
          <path
            d="M 0 6 C 12 2 18 -8 12 -12 C 4 -10 2 0 0 6 Z"
            fill="url(#leafGrad)"
          />
          <path
            d="M 0 6 C 0 -6 3 -15 0 -17 C -3 -15 -1 -6 0 6 Z"
            fill="url(#leafGrad)"
          />
          <ellipse cx="0" cy="5" rx="5" ry="3" fill="#15803d" />
        </g>

        {/* Cheeks */}
        <ellipse cx="74" cy="84" rx="8" ry="5" fill="url(#blushGrad)" />
        <ellipse cx="126" cy="84" rx="8" ry="5" fill="url(#blushGrad)" />

        {/* Eyes */}
        {/* Left Eye */}
        <ellipse cx="78" cy="74" rx="6.5" ry="8" fill="#3b0707" />
        <ellipse cx="76.5" cy="71.5" rx="2.5" ry="3.5" fill="#ffffff" />
        <circle cx="80" cy="77" r="1.2" fill="#ffffff" />

        {/* Right Eye */}
        <ellipse cx="122" cy="74" rx="6.5" ry="8" fill="#3b0707" />
        <ellipse cx="120.5" cy="71.5" rx="2.5" ry="3.5" fill="#ffffff" />
        <circle cx="124" cy="77" r="1.2" fill="#ffffff" />

        {/* Happy Smiling Open Mouth */}
        <path
          d="M 90 84 Q 100 97 110 84 Q 100 87 90 84 Z"
          fill="#881337"
        />
        <path
          d="M 93 87 Q 100 95 107 87 Q 100 86 93 87 Z"
          fill="#f43f5e"
        />
      </g>

      {/* Headset Ear Cups & Mic (In Front of Head) */}
      <g id="headset-front">
        {/* Left Earcup */}
        <g transform="translate(42, 60)">
          <rect x="0" y="0" width="13" height="34" rx="6.5" fill="url(#earcupGrad)" />
          <rect x="2" y="3" width="9" height="28" rx="4.5" fill="#0284c7" />
          <ellipse cx="6.5" cy="12" rx="3" ry="7" fill="#ffffff" fillOpacity="0.45" />
        </g>

        {/* Right Earcup */}
        <g transform="translate(145, 60)">
          <rect x="0" y="0" width="13" height="34" rx="6.5" fill="url(#earcupGrad)" />
          <rect x="2" y="3" width="9" height="28" rx="4.5" fill="#0284c7" />
          <ellipse cx="6.5" cy="12" rx="3" ry="7" fill="#ffffff" fillOpacity="0.45" />
        </g>

        {/* Headset Mic Boom attached to right earcup */}
        <path
          d="M 148 84 Q 138 108 118 104"
          fill="none"
          stroke="#0284c7"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Mic Capsule Tip */}
        <rect
          x="108"
          y="99"
          width="13"
          height="8"
          rx="4"
          fill="#0f172a"
          stroke="#38bdf8"
          strokeWidth="1.2"
        />
      </g>
    </svg>
  );
};
