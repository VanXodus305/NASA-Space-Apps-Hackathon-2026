import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowUpRight,
  Eye,
  MoveUpRight,
  Sparkles,
} from 'lucide-react'
import { DetectorTable } from '@/components/detector-table'
import { MotionSection, KineticHeading } from '@/components/motion-effects'
import { Cosmos } from '@/components/cosmos'
import { detectors } from '@/lib/spherex'

export const metadata: Metadata = { title: 'About the mission' }

const BAND_COLORS = [
  '#e4c4eb',
  '#c8abdf',
  '#ac9ad3',
  '#8a88bf',
  '#7375aa',
  '#575d91',
]

const FACTS: [string, string][] = [
  ['102', 'SPECTRAL CHANNELS'],
  ['06', 'DETECTOR ARRAYS'],
  ['0.75–5 µm', 'NEAR-INFRARED BAND'],
  ['MAR 2025', 'LAUNCHED'],
]

const SPECS: [string, string][] = [
  ['LAUNCH', 'MARCH 2025'],
  ['SURVEY', 'WHOLE SKY'],
  ['LIGHT', 'NEAR-INFRARED'],
  ['CHANNELS', '102 · 0.75–5 µm'],
]

const STEPS: [string, string, string][] = [
  [
    '01',
    'Find your field',
    'Enter RA and Dec in degrees or sexagesimal notation, or search by name. Set the field of view up to 0.5°. A larger field gives fast movers more room.',
  ],
  [
    '02',
    'Choose your light',
    'Start with D2 and Auto release. Auto tries QR3, then QR2 if there’s no coverage. The viewer shows the actual release and coordinates used.',
  ],
  [
    '03',
    'Let time do its thing',
    'Press play to blink through up to eight observations. Change the speed, step frame by frame, or drag the timeline. Share your field with a link.',
  ],
]

const H2 =
  'font-display text-[clamp(1.9rem,4.2vw,3.1rem)] font-light leading-[1.05] tracking-[-.04em] text-ink'

function SectionLabel({
  number,
  children,
}: {
  number: string
  children: string
}) {
  return (
    <p className="flex items-center gap-4 font-mono text-[11px] tracking-[.14em] text-ink-dim">
      <span className="text-lilac">{number}</span>
      <span aria-hidden="true" className="h-px w-10 bg-lilac/40" />
      {children}
    </p>
  )
}

