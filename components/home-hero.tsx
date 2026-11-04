"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Magnetic, Reveal, KineticHeading, Shine } from "./motion-effects";
import { ArrowDown, ArrowUpRight, Orbit } from "lucide-react";
import { Cosmos } from "./cosmos";
import AnimatedContent from "./react-bits/animated-content";
export function HomeHero() {
  const reduced = useReducedMotion();
  return (
    <>
      <section className="relative isolate mx-auto min-h-[590px] max-w-[1600px] overflow-hidden border-b border-white/10">
        <div className="max-sm:opacity-40">
          <Cosmos />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#08080e] via-[#08080e]/45 to-transparent" />
        <div className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-16 sm:px-10 sm:pt-24 lg:px-16">
          <AnimatedContent distance={30} blur={5} duration={1} trigger="mount">
            <div className="mb-8 flex items-center gap-3 font-mono text-[10px] tracking-[.2em] text-[#c5b3d4]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#bfa0d9] shadow-[0_0_12px_#bfa0d9]" />{" "}
              YOUR WINDOW INTO THE INFRARED UNIVERSE
            </div>
            <KineticHeading
              lines={["The sky is", "never still."]}
              accentWord="still."
              className="max-w-3xl font-display text-[clamp(3.6rem,7.8vw,7rem)] font-medium leading-[.93] tracking-[-.07em]"
            />

            <p className="mt-7 max-w-[390px] text-sm leading-7 text-[#b4aabe] sm:text-base">
              A billion objects. A universe of possibilities.
              <br />
              Explore NASA’s SPHEREx images through time.
              <br />
              The next discovery could be yours.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Magnetic>
                <a
                  href="#observatory"
                  className="relative flex min-h-12 items-center gap-7 overflow-hidden rounded-full bg-[#d6bce7] px-6 text-sm font-medium text-[#21172b] transition hover:bg-[#ead7f4]"
                >
                  <Shine />
                  Explore the sky{" "}
                  <motion.span
                    animate={reduced ? {} : { y: [-2, 3, -2] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ArrowDown size={17} />
                  </motion.span>
                </a>
              </Magnetic>
              <Link
                href="/targets"
                className="flex items-center gap-2 py-3 text-sm text-[#d6c9df] hover:text-white"
              >
                Find your first target <ArrowUpRight size={16} />
              </Link>
            </div>
          </AnimatedContent>
        </div>
        <div className="absolute bottom-9 right-16 hidden items-center gap-3 font-mono text-[9px] tracking-[.18em] text-[#ab9cba] lg:flex">
          <Orbit size={17} /> AN ENTIRE SKY. AN ENTIRELY NEW PERSPECTIVE.
        </div>
      </section>
      <div className="border-b border-white/10">
        <Reveal
          stagger={0.1}
          blur={0}
          className="mx-auto grid max-w-[1440px] grid-cols-2 gap-y-6 px-5 py-7 sm:grid-cols-4 sm:px-10 lg:px-16"
        >
          {[
            ["102", "INFRARED CHANNELS"],
            ["06", "DETECTOR ARRAYS"],
            ["360°", "OF POSSIBILITY"],
            ["YOU", "THE NEXT EXPLORER"],
          ].map(([number, label]) => (
            <motion.div
              whileHover={reduced ? {} : { y: -4 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              key={label}
              className="flex items-center gap-4 border-l border-white/15 pl-5 first:border-0 first:pl-0"
            >
              <span className="font-display text-2xl text-[#d0b4e0]">
                {number}
              </span>
              <span className="max-w-24 font-mono text-[9px] leading-4 tracking-[.13em] text-[#92889e]">
                {label}
              </span>
            </motion.div>
          ))}
        </Reveal>
      </div>
    </>
  );
}
