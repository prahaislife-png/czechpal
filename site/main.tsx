import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CzechPalHero from './hero'

const root = document.getElementById('hero')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <CzechPalHero />
    </StrictMode>,
  )
}
