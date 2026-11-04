'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@heroui/react'
import { ArrowUpRight, MoveUpRight, Sparkles, Telescope } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { targets, targetHref } from '@/lib/spherex'
import ReflectiveCard from './react-bits/reflective-card'

function TargetArt({ index, color }: { index: number; color: string }) {
  const reduced = useReducedMotion()
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
          ease: 'easeInOut',
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
  )
}
export function TargetGallery() {
  const reduced = useReducedMotion()
  const [filter, setFilter] = useState('All targets')
  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {['All targets', 'Motion', 'Brightness'].map((f) => (
            <Button
              key={f}
              variant="ghost"
              onPress={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`h-10 rounded-full border px-5 text-xs ${filter === f ? 'border-lilac/40 bg-lilac/15 text-ink' : 'border-white/10 text-ink-faint'}`}
            >
              {f}
            </Button>
          ))}
        </div>
        <span className="font-mono text-[11px] tracking-[.1em] text-ink-faint">
          {filter === 'All targets' ? '05' : filter === 'Motion' ? '03' : '02'}{' '}
          FIELDS TO EXPLORE
        </span>
      </div>
      <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {targets
          .filter((t) => filter === 'All targets' || t.type === filter)
          .map((t) => (
            <motion.div
              layout
              key={t.name}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center"
            >
              <Link
                href={targetHref(t)}
                aria-label={`Open ${t.name} in viewer`}
                className="block w-fit max-w-full rounded-3xl"
              >
                <ReflectiveCard
                  name={t.name}
                  role={t.tag}
                  videoSrc="/videos/reflection.mp4"
                  webcam={false}
                  tint="#cfb0e0"
                  metalness={1}
                  roughness={0.3}
                  blurStrength={6}
                  shine={1}
                  glare={0.5}
                  grayscale={1}
                  warp={0.6}
                  warpScale={1}
                  bevel={3}
                  tiltStrength={12}
                  radius={24}
                  enableTilt
                  intro
                >
                  {/* Solid card face, inset 4px so the metal shows as a frame. */}
                  <div className="relative m-[calc(4px-var(--rc-pad))] flex flex-1 flex-col overflow-hidden rounded-[20px] bg-panel">
                    <div className="relative aspect-[500/240] shrink-0 overflow-hidden border-b border-white/8 bg-void">
                      <TargetArt index={Number(t.number) - 1} color={t.color} />
                      <span className="absolute left-4 top-3 font-mono text-[11px] text-ink-dim">
                        FIELD / {t.number}
                      </span>
                      <span className="absolute right-4 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-panel-2 px-2 py-1 text-[11px] text-ink-dim">
                        {t.type === 'Motion' ? (
                          <MoveUpRight size={10} />
                        ) : (
                          <Sparkles size={10} />
                        )}{' '}
                        {t.type}
                      </span>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col px-5 pb-5 pt-5">
                      <p className="font-mono text-[11px] tracking-[.1em] text-ink-dim">
                        {t.tag}
                      </p>
                      <h2 className="mt-2 font-display text-2xl tracking-tight text-ink">
                        {t.name}
                      </h2>
                      <p className="mt-3 text-[13px] leading-6 text-ink-faint">
                        {t.description}
                      </p>
                      {t.name === 'WISE 0855' && (
                        <p className="mt-2 text-[11px] text-lilac">
                          Auto release enabled · falls back to QR2
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-xs text-ink">
                        Open in viewer <ArrowUpRight size={17} />
                      </div>
                    </div>
                  </div>
                </ReflectiveCard>
              </Link>
            </motion.div>
          ))}
        {filter === 'All targets' && (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-lilac/25 bg-panel-2/50 p-8 text-center">
            <Telescope size={33} strokeWidth={1} className="mb-6 text-lilac" />
            <h2 className="font-display text-2xl">Your own coordinates.</h2>
            <p className="mt-3 max-w-60 text-[13px] leading-6 text-ink-faint">
              The sky doesn’t end with this list. Point the viewer somewhere
              new.
            </p>
            <Link
              href="/#observatory"
              className="mt-6 inline-flex items-center gap-3 text-xs text-ink"
            >
              Go off the map <ArrowUpRight size={15} />
            </Link>
          </div>
        )}
      </motion.div>
    </>
  )
}
