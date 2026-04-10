'use client'

import PretextBlock from './PretextBlock'

/** Strip basic markdown bold/italic markers for plain-text layout. */
function stripMarkdown(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1')
}

interface Props {
  heading?: string
  paragraphs: string[]
}

const BODY_FONT_SIZE = 16
const BODY_LINE_HEIGHT = 27
/** Card inner width: 390px base - 80px horizontal padding */
const TEXT_WIDTH = 310

export default function ShareTextCard({ heading, paragraphs }: Props) {
  return (
    <div className="flex flex-col justify-center h-full px-10 py-8">
      {heading && (
        <div
          className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.15em] mb-4"
          style={{ color: 'var(--color-accent)' }}
        >
          {heading}
        </div>
      )}
      {paragraphs.map((p, i) => (
        <div key={i} className={i < paragraphs.length - 1 ? 'mb-3' : ''}>
          <PretextBlock
            text={stripMarkdown(p)}
            fontSize={BODY_FONT_SIZE}
            lineHeight={BODY_LINE_HEIGHT}
            maxWidth={TEXT_WIDTH}
            color="var(--color-text)"
          />
        </div>
      ))}
    </div>
  )
}
