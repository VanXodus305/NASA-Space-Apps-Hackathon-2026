"use client";

import { type ReactNode, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import AnimatedContent, {
  type AnimatedContentProps,
} from "./react-bits/animated-content";
import Magnet from "./react-bits/magnet";

export function Reveal(props: AnimatedContentProps) {
  return (
    <AnimatedContent
      distance={32}
      duration={0.85}
      blur={4}
      threshold={0.06}
      {...props}
    />
  );
}

export function Magnetic({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <Magnet
      disabled={Boolean(reduced)}
      padding={24}
      magnetStrength={6}
      maxOffset={7}
      tilt={3}
      wrapperClassName={className}
    >
      {children}
    </Magnet>
  );
}

export function PageEntrance({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={false}
      animate={
        reduced
          ? { opacity: 1, y: 0 }
          : { opacity: [0.35, 1], y: [28, 0], scale: [0.99, 1] }
      }
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 130, damping: 28 });
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-linear-to-r from-[#7563ae] via-[#d6b8e8] to-[#eed5df]"
      style={{ scaleX: reduced ? scrollYProgress : smooth }}
    />
  );
}

export function InteractiveCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 160, damping: 24 }),
    rotateY = useSpring(y, { stiffness: 160, damping: 24 });
  return (
    <motion.div
      ref={ref}
      className={`relative h-full ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onPointerMove={(event) => {
        if (reduced || event.pointerType !== "mouse") return;
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set(-((event.clientY - rect.top) / rect.height - 0.5) * 5);
        y.set(((event.clientX - rect.left) / rect.width - 0.5) * 5);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileHover={reduced ? {} : { y: -5 }}
      transition={{ type: "spring", stiffness: 160, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}

export function OrbitalAccent() {
  const reduced = useReducedMotion();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-2 hidden h-64 w-64 items-center justify-center md:flex"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-5 rounded-full border border-[#c5a6db]/20"
          initial={false}
          animate={reduced ? {} : { rotate: [i * 60, i * 60 + 360] }}
          transition={{
            duration: 30 + i * 12,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute inset-x-8 inset-y-0 rounded-full border border-dashed border-[#c5a6db]/15" />
          <span className="absolute left-1/2 top-0 h-1.5 w-1.5 rounded-full bg-[#d2b1e5] shadow-[0_0_18px_#c5a6db]" />
        </motion.div>
      ))}
      <motion.span
        className="font-display text-8xl text-[#c5a6db]/50"
        animate={reduced ? {} : { rotate: [0, 90, 0], scale: [0.85, 1, 0.85] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      >
        ✳
      </motion.span>
    </div>
  );
}

/** Word-by-word entrance, with a readable static counterpart for reduced motion. */
export function KineticHeading({
  lines,
  accentWord,
  className = "",
}: {
  lines: string[];
  accentWord?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  let wordIndex = 0;
  return (
    <h1 aria-label={lines.join(" ")} className={className}>
      {lines.map((line, lineIndex) => (
        <span aria-hidden="true" className="block" key={line}>
          {line.split(" ").map((word, index) => {
            const delay = 0.12 + wordIndex++ * 0.11;
            return (
              <span
                key={`${word}-${index}`}
                className="inline-block overflow-hidden pb-[.12em] align-top [perspective:600px]"
              >
                <motion.span
                  className={`inline-block origin-bottom ${accentWord === word ? "bg-linear-to-r from-[#e8c4f7] via-[#ac9be7] to-[#e8c4f7] bg-size-[200%_100%] bg-clip-text text-transparent" : ""}`}
                  initial={
                    reduced ? false : { y: "110%", rotateX: 65, opacity: 0 }
                  }
                  animate={{
                    y: "0%",
                    rotateX: 0,
                    opacity: 1,
                    ...(accentWord === word && !reduced
                      ? { backgroundPosition: ["0% 50%", "200% 50%"] }
                      : {}),
                  }}
                  transition={{
                    duration: 0.85,
                    delay,
                    ease: [0.16, 1, 0.3, 1],
                    backgroundPosition: {
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear",
                    },
                  }}
                >
                  {word}
                  {index < line.split(" ").length - 1 ? "\u00a0" : ""}
                </motion.span>
              </span>
            );
          })}
          {lineIndex === lines.length - 1 && (
            <motion.span
              className="ml-3 inline-block align-top text-3xl text-[#bda0ce]"
              animate={
                reduced ? {} : { rotate: [0, 180], scale: [0.8, 1, 0.8] }
              }
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            >
              ✳
            </motion.span>
          )}
        </span>
      ))}
    </h1>
  );
}

export function MotionSection({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      id={id}
      className={className}
      initial={reduced ? false : { opacity: 0, y: 38 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.section>
  );
}

export function Shine() {
  const reduced = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-20 bg-linear-to-r from-transparent via-white/35 to-transparent"
      initial={false}
      animate={
        reduced ? { opacity: 0 } : { x: ["-150%", "450%"], opacity: [0, 1, 0] }
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "easeInOut",
      }}
    />
  );
}
