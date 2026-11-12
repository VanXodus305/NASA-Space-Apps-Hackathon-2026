import type { Metadata } from "next";
import { TargetGallery } from "@/components/target-gallery";
import {
  Reveal,
  OrbitalAccent,
  KineticHeading,
} from "@/components/motion-effects";
import { targets } from "@/lib/spherex";
export const metadata: Metadata = { title: "Targets" };
export default function Targets() {
  return (
    <div className="mx-auto max-w-360 px-5 pb-20 pt-16 sm:px-10 lg:px-16">
      <Reveal
        trigger="mount"
        className="relative mb-14 border-b border-white/10 pb-12"
      >
        <p className="mb-6 font-mono text-[11px] tracking-[.14em] text-lilac">
          THE COSMIC SHORTLIST / {String(targets.length).padStart(2, "0")}{" "}
          DESTINATIONS
        </p>
        <KineticHeading
          lines={["Small lights.", "Big discoveries."]}
          accentWord="discoveries."
          className="font-display text-5xl font-medium leading-[1.05] tracking-[-.06em] sm:text-7xl"
        />

        <p className="mt-6 max-w-lg text-sm leading-7 text-ink-dim">
          Start with the five challenge fields, then keep exploring. Every
          coordinate below is ready to open in the blink viewer.
        </p>
        <OrbitalAccent />
      </Reveal>
      <TargetGallery />
      <p className="mt-8 text-[13px] leading-6 text-ink-faint">
        Target visibility depends on detector, release coverage, and
        sensitivity. Illustrations are conceptual; the viewer displays actual
        SPHEREx observations.
      </p>
    </div>
  );
}
