import { ChevronLeft } from 'lucide-react'
import { Bar, Phone, Spinner, Stage, Stream, type Act } from '../../kit'
import { useDark } from '../czechpal-app/ui'
import './reply.css'

// "Write in Czech, from your own words": CzechLocal's Write in Czech screen,
// phone only. Story: the person types what they want to say in plain
// English, taps Write it in Czech, and a polite Czech message is written
// out word by word under it. The loop leaves the way it came: the message
// and the words fade together and the field is empty again.
// Real strings: the screen title, the two section headers, what is typed,
// the button, and the Czech message.

type S = { typed: string; caret: boolean; busy: boolean; result: boolean; count: number; clearing: boolean }

const START: S = { typed: '', caret: false, busy: false, result: false, count: 0, clearing: false }

const ASK = 'The shower is leaking into the flat below. Can you send someone this week?'
const CZECH =
  'Dobrý den, ze sprchy nám protéká voda do bytu pod námi. Mohli byste prosím ještě tento týden poslat někoho na opravu? Děkuji. S pozdravem Ankit Sharma'
const WORDS = CZECH.split(' ').length

const REST = { wide: { x: 300, y: 430 }, compact: { x: 280, y: 430 } }

const script = async (a: Act<S>) => {
  await a.wait(700)
  a.set({ caret: true })
  await a.type('typed', ASK, { interval: 34 })
  await a.wait(500)
  a.mark('tap')
  await a.click({ at: 'write', x: 0.7, y: 0.55 })
  a.set({ caret: false, busy: true })
  await a.wait(900)
  a.set({ busy: false, result: true })
  await a.wait(350)
  for (let i = 1; i <= WORDS; i++) {
    a.put({ count: i })
    await a.wait(70)
  }
  a.mark('done')
  await a.wait(2600)
  // The message and the words leave together; the field is empty again
  a.set({ result: false, clearing: true })
  await a.wait(450)
  await a.snap({ typed: '', count: 0, clearing: false })
  await a.move('rest')
  await a.wait(400)
}

export default function CzechLocalReply() {
  const dark = useDark()
  return (
    <Stage<S>
      width={400}
      height={480}
      compact={{ below: 400, width: 358, height: 480 }}
      initial={START}
      poster={{ typed: ASK, caret: false, busy: false, result: true, count: WORDS, clearing: false }}
      script={script}
      cursor={{ at: REST, style: 'touch' }}
      accent="#2251D1"
      className="cp-scene cp-reply"
    >
      {(s, _rect, layout) => (
        <>
          <Phone width={layout === 'compact' ? 326 : 320} frame="pro" dark={dark} className="cp-phone">
            <div className="cp-app">
              <nav className="cp-nav">
                <span className="cp-back">
                  <ChevronLeft size={30} strokeWidth={2.4} absoluteStrokeWidth />
                </span>
                <span className="cp-nav__title">Write in Czech</span>
              </nav>
              <div className="cp-body">
                <div className="cp-section">What do you want to say?</div>
                <div className="cp-card cp-field" data-clearing={s.clearing || undefined}>
                  {s.typed ? (
                    <span className="cp-field__text">
                      {s.typed}
                      {s.caret && <span className="cp-caret" />}
                    </span>
                  ) : (
                    <span className="cp-field__placeholder">
                      {s.caret && <span className="cp-caret" />}
                      For example: my heating stopped working, can someone come tomorrow morning?
                    </span>
                  )}
                </div>
                <span className="cp-btn cp-write" data-target="write" data-busy={s.busy || undefined}>
                  <span className="cp-write__label">Write it in Czech</span>
                  <Spinner className="cp-write__spin" size={20} />
                </span>
                <div className="cp-answer" data-shown={s.result || undefined}>
                  <div className="cp-section">Your message in Czech</div>
                  <div className="cp-card cp-czech">
                    <Stream text={CZECH} count={s.count} />
                  </div>
                  <div className="cp-czech__check">
                    <Bar w={120} h={8} r={4} tone={3} />
                  </div>
                </div>
              </div>
            </div>
          </Phone>
          <span data-target="rest" className="cp-rest" style={{ left: REST[layout].x, top: REST[layout].y }} />
        </>
      )}
    </Stage>
  )
}
