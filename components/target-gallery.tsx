"use client";
import Link from "next/link";
import { useState } from "react";
import { Button, Card } from "@heroui/react";
import { ArrowUpRight, MoveUpRight, Sparkles, Telescope } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { targets, targetHref } from "@/lib/spherex";
import AnimatedContent from "./react-bits/animated-content";

function TargetArt({ index, color }: { index: number; color: string }) {
  const reduced = useReducedMotion();
  return (
    <svg aria-hidden="true" viewBox="0 0 500 240" className="h-full w-full">
      <defs>
        <radialGradient id={`halo-${index}`}>
          <stop stopColor={color} stopOpacity=".5" />
          <stop offset=".18" stopColor={color} stopOpacity=".18" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`star-${index}`}>
          <stop stopColor="#fff" />
          <stop offset=".15" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: 45 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 79.7 + 20) % 500}
          cy={(i * 51.9 + index * 11) % 240}
          r={i % 6 === 0 ? 1.5 : 0.7}
          fill={color}
          opacity={0.15 + (i % 4) * 0.15}
        />
      ))}
      <circle cx="250" cy="120" r="140" fill={`url(#halo-${index})`} />
      <ellipse
        cx="250"
        cy="120"
        rx="135"
        ry="60"
        transform="rotate(-22 250 120)"
        stroke={color}
        strokeOpacity=".2"
        fill="none"
      />
      <circle
        cx="250"
        cy="120"
        r="85"
        stroke={color}
        strokeOpacity=".1"
        fill="none"
        strokeDasharray="3 6"
      />
      <motion.g
        animate={
          reduced
            ? {}
            : index < 3
              ? { x: [-10, 10, -10], y: [4, -4, 4] }
              : { opacity: [0.4, 1, 0.4] }
        }
        transition={{
          duration: 8 + index,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <circle
          cx="250"
          cy="120"
          r={index === 1 ? 12 : 25}
          fill={`url(#star-${index})`}
        />
        <path d="M250 91 V149 M221 120 H279" stroke={color} strokeWidth=".7" />
        {index === 2 && (
          <circle cx="285" cy="105" r="10" fill={`url(#star-${index})`} />
        )}
      </motion.g>
      <path
        d="M25 40 V25 H40 M460 25 H475 V40 M25 200 V215 H40 M460 215 H475 V200"
        stroke={color}
        strokeOpacity=".3"
        fill="none"
      />
      <text
        x="30"
        y="195"
        fill={color}
        opacity=".45"
        fontSize="8"
        fontFamily="monospace"
        letterSpacing="2"
      >
        ARTIST’S VISUALIZATION
      </text>
    </svg>
  );
}
export function TargetGallery() {
  const [filter, setFilter] = useState("All targets");
  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {["All targets", "Motion", "Brightness"].map((f) => (
            <Button
              key={f}
              variant="ghost"
              onPress={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`h-10 rounded-full border px-5 text-xs ${filter === f ? "border-[#bfa0d9]/40 bg-[#bfa0d9]/15 text-[#e5c9f6]" : "border-white/10 text-[#9e8eae]"}`}
            >
              {f}
            </Button>
          ))}
        </div>
        <span className="font-mono text-[10px] tracking-widest text-[#84768f]">
          {filter === "All targets" ? "05" : filter === "Motion" ? "03" : "02"}{" "}
          FIELDS TO EXPLORE
        </span>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {targets
          .filter((t) => filter === "All targets" || t.type === filter)
          .map((t) => (
            <AnimatedContent key={t.name} distance={25} duration={0.6}>
              <Card className="group h-full gap-0 overflow-hidden rounded-2xl border border-white/10 bg-[#101019] p-0 transition-colors hover:border-[#bea1d4]/40">
                <div className="relative h-52 overflow-hidden border-b border-white/8 bg-[#0a0911]">
                  <TargetArt index={Number(t.number) - 1} color={t.color} />
                  <span className="absolute left-5 top-4 font-mono text-[10px] text-[#a08bb2]">
                    FIELD / {t.number}
                  </span>
                  <span className="absolute right-5 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#11101b] px-2 py-1 text-[9px] text-[#baacc8]">
                    {t.type === "Motion" ? (
                      <MoveUpRight size={10} />
                    ) : (
                      <Sparkles size={10} />
                    )}{" "}
                    {t.type}
                  </span>
                </div>
                <Card.Content className="flex flex-1 flex-col p-6">
                  <p className="font-mono text-[9px] tracking-widest text-[#ab8fbf]">
                    {t.tag}
                  </p>
                  <h2 className="mt-3 font-display text-2xl tracking-tight">
                    {t.name}
                  </h2>
                  <p className="mt-3 min-h-20 text-xs leading-6 text-[#a192af]">
                    {t.description}
                  </p>
                  {t.name === "WISE 0855" && (
                    <p className="mt-2 text-[10px] text-[#bba1cf]">
                      Auto release enabled · falls back to QR2
                    </p>
                  )}
                  <Link
                    href={targetHref(t)}
                    className="mt-6 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-[#d2b8e4]"
                  >
                    Open in viewer{" "}
                    <ArrowUpRight
                      size={17}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </Card.Content>
              </Card>
            </AnimatedContent>
          ))}
        {filter === "All targets" && (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-[#b598cb]/25 bg-[#14101b]/50 p-8 text-center">
            <Telescope
              size={33}
              strokeWidth={1}
              className="mb-6 text-[#b69bc9]"
            />
            <h2 className="font-display text-2xl">Your own coordinates.</h2>
            <p className="mt-3 max-w-60 text-xs leading-6 text-[#9b8aa9]">
              The sky doesn’t end with this list. Point the viewer somewhere
              new.
            </p>
            <Link
              href="/#observatory"
              className="mt-6 inline-flex items-center gap-3 text-xs text-[#d3b9e3]"
            >
              Go off the map <ArrowUpRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
