import { Suspense } from 'react'
import { HomeHero } from '@/components/home-hero'
import { Observatory } from '@/components/observatory'
import { AstroBot } from '@/components/astro-bot'
export default function Home() {
  return (
    <>
      <HomeHero />
      <Suspense
        fallback={
          <div className="mx-auto max-w-360 px-5 py-24 text-center text-lilac sm:px-10 lg:px-16">
            Opening the observatory…
          </div>
        }
      >
        <Observatory />
      </Suspense>
      <Suspense fallback={null}>
        <AstroBot />
      </Suspense>
    </>
  )
}
