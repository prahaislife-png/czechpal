import type { CSSProperties } from 'react'
import { ChevronLeft, CircleAlert, CircleCheck, ReceiptText } from 'lucide-react'
import { Bar, Connector, Phone, Spinner, Stage, type Act } from '../../kit'
import { Lines, useDark } from '../czechpal-app/ui'
import './czechpal.css'

// CzechLocal's website hero: a device pair where the "desktop" is paper. A
// Czech electricity bill sits top-left and runs off the bottom; the phone
// straddles its right margin, over filler lines only. The phone tells the
// app's real flow for a photo of that bill:
//   1. reading: the photo with its scan line, and the app's three steps
//      ticking off, while its viewfinder corners close on the bill's figures,
//   2. the explanation arrives in reading order: what it is, the verdict,
//      what you need to do,
//   3. a line ties the Czech figures to the English verdict (the poster),
//   4. what the story added leaves in one reverse stagger and the app is
//      reading again.
// Compact: the bill runs off the right above the phone, the phone stands a
// gutter in from the left and runs off the bottom; the line is left out.

type S = { step: number; result: boolean; scan: boolean; link: boolean }

const START: S = { step: 0, result: false, scan: false, link: false }
const STEPS = ['Reading the Czech text', 'Working out what it means', 'Finding what matters to you']

const script = async (a: Act<S>) => {
  await a.wait(500)
  a.set({ scan: true })
  await a.wait(1000)
  a.set({ step: 1 })
  await a.wait(1000)
  a.set({ step: 2 })
  await a.wait(1000)
  a.set({ step: 3 })
  await a.wait(350)
  a.mark('result')
  a.set({ result: true })
  await a.wait(1100)
  a.mark('link')
  a.set({ link: true })
  await a.wait(3200)
  a.set({ link: false })
  // Hidden under the explanation now: the reading steps start over unseen
  await a.snap({ step: 0 })
  await a.wait(300)
  a.set({ result: false, scan: false })
  await a.wait(900)
}

// Paragraph lines on the bill: varied, and long enough to run under the phone
const PARAS = [
  [372, 388, 344, 210],
  [380, 356, 392, 300, 168],
  [366, 390, 250],
]

const at = (i: number) => ({ '--i': i }) as CSSProperties

/** The bill: the same paper on the desk and, smaller, in the app's photo. */
function Bill({ scan, photo }: { scan?: boolean; photo?: boolean }) {
  return (
    <div className="cp-letter" data-photo={photo || undefined}>
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
      <div className="cp-due" data-target={photo ? undefined : 'due'}>
        <div className="cp-due__row">
          <span>K úhradě</span>
          <b>1 840 Kč</b>
        </div>
        <div className="cp-due__row">
          <span>Splatnost</span>
          <b>15. 11. 2026</b>
        </div>
        <div className="cp-due__row">
          <span>Nová měsíční záloha</span>
          <b>1 450 Kč</b>
        </div>
        {!photo && <Viewfinder on={!!scan} />}
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

function Reading({ step, hidden }: { step: number; hidden: boolean }) {
  return (
    <div className="cp-reading" data-hidden={hidden || undefined}>
      <div className="cp-reading__photo">
        <Bill photo />
        <span className="cp-reading__line" />
      </div>
      <div className="cp-reading__steps">
        {STEPS.map((label, i) => (
          <div key={label} className="cp-reading__step" data-state={i < step ? 'done' : i === step ? 'active' : 'todo'}>
            <span className="cp-reading__icon">
              <CircleCheck className="cp-reading__done" size={22} strokeWidth={2} absoluteStrokeWidth />
              <Spinner className="cp-reading__spin" size={20} />
              <span className="cp-reading__todo" />
            </span>
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

function Explanation({ shown }: { shown: boolean }) {
  return (
    <div className="cp-result" data-shown={shown || undefined}>
      <div className="cp-result__part" style={at(0)}>
        <div className="cp-type">
          <ReceiptText size={16} strokeWidth={2} absoluteStrokeWidth />
          Bill
        </div>
        <div className="cp-title">Your electricity bill for October</div>
      </div>
      <div className="cp-result__part" style={at(1)}>
        <div className="cp-verdict" data-target="verdict">
          <CircleAlert size={20} strokeWidth={2} absoluteStrokeWidth className="cp-verdict__icon" />
          <div className="cp-verdict__text">
            <div className="cp-verdict__label">Pay 1,840 Kč by 15 Nov</div>
            <Bar w={150} h={8} r={4} tone={2} />
          </div>
        </div>
      </div>
      <div className="cp-result__part" style={at(2)}>
        <div className="cp-section">What you need to do</div>
        <div className="cp-card cp-steps">
          <div className="cp-step">
            <span className="cp-step__n">1</span>
            <div className="cp-step__text">
              <div className="cp-step__title">Pay 1,840 Kč by bank transfer</div>
              <Bar w={170} h={8} r={4} tone={2} />
            </div>
          </div>
          <div className="cp-step">
            <span className="cp-step__n">2</span>
            <div className="cp-step__text">
              <div className="cp-step__title">From December, pay 1,450 Kč a month</div>
              <Bar w={140} h={8} r={4} tone={2} />
            </div>
          </div>
        </div>
      </div>
      <div className="cp-result__part" style={at(3)}>
        <div className="cp-section">
          <Bar w={96} h={9} r={4} tone={3} />
        </div>
        <Lines
          rows={[
            [92, 210],
            [118, 176],
          ]}
        />
      </div>
    </div>
  )
}

export default function CzechLocalHero() {
  const dark = useDark()
  return (
    <Stage<S>
      width={720}
      height={440}
      compact={{ below: 600, width: 358, height: 560 }}
      initial={START}
      poster={{ step: 3, result: true, scan: true, link: true }}
      script={script}
      accent="#2251D1"
      className="cp-scene cp-hero-stage"
    >
      {(s, rect, layout) => {
        const due = rect('due')
        const verdict = rect('verdict')
        return (
          <>
            <div className="cp-paper">
              <Bill scan={s.scan} />
            </div>
            <Phone width={layout === 'compact' ? 326 : 300} frame="pro" dark={dark} className="cp-phone">
              <div className="cp-app">
                <nav className="cp-nav">
                  <span className="cp-back">
                    <ChevronLeft size={30} strokeWidth={2.4} absoluteStrokeWidth />
                  </span>
                </nav>
                <div className="cp-body cp-hero-body">
                  <Reading step={s.step} hidden={s.result} />
                  <Explanation shown={s.result} />
                </div>
              </div>
            </Phone>
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
