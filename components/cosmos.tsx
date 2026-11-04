"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";

export function Cosmos({
  compact = false,
  color = "#b9a0d4",
}: {
  compact?: boolean;
  color?: string;
}) {
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 650"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id={`${id}-glow`}>
            <stop stopColor={color} stopOpacity=".2" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-planet`} cx="30%" cy="25%" r="80%">
            <stop stopColor="#e7d3ed" />
            <stop offset=".3" stopColor={color} />
            <stop offset=".65" stopColor="#434069" />
            <stop offset="1" stopColor="#080810" />
          </radialGradient>
          <filter id={`${id}-texture`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency=".025"
              numOctaves="4"
              seed="12"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComposite in2="SourceGraphic" operator="in" />
            <feBlend in="SourceGraphic" mode="soft-light" />
          </filter>
        </defs>
        <ellipse
          cx="830"
          cy="320"
          rx="450"
          ry="360"
          fill={`url(#${id}-glow)`}
        />
        {Array.from({ length: 100 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 167.31 + 41) % 1200}
            cy={(i * 97.81 + 30) % 650}
            r={i % 9 === 0 ? 1.4 : 0.65}
            fill="#e8e2f2"
            opacity={0.2 + (i % 5) * 0.13}
          />
        ))}
        <motion.g
          animate={reduced ? {} : { rotate: [0, 8, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
        >
          <g transform={`translate(${compact ? 680 : 850} 325) rotate(-28)`}>
            <ellipse
              rx="360"
              ry="122"
              fill="none"
              stroke={color}
              strokeOpacity=".18"
            />
            <ellipse
              rx="309"
              ry="100"
              fill="none"
              stroke={color}
              strokeOpacity=".3"
              strokeDasharray="2 9"
            />
            <circle r="166" fill={`url(#${id}-planet)`} />
            <circle
              r="165"
              fill={`url(#${id}-planet)`}
              filter={`url(#${id}-texture)`}
              opacity=".55"
            />
            <path
              d="M-360 0 A360 122 0 0 0 360 0"
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeOpacity=".6"
            />
            <path
              d="M-330 0 A330 112 0 0 0 330 0"
              fill="none"
              stroke="#e8d8ee"
              strokeWidth=".5"
              strokeOpacity=".5"
            />
            <circle cx="-290" cy="72" r="5" fill="#eddfef" />
          </g>
        </motion.g>
        {!compact && (
          <g
            fill="#c9bbd7"
            fontFamily="monospace"
            fontSize="9"
            letterSpacing="2"
          >
            <text x="908" y="118">
              BEYOND THE VISIBLE
            </text>
            <path d="M895 125 L865 170" stroke="#c9bbd7" strokeOpacity=".5" />
            <text x="920" y="510">
              0.75 — 5.00 μm
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export function StarMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 40 40"
      fill="none"
    >
      <path
        d="M20 1 L23 15 L39 20 L23 23 L20 39 L17 23 L1 20 L17 16Z"
        fill="currentColor"
      />
      <circle cx="20" cy="20" r="11" stroke="currentColor" strokeWidth=".7" />
    </svg>
  );
}
