import type { Metadata } from "next";
import { TargetGallery } from "@/components/target-gallery";
import { StarMark } from "@/components/cosmos";
export const metadata: Metadata = { title: "Targets" };
export default function Targets() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-16 sm:px-10 lg:px-16">
      <div className="relative mb-14 border-b border-white/10 pb-12">
        <p className="mb-6 font-mono text-[10px] tracking-[.2em] text-[#b397c7]">
          THE COSMIC SHORTLIST / 05 DESTINATIONS
        </p>
        <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-[-.06em] sm:text-7xl">
          Small lights.
          <br />
          <span className="text-[#b99ccc]">Big discoveries.</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-7 text-[#a89ab6]">
          Every explorer needs a starting point. These five fields are your
          invitation to watch the universe move, flicker, and surprise you.
        </p>
        <StarMark className="absolute right-8 top-12 hidden h-36 w-36 rotate-12 text-[#a78abd]/30 md:block" />
      </div>
      <TargetGallery />
      <p className="mt-8 text-xs leading-6 text-[#877591]">
        Target visibility depends on detector, release coverage, and
        sensitivity. Illustrations are conceptual; the viewer displays actual
        SPHEREx observations.
      </p>
    </div>
  );
}
