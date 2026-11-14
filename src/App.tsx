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
      <Menu />
      <main>
        <Hero />
        <Stack />
        <div className="work-hold">
          <Work />
        </div>
        <Frames />
      </main>
      <Footer />
    </>
  )
}
