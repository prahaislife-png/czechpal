import { useSyncExternalStore } from 'react'
import { Bar } from '../../kit'
import './app.css'

// The app follows the page's light or dark mode; a phone's status bar has to as well
const DARK = '(prefers-color-scheme: dark)'
const subscribe = (change: () => void) => {
  const query = matchMedia(DARK)
  query.addEventListener('change', change)
  return () => query.removeEventListener('change', change)
}
export const useDark = () => useSyncExternalStore(subscribe, () => matchMedia(DARK).matches, () => false)

/** A card of placeholder rows: the app's filler below the part a scene is about. */
export function Lines({ rows }: { rows: [number, number][] }) {
  return (
    <div className="cp-card cp-lines">
      {rows.map(([a, b], i) => (
        <div key={i} className="cp-lines__row">
          <Bar w={a} h={8} r={4} tone={2} />
          <Bar w={b} h={10} r={4} tone={4} />
        </div>
      ))}
    </div>
  )
}
