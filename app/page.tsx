import { Suspense } from "react";
import { HomeHero } from "@/components/home-hero";
import { Observatory } from "@/components/observatory";
export default function Home() {
  return (
    <>
      <HomeHero />
      <Suspense
        fallback={
          <div className="p-16 text-center text-[#c5a6db]">
            Opening the observatory…
          </div>
        }
      >
        <Observatory />
      </Suspense>
    </>
  );
}
