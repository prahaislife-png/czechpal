import { ChevronLeft, ChevronRight, Clock, FileText, HeartPulse, House, Landmark, MapPin, Phone as PhoneIcon, Scale, Search } from 'lucide-react'
import { Bar, Phone, Stage, type Act } from '../../kit'
import { useDark } from '../czechpal-app/ui'
import './find.css'

// "Find who you need": CzechPal's Find tab, phone only. Story: someone types
// India into the search, the Indian embassy comes up among the places, a tap
// opens it with the address, phone and office hours from the official list,
// and Back returns to the search. The loop leaves the way the product does:
// the search is cleared and the areas come back.
// Real strings: Find, the placeholder, the five areas, what is typed, the
// result, and the embassy's details (as published by the Ministry of Foreign
// Affairs and kept in CzechPal's places table).

type S = { q: string; caret: boolean; page: 'find' | 'place' }

const START: S = { q: '', caret: false, page: 'find' }

const AREAS = [
  { icon: HeartPulse, title: 'Health' },
  { icon: FileText, title: 'Visa and residence' },
  { icon: Landmark, title: 'Offices' },
  { icon: Scale, title: 'Legal and money' },
  { icon: House, title: 'Home and repairs' },
]

const REST = { wide: { x: 300, y: 440 }, compact: { x: 280, y: 440 } }

const script = async (a: Act<S>) => {
  await a.wait(800)
  await a.click({ at: 'search', x: 0.6, y: 0.5 })
  a.set({ caret: true })
  await a.wait(250)
  await a.type('q', 'India', { interval: 110 })
  await a.wait(700)
  a.mark('open')
  await a.click({ at: 'india', x: 0.75, y: 0.5 })
  a.set({ page: 'place', caret: false })
  await a.wait(3000)
  a.mark('back')
  await a.click({ at: 'back', x: 0.6, y: 0.6 })
  a.set({ page: 'find' })
  await a.wait(900)
  // The search is cleared the way the field clears: the areas come back
  a.set({ q: '' })
  await a.move('rest')
  await a.wait(600)
}

export default function CzechPalFind() {
  const dark = useDark()
  return (
    <Stage<S>
      width={400}
      height={480}
      compact={{ below: 400, width: 358, height: 480 }}
      initial={START}
      poster={{ q: 'India', caret: false, page: 'place' }}
      script={script}
      cursor={{ at: REST, style: 'touch' }}
      accent="#2251D1"
      className="cp-scene cp-find"
    >
      {(s, _rect, layout) => (
        <>
          <Phone width={layout === 'compact' ? 326 : 320} frame="pro" dark={dark} className="cp-phone">
            <div className="cp-app" data-page={s.page}>
              <section className="cp-page cp-page--find">
                <div className="cp-large">Find</div>
                <div className="cp-body">
                  <div className="cp-search" data-target="search">
                    <Search size={18} strokeWidth={2} absoluteStrokeWidth />
                    {s.q ? (
                      <span className="cp-search__text">
                        {s.q}
                        {s.caret && <span className="cp-caret" />}
                      </span>
                    ) : (
                      <span className="cp-search__placeholder">
                        {s.caret && <span className="cp-caret" />}
                        Doctor, embassy, notary, plumber…
                      </span>
                    )}
                  </div>
                  <div className="cp-find__views">
                    <div className="cp-areas" data-hidden={!!s.q || undefined}>
                      <div className="cp-section">Where to look</div>
                      <div className="cp-card cp-list">
                        {AREAS.map(({ icon: Icon, title }) => (
                          <div key={title} className="cp-row">
                            <span className="cp-row__icon">
                              <Icon size={18} strokeWidth={2} absoluteStrokeWidth />
                            </span>
                            <span className="cp-row__title">{title}</span>
                            <ChevronRight className="cp-row__chev" size={18} strokeWidth={2} absoluteStrokeWidth />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="cp-results" data-shown={s.q.length >= 3 || undefined}>
                      <div className="cp-section">Places</div>
                      <div className="cp-card cp-list">
                        <div className="cp-row cp-row--tall" data-target="india">
                          <span className="cp-row__icon">
                            <Landmark size={18} strokeWidth={2} absoluteStrokeWidth />
                          </span>
                          <span className="cp-row__text">
                            <span className="cp-row__title">India</span>
                            <span className="cp-row__sub">Embassy · Milady Horákové 60/93, Praha 7</span>
                          </span>
                          <ChevronRight className="cp-row__chev" size={18} strokeWidth={2} absoluteStrokeWidth />
                        </div>
                      </div>
                      <div className="cp-section">
                        <Bar w={80} h={9} r={4} tone={3} />
                      </div>
                      <div className="cp-card cp-list">
                        {[150, 120].map((w) => (
                          <div key={w} className="cp-row">
                            <Bar w={22} h={22} r={7} tone={2} />
                            <Bar w={w} h={9} r={4} tone={3} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="cp-page cp-page--place">
                <nav className="cp-nav">
                  <span className="cp-back" data-target="back">
                    <ChevronLeft size={30} strokeWidth={2.4} absoluteStrokeWidth />
                  </span>
                </nav>
                <div className="cp-body">
                  <div className="cp-place__name">India</div>
                  <div className="cp-place__full">Embassy of the Republic of India</div>
                  <div className="cp-card cp-list cp-place__rows">
                    <div className="cp-row cp-row--tall">
                      <span className="cp-row__icon">
                        <MapPin size={18} strokeWidth={2} absoluteStrokeWidth />
                      </span>
                      <span className="cp-row__text">
                        <span className="cp-row__title">Milady Horákové 60/93, Praha 7</span>
                        <span className="cp-row__sub cp-row__sub--link">Open in Maps</span>
                      </span>
                    </div>
                    <div className="cp-row cp-row--tall">
                      <span className="cp-row__icon">
                        <PhoneIcon size={18} strokeWidth={2} absoluteStrokeWidth />
                      </span>
                      <span className="cp-row__text">
                        <span className="cp-row__title">257 533 490</span>
                        <span className="cp-row__sub cp-row__sub--link">Call</span>
                      </span>
                    </div>
                  </div>
                  <div className="cp-section">Office hours</div>
                  <div className="cp-card cp-list">
                    <div className="cp-row">
                      <span className="cp-row__icon">
                        <Clock size={18} strokeWidth={2} absoluteStrokeWidth />
                      </span>
                      <span className="cp-row__title">Mon–Fri 9:00–13:00, 13:30–17:30</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </Phone>
          <span data-target="rest" className="cp-rest" style={{ left: REST[layout].x, top: REST[layout].y }} />
        </>
      )}
    </Stage>
  )
}
