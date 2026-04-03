import { HeroBlock } from '@/types/story'
import HeroTitle, {
  type TitleSegment,
  krFlag,
  brainIcon,
  shipIcon,
  oilDrumIcon,
  boltIcon,
} from './HeroTitle'

const LANDSCAPE_SEGMENTS: TitleSegment[] = [
  { type: 'pill', icon: krFlag, text: 'South Korea' },
  { type: 'text', content: ' Makes the ' },
  { type: 'pill', icon: brainIcon, text: 'Memory' },
  { type: 'text', content: ' and Builds the ' },
  { type: 'pill', icon: shipIcon, text: 'Ships' },
  { type: 'text', content: '. It Just Lost All ' },
  { type: 'pill', icon: boltIcon, text: '3 Energy Lines.' },
  { type: 'text', content: ' ' },
  { type: 'icon-pill', icon: oilDrumIcon, text: 'LNG', color: '#155dfc' },
  { type: 'text', content: ' ' },
  { type: 'icon-pill', icon: oilDrumIcon, text: 'Oil', color: '#1a1a1a' },
  { type: 'text', content: ' ' },
  { type: 'icon-pill', icon: oilDrumIcon, text: 'He', color: '#2d7a4f' },
]

const PORTRAIT_SEGMENTS: TitleSegment[] = [
  { type: 'pill', icon: krFlag, text: 'South Korea' },
  { type: 'break' },
  { type: 'text', content: 'Makes the ' },
  { type: 'pill', icon: brainIcon, text: 'Memory' },
  { type: 'text', content: ' &' },
  { type: 'break' },
  { type: 'text', content: 'Builds the ' },
  { type: 'pill', icon: shipIcon, text: 'Ships' },
  { type: 'break' },
  { type: 'text', content: 'It Just Lost All' },
  { type: 'break' },
  { type: 'pill', icon: boltIcon, text: '3 Energy Lines.' },
  { type: 'break' },
  { type: 'icon-pill', icon: oilDrumIcon, text: 'LNG', color: '#155dfc' },
  { type: 'text', content: ' ' },
  { type: 'icon-pill', icon: oilDrumIcon, text: 'Oil', color: '#1a1a1a' },
  { type: 'text', content: ' ' },
  { type: 'icon-pill', icon: oilDrumIcon, text: 'He', color: '#2d7a4f' },
]

function buildTitleSegments(title: string): { segments: TitleSegment[]; portraitSegments: TitleSegment[] } {
  if (title.toLowerCase().includes('south korea')) {
    return { segments: LANDSCAPE_SEGMENTS, portraitSegments: PORTRAIT_SEGMENTS }
  }
  return { segments: [{ type: 'text', content: title }], portraitSegments: [{ type: 'text', content: title }] }
}

export default function Hero({ block }: { block: HeroBlock }) {
  const { segments, portraitSegments } = buildTitleSegments(block.title)

  return (
    <section className="min-h-screen flex flex-col justify-center px-8 py-12 max-w-[900px] mx-auto">
      <div
        className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.15em] mb-6"
        style={{ color: 'var(--color-accent)' }}
      >
        The Asymmetry Letter · Cost Analysis · March 2026
      </div>
      <div className="mb-5">
        <HeroTitle segments={segments} portraitSegments={portraitSegments} />
      </div>
      <p
        className="text-[1.1rem] leading-[1.65] mb-8"
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
