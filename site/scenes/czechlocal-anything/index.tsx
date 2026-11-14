import type { ReactNode } from 'react'
import { Pill, Signpost, UtensilsCrossed } from 'lucide-react'
import { Bar, Stage, Swap, type Act } from '../../kit'
import '../czechlocal-app/app.css'
import './anything.css'

// "Not just letters": the things people meet every day in Czech. A conveyor
// of three real objects (a notice on a door, a menu, a pharmacy's dosage
// label) slides past; on each, CzechLocal's viewfinder corners settle on the
// words, and the app's answer card beside it says what they mean. The
// answer card stays put and swaps its content; the objects travel. After the
// third, a copy of the first comes in and the track snaps back unseen.
// Real strings: the Czech on each object, and each answer's type, Czech
// line and English line.

type S = { idx: number; focus: boolean }

const START: S = { idx: 0, focus: false }

const ANSWERS = [
  { type: 'Sign', icon: Signpost, cs: 'Dnes zavřeno z technických důvodů', en: 'Closed today for technical reasons' },
  { type: 'Menu', icon: UtensilsCrossed, cs: 'Svíčková na smetaně, houskový knedlík', en: 'Beef sirloin in cream sauce, bread dumplings' },
  { type: 'Medicine', icon: Pill, cs: '1 tableta 3× denně po jídle', en: 'Take 1 tablet 3 times a day, after meals' },
]

const script = async (a: Act<S>) => {
  for (let i = 1; i <= 3; i++) {
    await a.wait(450)
    a.set({ focus: true })
    await a.wait(2700)
    a.set({ focus: false })
    await a.wait(150)
    a.set({ idx: i })
    await a.wait(850)
  }
  // The copy of the first object now sits where the first began
  await a.snap({ idx: 0 })
}

function Finder({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <div className="cp-focus">
      {children}
      <span className="cp-finder" data-on={on || undefined} aria-hidden>
        <span className="cp-finder__c cp-finder__c--tl" />
        <span className="cp-finder__c cp-finder__c--tr" />
        <span className="cp-finder__c cp-finder__c--bl" />
        <span className="cp-finder__c cp-finder__c--br" />
      </span>
    </div>
  )
}

function Notice({ on }: { on: boolean }) {
  return (
    <div className="cp-thing cp-notice">
      <span className="cp-notice__tape cp-notice__tape--l" />
      <span className="cp-notice__tape cp-notice__tape--r" />
      <Finder on={on}>
        <div className="cp-notice__big">Dnes zavřeno</div>
        <div className="cp-notice__why">z technických důvodů</div>
      </Finder>
      <div className="cp-notice__lines">
        <Bar w={190} h={7} r={3} tone={3} />
        <Bar w={150} h={7} r={3} tone={3} />
      </div>
      <div className="cp-notice__thanks">
        <Bar w={168} h={7} r={3} tone={2} />
      </div>
    </div>
  )
}

function Menu({ on }: { on: boolean }) {
  return (
    <div className="cp-thing cp-menu">
      <div className="cp-menu__head">Hlavní jídla</div>
      <Finder on={on}>
        <div className="cp-menu__row">
          <span>Svíčková na smetaně, houskový knedlík</span>
          <b>189 Kč</b>
        </div>
      </Finder>
      {[150, 120, 170, 136].map((w, i) => (
        <div key={i} className="cp-menu__row cp-menu__row--filler">
          <Bar w={w} h={7} r={3} tone={3} />
          <Bar w={34} h={7} r={3} tone={3} />
        </div>
      ))}
    </div>
  )
}

function Label({ on }: { on: boolean }) {
  return (
    <div className="cp-thing cp-box">
      <div className="cp-box__band" />
      <div className="cp-sticker">
        <Bar w={120} h={7} r={3} tone={3} />
        <Finder on={on}>
          <div className="cp-sticker__label">Dávkování</div>
          <div className="cp-sticker__dose">1 tableta 3× denně po jídle</div>
        </Finder>
        <Bar w={150} h={7} r={3} tone={2} />
        <Bar w={96} h={7} r={3} tone={2} />
      </div>
    </div>
  )
}

const THINGS = [Notice, Menu, Label, Notice]

export default function CzechLocalAnything() {
  return (
    <Stage<S>
      width={480}
      height={440}
      compact={{ below: 480, width: 358, height: 460 }}
      initial={START}
      poster={{ idx: 0, focus: true }}
      script={script}
      accent="#2251D1"
      className="cp-scene cp-anything"
    >
      {(s, _rect, layout) => {
        const step = layout === 'compact' ? 360 : 460
        const answer = ANSWERS[s.idx % 3]
        const Icon = answer.icon
        return (
          <>
            <div className="cp-track">
              {THINGS.map((Thing, i) => (
                <div key={i} className="cp-slot" style={{ transform: `translateX(${(i - s.idx) * step}px)` }} aria-hidden={i !== s.idx || undefined}>
                  <Thing on={s.focus && i === s.idx} />
                </div>
              ))}
            </div>
            <div className="cp-answer-card">
              <Swap id={s.idx % 3}>
                <div className="cp-answer-card__inner">
                  <div className="cp-answer-card__type">
                    <Icon size={16} strokeWidth={2} absoluteStrokeWidth />
                    {answer.type}
                  </div>
                  <div className="cp-answer-card__cs">{answer.cs}</div>
                  <div className="cp-answer-card__en">{answer.en}</div>
                </div>
              </Swap>
            </div>
          </>
        )
      }}
    </Stage>
  )
}
