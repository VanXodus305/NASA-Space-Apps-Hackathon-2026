'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Crosshair, X } from 'lucide-react'

type LoadAction = {
  type: 'load_target'
  name: string
  ra: number
  dec: number
  fov: number
  band: string
  release: string | null
}
type Msg = { role: 'user' | 'assistant'; content: string; actions?: LoadAction[] }
type PkgTarget = {
  name: string; ra: number; dec: number; fov: number; band: string
  release: string | null; kind: string; why: string; dist_ly: number
}
type Pkg = { id: string; title: string; blurb: string; targets: PkgTarget[] }

const STARTERS = [
  'What is at 269.45, 4.77?',
  'How do I spot a moving star?',
  'Which detector should I pick?',
]

/** Planet with a tilted ring: the floating launcher. Pure CSS/SVG, no assets. */
function PlanetIcon({ spin }: { spin?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="ab-p" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#f3e3fb" />
          <stop offset="0.55" stopColor="#b97ad8" />
          <stop offset="1" stopColor="#3a2570" />
        </radialGradient>
      </defs>
      <ellipse cx="24" cy="26" rx="21" ry="6.5" fill="none" stroke="#e2b5f2" strokeOpacity=".5" strokeWidth="1.6" transform="rotate(-18 24 26)" />
      <circle cx="24" cy="24" r="12" fill="url(#ab-p)" />
      <path d="M13 28a22 7 0 0 0 22 -3" fill="none" stroke="#f6ebfb" strokeWidth="1.8" strokeLinecap="round" transform="rotate(-18 24 26)" />
      <circle cx="40" cy="10" r="1.6" fill="#f6ebfb">
        {spin && <animate attributeName="opacity" values="1;.2;1" dur="2s" repeatCount="indefinite" />}
      </circle>
    </svg>
  )
}

