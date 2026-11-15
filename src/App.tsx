import { Suspense } from 'react'
import { Stack } from './about/Stack'
import { Mark } from './components/Mark'
import { Menu } from './components/Menu'
import { Footer } from './footer/Footer'
import { Frames } from './frames/Frames'
import { Hero } from './hero/Hero'
import { useSmoothScroll } from './lib/scroll'
import { Work } from './work/Work'

export function App() {
  // Smooth scrolling for the whole page (also for the menu's links). Left off for people who ask for less motion.
  useSmoothScroll()

  return (
    <>
      <nav aria-label="Home">
        <Mark />
      </nav>
      <Suspense fallback={null}>
        <Menu />
      </Suspense>
      {/* Each part of the page is its own boundary, so React takes the built page over a part at a time (each in a
          short task the browser can paint and answer between) instead of in one long task. Nothing here ever waits. */}
      <main>
        <Suspense fallback={null}>
          <Hero />
        </Suspense>
        <Suspense fallback={null}>
          <Stack />
        </Suspense>
        <Suspense fallback={null}>
          <div className="work-hold">
            <Work />
          </div>
        </Suspense>
        <Suspense fallback={null}>
          <Frames />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  )
}
