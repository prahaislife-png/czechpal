import { StrictMode, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import Anything from './scenes/czechpal-anything'
import Find from './scenes/czechpal-find'
import Hero from './scenes/czechpal-hero'
import Reply from './scenes/czechpal-reply'

// Each scene mounts into its slot on docs/index.html, if the page has it
const scenes: [string, ComponentType][] = [
  ['hero', Hero],
  ['demo-reply', Reply],
  ['demo-anything', Anything],
  ['demo-find', Find],
]

for (const [id, Scene] of scenes) {
  const root = document.getElementById(id)
  if (root) {
    createRoot(root).render(
      <StrictMode>
        <Scene />
      </StrictMode>,
    )
  }
}
