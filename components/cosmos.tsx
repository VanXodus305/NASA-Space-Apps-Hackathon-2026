"use client";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useEffect, useId, useRef, useSyncExternalStore } from "react";

const orbit = (radiusX: number, radiusY: number, phase: number) =>
  Array.from({ length: 65 }, (_, i) => {
    const angle = (i / 64) * Math.PI * 2 + phase;
    return { x: Math.cos(angle) * radiusX, y: Math.sin(angle) * radiusY };
  });
const orbits = [
  orbit(337, 113, 0),
  orbit(337, 113, Math.PI),
  orbit(285, 96, 1.8),
];
const subscribeVisibility = (callback: () => void) => {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
};
const pageVisible = () => !document.hidden;

export function Cosmos({
  compact = false,
  color = "#b9a0d4",
}: {
  compact?: boolean;
  color?: string;
}) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { margin: "100px" });
  const visible = useSyncExternalStore(
    subscribeVisibility,
    pageVisible,
    () => true,
  );
  const active = !reduced && inView && visible;
  const pointerX = useMotionValue(0),
    pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 45, damping: 20 }),
    y = useSpring(pointerY, { stiffness: 45, damping: 20 });
  useEffect(() => {
    if (!active) return;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      pointerX.set(
        inside ? ((event.clientX - rect.left) / rect.width - 0.5) * 26 : 0,
      );
      pointerY.set(
        inside ? ((event.clientY - rect.top) / rect.height - 0.5) * 20 : 0,
      );
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      pointerX.set(0);
      pointerY.set(0);
    };
  }, [active, pointerX, pointerY]);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-testid="cosmos"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        className="absolute right-[6%] top-[15%] h-[65%] w-[55%] rounded-full bg-[radial-gradient(ellipse,#9d62cc30,transparent_68%)]"
        animate={
          active
            ? {
                scale: [0.85, 1.2, 0.85],
                opacity: [0.45, 1, 0.45],
                rotate: [-12, 12, -12],
              }
            : { scale: 1, opacity: 0.65 }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 650"
        preserveAspectRatio="xMidYMid slice"
        style={{ x: reduced ? 0 : x, y: reduced ? 0 : y }}
      >
        <defs>
          <radialGradient id={`${id}-glow`}>
            <stop stopColor={color} stopOpacity=".24" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-planet`} cx="29%" cy="23%" r="85%">
            <stop stopColor="#f2dcf9" />
            <stop offset=".24" stopColor={color} />
            <stop offset=".58" stopColor="#514477" />
            <stop offset=".88" stopColor="#161322" />
            <stop offset="1" stopColor="#080810" />
          </radialGradient>
          <radialGradient id={`${id}-rim`}>
            <stop offset=".87" stopColor="#d4a4ff" stopOpacity="0" />
            <stop offset=".97" stopColor="#d4a4ff" stopOpacity=".35" />
            <stop offset="1" stopColor="#d4a4ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-ring`}>
            <stop stopColor="#e8bcf9" stopOpacity=".05" />
            <stop offset=".45" stopColor="#e8bcf9" />
            <stop offset=".7" stopColor="#9fa9ff" />
            <stop offset="1" stopColor="#9fa9ff" stopOpacity="0" />
          </linearGradient>
          <filter id={`${id}-texture`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency=".025"
              numOctaves="3"
              seed="12"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComposite in2="SourceGraphic" operator="in" />
            <feBlend in="SourceGraphic" mode="soft-light" />
          </filter>
          <clipPath id={`${id}-clip`}>
            <circle r="165" />
          </clipPath>
        </defs>
        <ellipse
          cx="850"
          cy="325"
          rx="430"
          ry="330"
          fill={`url(#${id}-glow)`}
        />
        <motion.g
          animate={active ? { x: [0, -18, 0], y: [0, 12, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        >
          {Array.from({ length: 80 }, (_, i) => (
            <circle
              key={i}
              cx={(i * 167.31 + 41) % 1200}
              cy={(i * 97.81 + 30) % 650}
              r={i % 9 === 0 ? 1.4 : 0.65}
              fill="#e8e2f2"
              opacity={0.15 + (i % 5) * 0.13}
            />
          ))}
        </motion.g>
        {Array.from({ length: 10 }, (_, i) => (
          <motion.circle
            key={i}
            cx={80 + ((i * 113) % 1100)}
            cy={45 + ((i * 89) % 560)}
            r={i % 3 === 0 ? 2 : 1}
            fill="#eadbff"
            animate={
              active
                ? { opacity: [0.15, 0.9, 0.15], scale: [0.6, 1.3, 0.6] }
                : { opacity: 0.5, scale: 1 }
            }
            transition={{
              duration: 3 + (i % 4),
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        <g transform={`translate(${compact ? 680 : 850} 325)`}>
          <motion.g
            data-testid="orbital-motion"
            animate={
              active
                ? { y: [0, -16, 0], rotate: [-3, 4, -3] }
                : { y: 0, rotate: 0 }
            }
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          >
            <g transform="rotate(-28)">
              <ellipse
                rx="360"
                ry="122"
                fill="none"
                stroke={color}
                strokeOpacity=".2"
              />
              <motion.ellipse
                rx="309"
                ry="100"
                fill="none"
                stroke={color}
                strokeOpacity=".4"
                strokeDasharray="2 12"
                animate={
                  active
                    ? { strokeDashoffset: [0, -140] }
                    : { strokeDashoffset: 0 }
                }
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              />
              <circle r="174" fill={`url(#${id}-rim)`} />
              <circle r="166" fill={`url(#${id}-planet)`} />
              <g clipPath={`url(#${id}-clip)`}>
                <motion.circle
                  r="181"
                  fill={`url(#${id}-planet)`}
                  filter={`url(#${id}-texture)`}
                  opacity=".5"
                  animate={
                    active
                      ? { rotate: [0, 360], x: [-8, 8, -8] }
                      : { rotate: 0, x: 0 }
                  }
                  transition={{
                    rotate: { duration: 65, repeat: Infinity, ease: "linear" },
                    x: { duration: 12, repeat: Infinity, ease: "easeInOut" },
                  }}
                />
              </g>
              <path
                d="M-360 0 A360 122 0 0 0 360 0"
                fill="none"
                stroke={`url(#${id}-ring)`}
                strokeWidth="1.8"
              />
              <path
                d="M-337 0 A337 113 0 0 0 337 0"
                fill="none"
                stroke="#e8d8ee"
                strokeWidth=".6"
                strokeOpacity=".5"
              />
              {orbits.map((points, i) => (
                <motion.g
                  key={i}
                  animate={
                    active
                      ? { x: points.map((p) => p.x), y: points.map((p) => p.y) }
                      : { x: points[0].x, y: points[0].y }
                  }
                  transition={{
                    duration: 12 + i * 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <circle r={i === 0 ? 13 : 8} fill={color} opacity=".1" />
                  <circle
                    r={i === 0 ? 6 : 3}
                    fill={i === 1 ? "#9daeff" : "#f3dafa"}
                  />
                  <circle r={i === 0 ? 2 : 1} fill="white" />
                </motion.g>
              ))}
              <motion.ellipse
                rx="380"
                ry="140"
                fill="none"
                stroke={`url(#${id}-ring)`}
                strokeWidth=".5"
                strokeDasharray="65 900"
                animate={
                  active
                    ? { strokeDashoffset: [0, -1600] }
                    : { strokeDashoffset: 0 }
                }
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />
            </g>
          </motion.g>
        </g>
        {[0, 1].map((i) => (
          <motion.path
            key={i}
            d={`M${680 + i * 220} ${70 + i * 210} l-90 50`}
            stroke={`url(#${id}-ring)`}
            strokeWidth="1.3"
            initial={false}
            animate={
              active
                ? {
                    x: [120, -160, -160],
                    y: [-70, 90, 90],
                    opacity: [0, 0.8, 0],
                    pathLength: [0, 1, 0],
                  }
                : { opacity: 0 }
            }
            transition={{
              duration: 2.6,
              delay: i * 4,
              repeat: Infinity,
              repeatDelay: 6 + i * 3,
              ease: "easeOut",
            }}
          />
        ))}
        {!compact && (
          <motion.g
            fill="#c9bbd7"
            fontFamily="monospace"
            fontSize="9"
            letterSpacing="2"
            animate={active ? { opacity: [0.4, 0.85, 0.4] } : { opacity: 0.7 }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <text x="908" y="118">
              BEYOND THE VISIBLE
            </text>
            <path d="M895 125 L865 170" stroke="#c9bbd7" strokeOpacity=".5" />
            <text x="920" y="510">
              0.75 — 5.00 μm
            </text>
          </motion.g>
        )}
      </motion.svg>
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
