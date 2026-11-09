'use client'

/* This is an external science image, so it must retain its original response. */
/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from 'react'
import { Button } from '@heroui/react'
import { LoaderCircle, RefreshCw, TriangleAlert } from 'lucide-react'

function cutoutUrl(ra: number, dec: number, fov: number) {
  // Legacy Survey accepts an angular pixel scale. This keeps the requested
  // field visible while retaining enough detail for a small context panel.
  const pixscale = Math.max(0.262, Math.min(2.5, (fov * 3600) / 768))
  const params = new URLSearchParams({
    ra: String(ra),
    dec: String(dec),
    layer: 'ls-dr10',
    pixscale: pixscale.toFixed(4),
    size: '768',
  })
  return `https://www.legacysurvey.org/viewer/jpeg-cutout?${params}`
}

export function SkyContextMap({
  ra,
  dec,
  fov,
  viewerUrl,
}: {
  ra: number
  dec: number
  fov: number
  viewerUrl: string
}) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const src = useMemo(() => cutoutUrl(ra, dec, fov), [ra, dec, fov])

  return (
    <div className="relative h-48 overflow-hidden border-t border-white/5 bg-[#0b0b14]">
      <img
        key={attempt}
        src={src}
        alt={`Legacy Survey image centered at right ascension ${ra}°, declination ${dec}°`}
        data-testid="sky-context-map"
        className={`h-full w-full object-cover transition-opacity duration-300 ${state === 'error' ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setState('ready')}
        onError={() => setState('error')}
      />
      {state === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#0b0b14] font-mono text-[11px] tracking-[.08em] text-ink-faint">
          <LoaderCircle size={16} className="animate-spin text-lilac" /> LOADING
          SKY CONTEXT
        </div>
      )}
      {state === 'ready' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 to-transparent px-3 pb-2 pt-8 font-mono text-[10px] tracking-[.08em] text-white/70">
          OPTICAL CONTEXT · LEGACY SURVEY DR10
        </div>
      )}
      {state === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0b0b14] px-5 text-center">
          <TriangleAlert size={18} className="text-[#d8bd9c]" />
          <p className="text-xs leading-5 text-ink-faint">
            The reference-sky image could not be reached. Your SPHEREx frames
            are still available.
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onPress={() => {
                setState('loading')
                setAttempt((value) => value + 1)
              }}
              className="text-xs"
            >
              <RefreshCw size={13} /> Retry image
            </Button>
            <a
              href={viewerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-lilac underline-offset-4 hover:underline"
            >
              Open sky viewer
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