export function AstroBot() {
  const router = useRouter()
  const sp = useSearchParams()
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [tip, setTip] = useState('')
  const [pkgs, setPkgs] = useState<Pkg[]>([])
  const [pkgId, setPkgId] = useState('')
  const [suggest, setSuggest] = useState<string[]>(STARTERS)
  const scroller = useRef<HTMLDivElement>(null)

  // Context so the bot knows what is on screen.
  const context = {
    ra: sp.get('ra'), dec: sp.get('dec'), name: sp.get('name'),
    fov: sp.get('size') ?? sp.get('fov'), band: sp.get('band'), release: sp.get('release'),
  }

  const load = useCallback(
    (t: { name: string; ra: number; dec: number; fov: number; band: string; release: string | null }) => {
      const q = new URLSearchParams({
        name: t.name, ra: String(t.ra), dec: String(t.dec), size: String(t.fov),
        band: t.band, release: t.release ?? 'auto',
      })
      router.push(`/?${q}#observatory`, { scroll: true })
      setOpen(false)
    },
    [router],
  )

  // Packages once, on first open.
  useEffect(() => {
    if (!open || pkgs.length) return
    fetch('/api/bot/packages').then((r) => r.json()).then((d) => {
      setPkgs(d.packages ?? [])
      setPkgId(d.packages?.[0]?.id ?? '')
    }).catch(() => {})
  }, [open, pkgs.length])

  // Floating fact bubble while closed.
  useEffect(() => {
    if (open) return
    let hide: ReturnType<typeof setTimeout>
    const show = () =>
      fetch('/api/bot/tip').then((r) => r.json()).then((d) => {
        setTip(d.tip ?? '')
        hide = setTimeout(() => setTip(''), 7000)
      }).catch(() => {})
    const first = setTimeout(show, 8000)
    const every = setInterval(show, 30000)
    return () => { clearTimeout(first); clearInterval(every); clearTimeout(hide) }
  }, [open])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, busy])

  async function send(text: string) {
    const message = text.trim()
    if (!message || busy) return
    const history = msgs.map(({ role, content }) => ({ role, content }))
    setMsgs((m) => [...m, { role: 'user', content: message }])
    setInput('')
    setBusy(true)
    try {
      const r = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, context }),
      })
      if (!r.ok) throw new Error()
      const d = await r.json()
      setMsgs((m) => [...m, { role: 'assistant', content: d.reply, actions: d.actions }])
      if (d.suggestions?.length) setSuggest(d.suggestions)
    } catch {
      setMsgs((m) => [...m, { role: 'assistant', content: 'I lost signal for a moment. Please try again.' }])
    } finally {
      setBusy(false)
    }
  }

  const activePkg = pkgs.find((p) => p.id === pkgId)

  return (
    <>
      {/* Launcher */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
        <AnimatePresence>
          {tip && !open && (
            <motion.button
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              onClick={() => setOpen(true)}
              className="max-w-64 rounded-2xl rounded-br-sm border border-white/10 bg-panel-2/95 px-4 py-3 text-left text-[13px] leading-snug text-ink shadow-xl backdrop-blur"
            >
              <span className="mb-1 block font-mono text-[10px] tracking-[.14em] text-lilac">DID YOU KNOW</span>
              {tip}
            </motion.button>
          )}
        </AnimatePresence>
        {!open && (
          <motion.button
            aria-label="Open Astro, the sky guide"
            onClick={() => setOpen(true)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
            className="h-16 w-16 rounded-full border border-white/15 bg-panel p-2 shadow-[0_0_32px_rgba(185,122,216,.45)]"
          >
            <PlanetIcon spin />
          </motion.button>
        )}
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label="Astro sky guide"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-3 bottom-3 z-50 flex h-[min(640px,calc(100dvh-24px))] flex-col overflow-hidden rounded-3xl border border-white/10 bg-panel/95 shadow-2xl backdrop-blur sm:inset-x-auto sm:bottom-7 sm:right-7 sm:w-[400px]"
          >
            <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <div className="h-9 w-9"><PlanetIcon /></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">Astro</p>
                <p className="font-mono text-[10px] tracking-[.12em] text-ink-faint">SKY GUIDE</p>
              </div>
              <button aria-label="Close" onClick={() => setOpen(false)} className="rounded-full p-2 text-ink-dim hover:bg-white/10 hover:text-ink">
                <X size={16} />
              </button>
            </header>

            <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-[13.5px] leading-relaxed">
              <Bubble role="assistant">
                Hi, I&apos;m Astro. Give me any RA/Dec and I&apos;ll tell you what&apos;s there, or pick a ready-made target below and I&apos;ll load it for you.
              </Bubble>

              {activePkg && (
                <div className="rounded-2xl border border-white/10 bg-panel-2/70 p-3">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {pkgs.map((p) => (
                      <button key={p.id} onClick={() => setPkgId(p.id)}
                        className={`rounded-full px-3 py-1 text-[11px] ${p.id === pkgId ? 'bg-lilac text-black' : 'bg-white/5 text-ink-dim hover:bg-white/10'}`}>
                        {p.title}
                      </button>
                    ))}
                  </div>
                  <p className="mb-2 text-[12px] text-ink-faint">{activePkg.blurb}</p>
                  <div className="space-y-1.5">
                    {activePkg.targets.map((t) => (
                      <button key={t.name} onClick={() => load(t)}
                        className="group flex w-full items-start gap-3 rounded-xl border border-white/10 px-3 py-2 text-left hover:border-lilac/60 hover:bg-white/5">
                        <Crosshair size={14} className="mt-1 shrink-0 text-lilac" />
                        <span className="flex-1">
                          <span className="block text-ink">{t.name} <span className="font-mono text-[10px] text-ink-faint">· {t.kind} · {t.dist_ly.toLocaleString()} ly</span></span>
                          <span className="block text-[12px] text-ink-dim">{t.why}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {msgs.map((m, i) => (
                <div key={i}>
                  <Bubble role={m.role}>{m.content}</Bubble>
                  {m.actions?.map((a, j) => (
                    <button key={j} onClick={() => load(a)}
                      className="mt-2 flex w-full items-center gap-2 rounded-xl border border-lilac/50 bg-lilac/10 px-3 py-2 text-left text-ink hover:bg-lilac/20">
                      <Crosshair size={14} className="text-lilac" />
                      <span>Load {a.name} <span className="font-mono text-[10px] text-ink-faint">· {a.band} · {a.fov}°</span></span>
                    </button>
                  ))}
                </div>
              ))}
              {busy && <Bubble role="assistant"><span className="animate-pulse">Scanning the sky…</span></Bubble>}
            </div>

            <div className="border-t border-white/10 px-3 pb-3 pt-2">
              <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                {suggest.map((s) => (
                  <button key={s} onClick={() => send(s)} disabled={busy}
                    className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-[11.5px] text-ink-dim hover:border-lilac/60 hover:text-ink disabled:opacity-50">
                    {s}
                  </button>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); void send(input) }} className="flex items-center gap-2 rounded-full border border-white/10 bg-panel-2 py-1 pl-4 pr-1 focus-within:border-lilac/60">
                <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={600}
                  placeholder="Ask about a coordinate or the viewer…"
                  className="flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-faint" />
                <button type="submit" aria-label="Send" disabled={busy || !input.trim()}
                  className="grid h-8 w-8 place-items-center rounded-full bg-lilac text-black disabled:opacity-40">
                  <ArrowUp size={16} />
                </button>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}

function Bubble({ role, children }: { role: Msg['role']; children: React.ReactNode }) {
  const me = role === 'user'
  return (
    <div className={`flex ${me ? 'justify-end' : 'justify-start'}`}>
      <p className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 ${me ? 'rounded-br-sm bg-lilac text-black' : 'rounded-bl-sm bg-panel-2 text-ink'}`}>
        {children}
      </p>
    </div>
  )
}