export default function About() {
  return (
    <>
      {/* Hero */}
      <MotionSection className="relative isolate overflow-hidden border-b border-white/10">
        <Cosmos />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-void via-void/70 to-void/10"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-void/90 via-transparent to-transparent"
        />
        <div className="relative mx-auto max-w-360 px-5 sm:px-10 lg:px-16">
          <div className="flex items-center gap-4 pt-10 font-mono text-[11px] tracking-[.14em] text-ink-dim sm:pt-14">
            <span
              aria-hidden="true"
              className="h-9 w-2.5 shrink-0 bg-lilac/55"
            />
            THE MISSION / A DIFFERENT KIND OF VISION
          </div>
          <div className="pb-16 pt-14 sm:pb-24 sm:pt-20 lg:pt-28">
            <KineticHeading
              lines={['There’s more', 'than meets the eye.']}
              accentWord="eye."
              className="font-display text-[clamp(2.5rem,8.5vw,6.5rem)] font-light leading-[.95] tracking-[-.05em]"
            />
            <p className="mt-9 max-w-md border-l border-lilac/50 pl-5 text-base leading-7 text-ink-dim">
              Visible light tells only part of the story. SPHEREx opens a window
              into the infrared universe—and you’re invited to look through it.
            </p>
            <a
              href="#mission"
              className="mt-10 inline-flex min-h-12 items-center gap-4 rounded-lg border border-white/25 px-6 text-sm text-ink transition-colors hover:border-lilac/60 hover:bg-white/5"
            >
              Get to know your telescope <ArrowDown size={16} />
            </a>
          </div>
          <dl className="grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">
            {FACTS.map(([value, label]) => (
              <div
                key={label}
                className="flex flex-col-reverse gap-3 border-l border-white/12 py-7 pl-5 max-sm:odd:border-l-0 max-sm:odd:pl-0 sm:py-9 sm:first:border-l-0 sm:first:pl-0"
              >
                <dt className="font-mono text-[11px] tracking-[.1em] text-ink-faint">
                  {label}
                </dt>
                <dd className="font-display text-3xl font-light leading-none tracking-[-.04em] text-ink sm:text-4xl">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </MotionSection>

      <div className="mx-auto max-w-360 px-5 pb-20 sm:px-10 lg:px-16 lg:pb-28">
        {/* 01 — Mission */}
        <MotionSection
          id="mission"
          className="grid scroll-mt-6 gap-12 border-b border-white/10 py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 lg:py-28"
        >
          <div>
            <SectionLabel number="01">MEET SPHEREx</SectionLabel>
            <h2 className={`mt-6 ${H2}`}>
              One mission.
              <br />
              An entirely new sky.
            </h2>
            <dl className="mt-10 divide-y divide-white/10 border-y border-white/10 font-mono text-[11px] tracking-[.12em]">
              {SPECS.map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 py-3.5">
                  <dt className="text-ink-faint">{key}</dt>
                  <dd className="text-right text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="space-y-6">
            <p className="text-lg leading-8 text-ink sm:text-xl sm:leading-9">
              NASA’s SPHEREx—the Spectro-Photometer for the History of the
              Universe, Epoch of Reionization and Ices Explorer—launched in
              March 2025. It surveys the whole sky in near-infrared light,
              revealing clues about cosmic origins, galaxies, and the
              ingredients for life.
            </p>
            <p className="text-base leading-7 text-ink-dim">
              Across its survey, SPHEREx builds up 102 spectral channels from
              0.75 to 5 microns. Six detector arrays observe different parts of
              that range. Linear variable filters mean that wavelength also
              changes across each detector: the full spectrum of a source is
              assembled from many pointings.
            </p>
            <a
              href="https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_qr.html"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 pt-2 text-sm text-lilac transition-colors hover:text-lilac-strong"
            >
              Explore the mission at IRSA <ArrowUpRight size={15} />
            </a>
          </div>
        </MotionSection>

        {/* 02 — Spectrum */}
        <MotionSection className="border-b border-white/10 py-20 lg:py-28">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <SectionLabel number="02">SIX WAYS TO SEE</SectionLabel>
              <h2 className={`mt-6 ${H2}`}>Beyond the visible spectrum.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-ink-faint">
              Choose one detector in the viewer. These are detector ranges;
              individual observations can sample narrower wavelength intervals.
            </p>
          </div>
          <div aria-hidden="true" className="mb-8">
            <div className="mb-3 flex items-center gap-4 font-mono text-[10px] tracking-[.14em] text-ink-faint">
              <span>0.75 µm</span>
              <span className="h-px flex-1 bg-linear-to-r from-lilac/60 to-[#575d91]/60" />
              <span>5.00 µm</span>
            </div>
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-6">
              {detectors.map((d, i) => (
                <div key={d.id} className="bg-panel">
                  <div
                    className="h-1.5"
                    style={{
                      backgroundColor: BAND_COLORS[i % BAND_COLORS.length],
                    }}
                  />
                  <div className="px-4 py-4">
                    <p className="font-mono text-xs text-ink">{d.id}</p>
                    <p className="mt-1 font-mono text-[11px] text-ink-dim">
                      {d.range} µm
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DetectorTable />
          <a
            href="https://irsa.ipac.caltech.edu/onlinehelp/spherex/spherex/overview.html"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-xs text-ink-faint transition-colors hover:text-lilac"
          >
            Detector specifications: IRSA instrument overview ↗
          </a>
        </MotionSection>

        {/* 03 — First observation */}
        <MotionSection className="border-b border-white/10 py-20 lg:py-28">
          <SectionLabel number="03">YOUR FIRST OBSERVATION</SectionLabel>
          <h2 className={`mt-6 ${H2}`}>Point. Play. Pay attention.</h2>
          <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
            {STEPS.map(([num, title, body]) => (
              <li key={num} className="relative border-t border-white/15 pt-8">
                <span
                  aria-hidden="true"
                  className="absolute -top-[5px] left-0 h-2.5 w-2.5 rounded-full bg-lilac"
                  style={{ boxShadow: '0 0 14px rgba(207,176,224,.6)' }}
                />
                <span className="font-display text-5xl font-light tracking-[-.05em] text-lilac/35">
                  {num}
                </span>
                <h3 className="mt-6 font-display text-2xl font-light tracking-[-.03em] text-ink">
                  {title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-ink-dim">{body}</p>
              </li>
            ))}
          </ol>
        </MotionSection>

        {/* 04 — Reading the sky */}
        <MotionSection
          id="reading-the-sky"
          className="scroll-mt-8 py-20 lg:py-28"
        >
          <SectionLabel number="04">READING THE SKY</SectionLabel>
          <h2 className={`mt-6 ${H2}`}>A shift. A flicker. A clue.</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl border border-lilac/25 bg-linear-to-br from-[#1c1326] to-panel p-7 sm:p-9">
              <div className="flex items-start justify-between gap-4">
                <MoveUpRight className="text-lilac" size={28} />
                <svg
                  aria-hidden="true"
                  viewBox="0 0 240 100"
                  fill="none"
                  className="h-24 w-full max-w-60 text-lilac"
                >
                  {[
                    [20, 20],
                    [70, 30],
                    [150, 85],
                    [220, 70],
                    [120, 14],
                    [185, 60],
                    [40, 55],
                  ].map(([cx, cy]) => (
                    <circle
                      key={`${cx}-${cy}`}
                      cx={cx}
                      cy={cy}
                      r="1.1"
                      fill="#968da4"
                    />
                  ))}
                  <path
                    d="M30 78 C 80 70, 140 46, 205 22"
                    stroke="currentColor"
                    strokeOpacity=".5"
                    strokeDasharray="3 5"
                  />
                  <circle
                    cx="30"
                    cy="78"
                    r="3"
                    fill="currentColor"
                    fillOpacity=".35"
                  />
                  <circle
                    cx="110"
                    cy="58"
                    r="3.5"
                    fill="currentColor"
                    fillOpacity=".65"
                  />
                  <circle cx="205" cy="22" r="4.5" fill="currentColor" />
                  <circle
                    cx="205"
                    cy="22"
                    r="10"
                    fill="currentColor"
                    fillOpacity=".12"
                  />
                </svg>
              </div>
              <h3 className="mt-8 font-display text-3xl font-light tracking-[-.03em] text-ink">
                Some things move.
              </h3>
              <p className="mt-4 text-sm leading-7 text-ink-dim">
                Nearby stars, brown dwarfs, asteroids, and comets change
                position against the background. Look for a point of light that
                shifts while its neighbors stay put. Barnard’s Star, WISE 0855,
                and Epsilon Indi B are starting points.
              </p>
              <p className="mt-6 font-mono text-[10px] tracking-[.14em] text-ink-faint">
                POSITION SHIFTS · BACKGROUND STAYS PUT
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-[#8f98c7]/25 bg-linear-to-br from-[#131a2b] to-panel p-7 sm:p-9">
              <div className="flex items-start justify-between gap-4">
                <Sparkles className="text-[#a4b2db]" size={28} />
                <svg
                  aria-hidden="true"
                  viewBox="0 0 240 100"
                  fill="none"
                  className="h-24 w-full max-w-60 text-[#a4b2db]"
                >
                  {[
                    [50, 50, 5],
                    [120, 50, 12],
                    [190, 50, 8],
                  ].map(([cx, cy, r]) => (
                    <g key={cx}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={r * 2.2}
                        fill="currentColor"
                        fillOpacity=".1"
                      />
                      <circle cx={cx} cy={cy} r={r} fill="currentColor" />
                    </g>
                  ))}
                  <path
                    d="M20 88 H220"
                    stroke="currentColor"
                    strokeOpacity=".3"
                  />
                  <text
                    x="50"
                    y="99"
                    fontSize="7"
                    fill="#968da4"
                    textAnchor="middle"
                  >
                    T1
                  </text>
                  <text
                    x="120"
                    y="99"
                    fontSize="7"
                    fill="#968da4"
                    textAnchor="middle"
                  >
                    T2
                  </text>
                  <text
                    x="190"
                    y="99"
                    fontSize="7"
                    fill="#968da4"
                    textAnchor="middle"
                  >
                    T3
                  </text>
                </svg>
              </div>
              <h3 className="mt-8 font-display text-3xl font-light tracking-[-.03em] text-ink">
                Some things change.
              </h3>
              <p className="mt-4 text-sm leading-7 text-ink-dim">
                Variable stars can brighten and dim without noticeably changing
                position. Compare their light against nearby sources. Explore RW
                Aurigae or R Draconis, and pay attention to observation times.
              </p>
              <p className="mt-6 font-mono text-[10px] tracking-[.14em] text-ink-faint">
                BRIGHTNESS CHANGES · POSITION HOLDS
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-4 rounded-xl border border-white/10 bg-panel/70 p-6 sm:gap-5 sm:p-8">
            <Eye size={24} className="mt-1 shrink-0 text-lilac" />
            <div>
              <h3 className="font-display text-xl font-light tracking-[-.02em] text-ink">
                Same band. Similar wavelengths. Better comparisons.
              </h3>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-ink-dim">
                A source can look different at different wavelengths. Keep the
                detector fixed and check each frame’s wavelength metadata.
                Images are independently contrast-stretched, so brightness is
                not directly comparable. Frames are not aligned to a common sky
                grid: rotation can mimic motion. This viewer helps you find
                candidates; calibrated measurements are needed to confirm
                changes. Contamination flags are not yet supplied by the API.
              </p>
            </div>
          </div>
        </MotionSection>

        {/* Call to action */}
        <div className="relative isolate overflow-hidden rounded-3xl border border-lilac/20 bg-panel px-7 py-16 text-center sm:py-20">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(207,176,224,.22),transparent_65%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-lilac/60 to-transparent"
          />
          <p className="font-mono text-[11px] tracking-[.14em] text-lilac">
            NO TELESCOPE REQUIRED. JUST CURIOSITY.
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.05] tracking-[-.045em] text-ink">
            The next frame might change everything.
          </h2>
          <Link
            href="/#observatory"
            className="mt-9 inline-flex min-h-12 items-center gap-4 rounded-lg bg-lilac px-6 text-sm font-medium text-void transition-colors hover:bg-lilac-strong"
          >
            Start exploring <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </>
  )
}
