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
  --teal:#0BBFAB;--pink:#E84D7A;--blue:#2B4ACF;
  --ink:#0C0C10;--cream:#F4F1EC;--muted:#4A4742;
  --ff-d:'Instrument Serif',serif;
  --ff-b:'Libre Franklin',sans-serif;
  --ff-m:'JetBrains Mono',monospace;
  --ff-script:'Caveat',cursive;
  --ff-display:'Fraunces',serif;
  background:var(--cream);color:var(--ink);font-family:var(--ff-b);-webkit-font-smoothing:antialiased;
}
.vz ::selection{background:var(--teal);color:var(--ink)}
.vz a{text-decoration:none;transition:opacity .3s}.vz a:hover{opacity:.8}
.vz button{cursor:pointer;transition:opacity .3s}.vz button:hover{opacity:.9}

.vz .rv{opacity:0;transform:translateY(24px);transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
.vz .rv.v{opacity:1;transform:translateY(0)}
.vz .rv[data-d="1"]{transition-delay:.06s}.vz .rv[data-d="2"]{transition-delay:.12s}
.vz .rv[data-d="3"]{transition-delay:.18s}.vz .rv[data-d="4"]{transition-delay:.24s}
.vz .rv[data-d="5"]{transition-delay:.3s}

.vz .nav{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;justify-content:space-between;align-items:center;padding:16px clamp(20px,4vw,48px);background:transparent;backdrop-filter:none;border-bottom:1px solid transparent;transition:all .4s}
.vz .nav.scrolled{background:rgba(244,241,236,.92);backdrop-filter:blur(14px);border-bottom:1px solid rgba(0,0,0,.05)}
.vz .nav-logo{cursor:pointer;display:flex;align-items:center;gap:10px;background:none;border:none;padding:0}
.vz .nav-wm{display:flex;align-items:baseline;gap:6px}
.vz .nav-wm span:first-child{font-family:var(--ff-d);font-size:22px;color:var(--ink);font-style:italic}
.vz .nav-wm span:last-child{font-family:var(--ff-m);font-size:9px;color:var(--teal);letter-spacing:2.5px;text-transform:uppercase}
.vz .nav-r{display:flex;gap:24px;align-items:center}
.vz .nav-r a{font-family:var(--ff-m);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(12,12,16,.35)}
.vz .nav-cta{font-family:var(--ff-b)!important;font-size:11px!important;letter-spacing:1.5px;text-transform:uppercase;color:var(--ink)!important;background:var(--teal);padding:9px 20px;border-radius:3px;font-weight:600}

.vz .pad{padding:100px clamp(20px,5vw,48px)}
.vz .dark{background:var(--ink);color:#fff}
.vz .cream{background:var(--cream)}
.vz .kicker{font-family:var(--ff-m);font-size:10px;letter-spacing:3.5px;text-transform:uppercase;margin-bottom:24px}
.vz .h-d{font-family:var(--ff-d);font-weight:400;font-style:italic;line-height:1.15;margin:0}
.vz .body{font-family:var(--ff-b);font-size:15px;line-height:1.8;margin:0 0 24px;color:var(--muted)}
.vz .center{text-align:center}
.vz .center .beliefs,.vz .center .bento{margin-left:auto;margin-right:auto}
.vz .mx{margin-left:auto;margin-right:auto}
.vz .body:last-child{margin-bottom:0}
.vz .grid-tx{position:absolute;inset:0;opacity:.025;pointer-events:none;background-image:repeating-linear-gradient(0deg,var(--ink) 0px,var(--ink) 1px,transparent 1px,transparent 80px),repeating-linear-gradient(90deg,var(--ink) 0px,var(--ink) 1px,transparent 1px,transparent 80px)}
.vz .btn{font-family:var(--ff-b);font-size:12px;letter-spacing:1.5px;text-transform:uppercase;padding:14px 30px;border-radius:3px;border:none;font-weight:600;display:inline-block}

.vz .crop-tr,.vz .crop-bl{position:absolute;opacity:.1}
.vz .crop-tr{top:28px;right:28px}.vz .crop-bl{bottom:28px;left:28px}
.vz .crop-tr::before{content:'';display:block;width:36px;height:1px;background:var(--ink);margin-bottom:4px;margin-left:auto}
.vz .crop-tr::after{content:'';display:block;width:1px;height:36px;background:var(--ink);margin-left:auto}
.vz .crop-bl::before{content:'';display:block;width:1px;height:36px;background:var(--ink)}
.vz .crop-bl::after{content:'';display:block;width:36px;height:1px;background:var(--ink);margin-top:4px}

.vz .hero-k,.vz .hero-h,.vz .hero-s,.vz .hero-b{opacity:0;transition:opacity .6s ease,transform .7s cubic-bezier(.22,1,.36,1)}
.vz .hero-k{transition-delay:.2s}.vz .hero-h{transform:translateY(24px);transition-delay:.35s}
.vz .hero-s{transition-delay:.6s}.vz .hero-b{transition-delay:.8s}
.vz .loaded .hero-k,.vz .loaded .hero-s,.vz .loaded .hero-b{opacity:1}
.vz .loaded .hero-h{opacity:1;transform:translateY(0)}
.vz .hero-ghost{position:absolute;right:clamp(20px,8vw,120px);top:50%;transform:translateY(-50%);opacity:0;transition:opacity 1.5s ease .8s;pointer-events:none}
.vz .loaded .hero-ghost{opacity:.06}

.vz .beliefs{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:0 48px;max-width:960px}
.vz .belief{padding:28px 0;border-top:1px solid rgba(12,12,16,.07)}
.vz .belief h3{font-family:var(--ff-d);font-size:20px;font-weight:400;color:var(--ink);margin:0 0 10px;font-style:italic;line-height:1.3}
.vz .belief p{font-family:var(--ff-b);font-size:13.5px;line-height:1.7;color:var(--muted);margin:0}

.vz .wg{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1px;background:rgba(255,255,255,.06)}
.vz .wc{background:var(--ink);padding:28px 24px;min-height:190px;display:flex;flex-direction:column;justify-content:space-between;transition:background .3s;color:inherit}
.vz .wc:hover{background:rgba(255,255,255,.025)}

.vz .bento{display:grid;grid-template-columns:repeat(6,1fr);grid-auto-rows:minmax(170px,auto);gap:14px}
.vz .bn{position:relative;background:#fff;border:1px solid rgba(12,12,16,.08);border-radius:6px;padding:26px;display:flex;flex-direction:column;justify-content:space-between;transition:transform .3s ease,box-shadow .3s ease,border-color .3s ease;color:var(--ink);overflow:hidden}
.vz .bn:hover{transform:translateY(-2px);box-shadow:0 12px 32px -18px rgba(12,12,16,.25);border-color:rgba(12,12,16,.18)}
.vz .bn-k{font-family:var(--ff-m);font-size:10px;letter-spacing:1.8px;text-transform:uppercase;color:var(--muted);display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
.vz .bn-n{color:var(--teal)}
.vz .bn h3{font-family:var(--ff-d);font-style:italic;font-weight:400;color:var(--ink);line-height:1.2;margin:0 0 10px;font-size:22px}
.vz .bn p{font-family:var(--ff-b);font-size:13px;line-height:1.65;color:var(--muted);margin:0}
.vz .bn-a{margin-top:18px;font-family:var(--ff-m);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--teal);opacity:.6;transition:opacity .3s}
.vz .bn:hover .bn-a{opacity:1}
.vz .bn.feature{grid-column:span 4;grid-row:span 2;background:var(--ink);border-color:rgba(255,255,255,.08);color:#fff}
.vz .bn.feature h3{color:#fff;font-size:clamp(26px,3vw,38px);line-height:1.15}
.vz .bn.feature p{color:rgba(255,255,255,.82);font-size:14.5px;line-height:1.7}
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
@media(max-width:860px){.vz .bento{grid-template-columns:repeat(2,1fr)}.vz .bn,.vz .bn.feature,.vz .bn.wide,.vz .bn.tall{grid-column:span 2;grid-row:auto}}
.vz .wc-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.vz .wc-n{font-family:var(--ff-m);font-size:11px;color:var(--teal);letter-spacing:1px}
.vz .wc-s{font-family:var(--ff-m);font-size:9px;letter-spacing:1.5px;text-transform:uppercase;padding:3px 8px;border-radius:2px}
.vz .wc-s.pub{color:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.08)}
.vz .wc-s.soon{color:var(--pink);border:1px solid rgba(232,77,122,.3)}
.vz .wc-t{font-family:var(--ff-b);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.28);margin-bottom:8px}
.vz .wc h3{font-family:var(--ff-d);font-size:19px;color:#fff;margin:0 0 8px;font-style:italic;line-height:1.3}
.vz .wc p{font-family:var(--ff-b);font-size:13px;line-height:1.65;color:rgba(255,255,255,.38);margin:0}
.vz .wc-a{margin-top:16px;font-family:var(--ff-m);font-size:10px;color:var(--teal);opacity:.3;transition:opacity .3s}
.vz .wc:hover .wc-a{opacity:1}

.vz .mark-l{display:flex;gap:clamp(32px,5vw,64px);align-items:flex-start;flex-wrap:wrap}
.vz .mark-t{flex:1;min-width:260px}

@media(max-width:640px){
  .vz .nav-cta{display:none}
  .vz .hero-ghost{display:none}
  .vz .mark-l{flex-direction:column;align-items:center}
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

    const t = setTimeout(() => document.getElementById('top')?.classList.add('loaded'), 80)

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
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Libre+Franklin:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&family=Caveat:wght@500;700&family=Fraunces:ital,wght@0,600;0,800;1,600&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <nav className="nav" id="nav">
        <button
          className="nav-logo"
          onClick={() => document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <VizmayaLogo className="w-[26px] h-[26px]" />
        </button>
        <div className="nav-r">
          <a className="nav-cta" href="https://theasymmetryletter.substack.com" target="_blank" rel="noreferrer">Subscribe</a>
        </div>
      </nav>

      <section id="work" className="cream center" style={{ padding: '120px clamp(20px,5vw,48px) 60px', position: 'relative', textAlign: 'center' }}>
        <div className="rv" style={{ marginBottom: 32, maxWidth: 1200, margin: '0 auto 32px' }}>
          <div>
            <div className="kicker" style={{ color: 'var(--teal)', marginBottom: 12, fontFamily: 'var(--ff-script)', fontSize: 18, letterSpacing: 1, textTransform: 'none' }}>Selected work</div>
            <h2 className="h-d" style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--ink)', lineHeight: 1.15, fontStyle: 'normal', fontWeight: 700 }}>Visual essays &amp; data stories</h2>
          </div>
        </div>
        <div className="bento rv" style={{ maxWidth: 1200, margin: '0 auto' }}>
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

      <section
        id="top"
        className="cream"
        style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '80px clamp(20px,5vw,48px) 100px', position: 'relative', overflow: 'hidden' }}
      >
        <div className="grid-tx"></div>
        <div className="crop-tr"></div>
        <div className="crop-bl"></div>
        <div className="hero-ghost">
          <VizmayaLogo className="w-[320px] h-[320px]" />
        </div>
        <div style={{ maxWidth: 800, position: 'relative', zIndex: 1, margin: '0 auto' }}>
          <div className="hero-k" style={{ fontFamily: 'var(--ff-script)', fontSize: 22, letterSpacing: '0.5px', color: 'var(--pink)', marginBottom: 24 }}>
            Data journalism &amp; editorial intelligence
          </div>
          <h1 className="hero-h h-d" style={{ fontSize: 'clamp(40px,6.5vw,76px)', lineHeight: 1.06, color: 'var(--ink)', margin: '0 0 44px' }}>
            <span style={{ fontFamily: 'var(--ff-display)', fontStyle: 'normal', fontWeight: 800 }}>We turn data into stories</span><br />
            <span style={{ color: '#2A2824' }}>people actually </span>
            <span style={{ borderBottom: '4px solid var(--teal)', paddingBottom: 2 }}>remember.</span>
          </h1>
          <div className="hero-b">
            <a className="btn" href="#work" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>See the Work</a>
          </div>
        </div>
      </section>

      <section className="dark" style={{ padding: '80px clamp(20px,5vw,48px)', borderTop: '3px solid var(--teal)', textAlign: 'center' }}>
        <div className="rv" style={{ maxWidth: 860, margin: '0 auto' }}>
          <div className="mark-l" style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <div style={{ flexShrink: 0 }}>
              <VizmayaLogo className="w-[180px] h-[210px]" />
            </div>
            <div style={{ flex: 1, minWidth: 260, maxWidth: 640 }}>
              <p style={{ fontFamily: 'var(--ff-d)', fontSize: 'clamp(18px,2.5vw,26px)', lineHeight: 1.55, color: 'rgba(255,255,255,.95)', fontStyle: 'italic', margin: '0 0 24px' }}>
                Our mark borrows from Roger Penrose&apos;s diagram of reality&apos;s three mysteries. Three worlds, each giving rise to the next. None makes sense alone.
              </p>
              <p style={{ fontFamily: 'var(--ff-b)', fontSize: 14.5, lineHeight: 1.75, color: 'rgba(255,255,255,.8)', margin: '0 0 24px' }}>
                <span style={{ color: 'var(--teal)', fontWeight: 600 }}>Data</span> is the pattern that exists whether or not anyone sees it.{' '}
                <span style={{ color: 'var(--pink)', fontWeight: 600 }}>Narrative</span> is the sense-making that turns pattern into meaning.{' '}
                <span style={{ color: 'var(--blue)', fontWeight: 600 }}>Design</span> is the artefact that carries meaning into the world.
                Each node needs the other two. The edges matter as much as the nodes.
              </p>
              <p style={{ fontFamily: 'var(--ff-b)', fontSize: 13.5, lineHeight: 1.75, color: 'rgba(255,255,255,.7)', margin: 0 }}>
                <em style={{ fontFamily: 'var(--ff-script)', fontSize: 22, color: 'var(--teal)', fontStyle: 'normal' }}>Vismaya</em> is Sanskrit for wonder. The feeling when something you couldn&apos;t see becomes suddenly, undeniably visible. We added the &quot;z&quot; for <em>viz</em>. That&apos;s the job.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cream" style={{ padding: '40px clamp(20px,5vw,48px) 100px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className="rv" style={{ marginBottom: 40 }}>
            <div className="kicker" style={{ color: 'var(--pink)' }}>What we believe</div>
          </div>
          <div className="rv">
            <p style={{ fontFamily: 'var(--ff-b)', fontSize: 15.5, lineHeight: 1.85, color: '#2A2824', margin: '0 0 28px' }}>
              The world is full of important things that nobody can see. Not because they&apos;re hidden, but because nobody has bothered to make them legible. The supply chain that keeps your phone alive runs through six countries and a chokepoint most people can&apos;t name. The policy shift that will reshape your industry in five years is sitting in an appendix somewhere, unread. The slow variable that explains the fast headline is right there in the dataset, ignored, because it doesn&apos;t fit a news cycle.
            </p>
          </div>
          <div className="rv" data-d="1">
            <p style={{ fontFamily: 'var(--ff-b)', fontSize: 15.5, lineHeight: 1.85, color: '#2A2824', margin: '0 0 28px' }}>
              The information landscape has two failure modes. Either things stay buried in jargon and PDFs, technically available but functionally invisible. Or they get compressed into hot takes, visible but stripped of everything that made them true. Both fail the same way: the distance between what is real and what is understood stays wide, and everyone just accepts that.
            </p>
          </div>
          <div className="rv" data-d="2">
            <p style={{ fontFamily: 'var(--ff-b)', fontSize: 15.5, lineHeight: 1.85, color: '#2A2824', margin: '0 0 28px' }}>
              We don&apos;t accept it. We think rigour and beauty are the same demand, not a trade-off. You have to understand the data deeply enough to not distort it, and you have to care about craft enough to make the understanding travel. One without the other is either a pretty lie or a correct thing nobody reads.
            </p>
          </div>
          <div className="rv" data-d="3">
            <p style={{ fontFamily: 'var(--ff-b)', fontSize: 15.5, lineHeight: 1.85, color: '#2A2824', margin: '0 0 28px' }}>
              So we don&apos;t start with a format. We start with a question: what does this insight actually need to land? Sometimes the answer is a ten-minute scrollytelling piece. Sometimes it&apos;s a single chart with a headline. Sometimes it&apos;s a 45-second reel. We&apos;d rather kill a good story than publish a wrong one, and we&apos;d rather make one person think differently than impress ten thousand who scroll past and feel nothing.
            </p>
          </div>
          <div className="rv" data-d="4">
            <p style={{ fontFamily: 'var(--ff-b)', fontSize: 15.5, lineHeight: 1.85, color: '#2A2824', margin: 0 }}>
              That&apos;s the job. Sit at the border between what is true and what is understood. Refuse to let the distance between them be someone else&apos;s problem.
            </p>
          </div>
        </div>
      </section>

      <section className="cream pad" id="about" style={{ borderTop: '1px solid rgba(12,12,16,.07)', textAlign: 'center' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div className="rv">
            <div className="kicker" style={{ color: 'var(--pink)' }}>Who we are</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 48, marginTop: 8 }}>
            <div className="rv" data-d="1">
              <p style={{ fontFamily: 'var(--ff-d)', fontSize: 22, fontStyle: 'italic', color: 'var(--ink)', margin: '0 0 6px', lineHeight: 1.3 }}>Shashank Mehta</p>
              <p style={{ fontFamily: 'var(--ff-m)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--teal)', margin: '0 0 16px' }}>Data storytelling · Visual journalism</p>
              <p style={{ fontFamily: 'var(--ff-b)', fontSize: 14, lineHeight: 1.75, color: '#2A2824', margin: 0 }}>
                Data storyteller and visual journalist based in Jaipur. Previously wrote 40+ articles at Analytics India Magazine, drove 50% user growth at Waxwing AI, and spent eight months building a data visualization practice that accumulated roughly 2 million views, including an a16z Chart of the Week feature. Thinks about AI infrastructure economics, geopolitics, and the gap between what is true and what is understood. Publishes The Asymmetry Letter.
              </p>
            </div>
            <div className="rv" data-d="2">
              <p style={{ fontFamily: 'var(--ff-d)', fontSize: 22, fontStyle: 'italic', color: 'var(--ink)', margin: '0 0 6px', lineHeight: 1.3 }}>Suprabho Dhenki</p>
              <p style={{ fontFamily: 'var(--ff-m)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--teal)', margin: '0 0 16px' }}>[ Role / domain ]</p>
              <p style={{ fontFamily: 'var(--ff-b)', fontSize: 14, lineHeight: 1.75, color: '#2A2824', margin: 0 }}>
                [ Suprabho&apos;s bio goes here. Share a few lines about his background, what he brings to Vizmaya, and how you two started working together, and I&apos;ll write this to match. ]
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="dark" style={{ padding: '100px clamp(20px,5vw,48px)', textAlign: 'center' }}>
        <div className="rv">
          <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'center' }}>
            <VizmayaLogo className="w-[120px] h-[120px]" />
          </div>
          <h2 className="h-d" style={{ fontFamily: 'var(--ff-display)', fontStyle: 'normal', fontWeight: 700, fontSize: 'clamp(22px,3.5vw,36px)', color: 'rgba(255,255,255,.92)', margin: '0 0 20px', lineHeight: 1.35 }}>
            Have data that deserves<br />
            <span style={{ color: '#fff', fontFamily: 'var(--ff-script)', fontWeight: 700 }}>a better story?</span>
          </h2>
          <p style={{ fontFamily: 'var(--ff-b)', fontSize: 14.5, color: 'rgba(255,255,255,.75)', maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.7 }}>
            We work with organisations and research teams who believe data should be seen, not just stored.
          </p>
          <a className="btn" href="mailto:hello@vizmayalabs.com" style={{ background: 'var(--teal)', color: 'var(--ink)' }}>Get in Touch</a>
        </div>
      </section>

      <footer style={{ background: 'var(--ink)', padding: '36px clamp(20px,5vw,48px)', borderTop: '1px solid rgba(255,255,255,.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--ff-d)', fontSize: 14, color: 'rgba(255,255,255,.3)', fontStyle: 'italic' }}>Vizmaya Labs</span>
          <span style={{ fontFamily: 'var(--ff-m)', fontSize: 10, color: 'rgba(255,255,255,.15)', letterSpacing: '1px' }}>Jaipur · Singapore</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="https://theasymmetryletter.substack.com" target="_blank" rel="noreferrer" style={{ fontFamily: 'var(--ff-m)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,.18)' }}>Newsletter</a>
          <a href="https://linkedin.com/company/vizmaya-labs" target="_blank" rel="noreferrer" style={{ fontFamily: 'var(--ff-m)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,.18)' }}>LinkedIn</a>
          <a href="https://instagram.com/vizzmaya" target="_blank" rel="noreferrer" style={{ fontFamily: 'var(--ff-m)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,.18)' }}>Instagram</a>
        </div>
      </footer>
    </div>
  )
}
