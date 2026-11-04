import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Eye,
  MoveUpRight,
  Sparkles,
} from "lucide-react";
import { DetectorTable } from "@/components/detector-table";
import { MotionSection, KineticHeading } from "@/components/motion-effects";
import { Cosmos } from "@/components/cosmos";
export const metadata: Metadata = { title: "About the mission" };
export default function About() {
  return (
    <>
      <MotionSection className="relative isolate overflow-hidden border-b border-white/10">
        <Cosmos />
        <div className="absolute inset-0 bg-linear-to-r from-[#08080e] via-[#08080e]/70 to-[#08080e]/10" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-20 sm:px-10 lg:px-16">
          <p className="mb-6 font-mono text-[10px] tracking-[.2em] text-[#b69bc9]">
            THE MISSION / A DIFFERENT KIND OF VISION
          </p>
          <KineticHeading
            lines={["There’s more", "than meets the eye."]}
            accentWord="eye."
            className="font-display text-5xl font-medium leading-[1.05] tracking-[-.06em] sm:text-7xl"
          />

          <p className="mt-7 max-w-lg text-sm leading-7 text-[#b0a1bc]">
            Visible light tells only part of the story. SPHEREx opens a window
            into the infrared universe—and you’re invited to look through it.
          </p>
          <a
            href="#mission"
            className="mt-8 inline-flex items-center gap-3 text-xs text-[#cfb5df]"
          >
            Get to know your telescope <ArrowDown size={14} />
          </a>
        </div>
      </MotionSection>
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-10 lg:px-16">
        <MotionSection
          id="mission"
          className="grid gap-8 border-b border-white/10 pb-16 md:grid-cols-[1fr_1.3fr]"
        >
          <div>
            <p className="font-mono text-[10px] tracking-widest text-[#a889be]">
              01 / MEET SPHEREx
            </p>
            <h2 className="mt-5 font-display text-3xl leading-tight tracking-tight">
              One mission.
              <br />
              An entirely new sky.
            </h2>
          </div>
          <div className="space-y-5 text-sm leading-7 text-[#b1a3bd]">
            <p>
              NASA’s SPHEREx—the Spectro-Photometer for the History of the
              Universe, Epoch of Reionization and Ices Explorer—launched in
              March 2025. It surveys the whole sky in near-infrared light,
              revealing clues about cosmic origins, galaxies, and the
              ingredients for life.
            </p>
            <p>
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
              className="inline-flex items-center gap-2 text-xs text-[#d0b4e2]"
            >
              Explore the mission at IRSA <ArrowUpRight size={13} />
            </a>
          </div>
        </MotionSection>
        <MotionSection className="py-16">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[10px] tracking-widest text-[#a889be]">
                02 / SIX WAYS TO SEE
              </p>
              <h2 className="mt-5 font-display text-3xl tracking-tight">
                Beyond the visible spectrum.
              </h2>
            </div>
            <p className="max-w-sm text-xs leading-6 text-[#9e8dab]">
              Choose one detector in the viewer. These are detector ranges;
              individual observations can sample narrower wavelength intervals.
            </p>
          </div>
          <DetectorTable />
          <a
            href="https://irsa.ipac.caltech.edu/onlinehelp/spherex/spherex/overview.html"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-[10px] text-[#9e85b1]"
          >
            Detector specifications: IRSA instrument overview ↗
          </a>
        </MotionSection>
        <MotionSection className="border-y border-white/10 py-16">
          <p className="font-mono text-[10px] tracking-widest text-[#a889be]">
            03 / YOUR FIRST OBSERVATION
          </p>
          <h2 className="mt-5 font-display text-3xl tracking-tight">
            Point. Play. Pay attention.
          </h2>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {[
              [
                "01",
                "Find your field",
                "Enter RA and Dec in degrees or sexagesimal notation, or search by name. Set the field of view up to 0.5°. A larger field gives fast movers more room.",
              ],
              [
                "02",
                "Choose your light",
                "Start with D2 and Auto release. Auto tries QR3, then QR2 if there’s no coverage. The viewer shows the actual release and coordinates used.",
              ],
              [
                "03",
                "Let time do its thing",
                "Press play to blink through up to eight observations. Change the speed, step frame by frame, or drag the timeline. Share your field with a link.",
              ],
            ].map(([num, title, body]) => (
              <div
                key={num}
                className="rounded-2xl border border-white/10 bg-[#101019] p-7"
              >
                <span className="font-display text-4xl text-[#735c86]">
                  {num}
                </span>
                <h3 className="mt-6 font-display text-xl">{title}</h3>
                <p className="mt-3 text-xs leading-6 text-[#a391b1]">{body}</p>
              </div>
            ))}
          </div>
        </MotionSection>
        <MotionSection id="reading-the-sky" className="scroll-mt-8 py-16">
          <p className="font-mono text-[10px] tracking-widest text-[#a889be]">
            04 / READING THE SKY
          </p>
          <h2 className="mt-5 font-display text-3xl tracking-tight">
            A shift. A flicker. A clue.
          </h2>
          <div className="mt-9 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-[#b99ccc]/20 bg-[#191221] p-7">
              <MoveUpRight className="mb-6 text-[#caadde]" size={28} />
              <h3 className="font-display text-2xl">Some things move.</h3>
              <p className="mt-4 text-sm leading-7 text-[#ab98ba]">
                Nearby stars, brown dwarfs, asteroids, and comets change
                position against the background. Look for a point of light that
                shifts while its neighbors stay put. Barnard’s Star, WISE 0855,
                and Epsilon Indi B are starting points.
              </p>
            </div>
            <div className="rounded-2xl border border-[#8f98c7]/20 bg-[#111523] p-7">
              <Sparkles className="mb-6 text-[#a4b2db]" size={28} />
              <h3 className="font-display text-2xl">Some things change.</h3>
              <p className="mt-4 text-sm leading-7 text-[#9ca5bd]">
                Variable stars can brighten and dim without noticeably changing
                position. Compare their light against nearby sources. Explore RW
                Aurigae or R Draconis, and pay attention to observation times.
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-4 rounded-xl border border-white/10 p-6">
            <Eye size={23} className="shrink-0 text-[#c5a6db]" />
            <div>
              <h3 className="text-sm text-[#d8c5e5]">
                Same band. Similar wavelengths. Better comparisons.
              </h3>
              <p className="mt-2 text-xs leading-6 text-[#a390b0]">
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
        <div className="rounded-2xl border border-[#b69bc9]/20 bg-linear-to-r from-[#261a32] to-[#11101c] px-7 py-12 text-center">
          <p className="font-mono text-[10px] tracking-widest text-[#b195c6]">
            NO TELESCOPE REQUIRED. JUST CURIOSITY.
          </p>
          <h2 className="mt-5 font-display text-3xl tracking-tight sm:text-4xl">
            The next frame might change everything.
          </h2>
          <Link
            href="/#observatory"
            className="mt-7 inline-flex items-center gap-6 rounded-full bg-[#ceb0df] px-7 py-3 text-sm font-medium text-[#251a2d] hover:bg-[#e4c9f2]"
          >
            Start exploring <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </>
  );
}
