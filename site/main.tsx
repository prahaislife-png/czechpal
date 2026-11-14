import { StrictMode, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import Anything from './scenes/czechlocal-anything'
import Find from './scenes/czechlocal-find'
import Hero from './scenes/czechlocal-hero'
import Reply from './scenes/czechlocal-reply'

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
