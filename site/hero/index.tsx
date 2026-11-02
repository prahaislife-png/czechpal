import { useSyncExternalStore } from 'react'
import { ChevronLeft, CircleAlert, QrCode, ReceiptText } from 'lucide-react'
import { Bar, Connector, Phone, Stage, type Act } from '../kit'
import { QR_PATH, QR_SIZE } from './qr'
import './czechpal.css'

// CzechPal's website hero: a device pair where the "desktop" is paper. A
// Czech electricity bill sits top-left and runs off the bottom; the phone
// straddles its right margin, over filler lines only, with CzechPal's answer
// already on screen. Story, no cursor until the tap:
//   1. the app's viewfinder corners close in on the amount and due date,
//   2. a line ties them to the plain-English verdict in the app,
//   3. a tap on Pay pushes the QR screen (the payoff, held),
//   4. Back pops it and the corners lift: the frame is where it began.
// Real strings: the bill's title, amount and due date in Czech; Bill, the
// summary, the verdict, the amount and Pay in the app; on the pay screen the
// amount and "Scan with your banking app". Everything else is a line.
// Compact: the bill runs off the right above the phone, the phone stands a
// gutter in from the right and runs off the bottom; the line is left out.

type Page = 'result' | 'pay'
type S = { scan: boolean; link: boolean; page: Page }

const START: S = { scan: false, link: false, page: 'result' }

const REST = { wide: { x: 560, y: 300 }, compact: { x: 220, y: 520 } }

const script = async (a: Act<S>) => {
  await a.wait(900)
  a.mark('scan')
  a.set({ scan: true })
  await a.wait(1000)
  a.mark('link')
  a.set({ link: true })
  await a.wait(2400)
  a.mark('pay')
  // The line lets go as the finger reaches for Pay, before its end moves
  a.set({ link: false })
  await a.click({ at: 'pay', x: 0.7, y: 0.6 })
  a.set({ page: 'pay' })
  await a.wait(2800)
  a.mark('back')
  await a.click({ at: 'back', x: 0.6, y: 0.6 })
  a.set({ page: 'result' })
  await a.wait(600)
  a.set({ scan: false })
  await a.wait(500)
  await a.move('rest')
}

// Paragraph lines on the bill: varied, and long enough to run under the phone
const PARAS = [
  [372, 388, 344, 210],
  [380, 356, 392, 300, 168],
  [366, 390, 250],
]

function Letter({ scan }: { scan: boolean }) {
  return (
    <div className="cp-letter">
      <div className="cp-letter__head">
        <div className="cp-letter__from">
          <Bar w={92} h={8} r={3} tone={4} />
          <Bar w={128} h={6} r={3} tone={2} />
          <Bar w={108} h={6} r={3} tone={2} />
        </div>
        <Bar w={68} h={6} r={3} tone={2} />
      </div>
      <div className="cp-letter__title">Vyúčtování elektřiny</div>
      <Bar w={196} h={6} r={3} tone={2} />
      <div className="cp-due" data-target="due">
        <div className="cp-due__row">
          <span>K úhradě</span>
          <b>1 840 Kč</b>
        </div>
        <div className="cp-due__row">
          <span>Splatnost</span>
          <b>15. 11. 2026</b>
        </div>
        <Viewfinder on={scan} />
      </div>
      {PARAS.map((p, i) => (
        <div key={i} className="cp-letter__para">
          {p.map((w, j) => (
            <Bar key={j} w={w} h={6} r={3} tone={3} />
          ))}
        </div>
      ))}
    </div>
  )
}

function Viewfinder({ on }: { on: boolean }) {
  return (
    <span className="cp-finder" data-on={on || undefined} aria-hidden>
      <span className="cp-finder__c cp-finder__c--tl" />
      <span className="cp-finder__c cp-finder__c--tr" />
      <span className="cp-finder__c cp-finder__c--bl" />
      <span className="cp-finder__c cp-finder__c--br" />
    </span>
  )
}

