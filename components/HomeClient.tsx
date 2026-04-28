'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import VizmayaLogo from '@/components/VizmayaLogo'

export interface HomeStory {
  slug: string
  title: string
  subtitle: string
  date: string
  byline: string
}

const css = `
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
.vz{
  --teal:#057A6E;--pink:#E84D7A;--blue:#2B4ACF;
  --ink:#0C0C10;--cream:#F4F1EC;--muted:#4A4742;--line:rgba(12,12,16,.1);
  --ff-d:'Fraunces',Georgia,serif;
  --ff-m:'JetBrains Mono',ui-monospace,monospace;
  background:var(--cream);color:var(--ink);font-family:var(--ff-m);-webkit-font-smoothing:antialiased;font-size:15px;line-height:1.75;
}
.vz ::selection{background:var(--teal);color:var(--ink)}
.vz a{text-decoration:none;transition:opacity .3s,color .3s}.vz a:hover{opacity:.7}
.vz button{cursor:pointer;transition:opacity .3s}.vz button:hover{opacity:.85}
.vz em{font-style:italic}

.vz .rv{opacity:0;transform:translateY(16px);transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1)}
.vz .rv.v{opacity:1;transform:translateY(0)}
.vz .rv[data-d="1"]{transition-delay:.08s}.vz .rv[data-d="2"]{transition-delay:.16s}
.vz .rv[data-d="3"]{transition-delay:.24s}.vz .rv[data-d="4"]{transition-delay:.32s}

/* Nav ---------------------------------------------------- */
.vz .nav{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;justify-content:space-between;align-items:center;padding:18px clamp(24px,5vw,56px);background:transparent;transition:background .4s,border-color .4s,backdrop-filter .4s;border-bottom:1px solid transparent}
.vz .nav.scrolled{background:rgba(244,241,236,.94);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.vz .nav-logo{cursor:pointer;display:flex;align-items:center;background:none;border:none;padding:0}
.vz .nav-r{display:flex;gap:28px;align-items:center}
.vz .nav-link{font-family:var(--ff-m);font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:var(--ink);opacity:.55}
.vz .nav-cta{font-family:var(--ff-m);font-size:10.5px;letter-spacing:1.8px;text-transform:uppercase;color:var(--cream)!important;background:var(--ink);padding:10px 18px;border-radius:2px;opacity:1!important}

/* Shared ------------------------------------------------- */
.vz .rule{height:1px;background:var(--line);width:100%}
.vz .container{max-width:1180px;margin:0 auto;padding:0 clamp(24px,5vw,56px)}
.vz .kicker{font-family:var(--ff-m);font-size:10.5px;letter-spacing:2.4px;text-transform:uppercase;color:var(--teal);display:inline-flex;align-items:center;gap:10px}
.vz .kicker::before{content:'';display:inline-block;width:20px;height:1px;background:var(--teal)}
.vz h1,.vz h2,.vz h3{font-family:var(--ff-d);font-weight:500;font-style:normal;letter-spacing:-.015em;color:var(--ink);line-height:1.1;margin:0}
.vz .body{font-family:var(--ff-m);font-size:14px;line-height:1.85;color:var(--muted);margin:0}
.vz .btn{font-family:var(--ff-m);font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:14px 26px;border-radius:2px;border:1px solid var(--ink);font-weight:500;display:inline-block;background:var(--ink);color:var(--cream)}
.vz .btn.ghost{background:transparent;color:var(--ink)}
.vz .btn.teal{background:var(--teal);color:var(--ink);border-color:var(--teal)}

/* Masthead (hero + work grid as one top block) ----------- */
.vz .masthead{padding:150px clamp(24px,5vw,56px) 100px;position:relative}
.vz .hero{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;max-width:1200px;margin:0 auto 80px;position:relative}
.vz .hero-kick,.vz .hero-h1,.vz .hero-deck{opacity:0;transition:opacity .7s ease,transform .8s cubic-bezier(.22,1,.36,1)}
.vz .hero-kick{transition-delay:.15s}
.vz .hero-h1{transform:translateY(20px);transition-delay:.3s}
.vz .hero-deck{transition-delay:.55s}
.vz .loaded .hero-kick,.vz .loaded .hero-deck{opacity:1}
.vz .loaded .hero-h1{opacity:1;transform:translateY(0)}
.vz .hero h1{font-size:clamp(42px,6.8vw,88px);line-height:1.02;letter-spacing:-.025em;margin:28px 0 32px;max-width:15ch}
.vz .hero h1 em{font-family:var(--ff-d);font-style:italic;font-weight:400}
.vz .hero-deck{font-family:var(--ff-m);font-size:13px;line-height:1.75;color:var(--muted);max-width:52ch;margin:0 auto;letter-spacing:.01em}

/* Triad (Data · Narrative · Design) ---------------------- */
.vz .triad{padding:96px clamp(24px,5vw,56px);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.vz .triad-head{text-align:center;margin-bottom:72px}
.vz .triad-head h2{font-size:clamp(28px,3.4vw,40px);font-style:italic;font-weight:400;margin-top:18px;max-width:22ch;margin-left:auto;margin-right:auto}
.vz .triad-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;max-width:1100px;margin:0 auto}
.vz .triad-col{padding:0 clamp(16px,3vw,40px);text-align:center;position:relative}
.vz .triad-col + .triad-col{border-left:1px solid var(--line)}
.vz .triad-col .node{font-family:var(--ff-m);font-size:10.5px;letter-spacing:2.4px;text-transform:uppercase;margin-bottom:18px}
.vz .triad-col h3{font-size:clamp(32px,4vw,52px);font-style:italic;font-weight:400;margin-bottom:16px}
.vz .triad-col p{font-family:var(--ff-m);font-size:13px;line-height:1.85;color:var(--muted);max-width:28ch;margin:0 auto}
.vz .triad-col.data .node{color:var(--teal)}
.vz .triad-col.narrative .node{color:var(--pink)}
.vz .triad-col.design .node{color:var(--blue)}
.vz .triad-foot{text-align:center;margin-top:64px;max-width:58ch;margin-left:auto;margin-right:auto}
.vz .triad-foot p{font-family:var(--ff-m);font-size:12.5px;line-height:1.85;color:var(--muted)}
.vz .triad-foot em{font-family:var(--ff-d);font-style:italic;font-size:15px;color:var(--ink)}

/* Work / bento ------------------------------------------- */
.vz .bento{display:grid;grid-template-columns:repeat(6,1fr);grid-auto-rows:minmax(170px,auto);gap:14px;max-width:1200px;margin:0 auto;text-align:left}
.vz .bn{position:relative;background:#fff;border:1px solid var(--line);border-radius:6px;padding:26px;display:flex;flex-direction:column;justify-content:space-between;transition:transform .3s ease,box-shadow .3s ease,border-color .3s ease;color:var(--ink);overflow:hidden}
.vz .bn:hover{transform:translateY(-2px);box-shadow:0 12px 32px -18px rgba(12,12,16,.22);border-color:rgba(12,12,16,.18);opacity:1}
.vz .bn-k{font-family:var(--ff-m);font-size:10px;letter-spacing:1.8px;text-transform:uppercase;color:var(--muted);display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
.vz .bn-n{color:var(--teal)}
.vz .bn h3{font-family:var(--ff-d);font-style:italic;font-weight:400;color:var(--ink);line-height:1.18;margin:0 0 10px;font-size:22px}
.vz .bn p{font-family:var(--ff-m);font-size:12.5px;line-height:1.7;color:var(--muted);margin:0}
.vz .bn-a{margin-top:18px;font-family:var(--ff-m);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--teal);opacity:.55;transition:opacity .3s}
.vz .bn:hover .bn-a{opacity:1}
.vz .bn.feature{grid-column:span 4;grid-row:span 2;background:var(--ink);border-color:rgba(255,255,255,.08);color:#fff}
.vz .bn.feature h3{color:#fff;font-size:clamp(26px,3vw,38px);line-height:1.15}
.vz .bn.feature p{color:rgba(255,255,255,.78);font-size:13.5px;line-height:1.75}
.vz .bn.feature .bn-k{color:rgba(255,255,255,.4)}
.vz .bn.feature .bn-n{color:var(--teal)}
.vz .bn.wide{grid-column:span 2}
.vz .bn.tall{grid-column:span 2;grid-row:span 2}
.vz .bn.accent-pink{background:var(--pink);border-color:transparent;color:#fff}
.vz .bn.accent-pink h3,.vz .bn.accent-pink p,.vz .bn.accent-pink .bn-k,.vz .bn.accent-pink .bn-a{color:#fff}
.vz .bn.accent-pink p,.vz .bn.accent-pink .bn-k{color:rgba(255,255,255,.8)}
.vz .bn.accent-blue{background:var(--blue);border-color:transparent;color:#fff}
.vz .bn.accent-blue h3,.vz .bn.accent-blue p,.vz .bn.accent-blue .bn-k,.vz .bn.accent-blue .bn-a{color:#fff}
.vz .bn.accent-blue p,.vz .bn.accent-blue .bn-k{color:rgba(255,255,255,.8)}

/* Manifesto ---------------------------------------------- */
.vz .manifesto{padding:120px clamp(24px,5vw,56px);background:var(--cream);border-top:1px solid var(--line)}
.vz .manifesto-inner{max-width:760px;margin:0 auto}
.vz .manifesto h2{font-size:clamp(30px,4vw,48px);font-style:italic;font-weight:400;margin:20px 0 40px;line-height:1.12}
.vz .manifesto p{font-family:var(--ff-m);font-size:14.5px;line-height:1.95;color:#2A2824;margin:0 0 24px}
.vz .pull{font-family:var(--ff-d);font-style:italic;font-weight:400;font-size:clamp(22px,2.8vw,30px);line-height:1.35;color:var(--ink);padding:36px 0;margin:40px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);text-align:center}

/* Who we are --------------------------------------------- */
.vz .who{padding:120px clamp(24px,5vw,56px);border-top:1px solid var(--line)}
.vz .who-inner{max-width:1100px;margin:0 auto}
.vz .who-head{text-align:center;margin-bottom:72px}
.vz .who-head h2{font-size:clamp(30px,4vw,48px);font-style:italic;font-weight:400;margin-top:18px}
.vz .who-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(40px,6vw,80px)}
.vz .bio h3{font-family:var(--ff-d);font-style:italic;font-weight:400;font-size:28px;margin-bottom:6px}
.vz .bio .role{font-family:var(--ff-m);font-size:10.5px;letter-spacing:1.8px;text-transform:uppercase;color:var(--teal);margin-bottom:20px}
.vz .bio p{font-family:var(--ff-m);font-size:13.5px;line-height:1.85;color:#2A2824;margin:0}

/* Contact ------------------------------------------------ */
.vz .contact{padding:140px clamp(24px,5vw,56px);background:var(--ink);color:var(--cream);text-align:center}
.vz .contact h2{color:var(--cream);font-size:clamp(30px,4.4vw,52px);font-style:italic;font-weight:400;max-width:18ch;margin:24px auto 28px;line-height:1.12}
.vz .contact p{font-family:var(--ff-m);font-size:13.5px;color:rgba(244,241,236,.6);max-width:44ch;margin:0 auto 40px;line-height:1.8}
.vz .contact .kicker{color:var(--teal)}
.vz .contact .kicker::before{background:var(--teal)}
.vz .contact .btn.teal{background:var(--teal);color:var(--ink);border-color:var(--teal)}

/* Footer ------------------------------------------------- */
.vz footer{background:var(--ink);padding:32px clamp(24px,5vw,56px);border-top:1px solid rgba(255,255,255,.06);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px}
.vz footer .mark{font-family:var(--ff-d);font-size:14px;font-style:italic;color:rgba(244,241,236,.4)}
.vz footer .loc{font-family:var(--ff-m);font-size:10px;letter-spacing:1.6px;color:rgba(244,241,236,.25);margin-left:14px;text-transform:uppercase}
.vz footer .links{display:flex;gap:24px}
.vz footer .links a{font-family:var(--ff-m);font-size:10px;letter-spacing:1.8px;text-transform:uppercase;color:rgba(244,241,236,.3)}

/* Responsive --------------------------------------------- */
@media(max-width:860px){
  .vz .bento{grid-template-columns:repeat(2,1fr)}
  .vz .bn,.vz .bn.feature,.vz .bn.wide,.vz .bn.tall{grid-column:span 2;grid-row:auto}
  .vz .triad-grid{grid-template-columns:1fr}
  .vz .triad-col + .triad-col{border-left:none;border-top:1px solid var(--line);margin-top:40px;padding-top:40px}
  .vz .who-grid{grid-template-columns:1fr}
}
@media(max-width:560px){
  .vz .nav-link{display:none}
}
`

