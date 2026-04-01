import { HeroBlock } from '@/types/story'

export default function Hero({ block }: { block: HeroBlock }) {
  return (
    <section className="min-h-screen flex flex-col justify-center px-8 py-12 max-w-[900px] mx-auto">
      <div
        className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.15em] mb-6"
        style={{ color: 'var(--color-accent)' }}
      >
        The Asymmetry Letter · Cost Analysis · March 2026
      </div>
      <h1 className="font-[family-name:var(--font-serif)] text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.12] font-bold text-white mb-5 max-w-[780px]">
        {block.title}
      </h1>
      <p
        className="text-[1.1rem] leading-[1.65] max-w-[560px] mb-8"
        style={{ color: 'var(--color-muted)' }}
      >
        {block.dek}
      </p>
      <div
        className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.1em]"
        style={{ color: 'var(--color-muted)' }}
      >
        {block.byline}
      </div>
    </section>
  )
}
