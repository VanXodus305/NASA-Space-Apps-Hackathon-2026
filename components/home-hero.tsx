"use client";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Orbit } from "lucide-react";
import { Cosmos } from "./cosmos";
import AnimatedContent from "./react-bits/animated-content";
export function HomeHero() {
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
            <h1 className="max-w-3xl font-display text-[clamp(3.6rem,7.8vw,7rem)] font-medium leading-[.99] tracking-[-.07em]">
              The sky is
              <br />
              never <span className="text-[#bda0ce]">still.</span>
              <span className="ml-3 inline-block align-top text-3xl text-[#bda0ce]">
                ✳
              </span>
            </h1>
            <p className="mt-7 max-w-[390px] text-sm leading-7 text-[#b4aabe] sm:text-base">
              A billion objects. A universe of possibilities.
              <br />
              Explore NASA’s SPHEREx images through time.
              <br />
              The next discovery could be yours.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <a
                href="#observatory"
                className="flex min-h-12 items-center gap-7 rounded-full bg-[#d6bce7] px-6 text-sm font-medium text-[#21172b] transition hover:bg-[#ead7f4]"
              >
                Explore the sky <ArrowDown size={17} />
              </a>
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
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-y-6 px-5 py-7 sm:grid-cols-4 sm:px-10 lg:px-16">
          {[
            ["102", "INFRARED CHANNELS"],
            ["06", "DETECTOR ARRAYS"],
            ["360°", "OF POSSIBILITY"],
            ["YOU", "THE NEXT EXPLORER"],
          ].map(([number, label]) => (
            <div
              key={label}
              className="flex items-center gap-4 border-l border-white/15 pl-5 first:border-0 first:pl-0"
            >
              <span className="font-display text-2xl text-[#d0b4e0]">
                {number}
              </span>
              <span className="max-w-24 font-mono text-[9px] leading-4 tracking-[.13em] text-[#92889e]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