export default function HomeClient({ stories }: { stories: HomeStory[] }) {
  useEffect(() => {
    const nav = document.getElementById('nav')
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 60)
    window.addEventListener('scroll', onScroll)

    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add('v') }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.rv').forEach((el) => obs.observe(el))

    const t = setTimeout(() => document.getElementById('hero')?.classList.add('loaded'), 80)

    return () => {
      window.removeEventListener('scroll', onScroll)
      obs.disconnect()
      clearTimeout(t)
    }
  }, [])

  return (
    <div className="vz">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=JetBrains+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <nav className="nav" id="nav">
        <button
          className="nav-logo"
          onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Vizmaya Labs"
        >
          <VizmayaLogo className="w-[180px] h-[44px]" />
        </button>
        <div className="nav-r">
          <a className="nav-link" href="#work">Work</a>
          <a className="nav-link" href="#about">About</a>
          <a className="nav-cta" href="https://theasymmetryletter.substack.com" target="_blank" rel="noreferrer">Subscribe</a>
        </div>
      </nav>

      {/* MASTHEAD — hero + work grid as one block */}
      <section id="hero" className="masthead">
        <div className="hero">
          <div className="hero-kick kicker">Data journalism · Visual intelligence</div>
          <h1 className="hero-h1">
            We turn data into stories<br />
            <em>people remember.</em>
          </h1>
          <p className="hero-deck">
            A studio sitting at the border between what is true and what is understood —
            building visual essays on geopolitics, technology, and the slow variables
            that shape the present.
          </p>
        </div>

        <div id="work" className="bento rv">
          {stories.map((s, i) => {
            const mod = i % 5
            const tileClass = i === 0 ? 'feature' : mod === 1 ? 'wide' : mod === 2 ? 'wide' : mod === 3 ? 'tall accent-pink' : 'wide accent-blue'
            return (
              <Link key={s.slug} href={`/story/${s.slug}`} className={`bn ${tileClass}`}>
                <div>
                  <div className="bn-k">
                    <span className="bn-n">#{String(i + 1).padStart(2, '0')}</span>
                    <span>{new Date(s.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.subtitle}</p>
                </div>
                <div className="bn-a">Read →</div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* TRIAD — three worlds, three mysteries */}
      <section className="triad">
        <div className="triad-head">
          <div className="rv kicker">Three worlds</div>
          <h2 className="rv" data-d="1">
            Every story lives across three worlds — each one incomplete without the other two.
          </h2>
        </div>

        <div className="triad-grid">
          <div className="triad-col data rv" data-d="1">
            <div className="node">01 — Data</div>
            <h3>Pattern</h3>
            <p>The structure that exists in the world whether or not anyone is looking. We find it, and we refuse to distort it.</p>
          </div>
          <div className="triad-col narrative rv" data-d="2">
            <div className="node">02 — Narrative</div>
            <h3>Meaning</h3>
            <p>The sense a mind makes of the pattern. The question it answers. The thing you can carry away and repeat.</p>
          </div>
          <div className="triad-col design rv" data-d="3">
            <div className="node">03 — Design</div>
            <h3>Form</h3>
            <p>The artefact that carries meaning into the world. The chart, the essay, the frame. The thing that makes it travel.</p>
          </div>
        </div>

        <div className="triad-foot rv" data-d="4">
          <p>
            Our mark borrows from Roger Penrose&apos;s diagram of reality&apos;s three mysteries —
            the leaps between pattern, mind, and form. None of them makes sense alone.{' '}
            <em>Vismaya</em> is Sanskrit for wonder: the feeling when something you couldn&apos;t
            see becomes suddenly, undeniably visible. We added the <em>z</em> for viz. That&apos;s the job.
          </p>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="manifesto">
        <div className="manifesto-inner">
          <div className="rv kicker">What we believe</div>
          <h2 className="rv" data-d="1">Rigour and beauty are the same demand.</h2>

          <p className="rv" data-d="1">
            The world is full of important things nobody can see — not because they&apos;re hidden,
            but because nobody has bothered to make them legible. The supply chain that keeps
            your phone alive runs through six countries and a chokepoint most people can&apos;t
            name. The policy shift that will reshape your industry in five years is sitting in
            an appendix, unread. The slow variable that explains the fast headline is right
            there in the dataset, ignored.
          </p>

          <div className="pull rv" data-d="2">
            &ldquo;Either things stay buried in jargon, or they get compressed into hot takes.
            Both fail the same way.&rdquo;
          </div>

          <p className="rv" data-d="1">
            We don&apos;t start with a format — we start with a question: what does this insight
            actually need to land? Sometimes it&apos;s a ten-minute scrollytelling piece. Sometimes
            a single chart with a headline. Sometimes a forty-five-second reel. We&apos;d rather
            kill a good story than publish a wrong one, and we&apos;d rather make one person
            think differently than impress ten thousand who scroll past and feel nothing.
          </p>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section id="about" className="who">
        <div className="who-inner">
          <div className="who-head">
            <div className="rv kicker">Who we are</div>
            <h2 className="rv" data-d="1">A two-person studio, Jaipur &amp; Bengaluru.</h2>
          </div>
          <div className="who-grid">
            <div className="bio rv" data-d="1">
              <h3>Shashank A. Pandey</h3>
              <div className="role">Data storytelling · Visual journalism</div>
              <p>
                Data storyteller and visual journalist based in Jaipur. Previously wrote 40+
                articles at Analytics India Magazine, drove 50% user growth at Waxwing AI, and
                spent eight months building a data visualization practice that accumulated
                roughly 2 million views — including an a16z Chart of the Week feature. Thinks
                about AI infrastructure economics, geopolitics, and the gap between what is
                true and what is understood. Publishes <em>The Asymmetry Letter</em>.
              </p>
            </div>
            <div className="bio rv" data-d="2">
              <h3>Suprabho Dhenki</h3>
              <div className="role">Product design · Creative technology</div>
              <p>
                Product designer and creative technologist. Founder of Promad, where he builds
                design tools and workflows — Figma plugins, parametric systems, AI-assisted
                production pipelines — that address the fragmentation of modern creative work.
                Previously designed at Microsoft, 1mg, ClearTax, Merkle Science, and Kidzovo;
                early work on interaction design at IIT Guwahati was featured in a CHI
                publication. Bridges design and code through motion, data visualization, and
                modular frameworks for creative production.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact">
        <div className="rv kicker">Work with us</div>
        <h2 className="rv" data-d="1">
          Have data that deserves a better story?
        </h2>
        <p className="rv" data-d="2">
          We work with organisations and research teams who believe data should be seen,
          not just stored.
        </p>
        <div className="rv" data-d="3">
          <a className="btn teal" href="mailto:hello@vizmayalabs.com">Get in touch &nbsp;→</a>
        </div>
      </section>

      <footer>
        <div>
          <span className="mark">Vizmaya Labs</span>
          <span className="loc">Jaipur · Bengaluru</span>
        </div>
        <div className="links">
          <a href="https://theasymmetryletter.substack.com" target="_blank" rel="noreferrer">Newsletter</a>
          <a href="https://linkedin.com/company/vizmaya-labs" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://instagram.com/vizzmaya" target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </footer>
    </div>
  )
}
