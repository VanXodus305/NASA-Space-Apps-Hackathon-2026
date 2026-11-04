'use client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useState, type ReactNode } from 'react'
import {
  Magnetic,
  PageEntrance,
  ScrollProgress,
  Reveal,
} from './motion-effects'
import { usePathname } from 'next/navigation'
import { MotionConfig, motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { StarMark } from './cosmos'

// WebGL is client-only and loaded after first paint so it never blocks load.
const Strands = dynamic(() => import('./react-bits/strands'), { ssr: false })
const SplashCursor = dynamic(() => import('./react-bits/splash-cursor'), {
  ssr: false,
})

// Role order: red, orange, amber, warm white, cyan, blue, deep (see shader).
const STRAND_COLORS = [
  '#8a4fb2',
  '#b97ad8',
  '#e2b5f2',
  '#f6ebfb',
  '#93b5ff',
  '#5a5fd8',
  '#2a2b86',
]

function SkyBackdrop() {
  const [dpr, setDpr] = useState<number | null>(null)
  useEffect(() => {
    // Phones render at full CSS resolution (small canvas); larger screens at
    // 0.6x, which keeps the soft ribbons cheap on the GPU.
    const start = () =>
      setDpr(window.matchMedia('(max-width: 767px)').matches ? 1 : 0.6)
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(start, { timeout: 1500 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(start, 250)
    return () => window.clearTimeout(id)
  }, [])
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-0 h-lvh w-full overflow-hidden"
    >
      {dpr !== null && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
        >
          <Strands
            glass={false}
            colors={STRAND_COLORS}
            count={3}
            speed={0.6}
            glow={0.7}
            intensity={0.7}
            opacity={0.85}
            energy={0.5}
            interactive={false}
            clickPulse={false}
            maxDevicePixelRatio={dpr}
            maxFps={30}
          />
        </motion.div>
      )}
      {/* Readability scrim: keeps text and controls legible over the strands. */}
      <div className="absolute inset-0 bg-void/30 lg:bg-linear-to-r lg:from-void/85 lg:via-void/40 lg:to-void/10" />
    </div>
  )
}

// Mounted once in the root shell, so it persists across route changes.
// Skipped entirely when the user prefers reduced motion.
function SplashLayer() {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setEnabled(!query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  if (!enabled) return null
  return (
    <SplashCursor
      rainbow={false}
      size={1}
      force={1}
      swirl={3}
      trail={1}
      clickSplash
      colorSpeed={1}
      intensity={1}
      momentum={1}
      shading={1}
      glow={0}
      quality="high"
      intro
      contained={false}
      zIndex={5}
    />
  )
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <MotionConfig reducedMotion="user">
      <SkyBackdrop />
      <SplashLayer />
      <ScrollProgress />
      <a
        href="#main"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-lilac p-3 text-black focus:translate-y-0"
      >
        Skip to content
      </a>
      <header className="relative z-20 border-b border-white/10">
        <div className="mx-auto flex max-w-360 items-center justify-between gap-4 px-5 py-4 sm:px-10 sm:py-5 lg:px-16">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-ink sm:gap-3"
            aria-label="SPHEREx Blink home"
          >
            <StarMark className="h-7 w-7 text-lilac sm:h-9 sm:w-9" />
            <span className="font-display text-lg font-semibold tracking-[-.03em] sm:text-xl">
              SPHEREx
              <span className="ml-2 font-normal text-ink-dim">blink</span>
            </span>
          </Link>
          <nav
            aria-label="Main navigation"
            className="flex items-center gap-0 sm:gap-4"
          >
            {[
              ['/', 'Home'],
              ['/targets', 'Targets'],
              ['/about', 'About'],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? 'page' : undefined}
                className={`relative px-2 py-2 text-sm transition-colors hover:text-ink sm:px-3 ${pathname === href ? 'text-ink' : 'text-ink-dim'}`}
              >
                {label}
                {pathname === href && (
                  <motion.span
                    layoutId="navigation"
                    className="absolute -bottom-1 left-2 right-2 h-px bg-lilac sm:left-3 sm:right-3"
                  />
                )}
              </Link>
            ))}
          </nav>
          <Magnetic className="hidden md:block">
            <Link
              href="/#observatory"
              className="hidden items-center gap-3 rounded-lg border border-white/20 px-4 py-2.5 text-sm text-ink transition-colors hover:bg-white/5 md:flex"
            >
              Launch explorer <ArrowUpRight size={15} />
            </Link>
          </Magnetic>
        </div>
      </header>
      <main id="main" className="relative z-10 min-w-0 flex-1">
        <PageEntrance key={pathname}>{children}</PageEntrance>
      </main>
      <footer className="relative z-10 border-t border-white/10 bg-void/80">
        <Reveal
          distance={20}
          blur={0}
          className="mx-auto max-w-360 px-5 py-12 sm:px-10 lg:px-16"
        >
          <div className="flex flex-col justify-between gap-8 md:flex-row">
            <div>
              <Link
                href="/"
                className="flex items-center gap-2 font-display text-xl"
              >
                <StarMark className="h-7 w-7 text-lilac" /> SPHEREx blink
              </Link>
              <p className="mt-3 text-sm text-ink-faint">
                The universe moves. Be there to notice.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-ink-dim">
              <a
                href="https://doi.org/10.26131/IRSA652"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                QR2 DOI ↗
              </a>
              <a
                href="https://doi.org/10.26131/IRSA662"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                QR3 DOI ↗
              </a>
              <a
                href="https://irsa.ipac.caltech.edu/Missions/spherex.html"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                IRSA data ↗
              </a>
              <a
                href="https://aladin.cds.unistra.fr/AladinLite/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                Aladin Lite · CDS ↗
              </a>
            </div>
          </div>
          <div className="mt-9 flex flex-col justify-between gap-5 border-t border-white/10 pt-6 md:flex-row">
            <p className="max-w-2xl text-xs leading-relaxed text-ink-faint">
              This project uses SPHEREx data products, a joint project of NASA’s
              Jet Propulsion Laboratory and the California Institute of
              Technology, funded by NASA. Data provided by IRSA at IPAC. Sky
              atlas by CDS.
            </p>
            <p className="shrink-0 font-mono text-[11px] tracking-[.1em] text-ink-dim">
              BUILT FOR NASA SPACE APPS
              <br />
              <span className="mt-2 inline-block text-ink-faint">
                INDEPENDENT COMMUNITY PROJECT · 2026
              </span>
            </p>
          </div>
        </Reveal>
      </footer>
    </MotionConfig>
  )
}
