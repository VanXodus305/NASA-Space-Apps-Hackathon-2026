"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MotionConfig, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { StarMark } from "./cosmos";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-[#ddc5ee] p-3 text-black focus:translate-y-0"
      >
        Skip to content
      </a>
      <header className="relative z-20 border-b border-white/10 bg-[#08080e]/90">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-10 lg:px-16">
          <Link
            href="/"
            className="flex items-center gap-3 text-[#eee5ee]"
            aria-label="SPHEREx Blink home"
          >
            <StarMark className="h-9 w-9 text-[#c5a6db]" />
            <span className="font-display text-xl font-semibold tracking-[-.05em]">
              SPHEREx
              <span className="ml-2 font-normal text-[#c2a6d5]">blink</span>
            </span>
          </Link>
          <nav
            aria-label="Main navigation"
            className="flex items-center gap-1 sm:gap-7"
          >
            {[
              ["/", "Home"],
              ["/targets", "Targets"],
              ["/about", "About"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={`relative px-3 py-2 text-sm transition-colors hover:text-[#dbc2ed] ${pathname === href ? "text-[#e5cdef]" : "text-[#9994a5]"}`}
              >
                {label}
                {pathname === href && (
                  <motion.span
                    layoutId="navigation"
                    className="absolute -bottom-1 left-3 right-3 h-px bg-[#c2a6d5]"
                  />
                )}
              </Link>
            ))}
          </nav>
          <Link
            href="/#observatory"
            className="hidden items-center gap-3 rounded-full border border-[#c5a6db]/30 px-5 py-2.5 text-xs text-[#e3ccef] transition-colors hover:bg-[#c5a6db]/10 md:flex"
          >
            Launch explorer <ArrowUpRight size={15} />
          </Link>
        </div>
      </header>
      <main id="main" className="min-w-0 flex-1">
        {children}
      </main>
      <footer className="border-t border-white/10 bg-[#090910]">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-10 lg:px-16">
          <div className="flex flex-col justify-between gap-8 md:flex-row">
            <div>
              <Link
                href="/"
                className="flex items-center gap-2 font-display text-xl"
              >
                <StarMark className="h-7 w-7 text-[#c5a6db]" /> SPHEREx blink
              </Link>
              <p className="mt-3 text-sm text-[#928c9e]">
                The universe moves. Be there to notice.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-7 gap-y-3 text-xs text-[#bcb3c9]">
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
          <div className="mt-9 flex flex-col justify-between gap-5 border-t border-white/8 pt-6 md:flex-row">
            <p className="max-w-2xl text-xs leading-relaxed text-[#8c8698]">
              This project uses SPHEREx data products, a joint project of NASA’s
              Jet Propulsion Laboratory and the California Institute of
              Technology, funded by NASA. Data provided by IRSA at IPAC. Sky
              atlas by CDS.
            </p>
            <p className="shrink-0 font-mono text-[10px] tracking-widest text-[#a69aac]">
              BUILT FOR NASA SPACE APPS
              <br />
              <span className="mt-2 inline-block text-[#706b7c]">
                INDEPENDENT COMMUNITY PROJECT · 2026
              </span>
            </p>
          </div>
        </div>
      </footer>
    </MotionConfig>
  );
}
