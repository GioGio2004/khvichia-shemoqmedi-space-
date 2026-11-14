import 'lenis/dist/lenis.css'

import Lenis from 'lenis'
import { useEffect } from 'react'
import { Stack } from './about/Stack'
import { Mark } from './components/Mark'
import { Menu } from './components/Menu'
import { Footer } from './footer/Footer'
import { Frames } from './frames/Frames'
import { Hero } from './hero/Hero'
import { Work } from './work/Work'

export function App() {
  // Smooth scrolling for the whole page (also for the menu's links). Left off for people who ask for less motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.09 })
    return () => lenis.destroy()
  }, [])

  return (
    <>
      <Mark />
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