function Lines({ rows }: { rows: [number, number][] }) {
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

function App({ page }: { page: Page }) {
  return (
    <div className="cp-app" data-page={page}>
      <section className="cp-page cp-page--result">
        <nav className="cp-nav">
          <span className="cp-back">
            <ChevronLeft size={30} strokeWidth={2.4} absoluteStrokeWidth />
          </span>
        </nav>
        <div className="cp-body">
          <div className="cp-hero">
            <div className="cp-type">
              <ReceiptText size={16} strokeWidth={2} absoluteStrokeWidth />
              Bill
            </div>
            <div className="cp-title">Your electricity bill for October</div>
            <div className="cp-verdict" data-target="verdict">
              <CircleAlert size={20} strokeWidth={2} absoluteStrokeWidth className="cp-verdict__icon" />
              <div className="cp-verdict__text">
                <div className="cp-verdict__label">Pay 1,840 Kč by 15 Nov</div>
                <Bar w={150} h={8} r={4} tone={2} />
              </div>
            </div>
          </div>
          <div className="cp-section">Pay this bill</div>
          <div className="cp-card cp-pay">
            <QrCode size={30} strokeWidth={2} absoluteStrokeWidth className="cp-pay__icon" />
            <div className="cp-pay__text">
              <div className="cp-pay__amount">1 840 Kč</div>
              <Bar w={120} h={8} r={4} tone={2} />
            </div>
            <span className="cp-btn" data-target="pay">
              Pay
            </span>
          </div>
          <div className="cp-section">
            <Bar w={96} h={9} r={4} tone={3} />
          </div>
          <Lines
            rows={[
              [92, 210],
              [118, 176],
              [84, 228],
            ]}
          />
        </div>
      </section>

      <section className="cp-page cp-page--pay">
        <nav className="cp-nav">
          <span className="cp-back" data-target="back">
            <ChevronLeft size={30} strokeWidth={2.4} absoluteStrokeWidth />
          </span>
          <span className="cp-nav__title">Pay</span>
        </nav>
        <div className="cp-body">
          <div className="cp-card cp-qr">
            <svg className="cp-qr__code" viewBox={`-2 -2 ${QR_SIZE + 4} ${QR_SIZE + 4}`} shapeRendering="crispEdges" aria-hidden>
              <rect x={-2} y={-2} width={QR_SIZE + 4} height={QR_SIZE + 4} fill="#fff" />
              <path d={QR_PATH} fill="#0E1420" />
            </svg>
            <div className="cp-qr__amount">1 840 Kč</div>
            <div className="cp-qr__note">Scan with your banking app</div>
          </div>
          <Lines
            rows={[
              [74, 190],
              [104, 120],
            ]}
          />
        </div>
      </section>
    </div>
  )
}

// The app follows the page's light or dark mode; the phone's status bar has to as well
const DARK = '(prefers-color-scheme: dark)'
const subscribe = (change: () => void) => {
  const query = matchMedia(DARK)
  query.addEventListener('change', change)
  return () => query.removeEventListener('change', change)
}
const useDark = () => useSyncExternalStore(subscribe, () => matchMedia(DARK).matches, () => false)

export default function CzechPalHero() {
  const dark = useDark()
  return (
    <Stage<S>
      width={720}
      height={440}
      compact={{ below: 600, width: 358, height: 560 }}
      initial={START}
      poster={{ scan: true, link: true, page: 'result' }}
      script={script}
      cursor={{ at: REST, style: 'touch' }}
      accent="#2251D1"
      className="cp-hero-stage"
    >
      {(s, rect, layout) => {
        const due = rect('due')
        const verdict = rect('verdict')
        return (
          <>
            <div className="cp-paper">
              <Letter scan={s.scan} />
            </div>
            <Phone width={layout === 'compact' ? 326 : 300} frame="pro" dark={dark} className="cp-phone">
              <App page={s.page} />
            </Phone>
            <span data-target="rest" className="cp-rest" style={{ left: REST[layout].x, top: REST[layout].y }} />
            {layout === 'wide' && due.width > 0 && verdict.width > 0 && (
              <Connector
                show={s.link}
                from={{ x: due.x + due.width + 14, y: due.y + due.height / 2 }}
                to={{ x: verdict.x, y: verdict.y + verdict.height / 2 }}
                route="curve"
                className="cp-link"
              />
            )}
          </>
        )
      }}
    </Stage>
  )
}
